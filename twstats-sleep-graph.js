(function(){var ID="twg1",old=document.getElementById(ID);if(old)old.remove();
function p(n){return String(n).padStart(2,"0")}
function tm(m){m=Math.max(0,Math.min(1440,m));if(m==1440)return"24:00";return p(Math.floor(m/60))+":"+p(m%60)}
function dk(d){return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())}
function dt(d){return dk(d)+" "+p(d.getHours())+":"+p(d.getMinutes())}
function esc(s){return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}
function safe(s){return String(s||"").replace(/[^\w\-]+/g,"_")}
var T=document.body.innerText||"",
    vm=(T.match(/Village:\s*([^\n]+)/)||[])[1]||"Village",
    cm=(T.match(/Location:\s*([0-9]{3}\|[0-9]{3})/)||[])[1]||"coords",
    src=location.href,
    R=[],seen={},re=/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})\s+([\d,]+)\s+([+-]\d+)/g,m;
while((m=re.exec(T))){
  var D=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]),k=+D+"|"+m[6]+"|"+m[7];
  if(!seen[k]){
    seen[k]=1;
    R.push({d:D,date:dk(D),pts:+m[6].replace(/,/g,""),chg:+m[7]})
  }
}
R.sort((a,b)=>a.d-b.d);
if(R.length<2){alert("Not enough TWStats rows found.");return}

var G=[];
for(var i=1;i<R.length;i++){
  var min=Math.round((R[i].d-R[i-1].d)/60000);
  if(min>0)G.push({a:R[i-1],b:R[i],m:min})
}

var days=[...new Set(R.map(x=>x.date))],S={};
function add(day,a,b){if(b<=a)return;if(!S[day])S[day]=[];S[day].push([a,b])}
G.forEach(g=>{
  if(g.m<240)return;
  var s=new Date(g.a.d),e=new Date(g.b.d);
  while(s<e){
    var nd=new Date(s.getFullYear(),s.getMonth(),s.getDate()+1),
        x=s.getHours()*60+s.getMinutes(),
        ee=e<nd?e:nd,
        y=ee.getHours()*60+ee.getMinutes();
    if(+ee==+nd)y=1440;
    add(dk(s),x,y);
    s=nd
  }
});

var H=Array(1440).fill(0);
days.forEach(d=>(S[d]||[]).forEach(q=>{for(var i=q[0];i<q[1];i++)H[i]++}));

var mx=Math.max(...H),thr=Math.max(1,mx-1);
function runs(c){
  var A=[],on=0,st=0;
  for(var i=0;i<=1440;i++){
    var ok=i<1440&&H[i]>=c;
    if(ok&&!on){on=1;st=i}
    else if(!ok&&on){on=0;A.push([st,i])}
  }
  return A
}
function long(A){return A.sort((x,y)=>(y[1]-y[0])-(x[1]-x[0]))[0]}
var B=long(runs(thr)),N=long(runs(mx));

var topg=G.slice().sort((a,b)=>b.m-a.m).slice(0,10),
    top5=topg.slice(0,5);

var W=1120,L=110,CW=970,top=102,rh=32,chartH=days.length*rh,footH=245,h=top+chartH+footH;
function X(m){return L+m/1440*CW}

