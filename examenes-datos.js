/* =====================================================================
   examenes-datos.js · banco de preguntas del simulador
   Tipos de pregunta:
     mc(q, opciones, índiceCorrecto, explicación, gráfico?, epígrafe?)
     vf(q, true|false, explicación, gráfico?, epígrafe?)
     vfm(q, [[afirmación, true|false, explicación], ...], gráfico?, epígrafe?)  ← V/F de interpretación
     op(q, solución, explicación, gráfico?, epígrafe?)                           ← desarrollo
   Los gráficos se generan con graficos.js (objeto G).
   ===================================================================== */
function mc(q,o,c,e,g,cap){return {t:'mc',q:q,o:o,c:c,e:e,g:g,cap:cap};}
function vf(q,v,e,g,cap){return {t:'vf',q:q,o:['Verdadero','Falso'],c:v?0:1,e:e,g:g,cap:cap};}
function vfm(q,items,g,cap){return {t:'vfm',q:q,items:items,g:g,cap:cap};}
function op(q,s,e,g,cap){return {t:'op',q:q,s:s,e:e||'',g:g,cap:cap};}
var R_=G.C.red,N_=G.C.navy,T_=G.C.teal,O_=G.C.gold,P_=G.C.purple;

/* ---------- Gráficos reutilizados ---------- */
var FIG={
  rectas2: G.plot({x:[-2,6],y:[-3,7],fns:[{f:function(x){return 2*x-1;},label:'r₁',lx:4.1,c:R_},{f:function(x){return -x+5;},label:'r₂',lx:-1.3,c:N_}],pts:[{x:2,y:3,label:'P'}],label:'dos rectas que se cortan'}),
  triangulo3: G.plot({x:[-1,5],y:[-1,5],fns:[{f:function(x){return x;},label:'r₁: y = x',lx:3.6,ldx:-70,ldy:-10,c:R_},{f:function(x){return -x+4;},label:'r₂: x + y = 4',lx:3.3,ldy:14,c:N_},{f:function(){return 3;},label:'r₃: y = 3',lx:-.8,ldy:-8,c:T_}],pts:[{x:2,y:2},{x:3,y:3},{x:1,y:3}],label:'tres rectas'}),
  paralelas: G.plot({x:[-3,4],y:[-3,5],fns:[{f:function(x){return -0.5*x+1;},label:'r₁',lx:-2.6,c:R_},{f:function(x){return -0.5*x+3;},label:'r₂',lx:-2.6,c:N_}],label:'dos rectas paralelas'}),
  sumaVec: G.plot({x:[-1,5],y:[-1,4],vecs:[{to:[3,1],label:'u',c:R_,ldy:12},{to:[1,2],label:'v',c:N_,ldx:-16},{to:[4,3],label:'w',c:P_,dash:true,ldx:-18,ldy:-4},{from:[3,1],to:[4,3],c:'#9AA5AD',dash:true,wd:1.4},{from:[1,2],to:[4,3],c:'#9AA5AD',dash:true,wd:1.4}],label:'suma de vectores'}),
  proy: G.plot({x:[-1,5],y:[-1,4],vecs:[{to:[2,3],label:'u',c:R_,ldx:-16},{to:[4,0],label:'v',c:N_,ldy:16},{to:[2,0],label:'p',c:P_,wd:4,ldy:16,ldx:-14}],segs:[[2,3,2,0,'#7A8790',true,1.6]],label:'proyección'}),
  tresVec: G.plot({x:[-2,3],y:[-1,4],vecs:[{to:[2,1],label:'a',c:R_,ldy:12},{to:[-1,2],label:'b',c:N_,ldx:-18},{to:[1,3],label:'c',c:P_,ldx:-16}],label:'tres vectores'}),
  colineales: G.plot({x:[-5,3],y:[-3,2],vecs:[{to:[2,1],label:'u',c:R_},{to:[-4,-2],label:'v',c:N_,ldy:16}],label:'vectores colineales'}),
  base3: G.plot({x:[-1,5],y:[-1,4],vecs:[{to:[1,2],label:'u',c:R_,ldx:-16},{to:[3,1],label:'v',c:N_,ldy:14},{to:[4,3],label:'w',c:P_}],label:'tres vectores en el plano'}),
  estiramiento: G.plot({x:[-1,3],y:[-1,2],step:1,polys:[{pts:[[0,0],[1,0],[1,1],[0,1]],c:T_,op:.35,stroke:T_},{pts:[[0,0],[2,0],[2,1],[0,1]],c:R_,op:.15,stroke:R_}],texts:[{x:.35,y:.45,s:'Q',b:true,c:T_},{x:1.4,y:.45,s:'T(Q)',b:true,c:R_}],label:'cuadrado y su imagen'}),
  rotacion: G.plot({x:[-2,3],y:[-1,3],vecs:[{to:[2,1],label:'u',c:R_,ldy:14},{to:[-1,2],label:'T(u)',c:N_,ldx:-40}],label:'rotación'}),
  corte: G.plot({x:[-1,3],y:[-1,3],polys:[{pts:[[0,0],[2,0],[0,2]],c:T_,op:.35,stroke:T_},{pts:[[0,0],[2,0],[2,2]],c:R_,op:.15,stroke:R_}],pts:[{x:0,y:2,label:'(0,2)',c:T_,dx:-38},{x:2,y:2,label:'(2,2)',c:R_}],label:'triángulo y su imagen'}),
  parabola: G.plot({x:[-4,4],y:[-5,5],fns:[{f:function(x){return x*x-4;},label:'f',lx:2.6,c:R_}],pts:[{x:-2,y:0},{x:2,y:0},{x:0,y:-4,label:'(0,−4)'}],label:'parábola'}),
  parRecta: G.plot({x:[-3,6],y:[-3,10],step:1,tickStep:2,fns:[{f:function(x){return x*x-2*x;},label:'f',lx:-1.9,ldx:10,c:R_},{f:function(x){return x+4;},label:'g',lx:5.2,ldy:18,c:N_}],pts:[{x:-1,y:3,label:'A'},{x:4,y:8,label:'B',dx:-18}],label:'parábola y recta'}),
  cubica: G.plot({x:[-3,3],y:[-4,4],fns:[{f:function(x){return x*x*x-3*x;},label:'f',lx:2.3,c:R_},{f:function(){return 1;},c:'#9AA5AD',dash:true,wd:1.4}],pts:[{x:-1,y:2,label:'(−1, 2)',dx:-24,dy:-10},{x:1,y:-2,label:'(1, −2)',dy:16}],label:'cúbica'}),
  aTrozos: G.plot({x:[-3,4],y:[-1,7],fns:[{f:function(x){return x*x;},dom:[-2.6,1],c:R_},{f:function(x){return x+2;},dom:[1,4],c:R_}],pts:[{x:1,y:1,c:R_},{x:1,y:3,open:true,c:R_}],texts:[{x:-2.4,y:6.2,s:'f',b:true,c:R_,fs:15}],label:'función a trozos'}),
  equilibrio: G.plot({x:[0,40],y:[0,1800],step:10,ticks:false,grid:false,fns:[{f:function(x){return 500+20*x;},label:'C(x)',lx:33,ldy:-6,c:R_},{f:function(x){return 45*x;},label:'I(x)',lx:33,ldx:-36,ldy:-4,c:N_}],segs:[[20,0,20,900,'#9AA5AD',true],[0,900,20,900,'#9AA5AD',true]],pts:[{x:20,y:900,label:'E'}],texts:[{x:20,y:60,s:'20',a:'middle',c:'#51616B'},{x:1,y:960,s:'900',c:'#51616B'},{x:1,y:560,s:'500',c:'#51616B'},{x:38,y:60,s:'unidades',a:'end',c:'#51616B'}],xl:'x',yl:'$',label:'costo e ingreso'}),
  circ: G.plot({x:[-3,3],y:[-3,3],fns:[{f:function(x){return Math.sqrt(4-x*x);},dom:[-2,2],c:R_,n:600},{f:function(x){return -Math.sqrt(4-x*x);},dom:[-2,2],c:R_,n:600}],vlines:[{x:1,c:'#9AA5AD',dash:true,wd:1.4}],label:'circunferencia'})
};

