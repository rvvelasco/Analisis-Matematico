import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'

/** Completa el service worker con la lista de archivos compilados, para que toda la app funcione sin conexión. */
function offlinePrecache(): Plugin {
  return {
    name: 'mathverse-offline-precache',
    apply: 'build',
    closeBundle() {
      const dist = join(__dirname, 'dist')
      const sw = join(dist, 'sw.js')
      if (!existsSync(sw)) return
      const assets = readdirSync(join(dist, 'assets')).map((f) => `./assets/${f}`)
      const version = createHash('sha1').update(assets.join('|')).digest('hex').slice(0, 10)
      const head = `self.__MV_ASSETS__ = ${JSON.stringify(assets)};\nself.__MV_VERSION__ = '${version}';\n`
      writeFileSync(sw, head + readFileSync(sw, 'utf8'))
    },
  }
}

// base relativa: la app compilada funciona desde cualquier carpeta (incluida GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react(), offlinePrecache()],
  build: { outDir: 'dist', chunkSizeWarningLimit: 1600 },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
