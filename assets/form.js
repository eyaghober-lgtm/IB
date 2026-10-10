/* Compact observation form page. */
const rowsEl=document.getElementById("rows");
items.forEach((it,i)=>{
  rowsEl.insertAdjacentHTML("beforeend",`<div class="citem"><div class="n">${i+1}</div><div><h4>${it[0]}</h4><small>${it[1]}</small></div><div class="cs">${
  [1,2,3,4].map(v=>`<input type="radio" name="q${i}" id="q${i}_${v}" value="${v}"><label for="q${i}_${v}" title="${lvl[v]}">${v}</label>`).join("")}</div></div>`)});

const scores=()=>items.map((_,i)=>{const c=document.querySelector(`input[name=q${i}]:checked`);return c?+c.value:0});
function calc(){
  const sc=scores(),n=sc.filter(Boolean).length,s=sc.reduce((a,b)=>a+b,0),p=Math.round(s/40*100);
  document.getElementById("pct").textContent=p+"%";
  document.getElementById("ring").style.setProperty("--p",p);
  document.getElementById("sum").textContent=n?`${s} / 40`:"";
  const gr=document.getElementById("grade");gr.textContent=n<10?"":"التصنيف "+gradeOf(p);gr.style.display=n<10?"none":"inline-block";
  document.getElementById("note").textContent=n<10?`تم تقييم ${n} من 10 بنود`:"اكتملت جميع البنود";
  document.getElementById("radar").innerHTML=radarSvg(sc)}
document.getElementById("rows").addEventListener("change",calc);
function resetForm(){document.querySelectorAll("#rows input").forEach(i=>i.checked=false);document.getElementById("fb").hidden=true;calc()}

/* lists come from the setup page and are stored in this browser */
const lists={br:store.get("ib_br",[]),sup:store.get("ib_sup",["رئيس التدقيق","نائب المدير"]),tch:store.get("ib_tch",[]),sub:store.get("ib_sub",["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم","الدراسات الاجتماعية","التصميم","الفنون","التربية البدنية"])};
const ADD="➕ إضافة جديد…";
function fillSel(id){const s=document.getElementById(id),cur=s.value;
  s.innerHTML=`<option value="">— اختر —</option>`+lists[id].map(x=>`<option>${x}</option>`).join("")+`<option value="__add">${ADD}</option>`;
  if(cur&&lists[id].includes(cur))s.value=cur}
function syncLists(){["br","sup","tch","sub"].forEach(k=>lists[k]=store.get("ib_"+k,lists[k]));["sup","br","tch","sub"].forEach(fillSel)}
window.addEventListener("focus",syncLists);window.addEventListener("storage",syncLists);
["sup","br","tch","sub"].forEach(id=>{fillSel(id);document.getElementById(id).addEventListener("change",e=>{
  if(e.target.value!=="__add")return;
  const v=(prompt("اكتب الاسم:")||"").trim();
  if(v&&!lists[id].includes(v)){lists[id].push(v);store.set("ib_"+id,lists[id])}
  fillSel(id);e.target.value=v&&lists[id].includes(v)?v:""})});
/* picking a teacher fills subject and branch from the setup page */
document.getElementById("tch").addEventListener("change",e=>{
  const m=store.get("ib_tmeta",{})[e.target.value];
  if(m){if(m.sub&&lists.sub.includes(m.sub))document.getElementById("sub").value=m.sub;if(m.br&&lists.br.includes(m.br))document.getElementById("br").value=m.br}});
document.getElementById("dt").valueAsDate=new Date();

function feedbackHtml(v){
  const strong=v.sc.map((s,i)=>[s,i]).filter(x=>x[0]>=3),weak=v.sc.map((s,i)=>[s,i]).filter(x=>x[0]<=2);
  return `<h3>التغذية الراجعة النهائية</h3>
  <p><b>${v.tch||"—"}</b> · ${v.br||"—"} · ${v.sub||"—"} · ${v.cls||"—"} · ${v.date||""}<br>المشرف: ${v.sup||"—"}</p>
  <p>نسبة الأداء <b>${v.pct}%</b> (${v.sum}/40) — التصنيف <b>${v.grade}</b></p>
  <h3>نقاط القوة</h3><ul>${strong.length?strong.map(x=>`<li>${items[x[1]][0]} — ${lvl[x[0]]}</li>`).join(""):"<li>لا توجد بنود بدرجة 3 أو أعلى.</li>"}</ul>
  <h3>مجالات التطوير والتوصيات</h3><ul>${weak.length?weak.map(x=>`<li><b>${items[x[1]][0]}</b> (${lvl[x[0]]}): ${tips[x[1]]}</li>`).join(""):"<li>جميع البنود متحققة أو متميّزة. استمر.</li>"}</ul>
  <div class="saved">✓ تم حفظ الزيارة <a href="log.html">عرض السجل ←</a> <a href="javascript:printReport()">⬇ تصدير PDF</a></div>`}