/* ---------- Banco original (temas 1 a 10) ---------- */
const BASE=[
 {id:'t1',n:'01',titulo:'Lenguaje simbólico y noción de conjunto',pre:'Punto de partida',desc:'Símbolos (∈, /, ∀, ∃), qué es un conjunto, elemento, pertenencia y cardinal.',
  exams:{
   basico:[
    mc('¿Qué significa el símbolo <span class="mono">∈</span>?',['pertenece','está incluido','para todo','existe'],0,'∈ relaciona un elemento con un conjunto: "pertenece".'),
    mc('El cardinal de A = {2, 4, 6, 8} es:',['2','4','8','16'],1,'El cardinal (#A) es la cantidad de elementos: 4.'),
    mc('¿Cuál NO es un conjunto bien definido?',['los números pares','los días de la semana','los mejores jugadores','las vocales'],2,'"Los mejores" no tiene un criterio claro para decidir quién entra.'),
    mc('El cardinal de las letras de la palabra "banana" es:',['6','3','2','5'],1,'Letras distintas: b, a, n → 3 (no se repiten).')
   ],
   normal:[
    mc('¿Verdadero o falso? &nbsp; <span class="mono">3 ∈ {1, 3, 5}</span>',['Verdadero','Falso'],0,'El 3 está en el conjunto, así que pertenece.'),
    mc('En <span class="mono">{x / x es par}</span>, la barra <span class="mono">/</span> se lee:',['tal que','para todo','pertenece','existe'],0,'La barra significa "tal que".'),
    mc('¿Cuál es el cardinal de <span class="mono">{x / x ∈ ℕ, x &lt; 5}</span>?',['4','5','6','infinito'],1,'{0,1,2,3,4} → 5 elementos (el 0 es natural).'),
    mc('¿Cuál afirmación es correcta?',['∀ significa "existe"','∃ significa "para todo"','∅ tiene cardinal 0','{0} es el conjunto vacío'],2,'El vacío no tiene elementos: #∅ = 0. Ojo: {0} es unitario.')
   ],
   examen:[
    op('Escribí en lenguaje simbólico: "existe un número natural x tal que x es mayor que 100".','∃ x ∈ ℕ / x &gt; 100','∃ = existe, / = tal que.'),
    op('Dado A = {a, e, i, o, u}: indicá #A y decidí si es verdadero <span class="mono">e ∈ A</span> y <span class="mono">{e} ∈ A</span>.','#A = 5 · e ∈ A: Verdadero · {e} ∈ A: Falso','{e} es un subconjunto (⊂), no un elemento de A. Por eso {e} ∈ A es falso.'),
    op('¿"Los números grandes" es un conjunto? Justificá.','No: no está bien definido, no hay criterio para decidir si un número es "grande".',''),
    op('¿Cuál es el cardinal del conjunto de letras de la palabra "matemática"?','{m, a, t, e, i, c} → #A = 6','Se cuentan las letras distintas, sin repetir.')
   ]
  }},

 {id:'t2',n:'02',titulo:'Extensión y comprensión',pre:'Necesitás: <b>qué es un conjunto</b>',desc:'Pasar de la propiedad a la lista de elementos y al revés.',
  exams:{
   basico:[
    mc('Definir un conjunto "por extensión" es:',['listar sus elementos','dar la propiedad','dibujarlo','contarlo'],0,'Por extensión se escriben todos los elementos entre llaves.'),
    mc('<span class="mono">{x / x es vocal}</span> por extensión es:',['{a, e, i, o, u}','{a, b, c}','{vocales}','{1, 2, 3}'],0,'Las vocales listadas.'),
    mc('<span class="mono">{x / x ∈ ℕ, x &lt; 4}</span> por extensión es:',['{1, 2, 3}','{0, 1, 2, 3}','{0, 1, 2, 3, 4}','{1, 2, 3, 4}'],1,'Con 0 natural y x menor que 4: {0,1,2,3}.'),
    mc('<span class="mono">{x / x es día de la semana}</span> está definido por:',['comprensión','extensión'],0,'Se da la propiedad, no la lista → comprensión.')
   ],
   normal:[
    mc('<span class="mono">{x / x ∈ ℕ, 2 &lt; x ≤ 6}</span> por extensión:',['{3, 4, 5, 6}','{2, 3, 4, 5, 6}','{3, 4, 5}','{2, 3, 4, 5}'],0,'&gt; 2 deja afuera el 2; ≤ 6 incluye el 6.'),
    mc('El conjunto {lunes, ..., domingo} por comprensión es:',['{x / x es día de la semana}','{x / x es mes}','{x / x es vocal}','{x / x ∈ ℕ}'],0,'La propiedad común es "ser día de la semana".'),
    mc('<span class="mono">{x / x ∈ ℕ, 5 ≤ x &lt; 9}</span> por extensión:',['{5, 6, 7, 8}','{5, 6, 7, 8, 9}','{6, 7, 8}','{5, 6, 7}'],0,'≥ 5 incluye el 5; &lt; 9 deja afuera el 9.'),
    mc('{1, 4, 9, 16, 25} por comprensión es:',['{x / x es cuadrado perfecto, 0 &lt; x &lt; 30}','{x / x es par}','{x / x es primo}','{x / x ∈ ℕ}'],0,'1,4,9,16,25 son 1², 2², 3², 4², 5².')
   ],
   examen:[
    op('Pasá a extensión: A = {x / x ∈ ℕ, 4 &lt; x ≤ 10}.','A = {5, 6, 7, 8, 9, 10}','&gt; 4 deja afuera el 4; ≤ 10 incluye el 10.'),
    op('Pasá a comprensión: {3, 6, 9, 12, 15, 18}.','{x / x ∈ ℕ, x múltiplo de 3, 0 &lt; x &lt; 19}','Todos son múltiplos de 3 entre 3 y 18.'),
    op('Pasá a extensión: {x / x es letra de la palabra "otoño"}.','{o, t, ñ}','o, t, o, ñ, o → sin repetir queda {o, t, ñ}.'),
    op('Pasá a extensión: B = {x / x ∈ ℕ, x par, x &lt; 10}.','B = {0, 2, 4, 6, 8}','Pares menores que 10. El 0 es par y natural.')
   ]
  }},

 {id:'t3',n:'03',titulo:'Tipos de conjuntos · pertenencia e inclusión',pre:'Necesitás: <b>cardinal</b> y la idea de <b>subconjunto</b>',desc:'Vacío, unitario, finito, infinito, y la diferencia entre ∈ (elemento) y ⊂ (conjunto).',
  exams:{
   basico:[
    mc('Un conjunto con un solo elemento se llama:',['unitario','vacío','universal','infinito'],0,'Un elemento → unitario.'),
    mc('El símbolo <span class="mono">∅</span> representa el conjunto:',['vacío','unitario','universal','infinito'],0,'∅ = conjunto vacío (sin elementos).'),
    mc('ℕ (los naturales) es un conjunto:',['finito','infinito','vacío','unitario'],1,'No termina nunca → infinito.'),
    mc('Completá: <span class="mono">{2, 4} ___ {2, 4, 6}</span>',['⊂','∈','∉','='],0,'Los dos son conjuntos y todos los elementos de {2,4} están → ⊂.')
   ],
   normal:[
    mc('Completá: <span class="mono">5 ___ {1, 3, 5}</span>',['∈','⊂','∉','⊄'],0,'5 es un elemento suelto y está en el conjunto → ∈.'),
    mc('{1, 2} respecto de {1, 2}, ¿cómo son?',['iguales','disjuntos','uno pertenece al otro','no relacionados'],0,'Tienen los mismos elementos → iguales.'),
    mc('¿Cuál de estos es unitario?',['{x / x es capital de Argentina}','{x / x ∈ ℕ, x &lt; 3}','{x / x es vocal}','∅'],0,'Una sola capital → un elemento → unitario.'),
    mc('{1, 2} y {3, 4} son conjuntos:',['disjuntos','iguales','uno subconjunto del otro','unitarios'],0,'No comparten ningún elemento → disjuntos.')
   ],
   examen:[
    op('A = {0, 1, 2, 3}, B = {1, 3}. Completá con ∈, ∉, ⊂ o ⊄: &nbsp; B__A · 2__A · 5__A · {0}__A','B ⊂ A · 2 ∈ A · 5 ∉ A · {0} ⊂ A','Conjuntos (B, {0}) → ⊂/⊄. Elementos sueltos (2, 5) → ∈/∉.'),
    op('Clasificá: <span class="mono">{x / x ∈ ℕ, 3 &lt; x &lt; 4}</span>.','Vacío (∅)','No existe ningún natural entre 3 y 4.'),
    op('Clasificá: {x / x es punto de intersección de dos rectas paralelas no coincidentes}.','Vacío (∅)','Las rectas paralelas no se cortan nunca.'),
    op('Si A = {a, b, c}, ¿cuántos subconjuntos tiene (cardinal de P(A))?','#P(A) = 2³ = 8','La fórmula del conjunto de partes es 2 elevado a la cantidad de elementos.')
   ]
  }},

 {id:'t4',n:'04',titulo:'Operaciones entre conjuntos',pre:'Necesitás: <b>tipos, pertenencia e inclusión</b>',desc:'Unión, intersección, diferencia y complemento.',
  exams:{
   basico:[
    mc('Con A = {1, 2, 3} y B = {3, 4}: &nbsp; A ∪ B =',['{1, 2, 3, 4}','{3}','{1, 2, 4}','{1, 2, 3}'],0,'La unión junta todo sin repetir.'),
    mc('Con A = {1, 2, 3} y B = {3, 4}: &nbsp; A ∩ B =',['{3}','{1, 2, 3, 4}','∅','{1, 2}'],0,'La intersección son los elementos comunes: solo el 3.'),
    mc('Con A = {1, 2, 3} y B = {3, 4}: &nbsp; A − B =',['{1, 2}','{4}','{3}','{1, 2, 3}'],0,'A − B: lo de A que no está en B.'),
    mc('Si <span class="mono">A ∩ B = ∅</span>, los conjuntos son:',['disjuntos','iguales','uno incluido en el otro','unitarios'],0,'Sin elementos comunes → disjuntos.')
   ],
   normal:[
    mc('A = {1, 2, 3, 4}, B = {3, 4, 5, 6}. &nbsp; A ∪ B =',['{1, 2, 3, 4, 5, 6}','{3, 4}','{1, 2, 5, 6}','{1, 2, 3, 4}'],0,'Todos los elementos de ambos, sin repetir.'),
    mc('A = {1, 2, 3, 4}, B = {3, 4, 5, 6}. &nbsp; A ∩ B =',['{3, 4}','{1, 2}','{5, 6}','∅'],0,'Comunes: 3 y 4.'),
    mc('A = {1, 2, 3, 4}, B = {3, 4, 5, 6}. &nbsp; B − A =',['{5, 6}','{1, 2}','{3, 4}','{1, 2, 3, 4}'],0,'Lo de B que no está en A.'),
    mc('𝒰 = {1,2,3,4,5,6}, A = {1, 2, 3, 4}. &nbsp; El complemento Ā =',['{5, 6}','{1, 2}','∅','{1,2,3,4}'],0,'Ā = 𝒰 − A: lo del universal que no está en A.')
   ],
   examen:[
    op('A = {1, 2, 3, 4, 5}, B = {2, 4, 6}, 𝒰 = {1, 2, ..., 7}. Hallá A ∪ B, A ∩ B, A − B y el complemento de B.','A ∪ B = {1,2,3,4,5,6} · A ∩ B = {2,4} · A − B = {1,3,5} · B̄ = {1,3,5,7}','B̄ = 𝒰 − B = {1,3,5,7}.'),
    op('Con A = {a, b, c, d} y B = {c, d, e}: hallá A − B y B − A.','A − B = {a, b} · B − A = {e}','Notá que A − B ≠ B − A.'),
    op('¿Qué operación da "los elementos que están en A o en B (o en ambos)"?','La unión: A ∪ B',''),
    op('Si A ⊂ B, ¿cuánto vale A ∩ B? ¿Y A ∪ B?','A ∩ B = A · A ∪ B = B','Si A está incluido en B, la intersección es el más chico y la unión el más grande.')
   ]
  }},

 {id:'t5',n:'05',titulo:'Conjuntos numéricos e intervalos',pre:'Necesitás: <b>inclusión</b> y desigualdades',desc:'ℕ, ℤ, ℚ, 𝕀, ℝ, imaginarios, y los intervalos de la recta real.',
  exams:{
   basico:[
    mc('El número √2 es:',['irracional','racional','entero','natural'],0,'√2 tiene infinitos decimales no periódicos → irracional.'),
    mc('El número −5 pertenece a:',['ℤ (y no a ℕ)','ℕ','a ninguno','solo a 𝕀'],0,'Es entero negativo: está en ℤ pero no en ℕ.'),
    mc('¿Cuál es la cadena de inclusiones correcta?',['ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ','ℝ ⊂ ℚ ⊂ ℤ ⊂ ℕ','ℤ ⊂ ℕ ⊂ ℚ ⊂ ℝ','ℚ ⊂ ℕ ⊂ ℤ ⊂ ℝ'],0,'Cada conjunto contiene al anterior.'),
    mc('El intervalo [2, 5] incluye…',['al 2 y al 5','a ninguno de los dos','solo al 2','solo al 5'],0,'Corchete = extremo incluido.')
   ],
   normal:[
    mc('El decimal periódico 0,333… es:',['racional','irracional','entero','imaginario'],0,'0,333… = 1/3, es una fracción → racional.'),
    mc('El número π es:',['irracional','racional','entero','natural'],0,'Decimales infinitos no periódicos → irracional.'),
    mc('El intervalo (1, 4) significa:',['1 &lt; x &lt; 4','1 ≤ x ≤ 4','x &gt; 1','x &lt; 4'],0,'Paréntesis = extremos NO incluidos.'),
    mc('¿Cuál de estos NO es un número real?',['√−1','√2','−3','0,5'],0,'√−1 = i es imaginario, no real.')
   ],
   examen:[
    op('Clasificá cada uno como ℕ, ℤ, ℚ, 𝕀 o ℝ (el más ajustado): &nbsp; −7 · 3/4 · √9 · √3 · 0','−7 ∈ ℤ · 3/4 ∈ ℚ · √9 = 3 ∈ ℕ · √3 ∈ 𝕀 · 0 ∈ ℕ','√9 vale 3 (natural). √3 no da exacto → irracional.'),
    op('Escribí como intervalo: {x ∈ ℝ / −2 ≤ x &lt; 3}.','[−2, 3)','≤ → corchete; &lt; → paréntesis.'),
    op('Escribí con desigualdad el intervalo (0, +∞).','x &gt; 0','Todos los reales mayores que 0.'),
    op('¿Verdadero o falso? "Todo número entero es racional." Justificá.','Verdadero: todo entero n se escribe como n/1, que es una fracción.','')
   ]
  }},

 {id:'t6',n:'06',titulo:'Producto cartesiano',pre:'Necesitás: <b>conjuntos</b> y pares',desc:'Par ordenado, A × B, cardinal (#A · #B) y por qué no es conmutativo.',
  exams:{
   basico:[
    mc('Los pares (2 ; 5) y (5 ; 2) son:',['distintos','iguales'],0,'El orden importa en un par ordenado.'),
    mc('Si #A = 2 y #B = 3, entonces #(A × B) =',['5','6','8','9'],1,'#(A×B) = #A · #B = 2·3 = 6.'),
    mc('En el par (a ; b), <span class="mono">a</span> es la:',['primera componente','segunda componente','tercera componente','ninguna'],0,'a es la primera, b la segunda.'),
    mc('A × B es:',['un conjunto de pares ordenados','una suma','un número','una recta'],0,'Es el conjunto de todos los pares ordenados posibles.')
   ],
   normal:[
    mc('A = {1, 2}, B = {3, 4}. &nbsp; A × B =',['{(1;3),(1;4),(2;3),(2;4)}','{(3;1),(4;1),(3;2),(4;2)}','{1,2,3,4}','{(1;2),(3;4)}'],0,'Cada elemento de A con cada uno de B.'),
    mc('¿Es cierto que A × B = B × A siempre?',['No, en general no','Sí, siempre'],0,'El producto cartesiano no es conmutativo.'),
    mc('Si #A = 3, ¿cuánto vale #(A × A)?',['6','9','3','12'],1,'3 · 3 = 9.'),
    mc('B = {3, 4}, A = {1, 2}. ¿Cuál es un par de B × A?',['(3 ; 1)','(1 ; 3)','(3 ; 3)','(1 ; 1)'],0,'En B × A la primera componente sale de B.')
   ],
   examen:[
    op('A = {0, 2}, B = {1, 3, 5}. Hallá A × B por extensión.','{(0;1),(0;3),(0;5),(2;1),(2;3),(2;5)}','Son #A · #B = 2·3 = 6 pares.'),
    op('C = {x ∈ ℕ impar, 0 &lt; x &lt; 5} y D = {x ∈ ℕ par, 0 &lt; x &lt; 5}. Hallá C × D.','C = {1,3}, D = {2,4} → C × D = {(1;2),(1;4),(3;2),(3;4)}','Primero pasá C y D a extensión.'),
    op('¿Cuántos pares tiene A × B si A tiene 4 elementos y B tiene 5?','#(A × B) = 4 · 5 = 20',''),
    op('Si A × B tiene 12 pares y #A = 3, ¿cuánto vale #B?','#B = 12 / 3 = 4','Porque 12 = #A · #B = 3 · #B.')
   ]
  }},

 {id:'t7',n:'07',titulo:'Matrices: definición, tipos y operaciones',pre:'Necesitás: <b>números</b> y orden de filas/columnas',desc:'Dimensión, tipos, suma, resta, opuesta, escalar, producto y traspuesta.',
  exams:{
   basico:[
    mc('Una matriz de dimensión 3 × 2 tiene:',['3 filas y 2 columnas','2 filas y 3 columnas','3 elementos','6 filas'],0,'Se lee "3 por 2": filas por columnas.'),
    mc('La matriz identidad tiene en su diagonal principal:',['unos','ceros','la fila','números al azar'],0,'Unos en la diagonal y ceros en el resto.'),
    mc('Para sumar dos matrices, deben tener:',['la misma dimensión','ser cuadradas','ser inversas','determinante igual'],0,'La suma es elemento a elemento, exige igual dimensión.'),
    mc('La opuesta de la matriz [1 &nbsp; −2] es:',['[−1 &nbsp; 2]','[1 &nbsp; 2]','[2 &nbsp; −1]','[−1 &nbsp; −2]'],0,'Se cambia el signo de cada elemento.')
   ],
   normal:[
    mc('[1 2 ; 3 4] + [5 6 ; 7 8] =',['[6 8 ; 10 12]','[5 12 ; 21 32]','[6 8 ; 10 11]','[5 6 ; 7 8]'],0,'Se suma casillero por casillero.'),
    mc('2 · [1 0 ; −1 3] =',['[2 0 ; −2 6]','[2 0 ; −1 3]','[1 0 ; −2 6]','[3 2 ; 1 5]'],0,'Cada elemento por 2.'),
    mc('Para poder calcular A · B con A de 2 × 3, la matriz B debe tener:',['3 filas','2 filas','3 columnas','2 columnas'],0,'Las columnas de A (3) deben igualar las filas de B.'),
    mc('La traspuesta de [1 &nbsp; 2 &nbsp; 3] (que es 1 × 3) es:',['una columna 3 × 1','una fila 1 × 3','una matriz 2 × 2','[3 2 1]'],0,'Al trasponer, la fila se vuelve columna.')
   ],
   examen:[
    op('A = [1 2 ; 3 4], B = [0 1 ; 1 0]. Hallá A + B y A − B.','A + B = [1 3 ; 4 4] · A − B = [1 1 ; 2 4]','Elemento a elemento.'),
    op('Con A = [1 2 ; 3 4] y B = [0 1 ; 1 0], hallá A · B.','A · B = [2 1 ; 4 3]','Fila×columna: (1,1)=1·0+2·1=2; (1,2)=1·1+2·0=1; (2,1)=3·0+4·1=4; (2,2)=3·1+4·0=3.'),
    op('Hallá la traspuesta de [1 2 3 ; 4 5 6].','[1 4 ; 2 5 ; 3 6]','Las filas pasan a columnas: la 2×3 queda 3×2.'),
    op('Hallá el producto [1 2 3] · [1 ; 0 ; −1] (una 1×3 por una 3×1).','[−2] (una matriz 1×1)','1·1 + 2·0 + 3·(−1) = 1 + 0 − 3 = −2. El resultado es la matriz 1×1 [−2].')
   ]
  }},

 {id:'t8',n:'08',titulo:'Determinantes',pre:'Necesitás: <b>matrices cuadradas</b>',desc:'Determinante de orden 1, 2 y 3 (Sarrus), y sus propiedades básicas.',
  exams:{
   basico:[
    mc('El determinante existe solo para matrices:',['cuadradas','rectangulares','de una fila','de una columna'],0,'Solo las cuadradas (m = n) tienen determinante.'),
    mc('El determinante de [a b ; c d] es:',['ad − bc','ab − cd','ad + bc','ac − bd'],0,'Producto de la diagonal principal menos el de la otra.'),
    mc('det[2 0 ; 0 3] =',['6','5','0','9'],0,'2·3 − 0·0 = 6.'),
    mc('Si det(A) = 0, entonces la matriz A:',['no tiene inversa','tiene inversa','es la identidad','es rectangular'],0,'Determinante 0 → singular → sin inversa.')
   ],
   normal:[
    mc('det[3 1 ; 2 4] =',['10','14','11','−10'],0,'3·4 − 1·2 = 12 − 2 = 10.'),
    mc('det[5 −2 ; 1 3] =',['17','13','−17','15'],0,'5·3 − (−2)·1 = 15 + 2 = 17.'),
    mc('El determinante de la triangular [2 5 ; 0 3] es:',['6','16','10','15'],0,'En una triangular es el producto de la diagonal: 2·3 = 6.'),
    mc('Si una matriz tiene dos filas iguales, su determinante es:',['0','1','no se puede calcular','negativo'],0,'Dos filas iguales → det = 0.')
   ],
   examen:[
    op('Calculá det[4 −1 ; 2 3].','12 − (−2) = 12 + 2 = 14','4·3 − (−1)·2. Cuidado con el signo del −1.'),
    op('Calculá por Sarrus det[1 2 3 ; 0 1 4 ; 5 6 0].','= (0 + 40 + 0) − (15 + 24 + 0) = 40 − 39 = 1','Diagonales ↘ menos diagonales ↙.'),
    op('Calculá det[2 0 0 ; 0 5 0 ; 0 0 3] (diagonal).','2 · 5 · 3 = 30','En una diagonal, el determinante es el producto de la diagonal.'),
    op('¿Para qué valor de k es det[k 2 ; 3 4] = 0?','4k − 6 = 0 → k = 3/2','Se plantea el determinante igualado a 0 y se despeja k.')
   ]
  }},

 {id:'t9',n:'09',titulo:'Operaciones de fila y forma escalonada',pre:'Necesitás: <b>matrices</b>',desc:'Las 3 operaciones elementales de fila y la forma escalonada reducida.',
  exams:{
   basico:[
    mc('¿Cuál NO es una operación elemental de fila?',['multiplicar una fila por 0','intercambiar dos filas','sumar un múltiplo de una fila a otra','multiplicar una fila por 2'],0,'Multiplicar por una constante SÍ, pero debe ser distinta de 0.'),
    mc('<span class="mono">R₁ ↔ R₂</span> significa:',['intercambiar las filas 1 y 2','sumar la fila 1 a la 2','multiplicar la fila 1 por 2','borrar la fila 2'],0,'La flecha doble indica intercambio.'),
    mc('En la forma escalonada, las filas de solo ceros van:',['abajo','arriba','al medio','no importa'],0,'Los renglones nulos quedan en la parte inferior.'),
    mc('El primer número distinto de cero de cada fila (pivote) debe ser:',['1','0','cualquier número','negativo'],0,'En la forma reducida el pivote es un 1 (1 delantero).')
   ],
   normal:[
    mc('El símbolo <span class="mono">∼</span> entre dos matrices significa que son:',['equivalentes por filas','iguales','opuestas','inversas'],0,'Una se obtiene de la otra con operaciones de fila.'),
    mc('¿Cuál está en forma escalonada reducida?',['[1 0 ; 0 1]','[0 1 ; 1 0]','[1 2 ; 3 4]','[2 0 ; 0 2]'],0,'Pivotes 1 en escalera y ceros en sus columnas.'),
    mc('<span class="mono">R₂ − 2R₁</span> quiere decir:',['a la fila 2 le resto 2 veces la fila 1','a la fila 1 le sumo la 2','multiplico la fila 2 por −2','intercambio las filas'],0,'Se combina la fila 2 con un múltiplo de la 1.'),
    mc('Si al reducir aparece una fila entera de ceros, la matriz…',['no es equivalente a la identidad (sin inversa)','es la identidad','no tiene determinante','es simétrica'],0,'Fila de ceros → no se llega a la identidad → no hay inversa.')
   ],
   examen:[
    op('Aplicá <span class="mono">R₂ − 2R₁</span> a la matriz [1 3 ; 2 5].','[1 3 ; 0 −1]','Fila 2 nueva = (2, 5) − 2·(1, 3) = (0, −1).'),
    op('¿La matriz [1 0 2 ; 0 1 5 ; 0 0 0] está en forma escalonada reducida? Justificá.','Sí','La fila de ceros está abajo, los pivotes son 1 en escalera y sus columnas tienen ceros en el resto.'),
    op('Llevá [1 2 ; 3 4] a forma escalonada (hacé cero el 3).','R₂ − 3R₁ → [1 2 ; 0 −2]','Fila 2 = (3, 4) − 3·(1, 2) = (0, −2).'),
    op('¿Cuáles son las 3 operaciones elementales de fila?','1) Intercambiar dos filas. 2) Multiplicar una fila por un número ≠ 0. 3) Sumar a una fila un múltiplo de otra.','')
   ]
  }},

 {id:'t10',n:'10',titulo:'Inversa, ecuaciones matriciales y Cramer',pre:'Necesitás: <b>matrices, determinantes y operaciones de fila</b>',desc:'Matriz inversa (atajo 2×2 y Gauss-Jordan), A·X = B y la regla de Cramer.',
  exams:{
   basico:[
    mc('El producto <span class="mono">A · A⁻¹</span> da:',['I (la identidad)','0','A','A²'],0,'La inversa "deshace" a la matriz y da la identidad.'),
    mc('Una matriz cuadrada A tiene inversa si:',['det(A) ≠ 0','det(A) = 0','es rectangular','tiene una fila de ceros'],0,'Determinante distinto de 0 → invertible.'),
    mc('En <span class="mono">A · X = B</span>, se despeja X como:',['A⁻¹ · B','B · A','B − A','A · B'],0,'Se multiplica por la inversa a la izquierda: X = A⁻¹B.'),
    mc('La regla de Cramer sirve para:',['resolver sistemas de ecuaciones','sumar matrices','trasponer','graficar'],0,'Resuelve sistemas n×n con determinante ≠ 0.')
   ],
   normal:[
    mc('La inversa de [3 1 ; 2 4] (det = 10) es:',['(1/10)·[4 −1 ; −2 3]','[4 −1 ; −2 3]','(1/10)·[3 1 ; 2 4]','[4 1 ; 2 3]'],0,'Atajo 2×2: intercambio a↔d, cambio signo a b y c, divido por det.'),
    mc('Para [a b ; c d], la inversa se multiplica por el factor:',['1/(ad − bc)','ad − bc','1/(ab)','ad + bc'],0,'Es 1 sobre el determinante.'),
    mc('En Cramer, x = det(Aₓ)/det(A). Si det(A) = 5 y det(Aₓ) = 10, entonces x =',['2','0,5','50','−2'],0,'10 / 5 = 2.'),
    mc('El método de Gauss-Jordan para la inversa parte de la matriz:',['[A | I]','[A | B]','[I | I]','[A | 0]'],0,'Se aumenta A con la identidad y se reduce.')
   ],
   examen:[
    op('Hallá la inversa de [2 1 ; 5 3].','det = 6 − 5 = 1 → A⁻¹ = [3 −1 ; −5 2]','Como det = 1, la inversa es directamente [d −b ; −c a].'),
    op('Resolvé por Cramer: &nbsp; 2x + y = 5 &nbsp; ; &nbsp; x − y = 1.','x = 2, y = 1','det(A) = −3. det(Aₓ) = |5 1 ; 1 −1| = −6 → x = 2. det(A_y) = |2 5 ; 1 1| = −3 → y = 1.'),
    op('Resolvé A·X = B con A = [1 2 ; 3 4] (det = −2) y B = [5 ; 6].','x = −4, y = 4,5','A⁻¹ = (1/−2)[4 −2 ; −3 1]. X = A⁻¹B → x = −4, y = 4,5. Verificás: 1·(−4)+2·4,5 = 5 ✓.'),
    op('¿En qué caso NO se puede usar la regla de Cramer?','Cuando det(A) = 0 (no hay solución única).','')
   ]
  }}
];
var FINAL_OLD={
  basico:[
   mc('El cardinal de {a, e, i, o, u} es:',['5','4','6','10'],0,'Cinco vocales.'),
   mc('<span class="mono">{x / x ∈ ℕ, x &lt; 3}</span> por extensión es:',['{0, 1, 2}','{1, 2}','{0, 1, 2, 3}','{1, 2, 3}'],0,'Con 0 natural: {0, 1, 2}.'),
   mc('El número √2 es:',['irracional','racional','entero','natural'],0,'Decimales infinitos no periódicos.'),
   mc('Si #A = 2 y #B = 4, entonces #(A × B) =',['8','6','2','4'],0,'2 · 4 = 8.'),
   mc('det[1 0 ; 0 5] =',['5','0','1','6'],0,'1·5 − 0·0 = 5.'),
   mc('El producto A · A⁻¹ da:',['la identidad I','0','A','B'],0,'La inversa da la identidad.')
  ],
  normal:[
   mc('A = {1, 2, 3}, B = {2, 3, 4}. &nbsp; A ∩ B =',['{2, 3}','{1, 4}','{1, 2, 3, 4}','∅'],0,'Comunes: 2 y 3.'),
   mc('¿Cuál es la cadena de inclusiones correcta?',['ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ','ℝ ⊂ ℚ ⊂ ℤ ⊂ ℕ','ℚ ⊂ ℤ ⊂ ℕ ⊂ ℝ','ℤ ⊂ ℕ ⊂ ℝ ⊂ ℚ'],0,'Cada uno contiene al anterior.'),
   mc('El intervalo abierto (1, 5) significa:',['1 &lt; x &lt; 5','1 ≤ x ≤ 5','x &gt; 5','x &lt; 1'],0,'Paréntesis = extremos excluidos.'),
   mc('A = {1, 2}, B = {3, 4}. &nbsp; A × B =',['{(1;3),(1;4),(2;3),(2;4)}','{(3;1),(4;2)}','{1,2,3,4}','{(1;2),(3;4)}'],0,'Cada uno de A con cada uno de B.'),
   mc('[1 2 ; 3 4] + [1 1 ; 1 1] =',['[2 3 ; 4 5]','[1 2 ; 3 4]','[2 2 ; 4 4]','[1 3 ; 4 5]'],0,'Elemento a elemento.'),
   mc('det[3 2 ; 1 4] =',['10','14','11','−10'],0,'3·4 − 2·1 = 12 − 2 = 10.')
  ],
  examen:[
   op('A = {0, 1, 2, 3, 4}, B = {2, 4, 6}, 𝒰 = {0, 1, ..., 7}. Hallá A ∪ B, A ∩ B, A − B y el complemento de B.','A ∪ B = {0,1,2,3,4,6} · A ∩ B = {2,4} · A − B = {0,1,3} · B̄ = {0,1,3,5,7}','B̄ = 𝒰 − B.'),
   op('Clasificá en el conjunto numérico más ajustado: &nbsp; −3 · 2/5 · √16 · √2.','−3 ∈ ℤ · 2/5 ∈ ℚ · √16 = 4 ∈ ℕ · √2 ∈ 𝕀','√16 = 4 es natural; √2 es irracional.'),
   op('C = {1, 2}, D = {3, 4, 5}. Hallá C × D y su cardinal.','C × D = {(1;3),(1;4),(1;5),(2;3),(2;4),(2;5)} · #(C × D) = 6','#(C×D) = 2 · 3 = 6.'),
   op('A = [1 2 ; 3 4], B = [2 0 ; 1 1]. Hallá A · B.','A · B = [4 2 ; 10 4]','(1,1)=1·2+2·1=4; (1,2)=1·0+2·1=2; (2,1)=3·2+4·1=10; (2,2)=3·0+4·1=4.'),
   op('Calculá por Sarrus det[2 1 0 ; 1 3 1 ; 0 1 2].','= (12 + 0 + 0) − (0 + 2 + 2) = 8','↘: 2·3·2, 1·1·0, 0·1·1. ↙: 0·3·0, 2·1·1, 1·1·2.'),
   op('Resolvé por Cramer: &nbsp; x + y = 3 &nbsp; ; &nbsp; 2x − y = 0.','x = 1, y = 2','det(A) = −3. det(Aₓ) = |3 1 ; 0 −1| = −3 → x = 1. det(A_y) = |1 3 ; 2 0| = −6 → y = 2. Verificás: 1+2 = 3 ✓.')
  ]
 };

/* =====================================================================
   AMPLIACIÓN DE LOS TEMAS EXISTENTES (examen más difícil + nivel parcial)
   ===================================================================== */
