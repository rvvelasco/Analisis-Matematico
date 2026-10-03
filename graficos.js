/* =====================================================================
   graficos.js · mini-librería de gráficos SVG (sin dependencias)
   Usada por las guías y el simulador de exámenes.
   G.plot   → ejes cartesianos con funciones, rectas, puntos, vectores
   G.venn   → diagramas de Venn de 2 o 3 conjuntos con zonas sombreadas
   G.sagital→ diagrama de flechas entre dos conjuntos (relaciones/funciones)
   G.digraph→ grafo dirigido de una relación en un conjunto
   G.reloj  → "reloj" de aritmética modular
   ===================================================================== */
(function(){
  var C = {ink:'#1E2A32',soft:'#51616B',navy:'#153A5B',red:'#C42430',gold:'#B8791F',teal:'#177567',line:'#E2E3DB',grid:'#ECEDE6',paper:'#F4F5F1',purple:'#6B3FA0'};
  var PAL = [C.red,C.navy,C.teal,C.gold,C.purple];
  var uid = 0;
  function id(p){uid++;return (p||'g')+uid;}
  function n(v){return Math.round(v*100)/100;}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function svgOpen(w,h,label){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(label||'gráfico')+'" style="width:100%;max-width:'+w+'px;height:auto;display:block;margin:0 auto;font-family:Inter,system-ui,sans-serif">';}
  function arrowDef(mid,color){return '<marker id="'+mid+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="'+color+'"/></marker>';}

  /* ---------------- PLOT ---------------- */
  function plot(o){
    o=o||{};
    var w=o.w||380,h=o.h||300,pad=28;
    var xr=o.x||[-5,5],yr=o.y||[-5,5];
    var sx=function(x){return pad+(x-xr[0])/(xr[1]-xr[0])*(w-2*pad);};
    var sy=function(y){return h-pad-(y-yr[0])/(yr[1]-yr[0])*(h-2*pad);};
    var s=svgOpen(w,h,o.label);
    var defs='';
    s+='<rect x="0" y="0" width="'+w+'" height="'+h+'" fill="#fff" rx="10"/>';
    var step=o.step||1;
    // grid
    if(o.grid!==false){
      for(var gx=Math.ceil(xr[0]/step)*step;gx<=xr[1]+1e-9;gx+=step){s+='<line x1="'+n(sx(gx))+'" y1="'+n(sy(yr[0]))+'" x2="'+n(sx(gx))+'" y2="'+n(sy(yr[1]))+'" stroke="'+C.grid+'" stroke-width="1"/>';}
      for(var gy=Math.ceil(yr[0]/step)*step;gy<=yr[1]+1e-9;gy+=step){s+='<line x1="'+n(sx(xr[0]))+'" y1="'+n(sy(gy))+'" x2="'+n(sx(xr[1]))+'" y2="'+n(sy(gy))+'" stroke="'+C.grid+'" stroke-width="1"/>';}
    }
    // axes
    var ax=Math.min(Math.max(0,xr[0]),xr[1]),ay=Math.min(Math.max(0,yr[0]),yr[1]);
    var am=id('ax');defs+=arrowDef(am,C.soft);
    s+='<line x1="'+n(sx(xr[0]))+'" y1="'+n(sy(ay))+'" x2="'+n(sx(xr[1])+10)+'" y2="'+n(sy(ay))+'" stroke="'+C.soft+'" stroke-width="1.4" marker-end="url(#'+am+')"/>';
    s+='<line x1="'+n(sx(ax))+'" y1="'+n(sy(yr[0]))+'" x2="'+n(sx(ax))+'" y2="'+n(sy(yr[1])-10)+'" stroke="'+C.soft+'" stroke-width="1.4" marker-end="url(#'+am+')"/>';
    s+='<text x="'+n(sx(xr[1])+4)+'" y="'+n(sy(ay)-6)+'" font-size="12" fill="'+C.soft+'" text-anchor="end" font-style="italic">'+(o.xl||'x')+'</text>';
    s+='<text x="'+n(sx(ax)+6)+'" y="'+n(sy(yr[1])-2)+'" font-size="12" fill="'+C.soft+'" font-style="italic">'+(o.yl||'y')+'</text>';
    // ticks
    if(o.ticks!==false){
      var ts=o.tickStep||step;
      for(var tx=Math.ceil(xr[0]/ts)*ts;tx<=xr[1]+1e-9;tx+=ts){if(Math.abs(tx)<1e-9)continue;s+='<line x1="'+n(sx(tx))+'" y1="'+n(sy(ay)-3)+'" x2="'+n(sx(tx))+'" y2="'+n(sy(ay)+3)+'" stroke="'+C.soft+'"/><text x="'+n(sx(tx))+'" y="'+n(sy(ay)+14)+'" font-size="10" fill="'+C.soft+'" text-anchor="middle">'+n(tx)+'</text>';}
      for(var ty=Math.ceil(yr[0]/ts)*ts;ty<=yr[1]+1e-9;ty+=ts){if(Math.abs(ty)<1e-9)continue;s+='<line x1="'+n(sx(ax)-3)+'" y1="'+n(sy(ty))+'" x2="'+n(sx(ax)+3)+'" y2="'+n(sy(ty))+'" stroke="'+C.soft+'"/><text x="'+n(sx(ax)-6)+'" y="'+n(sy(ty)+3.5)+'" font-size="10" fill="'+C.soft+'" text-anchor="end">'+n(ty)+'</text>';}
      s+='<text x="'+n(sx(ax)-5)+'" y="'+n(sy(ay)+13)+'" font-size="10" fill="'+C.soft+'" text-anchor="end">0</text>';
    }
    var clip=id('cl');
    defs+='<clipPath id="'+clip+'"><rect x="'+pad+'" y="'+pad+'" width="'+(w-2*pad)+'" height="'+(h-2*pad)+'"/></clipPath>';
    var body='';
    // shaded regions (between f and a baseline) - simple polygon list
    (o.polys||[]).forEach(function(p,i){
      var pts=p.pts.map(function(q){return n(sx(q[0]))+','+n(sy(q[1]));}).join(' ');
      body+='<polygon points="'+pts+'" fill="'+(p.c||C.teal)+'" fill-opacity="'+(p.op||.18)+'" stroke="'+(p.stroke||'none')+'"/>';
    });
    // functions
    (o.fns||[]).forEach(function(fn,i){
      var col=fn.c||PAL[i%PAL.length];
      var a=fn.dom?fn.dom[0]:xr[0],b=fn.dom?fn.dom[1]:xr[1];
      var N=fn.n||400,d='',pen=false,prev=null;
      for(var k=0;k<=N;k++){
        var x=a+(b-a)*k/N,y=fn.f(x);
        if(!isFinite(y)||Math.abs(y)>1e4||(prev!==null&&Math.abs(y-prev)>(yr[1]-yr[0])*2)){pen=false;prev=null;continue;}
        d+=(pen?'L':'M')+n(sx(x))+','+n(sy(y));pen=true;prev=y;
      }
      body+='<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+(fn.wd||2.4)+'"'+(fn.dash?' stroke-dasharray="6 4"':'')+' stroke-linejoin="round" stroke-linecap="round"/>';
      if(fn.label){
        var lx=fn.lx!==undefined?fn.lx:(b-(b-a)*0.12),ly=fn.ly!==undefined?fn.ly:fn.f(lx);
        body+='<text x="'+n(sx(lx)+(fn.ldx||4))+'" y="'+n(sy(ly)+(fn.ldy||-8))+'" font-size="13" font-weight="700" fill="'+col+'" font-style="italic">'+fn.label+'</text>';
      }
    });
    // vertical lines (x = k)
    (o.vlines||[]).forEach(function(v,i){
      var col=v.c||PAL[i%PAL.length];
      body+='<line x1="'+n(sx(v.x))+'" y1="'+n(sy(yr[0]))+'" x2="'+n(sx(v.x))+'" y2="'+n(sy(yr[1]))+'" stroke="'+col+'" stroke-width="'+(v.wd||2.2)+'"'+(v.dash?' stroke-dasharray="6 4"':'')+'/>';
      if(v.label)body+='<text x="'+n(sx(v.x)+5)+'" y="'+n(sy(yr[1])+14)+'" font-size="13" font-weight="700" fill="'+col+'" font-style="italic">'+v.label+'</text>';
    });
    // segments
    (o.segs||[]).forEach(function(g){
      body+='<line x1="'+n(sx(g[0]))+'" y1="'+n(sy(g[1]))+'" x2="'+n(sx(g[2]))+'" y2="'+n(sy(g[3]))+'" stroke="'+(g[4]||C.soft)+'" stroke-width="'+(g[6]||1.4)+'"'+(g[5]?' stroke-dasharray="4 4"':'')+'/>';
    });
    s+='<g clip-path="url(#'+clip+')">'+body+'</g>';
    // vectors (not clipped)
    (o.vecs||[]).forEach(function(v,i){
      var col=v.c||PAL[i%PAL.length];var mid=id('va');defs+=arrowDef(mid,col);
      var x1=v.from?v.from[0]:0,y1=v.from?v.from[1]:0;
      s+='<line x1="'+n(sx(x1))+'" y1="'+n(sy(y1))+'" x2="'+n(sx(v.to[0]))+'" y2="'+n(sy(v.to[1]))+'" stroke="'+col+'" stroke-width="'+(v.wd||2.6)+'"'+(v.dash?' stroke-dasharray="6 4"':'')+' marker-end="url(#'+mid+')"/>';
      if(v.label){var mx=(x1+v.to[0])/2,my=(y1+v.to[1])/2;s+='<text x="'+n(sx(mx)+(v.ldx||6))+'" y="'+n(sy(my)+(v.ldy||-6))+'" font-size="14" font-weight="700" fill="'+col+'" font-style="italic">'+v.label+'</text>';}
    });
    // points
    (o.pts||[]).forEach(function(p){
      var col=p.c||C.navy;
      s+='<circle cx="'+n(sx(p.x))+'" cy="'+n(sy(p.y))+'" r="'+(p.r||4.2)+'" fill="'+(p.open?'#fff':col)+'" stroke="'+col+'" stroke-width="2"/>';
      if(p.label)s+='<text x="'+n(sx(p.x)+(p.dx||7))+'" y="'+n(sy(p.y)+(p.dy||-7))+'" font-size="12" font-weight="600" fill="'+col+'">'+p.label+'</text>';
    });
    // free text
    (o.texts||[]).forEach(function(t){s+='<text x="'+n(sx(t.x))+'" y="'+n(sy(t.y))+'" font-size="'+(t.fs||12)+'" font-weight="'+(t.b?700:500)+'" fill="'+(t.c||C.ink)+'" text-anchor="'+(t.a||'start')+'">'+t.s+'</text>';});
    s=s.replace('<rect x="0"','<defs>'+defs+'</defs><rect x="0"');
    return s+'</svg>';
  }

  /* ---------------- VENN ---------------- */
  // o = {n:2|3, labels:['A','B','C'], shade:['100','110',...], elems:{'100':'1, 2', ...}, U:'U'}
  // código de zona: un dígito por conjunto (1 = adentro, 0 = afuera). '000' = fuera de todos pero dentro de U
  function venn(o){
    o=o||{};var k=o.n||2,w=o.w||320,h=o.h||(k===3?250:200);
    var L=o.labels||['A','B','C'];
    var cs=k===2?[[118,100,62],[202,100,62]]:[[125,98,58],[195,98,58],[160,158,58]];
    var s=svgOpen(w,h,o.label||'diagrama de Venn');
    var defs='';
    var circ=function(c){return '<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'"/>';};
    var body='<rect x="8" y="8" width="'+(w-16)+'" height="'+(h-16)+'" rx="10" fill="#fff" stroke="'+C.soft+'" stroke-width="1.5"/>';
    (o.shade||[]).forEach(function(code){
      var inner='<rect x="8" y="8" width="'+(w-16)+'" height="'+(h-16)+'" fill="'+(o.color||C.red)+'" fill-opacity="'+(o.op||.42)+'"/>';
      // clip to "in" circles
      for(var i=0;i<k;i++){if(code[i]==='1'){var cid=id('vc');defs+='<clipPath id="'+cid+'">'+circ(cs[i])+'</clipPath>';inner='<g clip-path="url(#'+cid+')">'+inner+'</g>';}}
      // mask out "out" circles
      var mid=id('vm');var m='<mask id="'+mid+'"><rect x="0" y="0" width="'+w+'" height="'+h+'" fill="#fff"/>';
      for(var j=0;j<k;j++){if(code[j]==='0'){m+='<circle cx="'+cs[j][0]+'" cy="'+cs[j][1]+'" r="'+cs[j][2]+'" fill="#000"/>';}}
      defs+=m+'</mask>';
      body+='<g mask="url(#'+mid+')">'+inner+'</g>';
    });
    cs.forEach(function(c,i){body+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'" fill="none" stroke="'+(o.stroke||C.navy)+'" stroke-width="2"/>';});
    var lp=k===2?[[70,52],[250,52]]:[[78,52],[242,52],[160,234]];
    if(k===3)lp[2]=[230,212];
    L.slice(0,k).forEach(function(l,i){body+='<text x="'+lp[i][0]+'" y="'+lp[i][1]+'" font-size="16" font-weight="700" fill="'+C.navy+'" font-style="italic">'+l+'</text>';});
    body+='<text x="'+(w-26)+'" y="28" font-size="14" font-weight="700" fill="'+C.soft+'" font-style="italic">'+(o.U||'U')+'</text>';
    // element positions per zone
    var pos=k===2?{'10':[95,104],'01':[225,104],'11':[160,104],'00':[40,175]}:{'100':[105,82],'010':[215,82],'001':[160,190],'110':[160,70],'101':[124,140],'011':[196,140],'111':[160,118],'000':[38,228]};
    if(o.elems){for(var z in o.elems){var p=pos[z];if(p)body+='<text x="'+p[0]+'" y="'+p[1]+'" font-size="'+(o.fs||12.5)+'" font-weight="600" fill="'+C.ink+'" text-anchor="middle">'+o.elems[z]+'</text>';}}
    return s+'<defs>'+defs+'</defs>'+body+'</svg>';
  }

  /* ---------------- SAGITAL ---------------- */
  // o = {A:[...], B:[...], pairs:[[a,b],...], la:'A', lb:'B', name:'f'}
  function sagital(o){
    var A=o.A,B=o.B,w=o.w||340;
    var rows=Math.max(A.length,B.length),h=Math.max(170,rows*36+70);
    var s=svgOpen(w,h,o.label||'diagrama sagital');
    var mid=id('sa');var defs=arrowDef(mid,C.red);
    var xa=80,xb=w-80,top=48,gap=(h-top-26)/Math.max(rows,1);
    var ya=function(i){return top+gap*(i+.5)+(rows-A.length)*gap/2;};
    var yb=function(i){return top+gap*(i+.5)+(rows-B.length)*gap/2;};
    var body='<rect x="0" y="0" width="'+w+'" height="'+h+'" rx="10" fill="#fff"/>';
    body+='<ellipse cx="'+xa+'" cy="'+(top+(h-top-26)/2)+'" rx="46" ry="'+((h-top-26)/2+8)+'" fill="#F4F7FA" stroke="'+C.navy+'" stroke-width="2"/>';
    body+='<ellipse cx="'+xb+'" cy="'+(top+(h-top-26)/2)+'" rx="46" ry="'+((h-top-26)/2+8)+'" fill="#F4F7FA" stroke="'+C.navy+'" stroke-width="2"/>';
    body+='<text x="'+xa+'" y="26" font-size="16" font-weight="700" fill="'+C.navy+'" text-anchor="middle" font-style="italic">'+(o.la||'A')+'</text>';
    body+='<text x="'+xb+'" y="26" font-size="16" font-weight="700" fill="'+C.navy+'" text-anchor="middle" font-style="italic">'+(o.lb||'B')+'</text>';
    if(o.name)body+='<text x="'+(w/2)+'" y="26" font-size="15" font-weight="700" fill="'+C.red+'" text-anchor="middle" font-style="italic">'+o.name+'</text>';
    (o.pairs||[]).forEach(function(p){
      var i=A.indexOf(p[0]),j=B.indexOf(p[1]);if(i<0||j<0)return;
      body+='<line x1="'+(xa+16)+'" y1="'+n(ya(i))+'" x2="'+(xb-18)+'" y2="'+n(yb(j))+'" stroke="'+C.red+'" stroke-width="1.8" marker-end="url(#'+mid+')"/>';
    });
    A.forEach(function(a,i){body+='<circle cx="'+xa+'" cy="'+n(ya(i))+'" r="3.5" fill="'+C.navy+'"/><text x="'+(xa-10)+'" y="'+n(ya(i)+4)+'" font-size="13.5" font-weight="600" fill="'+C.ink+'" text-anchor="end">'+a+'</text>';});
    B.forEach(function(b,i){body+='<circle cx="'+xb+'" cy="'+n(yb(i))+'" r="3.5" fill="'+C.navy+'"/><text x="'+(xb+10)+'" y="'+n(yb(i)+4)+'" font-size="13.5" font-weight="600" fill="'+C.ink+'">'+b+'</text>';});
    return s+'<defs>'+defs+'</defs>'+body+'</svg>';
  }

  /* ---------------- DIGRAPH ---------------- */
  // o = {nodes:[1,2,3], edges:[[1,1],[1,2],...]}
  function digraph(o){
    var N=o.nodes,w=o.w||300,h=o.h||260,cx=w/2,cy=h/2+6,R=Math.min(w,h)/2-48;
    var s=svgOpen(w,h,o.label||'grafo de la relación');
    var mid=id('dg');var defs=arrowDef(mid,C.red);
    var P={};N.forEach(function(v,i){var a=-Math.PI/2+2*Math.PI*i/N.length;P[v]=[cx+R*Math.cos(a),cy+R*Math.sin(a),a];});
    var body='<rect x="0" y="0" width="'+w+'" height="'+h+'" rx="10" fill="#fff"/>';
    var has=function(a,b){return (o.edges||[]).some(function(e){return e[0]===a&&e[1]===b;});};
    (o.edges||[]).forEach(function(e){
      var a=P[e[0]],b=P[e[1]];if(!a||!b)return;
      if(e[0]===e[1]){
        var lx=a[0]+Math.cos(a[2])*24,ly=a[1]+Math.sin(a[2])*24;
        body+='<circle cx="'+n(lx)+'" cy="'+n(ly)+'" r="13" fill="none" stroke="'+C.red+'" stroke-width="1.8"/>';
        return;
      }
      var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy),ux=dx/L,uy=dy/L;
      var x1=a[0]+ux*17,y1=a[1]+uy*17,x2=b[0]-ux*19,y2=b[1]-uy*19;
      if(has(e[1],e[0])){ // curva para ida y vuelta
        var mx=(x1+x2)/2-uy*22,my=(y1+y2)/2+ux*22;
        body+='<path d="M'+n(x1)+','+n(y1)+' Q'+n(mx)+','+n(my)+' '+n(x2)+','+n(y2)+'" fill="none" stroke="'+C.red+'" stroke-width="1.8" marker-end="url(#'+mid+')"/>';
      }else{
        body+='<line x1="'+n(x1)+'" y1="'+n(y1)+'" x2="'+n(x2)+'" y2="'+n(y2)+'" stroke="'+C.red+'" stroke-width="1.8" marker-end="url(#'+mid+')"/>';
      }
    });
    N.forEach(function(v){var p=P[v];body+='<circle cx="'+n(p[0])+'" cy="'+n(p[1])+'" r="15" fill="#F4F7FA" stroke="'+C.navy+'" stroke-width="2"/><text x="'+n(p[0])+'" y="'+n(p[1]+5)+'" font-size="14" font-weight="700" fill="'+C.navy+'" text-anchor="middle">'+v+'</text>';});
    return s+'<defs>'+defs+'</defs>'+body+'</svg>';
  }

  /* ---------------- RELOJ MODULAR ---------------- */
  // o = {m:12, mark:[...], from:a, steps:k}
  function reloj(o){
    var m=o.m||12,w=o.w||240,h=w,cx=w/2,cy=h/2,R=w/2-34;
    var s=svgOpen(w,h,o.label||'reloj módulo '+m);
    var body='<rect x="0" y="0" width="'+w+'" height="'+h+'" rx="10" fill="#fff"/><circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="#F4F7FA" stroke="'+C.navy+'" stroke-width="2"/>';
    var defs='';
    if(o.from!==undefined&&o.steps){
      var a0=-Math.PI/2+2*Math.PI*o.from/m,a1=-Math.PI/2+2*Math.PI*(o.from+o.steps)/m,r2=R-22;
      var large=(o.steps%m)/m>.5?1:0;
      var mid=id('rk');defs+=arrowDef(mid,C.red);
      if(o.steps>=m){body+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(r2-6)+'" fill="none" stroke="'+C.red+'" stroke-width="1.5" stroke-dasharray="3 4"/>';}
      body+='<path d="M'+n(cx+r2*Math.cos(a0))+','+n(cy+r2*Math.sin(a0))+' A'+r2+','+r2+' 0 '+large+' 1 '+n(cx+r2*Math.cos(a1))+','+n(cy+r2*Math.sin(a1))+'" fill="none" stroke="'+C.red+'" stroke-width="2.2" marker-end="url(#'+mid+')"/>';
    }
    for(var i=0;i<m;i++){
      var a=-Math.PI/2+2*Math.PI*i/m,x=cx+R*Math.cos(a),y=cy+R*Math.sin(a);
      var hl=(o.mark||[]).indexOf(i)>=0;
      body+='<circle cx="'+n(x)+'" cy="'+n(y)+'" r="13" fill="'+(hl?C.red:'#fff')+'" stroke="'+C.navy+'" stroke-width="1.6"/><text x="'+n(x)+'" y="'+n(y+4.5)+'" font-size="12.5" font-weight="700" fill="'+(hl?'#fff':C.navy)+'" text-anchor="middle">'+i+'</text>';
    }
    body+='<text x="'+cx+'" y="'+(cy+5)+'" font-size="14" font-weight="700" fill="'+C.soft+'" text-anchor="middle">mód '+m+'</text>';
    return s+'<defs>'+defs+'</defs>'+body+'</svg>';
  }

  window.G={plot:plot,venn:venn,sagital:sagital,digraph:digraph,reloj:reloj,C:C};
})();