function saveVisit(){
  const sc=scores();
  if(sc.includes(0)){alert("أكمل تقييم جميع البنود العشرة أولاً.");return}
  if(!document.getElementById("tch").value){alert("اختر المعلم.");return}
  const sum=sc.reduce((a,b)=>a+b,0),pct=Math.round(sum/40*100),g=id=>document.getElementById(id).value;
  const v={date:g("dt"),sup:g("sup"),br:g("br"),tch:g("tch"),sub:g("sub"),cls:g("cls"),sc,sum,pct,grade:gradeOf(pct)};
  const all=store.get("ib_visits",[]);all.push(v);store.set("ib_visits",all);
  const fb=document.getElementById("fb");fb.innerHTML=feedbackHtml(v);fb.hidden=false;fb.scrollIntoView({behavior:"smooth",block:"nearest"})}
calc();

/* ---------- PDF report: a branded A4 page built from the form, shown only when printing ---------- */
function buildReport(){
  const sc=scores(),n=sc.filter(Boolean).length,sum=sc.reduce((a,b)=>a+b,0),pct=Math.round(sum/40*100),g=id=>document.getElementById(id).value||"—";
  const strong=sc.map((s,i)=>[s,i]).filter(x=>x[0]>=3),weak=sc.map((s,i)=>[s,i]).filter(x=>x[0]>0&&x[0]<=2);
  const when=new Date().toLocaleDateString("ar",{year:"numeric",month:"long",day:"numeric"});
  document.getElementById("report").innerHTML=`
  <div class="rp-head"><img src="assets/logo-white.png" alt=""><div><h1>تقرير زيارة صفية IB</h1><small>IB Classroom Observation · مدارس المنهل</small></div></div>
  <div class="rp-meta"><div><span>المعلم</span><b>${g("tch")}</b></div><div><span>الفرع</span><b>${g("br")}</b></div><div><span>المادة</span><b>${g("sub")}</b></div>
    <div><span>الصف</span><b>${g("cls")}</b></div><div><span>المشرف / الزائر</span><b>${g("sup")}</b></div><div><span>تاريخ الزيارة</span><b>${g("dt")}</b></div></div>
  <div class="rp-score"><div class="rp-ring" style="--p:${pct}"><div>${pct}%</div></div>
    <div><b style="font-size:13pt">نسبة الأداء</b>${n===10?`<span class="rp-grade">التصنيف ${gradeOf(pct)}</span>`:""}<p>المجموع ${sum} من 40 · ${n===10?"اكتملت جميع البنود":`تم تقييم ${n} من 10 بنود`}</p><p>النسبة = المجموع ÷ 40 × 100 · 1 غير موجود · 2 بداية · 3 متحقق · 4 متميّز</p></div></div>
  <div class="rp-title">تفصيل البنود</div>
  <table class="rp-items">${items.map((it,i)=>`<tr class="${sc[i]&&sc[i]<=2?"low":""}"><td>${i+1}</td><td>${it[0]}</td><td style="width:34%"><span class="bar"><i style="width:${sc[i]/4*100}%"></i></span></td><td style="width:92px;white-space:nowrap"><b>${sc[i]||"—"}</b> ${lvl[sc[i]]||""}</td></tr>`).join("")}</table>
  <div class="rp-cols"><div><div class="rp-title">نقاط القوة</div><ul>${strong.length?strong.map(x=>`<li>${short(x[1])}</li>`).join(""):"<li>—</li>"}</ul></div>
    <div><div class="rp-title">مجالات التطوير والتوصيات</div><ul>${weak.length?weak.map(x=>`<li><b>${short(x[1])}:</b> ${tips[x[1]]}</li>`).join(""):"<li>لا توجد بنود تحتاج تطويراً.</li>"}</ul></div></div>
  <div class="rp-sign"><div>المشرف / الزائر</div><div>المعلم</div><div>الإدارة</div></div>
  <div class="rp-foot">مدارس المنهل · American Diploma · صدر بتاريخ ${when}</div>`}
function printReport(){
  if(scores().includes(0)){alert("أكمل تقييم جميع البنود العشرة أولاً.");return}
  buildReport();window.print()}
window.addEventListener("beforeprint",buildReport);