var EXTRA={
 t1:{
  examen:[
   op('Negá la proposición <span class="mono">∀x ∈ ℝ : x² ≥ 0</span> y decí cuál de las dos es verdadera.','Negación: ∃x ∈ ℝ / x² &lt; 0. La original es verdadera; la negación es falsa.','Al negar, ∀ se convierte en ∃ y la propiedad se niega (≥ pasa a &lt;).')
  ],
  parcial:[
   vfm('Tomando como universo los conjuntos indicados, decidí si cada afirmación es verdadera o falsa.',[
    ['<span class="mono">∀x ∈ ℕ : x ≥ 0</span>',true,'Con el 0 natural, todos los naturales son ≥ 0.'],
    ['<span class="mono">∃x ∈ ℕ / x + 3 = 1</span>',false,'Tendría que ser x = −2, que no es natural.'],
    ['<span class="mono">∀x ∈ ℤ ∃y ∈ ℤ / x + y = 0</span>',true,'Para cada x alcanza con tomar y = −x (el opuesto).'],
    ['<span class="mono">∃y ∈ ℤ / ∀x ∈ ℤ : x + y = 0</span>',false,'Un único y no puede ser el opuesto de todos los x a la vez. El orden de los cuantificadores cambia el significado.'],
    ['<span class="mono">∃x ∈ ℝ / x² = 2 ∧ x ∈ ℚ</span>',false,'Las soluciones son ±√2, que son irracionales.']
   ]),
   op('Escribí en lenguaje simbólico: "todo número natural par mayor que 2 es la suma de dos números primos".','∀x ∈ ℕ : (x = 2̇ ∧ x &gt; 2) ⇒ ∃p, q primos / x = p + q','Es la conjetura de Goldbach. Fijate que la condición va con ⇒ y los primos con ∃.'),
   mc('¿Cuál es el cardinal de <span class="mono">{x ∈ ℤ / x² &lt; 10}</span>?',['7','6','4','3'],0,'x² &lt; 10 ⇒ x ∈ {−3, −2, −1, 0, 1, 2, 3}: 7 elementos.'),
   op('Negá: "Existe un alumno que aprobó todos los parciales".','"Todos los alumnos desaprobaron al menos un parcial". En símbolos: ∀a ∃p / a no aprobó p.','¬(∃a ∀p : P(a,p)) ≡ ∀a ∃p : ¬P(a,p).'),
   mc('La proposición <span class="mono">∀x ∈ ℝ : x² &gt; x</span> es:',['Falsa, porque x = 1/2 es contraejemplo','Verdadera','Falsa, porque x = 2 es contraejemplo','No es una proposición'],0,'(1/2)² = 1/4 &lt; 1/2. Para refutar un "para todo" alcanza un solo contraejemplo; x = 2 cumple 4 &gt; 2, no sirve.')
  ]
 },
 t2:{
  examen:[
   op('Pasá a extensión: <span class="mono">A = {2x + 1 / x ∈ ℕ ∧ x &lt; 4}</span>.','A = {1, 3, 5, 7}','x toma 0, 1, 2, 3 y se reemplaza en 2x + 1.')
  ],
  parcial:[
   op('Pasá a extensión: <span class="mono">A = {x ∈ ℤ / −2 ≤ x &lt; 3 ∧ x² &gt; 1}</span>.','A = {−2, 2}','Los candidatos son −2, −1, 0, 1, 2. Solo −2 y 2 tienen cuadrado mayor que 1.'),
   op('Definí por comprensión: <span class="mono">B = {1, 4, 9, 16, 25}</span>.','B = {x / x = n², n ∈ ℕ ∧ 1 ≤ n ≤ 5}','Son los cuadrados perfectos de 1 a 5.'),
   op('Pasá a extensión: <span class="mono">C = {x ∈ ℕ / x es divisor de 12}</span>.','C = {1, 2, 3, 4, 6, 12}','Probás cuáles dividen a 12 sin resto.'),
   mc('<span class="mono">{x ∈ ℝ / x² + 1 = 0}</span> es:',['∅','{−1, 1}','{1}','{i, −i}'],0,'En ℝ ningún cuadrado da −1. (En ℂ sí: ±i, pero el universo es ℝ.)'),
   vfm('Sea <span class="mono">D = {x ∈ ℤ / |x| ≤ 2}</span>.',[
    ['D = {−2, −1, 0, 1, 2}',true,'|x| ≤ 2 ⇔ −2 ≤ x ≤ 2.'],
    ['#D = 4',false,'Son 5 elementos.'],
    ['D = {x ∈ ℤ / x² ≤ 4}',true,'Es la misma condición: x² ≤ 4 ⇔ |x| ≤ 2.'],
    ['D ⊂ ℕ',false,'−1 y −2 no son naturales.']
   ])
  ]
 },
 t3:{
  examen:[
   op('Sea A = {1, {1}, ∅}. ¿Es cierto que ∅ ∈ A y que ∅ ⊂ A? ¿Y {1} ⊂ A?','∅ ∈ A: V (está listado) · ∅ ⊂ A: V (siempre) · {1} ⊂ A: V (porque 1 ∈ A)','Ojo: {1} además es elemento de A. Las dos cosas pueden pasar a la vez.')
  ],
  parcial:[
   vfm('Sea <span class="mono">A = {1, {1}, {1, 2}, ∅}</span>. Decidí V o F.',[
    ['1 ∈ A',true,'1 está listado como elemento.'],
    ['{1} ∈ A',true,'{1} también está listado como elemento.'],
    ['{1} ⊂ A',true,'Su único elemento, 1, pertenece a A.'],
    ['{2} ⊂ A',false,'2 no es elemento de A (está "adentro" de {1, 2}, pero no suelto).'],
    ['{1, 2} ⊂ A',false,'Haría falta que 2 ∈ A, y no pasa. Sí es cierto que {1, 2} ∈ A.'],
    ['∅ ∈ A y ∅ ⊂ A',true,'∅ está listado (∈) y además el vacío es subconjunto de todo (⊂).'],
    ['#A = 4',true,'Elementos: 1, {1}, {1,2}, ∅.']
   ]),
   op('Sean A = {x ∈ ℕ / x es múltiplo de 6} y B = {x ∈ ℕ / x es par}. ¿A ⊂ B? ¿B ⊂ A? Justificá.','A ⊂ B (sí) · B ⊄ A (no)','Todo múltiplo de 6 es 6k = 2·(3k), par. Pero 2 ∈ B y 2 ∉ A, así que B no está incluido en A.'),
   mc('Si A ⊂ B y B ⊂ A, entonces:',['A = B','A = ∅','A ∩ B = ∅','#A &lt; #B'],0,'Es la definición de igualdad por doble inclusión.'),
   op('Clasificá (vacío, unitario, finito, infinito): a) {x ∈ ℕ / 3 &lt; x &lt; 4} · b) {x ∈ ℝ / 3 &lt; x &lt; 4} · c) {x ∈ ℤ / x² = 9} · d) {x ∈ ℕ / x + 5 = 5}.','a) vacío · b) infinito · c) finito, {−3, 3} · d) unitario, {0}','En ℕ no hay nada entre 3 y 4, pero en ℝ hay infinitos números.')
  ]
 },
 t4:{
  examen:[
   op('En un curso de 40 alumnos, 25 aprobaron Análisis, 18 aprobaron Bases de Datos y 8 aprobaron las dos. ¿Cuántos no aprobaron ninguna? ¿Cuántos aprobaron solo Análisis?','Ninguna: 5 · Solo Análisis: 17','#(A ∪ B) = 25 + 18 − 8 = 35, así que 40 − 35 = 5. Solo A = 25 − 8 = 17.')
  ],
  parcial:[
   vfm('Observá la zona sombreada del diagrama.',[
    ['La zona sombreada es (A ∪ B) − C',true,'Está todo A y todo B, salvo lo que cae dentro de C.'],
    ['La zona sombreada es (A ∩ B) − C',false,'También están sombreadas las partes de "solo A" y "solo B".'],
    ['Es igual a (A − C) ∪ (B − C)',true,'La diferencia se distribuye sobre la unión.'],
    ['Contiene a A ∩ B ∩ C',false,'La zona central está en C, así que no está sombreada.'],
    ['Es igual a (A ∪ B) ∩ C′',true,'Restar C es lo mismo que intersecar con su complemento.']
   ],G.venn({n:3,shade:['100','010','110']})),
   op('Se encuestó a 100 personas sobre qué plataformas usan: 50 usan N, 40 usan Y, 30 usan S. 15 usan N e Y, 10 usan N y S, 8 usan Y y S, y 5 usan las tres. a) ¿Cuántas no usan ninguna? b) ¿Cuántas usan solo N? c) ¿Cuántas usan exactamente dos?','a) 8 · b) 30 · c) 18','a) #(N∪Y∪S) = 50 + 40 + 30 − 15 − 10 − 8 + 5 = 92 → 100 − 92 = 8. b) Solo N = 50 − 15 − 10 + 5 = 30. c) (15 − 5) + (10 − 5) + (8 − 5) = 18.'),
   mc('¿Qué operación representa la zona sombreada?',['(A ∪ B) − (A ∩ B)','A ∩ B','A′ ∪ B′','(A ∪ B)′'],0,'Es la diferencia simétrica: lo que está en uno solo de los dos.',G.venn({n:2,shade:['10','01']})),
   vfm('Decidí si cada igualdad vale para cualesquiera conjuntos A, B, C.',[
    ['(A ∪ B)′ = A′ ∩ B′',true,'Es una ley de De Morgan.'],
    ['A − B = A ∩ B′',true,'Estar en A y no en B es estar en A y en el complemento de B.'],
    ['A − (B ∪ C) = (A − B) ∪ (A − C)',false,'Lo correcto es (A − B) ∩ (A − C). Probalo con un Venn.'],
    ['A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)',true,'Propiedad distributiva.'],
    ['A ∪ (A ∩ B) = A',true,'Ley de absorción.']
   ]),
   op('Con 𝒰 = {1, …, 10}, A = {1, 2, 3, 4, 5}, B = {2, 4, 6, 8, 10} y C = {3, 6, 9}, hallá (A ∩ B′) ∪ C y (A ∪ C)′ ∩ B.','(A ∩ B′) ∪ C = {1, 3, 5, 6, 9} · (A ∪ C)′ ∩ B = {8, 10}','A ∩ B′ = {1, 3, 5}; unido con C da {1,3,5,6,9}. A ∪ C = {1,2,3,4,5,6,9}; su complemento es {7, 8, 10}; ∩ B = {8, 10}.')
  ]
 },
 t5:{
  examen:[
   op('Sean A = [−2, 3) y B = (1, 5]. Hallá A ∪ B, A ∩ B y A − B.','A ∪ B = [−2, 5] · A ∩ B = (1, 3) · A − B = [−2, 1]','El 1 no está en B (paréntesis), por eso queda en A − B con corchete.')
  ],
  parcial:[
   vfm('Conjuntos numéricos: decidí V o F.',[
    ['ℕ ⊂ ℚ',true,'Todo natural n se escribe n/1.'],
    ['√9 ∈ 𝕀',false,'√9 = 3, es natural.'],
    ['0,333… ∈ ℚ',true,'Es periódico: 0,333… = 1/3.'],
    ['ℚ ∩ 𝕀 = ∅',true,'Un número no puede ser racional e irracional a la vez.'],
    ['ℤ ∪ 𝕀 = ℝ',false,'Faltan los racionales no enteros, como 1/2.'],
    ['Entre dos racionales siempre hay otro racional',true,'Por ejemplo su promedio: ℚ es denso.']
   ]),
   op('Escribí como intervalo o unión de intervalos: a) {x ∈ ℝ / |x − 1| &lt; 3} · b) {x ∈ ℝ / |x| ≥ 2}.','a) (−2, 4) · b) (−∞, −2] ∪ [2, +∞)','a) −3 &lt; x − 1 &lt; 3 ⇒ −2 &lt; x &lt; 4. b) x ≤ −2 o x ≥ 2.'),
   op('Sean A = (−∞, 2] y B = (−1, +∞). Hallá A ∩ B, A ∪ B y el complemento de A (en ℝ).','A ∩ B = (−1, 2] · A ∪ B = ℝ · A′ = (2, +∞)',''),
   mc('El número 2,1(37) (con 37 periódico) es:',['racional','irracional','entero','imaginario'],0,'Todo decimal periódico es racional.')
  ]
 },
 t6:{
  examen:[
   op('Si A × B = {(1;a), (1;b), (2;a), (2;b), (3;a), (3;b)}, ¿quiénes son A y B?','A = {1, 2, 3} · B = {a, b}','Las primeras componentes forman A y las segundas forman B.')
  ],
  parcial:[
   vfm('El gráfico muestra los puntos de un producto cartesiano.',[
    ['Representa A × B con A = {1, 2, 3} y B = {1, 2}',true,'Las abscisas son 1, 2 y 3; las ordenadas, 1 y 2.'],
    ['#(A × B) = 6',true,'Hay 6 puntos: 3 · 2.'],
    ['(2; 3) ∈ A × B',false,'3 no es ordenada de ningún punto.'],
    ['El gráfico también representa B × A',false,'En B × A las abscisas serían 1 y 2, y las ordenadas 1, 2 y 3.'],
    ['(A × B) ∩ (B × A) = {(1;1), (1;2), (2;1), (2;2)}',true,'Son los pares con ambas componentes en A ∩ B = {1, 2}.']
   ],G.plot({x:[-1,4],y:[-1,4],pts:[{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:1,y:2},{x:2,y:2},{x:3,y:2}],label:'producto cartesiano'})),
   op('A = {1, 2} y B = {2, 3}. Hallá (A × B) ∩ (B × A).','{(2; 2)}','A × B = {(1;2),(1;3),(2;2),(2;3)} y B × A = {(2;1),(2;2),(3;1),(3;2)}. El único en común es (2;2).'),
   mc('Si #(A × A) = 49, entonces #A es:',['7','49','24,5','14'],0,'#(A × A) = (#A)² = 49.'),
   mc('El gráfico de [1, 3] × [0, 2] en el plano es:',['un rectángulo (con su interior)','6 puntos','un segmento','una recta'],0,'Son todos los (x, y) con 1 ≤ x ≤ 3 y 0 ≤ y ≤ 2: la región rectangular sombreada.',G.plot({x:[-1,4],y:[-1,3],polys:[{pts:[[1,0],[3,0],[3,2],[1,2]],c:R_,op:.25,stroke:R_}],label:'rectángulo'}))
  ]
 },
 t7:{
  examen:[
   op('Hallá x e y para que se cumpla la igualdad [x+y 2 ; 3 x−y] = [5 2 ; 3 1].','x = 3, y = 2','Igualdad de matrices: elemento a elemento. x + y = 5 y x − y = 1 ⇒ 2x = 6.')
  ],
  parcial:[
   vfm('<b>Aplicación.</b> Una fábrica tiene dos sucursales. La matriz P da la producción semanal (filas: S1, S2; columnas: mesas, sillas, bancos) y C da el costo por unidad en miles de $ (filas: mesa, silla, banco; columnas: madera, mano de obra):<br><span class="mono">P = [10 40 5 ; 8 30 12]</span> &nbsp; <span class="mono">C = [5 3 ; 2 1 ; 3 2]</span><br>Analizá las afirmaciones <b>sin hacer todas las cuentas</b> salvo que haga falta.',[
    ['P · C es una matriz 2 × 2',true,'(2 × 3)·(3 × 2) = 2 × 2.'],
    ['El elemento (2,1) de P·C vale 136 y es el costo total de madera de la sucursal 2',true,'8·5 + 30·2 + 12·3 = 40 + 60 + 36 = 136: fila S2 por columna madera.'],
    ['C · P tiene el mismo significado que P · C',false,'C·P es 3 × 3 y multiplica "columnas de costo" por "filas de sucursal": no tiene sentido económico. Además el producto no es conmutativo.'],
    ['Se puede calcular P + C',false,'P es 2 × 3 y C es 3 × 2: dimensiones distintas.'],
    ['Si la producción se duplica, el costo total es 2·(P·C)',true,'(2P)·C = 2·(P·C).']
   ]),
   op('Con A = [1 2 ; 0 −1] y B = [3 0 ; 1 2], verificá que (A·B)ᵀ = Bᵀ·Aᵀ.','A·B = [5 4 ; −1 −2] → (A·B)ᵀ = [5 −1 ; 4 −2]. Bᵀ·Aᵀ = [3 1 ; 0 2]·[1 0 ; 2 −1] = [5 −1 ; 4 −2] ✓','La traspuesta de un producto invierte el orden. Ojo: Aᵀ·Bᵀ en general NO da lo mismo.'),
   mc('A es 3 × 2, B es 2 × 4 y C es 4 × 3. ¿Qué dimensión tiene (A·B·C)ᵀ?',['3 × 3','2 × 4','4 × 3','No existe'],0,'A·B es 3 × 4; por C da 3 × 3; la traspuesta de una 3 × 3 sigue siendo 3 × 3.'),
   op('Hallá la matriz X que verifica 2X − A = Bᵀ, con A = [1 2 ; 3 4] y B = [1 0 ; 2 1].','X = [1 2 ; 1,5 2,5]','Bᵀ = [1 2 ; 0 1]. 2X = A + Bᵀ = [2 4 ; 3 5] ⇒ X = ½·[2 4 ; 3 5].'),
   vf('Si A · B = 0 (matriz nula), entonces A = 0 o B = 0.',false,'Contraejemplo: A = [1 0 ; 0 0], B = [0 0 ; 0 1]. Ninguna es nula y A·B = 0. Con matrices no vale la "ley del producto nulo".'),
   mc('Si A = [1 1 ; 0 1], entonces A³ es:',['[1 3 ; 0 1]','[1 1 ; 0 1]','[3 3 ; 0 3]','[1 0 ; 0 1]'],0,'A² = [1 2 ; 0 1] y A³ = A²·A = [1 3 ; 0 1]. En general Aⁿ = [1 n ; 0 1].'),
   vfm('Tipos de matrices: decidí V o F.',[
    ['Toda matriz diagonal es simétrica',true,'Fuera de la diagonal todo es 0, así que aᵢⱼ = aⱼᵢ = 0.'],
    ['Toda matriz diagonal es triangular',true,'Tiene ceros arriba y abajo de la diagonal.'],
    ['Una matriz nula puede ser rectangular',true,'Por ejemplo la nula de 2 × 3.'],
    ['Si A es 2 × 3, entonces A·Aᵀ es una matriz simétrica 2 × 2',true,'(A·Aᵀ)ᵀ = (Aᵀ)ᵀ·Aᵀ = A·Aᵀ.'],
    ['La identidad de orden 3 es igual a su inversa',true,'I · I = I.']
   ])
  ]
 },
 t8:{
  examen:[
   op('¿Para qué valor de k es det[1 k 0 ; 0 1 2 ; 1 0 1] = 0?','det = 1 + 2k = 0 ⇒ k = −1/2','Desarrollando por la 1ª fila: 1·(1·1 − 2·0) − k·(0·1 − 2·1) + 0 = 1 + 2k.')
  ],
  parcial:[
   op('Calculá por Laplace el determinante de A = [2 0 1 3 ; 0 0 2 0 ; 1 3 0 1 ; 0 1 1 2].','det(A) = −26','Conviene la fila 2 (tiene un solo elemento no nulo: a₂₃ = 2). Signo de (2,3): (−1)⁵ = −1. M₂₃ = det[2 0 3 ; 1 3 1 ; 0 1 2] = 2·(6 − 1) − 0 + 3·(1 − 0) = 13. det = 2·(−1)·13 = −26.'),
   mc('A es una matriz 3 × 3 con det(A) = 3. ¿Cuánto vale det(2A)?',['24','6','12','9'],0,'det(c·A) = cⁿ·det(A) = 2³·3 = 24. Es el error más común del parcial: no es 2·3.'),
   vfm('Propiedades de los determinantes (A y B cuadradas del mismo orden).',[
    ['det(A + B) = det(A) + det(B)',false,'No vale en general. Ej.: A = B = I₂ ⇒ det(2I) = 4 ≠ 1 + 1.'],
    ['Intercambiar dos filas cambia el signo del determinante',true,'Es una de las propiedades básicas.'],
    ['Si una fila es combinación lineal de otras, el determinante es 0',true,'Restando esa combinación se obtiene una fila de ceros.'],
    ['Si A es 3 × 3, det(−A) = −det(A)',true,'det(−A) = (−1)³·det(A).'],
    ['Si A es 2 × 2, det(−A) = −det(A)',false,'det(−A) = (−1)²·det(A) = det(A).'],
    ['det(A·B) = det(B·A)',true,'Ambos dan det(A)·det(B), aunque A·B ≠ B·A.']
   ]),
   op('Resolvé la ecuación det[x 1 1 ; 1 x 1 ; 1 1 x] = 0.','x = 1 (doble) · x = −2','Por Sarrus: x³ + 1 + 1 − x − x − x = x³ − 3x + 2 = (x − 1)²(x + 2).'),
   op('Sin hacer cuentas largas, calculá det[1 2 3 ; 2 4 6 ; 7 8 9] y justificá.','det = 0','La fila 2 es el doble de la fila 1 (filas proporcionales).'),
   mc('¿Para qué valores de a la matriz [a 1 ; 4 a] es invertible?',['a ≠ 2 y a ≠ −2','a = ±2','a ≠ 4','para todo a'],0,'det = a² − 4 ≠ 0 ⇔ a ≠ ±2.')
  ]
 },
 t9:{
  examen:[
   op('Hallá el rango de [1 2 3 ; 2 4 6 ; 1 0 1].','rg = 2','R₂ − 2R₁ da una fila de ceros. Quedan dos filas no proporcionales, (1 2 3) y (1 0 1).')
  ],
  parcial:[
   op('Llevá a la forma escalonada reducida la matriz [1 2 1 ; 2 5 3 ; 1 3 3]. ¿Es invertible?','Se llega a I₃ → sí, es invertible (det = 1)','R₂ − 2R₁ → (0 1 1); R₃ − R₁ → (0 1 2); R₃ − R₂ → (0 0 1). Luego R₁ − 2R₂, R₂ − R₃, R₁ + R₃ → identidad.'),
   vfm('Operaciones elementales: decidí V o F.',[
    ['Las operaciones elementales de fila no cambian el conjunto solución de un sistema',true,'Por eso producen sistemas equivalentes.'],
    ['Multiplicar una fila por 3 multiplica el determinante por 3',true,'El determinante es lineal en cada fila.'],
    ['Intercambiar R₁ ↔ R₂ no cambia el determinante',false,'Le cambia el signo.'],
    ['Dos matrices equivalentes por filas tienen el mismo determinante',false,'Pueden cambiar el signo o la escala. Lo que sí se conserva es si el det es 0 o no.'],
    ['Dos matrices equivalentes por filas tienen el mismo rango',true,'El rango es invariante por operaciones elementales.']
   ]),
   mc('¿Para qué valor de k la matriz [1 1 ; 2 k] tiene rango 1?',['k = 2','k = 1','k = 0','nunca'],0,'Rango 1 ⇔ filas proporcionales ⇔ det = k − 2 = 0.'),
   op('Aplicá la secuencia R₂ − 3R₁, R₃ + R₁ a la matriz [1 −1 2 ; 3 0 1 ; −1 2 4].','[1 −1 2 ; 0 3 −5 ; 0 1 6]','R₂ = (3, 0, 1) − 3·(1, −1, 2) = (0, 3, −5). R₃ = (−1, 2, 4) + (1, −1, 2) = (0, 1, 6).')
  ]
 },
 t10:{
  examen:[
   op('Hallá la inversa de A = [1 0 2 ; 2 1 0 ; 0 1 1] y verificá con un casillero.','det = 5 · A⁻¹ = (1/5)·[1 2 −2 ; −2 1 4 ; 2 −1 1]','Por adjunta o por Gauss-Jordan. Verificación: fila 1 de A por columna 1 de A⁻¹ = (1·1 + 0·(−2) + 2·2)/5 = 1 ✓.')
  ],
  parcial:[
   op('Resolvé la ecuación matricial X·A = B con A = [2 1 ; 1 1] y B = [1 0 ; 3 2].','X = B·A⁻¹ = [1 −1 ; 1 1]','A⁻¹ = [1 −1 ; −1 2] (det = 1). Como X está a la IZQUIERDA de A, se multiplica por A⁻¹ a la DERECHA: X = B·A⁻¹.'),
   op('Despejá X en A·X + B = 2X y resolvé con A = [3 1 ; 1 2], B = [1 ; 0].','(A − 2I)·X = −B ⇒ X = (A − 2I)⁻¹·(−B) = [0 ; −1]','A·X − 2X = −B y 2X = 2I·X, así que (A − 2I)·X = −B. A − 2I = [1 1 ; 1 0], det = −1, inversa [0 1 ; 1 −1]. X = [0 1 ; 1 −1]·[−1 ; 0] = [0 ; −1]. Verificación: A·X + B = [−1 ; −2] + [1 ; 0] = [0 ; −2] = 2X ✓. Error típico: escribir (A − 2)X, restando un número a una matriz.'),
   vfm('Ecuaciones matriciales (A invertible, todas del tamaño adecuado).',[
    ['La solución de A·X = B es X = B·A⁻¹',false,'Es X = A⁻¹·B: la inversa va del mismo lado que estaba A.'],
    ['La solución de X·A = B es X = B·A⁻¹',true,'Multiplicás por A⁻¹ a la derecha en ambos miembros.'],
    ['(A·B)⁻¹ = A⁻¹·B⁻¹',false,'Es B⁻¹·A⁻¹ (se invierte el orden).'],
    ['Si det(A) = 4, entonces det(A⁻¹) = 1/4',true,'det(A)·det(A⁻¹) = det(I) = 1.'],
    ['Si A·X = 0 tiene solución no trivial, A no es invertible',true,'Si A fuera invertible, X = A⁻¹·0 = 0 sería la única.']
   ]),
   op('Resolvé por Cramer: &nbsp; x + y + z = 6 &nbsp;·&nbsp; 2x − y + z = 3 &nbsp;·&nbsp; x + 2y − z = 2.','det(A) = 7 · x = 1, y = 2, z = 3','det(A) = 1·(1 − 2) − 1·(−2 − 1) + 1·(4 + 1) = −1 + 3 + 5 = 7. det(Aₓ) = 7, det(A_y) = 14, det(A_z) = 21.'),
   mc('Si A es 3 × 3 y det(A) = −2, ¿cuánto vale det(3·A⁻¹)?',['−27/2','−3/2','27/2','−6'],0,'det(3·A⁻¹) = 3³·det(A⁻¹) = 27·(−1/2).')
  ]
 }
};

