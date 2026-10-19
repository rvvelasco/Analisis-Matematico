/* =====================================================================
   examenes-apb.js · Bloque "Arranque desde cero" (modo APB)
   Exámenes cortos y fáciles para quien no tiene base. Se muestra primero.
   ===================================================================== */
(function(){
var R=G.C.red,N=G.C.navy,T=G.C.teal;
var parab=G.plot({x:[-3,5],y:[-5,6],fns:[{f:function(x){return x*x-2*x-3;},c:R,label:'f',lx:4.2}],pts:[{x:-1,y:0},{x:3,y:0},{x:1,y:-4,label:'(1, −4)',dy:16},{x:0,y:-3}]});
var rectas=G.plot({x:[-2,4],y:[-3,7],fns:[{f:function(x){return 2*x+1;},c:R,label:'r₁',lx:2.6},{f:function(x){return -x+3;},c:N,label:'r₂',lx:-1.6}]});
var loma=G.plot({x:[-3,3],y:[-1,5],fns:[{f:function(x){return 4-x*x/2;},c:R,label:'f',lx:2.3}],pts:[{x:-2,y:2,label:'A',dx:-14},{x:0,y:4,label:'B'},{x:2,y:2,label:'C'}]});
var area=G.plot({x:[-.5,3.5],y:[-.5,7],polys:[{pts:G.area(function(x){return 2*x;},0,3),c:T,op:.35,stroke:T}],fns:[{f:function(x){return 2*x;},c:R,dom:[-.5,3.3],label:'y = 2x',lx:2.2,ldx:-56}]});

var APB=[
 {id:'a1',n:'A1',u:0,nuevo:true,titulo:'Cuentas: signos, fracciones y potencias',pre:'Guía: <b>Matemática desde cero</b>, lecciones 1 a 4',desc:'Lo mínimo para no trabarse en las cuentas: negativos, orden de operaciones, fracciones y exponentes.',
  exams:{
   basico:[
    mc('−3 + 5 =',['2','−8','8','−2'],0,'Debés 3 y cobrás 5: te quedan 2.'),
    mc('(−2)·(−4) =',['8','−8','6','−6'],0,'Menos por menos da más.'),
    mc('2 + 3·4 =',['14','20','24','9'],0,'Primero la multiplicación: 3·4 = 12; después 2 + 12.'),
    mc('2³ =',['8','6','9','5'],0,'2·2·2.'),
    mc('7⁰ =',['1','0','7','no existe'],0,'Todo número a la 0 da 1.')
   ],
   normal:[
    mc('1/2 + 1/3 =',['5/6','2/5','1/5','2/6'],0,'En cruz: (1·3 + 1·2)/(2·3).'),
    mc('2/3 · 3/4 =',['1/2','5/7','6/7','8/9'],0,'Arriba por arriba, abajo por abajo: 6/12 = 1/2.'),
    mc('x²·x³ =',['x⁵','x⁶','2x⁵','x'],0,'Misma base multiplicando: se suman los exponentes.'),
    mc('1/x² escrito como potencia es:',['x⁻²','x²','x^(1/2)','−x²'],0,'La x sube con el exponente cambiado de signo.'),
    mc('√x escrito como potencia es:',['x^(1/2)','x²','x⁻¹','2x'],0,'Raíz cuadrada = exponente ½.')
   ],
   examen:[
    mc('10 − 2·(1 + 3) =',['2','32','−22','6'],0,'Paréntesis: 4. Multiplicación: 8. Resta: 10 − 8.'),
    mc('(1/2) ÷ (1/4) =',['2','1/8','1/2','4'],0,'Das vuelta la segunda y multiplicás: 1/2 · 4 = 2.'),
    mc('x⁵/x² =',['x³','x⁷','x^2,5','x¹⁰'],0,'Dividir misma base: se restan los exponentes.'),
    mc('1/2 − 1 =',['−1/2','1/2','−1','0'],0,'1/2 − 2/2 = −1/2. Lo vas a usar al derivar √x.'),
    vf('−2 − 1 = −1',false,'−2 − 1 = −3: restar a un negativo lo hace más negativo.')
   ]
  }},
 {id:'a2',n:'A2',u:0,nuevo:true,titulo:'Letras, despejes y ecuaciones',pre:'Guía: <b>Matemática desde cero</b>, lecciones 5 y 6',desc:'Reemplazar valores, juntar términos, despejar x y resolver ecuaciones con x².',
  exams:{
   basico:[
    mc('Si x = 3, ¿cuánto vale 2x + 1?',['7','6','23','9'],0,'2·3 + 1.'),
    mc('3x + 2x =',['5x','5x²','6x','5'],0,'3 manzanas + 2 manzanas.'),
    mc('Despejá: x + 7 = 10',['x = 3','x = 17','x = 10/7','x = −3'],0,'El 7 pasa restando.'),
    mc('Despejá: 3x = 12',['x = 4','x = 9','x = 36','x = 15'],0,'El 3 pasa dividiendo.')
   ],
   normal:[
    mc('Si x = −2, ¿cuánto vale x²?',['4','−4','2','−2'],0,'(−2)·(−2) = 4.'),
    mc('2(x + 3) =',['2x + 6','2x + 3','x + 6','2x + 5'],0,'El 2 multiplica a todo lo de adentro.'),
    mc('Despejá: 2x + 3 = 11',['x = 4','x = 7','x = 5,5','x = 8'],0,'2x = 8 ⇒ x = 4.'),
    mc('Las soluciones de x² − 4x = 0 son:',['x = 0 y x = 4','x = 4','x = 2','x = −4 y x = 4'],0,'Factor común: x(x − 4) = 0.')
   ],
   examen:[
    mc('Las soluciones de x² − 5x + 6 = 0 son:',['x = 2 y x = 3','x = 1 y x = 6','x = −2 y x = −3','x = 5 y x = 6'],0,'Con la fórmula: (5 ± 1)/2.'),
    mc('Despejá: 2x − 4 = 0',['x = 2','x = −2','x = 4','x = 8'],0,'2x = 4.'),
    mc('¿Se puede simplificar x + x²?',['No, son términos distintos','Sí, da x³','Sí, da 2x²','Sí, da 2x³'],0,'Distinto exponente: manzanas y peras.'),
    vf('Si x·(x − 3) = 0, entonces x = 0 o x = 3.',true,'Si un producto da 0, alguno de los factores es 0.')
   ]
  }},
 {id:'a3',n:'A3',u:0,nuevo:true,titulo:'Funciones, gráficos y pendiente',pre:'Guía: <b>Matemática desde cero</b>, lecciones 7 a 10',desc:'Qué es f(x), cómo calcular valores, leer un gráfico y entender la pendiente de una recta.',
  exams:{
   basico:[
    mc('Si f(x) = 2x + 1, f(5) =',['11','10','7','16'],0,'2·5 + 1.'),
    mc('El punto (3, 2) se ubica:',['3 a la derecha y 2 para arriba','2 a la derecha y 3 para arriba','2 a la izquierda y 3 para abajo','3 a la izquierda y 2 para abajo'],0,'Primero caminás (x), después subís (y).'),
    mc('La pendiente de y = 3x − 2 es:',['3','−2','1','2/3'],0,'Es el número que multiplica a la x.'),
    mc('Si la pendiente es negativa, la recta:',['baja','sube','es horizontal','es vertical'],0,'m &lt; 0: baja de izquierda a derecha.')
   ],
   normal:[
    vfm('Mirá el gráfico de f(x) = x² − 2x − 3.',[
     ['f(0) = −3',true,'En x = 0 la curva está a la altura −3.'],
     ['La curva corta al eje x dos veces',true,'En x = −1 y x = 3.'],
     ['El punto más bajo es (1, −4)',true,'Es el mínimo.'],
     ['La curva sube todo el tiempo',false,'Baja hasta x = 1 y después sube.']
    ],parab),
    mc('Si f(x) = x² − 1, f(−3) =',['8','−10','10','−8'],0,'(−3)² = 9; 9 − 1 = 8.'),
    mc('La pendiente entre (1, 2) y (3, 8) es:',['3','6','2','4'],0,'(8 − 2)/(3 − 1).')
   ],
   examen:[
    vfm('Mirá las dos rectas: r₁: y = 2x + 1 y r₂: y = −x + 3.',[
     ['r₁ sube y r₂ baja',true,'Pendientes 2 (positiva) y −1 (negativa).'],
     ['r₁ corta al eje y en 1',true,'Es el número suelto, b = 1.'],
     ['r₂ es más empinada que r₁',false,'|−1| &lt; |2|: r₁ es más empinada.'],
     ['Una recta horizontal tiene pendiente 0',true,'No sube ni baja.']
    ],rectas),
    mc('e⁰ =',['1','0','e','no existe'],0,'Todo número a la 0 da 1.'),
    mc('ln 1 =',['0','1','e','no existe'],0,'Porque e⁰ = 1.')
   ]
  }},
 {id:'a4',n:'A4',u:0,nuevo:true,titulo:'Derivar paso a paso',pre:'Guía: <b>Derivadas APB</b>',desc:'Qué es una derivada, la regla de la potencia, números multiplicando, sumas, la tabla, producto, cadena, tangente y máximos.',
  exams:{
   basico:[
    mc('La derivada de x⁵ es:',['5x⁴','x⁴','5x⁵','x⁶/6'],0,'El 5 baja y al exponente se le resta 1.'),
    mc('La derivada de 7 (un número solo) es:',['0','7','1','7x'],0,'Un número no cambia: su derivada es 0.'),
    mc('La derivada de x es:',['1','0','x','2x'],0,'x = x¹ → 1·x⁰ = 1.'),
    mc('La derivada de 5x² es:',['10x','5x','10x²','2x'],0,'5·2 = 10 y x¹.'),
    vfm('Mirá la loma y los puntos A, B y C.',[
     ['En A la derivada es positiva',true,'Ahí la curva sube.'],
     ['En B la derivada vale 0',true,'Es la cima: la curva está plana.'],
     ['En C la derivada es positiva',false,'Ahí la curva baja: derivada negativa.']
    ],loma)
   ],
   normal:[
    mc('(3x² + 5x − 7)′ =',['6x + 5','6x + 5 − 7','3x + 5','6x² + 5'],0,'Cada término por separado; el −7 desaparece.'),
    mc('(eˣ)′ =',['eˣ','x·eˣ⁻¹','1','e'],0,'La inmortal: no cambia.'),
    mc('(cos x)′ =',['−sen x','sen x','cos x','−cos x'],0,'Cuando el coseno pasa la pelota, se le cae un menos.'),
    mc('(1/x)′ =',['−1/x²','1/x²','ln x','−1/x'],0,'x⁻¹ → −1·x⁻² = −1/x².'),
    mc('(ln x)′ =',['1/x','ln x','eˣ','x'],0,'Dato de memoria.')
   ],
   examen:[
    mc('(x²·eˣ)′ =',['2x·eˣ + x²·eˣ','2x·eˣ','x²·eˣ','2x + eˣ'],0,'Producto: derivo el primero·copio el segundo + copio el primero·derivo el segundo.'),
    mc('(e^(3x))′ =',['3e^(3x)','e^(3x)','e³','3x·e^(3x)'],0,'Cadena: por la derivada de 3x, que es 3.'),
    mc('((2x + 1)³)′ =',['6(2x + 1)²','3(2x + 1)²','(2x + 1)²','6(2x + 1)³'],0,'3(2x + 1)²·2.'),
    mc('La tangente a f(x) = x² en x = 1 es:',['y = 2x − 1','y = 2x + 1','y = x','y = x² − 1'],0,'Punto (1, 1), pendiente f′(1) = 2.'),
    mc('f(x) = x² − 6x tiene un mínimo en:',['x = 3','x = 6','x = 0','x = −3'],0,'f′(x) = 2x − 6 = 0.')
   ]
  }},
 {id:'a5',n:'A5',u:0,nuevo:true,titulo:'Integrar paso a paso',pre:'Guía: <b>Integrales APB</b>',desc:'Integrar como "derivar al revés", la regla de la potencia, la tabla, sustitución y partes básicas, e integrales con números (áreas).',
  exams:{
   basico:[
    mc('∫ x² dx =',['x³/3 + C','2x + C','x³ + C','x²/2 + C'],0,'Sumo 1 al exponente y divido por el nuevo.'),
    mc('∫ 5 dx =',['5x + C','0','5 + C','x⁵ + C'],0,'Un número solo: le agrego x.'),
    mc('¿Para qué está el + C?',['porque al derivar los números sueltos desaparecen','porque sí','es el área','es un error'],0,'No sabemos qué número había.'),
    mc('∫ x dx =',['x²/2 + C','1 + C','x² + C','2x + C'],0,'x¹ → x²/2.')
   ],
   normal:[
    mc('∫ (3x² + 2x + 1) dx =',['x³ + x² + x + C','6x + 2 + C','3x³ + 2x² + x + C','x³ + x² + C'],0,'Cada término por separado.'),
    mc('∫ 1/x dx =',['ln|x| + C','−1/x² + C','x⁰/0','1/x² + C'],0,'La excepción: da logaritmo.'),
    mc('∫ sen x dx =',['−cos x + C','cos x + C','sen x + C','−sen x + C'],0,'¡Con menos!'),
    mc('∫ eˣ dx =',['eˣ + C','x·eˣ + C','eˣ⁺¹ + C','1 + C'],0,'La inmortal.')
   ],
   examen:[
    mc('∫₀³ 2x dx =',['9','6','3','18'],0,'Integral: x². Arriba 9, abajo 0, resto.'),
    vfm('El área pintada está debajo de y = 2x, entre x = 0 y x = 3.',[
     ['Se calcula con ∫₀³ 2x dx',true,'Integral definida = área bajo la curva.'],
     ['Vale 9',true,'También es un triángulo: base 3 por altura 6 sobre 2.'],
     ['Vale 6',false,'6 es la altura en x = 3, no el área.']
    ],area),
    mc('∫ 2x·(x² + 1)⁵ dx =',['(x² + 1)⁶/6 + C','(x² + 1)⁶ + C','2x(x² + 1)⁶ + C','5(x² + 1)⁴ + C'],0,'Sustitución u = x² + 1, du = 2x dx.'),
    mc('∫ x·eˣ dx =',['eˣ(x − 1) + C','x²eˣ/2 + C','x·eˣ + C','eˣ + C'],0,'Por partes con u = x.'),
    mc('El área entre y = x e y = x² (de 0 a 1) es:',['1/6','1/2','1/3','1'],0,'∫₀¹ (x − x²) dx = 1/2 − 1/3.')
   ]
  }}
];

CURSO.unidades[0]={k:'Arranque desde cero · APB',n:'Si no tenés base, empezá acá',guia:'guia-apb-base.html'};
CURSO.topics=APB.concat(CURSO.topics);
})();
