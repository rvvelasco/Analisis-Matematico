/* =====================================================================
   examenes-calculo.js · Derivadas e integrales (se suma al banco de examenes-datos.js)
   Usa los mismos helpers: mc, vf, vfm, op y el objeto G de graficos.js
   ===================================================================== */
(function(){
var R=G.C.red,N=G.C.navy,T=G.C.teal,O=G.C.gold,P=G.C.purple,GR='#9AA5AD';
function sq(x){return x*x;}

/* ---------- Gráficos ---------- */
var F={
  hueco: G.plot({x:[-1,4],y:[-1,6],fns:[{f:function(x){return x+2;},c:R,label:'f',lx:3.4}],pts:[{x:2,y:4,open:true,c:R},{x:2,y:1,c:R}]}),
  salto: G.plot({x:[-2,4],y:[-1,5],fns:[{f:function(x){return x+1;},dom:[-2,1],c:R},{f:function(x){return 4-x;},dom:[1,4],c:R}],pts:[{x:1,y:2,open:true,c:R},{x:1,y:3,c:R}]}),
  asint: G.plot({x:[-3,5],y:[-5,5],fns:[{f:function(x){return 1/(x-1)+2;},c:R,n:900}],vlines:[{x:1,c:GR,dash:true,wd:1.3,label:'x = 1'}],segs:[[-3,2,5,2,GR,true]],texts:[{x:3.6,y:2.4,s:'y = 2',c:'#51616B'}]}),
  tangPar: G.plot({x:[-1,3.5],y:[-2,9],fns:[{f:sq,label:'f',lx:2.75,ldx:6,c:R},{f:function(x){return 4*x-4;},c:N,label:'t',lx:3.2,ldy:16}],pts:[{x:2,y:4,label:'P'}]}),
  dosTang: G.plot({x:[-3,3],y:[-3,5],fns:[{f:function(x){return x*x/2;},c:R,label:'f',lx:2.5},{f:function(x){return 2*x-2;},c:N,dash:true,label:'t₁',lx:2.6,ldy:16},{f:function(x){return -x-0.5;},c:T,dash:true,label:'t₂',lx:-2.6,ldy:16}],pts:[{x:2,y:2,label:'A'},{x:-1,y:0.5,label:'B',dx:-16}]}),
  fp: G.plot({x:[-3,4],y:[-4,5],fns:[{f:function(x){return (x+1)*(x-2);},c:N,label:'f′',lx:3.2,ldx:6}],pts:[{x:-1,y:0},{x:2,y:0}]}),
  cubica: G.plot({x:[-2.5,2.5],y:[-4,4],fns:[{f:function(x){return x*x*x-3*x;},c:R,label:'f',lx:2.2}],pts:[{x:-1,y:2,label:'(−1, 2)',dx:-24,dy:-10},{x:1,y:-2,label:'(1, −2)',dy:16},{x:0,y:0}]}),
  cuartica: G.plot({x:[-1.5,4.5],y:[-30,10],step:1,tickStep:5,grid:false,fns:[{f:function(x){return x*x*x*x-4*x*x*x;},c:R,label:'f',lx:4.15,ldx:-16,n:600}],pts:[{x:0,y:0,label:'(0, 0)',dx:-48},{x:2,y:-16,label:'(2, −16)'},{x:3,y:-27,label:'(3, −27)',dy:16}]}),
  posicion: G.plot({x:[0,4.5],y:[-1,6],xl:'t',yl:'s',fns:[{f:function(t){return t*t*t-6*t*t+9*t;},c:R,label:'s(t)',lx:4.1,ldx:-40}],pts:[{x:1,y:4,label:'t = 1'},{x:3,y:0,label:'t = 3',dy:-10}]}),
  abs: G.plot({x:[-2,4],y:[-1,3],fns:[{f:function(x){return Math.abs(x-1);},c:R,label:'f',lx:3.3}],pts:[{x:1,y:0,c:R}]}),
  primitivas: G.plot({x:[-3,3],y:[-4,6],fns:[{f:function(x){return x*x;},c:R,label:'F₁',lx:2.2},{f:function(x){return x*x+2;},c:N,label:'F₂',lx:1.7},{f:function(x){return x*x-3;},c:T,label:'F₃',lx:2.6,ldy:14}]}),
  riem: G.plot({x:[-.3,3.3],y:[-.5,9.5],step:1,tickStep:1,grid:false,polys:G.riemann(sq,0,3,3,'der'),fns:[{f:sq,c:R,dom:[-.3,3.15]}]}),
  riemIzq: G.plot({x:[-.3,3.3],y:[-.5,9.5],step:1,tickStep:1,grid:false,polys:G.riemann(sq,0,3,3,'izq'),fns:[{f:sq,c:R,dom:[-.3,3.15]}]}),
  areaSigno: G.plot({x:[-1.5,3.5],y:[-3,4],polys:[{pts:G.area(function(x){return x*x-2*x;},0,2),c:R,op:.25,stroke:R},{pts:G.area(function(x){return x*x-2*x;},2,3),c:T,op:.3,stroke:T}],fns:[{f:function(x){return x*x-2*x;},c:N,label:'f',lx:3.1,ldx:-14}]}),
  entre: G.plot({x:[-1,3],y:[-1,5],polys:[{pts:G.between(function(x){return 2*x;},sq,0,2),c:T,op:.3,stroke:'none'}],fns:[{f:sq,c:R,label:'y = x²',lx:2.15,ldx:4},{f:function(x){return 2*x;},c:N,label:'y = 2x',lx:2.4,ldy:18}],pts:[{x:0,y:0},{x:2,y:4,label:'(2, 4)',dx:-48}]}),
  velocidad: G.plot({x:[0,6.5],y:[-1,10],xl:'t',yl:'v',tickStep:2,polys:[{pts:G.area(function(t){return t<=2?3*t:(t<=5?6:6-3*(t-5));},0,6,300),c:T,op:.3,stroke:'none'}],fns:[{f:function(t){return t<=2?3*t:(t<=5?6:6-3*(t-5));},c:R,dom:[0,6],n:600}]}),
  areaF: G.plot({x:[-.5,4.5],y:[-1,5],polys:[{pts:G.area(function(x){return Math.sqrt(x);},0,4),c:T,op:.3,stroke:T}],fns:[{f:function(x){return Math.sqrt(x);},c:R,dom:[0,4.4],label:'y = √x',lx:3.3,ldy:-10}]})
};

/* ---------- Temas ---------- */
var T5=[
 {id:'d1',n:'21',u:5,nuevo:true,titulo:'Límites y continuidad',pre:'Necesitás: <b>funciones</b> y factoreo',desc:'Idea de límite, cálculo (0/0 por factoreo o racionalización), límites laterales, al infinito, asíntotas y continuidad.',
  exams:{
   basico:[
    mc('lim<sub>x→3</sub> (x² + 1) es:',['10','9','4','no existe'],0,'Se reemplaza: 9 + 1 = 10.'),
    mc('Al reemplazar en lim<sub>x→2</sub> (x² − 4)/(x − 2) se obtiene:',['0/0, una indeterminación','0','4','∞'],0,'0/0 no es un número: hay que simplificar antes.'),
    mc('Una función es continua en a si:',['lim<sub>x→a</sub> f(x) = f(a)','f(a) = 0','f′(a) = 0','el límite es infinito'],0,'Existe f(a), existe el límite y coinciden.'),
    mc('lim<sub>x→∞</sub> 1/x es:',['0','1','∞','no existe'],0,'1 dividido por números cada vez más grandes se acerca a 0.')
   ],
   normal:[
    mc('lim<sub>x→2</sub> (x² − 4)/(x − 2) vale:',['4','0','2','no existe'],0,'(x − 2)(x + 2)/(x − 2) = x + 2 → 4.',F.hueco),
    mc('lim<sub>x→∞</sub> (3x² + 1)/(x² − 5) vale:',['3','0','∞','1/5'],0,'Mismo grado arriba y abajo: cociente de coeficientes principales.'),
    mc('lim<sub>x→0</sub> sen(x)/x vale:',['1','0','∞','no existe'],0,'Es el límite especial que se usa para derivar el seno.'),
    vfm('Observá el gráfico de f (punto lleno: pertenece; vacío: no pertenece).',[
     ['lim<sub>x→1⁻</sub> f(x) = 2',true,'Por la izquierda la rama y = x + 1 llega a 2.'],
     ['lim<sub>x→1⁺</sub> f(x) = 3',true,'Por la derecha la rama y = 4 − x llega a 3.'],
     ['lim<sub>x→1</sub> f(x) existe',false,'Los laterales son distintos (2 ≠ 3).'],
     ['f es continua en x = 1',false,'Hay un salto.']
    ],F.salto)
   ],
   examen:[
    op('Calculá lim<sub>x→1</sub> (x² + 2x − 3)/(x² − 1).','2','0/0 ⇒ factorear: (x − 1)(x + 3)/[(x − 1)(x + 1)] = (x + 3)/(x + 1) → 4/2 = 2.'),
    op('Calculá lim<sub>x→4</sub> (√x − 2)/(x − 4).','1/4','Multiplicando por el conjugado: (x − 4)/[(x − 4)(√x + 2)] = 1/(√x + 2) → 1/4.'),
    op('Hallá las asíntotas de f(x) = (2x − 1)/(x − 1).','Vertical: x = 1 · Horizontal: y = 2','En x = 1 el denominador se anula y el numerador no (k/0). En ±∞, el cociente de coeficientes principales es 2/1.',F.asint),
    op('¿Para qué valor de k es continua f(x) = x² + k si x ≤ 2 ; f(x) = 3x si x &gt; 2?','k = 2','Los dos tramos tienen que coincidir en x = 2: 4 + k = 6.'),
    mc('lim<sub>x→∞</sub> (5x³ − x)/(2x² + 7) es:',['+∞','5/2','0','2/5'],0,'El grado de arriba es mayor: el cociente crece sin límite.')
   ],
   parcial:[
    vfm('Gráfico de f(x) = 1/(x − 1) + 2.',[
     ['x = 1 es asíntota vertical',true,'El denominador se anula en x = 1.'],
     ['lim<sub>x→1⁺</sub> f(x) = +∞',true,'Por la derecha, 1/(x − 1) es positivo y enorme.'],
     ['lim<sub>x→+∞</sub> f(x) = 2',true,'1/(x − 1) → 0.'],
     ['f es continua en todo ℝ',false,'No está definida en x = 1.'],
     ['La gráfica corta a la recta y = 2',false,'1/(x − 1) nunca es 0.']
    ],F.asint),
    op('Calculá lim<sub>x→0</sub> (√(1 + x) − 1)/x.','1/2','Conjugado: x/[x(√(1 + x) + 1)] = 1/(√(1 + x) + 1) → 1/2.'),
    op('Calculá lim<sub>x→∞</sub> (√(x² + x) − x).','1/2','∞ − ∞. Multiplicando por el conjugado: x/(√(x² + x) + x). Dividiendo por x: 1/(√(1 + 1/x) + 1) → 1/2.'),
    op('Hallá a y b para que f sea continua en ℝ: f(x) = ax + 1 si x &lt; 1 · f(x) = 3 si x = 1 · f(x) = x² + b si x &gt; 1.','a = 2, b = 2','Continuidad en 1: a + 1 = 3 = 1 + b.'),
    mc('lim<sub>x→2</sub> 1/(x − 2):',['no existe (laterales −∞ y +∞)','vale +∞','vale 0','vale 1/2'],0,'Por izquierda → −∞; por derecha → +∞. Al ser distintos, el límite no existe.')
   ]
  }},

 {id:'d2',n:'22',u:5,nuevo:true,titulo:'Concepto y definición de derivada',pre:'Necesitás: <b>límites</b> y <b>pendiente de una recta</b>',desc:'Tasa de variación media e instantánea, secante y tangente, derivada por definición, interpretación y derivabilidad.',
  exams:{
   basico:[
    mc('Geométricamente, f′(a) es:',['la pendiente de la recta tangente en x = a','el valor de f en a','el área bajo la curva','la ordenada al origen'],0,'Es la inclinación de la curva justo en ese punto.'),
    mc('La pendiente de la recta que pasa por (1, 2) y (3, 8) es:',['3','6','2','1/3'],0,'(8 − 2)/(3 − 1) = 6/2 = 3.'),
    mc('Si s(t) es la posición, s′(t) es:',['la velocidad','la aceleración','la distancia total','el tiempo'],0,'La derivada de la posición es la velocidad.'),
    mc('La definición de derivada es:',['lim<sub>h→0</sub> [f(x + h) − f(x)]/h','[f(b) − f(a)]/(b − a)','f(x + h) − f(x)','lim<sub>x→∞</sub> f(x)'],0,'Es el límite del cociente incremental.')
   ],
   normal:[
    mc('La tasa de variación media de f(x) = x² entre 1 y 3 es:',['4','8','2','9'],0,'(9 − 1)/(3 − 1) = 4: la pendiente de la secante.'),
    mc('Por definición, si f(x) = x², el cociente incremental [f(x + h) − f(x)]/h simplificado es:',['2x + h','2x','x + h','2xh + h²'],0,'(2xh + h²)/h = 2x + h; al hacer h → 0 queda 2x.'),
    mc('f(x) = |x| en x = 0 es:',['continua pero no derivable','derivable','discontinua','derivable pero no continua'],0,'Tiene un pico: pendiente −1 por izquierda y 1 por derecha.'),
    mc('Si C(x) es el costo de producir x unidades, C′(100) ≈',['el costo de producir la unidad 101','el costo total de 100 unidades','el costo promedio','el costo fijo'],0,'Es el costo marginal.')
   ],
   examen:[
    op('Derivá por definición f(x) = 3x² − x.','f′(x) = 6x − 1','[3(x + h)² − (x + h) − 3x² + x]/h = (6xh + 3h² − h)/h = 6x + 3h − 1 → 6x − 1.'),
    op('Derivá por definición f(x) = 1/x.','f′(x) = −1/x²','[1/(x + h) − 1/x]/h = −1/[x(x + h)] → −1/x².'),
    op('Usando la definición, calculá f′(4) para f(x) = √x.','f′(4) = 1/4','[√(4 + h) − 2]/h = 1/(√(4 + h) + 2) → 1/4.'),
    vfm('Gráfico de f(x) = |x − 1|.',[
     ['f es continua en x = 1',true,'Se dibuja sin levantar el lápiz.'],
     ['f es derivable en x = 1',false,'Tiene un pico: las pendientes laterales son −1 y 1.'],
     ['f′(3) = 1',true,'Para x &gt; 1, f(x) = x − 1.'],
     ['f′(0) = −1',true,'Para x &lt; 1, f(x) = 1 − x.']
    ],F.abs),
    vf('Si f es continua en a, entonces f es derivable en a.',false,'Al revés sí vale (derivable ⇒ continua). |x| es continua en 0 y no es derivable.')
   ],
   parcial:[
    op('Derivá por definición f(x) = 1/(x + 2).','f′(x) = −1/(x + 2)²','[1/(x + h + 2) − 1/(x + 2)]/h = −h/[h(x + h + 2)(x + 2)] → −1/(x + 2)².'),
    vfm('El gráfico muestra f(x) = x² y una recta t que la toca en P(2, 4).',[
     ['La pendiente de t es f′(2) = 4',true,'f′(x) = 2x.'],
     ['La ecuación de t es y = 4x − 4',true,'y − 4 = 4(x − 2).'],
     ['La tasa de variación media de f entre 0 y 2 es 4',false,'(4 − 0)/2 = 2. La media no es lo mismo que la instantánea.'],
     ['Para x cerca de 2, f(x) ≈ 4x − 4',true,'La tangente es la mejor aproximación lineal de f cerca del punto.']
    ],F.tangPar),
    op('Estudiá la derivabilidad de f(x) = x² si x ≤ 1 ; f(x) = 2x − 1 si x &gt; 1 en x = 1.','Es continua (1 = 1) y derivable: derivadas laterales 2 y 2. f′(1) = 2.','Primero se chequea la continuidad (si no es continua, no es derivable). Después se comparan las derivadas laterales: 2x → 2 y 2.'),
    op('La temperatura de un horno es T(t) = 20 + 30t − t² (°C, t en minutos). ¿Cuál es la variación media entre t = 0 y t = 10? ¿Y la instantánea en t = 10?','Media: 20 °C/min · Instantánea: T′(10) = 10 °C/min','T(10) = 220, T(0) = 20 ⇒ 200/10 = 20. T′(t) = 30 − 2t.'),
    mc('Si f es derivable en a, ¿cuál es necesariamente cierta?',['f es continua en a','f′(a) ≠ 0','f tiene un extremo en a','f″(a) existe'],0,'Derivable implica continua; lo demás no se deduce.')
   ]
  }},

 {id:'d3',n:'23',u:5,nuevo:true,titulo:'Tabla de derivadas y reglas (producto y cociente)',pre:'Necesitás: <b>definición de derivada</b> y potencias',desc:'Derivadas inmediatas (potencias, raíces, eˣ, ln, sen, cos), linealidad, regla del producto y del cociente.',
  exams:{
   basico:[
    mc('La derivada de x⁵ es:',['5x⁴','x⁴','5x⁵','x⁶/6'],0,'n·xⁿ⁻¹.'),
    mc('La derivada de una constante (por ejemplo 7) es:',['0','7','1','x'],0,'Una constante no cambia: su tasa de cambio es 0.'),
    mc('(sen x)′ =',['cos x','−cos x','−sen x','sen x'],0,'Dato de la tabla.'),
    mc('(ln x)′ =',['1/x','ln x','eˣ','x'],0,'Dato de la tabla (x &gt; 0).')
   ],
   normal:[
    mc('Si f(x) = 4x³ − 2x + 9, f′(x) es:',['12x² − 2','12x² − 2x','4x² − 2','12x² + 9'],0,'Se deriva término a término; la constante desaparece.'),
    mc('(√x)′ =',['1/(2√x)','√x/2','2√x','1/√x'],0,'√x = x^(1/2) ⇒ ½·x^(−1/2).'),
    mc('(x²·eˣ)′ =',['2x·eˣ + x²·eˣ','2x·eˣ','x²·eˣ','2x + eˣ'],0,'Regla del producto: f′g + fg′.'),
    mc('(1/x³)′ =',['−3/x⁴','1/(3x²)','−1/(3x²)','3/x⁴'],0,'x⁻³ ⇒ −3x⁻⁴.'),
    mc('(cos x)′ =',['−sen x','sen x','−cos x','cos x'],0,'Ojo con el signo.')
   ],
   examen:[
    op('Derivá f(x) = 3√x − 2/x² + 5x.','f′(x) = 3/(2√x) + 4/x³ + 5','Pasando a potencias: 3x^(1/2) − 2x⁻² + 5x.'),
    op('Derivá f(x) = x³·ln x.','f′(x) = 3x²·ln x + x² = x²(3 ln x + 1)','Producto: (x³)′·ln x + x³·(1/x).'),
    op('Derivá f(x) = (x + 1)/(x − 1).','f′(x) = −2/(x − 1)²','[(x − 1) − (x + 1)]/(x − 1)².'),
    op('Derivá f(x) = eˣ·sen x.','f′(x) = eˣ(sen x + cos x)',''),
    mc('(x/eˣ)′ =',['(1 − x)/eˣ','1/eˣ','(x − 1)/eˣ','−x/eˣ'],0,'[1·eˣ − x·eˣ]/e^(2x) = (1 − x)/eˣ.')
   ],
   parcial:[
    op('Derivá f(x) = (x² + 1)/(x² − 1) y simplificá.','f′(x) = −4x/(x² − 1)²','[2x(x² − 1) − (x² + 1)2x]/(x² − 1)² = (2x³ − 2x − 2x³ − 2x)/(x² − 1)².'),
    op('Derivá f(x) = x·eˣ·cos x (producto de tres factores).','f′ = eˣcos x + x·eˣcos x − x·eˣsen x = eˣ[(1 + x)cos x − x·sen x]','(uvw)′ = u′vw + uv′w + uvw′.'),
    vfm('Decidí V o F (f y g derivables).',[
     ['(f·g)′ = f′·g′',false,'Es f′g + fg′.'],
     ['(5f)′ = 5f′',true,'Las constantes salen.'],
     ['(f/g)′ = (f′g − fg′)/g²',true,'Regla del cociente; el orden del numerador importa.'],
     ['(e²)′ = 2e',false,'e² es una constante: su derivada es 0.'],
     ['(ln 5x)′ = 1/x',true,'ln 5x = ln 5 + ln x, y ln 5 es constante.']
    ]),
    op('Hallá los x donde la tangente a f(x) = x³ − 6x² + 9x + 1 es horizontal.','x = 1 y x = 3','f′(x) = 3x² − 12x + 9 = 3(x − 1)(x − 3) = 0.'),
    mc('Si f(x) = tg x = sen x / cos x, entonces f′(x) es:',['1/cos²x','sec x','−1/sen²x','cos x/sen x'],0,'Por cociente: (cos²x + sen²x)/cos²x = 1/cos²x.')
   ]
  }},

 {id:'d4',n:'24',u:5,nuevo:true,titulo:'Regla de la cadena, implícita y logarítmica',pre:'Necesitás: <b>tabla y reglas de derivación</b>',desc:'Funciones compuestas (regla de la cadena), derivación implícita, derivación logarítmica y derivadas sucesivas.',
  exams:{
   basico:[
    mc('(sen(5x))′ =',['5 cos(5x)','cos(5x)','−5 cos(5x)','5 sen(5x)'],0,'Cadena: cos de lo mismo por la derivada de 5x.'),
    mc('(e^(3x))′ =',['3e^(3x)','e^(3x)','3x·e^(3x − 1)','e³'],0,'eᵘ ⇒ eᵘ·u′.'),
    mc('((2x + 1)³)′ =',['6(2x + 1)²','3(2x + 1)²','(2x + 1)²','6(2x + 1)³'],0,'3(2x + 1)²·2.'),
    mc('La regla de la cadena se usa para derivar:',['funciones compuestas','sumas','constantes','productos'],0,'Una función dentro de otra.')
   ],
   normal:[
    mc('(ln(x² + 1))′ =',['2x/(x² + 1)','1/(x² + 1)','2x·ln(x² + 1)','1/(2x)'],0,'(ln u)′ = u′/u.'),
    mc('(√(1 − x²))′ =',['−x/√(1 − x²)','1/(2√(1 − x²))','−2x·√(1 − x²)','x/√(1 − x²)'],0,'u′/(2√u) = −2x/(2√(1 − x²)).'),
    mc('(e^(x²))′ =',['2x·e^(x²)','e^(x²)','x²·e^(x² − 1)','e^(2x)'],0,'eᵘ·u′ con u = x².'),
    mc('Si x² + y² = 25, por derivación implícita y′ =',['−x/y','x/y','−y/x','2x + 2y'],0,'2x + 2y·y′ = 0.'),
    mc('Si f(x) = x⁴, f″(x) =',['12x²','4x³','24x','12x³'],0,'f′ = 4x³ ⇒ f″ = 12x².')
   ],
   examen:[
    op('Derivá f(x) = (3x² + 1)⁵.','f′(x) = 30x(3x² + 1)⁴','5(3x² + 1)⁴·6x.'),
    op('Derivá f(x) = sen³(2x).','f′(x) = 6 sen²(2x)·cos(2x)','Tres capas: cubo, seno, 2x.'),
    op('Derivá f(x) = x²·e^(−x).','f′(x) = e^(−x)(2x − x²) = x·e^(−x)(2 − x)','Producto + cadena: (e^(−x))′ = −e^(−x).'),
    op('Hallá la pendiente de la tangente a x² + y² = 25 en (3, 4) y la ecuación de la tangente.','y′ = −3/4 · y = −¾x + 25/4','y − 4 = −¾(x − 3) ⇒ y = −¾x + 9/4 + 4 = −¾x + 25/4.'),
    op('Derivá y = xˣ (x &gt; 0).','y′ = xˣ(ln x + 1)','ln y = x ln x ⇒ y′/y = ln x + 1.')
   ],
   parcial:[
    op('Derivá f(x) = ln(√((x + 1)/(x − 1))) simplificando antes con propiedades.','f′(x) = −1/(x² − 1)','f = ½[ln(x + 1) − ln(x − 1)] ⇒ f′ = ½[1/(x + 1) − 1/(x − 1)] = ½·(−2)/(x² − 1).'),
    op('Derivá implícitamente x³ + y³ = 6xy y hallá y′ en (3, 3).','y′ = (2y − x²)/(y² − 2x) · en (3, 3): y′ = −1','3x² + 3y²y′ = 6y + 6xy′ ⇒ y′(3y² − 6x) = 6y − 3x². En (3, 3): (6 − 9)/(9 − 6) = −1.'),
    vfm('Decidí V o F.',[
     ['(cos(x²))′ = −sen(x²)',false,'Falta la cadena: −2x·sen(x²).'],
     ['(ln(eˣ + 1))′ = eˣ/(eˣ + 1)',true,'u′/u.'],
     ['(2ˣ)′ = x·2ˣ⁻¹',false,'Es exponencial, no potencia: 2ˣ·ln 2.'],
     ['(sen x)⁽⁴⁾ = sen x',true,'sen → cos → −sen → −cos → sen.'],
     ['((x² + 1)¹⁰)′ = 20x(x² + 1)⁹',true,'10(x² + 1)⁹·2x.']
    ]),
    op('Derivá y = (sen x)^x en (0, π).','y′ = (sen x)^x·[ln(sen x) + x·cotg x]','ln y = x·ln(sen x) ⇒ y′/y = ln(sen x) + x·cos x/sen x.'),
    mc('Si f(x) = e^(2x), entonces f⁽ⁿ⁾(x) (derivada n-ésima) es:',['2ⁿ·e^(2x)','e^(2x)','2n·e^(2x)','n·e^(2x)'],0,'Cada derivada saca un factor 2.')
   ]
  }},

 {id:'d5',n:'25',u:5,nuevo:true,titulo:'Recta tangente y aplicaciones',pre:'Necesitás: <b>reglas de derivación</b>',desc:'Ecuación de la tangente y la normal, tangentes horizontales o paralelas a una recta, velocidad y aceleración, costo e ingreso marginal.',
  exams:{
   basico:[
    mc('La ecuación de la tangente a f en x₀ es:',['y − f(x₀) = f′(x₀)(x − x₀)','y = f′(x)','y = f(x₀)·x','y − x₀ = f(x)'],0,'Punto (x₀, f(x₀)) y pendiente f′(x₀).'),
    mc('La tangente a f es horizontal donde:',['f′(x) = 0','f(x) = 0','f″(x) = 0','f′(x) = 1'],0,'Pendiente 0.'),
    mc('Si v(t) es la velocidad, la aceleración es:',['v′(t)','∫v','v(t)/t','v(t)²'],0,'a = v′ = s″.'),
    mc('La pendiente de la tangente a f(x) = x² en x = 3 es:',['6','9','3','2'],0,'f′(x) = 2x.')
   ],
   normal:[
    mc('La tangente a f(x) = x² en x = 1 es:',['y = 2x − 1','y = 2x + 1','y = x','y = 2x'],0,'f(1) = 1, f′(1) = 2: y − 1 = 2(x − 1).'),
    mc('Si la pendiente de la tangente es 2, la de la normal es:',['−1/2','1/2','−2','2'],0,'Son perpendiculares: m·m′ = −1.'),
    mc('s(t) = t³ − 6t² + 9t. ¿En qué instantes está quieto el móvil?',['t = 1 y t = 3','t = 0','t = 2','nunca'],0,'v = 3t² − 12t + 9 = 3(t − 1)(t − 3).',F.posicion),
    mc('C(x) = x² + 10x + 500. El costo marginal en x = 20 es:',['50','1100','30','40'],0,'C′(x) = 2x + 10.')
   ],
   examen:[
    op('Hallá la tangente y la normal a f(x) = x³ − 2x en x₀ = 1.','Tangente: y = x − 2 · Normal: y = −x','f(1) = −1, f′(x) = 3x² − 2 ⇒ f′(1) = 1.'),
    op('Hallá la tangente a f(x) = ln x en x₀ = 1.','y = x − 1','f(1) = 0, f′(1) = 1.'),
    op('¿En qué punto la tangente a f(x) = x² − 4x es paralela a y = 2x + 7?','(3, −3)','f′(x) = 2x − 4 = 2 ⇒ x = 3; f(3) = −3.'),
    vfm('El gráfico muestra la posición s(t) = t³ − 6t² + 9t de un móvil.',[
     ['En t = 1 la velocidad es 0',true,'La tangente es horizontal (máximo de s).'],
     ['Entre t = 1 y t = 3 el móvil retrocede',true,'s decrece: v &lt; 0.'],
     ['La aceleración en t = 2 es 0',true,'a = 6t − 12.'],
     ['En t = 4 el móvil está más lejos del origen que en t = 1',false,'s(4) = 64 − 96 + 36 = 4 = s(1).']
    ],F.posicion),
    op('El ingreso por vender x unidades es I(x) = 200x − 0,5x². Calculá el ingreso marginal en x = 100 e interpretalo.','I′(100) = 100: vender la unidad 101 aumenta el ingreso en aproximadamente $100.','I′(x) = 200 − x.')
   ],
   parcial:[
    vfm('El gráfico muestra f(x) = x²/2 y dos tangentes punteadas, en A(2, 2) y en B(−1, ½).',[
     ['La tangente en A es y = 2x − 2',true,'f′(2) = 2: y − 2 = 2(x − 2).'],
     ['La tangente en B tiene pendiente −1',true,'f′(x) = x ⇒ f′(−1) = −1.'],
     ['Las dos tangentes son perpendiculares',false,'2·(−1) = −2 ≠ −1.'],
     ['Ninguna tangente a f es horizontal',false,'En x = 0 la tangente es y = 0.']
    ],F.dosTang),
    op('Hallá la ecuación de las rectas tangentes a f(x) = x² que pasan por el punto (1, −3) (que NO está en la curva).','y = 6x − 9 (tangente en x = 3) e y = −2x − 1 (tangente en x = −1)','Tangente en a: y = 2a·x − a². Pasa por (1, −3): −3 = 2a − a² ⇒ a² − 2a − 3 = 0 ⇒ a = 3 o a = −1.'),
    op('Un globo esférico se infla de modo que su radio crece a 2 cm/s. ¿A qué velocidad crece el volumen cuando r = 10 cm? (V = 4/3·π·r³)','dV/dt = 800π cm³/s ≈ 2513 cm³/s','dV/dt = 4πr²·dr/dt = 4π·100·2. Es un problema de "razón de cambio relacionada": regla de la cadena respecto del tiempo.'),
    op('Hallá a y b para que la recta y = 3x − 1 sea tangente a f(x) = ax² + b en x = 1.','a = 3/2, b = 1/2','f(1) = a + b = 2 (el punto de la recta) y f′(1) = 2a = 3.'),
    mc('Un objeto cae con s(t) = 5t² (metros). Su velocidad a los 3 s es:',['30 m/s','45 m/s','15 m/s','10 m/s'],0,'v = 10t.')
   ]
  }},

 {id:'d6',n:'26',u:5,nuevo:true,titulo:'Estudio de funciones',pre:'Necesitás: <b>derivadas</b> y <b>límites</b>',desc:'Crecimiento, puntos críticos, máximos y mínimos (criterios de la 1ª y 2ª derivada), concavidad, inflexión, extremos absolutos y lectura de gráficos.',
  exams:{
   basico:[
    mc('Si f′(x) &gt; 0 en un intervalo, f es:',['creciente','decreciente','cóncava hacia arriba','constante'],0,'Pendientes positivas: sube.'),
    mc('Si f″(x) &gt; 0, la gráfica es:',['cóncava hacia arriba (∪)','cóncava hacia abajo (∩)','creciente','decreciente'],0,'f″ mide hacia dónde "dobla" la curva.'),
    mc('Los puntos críticos son donde:',['f′ = 0 o f′ no existe','f = 0','f″ = 0','f es máxima'],0,'Son candidatos a extremos.'),
    mc('Si f′(c) = 0 y f″(c) &lt; 0, en c hay:',['un máximo relativo','un mínimo relativo','una inflexión','nada'],0,'Criterio de la segunda derivada.')
   ],
   normal:[
    vfm('El gráfico es el de f(x) = x³ − 3x.',[
     ['f crece en (−∞, −1) y en (1, +∞)',true,'f′ = 3x² − 3 &gt; 0 para |x| &gt; 1.'],
     ['f tiene un máximo relativo en (−1, 2)',true,'Ahí pasa de subir a bajar.'],
     ['f tiene un mínimo absoluto en (1, −2)',false,'Es relativo: f toma valores menores cuando x → −∞.'],
     ['(0, 0) es punto de inflexión',true,'f″ = 6x cambia de signo en 0.']
    ],F.cubica),
    mc('f(x) = x² − 6x + 5 tiene un mínimo en:',['x = 3','x = 5','x = 1','x = −3'],0,'f′ = 2x − 6 = 0.'),
    mc('f(x) = x³ tiene en x = 0:',['un punto de inflexión (no es extremo)','un máximo','un mínimo','una asíntota'],0,'f′(0) = 0, pero f′ no cambia de signo.'),
    mc('Para f(x) = x³ − 3x² + 1, f″(x) = 6x − 6. La inflexión está en:',['x = 1','x = 0','x = 2','x = 6'],0,'6x − 6 = 0 y cambia de signo.')
   ],
   examen:[
    op('Estudiá crecimiento y extremos de f(x) = 2x³ − 3x² − 12x + 1.','f′ = 6(x − 2)(x + 1). Crece en (−∞, −1) ∪ (2, +∞), decrece en (−1, 2). Máx (−1, 8), mín (2, −19).','f(−1) = −2 − 3 + 12 + 1 = 8; f(2) = 16 − 12 − 24 + 1 = −19.'),
    op('Estudiá la concavidad de f(x) = x⁴ − 6x² y hallá sus puntos de inflexión.','f″ = 12x² − 12. Cóncava hacia arriba en (−∞, −1) ∪ (1, +∞), hacia abajo en (−1, 1). Inflexiones: (−1, −5) y (1, −5).',''),
    vfm('El gráfico es el de la DERIVADA f′ de una función f (ojo: no es f).',[
     ['f es creciente en (−1, 2)',false,'Ahí f′ &lt; 0: f decrece.'],
     ['f tiene un máximo relativo en x = −1',true,'f′ pasa de + a −.'],
     ['f tiene un mínimo relativo en x = 2',true,'f′ pasa de − a +.'],
     ['f tiene un punto de inflexión en x = 1/2',true,'f′ tiene su mínimo ahí: f″ cambia de signo.']
    ],F.fp,'Gráfico de f′(x) = (x + 1)(x − 2)'),
    op('Hallá los extremos absolutos de f(x) = x³ − 3x en [0, 3].','Máximo absoluto 18 (x = 3) · mínimo absoluto −2 (x = 1)','Se evalúa en el crítico interior (x = 1) y en los extremos: f(0) = 0, f(1) = −2, f(3) = 18.'),
    op('Estudiá f(x) = x·e^(−x): crecimiento y extremos.','f′ = e^(−x)(1 − x). Crece en (−∞, 1), decrece en (1, +∞). Máximo (1, 1/e).','e^(−x) &gt; 0 siempre; el signo lo da 1 − x.')
   ],
   parcial:[
    vfm('Gráfico de f(x) = x⁴ − 4x³ con tres puntos marcados.',[
     ['f tiene un mínimo relativo en (3, −27)',true,'f′ = 4x²(x − 3): pasa de − a + en 3.'],
     ['f tiene un máximo relativo en (0, 0)',false,'f′ es negativa a ambos lados de 0: no hay extremo.'],
     ['(0, 0) y (2, −16) son puntos de inflexión',true,'f″ = 12x(x − 2) cambia de signo en 0 y en 2.'],
     ['f es decreciente en (−∞, 3)',true,'f′ ≤ 0 ahí (solo se anula en 0).'],
     ['f es cóncava hacia abajo en (0, 2)',true,'f″ &lt; 0 entre 0 y 2.']
    ],F.cuartica),
    op('Estudiá completamente f(x) = x²/(x − 1): dominio, asíntotas, crecimiento, extremos y concavidad.','Dom ℝ − {1} · AV x = 1, AO y = x + 1 · f′ = x(x − 2)/(x − 1)²: crece en (−∞, 0) ∪ (2, ∞), decrece en (0, 1) ∪ (1, 2) · máx (0, 0), mín (2, 4) · f″ = 2/(x − 1)³: ∩ en (−∞, 1), ∪ en (1, ∞)','x²/(x − 1) = x + 1 + 1/(x − 1).'),
    op('Hallá a, b y c para que f(x) = x³ + ax² + bx + c tenga un extremo en x = 1, un punto de inflexión en x = 2 y pase por (0, 4).','a = −6, b = 9, c = 4','f″(2) = 12 + 2a = 0 ⇒ a = −6. f′(1) = 3 + 2a + b = 0 ⇒ b = 9. f(0) = c = 4.'),
    mc('Si f″(c) = 0, entonces en c:',['puede haber o no inflexión: hay que ver si f″ cambia de signo','siempre hay inflexión','hay un extremo','f no es derivable'],0,'x⁴ tiene f″(0) = 0 y no tiene inflexión en 0.'),
    vf('Si f es derivable en todo ℝ y tiene dos máximos relativos, entonces tiene al menos un mínimo relativo entre ellos.',true,'Entre dos "cimas" la función tiene que bajar y volver a subir.')
   ]
  }},

 {id:'d7',n:'27',u:5,nuevo:true,titulo:'Optimización, L\'Hôpital y teoremas',pre:'Necesitás: <b>estudio de funciones</b>',desc:'Problemas de máximos y mínimos (áreas, volúmenes, costos y ganancias), regla de L\'Hôpital y teoremas de Rolle y del valor medio.',
  exams:{
   basico:[
    mc('En un problema de optimización, después de armar la función a optimizar hay que:',['derivarla, igualar a 0 y verificar','integrarla','igualarla a 0','graficarla solamente'],0,'Los óptimos están en los puntos críticos (o en los bordes).'),
    mc('La regla de L\'Hôpital se aplica a límites del tipo:',['0/0 o ∞/∞','1/0','0·5','cualquier límite'],0,'Solo a esas indeterminaciones (las demás hay que llevarlas a un cociente).'),
    mc('lim<sub>x→0</sub> (eˣ − 1)/x =',['1','0','e','∞'],0,'L\'H: eˣ/1 → 1.'),
    mc('Entre los rectángulos de perímetro 20, el de mayor área es:',['el cuadrado de lado 5','el de 8 × 2','el de 9 × 1','todos tienen la misma área'],0,'A = x(10 − x) es máxima en x = 5.')
   ],
   normal:[
    mc('lim<sub>x→∞</sub> ln x / x =',['0','1','∞','no existe'],0,'L\'H: (1/x)/1 → 0. ln x crece mucho más lento que x.'),
    mc('lim<sub>x→0</sub> (1 − cos x)/x² =',['1/2','0','1','2'],0,'L\'H dos veces: sen x/(2x) → cos x/2 → 1/2.'),
    mc('G(x) = −x² + 80x − 300 es máxima en:',['x = 40','x = 80','x = 300','x = 20'],0,'G′ = −2x + 80 = 0.'),
    mc('Para f(x) = x² en [0, 2], el c del teorema del valor medio es:',['1','2','0','1/2'],0,'f′(c) = 2c = (4 − 0)/2 = 2.')
   ],
   examen:[
    op('Con 100 m de alambre se cerca un terreno rectangular junto a un río (no se cerca el lado del río). ¿Qué dimensiones dan el área máxima?','25 m × 50 m (el lado de 50 paralelo al río) · Área 1250 m²','2x + y = 100; A = x(100 − 2x); A′ = 100 − 4x = 0.'),
    op('De una lámina cuadrada de 12 cm se cortan cuadrados de lado x en las esquinas para hacer una caja sin tapa. ¿Qué x maximiza el volumen?','x = 2 cm · V = 128 cm³','V = x(12 − 2x)²; V′ = (12 − 2x)(12 − 6x).'),
    op('Calculá lim<sub>x→0</sub> (sen x − x)/x³.','−1/6','L\'Hôpital tres veces.'),
    op('Calculá lim<sub>x→0⁺</sub> x·ln x.','0','0·(−∞) ⇒ ln x/(1/x) ⇒ L\'H: (1/x)/(−1/x²) = −x → 0.'),
    op('Ingreso I(x) = 100x − x², costo C(x) = 20x + 300. ¿Qué producción maximiza la ganancia?','x = 40 · Ganancia máxima 1300','G = −x² + 80x − 300.')
   ],
   parcial:[
    op('Se quiere fabricar una lata cilíndrica de 1 litro (1000 cm³) usando la menor cantidad de chapa. ¿Qué radio y altura debe tener?','r = ∛(500/π) ≈ 5,42 cm · h = 2r ≈ 10,84 cm','S = 2πr² + 2πrh y πr²h = 1000 ⇒ S(r) = 2πr² + 2000/r. S′ = 4πr − 2000/r² = 0 ⇒ r³ = 500/π. El óptimo tiene altura igual al diámetro.'),
    op('Hallá el punto de la recta y = 2x + 1 más cercano al origen.','(−2/5, 1/5)','Minimizar d² = x² + (2x + 1)²: (d²)′ = 2x + 4(2x + 1) = 10x + 4 = 0 ⇒ x = −2/5.'),
    op('Calculá lim<sub>x→0⁺</sub> x^x.','1','y = xˣ ⇒ ln y = x ln x → 0 ⇒ y → e⁰ = 1.'),
    vfm('Decidí V o F.',[
     ['lim<sub>x→∞</sub> x²/eˣ = 0',true,'L\'H dos veces: 2/eˣ → 0. La exponencial le gana a cualquier potencia.'],
     ['Si f(1) = f(3) y f es derivable, existe c en (1, 3) con f′(c) = 0',true,'Teorema de Rolle (f continua en [1, 3]).'],
     ['L\'Hôpital sirve para lim<sub>x→0</sub> (x + 1)/x',false,'Da 1/0, no es indeterminación: el límite no existe (laterales ±∞).'],
     ['Para aplicar L\'Hôpital se usa la regla del cociente',false,'Se derivan numerador y denominador por separado.']
    ]),
    op('Una ventana tiene forma de rectángulo coronado por un semicírculo. Si el perímetro es 10 m, ¿qué ancho maximiza la superficie?','Ancho x = 20/(4 + π) ≈ 2,80 m','Con ancho x (radio x/2) y alto h: x + 2h + πx/2 = 10. A = xh + πx²/8 = 5x − x²/2 − πx²/8. A′ = 5 − x − πx/4 = 0.')
   ]
  }}
];

var T6=[
 {id:'i1',n:'28',u:6,nuevo:true,titulo:'Primitivas e integrales inmediatas',pre:'Necesitás: <b>la tabla de derivadas</b>',desc:'Primitiva, integral indefinida, constante C, linealidad, tabla de integrales inmediatas y condiciones iniciales.',
  exams:{
   basico:[
    mc('∫ x³ dx =',['x⁴/4 + C','3x² + C','x⁴ + C','x³/3 + C'],0,'Sumo 1 al exponente y divido por el nuevo exponente.'),
    mc('∫ 1/x dx =',['ln|x| + C','−1/x² + C','x⁰/0','1/x² + C'],0,'Es la excepción a la regla de la potencia.'),
    mc('∫ sen x dx =',['−cos x + C','cos x + C','sen x + C','−sen x + C'],0,'(−cos x)′ = sen x.'),
    mc('¿Por qué se agrega + C?',['porque la derivada de una constante es 0','por convención, sin motivo','porque C es el área','porque la integral es una constante'],0,'Hay infinitas primitivas que difieren en una constante.')
   ],
   normal:[
    mc('∫ (3x² − 4x + 5) dx =',['x³ − 2x² + 5x + C','6x − 4 + C','x³ − 4x² + 5x + C','3x³ − 4x² + 5 + C'],0,'Término a término.'),
    mc('∫ √x dx =',['(2/3)x^(3/2) + C','1/(2√x) + C','x^(3/2) + C','(3/2)x^(2/3) + C'],0,'x^(1/2) ⇒ x^(3/2)/(3/2).'),
    mc('∫ 1/x² dx =',['−1/x + C','ln(x²) + C','1/x + C','−2/x³ + C'],0,'x⁻² ⇒ x⁻¹/(−1).'),
    vfm('El gráfico muestra tres funciones F₁, F₂ y F₃.',[
     ['Las tres son primitivas de la misma función',true,'Son la misma curva desplazada verticalmente: F₂ = F₁ + 2, F₃ = F₁ − 3.'],
     ['En cada x, las tres tienen la misma pendiente',true,'Sus derivadas son iguales.'],
     ['Si F₁(x) = x², las tres son primitivas de 2x',true,'(x² + C)′ = 2x.'],
     ['∫ 2x dx = x² (sin constante)',false,'Hay que agregar + C: el resultado es toda la familia.']
    ],F.primitivas)
   ],
   examen:[
    op('Calculá ∫ (2/x + eˣ − 3 sen x) dx.','2 ln|x| + eˣ + 3 cos x + C',''),
    op('Calculá ∫ (x² + 1)²/x² dx.','x³/3 + 2x − 1/x + C','Desarrollar y separar: x² + 2 + x⁻².'),
    op('Calculá ∫ (√x + 1/√x) dx.','(2/3)x^(3/2) + 2√x + C',''),
    op('Hallá f si f′(x) = 6x² − 2x y f(1) = 4.','f(x) = 2x³ − x² + 3','f = 2x³ − x² + C; 2 − 1 + C = 4.'),
    vf('∫ x·eˣ dx = (x²/2)·eˣ + C',false,'No hay "regla del producto" para integrar. Derivando (x²/2)eˣ no se obtiene x·eˣ. Se resuelve por partes: eˣ(x − 1) + C.')
   ],
   parcial:[
    op('Un móvil tiene aceleración a(t) = 6t (m/s²). En t = 0 tiene velocidad 2 m/s y está en la posición 1 m. Hallá v(t) y s(t).','v(t) = 3t² + 2 · s(t) = t³ + 2t + 1','v = ∫ a = 3t² + C₁ con v(0) = 2; s = ∫ v = t³ + 2t + C₂ con s(0) = 1.'),
    op('Calculá ∫ (x³ − 2x + 1)/x dx.','x³/3 − 2x + ln|x| + C','Separar: x² − 2 + 1/x.'),
    vfm('Decidí V o F.',[
     ['∫ 5 dx = 5x + C',true,''],
     ['∫ eˣ dx = eˣ + C',true,'eˣ es su propia derivada.'],
     ['∫ (f·g) dx = ∫ f dx · ∫ g dx',false,'No vale.'],
     ['∫ 1/(1 + x²) dx = arctg x + C',true,'Dato de tabla.'],
     ['Si F′ = G′, entonces F = G',false,'Pueden diferir en una constante.']
    ]),
    op('El costo marginal es C′(x) = 3x² − 4x + 10 y el costo fijo es 200. Hallá el costo total C(x) y el costo de 10 unidades.','C(x) = x³ − 2x² + 10x + 200 · C(10) = 1100','El costo fijo es C(0).'),
    mc('Una primitiva de f(x) = cos x que pasa por (0, 3) es:',['F(x) = sen x + 3','F(x) = −sen x + 3','F(x) = sen x','F(x) = cos x + 2'],0,'sen 0 + C = 3.')
   ]
  }},

 {id:'i2',n:'29',u:6,nuevo:true,titulo:'Integración por sustitución',pre:'Necesitás: <b>regla de la cadena</b> e integrales inmediatas',desc:'Cambio de variable u = g(x), el patrón u′/u = ln|u|, sustituciones con despeje y en integrales definidas.',
  exams:{
   basico:[
    mc('Para ∫ 2x(x² + 1)⁵ dx conviene tomar:',['u = x² + 1','u = 2x','u = (x² + 1)⁵','u = x'],0,'Lo de adentro, cuya derivada (2x) ya está multiplicando.'),
    mc('∫ cos(3x) dx =',['sen(3x)/3 + C','3 sen(3x) + C','sen(3x) + C','−sen(3x)/3 + C'],0,'u = 3x, dx = du/3.'),
    mc('∫ e^(5x) dx =',['e^(5x)/5 + C','5e^(5x) + C','e^(5x) + C','e^(6x)/6 + C'],0,'Se divide por el coeficiente de x.'),
    mc('La sustitución es "la inversa" de:',['la regla de la cadena','la regla del producto','la regla del cociente','L\'Hôpital'],0,'Por eso aparece la derivada de lo de adentro.')
   ],
   normal:[
    mc('∫ 2x(x² + 1)⁵ dx =',['(x² + 1)⁶/6 + C','(x² + 1)⁶ + C','x²(x² + 1)⁶/6 + C','5(x² + 1)⁴ + C'],0,'∫ u⁵ du = u⁶/6.'),
    mc('∫ x/(x² + 4) dx =',['½ ln(x² + 4) + C','ln(x² + 4) + C','arctg(x/2) + C','2 ln|x| + C'],0,'u = x² + 4, du = 2x dx.'),
    mc('∫ x·e^(x²) dx =',['e^(x²)/2 + C','e^(x²) + C','2x·e^(x²) + C','x²e^(x²)/2 + C'],0,'u = x², x dx = du/2.'),
    mc('∫ (ln x)/x dx =',['(ln x)²/2 + C','ln(ln x) + C','1/x² + C','ln x + C'],0,'u = ln x, du = dx/x.')
   ],
   examen:[
    op('Calculá ∫ x²·sen(x³) dx.','−cos(x³)/3 + C','u = x³, du = 3x² dx.'),
    op('Calculá ∫ tg x dx.','−ln|cos x| + C','tg x = sen x/cos x; u = cos x.'),
    op('Calculá ∫ x·√(x² + 1) dx.','(x² + 1)^(3/2)/3 + C','u = x² + 1 ⇒ ½∫ u^(1/2) du = ½·(2/3)u^(3/2).'),
    op('Calculá ∫ eˣ/(eˣ + 1) dx.','ln(eˣ + 1) + C','Arriba está la derivada de abajo: u′/u.'),
    op('Calculá ∫₀¹ 2x(x² + 1)³ dx cambiando los límites.','15/4','u: de 1 a 2. ∫₁² u³ du = [u⁴/4]₁² = 4 − 1/4.')
   ],
   parcial:[
    op('Calculá ∫ x·√(x − 1) dx.','(2/5)(x − 1)^(5/2) + (2/3)(x − 1)^(3/2) + C','u = x − 1, x = u + 1: ∫ (u + 1)u^(1/2) du.'),
    op('Calculá ∫ sen³x·cos x dx.','sen⁴x/4 + C','u = sen x.'),
    op('Calculá ∫ 1/(x·ln x) dx.','ln|ln x| + C','u = ln x, du = dx/x ⇒ ∫ du/u.'),
    vfm('Decidí si cada sustitución propuesta sirve (deja todo en u, sin x sueltas).',[
     ['∫ x³·e^(x⁴) dx con u = x⁴',true,'du = 4x³ dx: el x³ ya está.'],
     ['∫ e^(x²) dx con u = x²',false,'du = 2x dx, pero no hay x afuera: no se puede reemplazar. De hecho, esta integral no tiene primitiva elemental.'],
     ['∫ cos x/(1 + sen x) dx con u = 1 + sen x',true,'du = cos x dx. Da ln|1 + sen x| + C.'],
     ['∫ x·cos x dx con u = cos x',false,'Sobra una x y falta el sen x: va por partes.']
    ]),
    op('Calculá ∫₀^(π/2) sen x·cos²x dx.','1/3','u = cos x: de 1 a 0. −∫₁⁰ u² du = ∫₀¹ u² du = 1/3.')
   ]
  }},

 {id:'i3',n:'30',u:6,nuevo:true,titulo:'Integración por partes y fracciones simples',pre:'Necesitás: <b>sustitución</b> y factoreo de polinomios',desc:'∫ u dv = uv − ∫ v du (regla LIATE, partes reiteradas y cíclicas) y descomposición en fracciones simples.',
  exams:{
   basico:[
    mc('La fórmula de integración por partes es:',['∫ u dv = uv − ∫ v du','∫ u dv = uv + ∫ v du','∫ uv = ∫u·∫v','∫ u dv = u′v′'],0,'Sale de la regla del producto.'),
    mc('En ∫ x·eˣ dx, según LIATE, conviene tomar u =',['x','eˣ','x·eˣ','dx'],0,'A (algebraica) va antes que E (exponencial).'),
    mc('En ∫ ln x dx se toma u = ln x y dv =',['dx','x dx','ln x dx','1/x dx'],0,'Es el truco del "dv = dx".'),
    mc('Para ∫ 1/(x² − 1) dx se usa:',['fracciones simples','partes','sustitución u = x² − 1','tabla directa'],0,'x² − 1 = (x − 1)(x + 1), y arriba no está la derivada de abajo.')
   ],
   normal:[
    mc('∫ x·eˣ dx =',['eˣ(x − 1) + C','x·eˣ + C','eˣ(x + 1) + C','x²eˣ/2 + C'],0,'x·eˣ − ∫ eˣ dx.'),
    mc('∫ ln x dx =',['x·ln x − x + C','1/x + C','x·ln x + C','(ln x)²/2 + C'],0,'x·ln x − ∫ x·(1/x) dx.'),
    mc('∫ x·cos x dx =',['x·sen x + cos x + C','x·sen x − cos x + C','−x·sen x + C','sen x + C'],0,'x·sen x − ∫ sen x dx = x·sen x + cos x.'),
    mc('1/[x(x + 1)] se descompone como:',['1/x − 1/(x + 1)','1/x + 1/(x + 1)','1/(x + 1)','x − (x + 1)'],0,'A = 1 (x = 0), B = −1 (x = −1).')
   ],
   examen:[
    op('Calculá ∫ x²·eˣ dx.','eˣ(x² − 2x + 2) + C','Partes dos veces.'),
    op('Calculá ∫ x·ln x dx.','(x²/2)·ln x − x²/4 + C','u = ln x (L va primero), dv = x dx.'),
    op('Calculá ∫ (3x + 1)/[(x − 1)(x + 2)] dx.','(4/3) ln|x − 1| + (5/3) ln|x + 2| + C','3x + 1 = A(x + 2) + B(x − 1): A = 4/3, B = 5/3.'),
    op('Calculá ∫ (x + 3)/(x − 1)² dx.','ln|x − 1| − 4/(x − 1) + C','A/(x − 1) + B/(x − 1)²: A = 1, B = 4.'),
    op('Calculá ∫ x·e^(2x) dx.','e^(2x)(x/2 − 1/4) + C','u = x, dv = e^(2x) dx ⇒ v = e^(2x)/2.')
   ],
   parcial:[
    op('Calculá ∫ eˣ·sen x dx.','eˣ(sen x − cos x)/2 + C','Partes dos veces y se despeja la integral original (cíclica).'),
    op('Calculá ∫ (x² + 1)/(x − 1) dx.','x²/2 + x + 2 ln|x − 1| + C','Grado de arriba ≥ grado de abajo: dividir primero. (x² + 1)/(x − 1) = x + 1 + 2/(x − 1).'),
    op('Calculá ∫ arctg x dx.','x·arctg x − ½ ln(1 + x²) + C','u = arctg x, dv = dx; luego ∫ x/(1 + x²) dx por sustitución.'),
    op('Calculá ∫ (5x − 1)/(x² − x − 2) dx.','3 ln|x − 2| + 2 ln|x + 1| + C','x² − x − 2 = (x − 2)(x + 1). 5x − 1 = A(x + 1) + B(x − 2): x = 2 ⇒ A = 3; x = −1 ⇒ B = 2.'),
    vfm('¿Qué método conviene en cada caso?',[
     ['∫ x·sen(x²) dx → partes',false,'Sustitución u = x²: la derivada (2x) ya está.'],
     ['∫ x·sen x dx → partes con u = x',true,'Algebraica × trigonométrica.'],
     ['∫ 2x/(x² + 3) dx → fracciones simples',false,'Arriba está la derivada de abajo: sustitución, da ln(x² + 3).'],
     ['∫ 1/(x² − 4) dx → fracciones simples',true,'(x − 2)(x + 2) y arriba una constante.'],
     ['∫ x³·ln x dx → partes con u = ln x',true,'LIATE: logaritmo primero.']
    ])
   ]
  }},

 {id:'i4',n:'31',u:6,nuevo:true,titulo:'Integral definida, Riemann y Barrow',pre:'Necesitás: <b>primitivas</b>',desc:'Sumas de Riemann, integral definida, Teorema Fundamental del Cálculo, regla de Barrow y propiedades de la integral definida.',
  exams:{
   basico:[
    mc('∫₀² x dx =',['2','4','1','x²/2'],0,'[x²/2]₀² = 2. La definida da un NÚMERO.'),
    mc('La regla de Barrow dice que ∫ₐᵇ f(x) dx =',['F(b) − F(a)','F(a) − F(b)','f(b) − f(a)','F(b)·F(a)'],0,'F primitiva de f.'),
    mc('∫ₐᵃ f(x) dx =',['0','f(a)','1','F(a)'],0,'No hay intervalo.'),
    mc('∫ᵇₐ f(x) dx (límites invertidos) es igual a:',['−∫ₐᵇ f(x) dx','∫ₐᵇ f(x) dx','0','1/∫ₐᵇ f'],0,'Invertir los límites cambia el signo.')
   ],
   normal:[
    mc('∫₀² x² dx =',['8/3','4','8','2/3'],0,'[x³/3]₀².'),
    mc('∫₀^π sen x dx =',['2','0','1','−2'],0,'[−cos x]₀^π = 1 + 1.'),
    mc('∫₋₁¹ x³ dx =',['0','1/2','2','−1/2'],0,'x³ es impar en un intervalo simétrico.'),
    vfm('El gráfico muestra f(x) = x² en [0, 3] con 3 rectángulos de una suma de Riemann.',[
     ['Se usó el extremo derecho de cada subintervalo',true,'Cada rectángulo toca la curva en su esquina derecha.'],
     ['La suma vale 1 + 4 + 9 = 14',true,'Base 1, alturas f(1), f(2), f(3).'],
     ['La suma sobreestima el área real',true,'x² es creciente: con el extremo derecho los rectángulos sobresalen. El valor exacto es 9.'],
     ['Con más rectángulos la suma se aleja del valor real',false,'Se acerca: en el límite da la integral.']
    ],F.riem)
   ],
   examen:[
    op('Calculá ∫₁³ (2x + 1) dx.','10','[x² + x]₁³ = 12 − 2.'),
    op('Calculá ∫₁^e (1/x) dx y ∫₀¹ eˣ dx.','1 · e − 1',''),
    op('Calculá la suma de Riemann de f(x) = x² en [0, 2] con n = 4 rectángulos y extremo derecho. Compará con el valor exacto.','S = 0,5·(0,25 + 1 + 2,25 + 4) = 3,75 · Exacto: 8/3 ≈ 2,667',''),
    op('Si F(x) = ∫₀ˣ sen(t²) dt, calculá F′(x).','F′(x) = sen(x²)','Teorema Fundamental, parte 1.'),
    op('Si ∫₀³ f = 5 y ∫₀⁷ f = 12, calculá ∫₃⁷ 2f(x) dx.','14','∫₃⁷ f = 12 − 5 = 7.')
   ],
   parcial:[
    op('Calculá ∫₀¹ x·eˣ dx.','1','[eˣ(x − 1)]₀¹ = 0 − (−1).'),
    op('Calculá ∫₀^(π/2) x·cos x dx.','π/2 − 1','[x sen x + cos x]₀^(π/2) = π/2 − 1.'),
    op('Derivá G(x) = ∫₁^(x²) ln t dt.','G′(x) = 2x·ln(x²) = 4x·ln x','TFC + regla de la cadena.'),
    vfm('Decidí V o F.',[
     ['∫₋₂² x⁵ dx = 0',true,'Función impar en intervalo simétrico.'],
     ['∫₋₁¹ x² dx = 2∫₀¹ x² dx',true,'Función par.'],
     ['Si ∫ₐᵇ f = 0, entonces f = 0 en [a, b]',false,'Las partes positivas y negativas se pueden compensar, como sen x en [0, 2π].'],
     ['∫₀¹ x dx = ∫₀¹ t dt',true,'El nombre de la variable no importa.'],
     ['d/dx ∫₀³ x² dx = x²',false,'∫₀³ x² dx = 9 es un número: su derivada es 0.']
    ]),
    op('Calculá ∫₁² 1/[x(x + 1)] dx.','ln(4/3)','[ln|x| − ln|x + 1|]₁² = (ln 2 − ln 3) − (0 − ln 2) = 2 ln 2 − ln 3.')
   ]
  }},

 {id:'i5',n:'32',u:6,nuevo:true,titulo:'Áreas y aplicaciones de la integral',pre:'Necesitás: <b>integral definida</b>',desc:'Área bajo una curva (con cambio de signo), área entre curvas, valor medio, distancia recorrida, costo total, volumen de revolución e integrales impropias.',
  exams:{
   basico:[
    mc('El área entre dos curvas se calcula como:',['∫ (la de arriba − la de abajo) dx','∫ f·g dx','∫ f dx + ∫ g dx','f(b) − g(a)'],0,'"Techo menos piso".'),
    mc('Los límites de integración del área entre dos curvas suelen ser:',['las abscisas de los puntos de corte','0 y 1','los ceros de f′','cualquier par de números'],0,'Se obtienen igualando f(x) = g(x).'),
    mc('Si f(x) &lt; 0 en [a, b], entonces ∫ₐᵇ f(x) dx es:',['negativa','positiva','cero','el área'],0,'La integral es "área con signo".'),
    mc('El valor medio de f en [a, b] es:',['(1/(b − a))·∫ₐᵇ f','∫ₐᵇ f','[f(a) + f(b)]/2','f′(c)'],0,'Es la "altura promedio".')
   ],
   normal:[
    mc('El área entre y = x e y = x² es:',['1/6','1/2','1/3','5/6'],0,'∫₀¹ (x − x²) dx.'),
    vfm('El gráfico muestra la región entre y = 2x e y = x².',[
     ['Las curvas se cortan en x = 0 y x = 2',true,'2x = x² ⇒ x(x − 2) = 0.'],
     ['Entre 0 y 2, la recta está por encima de la parábola',true,'Por ejemplo en x = 1: 2 &gt; 1.'],
     ['El área es ∫₀² (x² − 2x) dx',false,'Así da negativo: es al revés, (2x − x²).'],
     ['El área es 4/3',true,'[x² − x³/3]₀² = 4 − 8/3.']
    ],F.entre),
    mc('El valor medio de f(x) = x² en [0, 3] es:',['3','9','4,5','1'],0,'(1/3)·9.'),
    mc('La región bajo y = √x en [0, 4] gira alrededor del eje x. El volumen es:',['8π','16π','4π','8'],0,'π∫₀⁴ (√x)² dx = π∫₀⁴ x dx = 8π.',F.areaF)
   ],
   examen:[
    op('Calculá el área entre f(x) = 4 − x² y g(x) = x + 2.','9/2','Cortes: x = −2 y x = 1. ∫₋₂¹ (2 − x − x²) dx.'),
    vfm('Gráfico de f(x) = x² − 2x en [0, 3].',[
     ['f es negativa en (0, 2)',true,'La curva está debajo del eje.'],
     ['∫₀³ f(x) dx = 0',true,'[x³/3 − x²]₀³ = 9 − 9 = 0.'],
     ['El área de la región sombreada es 0',false,'El área es |−4/3| + 4/3 = 8/3. La integral da 0 porque las partes se compensan.'],
     ['El área entre f y el eje x en [0, 2] es 4/3',true,'|∫₀² (x² − 2x) dx| = |8/3 − 4|.']
    ],F.areaSigno),
    op('Calculá el área de la región entre y = x³ y el eje x en [−1, 2].','17/4','Partir en 0: 1/4 + 4.'),
    op('La velocidad de un móvil es v(t) = 3t² − 12 (m/s). Calculá el desplazamiento y la distancia recorrida entre t = 0 y t = 3.','Desplazamiento: −9 m · Distancia: 23 m','v = 0 en t = 2. ∫₀² v = 8 − 24 = −16; ∫₂³ v = (27 − 36) − (8 − 24) = 7. Desplazamiento −16 + 7 = −9; distancia 16 + 7 = 23.'),
    op('Calculá ∫₁^∞ 1/x² dx y decidí si converge.','Converge, vale 1','lim [−1/x]₁ᵇ = lim (1 − 1/b) = 1.')
   ],
   parcial:[
    vfm('El gráfico muestra la velocidad v(t) (m/s) de un ciclista durante 6 segundos.',[
     ['Entre t = 0 y t = 2 acelera de forma constante',true,'La velocidad crece linealmente de 0 a 6.'],
     ['La distancia recorrida en los 6 s es el área sombreada',true,'Distancia = ∫ v dt (v ≥ 0).'],
     ['La distancia total es 28,5 m',true,'Triángulo de 0 a 2: (2·6)/2 = 6. Rectángulo de 2 a 5: 3·6 = 18. Trapecio de 5 a 6 (alturas 6 y 3): (6 + 3)/2 = 4,5. Total: 28,5 m.'],
     ['Entre t = 5 y t = 6 frena hasta detenerse',false,'Frena, pero en t = 6 todavía va a 3 m/s: no se detiene.'],
     ['Entre t = 2 y t = 5 recorre 18 m',true,'Rectángulo de base 3 y altura 6.']
    ],F.velocidad),
    op('Calculá el área encerrada entre y = x² − 4 e y = 2x − 1.','32/3','Cortes: x² − 2x − 3 = 0 ⇒ x = −1 y x = 3. Arriba está la recta: ∫₋₁³ (2x − 1 − x² + 4) dx = ∫₋₁³ (−x² + 2x + 3) dx = [−x³/3 + x² + 3x]₋₁³ = 9 − (−5/3) = 32/3.'),
    op('Un tanque recibe agua a razón de r(t) = 6t − t² L/min (0 ≤ t ≤ 6). ¿Cuántos litros entran? ¿Cuál es el caudal medio?','36 L · 6 L/min','∫₀⁶ (6t − t²) dt = 108 − 72.'),
    op('Calculá el volumen del sólido que se obtiene al girar y = x² en [0, 1] alrededor del eje x.','π/5','π∫₀¹ x⁴ dx.'),
    op('¿Converge ∫₀^∞ x·e^(−x) dx? Si converge, calculala.','Converge, vale 1','Primitiva por partes: −e^(−x)(x + 1). lim [−e^(−x)(x + 1)]₀ᵇ = 0 − (−1) = 1.')
   ]
  }}
];

/* ---------- Integración en el curso ---------- */
CURSO.unidades[5]={k:'Cálculo · Parte 1',n:'Límites y derivadas',guia:'guia-derivadas.html'};
CURSO.unidades[6]={k:'Cálculo · Parte 2',n:'Integrales',guia:'guia-integrales.html'};
CURSO.topics=CURSO.topics.concat(T5,T6);

CURSO.modelos.push(
 {id:'pm5',k:'Cálculo · Parte 1',titulo:'Parcial modelo · Límites y derivadas',desc:'Límites, derivada por definición, reglas y cadena, tangente, estudio completo de una función con gráfico, optimización y L\'Hôpital.',
  rules:'<b>Condiciones:</b> 2 horas · sin calculadora · justificá cada paso. Aprobación: 60%. Los bloques de V/F se responden leyendo el gráfico.',
  qs:[
   op('Calculá: a) lim<sub>x→3</sub> (x² − 9)/(x² − 5x + 6) · b) lim<sub>x→∞</sub> (2x² − x)/(5x² + 3).','a) 6 · b) 2/5','a) (x − 3)(x + 3)/[(x − 3)(x − 2)] = (x + 3)/(x − 2) → 6. b) cociente de coeficientes principales.'),
   op('Derivá por definición f(x) = x² − 3x.','f′(x) = 2x − 3','[(x + h)² − 3(x + h) − x² + 3x]/h = 2x + h − 3 → 2x − 3.'),
   op('Derivá: a) f(x) = (x² + 1)·e^(2x) · b) g(x) = ln(x² + 1)/x · c) h(x) = sen²(3x).','a) e^(2x)(2x² + 2x + 2) · b) [2x²/(x² + 1) − ln(x² + 1)]/x² · c) 6 sen(3x)·cos(3x)','a) 2x·e^(2x) + (x² + 1)·2e^(2x). b) Cociente. c) 2 sen(3x)·cos(3x)·3.'),
   op('Hallá la recta tangente a f(x) = √(2x + 1) en x₀ = 4.','y = x/3 + 5/3','f(4) = 3; f′(x) = 1/√(2x + 1) ⇒ f′(4) = 1/3. y − 3 = (1/3)(x − 4).'),
   vfm('Gráfico de f(x) = x⁴ − 4x³.',[
    ['f tiene un único extremo relativo',true,'Solo el mínimo en (3, −27); x = 0 es crítico sin cambio de signo.'],
    ['f es creciente en (0, 3)',false,'Es decreciente: f′ = 4x²(x − 3) &lt; 0 ahí.'],
    ['f tiene dos puntos de inflexión',true,'x = 0 y x = 2.'],
    ['El mínimo absoluto de f es −27',true,'Es el menor valor que toma f.']
   ],F.cuartica),
   op('Estudiá f(x) = x³ − 3x² − 9x + 5: crecimiento, extremos, concavidad e inflexión.','f′ = 3(x − 3)(x + 1): crece en (−∞, −1) ∪ (3, ∞), decrece en (−1, 3). Máx (−1, 10), mín (3, −22). f″ = 6x − 6: ∩ en (−∞, 1), ∪ en (1, ∞). Inflexión (1, −6).','f(−1) = −1 − 3 + 9 + 5 = 10; f(3) = 27 − 27 − 27 + 5 = −22; f(1) = 1 − 3 − 9 + 5 = −6.'),
   op('<b>Problema.</b> Se quiere construir un corral rectangular de 200 m² dividido en dos partes iguales por una cerca paralela a uno de los lados. ¿Qué dimensiones minimizan el alambre total?','x = 20/√3 ≈ 11,55 m (el lado que lleva 3 tramos de cerca) · y = 10√3 ≈ 17,32 m','Alambre L = 3x + 2y con xy = 200 ⇒ L = 3x + 400/x. L′ = 3 − 400/x² = 0 ⇒ x² = 400/3 ⇒ x = 20/√3; y = 200/x = 10√3. Mínimo porque L″ = 800/x³ &gt; 0.'),
   op('Calculá lim<sub>x→0</sub> (e^(2x) − 1 − 2x)/x².','2','L\'H: (2e^(2x) − 2)/(2x) → L\'H: 4e^(2x)/2 → 2.'),
   vf('Si f′(x) = 0 para todo x de un intervalo, f es constante en ese intervalo.',true,'Es consecuencia del teorema del valor medio.')
  ]},
 {id:'pm6',k:'Cálculo · Parte 2',titulo:'Parcial modelo · Integrales',desc:'Inmediatas, sustitución, partes, fracciones simples, Barrow, áreas con gráficos, valor medio y una aplicación física.',
  rules:'<b>Condiciones:</b> 2 horas · sin calculadora · indicá el método usado y verificá derivando cuando puedas. Aprobación: 60%.',
  qs:[
   op('Calculá ∫ (4x³ − 3/x + 2eˣ − 1/√x) dx.','x⁴ − 3 ln|x| + 2eˣ − 2√x + C',''),
   op('Calculá ∫ (3x² + 2)/(x³ + 2x − 7) dx.','ln|x³ + 2x − 7| + C','Arriba está la derivada de abajo.'),
   op('Calculá ∫ x²·ln x dx.','(x³/3)·ln x − x³/9 + C','u = ln x, dv = x² dx.'),
   op('Calculá ∫ (x + 7)/(x² − x − 6) dx.','2 ln|x − 3| − ln|x + 2| + C','x² − x − 6 = (x − 3)(x + 2). x + 7 = A(x + 2) + B(x − 3): x = 3 ⇒ A = 2; x = −2 ⇒ B = −1.'),
   op('Calculá ∫₀^(π/4) sen(2x) dx y ∫₁⁴ (1/√x) dx.','1/2 · 2','[−cos(2x)/2]₀^(π/4) = 0 + 1/2. [2√x]₁⁴ = 4 − 2.'),
   vfm('Gráfico de f(x) = x² − 2x en [0, 3] con las regiones sombreadas.',[
    ['El área total sombreada es 8/3',true,'4/3 (abajo del eje) + 4/3 (arriba).'],
    ['∫₀³ (x² − 2x) dx = 8/3',false,'Da 0: la integral resta lo que está abajo del eje.'],
    ['La región roja tiene área 4/3',true,'|∫₀² (x² − 2x) dx| = |8/3 − 4| = 4/3.'],
    ['∫₂³ (x² − 2x) dx = 4/3',true,'(9 − 9) − (8/3 − 4) = 4/3.']
   ],F.areaSigno),
   op('Calculá el área encerrada entre y = x² e y = 2x.','4/3','∫₀² (2x − x²) dx = 4 − 8/3.',F.entre),
   op('<b>Problema.</b> La velocidad de un auto es v(t) = 20 + 6t (m/s) durante 10 s y en t = 0 está en el kilómetro 0. ¿Cuánto recorre? ¿Cuál es su velocidad media?','Recorre 500 m · velocidad media 50 m/s','∫₀¹⁰ (20 + 6t) dt = [20t + 3t²]₀¹⁰ = 200 + 300 = 500; 500/10 = 50.'),
   op('Hallá F(x) tal que F′(x) = x·cos(x²) y F(0) = 1.','F(x) = sen(x²)/2 + 1','Sustitución u = x²; la constante sale de F(0) = 0 + C = 1.'),
   vf('∫₋₃³ (x³ + sen x) dx = 0',true,'x³ + sen x es impar y el intervalo es simétrico.')
  ]}
);
})();