/* =====================================================================
   TEMAS NUEVOS
   ===================================================================== */
var NUEVOS={
 adj:{id:'adj',titulo:'Cofactores, adjunta y regla de Laplace',pre:'Necesitás: <b>determinantes 2×2 y 3×3</b>',desc:'Menores y cofactores, desarrollo de Laplace (orden n), matriz adjunta, A·adj(A) = det(A)·I y propiedades de la inversa.',
  exams:{
   basico:[
    mc('El cofactor C₁₂ de la matriz [a b ; c d] es:',['−c','c','−b','d'],0,'C₁₂ = (−1)¹⁺²·M₁₂, y M₁₂ (tachando fila 1 y columna 2) es c.'),
    mc('La matriz adjunta adj(A) es:',['la traspuesta de la matriz de cofactores','la matriz de cofactores','la inversa de A','la traspuesta de A'],0,'Primero armás los cofactores y después trasponés.'),
    mc('La regla de Laplace permite calcular un determinante:',['desarrollando por cualquier fila o columna','solo por la primera fila','solo en matrices 3×3','solo si la matriz es triangular'],0,'Sirve para cualquier orden n y cualquier fila o columna.'),
    mc('¿Qué signo le corresponde a la posición (2,3) en el tablero de signos?',['−','+','depende del número','ninguno'],0,'(−1)²⁺³ = (−1)⁵ = −1.')
   ],
   normal:[
    mc('La adjunta de [3 1 ; 2 4] es:',['[4 −1 ; −2 3]','[4 −2 ; −1 3]','[3 −1 ; −2 4]','[−4 1 ; 2 −3]'],0,'En 2×2: adj[a b ; c d] = [d −b ; −c a].'),
    mc('Para toda matriz cuadrada A vale:',['A · adj(A) = det(A) · I','A · adj(A) = I','adj(A) = A⁻¹','A · adj(A) = 0'],0,'Es la propiedad de la adjunta; de ella sale A⁻¹ = adj(A)/det(A).'),
    mc('Al aplicar Laplace conviene elegir:',['la fila o columna con más ceros','siempre la primera fila','la diagonal','la fila con números más grandes'],0,'Cada cero anula un término entero.'),
    mc('El menor M₂₂ de [1 2 3 ; 4 5 6 ; 7 8 10] vale:',['−11','11','−3','5'],0,'Tachás fila 2 y columna 2: |1 3 ; 7 10| = 10 − 21 = −11.')
   ],
   examen:[
    op('Calculá la adjunta de A = [1 2 0 ; 0 1 3 ; 1 0 1] y, con ella, A⁻¹.','det(A) = 7 · adj(A) = [1 −2 6 ; 3 1 −3 ; −1 2 1] · A⁻¹ = (1/7)·[1 −2 6 ; 3 1 −3 ; −1 2 1]','Cofactores: C₁₁ = 1, C₁₂ = 3, C₁₃ = −1, C₂₁ = −2, C₂₂ = 1, C₂₃ = 2, C₃₁ = 6, C₃₂ = −3, C₃₃ = 1. La adjunta es la traspuesta de esa matriz.'),
    op('Desarrollá por la 2ª columna: det[2 0 1 ; 3 0 4 ; 1 5 2].','det = −25','En la columna 2 solo a₃₂ = 5 es no nulo. Signo (−1)³⁺² = −1. M₃₂ = |2 1 ; 3 4| = 5. det = 5·(−1)·5 = −25.'),
    op('Si A es 3 × 3 y det(A) = 4, ¿cuánto vale det(adj(A))?','det(adj A) = det(A)ⁿ⁻¹ = 4² = 16','De A·adj(A) = det(A)·I: det(A)·det(adj A) = det(A)³, así que det(adj A) = det(A)².'),
    mc('Para A y B invertibles, (A · B)⁻¹ es igual a:',['B⁻¹ · A⁻¹','A⁻¹ · B⁻¹','A · B','(B · A)'],0,'Se invierte el orden: (AB)(B⁻¹A⁻¹) = A·I·A⁻¹ = I.'),
    op('Verificá la propiedad A·adj(A) = det(A)·I con A = [2 1 ; 5 3].','adj(A) = [3 −1 ; −5 2] · A·adj(A) = [1 0 ; 0 1] = 1·I y det(A) = 1 ✓','2·3 + 1·(−5) = 1; 2·(−1) + 1·2 = 0; 5·3 + 3·(−5) = 0; 5·(−1) + 3·2 = 1.')
   ],
   parcial:[
    op('Calculá por Laplace det(B) con B = [1 0 2 0 ; 3 1 0 0 ; 0 0 1 4 ; 2 0 0 1].','det(B) = 17','La columna 2 tiene un solo no nulo: b₂₂ = 1, signo +. M₂₂ = det[1 2 0 ; 0 1 4 ; 2 0 1] = 1·(1 − 0) − 2·(0 − 8) + 0 = 17.'),
    vfm('Propiedades de la inversa (A y B invertibles del mismo orden, n = 3).',[
     ['(A⁻¹)⁻¹ = A',true,'La inversa de la inversa es la original.'],
     ['(Aᵀ)⁻¹ = (A⁻¹)ᵀ',true,'Trasponer e invertir conmutan.'],
     ['(A + B)⁻¹ = A⁻¹ + B⁻¹',false,'Falso en general: con A = B = I daría (2I)⁻¹ = ½I ≠ 2I.'],
     ['(2A)⁻¹ = ½·A⁻¹',true,'(2A)(½A⁻¹) = I.'],
     ['Si A·B = I, entonces B = A⁻¹',true,'Para matrices cuadradas alcanza con un lado.'],
     ['adj(A) = det(A)·A⁻¹',true,'Se despeja de A⁻¹ = adj(A)/det(A).']
    ]),
    op('Hallá los valores de k para los que A = [1 0 k ; 0 1 1 ; k 1 2] NO es invertible.','det(A) = 1 − k² ⇒ k = 1 o k = −1','Por la 1ª fila: 1·(2 − 1) − 0 + k·(0 − k) = 1 − k².'),
    op('Sin calcular toda la inversa, hallá el elemento (2,3) de A⁻¹ para A = [1 2 0 ; 0 1 3 ; 1 0 1].','(A⁻¹)₂₃ = C₃₂ / det(A) = −3/7','Ojo con la traspuesta: el lugar (2,3) de la inversa usa el cofactor (3,2). C₃₂ = −|1 0 ; 0 3| = −3, det(A) = 7.'),
    mc('Si A es 3 × 3 y det(A) = −2, entonces det(Aᵀ · A⁻¹ · 2A) vale:',['−16','16','−4','8'],0,'det(Aᵀ)·det(A⁻¹)·det(2A) = (−2)·(−1/2)·(2³·(−2)) = 1·(−16) = −16.'),
    op('Probá que si A es invertible y A² = A, entonces A = I.','A² = A ⇒ A⁻¹·A·A = A⁻¹·A ⇒ I·A = I ⇒ A = I','Multiplicás a izquierda por A⁻¹ en ambos miembros.')
   ]
  }},

 vec:{id:'vec',titulo:'Vectores: operaciones, norma y proyecciones',pre:'Necesitás: <b>matrices fila/columna</b> y Pitágoras',desc:'Vectores de n componentes, suma y producto por escalar, producto escalar, norma, ángulo, versor, distancia y proyecciones.',
  exams:{
   basico:[
    mc('Si u = (1, 2) y v = (3, −1), entonces u + v es:',['(4, 1)','(4, 3)','(3, −2)','(2, −3)'],0,'Se suma componente a componente.'),
    mc('3 · (2, −1, 0) es:',['(6, −3, 0)','(5, 2, 3)','(6, −1, 0)','(6, −3, 3)'],0,'Cada componente por 3.'),
    mc('La norma de (3, 4) es:',['5','7','25','1'],0,'‖(3,4)‖ = √(9 + 16) = 5.'),
    mc('El producto escalar (1, 2, 3)·(4, 0, −1) es:',['1','7','(4, 0, −3)','−1'],0,'1·4 + 2·0 + 3·(−1) = 1. Da un NÚMERO, no un vector.')
   ],
   normal:[
    mc('Si u · v = 0 (y ninguno es nulo), los vectores son:',['perpendiculares','paralelos','iguales','opuestos'],0,'cos θ = 0 ⇒ θ = 90°.'),
    mc('El versor (vector unitario) de (0, 3, 4) es:',['(0, 3/5, 4/5)','(0, 1, 1)','(0, 3/7, 4/7)','(0, 4/5, 3/5)'],0,'Se divide por la norma, que es 5.'),
    mc('‖(1, −2, 2, 4)‖ vale:',['5','√13','9','3'],0,'√(1 + 4 + 4 + 16) = √25 = 5. Vale igual en ℝ⁴.'),
    mc('¿Para qué k son perpendiculares (2, k) y (3, 6)?',['k = −1','k = 1','k = 0','k = −2'],0,'2·3 + 6k = 0 ⇒ k = −1.'),
    vfm('El gráfico muestra u, v y un tercer vector w (punteado).',[
     ['w = u + v',true,'Es la diagonal del paralelogramo formado por u y v.'],
     ['‖u‖ = √10',true,'u = (3, 1) ⇒ √(9 + 1).'],
     ['u y v son perpendiculares',false,'u·v = 3·1 + 1·2 = 5 ≠ 0.'],
     ['u − v = (2, −1)',true,'(3, 1) − (1, 2) = (2, −1).']
    ],FIG.sumaVec)
   ],
   examen:[
    op('Dados u = (2, −1, 3) y v = (1, 4, −2), calculá 2u − 3v, u·v, ‖u‖ y el ángulo entre u y v.','2u − 3v = (1, −14, 12) · u·v = −8 · ‖u‖ = √14 · θ ≈ 117,8°','‖v‖ = √21. cos θ = −8/(√14·√21) = −8/√294 ≈ −0,4666. Como el producto escalar es negativo, el ángulo es obtuso.'),
    op('Hallá la proyección vectorial de u = (2, 3) sobre v = (4, −2) y la componente escalar.','proy_v u = (u·v/‖v‖²)·v = (2/20)·(4, −2) = (0,4 ; −0,2) · comp = 2/√20 ≈ 0,447','u·v = 8 − 6 = 2 y ‖v‖² = 20.'),
    op('Calculá la distancia entre P(1, 2, 3) y Q(4, 6, 3).','d = ‖Q − P‖ = ‖(3, 4, 0)‖ = 5',''),
    mc('La desigualdad triangular dice que:',['‖u + v‖ ≤ ‖u‖ + ‖v‖','‖u + v‖ = ‖u‖ + ‖v‖','‖u + v‖ ≥ ‖u‖ + ‖v‖','‖u·v‖ = ‖u‖·‖v‖'],0,'Un lado de un triángulo no supera la suma de los otros dos.'),
    vfm('En el gráfico, p es la proyección de u sobre v y el segmento punteado une la punta de u con p.',[
     ['p = (2, 0)',true,'u = (2, 3), v = (4, 0): (u·v/‖v‖²)·v = (8/16)·(4, 0) = (2, 0).'],
     ['El segmento punteado es perpendicular a v',true,'u − p = (0, 3) es ortogonal a v = (4, 0).'],
     ['u · v = 8',true,'2·4 + 3·0 = 8.'],
     ['La proyección de v sobre u es el mismo vector p',false,'proy_u v = (8/13)·(2, 3): tiene la dirección de u, no de v.']
    ],FIG.proy)
   ],
   parcial:[
    vfm('Observá los vectores a, b y c del gráfico (las coordenadas son enteras).',[
     ['a ⊥ b',true,'a = (2, 1), b = (−1, 2): a·b = −2 + 2 = 0.'],
     ['c = a + b',true,'(2, 1) + (−1, 2) = (1, 3).'],
     ['‖a‖ = ‖b‖',true,'Ambas valen √5.'],
     ['El ángulo entre a y c es 45°',true,'a·c = 2 + 3 = 5; ‖a‖·‖c‖ = √5·√10 = √50 ⇒ cos θ = 5/√50 = √2/2.'],
     ['{a, b, c} es linealmente independiente',false,'c = a + b: tres vectores en ℝ² siempre son LD.']
    ],FIG.tresVec),
    op('Hallá el vector de norma 10 paralelo a (3, −4) pero de sentido opuesto.','(−6, 8)','Versor de (3, −4): (3/5, −4/5). Por −10: (−6, 8).'),
    op('Calculá u × v para u = (1, 2, 0) y v = (0, 1, 3), y el área del paralelogramo que determinan.','u × v = (6, −3, 1) · Área = ‖u × v‖ = √46 ≈ 6,78','u × v = (2·3 − 0·1, 0·0 − 1·3, 1·1 − 2·0).'),
    op('<b>Problema.</b> Un avión vuela con velocidad propia (300, 0) km/h (hacia el este) y hay un viento de (0, 40) km/h (hacia el norte). ¿Cuál es la velocidad resultante y su rapidez?','v = (300, 40) km/h · rapidez = √91600 ≈ 302,7 km/h','Las velocidades se suman como vectores; la rapidez es la norma.'),
    op('Hallá k para que u = (k, 1, 2) y v = (3, k, −1) sean ortogonales.','k = 1/2','u·v = 3k + k − 2 = 4k − 2 = 0.'),
    vf('Para cualquier par de vectores, ‖u + v‖² = ‖u‖² + ‖v‖² si y solo si u ⊥ v.',true,'‖u + v‖² = ‖u‖² + 2u·v + ‖v‖²: el término del medio se anula solo si u·v = 0. Es el teorema de Pitágoras.')
   ]
  }},

 lin:{id:'lin',titulo:'Dependencia lineal, base y dimensión',pre:'Necesitás: <b>vectores</b> y <b>determinantes</b>',desc:'Combinación lineal, conjuntos LI y LD, subespacio generado, base, coordenadas y dimensión.',
  exams:{
   basico:[
    mc('Una combinación lineal de u y v es un vector de la forma:',['a·u + b·v, con a y b números','u · v','u × v','‖u‖ + ‖v‖'],0,'Se escalan los vectores y se suman.'),
    mc('La dimensión de ℝ³ es:',['3','1','infinita','9'],0,'Cualquier base de ℝ³ tiene 3 vectores.'),
    mc('La base canónica de ℝ² es:',['{(1, 0), (0, 1)}','{(1, 1)}','{(1, 0), (2, 0)}','{(0, 0), (1, 1)}'],0,'Son los versores de los ejes.'),
    mc('Un conjunto de vectores que contiene al vector nulo es:',['linealmente dependiente','linealmente independiente','una base','vacío'],0,'1·0 = 0 es una combinación no trivial que da el nulo.')
   ],
   normal:[
    mc('El conjunto {(1, 2), (2, 4)} es:',['LD','LI','base de ℝ²','ortogonal'],0,'(2, 4) = 2·(1, 2): uno es múltiplo del otro.'),
    mc('¿Cuántos vectores puede tener, como máximo, un conjunto LI en ℝ³?',['3','2','4','infinitos'],0,'El máximo de vectores LI es la dimensión.'),
    mc('El conjunto {(1, 0, 0), (0, 1, 0)}:',['es LI pero no es base de ℝ³','es base de ℝ³','es LD','genera ℝ³'],0,'Genera solo el plano z = 0. Le falta un vector.'),
    mc('Escribí (5, 7) como combinación lineal de (1, 1) y (1, 2):',['3·(1, 1) + 2·(1, 2)','2·(1, 1) + 3·(1, 2)','5·(1, 1) + 7·(1, 2)','no se puede'],0,'a + b = 5 y a + 2b = 7 ⇒ b = 2, a = 3.'),
    vf('Los dos vectores del gráfico son linealmente dependientes.',true,'v = (−4, −2) = −2·u: están sobre la misma recta (colineales).',FIG.colineales)
   ],
   examen:[
    op('¿Son LI los vectores (1, 2, 3), (0, 1, 4) y (5, 6, 0)? ¿Forman una base de ℝ³?','det[1 2 3 ; 0 1 4 ; 5 6 0] = 1 ≠ 0 ⇒ son LI y forman base de ℝ³','Tres vectores de ℝ³ son LI ⇔ el determinante de la matriz que forman es ≠ 0.'),
    op('Hallá k para que (1, k) y (k, 4) sean LD.','k = 2 o k = −2','det[1 k ; k 4] = 4 − k² = 0.'),
    op('Hallá las coordenadas de v = (3, −1, 2) en la base B = {(1, 0, 0), (1, 1, 0), (1, 1, 1)}.','[v]_B = (4, −3, 2)','a(1,0,0) + b(1,1,0) + c(1,1,1) = (a + b + c, b + c, c) = (3, −1, 2) ⇒ c = 2, b = −3, a = 4.'),
    vfm('Observá los vectores u, v y w del gráfico (coordenadas enteras).',[
     ['{u, v} es una base de ℝ²',true,'u = (1, 2) y v = (3, 1) no son paralelos: det = 1 − 6 = −5 ≠ 0.'],
     ['{u, v, w} es LI',false,'Tres vectores en ℝ² siempre son LD.'],
     ['w = u + v',true,'(1, 2) + (3, 1) = (4, 3).'],
     ['Las coordenadas de w en la base {u, v} son (1, 1)',true,'Porque w = 1·u + 1·v.']
    ],FIG.base3),
    op('Hallá una base y la dimensión de S = {(x, y, z) ∈ ℝ³ / x − 2y + z = 0}.','Base: {(2, 1, 0), (−1, 0, 1)} · dim S = 2','x = 2y − z ⇒ (x, y, z) = y·(2, 1, 0) + z·(−1, 0, 1). Es un plano que pasa por el origen.')
   ],
   parcial:[
    op('¿Para qué valores de k el conjunto {(1, 1, 0), (0, k, 1), (1, 0, k)} es base de ℝ³?','Para todo k real','det[1 1 0 ; 0 k 1 ; 1 0 k] = k² + 1, que nunca es 0. Trampa típica: hay que hacer la cuenta antes de buscar "valores prohibidos".'),
    op('Sean u = (1, 2, 3), v = (2, 1, 0) y w = (k, 1, 2). Hallá k para que sean LD y, para ese k, escribí w como combinación de u y v.','k = 0 · w = (2/3)·u − (1/3)·v','det[1 2 3 ; 2 1 0 ; k 1 2] = −3k = 0. Con w = (0, 1, 2): a + 2b = 0, 2a + b = 1, 3a = 2 ⇒ a = 2/3, b = −1/3.'),
    vfm('Decidí V o F (u, v, w vectores de ℝⁿ).',[
     ['Si {u, v, w} es LI, entonces {u, v} es LI',true,'Todo subconjunto de un conjunto LI es LI.'],
     ['Si {u, v} es LD y u ≠ 0, entonces v es múltiplo de u',true,'Con dos vectores, LD significa paralelos.'],
     ['Toda base de ℝ³ tiene exactamente 3 vectores',true,'Es la definición de dimensión.'],
     ['Cuatro vectores de ℝ³ pueden ser LI',false,'Más vectores que la dimensión ⇒ LD.'],
     ['{u, v, u + v} es siempre LD',true,'El tercero es combinación de los otros dos.'],
     ['Si {u, v} es LI, también lo es {u + v, u − v}',true,'a(u + v) + b(u − v) = 0 ⇒ (a + b)u + (a − b)v = 0 ⇒ a + b = 0 y a − b = 0 ⇒ a = b = 0.']
    ]),
    op('¿Pertenece (1, 4, 7) al subespacio generado por (1, 2, 3) y (0, 1, 2)?','Sí: (1, 4, 7) = 1·(1, 2, 3) + 2·(0, 1, 2)','a = 1 (1ª componente); 2a + b = 4 ⇒ b = 2; verificación de la 3ª: 3a + 2b = 7 ✓.'),
    mc('Un sistema homogéneo de 4 incógnitas tiene matriz de coeficientes de rango 2. La dimensión de su espacio solución es:',['2','4','0','1'],0,'Número de incógnitas − rango = 4 − 2 = 2 (variables libres).')
   ]
  }},

 sis:{id:'sis',titulo:'Sistemas: clasificación, conjunto solución y problemas',pre:'Necesitás: <b>Gauss-Jordan, rango y Cramer</b>',desc:'Forma matricial, sistemas equivalentes, Rouché-Frobenius, interpretación gráfica, conjunto solución, discusión con parámetros y problemas con enunciado.',
  exams:{
   basico:[
    mc('Un sistema compatible determinado tiene:',['una única solución','infinitas soluciones','ninguna solución','dos soluciones'],0,'Compatible = tiene solución; determinado = una sola.'),
    mc('Si las dos ecuaciones de un sistema 2×2 son rectas paralelas distintas, el sistema es:',['incompatible','compatible determinado','compatible indeterminado','homogéneo'],0,'No se cortan: no hay punto en común.',FIG.paralelas),
    mc('La forma matricial de 2x + 3y = 5 ; x − y = 1 es A·X = B con A =',['[2 3 ; 1 −1]','[2 1 ; 3 −1]','[5 ; 1]','[2 3 5 ; 1 −1 1]'],0,'A tiene los coeficientes, fila por ecuación.'),
    mc('Dos sistemas son equivalentes si:',['tienen el mismo conjunto solución','tienen los mismos coeficientes','tienen la misma cantidad de ecuaciones','son homogéneos'],0,'Es la definición. Las operaciones elementales producen sistemas equivalentes.')
   ],
   normal:[
    vfm('El gráfico muestra las rectas de un sistema de 2 ecuaciones con 2 incógnitas.',[
     ['El sistema es compatible determinado',true,'Las rectas se cortan en un único punto.'],
     ['La solución es (2, 3)',true,'Es el punto de corte P. Verificá: 3 = 2·2 − 1 y 3 = −2 + 5.'],
     ['(3, 2) es solución',false,'Es el punto con las coordenadas al revés: 2 ≠ 2·3 − 1.'],
     ['Si r₂ se cambiara por y = 2x + 4, el sistema sería incompatible',true,'Tendría la misma pendiente que r₁ (y = 2x − 1) con otra ordenada: paralelas.']
    ],FIG.rectas2,'r₁: y = 2x − 1 · r₂: y = −x + 5'),
    mc('El conjunto solución de x + y = 2 ; 2x + 2y = 4 es:',['S = {(t, 2 − t) / t ∈ ℝ}','S = {(1, 1)}','S = ∅','S = {(2, 0), (0, 2)}'],0,'La 2ª ecuación es el doble de la 1ª: queda una sola ecuación con 2 incógnitas ⇒ infinitas soluciones.'),
    mc('Si al escalonar la matriz ampliada aparece la fila [0 0 | 5], el sistema es:',['incompatible','compatible determinado','compatible indeterminado','homogéneo'],0,'Esa fila dice 0 = 5: imposible.'),
    mc('Según Rouché-Frobenius, si rg(A) = rg(A|B) = n (n = número de incógnitas), el sistema es:',['compatible determinado','compatible indeterminado','incompatible','homogéneo'],0,'Rangos iguales ⇒ compatible; igual al número de incógnitas ⇒ determinado.')
   ],
   examen:[
    op('Clasificá y resolvé: x + y + z = 6 · 2x − y + z = 3 · x + 2y − z = 2.','Compatible determinado · S = {(1, 2, 3)}','det(A) = 7 ≠ 0 ⇒ única solución. Por Gauss o Cramer: x = 1, y = 2, z = 3.'),
    op('Resolvé y escribí el conjunto solución: x + y + z = 2 · x + 2y + 3z = 5 · 2x + 3y + 4z = 7.','Compatible indeterminado · S = {(−1 + t, 3 − 2t, t) / t ∈ ℝ}','La 3ª ecuación es la suma de las otras dos: rg(A) = rg(A|B) = 2 &lt; 3. Restando: y + 2z = 3 ⇒ y = 3 − 2z; x = 2 − y − z = −1 + z.'),
    op('<b>Problema.</b> En un kiosco, 2 alfajores y 3 gaseosas cuestan $5100, y 4 alfajores y 1 gaseosa cuestan $4700. ¿Cuánto cuesta cada cosa?','Alfajor: $900 · Gaseosa: $1100','2a + 3g = 5100 ; 4a + g = 4700. De la 2ª: g = 4700 − 4a. Reemplazando: −10a = −9000 ⇒ a = 900, g = 1100. Verificación: 1800 + 3300 = 5100 ✓.'),
    op('Discutí según los valores de k: x + y = 1 · 2x + ky = 3.','k ≠ 2: compatible determinado · k = 2: incompatible','det = k − 2. Si k = 2 queda x + y = 1 y 2x + 2y = 3 (es decir x + y = 1,5): rectas paralelas.'),
    vfm('El gráfico muestra las tres rectas de un sistema de 3 ecuaciones con 2 incógnitas.',[
     ['El sistema formado por las tres ecuaciones es compatible',false,'No hay un punto común a las tres: se cortan de a dos formando un triángulo.'],
     ['El sistema formado solo por r₁ y r₂ tiene solución (2, 2)',true,'y = x y x + y = 4 ⇒ x = y = 2.'],
     ['rg(A) = 2 y rg(A|B) = 3',true,'Es la condición de incompatibilidad de Rouché-Frobenius.'],
     ['Si quitamos cualquiera de las tres rectas, queda un sistema compatible determinado',true,'Cada par de rectas se corta en un vértice del triángulo.']
    ],FIG.triangulo3)
   ],
   parcial:[
    op('Discutí según k y resolvé cuando sea compatible: x + y + kz = 1 · x + ky + z = 1 · kx + y + z = 1.','det(A) = −(k − 1)²(k + 2). k ≠ 1 y k ≠ −2: SCD con x = y = z = 1/(k + 2). k = 1: SCI (las 3 ecuaciones son x + y + z = 1, 2 parámetros). k = −2: incompatible.','Para k = −2, sumando las tres ecuaciones: 0 = 3. Para k ≠ 1, −2, por simetría x = y = z y (2 + k)x = 1.'),
    op('<b>Problema.</b> Un cine vendió 200 entradas: generales a $5000, de jubilado a $3000 y de estudiante a $4000. Recaudó $840 000 y vendió el doble de generales que de jubilado. ¿Cuántas de cada tipo vendió?','Generales: 80 · Jubilados: 40 · Estudiantes: 80','g + j + e = 200 ; 5000g + 3000j + 4000e = 840 000 ; g = 2j. Reemplazando g: e = 200 − 3j y 10 000j + 3000j + 4000(200 − 3j) = 840 000 ⇒ 1000j = 40 000 ⇒ j = 40.'),
    vfm('Al reducir la matriz ampliada de un sistema en x, y, z se obtuvo <span class="mono">[1 0 2 | 3 ; 0 1 −1 | 1 ; 0 0 0 | 0]</span>.',[
     ['El sistema es compatible indeterminado',true,'rg(A) = rg(A|B) = 2 &lt; 3 incógnitas.'],
     ['La solución general es (3 − 2t, 1 + t, t)',true,'x = 3 − 2z, y = 1 + z, con z = t libre.'],
     ['(3, 1, 0) es solución',true,'Es el caso t = 0.'],
     ['(1, 2, 1) es solución',true,'Es el caso t = 1.'],
     ['El sistema homogéneo asociado solo tiene la solución trivial',false,'Tiene las soluciones (−2t, t, t), infinitas.']
    ]),
    op('¿Para qué k el sistema homogéneo x + 2y = 0 · 3x + ky = 0 tiene soluciones no triviales? Escribí el conjunto solución para ese k.','k = 6 · S = {(−2t, t) / t ∈ ℝ}','det = k − 6 = 0. Con k = 6 las dos ecuaciones son proporcionales: x = −2y.'),
    mc('Un sistema compatible con más incógnitas que ecuaciones es siempre:',['compatible indeterminado','compatible determinado','incompatible','homogéneo'],0,'rg ≤ n.º de ecuaciones &lt; n.º de incógnitas ⇒ hay variables libres.'),
    vfm('El gráfico muestra las rectas de un sistema 2×2.',[
     ['El sistema es incompatible',true,'Rectas paralelas distintas: no tienen puntos en común.'],
     ['rg(A) = 1 y rg(A|B) = 2',true,'Las filas de coeficientes son proporcionales pero la ampliada no.'],
     ['El determinante de la matriz de coeficientes es distinto de 0',false,'Es 0: misma pendiente ⇒ filas proporcionales.'],
     ['Si los términos independientes fueran iguales, el sistema tendría infinitas soluciones',true,'Las rectas coincidirían.']
    ],FIG.paralelas)
   ]
  }},

 tl:{id:'tl',titulo:'Transformaciones lineales',pre:'Necesitás: <b>vectores</b> y <b>producto de matrices</b>',desc:'Definición, matriz asociada, núcleo e imagen, transformaciones del plano (rotación, simetría, estiramiento, corte), composición e inversa.',
  exams:{
   basico:[
    mc('T es una transformación lineal si cumple:',['T(u + v) = T(u) + T(v) y T(k·u) = k·T(u)','T(u) = u','T(u·v) = T(u)·T(v)','T(0) = 1'],0,'Respeta la suma y el producto por escalar.'),
    mc('Para toda transformación lineal, T(0) es:',['el vector nulo','1','cualquier vector','no está definido'],0,'T(0) = T(0·u) = 0·T(u) = 0.'),
    mc('Si T(x, y) = (2x, 3y), entonces T(1, −1) es:',['(2, −3)','(2, 3)','(−2, 3)','(1, −1)'],0,'x = 1, y = −1.'),
    mc('La matriz asociada a T(x, y) = (x + y, x − y) es:',['[1 1 ; 1 −1]','[1 −1 ; 1 1]','[1 1 ; −1 1]','[2 0 ; 0 0]'],0,'Cada fila tiene los coeficientes de una componente.')
   ],
   normal:[
    mc('¿Cuál NO es lineal?',['T(x, y) = (x + 1, y)','T(x, y) = (y, x)','T(x, y) = (3x, 0)','T(x, y) = (x − y, 2y)'],0,'T(0, 0) = (1, 0) ≠ (0, 0). El "+1" la rompe.'),
    mc('T(x, y) = (−x, y) es:',['la simetría respecto del eje y','la simetría respecto del eje x','una rotación de 90°','una homotecia'],0,'Cambia el signo de la x: refleja de un lado al otro del eje y.'),
    mc('El núcleo de T(x, y) = (x − y, 2x − 2y) es:',['{(t, t) / t ∈ ℝ}','{(0, 0)}','ℝ²','{(t, −t)}'],0,'x − y = 0 ⇒ x = y.'),
    vfm('El cuadrado Q (verde) se transformó en T(Q) (rojo).',[
     ['T estira el doble en la dirección del eje x',true,'El ancho pasa de 1 a 2; la altura queda igual.'],
     ['La matriz de T es [2 0 ; 0 1]',true,'T(1, 0) = (2, 0) y T(0, 1) = (0, 1) son las columnas.'],
     ['El área se duplica',true,'|det| = 2 es el factor de escala de las áreas.'],
     ['T es una rotación',false,'Las rotaciones no cambian longitudes ni áreas.']
    ],FIG.estiramiento)
   ],
   examen:[
    op('Hallá la matriz de T: ℝ³ → ℝ², T(x, y, z) = (x + 2y, y − z) y calculá T(1, 1, 1).','[T] = [1 2 0 ; 0 1 −1] (2 × 3) · T(1, 1, 1) = (3, 0)','La matriz es 2 × 3: tantas filas como componentes de la imagen y tantas columnas como del dominio.'),
    op('Demostrá que T(x, y) = (x², y) no es lineal.','T(2·(1, 0)) = T(2, 0) = (4, 0), pero 2·T(1, 0) = (2, 0). No respeta el producto por escalar.','Alcanza con un contraejemplo.'),
    op('T es lineal con T(1, 0) = (3, 1) y T(0, 1) = (−1, 2). Hallá T(x, y) y T(2, 5).','T(x, y) = (3x − y, x + 2y) · T(2, 5) = (1, 12)','(x, y) = x(1, 0) + y(0, 1) ⇒ T(x, y) = x·(3, 1) + y·(−1, 2).'),
    op('Hallá núcleo e imagen de T(x, y, z) = (x + y, y + z), con sus dimensiones.','Nu(T) = {(t, −t, t)}, dim 1 · Im(T) = ℝ², dim 2','x + y = 0 e y + z = 0 ⇒ (t, −t, t). Teorema de las dimensiones: 1 + 2 = 3 = dim ℝ³ ✓.'),
    vfm('El gráfico muestra u = (2, 1) y su imagen T(u) por una transformación lineal del plano.',[
     ['T podría ser la rotación de 90° antihoraria',true,'Rotar (2, 1) 90° antihorario da (−1, 2).'],
     ['Si es esa rotación, su matriz es [0 −1 ; 1 0]',true,'Manda (1, 0) a (0, 1) y (0, 1) a (−1, 0).'],
     ['‖T(u)‖ = ‖u‖',true,'Ambos miden √5: las rotaciones conservan la norma.'],
     ['El determinante de una rotación es −1',false,'Es 1 (cos² + sen²). Det −1 corresponde a las simetrías.']
    ],FIG.rotacion)
   ],
   parcial:[
    op('Sean S(x, y) = (x + y, y) y T(x, y) = (2x, x − y). Hallá la matriz de T∘S y la fórmula de (T∘S)(x, y).','[T∘S] = [T]·[S] = [2 0 ; 1 −1]·[1 1 ; 0 1] = [2 2 ; 1 0] · (T∘S)(x, y) = (2x + 2y, x)','Primero se aplica S y después T, por eso [T] va a la izquierda. Verificación: T(x + y, y) = (2x + 2y, x).'),
    op('Probá que T(x, y) = (2x + y, x + y) es inversible y hallá T⁻¹.','det = 1 ≠ 0 · T⁻¹(x, y) = (x − y, −x + 2y)','[T]⁻¹ = [1 −1 ; −1 2]. Verificación: T(x − y, −x + 2y) = (2x − 2y − x + 2y, x − y − x + 2y) = (x, y) ✓.'),
    vfm('El triángulo verde se transformó en el rojo mediante T(x, y) = (x + y, y).',[
     ['T conserva el área',true,'det[1 1 ; 0 1] = 1.'],
     ['T(0, 2) = (2, 2)',true,'(0 + 2, 2).'],
     ['Los puntos del eje x quedan fijos',true,'T(x, 0) = (x, 0).'],
     ['T es inyectiva',true,'det ≠ 0 ⇒ núcleo = {0}.'],
     ['T es una homotecia (agrandamiento uniforme)',false,'Es un corte o "cizalla": desliza cada punto horizontalmente según su altura.']
    ],FIG.corte),
    op('<b>Aplicación.</b> Una planta fabrica x, y, z unidades de tres productos. T(x, y, z) = (2x + y + 3z, x + 4y + z) da (horas de máquina, kg de material). a) Escribí la matriz de T. b) ¿Qué recursos usa la producción (10, 5, 2)? c) ¿Es T inyectiva?','a) [2 1 3 ; 1 4 1] · b) (31 h, 32 kg) · c) No: va de ℝ³ a ℝ², así que su núcleo tiene dimensión ≥ 1','b) (20 + 5 + 6, 10 + 20 + 2). c) dim Nu = 3 − dim Im ≥ 3 − 2 = 1.'),
    mc('Si T: ℝ⁴ → ℝ³ es lineal y dim Nu(T) = 2, entonces dim Im(T) es:',['2','1','3','4'],0,'dim Nu + dim Im = dim del dominio = 4.'),
    vf('Toda transformación lineal T: ℝ² → ℝ² cuya matriz tiene determinante ≠ 0 es biyectiva.',true,'det ≠ 0 ⇒ la matriz es invertible ⇒ T tiene inversa.')
   ]
  }},

 pot:{id:'pot',titulo:'Conjunto potencia, cardinalidad y numerabilidad',pre:'Necesitás: <b>subconjuntos</b> y <b>cardinal</b>',desc:'P(A) y su cardinal 2ⁿ, conjuntos finitos e infinitos, numerables (ℕ, ℤ, ℚ) y no numerables (ℝ), biyecciones.',
  exams:{
   basico:[
    mc('Si A = {a, b}, entonces P(A) es:',['{∅, {a}, {b}, {a, b}}','{a, b}','{{a}, {b}}','{∅, a, b}'],0,'P(A) tiene todos los subconjuntos, incluidos ∅ y A.'),
    mc('Si #A = 3, entonces #P(A) es:',['8','6','9','3'],0,'#P(A) = 2³ = 8.'),
    mc('El conjunto vacío, ¿es elemento de P(A)?',['Sí, siempre','Solo si A = ∅','Nunca','Depende de A'],0,'∅ es subconjunto de cualquier A, así que ∅ ∈ P(A).'),
    mc('ℕ es un conjunto:',['infinito numerable','finito','infinito no numerable','vacío'],0,'Es el modelo de los numerables: se puede "contar" 0, 1, 2, …')
   ],
   normal:[
    mc('#P(∅) es:',['1','0','2','no existe'],0,'P(∅) = {∅}: tiene un elemento.'),
    mc('Si #A = 5, ¿cuántos subconjuntos propios (distintos de A) tiene?',['31','32','25','5'],0,'2⁵ − 1 = 31.'),
    mc('¿Cuál de estos conjuntos NO es numerable?',['ℝ','ℤ','ℚ','los números pares'],0,'Cantor probó que ℝ no se puede listar.'),
    mc('ℤ es numerable porque:',['se puede listar 0, 1, −1, 2, −2, … (hay una biyección con ℕ)','es finito','está incluido en ℝ','no tiene primer elemento'],0,'Numerable = en biyección con ℕ.'),
    vf('ℚ tiene "más" elementos que ℕ, porque entre dos naturales hay infinitos racionales.',false,'Ambos son numerables: tienen el mismo cardinal (ℵ₀). La intuición falla con los infinitos.')
   ],
   examen:[
    op('Hallá P(A) para A = {1, {2}, 3}.','P(A) = {∅, {1}, {{2}}, {3}, {1, {2}}, {1, 3}, {{2}, 3}, {1, {2}, 3}}','Son 2³ = 8 subconjuntos. Ojo: {2} es UN elemento, así que el subconjunto que lo contiene es {{2}}.'),
    op('Si #P(A) = 64, ¿cuántos elementos tiene A?','#A = 6','2ⁿ = 64 ⇒ n = 6.'),
    op('Dá una biyección f: ℕ → P, donde P es el conjunto de los naturales pares.','f(n) = 2n','Es inyectiva (2n = 2m ⇒ n = m) y sobreyectiva (todo par 2k es f(k)).'),
    op('Dá una biyección f: ℕ → ℤ.','f(n) = n/2 si n es par · f(n) = −(n + 1)/2 si n es impar','f(0) = 0, f(1) = −1, f(2) = 1, f(3) = −2, f(4) = 2, … recorre todo ℤ sin repetir.'),
    vfm('Sea A = {1, 2}.',[
     ['{1} ∈ P(A)',true,'{1} es un subconjunto de A.'],
     ['1 ∈ P(A)',false,'Los elementos de P(A) son conjuntos; 1 no es un subconjunto de A.'],
     ['{∅} ⊂ P(A)',true,'Su único elemento, ∅, pertenece a P(A).'],
     ['#P(P(A)) = 16',true,'#P(A) = 4 ⇒ #P(P(A)) = 2⁴ = 16.']
    ])
   ],
   parcial:[
    vfm('Numerabilidad: decidí V o F.',[
     ['El intervalo (0, 1) es numerable',false,'Tiene el mismo cardinal que ℝ (argumento diagonal de Cantor).'],
     ['ℕ × ℕ es numerable',true,'Se recorre por diagonales: (0,0), (0,1), (1,0), (0,2), …'],
     ['La unión de dos conjuntos numerables es numerable',true,'Se intercalan las dos listas.'],
     ['#P(ℕ) = #ℕ',false,'Teorema de Cantor: #P(A) &gt; #A siempre, incluso si A es infinito.'],
     ['Todo subconjunto infinito de ℕ es numerable',true,'Se listan sus elementos en orden creciente.'],
     ['El conjunto de los irracionales es numerable',false,'Si lo fuera, ℝ = ℚ ∪ 𝕀 sería numerable.']
    ]),
    op('Sean A = {x ∈ ℤ / x² ≤ 1} y B = {0, 1}. Calculá #P(A × B).','#P(A × B) = 2⁶ = 64','A = {−1, 0, 1}, así que #(A × B) = 3·2 = 6.'),
    op('Si #A = 4, ¿cuántos elementos de P(A) tienen exactamente 2 elementos? ¿Y cuántos tienen a lo sumo 1?','Exactamente 2: 6 · A lo sumo 1: 5','Pares posibles: C(4,2) = 6. A lo sumo 1: el vacío más los 4 unitarios.'),
    mc('Ordenados de menor a mayor cardinal:',['ℕ = ℤ = ℚ &lt; ℝ &lt; P(ℝ)','ℕ &lt; ℤ &lt; ℚ &lt; ℝ','ℕ &lt; ℚ = ℝ &lt; P(ℝ)','todos tienen el mismo cardinal'],0,'Los tres primeros son numerables; ℝ no lo es; y P(ℝ) supera a ℝ por Cantor.'),
    op('Explicá por qué #P(A) = 2ⁿ si #A = n.','Para armar un subconjunto, cada uno de los n elementos tiene 2 opciones: entra o no entra. Por el principio de multiplicación hay 2·2·…·2 = 2ⁿ subconjuntos.','Incluye el caso "no entra ninguno" (∅) y "entran todos" (A).')
   ]
  }},

 rel:{id:'rel',titulo:'Relaciones: representaciones y propiedades',pre:'Necesitás: <b>producto cartesiano</b>',desc:'Relación como subconjunto de A × B, dominio e imagen, relación inversa, grafo, matriz, propiedades (reflexiva, simétrica, antisimétrica, transitiva), equivalencia y orden.',
  exams:{
   basico:[
    mc('Una relación de A en B es:',['un subconjunto de A × B','un elemento de A','una función','la unión de A y B'],0,'Se eligen algunos pares de A × B.'),
    mc('Si R = {(1, 2), (2, 3)}, el dominio de R es:',['{1, 2}','{2, 3}','{1, 2, 3}','{1, 3}'],0,'Las primeras componentes.'),
    mc('R es reflexiva en A si:',['(a, a) ∈ R para todo a ∈ A','(a, b) ∈ R ⇒ (b, a) ∈ R','R = A × A','R = ∅'],0,'Cada elemento está relacionado consigo mismo (bucle en cada nodo).'),
    mc('La relación inversa de R = {(1, 2), (3, 4)} es:',['{(2, 1), (4, 3)}','{(1, 2), (3, 4)}','{(1, 3), (2, 4)}','{(4, 3), (2, 1), (1, 1)}'],0,'Se dan vuelta los pares.')
   ],
   normal:[
    vfm('El grafo representa una relación R en A = {1, 2, 3} (un círculo pegado a un nodo es un bucle).',[
     ['R es reflexiva',true,'Hay bucle en 1, 2 y 3.'],
     ['R es simétrica',true,'La única flecha entre nodos distintos va y vuelve (1 ↔ 2).'],
     ['R es transitiva',true,'1→2→1 exige 1→1 (está); 2→1→2 exige 2→2 (está).'],
     ['R es de equivalencia',true,'Es reflexiva, simétrica y transitiva.'],
     ['Las clases de equivalencia son {1, 2} y {3}',true,'1 y 2 están relacionados entre sí; 3 solo consigo mismo.']
    ],G.digraph({nodes:[1,2,3],edges:[[1,1],[2,2],[3,3],[1,2],[2,1]]})),
    mc('En ℤ, la relación x R y ⇔ x ≤ y es:',['reflexiva, antisimétrica y transitiva (de orden)','de equivalencia','simétrica','solo reflexiva'],0,'x ≤ x; si x ≤ y e y ≤ x entonces x = y; x ≤ y ≤ z ⇒ x ≤ z.'),
    mc('La relación "x es hermano de y" (en un grupo de personas) es:',['simétrica pero no reflexiva','reflexiva','de equivalencia','antisimétrica'],0,'Si x es hermano de y, y lo es de x. Pero nadie es hermano de sí mismo.'),
    mc('R = {(1, 2), (2, 3)} en {1, 2, 3} no es transitiva porque:',['falta (1, 3)','falta (2, 1)','falta (1, 1)','sobra (2, 3)'],0,'1 R 2 y 2 R 3 obligarían a 1 R 3.')
   ],
   examen:[
    op('En A = {1, 2, 3, 4} se define x R y ⇔ x + y es par. Escribí R por extensión, estudiá sus propiedades y, si es de equivalencia, dá las clases.','R = {(1,1), (1,3), (3,1), (3,3), (2,2), (2,4), (4,2), (4,4)} · Es de equivalencia · Clases: {1, 3} y {2, 4}','x + y es par ⇔ x e y tienen la misma paridad. Reflexiva (x + x = 2x), simétrica y transitiva.'),
    vfm('El grafo muestra una relación R en {a, b, c}.',[
     ['R es reflexiva',false,'Solo a tiene bucle.'],
     ['R es antisimétrica',true,'No hay ningún par de flechas de ida y vuelta entre nodos distintos.'],
     ['R es transitiva',true,'a→b→c y está a→c; a→a→b y a→a→c están; no hay otros caminos.'],
     ['R es simétrica',false,'Está (a, b) pero no (b, a).']
    ],G.digraph({nodes:['a','b','c'],edges:[['a','a'],['a','b'],['b','c'],['a','c']]})),
    op('Escribí la matriz de la relación R = {(1, 1), (1, 2), (2, 3), (3, 1)} en A = {1, 2, 3} y decidí si es reflexiva y si es simétrica.','M = [1 1 0 ; 0 0 1 ; 1 0 0] · No es reflexiva (hay ceros en la diagonal) · No es simétrica (M ≠ Mᵀ)','Reflexiva ⇔ diagonal de unos. Simétrica ⇔ la matriz es simétrica.'),
    mc('En ℤ, x R y ⇔ x − y es múltiplo de 3. ¿Cuántas clases de equivalencia hay?',['3','infinitas','1','2'],0,'Las clases son los restos posibles al dividir por 3: [0], [1], [2].'),
    op('Dada la relación del diagrama sagital (de A en B), dá su dominio, su imagen y R⁻¹.','Dom R = {1, 2} · Im R = {a, c} · R⁻¹ = {(a, 1), (c, 1), (c, 2)}','3 no tiene flechas, por eso no está en el dominio; b no recibe flechas.',G.sagital({A:[1,2,3],B:['a','b','c'],pairs:[[1,'a'],[1,'c'],[2,'c']],name:'R'}))
   ],
   parcial:[
    vfm('El grafo muestra una relación R en A = {1, 2, 3, 4}.',[
     ['R es reflexiva',true,'Los 4 nodos tienen bucle.'],
     ['R es simétrica',true,'Las flechas 1↔2 y 2↔3 van y vuelven.'],
     ['R es transitiva',false,'1 R 2 y 2 R 3, pero no 1 R 3.'],
     ['R es de equivalencia',false,'Falla la transitividad.'],
     ['Agregando (1, 3) y (3, 1), R pasa a ser de equivalencia, con clases {1, 2, 3} y {4}',true,'Quedan relacionados todos los pares dentro de {1, 2, 3} y el 4 solo consigo.']
    ],G.digraph({nodes:[1,2,3,4],edges:[[1,1],[2,2],[3,3],[4,4],[1,2],[2,1],[2,3],[3,2]],w:300,h:270})),
    op('En ℤ se define a R b ⇔ a² = b². Probá que es de equivalencia y dá las clases de 3 y de 0.','Reflexiva: a² = a². Simétrica: a² = b² ⇒ b² = a². Transitiva: a² = b² y b² = c² ⇒ a² = c². · [3] = {3, −3} · [0] = {0}','Cada clase es {a, −a}; la del 0 es unitaria.'),
    op('Estudiá la relación "x divide a y" en ℕ − {0} y en ℤ − {0}.','En ℕ − {0}: reflexiva, antisimétrica y transitiva ⇒ orden parcial. En ℤ − {0} NO es antisimétrica: 2 | −2 y −2 | 2 pero 2 ≠ −2.','Es parcial porque hay elementos no comparables (ni 2 | 3 ni 3 | 2).'),
    op('La matriz de una relación en {a, b, c} es [1 0 1 ; 0 1 0 ; 1 0 1]. ¿Es de equivalencia? Si lo es, dá las clases.','Sí. Clases: {a, c} y {b}','Diagonal de unos (reflexiva), matriz simétrica (simétrica) y transitiva: a~c y c~a dan a~a, que está.'),
    mc('Si #A = 2 y #B = 3, ¿cuántas relaciones distintas de A en B existen?',['64','6','8','9'],0,'Son los subconjuntos de A × B, que tiene 6 pares: 2⁶ = 64.'),
    vfm('Diagrama sagital de una relación R de A en B.',[
     ['R es función de A en B',false,'2 tiene dos imágenes (x e y).'],
     ['Dom R = A',false,'3 no tiene flecha: Dom R = {1, 2}.'],
     ['Im R = {x, y}',true,'Son los elementos de B que reciben flechas.'],
     ['R⁻¹ es función de Im R en A',false,'x recibe flechas de 1 y de 2, así que en R⁻¹ tendría dos imágenes.']
    ],G.sagital({A:[1,2,3],B:['x','y','z'],pairs:[[1,'x'],[2,'x'],[2,'y']],name:'R'}))
   ]
  }},

 fun:{id:'fun',titulo:'Funciones: tipos, composición, inversa y gráficas',pre:'Necesitás: <b>relaciones</b> y el plano cartesiano',desc:'Función como relación especial, dominio e imagen, inyectiva, sobreyectiva y biyectiva, composición, inversa, lectura de gráficos y puntos de intersección.',
  exams:{
   basico:[
    mc('Una relación de A en B es función si:',['cada elemento de A tiene exactamente una imagen en B','cada elemento de B tiene una preimagen','es simétrica','A = B'],0,'Existencia y unicidad de la imagen.'),
    vf('El diagrama sagital representa una función de A en B.',false,'El 1 tiene dos imágenes (a y b): falla la unicidad.',G.sagital({A:[1,2,3],B:['a','b','c'],pairs:[[1,'a'],[1,'b'],[2,'c'],[3,'c']],name:'f'})),
    mc('Si f(x) = 2x + 1, entonces f(3) es:',['7','6','5','9'],0,'2·3 + 1.'),
    mc('Una función es inyectiva si:',['elementos distintos tienen imágenes distintas','todo elemento de B tiene preimagen','es una recta','es creciente'],0,'x₁ ≠ x₂ ⇒ f(x₁) ≠ f(x₂).')
   ],
   normal:[
    vfm('Diagrama sagital de f: A → B.',[
     ['f es función',true,'Cada elemento de A tiene una sola flecha.'],
     ['f es inyectiva',false,'2 y 3 van a la misma imagen b.'],
     ['f es sobreyectiva',false,'c y d no reciben flechas.'],
     ['Im f = {a, b}',true,'Son las imágenes efectivamente alcanzadas.']
    ],G.sagital({A:[1,2,3],B:['a','b','c','d'],pairs:[[1,'a'],[2,'b'],[3,'b']],name:'f'})),
    mc('Si f(x) = x² y g(x) = x + 1, entonces (f∘g)(x) es:',['(x + 1)²','x² + 1','x² + x','2x + 1'],0,'f∘g = f(g(x)): primero g, después f.'),
    mc('La inversa de f(x) = 3x − 6 es:',['f⁻¹(x) = (x + 6)/3','f⁻¹(x) = 3x + 6','f⁻¹(x) = 1/(3x − 6)','f⁻¹(x) = x/3 − 6'],0,'y = 3x − 6 ⇒ x = (y + 6)/3.'),
    vfm('Gráfico de f(x) = x² − 4.',[
     ['Corta al eje x en x = −2 y x = 2',true,'x² − 4 = 0 ⇒ x = ±2.'],
     ['f es inyectiva en ℝ',false,'f(−2) = f(2) = 0: una recta horizontal la corta dos veces.'],
     ['f(0) = −4',true,'Es la ordenada al origen (el vértice).'],
     ['Im f = [−4, +∞)',true,'El mínimo es −4 y la parábola crece sin tope.']
    ],FIG.parabola),
    mc('El punto de intersección de y = x + 1 e y = −x + 3 es:',['(1, 2)','(2, 1)','(0, 1)','(3, 0)'],0,'x + 1 = −x + 3 ⇒ x = 1, y = 2.')
   ],
   examen:[
    op('Con f(x) = 2x − 3 y g(x) = x² + 1, hallá f∘g, g∘f y (f∘g)(2).','f∘g = 2x² − 1 · g∘f = 4x² − 12x + 10 · (f∘g)(2) = 7','f(g(x)) = 2(x² + 1) − 3. g(f(x)) = (2x − 3)² + 1. Fijate que f∘g ≠ g∘f.'),
    op('Hallá los puntos de intersección de f(x) = x² − 2x y g(x) = x + 4.','(−1, 3) y (4, 8)','x² − 2x = x + 4 ⇒ x² − 3x − 4 = 0 ⇒ (x − 4)(x + 1) = 0. Reemplazás en g para la ordenada.'),
    vfm('Gráfico de f(x) = x² − 2x (rojo) y g(x) = x + 4 (azul).',[
     ['Las gráficas se cortan en (−1, 3) y (4, 8)',true,'Son los puntos A y B.'],
     ['f(x) &gt; g(x) para todo x entre −1 y 4',false,'Entre los cortes la recta está por encima de la parábola: g(x) &gt; f(x).'],
     ['El vértice de f es (1, −1)',true,'x = −b/(2a) = 1 y f(1) = −1.'],
     ['La ecuación f(x) = g(x) tiene 3 soluciones',false,'Tiene 2: las abscisas de A y B.']
    ],FIG.parRecta),
    op('¿Es f: ℝ → ℝ, f(x) = x³ + 1 biyectiva? Si lo es, hallá f⁻¹.','Sí · f⁻¹(x) = ∛(x − 1)','Es estrictamente creciente (inyectiva) y su imagen es ℝ (sobreyectiva).'),
    vfm('Gráfico de f(x) = x³ − 3x, con su máximo y su mínimo relativos marcados; la línea punteada es y = 1.',[
     ['f es inyectiva',false,'La recta punteada y = 1 corta la gráfica 3 veces.'],
     ['f: ℝ → ℝ es sobreyectiva',true,'Va de −∞ a +∞ sin saltos: alcanza todos los valores.'],
     ['La ecuación f(x) = 1 tiene 3 soluciones',true,'1 está entre el mínimo −2 y el máximo 2.'],
     ['La ecuación f(x) = 3 tiene 3 soluciones',false,'3 &gt; 2 (máximo relativo): una sola solución.']
    ],FIG.cubica)
   ],
   parcial:[
    vfm('Gráfico de la función a trozos f(x) = x² si x ≤ 1 · f(x) = x + 2 si x &gt; 1 (el punto vacío no pertenece).',[
     ['f(1) = 3',false,'Para x = 1 vale la primera fórmula: f(1) = 1. El punto (1, 3) está vacío.'],
     ['f es inyectiva',false,'f(−1) = f(1) = 1.'],
     ['Im f = [0, +∞)',true,'x² con x ≤ 1 ya cubre [0, +∞).'],
     ['f(x) = 2 tiene exactamente una solución',true,'x² = 2 con x ≤ 1 ⇒ x = −√2; x + 2 = 2 da x = 0, que no es &gt; 1.'],
     ['f(x) = 4 tiene dos soluciones',true,'x = −2 (primera rama) y x = 2 (segunda rama).']
    ],FIG.aTrozos),
    op('f: ℝ − {2} → ℝ − {1}, f(x) = (x + 1)/(x − 2). Probá que es biyectiva y hallá f⁻¹.','f⁻¹(x) = (2x + 1)/(x − 1)','y = (x + 1)/(x − 2) ⇒ yx − 2y = x + 1 ⇒ x(y − 1) = 2y + 1 ⇒ x = (2y + 1)/(y − 1). Hay una única preimagen para cada y ≠ 1: es biyectiva.'),
    vfm('<b>Problema.</b> Una emprendedora tiene costo C(x) = 500 + 20x e ingreso I(x) = 45x (en miles de $, x = unidades). El gráfico muestra ambas rectas.',[
     ['Para x &lt; 20 hay pérdida',true,'A la izquierda de E la recta del costo está por encima del ingreso.'],
     ['El punto de equilibrio es (20, 900)',true,'45x = 500 + 20x ⇒ x = 20; I(20) = 900.'],
     ['El costo fijo es 20',false,'El costo fijo es 500 (ordenada al origen de C); 20 es el costo por unidad.'],
     ['Con 30 unidades la ganancia es 250',true,'I(30) − C(30) = 1350 − 1100 = 250.']
    ],FIG.equilibrio),
    op('Sean f(x) = √(x − 1) y g(x) = x² + 1. Hallá f∘g y g∘f con sus dominios.','f∘g(x) = √(x²) = |x|, Dom = ℝ · g∘f(x) = x, Dom = [1, +∞)','Para g∘f primero tiene que existir f(x), o sea x ≥ 1. Por eso, aunque la fórmula sea "x", el dominio es [1, +∞).'),
    mc('Si f: A → B es inyectiva y #A = 5, entonces necesariamente:',['#B ≥ 5','#B = 5','#B ≤ 5','#B = 10'],0,'Elementos distintos van a imágenes distintas: hacen falta al menos 5 en B.'),
    vf('La circunferencia del gráfico (x² + y² = 4) es la gráfica de una función y = f(x).',false,'La recta vertical x = 1 la corta en dos puntos: un mismo x tendría dos imágenes.',FIG.circ)
   ]
  }},

 mod:{id:'mod',titulo:'Aritmética modular y congruencias',pre:'Necesitás: <b>división entera</b> y <b>relaciones de equivalencia</b>',desc:'Resto y operación mod n, congruencia a ≡ b (mod n), clases de restos, propiedades, potencias, inverso modular y ecuaciones lineales de congruencia.',
  exams:{
   basico:[
    mc('17 mod 5 es:',['2','3','12','5'],0,'17 = 5·3 + 2.'),
    mc('¿Con qué número entre 0 y 6 es congruente 23 módulo 7?',['2','3','6','1'],0,'23 = 7·3 + 2.'),
    mc('a ≡ b (mod n) significa que:',['n divide a a − b','a = b','a·b es múltiplo de n','a + b = n'],0,'Es lo mismo que decir que a y b dejan el mismo resto al dividir por n.'),
    mc('Son las 10 en punto. ¿Qué hora marcará el reloj (de 12 horas) dentro de 5 horas?',['3','15','5','4'],0,'10 + 5 = 15 ≡ 3 (mod 12).',G.reloj({m:12,from:10,steps:5,mark:[10,3]}))
   ],
   normal:[
    mc('(−7) mod 3 es:',['2','−1','1','0'],0,'−7 = 3·(−3) + 2. El resto siempre está entre 0 y n − 1.'),
    mc('(15 + 28) mod 6 es:',['1','43','7','5'],0,'15 ≡ 3 y 28 ≡ 4, y 3 + 4 = 7 ≡ 1 (mod 6).'),
    mc('El inverso de 3 módulo 10 es:',['7','3','1/3','no tiene'],0,'3·7 = 21 ≡ 1 (mod 10).'),
    mc('Hoy es lunes. ¿Qué día será dentro de 100 días?',['miércoles','martes','lunes','jueves'],0,'100 = 7·14 + 2 ⇒ 2 días después del lunes.'),
    vf('38 ≡ 14 (mod 12)',true,'38 − 14 = 24 = 12·2.')
   ],
   examen:[
    op('Calculá 2¹⁰ mod 7.','2¹⁰ ≡ 2 (mod 7)','2³ = 8 ≡ 1 (mod 7) ⇒ 2⁹ = (2³)³ ≡ 1 ⇒ 2¹⁰ = 2⁹·2 ≡ 2.'),
    op('Resolvé 3x ≡ 4 (mod 7).','x ≡ 6 (mod 7)','El inverso de 3 mod 7 es 5 (3·5 = 15 ≡ 1). x ≡ 5·4 = 20 ≡ 6. Verificación: 3·6 = 18 ≡ 4 ✓.'),
    op('¿Cuál es la última cifra de 7²⁰²⁶?','9','Las potencias de 7 mod 10 se repiten cada 4: 7, 9, 3, 1. Como 2026 ≡ 2 (mod 4), la cifra es la segunda del ciclo: 9.'),
    vfm('Congruencias: decidí V o F.',[
     ['La congruencia módulo 4 divide a ℤ en 4 clases',true,'[0], [1], [2], [3].'],
     ['−1 y 3 están en la misma clase módulo 4',true,'3 − (−1) = 4.'],
     ['La congruencia módulo n es una relación de equivalencia',true,'Es reflexiva, simétrica y transitiva.'],
     ['6 ≡ 2 (mod 4) y también 6 ≡ 2 (mod 3)',false,'6 − 2 = 4 es múltiplo de 4 pero no de 3.']
    ]),
    op('Hallá el resto de dividir 123 456 por 9 sin hacer la división.','Resto 3','10 ≡ 1 (mod 9), así que un número es congruente a la suma de sus cifras: 1 + 2 + 3 + 4 + 5 + 6 = 21 ≡ 3.')
   ],
   parcial:[
    op('Resolvé 4x ≡ 6 (mod 10).','x ≡ 4 (mod 5), o sea x ≡ 4 o x ≡ 9 (mod 10)','mcd(4, 10) = 2 divide a 6 ⇒ hay solución. Dividiendo todo por 2: 2x ≡ 3 (mod 5). El inverso de 2 mod 5 es 3 ⇒ x ≡ 9 ≡ 4 (mod 5). Verificación: 4·4 = 16 ≡ 6 ✓ y 4·9 = 36 ≡ 6 ✓.'),
    op('¿Tiene solución 5x ≡ 3 (mod 15)? Justificá.','No','5x siempre es múltiplo de 5, y los múltiplos de 5 mod 15 son 0, 5 y 10. Formalmente: mcd(5, 15) = 5 no divide a 3.'),
    op('Calculá 3¹⁰⁰ mod 5.','3¹⁰⁰ ≡ 1 (mod 5)','3⁴ = 81 ≡ 1 (mod 5) ⇒ 3¹⁰⁰ = (3⁴)²⁵ ≡ 1.'),
    vfm('El reloj muestra un recorrido que arranca en 9 y avanza 50 lugares (módulo 12).',[
     ['Se termina en el 11',true,'9 + 50 = 59 = 12·4 + 11.'],
     ['50 ≡ 2 (mod 12)',true,'50 = 12·4 + 2.'],
     ['Avanzar 24 lugares deja la aguja en el mismo número',true,'24 ≡ 0 (mod 12).'],
     ['7 tiene inverso multiplicativo módulo 12',true,'7·7 = 49 ≡ 1 (mod 12). Existe porque mcd(7, 12) = 1.'],
     ['6 tiene inverso multiplicativo módulo 12',false,'mcd(6, 12) = 6 ≠ 1: 6·k mod 12 solo da 0 o 6.']
    ],G.reloj({m:12,from:9,steps:50,mark:[9,11]})),
    op('Hoy es miércoles. ¿Qué día de la semana será dentro de 1000 días?','Martes','1000 = 7·142 + 6 ⇒ 6 días después del miércoles.'),
    op('Hallá los inversos multiplicativos de todos los elementos no nulos módulo 5.','1⁻¹ = 1 · 2⁻¹ = 3 · 3⁻¹ = 2 · 4⁻¹ = 4','2·3 = 6 ≡ 1; 4·4 = 16 ≡ 1. Como 5 es primo, todos tienen inverso.')
   ]
  }},

 num:{id:'num',titulo:'Sistemas de numeración',pre:'Necesitás: <b>potencias</b> y <b>división entera</b>',desc:'Bases 2, 8, 10 y 16 (y cualquier base b), conversión entre bases y comparación de números escritos en bases distintas.',
  exams:{
   basico:[
    mc('1011₂ en base 10 es:',['11','13','1011','9'],0,'1·8 + 0·4 + 1·2 + 1·1 = 11.'),
    mc('25 en binario es:',['11001','10101','11010','10011'],0,'25 = 16 + 8 + 1.'),
    mc('El dígito hexadecimal F vale:',['15','16','14','6'],0,'A = 10, …, F = 15.'),
    mc('En base 8 los dígitos permitidos son:',['0 a 7','1 a 8','0 a 8','0 a 9'],0,'En base b hay b dígitos: de 0 a b − 1.')
   ],
   normal:[
    mc('2F₁₆ en base 10 es:',['47','32','215','45'],0,'2·16 + 15 = 47.'),
    mc('157₈ en base 10 es:',['111','157','87','103'],0,'1·64 + 5·8 + 7 = 111.'),
    mc('11010110₂ en hexadecimal es:',['D6','6D','C6','D5'],0,'Agrupando de a 4: 1101 = D, 0110 = 6.'),
    mc('111 en hexadecimal es:',['6F','6E','F6','7F'],0,'111 = 16·6 + 15.')
   ],
   examen:[
    op('Pasá 345₆ a base 10 y después a base 5.','345₆ = 137 = 1022₅','3·36 + 4·6 + 5 = 137. Divisiones sucesivas por 5: 137 → resto 2, 27 → 2, 5 → 0, 1 → 1. Se leen de abajo hacia arriba.'),
    op('Sumá en binario 1011₂ + 0110₂.','10001₂','En decimal: 11 + 6 = 17 = 16 + 1.'),
    op('Pasá 3A7₁₆ a binario y a octal.','11 1010 0111₂ = 1647₈','Cada dígito hex son 4 bits; después se reagrupa de a 3 desde la derecha: 1 110 100 111.')
   ],
   parcial:[
    vfm('Decidí V o F.',[
     ['101₂ &lt; 6₁₀',true,'101₂ = 5.'],
     ['FF₁₆ = 255',true,'15·16 + 15.'],
     ['777₈ = 511',true,'7·64 + 7·8 + 7 = 511 = 8³ − 1.'],
     ['Todo número binario terminado en 0 es par',true,'El último dígito es el coeficiente de 2⁰.'],
     ['En base 7 existe el dígito 7',false,'Los dígitos van de 0 a 6.']
    ]),
    op('Hallá la base b en la que 23_b = 17 (en decimal).','b = 7','2b + 3 = 17 ⇒ b = 7.'),
    op('Ordená de menor a mayor: 110110₂ · 67₈ · 35₁₆.','35₁₆ (53) &lt; 110110₂ (54) &lt; 67₈ (55)','Pasando todo a base 10.')
   ]
  }}
};

