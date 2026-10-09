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
  <div class="saved">✓ تم حفظ الزيارة <a href="log.html">عرض السجل ←</a></div>`}
function saveVisit(){
  const sc=scores();
  if(sc.includes(0)){alert("أكمل تقييم جميع البنود العشرة أولاً.");return}
  if(!document.getElementById("tch").value){alert("اختر المعلم.");return}
  const sum=sc.reduce((a,b)=>a+b,0),pct=Math.round(sum/40*100),g=id=>document.getElementById(id).value;
  const v={date:g("dt"),sup:g("sup"),br:g("br"),tch:g("tch"),sub:g("sub"),cls:g("cls"),sc,sum,pct,grade:gradeOf(pct)};
  const all=store.get("ib_visits",[]);all.push(v);store.set("ib_visits",all);
  const fb=document.getElementById("fb");fb.innerHTML=feedbackHtml(v);fb.hidden=false;fb.scrollIntoView({behavior:"smooth",block:"nearest"})}
calc();
