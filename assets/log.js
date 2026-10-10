/* Records page: table, school-wide dashboard, readiness, workshops, CSV export, demo data. */
function render(){
  const all=store.get("ib_visits",[]);
  document.getElementById("empty").hidden=all.length>0;
  document.getElementById("panels").hidden=all.length===0;
  const cnt=document.getElementById("cnt");cnt.hidden=all.length===0;cnt.textContent=all.length+" زيارة محفوظة";
  if(!all.length)return;
  document.querySelector("#logt tbody").innerHTML=all.map((v,i)=>`<tr><td>${v.date}</td><td>${v.tch}</td><td>${v.br||""}</td><td>${v.sub}</td><td>${v.cls}</td><td>${v.sup}</td><td>${v.pct}%</td><td>${v.grade}</td><td><button class="del" onclick="delVisit(${i})">حذف</button></td></tr>`).join("")||`<tr><td colspan="9">لا توجد زيارات.</td></tr>`;
  const D=document.getElementById("dash"),R=document.getElementById("ready"),W=document.getElementById("ws");
  if(!all.length){D.innerHTML="<p>لا توجد زيارات محفوظة بعد.</p>";R.innerHTML="<p>لا توجد زيارات محفوظة بعد.</p>";W.innerHTML="<p>تظهر بعد حفظ الزيارات.</p>";return}
  const avg=items.map((_,i)=>all.reduce((a,v)=>a+v.sc[i],0)/all.length),min=Math.min(...avg);
  D.innerHTML=avg.map((a,i)=>`<div class="bar ${a===min?"weak":""}"><span>${short(i)}</span><i><b style="width:${a/4*100}%"></b></i><span>${a.toFixed(1)}</span></div>`).join("")+
    `<p style="margin-top:10px"><b>أضعف بند IB في المدرسة:</b> ${items[avg.indexOf(min)][0]} — موضوع مقترح للورشة القادمة.</p>`;
  const share=items.map((_,i)=>all.filter(v=>v.sc[i]>=3).length/all.length);
  const ready=Math.round(share.reduce((a,b)=>a+b,0)/10*100);
  const gaps=share.map((s,i)=>[s,i]).filter(x=>x[0]<.7).sort((x,y)=>x[0]-y[0]);
  R.innerHTML=`<div class="big">${ready}%</div><p>نسبة المعلمين الذين حققوا مستوى «متحقق» (3 فأعلى) في بنود الـ IB.</p>`+(gaps.length?`<p><b>فجوات قبل الزيارة:</b></p>`+gaps.map(x=>`<span class="pill" style="background:rgba(229,72,77,.14);color:var(--low)">${short(x[1])} · ${Math.round(x[0]*100)}%</span>`).join(""):`<p style="color:var(--ok)"><b>لا توجد فجوات ظاهرة. المدرسة جاهزة.</b></p>`);
  const need=items.map((_,i)=>[all.filter(v=>v.sc[i]<=2).length,i]).filter(x=>x[0]>0).sort((x,y)=>y[0]-x[0]).slice(0,3);
  W.innerHTML=need.length?need.map((x,k)=>`<div class="bar ${k===0?"weak":""}"><span>${wsNames[x[1]]}</span><i><b style="width:${x[0]/all.length*100}%"></b></i><span>${x[0]} معلم</span></div>`).join("")+`<p style="margin-top:8px">الأولوية حسب عدد المعلمين الذين حصلوا على 1 أو 2 في البند.</p>`:"<p>لا توجد حاجة لورش حالياً.</p>"}
function delVisit(i){const a=store.get("ib_visits",[]);a.splice(i,1);store.set("ib_visits",a);render()}
function clearAll(){if(confirm("حذف كل الزيارات المحفوظة؟")){store.set("ib_visits",[]);render()}}
function exportCsv(){
  const all=store.get("ib_visits",[]);if(!all.length)return;
  const head=["التاريخ","المعلم","الفرع","المادة","الصف","المشرف",...items.map(i=>i[0]),"المجموع","النسبة","التصنيف"];
  const q=s=>`"${String(s).replace(/"/g,'""')}"`;
  const csv="﻿"+[head,...all.map(v=>[v.date,v.tch,v.br||"",v.sub,v.cls,v.sup,...v.sc,v.sum,v.pct+"%",v.grade])].map(r=>r.map(q).join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="ib-observations.csv";a.click()}
function loadDemo(){
  const subs=store.get("ib_sub",["الرياضيات","العلوم","اللغة العربية"]),names=["أحمد","سارة","محمد","ليلى","خالد","نور","يوسف","هدى","عمر","ريم","طارق","دانة"];
  let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  const bias=[0,-.8,-.2,-.7,-.5,-.2,.2,-.1,-.3,.1];
  const all=names.map((n,i)=>{const base=3.2-i*.06;
    const sc=bias.map(b=>Math.max(1,Math.min(4,Math.round(base+b+(rnd()-.5)*1.3))));
    const sum=sc.reduce((a,b)=>a+b,0),pct=Math.round(sum/40*100);
    return{date:new Date().toISOString().slice(0,10),sup:"رئيس التدقيق",tch:"معلم تجريبي "+n,br:"",sub:subs[i%subs.length],cls:"7"+"ABC"[i%3],sc,sum,pct,grade:gradeOf(pct)}});
  store.set("ib_visits",all);render()}
render();
