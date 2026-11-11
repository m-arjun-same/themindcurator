/* THEMINDCURATOR — own code. Mechanisms rebuilt from the reference spec values. */
(function(){
'use strict';
var IG='https://ig.me/m/themindcurator_studio';

/* ---- page transition: intro ~1000ms out, exit 500ms cover (spec 500/1000) ---- */
var tr=document.getElementById('transition');
window.addEventListener('load',function(){ setTimeout(function(){ if(tr){tr.classList.add('out');} document.body.classList.remove('no-scroll'); },120); });
document.addEventListener('click',function(e){
  var a=e.target.closest('a'); if(!a) return;
  var href=a.getAttribute('href'); if(!href) return;
  if(href.indexOf('http')===0 || href.indexOf('#')===0 || a.target==='_blank') return;
  e.preventDefault();
  if(tr){ tr.classList.remove('out'); tr.classList.add('cover'); }
  setTimeout(function(){ window.location.href=href; },520);
});

/* ---- menu ---- */
var menu=document.getElementById('menu');
document.getElementById('menuBtn').addEventListener('click',function(){ menu.classList.add('open'); });
document.getElementById('menuClose').addEventListener('click',function(){ menu.classList.remove('open'); });

/* ---- Hyderabad clock + day/night (reference runs a live city clock in the footer) ---- */
function tick(){
  var el=document.getElementById('hydClock'); if(!el) return;
  var now=new Date();
  var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit',weekday:'long',hour12:true}).format(now);
  el.textContent=parts+' — Hyderabad';
  var h=parseInt(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'numeric',hour12:false}).format(now),10);
  var day=h>=6&&h<18;
  document.querySelectorAll('.day-emoji').forEach(function(n){ n.style.display=day?'inline':'none'; });
  document.querySelectorAll('.night-emoji').forEach(function(n){ n.style.display=day?'none':'inline'; });
}
tick(); setInterval(tick,1000);

/* ---- clip / fade reveals ---- */
var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} }); },{threshold:.18});
document.querySelectorAll('.reveal,.fade-up').forEach(function(n){ io.observe(n); });

/* ---- layered parallax (mouse + tilt), offsets per depth like the reference layers ---- */
var layers=document.querySelectorAll('.layer');
if(window.matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.panel').forEach(function(panel){
    panel.addEventListener('mousemove',function(e){
      var r=panel.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      panel.querySelectorAll('.layer').forEach(function(l){
        var d=parseFloat(l.getAttribute('data-depth')||'.3');
        l.style.transform='translate('+(x*d*60)+'px,'+(y*d*60)+'px)';
      });
    });
  });
}
window.addEventListener('deviceorientation',function(e){
  if(e.beta===null) return;
  var b=(e.beta-45)*1.5;
  document.querySelectorAll('.layer').forEach(function(l){
    var d=parseFloat(l.getAttribute('data-depth')||'.3');
    l.style.transform='translate('+(b*d*.6)+'px,'+(b*d*.3)+'px)';
  });
},true);

/* ---- glitch engine: random, max 2 at once, 1 on low-memory devices ---- */
var maxG=(navigator.deviceMemory||4)<=2?1:2, activeG=0;
setInterval(function(){
  if(activeG>=maxG||!layers.length) return;
  var l=layers[Math.floor(Math.random()*layers.length)];
  if(!l||l.classList.contains('glitching')) return;
  activeG++; l.classList.add('glitching');
  setTimeout(function(){ l.classList.remove('glitching'); activeG--; },200);
},2600);

/* ---- deck dots ---- */
var deck=document.querySelector('.deck'), dots=document.querySelectorAll('.deck-dots button');
if(deck&&dots.length){
  var panels=deck.querySelectorAll('.panel,.prefooter,footer');
  deck.addEventListener('scroll',function(){
    var i=Math.round(deck.scrollTop/window.innerHeight);
    dots.forEach(function(d,j){ d.classList.toggle('on',j===Math.min(i,dots.length-1)); });
  });
  dots.forEach(function(d,j){ d.addEventListener('click',function(){ panels[j].scrollIntoView({behavior:'smooth'}); }); });
}

/* ---- horizontal scroll (our work) ---- */
var hwrap=document.querySelector('.hwrap');
if(hwrap){
  var track=hwrap.querySelector('.htrack');
  function upd(){
    var r=hwrap.getBoundingClientRect();
    var total=hwrap.offsetHeight-window.innerHeight;
    var p=Math.min(1,Math.max(0,-r.top/total));
    var max=track.scrollWidth-window.innerWidth+96;
    track.style.transform='translateX('+(-p*max)+'px)';
  }
  window.addEventListener('scroll',upd,{passive:true}); upd();
}

/* ---- autoplay slider (services) ---- */
document.querySelectorAll('.slider').forEach(function(sl){
  var slides=sl.querySelectorAll('.slide'), i=0, timer;
  function go(n){ slides[i].classList.remove('on'); i=(n+slides.length)%slides.length; slides[i].classList.add('on'); }
  function auto(){ timer=setInterval(function(){ go(i+1); },4200); }
  sl.querySelector('.s-prev').addEventListener('click',function(){ clearInterval(timer); go(i-1); auto(); });
  sl.querySelector('.s-next').addEventListener('click',function(){ clearInterval(timer); go(i+1); auto(); });
  auto();
});

/* ---- interactive service rows (studio) ---- */
document.querySelectorAll('.irow').forEach(function(r){
  r.addEventListener('mouseenter',function(){ document.querySelectorAll('.irow').forEach(function(x){x.classList.remove('on');}); r.classList.add('on'); });
});

/* ---- counters ---- */
var cio=new IntersectionObserver(function(es){ es.forEach(function(en){
  if(!en.isIntersecting) return; cio.unobserve(en.target);
  var end=parseInt(en.target.getAttribute('data-count'),10), t0=null;
  function step(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/1200); en.target.textContent=Math.round(end*p); if(p<1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}); },{threshold:.4});
document.querySelectorAll('[data-count]').forEach(function(n){ cio.observe(n); });

/* ---- forms: no public email/phone — everything continues on Instagram DM ---- */
document.querySelectorAll('form[data-ig]').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var note=f.querySelector('.form-note');
    if(note) note.textContent='Opening Instagram — send "START" and paste your details there. We reply on Instagram only.';
    setTimeout(function(){ window.open(IG,'_blank'); },600);
  });
});
})();