/* =====================================================================
   ARMADO DEL CURSO
   ===================================================================== */
(function(){
  BASE.forEach(function(t){
    var x=EXTRA[t.id];if(!x)return;
    if(x.examen)t.exams.examen=t.exams.examen.concat(x.examen);
    if(x.parcial)t.exams.parcial=x.parcial;
  });
})();
function B_(id){return BASE.find(function(t){return t.id===id;});}
function U_(t,u,n,extra){var o=Object.assign({},t,extra||{});o.u=u;o.n=n;return o;}

var CURSO={
 unidades:{
  1:{n:'Matrices y determinantes',guia:'guia-teoria-de-conjuntos.html#matrices'},
  2:{n:'Vectores',guia:'guia-vectores.html'},
  3:{n:'Sistemas de ecuaciones y transformaciones lineales',guia:'guia-teoria-de-conjuntos.html#sistemas'},
  4:{n:'Conjuntos, relaciones y funciones',guia:'guia-relaciones-funciones.html'}
 },
 topics:[
  U_(B_('t7'),1,'01',{desc:'Dimensión, tipos, igualdad, suma, escalar, producto, traspuesta y aplicaciones a problemas concretos.'}),
  U_(B_('t8'),1,'02',{desc:'Determinante de orden 2, 3 (Sarrus) y n, propiedades y cálculo usando propiedades.'}),
  U_(NUEVOS.adj,1,'03',{nuevo:true}),
  U_(B_('t9'),1,'04',{desc:'Las 3 operaciones elementales de fila, forma escalonada reducida y rango.'}),
  U_(B_('t10'),1,'05'),
  U_(NUEVOS.vec,2,'06',{nuevo:true}),
  U_(NUEVOS.lin,2,'07',{nuevo:true}),
  U_(NUEVOS.sis,3,'08',{nuevo:true}),
  U_(NUEVOS.tl,3,'09',{nuevo:true}),
  U_(B_('t1'),4,'10'),
  U_(B_('t2'),4,'11'),
  U_(B_('t3'),4,'12'),
  U_(B_('t4'),4,'13',{desc:'Unión, intersección, diferencia, complemento, diagramas de Venn y problemas de conteo.'}),
  U_(B_('t5'),4,'14'),
  U_(B_('t6'),4,'15'),
  U_(NUEVOS.pot,4,'16',{nuevo:true}),
  U_(NUEVOS.rel,4,'17',{nuevo:true}),
  U_(NUEVOS.fun,4,'18',{nuevo:true}),
  U_(NUEVOS.mod,4,'19',{nuevo:true}),
  U_(NUEVOS.num,4,'20',{nuevo:true})
 ],

 /* ---------------- PARCIALES MODELO ---------------- */
 modelos:[
  {id:'pm1',k:'Unidad 1',titulo:'Parcial modelo · Matrices y determinantes',desc:'Operaciones, aplicación con matrices, Laplace 4×4, inversa por adjunta, ecuaciones matriciales y propiedades.',
   rules:'<b>Condiciones:</b> 2 horas · sin calculadora · justificá cada respuesta. Para aprobar se necesita el 60%. Los bloques de V/F se responden leyendo la situación, sin hacer todas las cuentas.',
   qs:[
    op('Dadas A = [2 −1 ; 0 3], B = [1 4 ; −2 1] y C = [1 0 2 ; 3 −1 1], calculá (A − 2B)·C y Cᵀ·Aᵀ. ¿Se puede calcular C·A?','(A − 2B)·C = [−27 9 −9 ; 7 −1 9] · Cᵀ·Aᵀ = (A·C)ᵀ = [−1 9 ; 1 −3 ; 3 3] · C·A no existe (C es 2×3 y A es 2×2)','A − 2B = [0 −9 ; 4 1]. Para Cᵀ·Aᵀ conviene usar (A·C)ᵀ, con A·C = [−1 1 3 ; 9 −3 3].'),
    vfm('<b>Situación.</b> Tres kioscos venden alfajores, gaseosas y chicles. La matriz V (filas: kioscos K1, K2, K3; columnas: productos) da las unidades vendidas en un día y p los precios en $:<br><span class="mono">V = [20 15 30 ; 10 25 5 ; 30 10 20]</span> &nbsp; <span class="mono">p = [900 ; 1100 ; 300]</span>',[
     ['V·p es una matriz columna con la recaudación de cada kiosco',true,'(3×3)·(3×1) = 3×1: fila de cantidades por columna de precios.'],
     ['El kiosco 2 recaudó $38 000',true,'10·900 + 25·1100 + 5·300 = 9000 + 27 500 + 1500.'],
     ['El kiosco que más recaudó es K3',true,'V·p = [43 500 ; 38 000 ; 44 000].'],
     ['pᵀ·V da la recaudación de cada kiosco',false,'pᵀ·V multiplica precios por columnas de productos: no tiene ese significado (sumaría cantidades de un mismo producto con precios distintos).'],
     ['Si todos los precios suben un 10%, la nueva recaudación es 1,1·(V·p)',true,'V·(1,1·p) = 1,1·(V·p).']
    ]),
    op('Calculá det(D) con D = [1 2 0 1 ; 2 4 1 3 ; 0 1 1 1 ; 3 6 0 4] usando propiedades y Laplace.','det(D) = −1','R₂ − 2R₁ → (0 0 1 1) y R₄ − 3R₁ → (0 0 0 1); el determinante no cambia. Desarrollando por la columna 1: 1·det[0 1 1 ; 1 1 1 ; 0 0 1] = 1·(0·1 − 1·1) = −1 (desarrollando por la última fila).'),
    op('Hallá la inversa de A = [2 0 1 ; 1 1 0 ; 0 3 1] por el método de la adjunta.','det(A) = 5 · adj(A) = [1 3 −1 ; −1 2 1 ; 3 −6 2] · A⁻¹ = (1/5)·[1 3 −1 ; −1 2 1 ; 3 −6 2]','Verificación: fila 1 de A por columna 1 de A⁻¹ = (2·1 + 0·(−1) + 1·3)/5 = 1 ✓.'),
    op('¿Para qué valores de k la matriz [k 1 0 ; 1 k 1 ; 0 1 k] es invertible?','det = k³ − 2k = k(k² − 2) ⇒ es invertible si k ≠ 0, k ≠ √2 y k ≠ −√2','Por la 1ª fila: k·(k² − 1) − 1·(k − 0) = k³ − 2k.'),
    mc('Si A es 3 × 3 y det(A) = 5, entonces det(2·Aᵀ·A⁻¹) es:',['8','10','40','2'],0,'2³·det(Aᵀ)·det(A⁻¹) = 8·5·(1/5) = 8.'),
    op('Resolvé A·X − B = X con A = [3 1 ; 1 2] y B = [1 ; 2].','(A − I)·X = B ⇒ X = (A − I)⁻¹·B = [−1 ; 3]','A − I = [2 1 ; 1 1], det = 1, inversa [1 −1 ; −1 2]. Verificación: A·X − B = [0 ; 5] − [1 ; 2] = [−1 ; 3] = X ✓.'),
    vfm('Decidí V o F (todas las matrices son cuadradas del mismo orden).',[
     ['Si A es simétrica, A² también lo es',true,'(A²)ᵀ = (Aᵀ)² = A².'],
     ['Si A y B son simétricas, A·B también lo es',false,'(AB)ᵀ = BᵀAᵀ = BA, que en general es distinta de AB.'],
     ['A + Aᵀ es siempre simétrica',true,'(A + Aᵀ)ᵀ = Aᵀ + A.'],
     ['Si det(A) = 0, A tiene una fila de ceros',false,'Alcanza con filas proporcionales, como en [1 2 ; 2 4].'],
     ['Una matriz triangular con un 0 en la diagonal no es invertible',true,'Su determinante es el producto de la diagonal, que da 0.']
    ]),
    op('Demostrá que, para cualquier matriz A (de cualquier dimensión), A·Aᵀ es simétrica.','(A·Aᵀ)ᵀ = (Aᵀ)ᵀ·Aᵀ = A·Aᵀ','Se usa (XY)ᵀ = YᵀXᵀ y (Aᵀ)ᵀ = A.')
   ]},
  {id:'pm2',k:'Unidad 2',titulo:'Parcial modelo · Vectores',desc:'Operaciones, norma, ángulo y proyecciones, lectura de gráficos, dependencia lineal, bases, coordenadas y un problema de fuerzas.',
   rules:'<b>Condiciones:</b> 2 horas · se permite calculadora científica · justificá cada respuesta. Aprobación: 60%.',
   qs:[
    vfm('Observá los vectores u, v y w del gráfico (coordenadas enteras).',[
     ['u ⊥ v',true,'u = (3, 1), v = (−1, 3): u·v = −3 + 3 = 0.'],
     ['‖u‖ = ‖v‖',true,'Ambos miden √10.'],
     ['w = u + v = (2, 4)',true,'Es la diagonal del cuadrado que forman u y v.'],
     ['El ángulo entre u y w es 45°',true,'u y v son perpendiculares y de igual norma: w es la diagonal de un cuadrado.'],
     ['{u, v} es una base ortonormal de ℝ²',false,'Es ortogonal, pero no normal: las normas valen √10, no 1.']
    ],G.plot({x:[-2,4],y:[-1,5],vecs:[{to:[3,1],label:'u',c:R_,ldy:14},{to:[-1,3],label:'v',c:N_,ldx:-16},{to:[2,4],label:'w',c:P_,dash:true,ldx:-18}],segs:[[3,1,2,4,'#9AA5AD',true],[-1,3,2,4,'#9AA5AD',true]],label:'vectores u, v, w'})),
    op('Dados u = (1, −2, 2) y v = (3, 0, 4), calculá ‖u‖, ‖v‖, u·v, el coseno del ángulo y la proyección de u sobre v.','‖u‖ = 3 · ‖v‖ = 5 · u·v = 11 · cos θ = 11/15 · proy_v u = (11/25)·(3, 0, 4) = (33/25, 0, 44/25)','θ ≈ 42,8°.'),
    op('Hallá los vectores unitarios perpendiculares a (3, 4).','(−4/5, 3/5) y (4/5, −3/5)','Un perpendicular es (−4, 3); se normaliza dividiendo por 5. El opuesto también sirve.'),
    op('¿Para qué valores de k los vectores (1, 2, k), (0, 1, 1) y (k, 0, 1) son linealmente dependientes?','k = 1 + √2 o k = 1 − √2','det[1 2 k ; 0 1 1 ; k 0 1] = 1·(1 − 0) − 2·(0 − k) + k·(0 − k) = −k² + 2k + 1 = 0.'),
    op('Hallá una base y la dimensión de S = gen{(1, 2, 1), (2, 4, 2), (0, 1, 1)}.','Base: {(1, 2, 1), (0, 1, 1)} · dim S = 2','(2, 4, 2) = 2·(1, 2, 1) sobra. Los otros dos no son proporcionales: son LI.'),
    op('<b>Problema.</b> Sobre un objeto actúan las fuerzas F₁ = (3, 4) N y F₂ = (−1, 2) N. ¿Qué fuerza F₃ hay que aplicar para que quede en equilibrio? ¿Cuál es su módulo?','F₃ = (−2, −6) N · ‖F₃‖ = √40 ≈ 6,32 N','Equilibrio: F₁ + F₂ + F₃ = 0 ⇒ F₃ = −(2, 6).'),
    vfm('Decidí V o F (u, v ∈ ℝⁿ, k ∈ ℝ).',[
     ['Si u·v = 0, entonces u = 0 o v = 0',false,'Pueden ser perpendiculares y no nulos, como (1, 0) y (0, 1).'],
     ['‖k·u‖ = k·‖u‖ para todo k real',false,'Es |k|·‖u‖: con k negativo la norma no puede dar negativa.'],
     ['Dos vectores LI de ℝ² forman una base de ℝ²',true,'Son tantos como la dimensión.'],
     ['El vector nulo es ortogonal a todos los vectores',true,'0·v = 0.'],
     ['La proyección de u sobre v es paralela a v',true,'Es un múltiplo escalar de v.']
    ]),
    op('Hallá las coordenadas de (5, 1) en la base B = {(1, 1), (1, −1)}.','[(5, 1)]_B = (3, 2)','a + b = 5 y a − b = 1 ⇒ a = 3, b = 2.'),
    mc('¿Cuál es la dimensión de S = {(x, y, z, w) ∈ ℝ⁴ / x + y = 0 ∧ z − w = 0}?',['2','4','3','1'],0,'Dos ecuaciones independientes en ℝ⁴: 4 − 2 = 2. Base: {(1, −1, 0, 0), (0, 0, 1, 1)}.')
   ]},
  {id:'pm3',k:'Unidad 3',titulo:'Parcial modelo · Sistemas y transformaciones lineales',desc:'Gauss y conjunto solución, discusión con parámetros, problema de mezcla, interpretación gráfica y transformaciones lineales.',
   rules:'<b>Condiciones:</b> 2 horas · sin calculadora · indicá el método usado y escribí el conjunto solución. Aprobación: 60%.',
   qs:[
    op('Clasificá y resolví por Gauss: 2x + y − z = 1 · x − y + 2z = 3 · 3x + z = 4. Escribí el conjunto solución.','Compatible indeterminado · S = {((4 − t)/3, (5t − 5)/3, t) / t ∈ ℝ}','La 3ª ecuación es la suma de las dos primeras: rg = 2. De la 3ª: x = (4 − z)/3; de la 1ª: y = 1 − 2x + z. Verificación en la 2ª con z = t: (4 − t)/3 − (5t − 5)/3 + 2t = 3 ✓.'),
    op('Discutí según a y b: x + y + z = 1 · x + 2y + 3z = 2 · 2x + 3y + az = b.','det(A) = a − 4. a ≠ 4: SCD (para cualquier b). a = 4 y b = 3: SCI. a = 4 y b ≠ 3: incompatible.','Con a = 4, la 3ª ecuación tiene los coeficientes de la suma de las dos primeras (2x + 3y + 4z), cuyo término independiente es 3.'),
    op('<b>Problema.</b> Una dietista combina tres alimentos A, B y C. Por porción, A aporta 10 g de proteínas, 2 g de grasas y 30 g de carbohidratos; B aporta 20, 1 y 10; C aporta 5, 4 y 20. Necesita exactamente 85 g de proteínas, 11 g de grasas y 110 g de carbohidratos. ¿Cuántas porciones de cada uno usa?','A: 2 porciones · B: 3 · C: 1','10x + 20y + 5z = 85 ; 2x + y + 4z = 11 ; 30x + 10y + 20z = 110. det = 1350 ≠ 0 ⇒ solución única. Verificación: 20 + 60 + 5 = 85 ✓, 4 + 3 + 4 = 11 ✓, 60 + 30 + 20 = 110 ✓.'),
    vfm('El gráfico muestra las tres rectas de un sistema de 3 ecuaciones con 2 incógnitas.',[
     ['El sistema es compatible determinado',true,'Las tres rectas pasan por un mismo punto.'],
     ['rg(A) = 3',false,'A tiene 2 columnas: su rango es como mucho 2.'],
     ['La solución es (1, 2)',true,'Es el punto común.'],
     ['Una de las ecuaciones es combinación lineal de las otras dos',true,'rg(A|B) = 2 con 3 ecuaciones: una sobra.']
    ],G.plot({x:[-2,4],y:[-1,5],fns:[{f:function(x){return x+1;},label:'r₁',lx:3,c:R_},{f:function(x){return -x+3;},label:'r₂',lx:-1.4,c:N_},{f:function(){return 2;},label:'r₃',lx:3.4,ldy:16,c:T_}],pts:[{x:1,y:2}],label:'tres rectas concurrentes'})),
    op('Para T(x, y, z) = (x − y, y − z, z − x), hallá su matriz, el núcleo y la imagen (con sus dimensiones).','[T] = [1 −1 0 ; 0 1 −1 ; −1 0 1] · Nu(T) = {(t, t, t)}, dim 1 · Im(T) = {(a, b, c) / a + b + c = 0}, dim 2','Las tres componentes de T suman 0, por eso la imagen está en ese plano. 1 + 2 = 3 ✓.'),
    vfm('El triángulo verde se transformó en el rojo mediante una transformación lineal T.',[
     ['T es la simetría respecto de la recta y = x',true,'Intercambia las coordenadas: (3, 0) → (0, 3), (1, 1) → (1, 1).'],
     ['La matriz de T es [0 1 ; 1 0]',true,'T(x, y) = (y, x).'],
     ['det[T] = 1',false,'Es −1: las simetrías invierten la orientación.'],
     ['T∘T es la identidad',true,'Reflejar dos veces deja todo como estaba.'],
     ['T conserva el área',true,'|det| = 1.']
    ],G.plot({x:[-1,4],y:[-1,4],polys:[{pts:[[1,0],[3,0],[1,1]],c:T_,op:.35,stroke:T_},{pts:[[0,1],[0,3],[1,1]],c:R_,op:.18,stroke:R_}],fns:[{f:function(x){return x;},c:'#9AA5AD',dash:true,wd:1.3}],label:'simetría'})),
    op('¿Para qué k el sistema homogéneo x + y + z = 0 · x + ky + z = 0 · x + y + kz = 0 tiene soluciones no triviales? Describí esas soluciones.','k = 1 · S = {(x, y, z) / x + y + z = 0} (plano, 2 parámetros)','det = (k − 1)². Con k = 1 las tres ecuaciones son la misma.'),
    mc('A es 3 × 3, det(A) = 0 y el sistema A·X = B es compatible. Entonces el sistema:',['tiene infinitas soluciones','tiene solución única','es incompatible','es homogéneo'],0,'Compatible con rg(A) &lt; 3 ⇒ indeterminado.'),
    op('T: ℝ² → ℝ² es lineal, con T(1, 1) = (3, 1) y T(1, −1) = (1, −1). Hallá T(x, y).','T(x, y) = (2x + y, y)','(x, y) = ((x + y)/2)·(1, 1) + ((x − y)/2)·(1, −1). Aplicando linealidad: T(x, y) = ((x + y)/2)·(3, 1) + ((x − y)/2)·(1, −1) = (2x + y, y). Verificación: T(1, 1) = (3, 1) ✓.')
   ]},
  {id:'pm4',k:'Unidad 4',titulo:'Parcial modelo · Conjuntos, relaciones y funciones',desc:'Venn y conteo, relaciones de equivalencia y orden, lectura de gráficas, inversa, intersecciones, congruencias y bases.',
   rules:'<b>Condiciones:</b> 2 horas · sin calculadora · justificá cada respuesta. Aprobación: 60%.',
   qs:[
    vfm('Observá la zona sombreada.',[
     ['Representa (A ∩ B) ∪ (C − A)',true,'Está A ∩ B completo y la parte de C que queda fuera de A.'],
     ['Contiene a B ∩ C',true,'Las dos zonas de B ∩ C (con y sin A) están sombreadas.'],
     ['Contiene a A ∩ C',false,'La zona "A y C, no B" está en blanco.'],
     ['Es igual a (A ∩ B) ∪ (C ∩ A′)',true,'C − A = C ∩ A′.'],
     ['Está incluida en B ∪ C',true,'Todas las zonas sombreadas están dentro de B o de C.']
    ],G.venn({n:3,shade:['110','111','001','011']})),
    op('<b>Problema.</b> De 60 estudiantes, 30 cursan Matemática, 25 Física y 20 Química; 10 cursan M y F, 8 M y Q, 5 F y Q, y 3 las tres. a) ¿Cuántos no cursan ninguna? b) ¿Cuántos cursan exactamente una?','a) 5 · b) 38','a) #(M ∪ F ∪ Q) = 30 + 25 + 20 − 10 − 8 − 5 + 3 = 55. b) Solo M = 15, solo F = 13, solo Q = 10.'),
    op('En A = {1, 2, 3, 4, 5, 6} se define x R y ⇔ x ≡ y (mod 3). Probá que es de equivalencia, dá las clases y #R.','Clases: {1, 4}, {2, 5}, {3, 6} · #R = 12','Es la congruencia, que es de equivalencia. Cada clase de 2 elementos aporta 2² = 4 pares: 3·4 = 12.'),
    vfm('El grafo muestra la relación "x divide a y" en A = {1, 2, 3, 6} (los círculos pegados a los nodos son bucles).',[
     ['R es reflexiva',true,'Todo número se divide a sí mismo.'],
     ['R es antisimétrica',true,'Si x | y e y | x (positivos), entonces x = y.'],
     ['R es transitiva',true,'1 | 2 | 6 y 1 | 6; 1 | 3 | 6 y 1 | 6.'],
     ['R es una relación de orden total',false,'2 y 3 no son comparables: ninguno divide al otro. Es un orden parcial.'],
     ['R es simétrica',false,'2 | 6 pero 6 no divide a 2.']
    ],G.digraph({nodes:[1,2,6,3],edges:[[1,1],[2,2],[3,3],[6,6],[1,2],[1,3],[1,6],[2,6],[3,6]]})),
    vfm('Gráfico de f(x) = |x − 1| − 2.',[
     ['f(−1) = 0',true,'|−2| − 2 = 0.'],
     ['Los ceros de f son x = −1 y x = 3',true,'|x − 1| = 2 ⇒ x − 1 = ±2.'],
     ['f es inyectiva',false,'f(−1) = f(3) = 0.'],
     ['Im f = [−2, +∞)',true,'El mínimo es −2, en x = 1.'],
     ['La ecuación f(x) = −3 tiene solución',false,'−3 está por debajo del mínimo.']
    ],G.plot({x:[-3,5],y:[-3,4],fns:[{f:function(x){return Math.abs(x-1)-2;},label:'f',lx:4.2,c:R_}],pts:[{x:1,y:-2,label:'(1, −2)',dy:16}],label:'valor absoluto'})),
    op('Sean f(x) = 3x − 2 y g(x) = (x + 2)/3. Probá que son inversas una de la otra.','f(g(x)) = 3·(x + 2)/3 − 2 = x · g(f(x)) = (3x − 2 + 2)/3 = x','Hay que verificar las dos composiciones.'),
    op('Hallá los puntos de intersección de y = x² − 1 e y = 2x + 2.','(−1, 0) y (3, 8)','x² − 2x − 3 = 0 ⇒ (x − 3)(x + 1) = 0.'),
    op('Resolvé 7x ≡ 3 (mod 10).','x ≡ 9 (mod 10)','El inverso de 7 mod 10 es 3 (21 ≡ 1). x ≡ 3·3 = 9. Verificación: 63 ≡ 3 ✓.'),
    mc('Si #A = 2 y #B = 2, ¿cuántos elementos tiene P(A × B)?',['16','8','4','64'],0,'#(A × B) = 4 ⇒ 2⁴ = 16.'),
    op('Pasá 2024 a base 16 y a base 2.','2024 = 7E8₁₆ = 11111101000₂','2024 = 7·256 + 14·16 + 8. Cada dígito hex en 4 bits: 0111 1110 1000.')
   ]}
 ],

 final:{}
};