var svg=['<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+h+'" viewBox="0 0 '+W+' '+h+'">'];
svg.push('<rect width="100%" height="100%" fill="#fff"/>');

svg.push('<text x="12" y="24" font-size="22" font-family="Arial" font-weight="700" fill="#111">Graph: Possible Sleep Intervals of Opponent</text>');
svg.push('<text x="12" y="44" font-size="11" font-family="Arial" font-style="italic" fill="#444">Source: '+esc(src)+'</text>');
svg.push('<text x="12" y="64" font-size="13" font-family="Arial" fill="#333"><tspan font-weight="700">'+esc(vm)+' • '+esc(cm)+'</tspan><tspan font-weight="400"> • server/TWStats time</tspan></text>');

if(B)svg.push('<rect x="'+X(B[0])+'" y="'+top+'" width="'+(X(B[1])-X(B[0]))+'" height="'+chartH+'" fill="rgba(80,180,100,.22)"/>');
if(N)svg.push('<rect x="'+X(N[0])+'" y="'+top+'" width="'+(X(N[1])-X(N[0]))+'" height="'+chartH+'" fill="rgba(0,120,60,.28)"/>');

for(i=0;i<=24;i+=2){
  var xx=X(i*60);
  svg.push('<line x1="'+xx+'" y1="'+top+'" x2="'+xx+'" y2="'+(top+chartH)+'" stroke="'+(i%6?"#bbb":"#777")+'" stroke-width="1" '+(i%6?'stroke-dasharray="4,4"':"")+'/>');
  svg.push('<text x="'+(i==24?xx-30:xx)+'" y="'+(top-14)+'" font-size="12" font-family="Arial" fill="#111">'+p(i)+':00</text>')
}

days.forEach((d,r)=>{
  var y=top+r*rh;
  svg.push('<line x1="'+L+'" y1="'+y+'" x2="'+(L+CW)+'" y2="'+y+'" stroke="#ddd"/>');
  svg.push('<text x="8" y="'+(y+20)+'" font-size="13" font-family="Arial" fill="#111">'+d+'</text>');
  (S[d]||[]).forEach(q=>{
    svg.push('<rect x="'+X(q[0])+'" y="'+(y+7)+'" width="'+(X(q[1])-X(q[0]))+'" height="18" rx="3" fill="#2f73d8"/>');
    svg.push('<text x="'+(X(q[0])+2)+'" y="'+(y+21)+'" font-size="10" font-family="Arial" fill="#fff">'+tm(q[0])+'</text>');
    svg.push('<text x="'+(X(q[1])-30)+'" y="'+(y+21)+'" font-size="10" font-family="Arial" fill="#fff">'+tm(q[1])+'</text>')
  })
});
svg.push('<line x1="'+L+'" y1="'+(top+chartH)+'" x2="'+(L+CW)+'" y2="'+(top+chartH)+'" stroke="#999"/>');

var sy=top+chartH+18;
svg.push('<rect x="'+L+'" y="'+sy+'" width="'+CW+'" height="'+(footH-42)+'" rx="8" fill="#fafafa" stroke="#aaa"/>');

svg.push('<text x="'+(L+14)+'" y="'+(sy+24)+'" font-size="16" font-family="Arial" font-weight="700" fill="#111">Summary</text>');
svg.push('<text x="'+(L+14)+'" y="'+(sy+50)+'" font-size="13" font-family="Arial" fill="#111">Rows: '+R.length+'</text>');
svg.push('<text x="'+(L+120)+'" y="'+(sy+50)+'" font-size="13" font-family="Arial" fill="#111">Best repeated quiet zone: '+(B?tm(B[0])+' - '+tm(B[1]):'none')+'</text>');

var strongText='Strongest overlap zone: '+(N?tm(N[0])+' - '+tm(N[1]):'none');
svg.push('<text x="'+(L+500)+'" y="'+(sy+50)+'" font-size="13" font-family="Arial" font-weight="700" text-decoration="underline" fill="#111">'+strongText+'</text>');

svg.push('<text x="'+(L+500)+'" y="'+(sy+76)+'" font-size="12" font-family="Arial" font-style="italic" fill="#444">Note: TWStats says timing can be off by up to 1.5 hours.</text>');

svg.push('<text x="'+(L+14)+'" y="'+(sy+78)+'" font-size="14" font-family="Arial" font-weight="700" fill="#111">Top 5 largest gaps</text>');
top5.forEach((g,i)=>{
  svg.push('<text x="'+(L+14)+'" y="'+(sy+104+i*18)+'" font-size="12" font-family="Arial" fill="#111">'+
    (i+1)+'. '+Math.floor(g.m/60)+'h '+p(g.m%60)+'m   '+dt(g.a.d)+' -> '+dt(g.b.d)+'   next '+(g.b.chg>0?'+':'')+g.b.chg+
  '</text>')
});

svg.push('</svg>');

var svgText=svg.join("");
var rep="TWStats Quiet-Gap Report\nVillage: "+vm+"\nCoords: "+cm+"\nSource: "+src+"\nRows: "+R.length+
"\nBest repeated quiet zone: "+(B?tm(B[0])+"-"+tm(B[1]):"none")+
"\nStrongest overlap zone: "+(N?tm(N[0])+"-"+tm(N[1]):"none")+
"\n\nLargest gaps:\n"+
topg.map((g,i)=>(i+1)+". "+Math.floor(g.m/60)+"h "+p(g.m%60)+"m  "+dt(g.a.d)+" -> "+dt(g.b.d)+"  next "+(g.b.chg>0?"+":"")+g.b.chg).join("\n")+
"\n\nNote: TWStats says timing can be off by up to 1.5h.";

var box=document.createElement("div");
box.id=ID;
box.style="position:fixed;z-index:999999;top:20px;left:20px;right:20px;bottom:20px;overflow:auto;background:#f8f8f8;border:2px solid #555;padding:12px;color:#111;font-family:Arial";
box.innerHTML=
  '<div style="font-size:22px;font-weight:bold">Graph: Possible Sleep Intervals of Opponent</div>'+
  '<div style="font-size:13px;margin-top:4px">Showing quiet gaps of 4 hours or longer. Times are server/TWStats time.</div>'+
  '<div style="margin:8px 0"><button id="twc">Copy report</button> <button id="tws">Save Graph and Summary as SVG</button> <button id="twx">Close</button></div>'+
  '<div style="background:white;border:1px solid #aaa;padding:8px">'+svgText+'</div>'+
  '<pre style="background:white;border:1px solid #aaa;padding:10px;white-space:pre-wrap">'+esc(rep)+'</pre>';
document.body.appendChild(box);

document.getElementById("twx").onclick=()=>box.remove();
document.getElementById("twc").onclick=()=>navigator.clipboard.writeText(rep).then(()=>alert("Copied."));
document.getElementById("tws").onclick=function(){
  var blob=new Blob([svgText],{type:"image/svg+xml;charset=utf-8"}),
      a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="TWStats_Quiet_Gap_"+safe(cm)+"_"+safe(vm)+".svg";
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000)
};
})();