/* ---------------- EXAMEN FINAL INTEGRADOR ---------------- */
(function(){
 var F=FINAL_OLD;
 CURSO.final.basico=F.basico.concat([
  mc('La norma del vector (6, 8) es:',['10','14','100','48'],0,'√(36 + 64) = 10.'),
  mc('Si #A = 4, entonces #P(A) es:',['16','8','4','2'],0,'2⁴ = 16.'),
  mc('17 mod 5 es:',['2','3','5','12'],0,'17 = 5·3 + 2.'),
  mc('Un sistema de ecuaciones incompatible tiene:',['ninguna solución','una solución','infinitas soluciones','solo la trivial'],0,'Incompatible = sin solución.')
 ]);
 CURSO.final.normal=F.normal.concat([
  mc('Si f(x) = x + 2 y g(x) = 3x, entonces (g∘f)(1) es:',['9','5','6','3'],0,'f(1) = 3 y g(3) = 9.'),
  mc('Los vectores (2, −1) y (−4, 2) son:',['LD','LI','perpendiculares','una base de ℝ²'],0,'(−4, 2) = −2·(2, −1).'),
  mc('La relación "x ≤ y" en ℝ NO es:',['simétrica','reflexiva','transitiva','antisimétrica'],0,'2 ≤ 3 pero 3 ≰ 2.'),
  mc('La matriz de T(x, y) = (y, x) es:',['[0 1 ; 1 0]','[1 0 ; 0 1]','[1 1 ; 0 0]','[0 −1 ; 1 0]'],0,'T(1, 0) = (0, 1) y T(0, 1) = (1, 0) son las columnas.')
 ]);
 CURSO.final.examen=F.examen.concat([
  op('Hallá la proyección de u = (1, 2, 2) sobre v = (0, 3, 4).','proy_v u = (14/25)·(0, 3, 4) = (0, 42/25, 56/25)','u·v = 6 + 8 = 14; ‖v‖² = 25.'),
  op('Discutí según k: kx + y = 1 · x + ky = 1.','k ≠ ±1: SCD con x = y = 1/(k + 1) · k = 1: SCI · k = −1: incompatible','det = k² − 1. Con k = −1: −x + y = 1 y x − y = 1, que suman 0 = 2.'),
  op('En A = {1, 2, 3} sea R = {(1, 1), (2, 2), (3, 3), (1, 3), (3, 1)}. ¿Es de equivalencia? Dá las clases.','Sí · Clases: {1, 3} y {2}','Reflexiva, simétrica, y transitiva (1~3~1 ⇒ 1~1, que está).'),
  op('Resolvé 2x ≡ 5 (mod 9).','x ≡ 7 (mod 9)','El inverso de 2 mod 9 es 5 (10 ≡ 1). x ≡ 25 ≡ 7. Verificación: 14 ≡ 5 ✓.')
 ]);
 CURSO.final.parcial=[
  vfm('Gráfico de f(x) = −x² + 4 (rojo) y g(x) = x + 2 (azul).',[
   ['Las gráficas se cortan en (1, 3) y (−2, 0)',true,'−x² + 4 = x + 2 ⇒ x² + x − 2 = 0 ⇒ x = 1 o x = −2.'],
   ['Para −2 &lt; x &lt; 1, f(x) &gt; g(x)',true,'Entre los cortes la parábola está arriba (por ejemplo en x = 0: 4 &gt; 2).'],
   ['f: ℝ → ℝ es sobreyectiva',false,'Nunca supera 4: su imagen es (−∞, 4].'],
   ['g: ℝ → ℝ es biyectiva',true,'Es una recta no horizontal.'],
   ['El sistema y = −x² + 4 ; y = x + 2 tiene exactamente 2 soluciones',true,'Son los dos puntos de corte.']
  ],G.plot({x:[-4,4],y:[-3,6],fns:[{f:function(x){return -x*x+4;},label:'f',lx:2.3,ldx:8,c:R_},{f:function(x){return x+2;},label:'g',lx:3.2,ldy:16,c:N_}],pts:[{x:1,y:3,label:'(1, 3)'},{x:-2,y:0,label:'(−2, 0)',dx:-48,dy:-8}],label:'parábola y recta'})),
  op('Calculá det(E) con E = [3 0 0 2 ; 1 2 0 0 ; 0 1 1 0 ; 2 0 1 1] por Laplace.','det(E) = −4','Por la fila 1: 3·det[2 0 0 ; 1 1 0 ; 0 1 1] − 2·det[1 2 0 ; 0 1 1 ; 2 0 1] = 3·2 − 2·5 = −4. (El 2 está en la posición (1,4): signo −.)'),
  op('Resolvé por Gauss-Jordan y escribí el conjunto solución: x + 2y − z = 3 · 2x + 5y + z = 9 · x + 3y + 2z = 6.','SCI · S = {(−3 + 7t, 3 − 3t, t) / t ∈ ℝ}','R₂ − 2R₁: (0 1 3 | 3); R₃ − R₁: (0 1 3 | 3), igual a la anterior. y = 3 − 3z; x = 3 − 2y + z = −3 + 7z. Verificación con t = 0: (−3, 3, 0) cumple las tres ✓.'),
  vfm('El gráfico muestra u = (4, 2) y v = (1, 3).',[
   ['u · v = 10',true,'4 + 6.'],
   ['El ángulo entre u y v es 45°',true,'cos θ = 10/(√20·√10) = 10/√200 = √2/2.'],
   ['{u, v} es base de ℝ²',true,'det[4 1 ; 2 3] = 10 ≠ 0.'],
   ['La proyección de v sobre u es (2, 1)',true,'(v·u/‖u‖²)·u = (10/20)·(4, 2).'],
   ['‖u − v‖ = √10',true,'u − v = (3, −1).']
  ],G.plot({x:[-1,5],y:[-1,4],vecs:[{to:[4,2],label:'u',c:R_,ldy:14},{to:[1,3],label:'v',c:N_,ldx:-16}],label:'u y v'})),
  op('T(x, y) = (x + 2y, 3x + 6y). Hallá núcleo e imagen. ¿Es inyectiva?','Nu(T) = {(−2t, t)}, dim 1 · Im(T) = {(s, 3s)} (la recta y = 3x), dim 1 · No es inyectiva','det[1 2 ; 3 6] = 0. x + 2y = 0 ⇒ x = −2y. T(x, y) = (x + 2y)·(1, 3).'),
  vfm('El grafo muestra una relación R en {1, 2, 3}.',[
   ['R es reflexiva',false,'Al 2 le falta su bucle.'],
   ['R es simétrica',true,'La única flecha entre distintos, 1 ↔ 3, va y vuelve.'],
   ['R es transitiva',true,'1→3→1 exige 1→1 y 3→1→3 exige 3→3, y ambos están.'],
   ['Agregando (2, 2), R es de equivalencia',true,'Pasa a ser reflexiva; las clases son {1, 3} y {2}.']
  ],G.digraph({nodes:[1,2,3],edges:[[1,1],[3,3],[1,3],[3,1]]})),
  op('<b>Problema.</b> Una empresa produce x unidades con costo C(x) = 2000 + 30x e ingreso I(x) = 80x. a) Punto de equilibrio. b) ¿Desde cuántas unidades la ganancia supera $3000?','a) x = 40, $3200 · b) x &gt; 100','a) 80x = 2000 + 30x ⇒ x = 40. b) 50x − 2000 &gt; 3000 ⇒ x &gt; 100.'),
  op('Calculá 5⁴⁰ mod 7 y el resto de 2¹⁰⁰ al dividir por 3.','5⁴⁰ ≡ 2 (mod 7) · 2¹⁰⁰ ≡ 1 (mod 3)','5⁶ ≡ 1 (mod 7) (Fermat): 40 = 6·6 + 4 ⇒ 5⁴⁰ ≡ 5⁴ = 625 ≡ 2 (625 = 7·89 + 2). 2 ≡ −1 (mod 3) ⇒ 2¹⁰⁰ ≡ (−1)¹⁰⁰ = 1.'),
  mc('Sean A = {∅, {∅}}. ¿Cuál es #P(A)?',['4','2','1','8'],0,'A tiene 2 elementos (∅ y {∅}), así que #P(A) = 2² = 4.'),
  vf('Si A es 2 × 3 y B es 3 × 2, entonces det(A·B) = det(B·A).',false,'A·B es 2 × 2 y B·A es 3 × 3. B·A tiene rango ≤ 2 &lt; 3, así que det(B·A) = 0, mientras que det(A·B) puede ser distinto de 0. Ej.: A = [1 0 0 ; 0 1 0], B = Aᵀ ⇒ det(AB) = 1.')
 ];
})();
