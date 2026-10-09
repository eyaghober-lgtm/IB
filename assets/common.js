/* Shared by every page: the 10 IB items, local storage helpers, grade rule, radar chart. */
const items=[
["عبارة الاستقصاء (Statement of Inquiry)","ظاهرة في الصف ويرجع إليها المعلم والطلاب"],
["السياق العالمي (Global Context)","مفعَّل في النشاط، لا مكتوب في الخطة فقط"],
["المفهوم الرئيسي والمفاهيم المرتبطة","واضحة ومرتبطة بالدرس"],
["مهارات ATL","مهارة محددة تُدرَّس بشكل صريح ويعرفها الطلاب"],
["التعلّم بالاستقصاء","أسئلة وبحث وتفكير، لا تلقين"],
["معايير التقييم (A/B/C/D)","يعرف الطلاب المعيار المرتبط بالمهمة"],
["صفات المتعلّم (Learner Profile)","حاضرة في الحوار والنشاط"],
["التمايز (Differentiation)","مهام أو دعم مناسب لمستويات الطلاب"],
["التأمّل (Reflection)","فرصة للطلاب للتأمل في تعلّمهم"],
["مطابقة خطة الوحدة (Unit Planner)","الحصة منسجمة مع الخطة المرفوعة على Classera"]];
const short=i=>items[i][0].split(" (")[0];
const tips=["اربط كل حصة بعبارة الاستقصاء واطلب من الطلاب الرجوع إليها.","فعّل السياق العالمي داخل النشاط نفسه لا في الخطة فقط.","وضّح المفهوم الرئيسي والمفاهيم المرتبطة في بداية الدرس.","درّس مهارة ATL واحدة بشكل صريح وسمِّها للطلاب.","استبدل التلقين بأسئلة وبحث وتفكير موجَّه.","اعرض معيار التقييم المرتبط بالمهمة وناقشه مع الطلاب.","اربط صفات المتعلّم بالحوار والنشاط بأمثلة محددة.","وفّر مهام أو دعماً مناسباً لمستويات الطلاب المختلفة.","خصّص وقتاً لتأمل الطلاب في تعلّمهم.","تأكد من انسجام الحصة مع خطة الوحدة المرفوعة على Classera."];
const wsNames=["ورشة: عبارة الاستقصاء وربطها بالدرس","ورشة: تفعيل السياق العالمي في النشاط","ورشة: المفاهيم الرئيسية والمرتبطة","ورشة: تدريس مهارات ATL صراحةً","ورشة: التعلّم بالاستقصاء بدل التلقين","ورشة: معايير التقييم A/B/C/D مع الطلاب","ورشة: صفات المتعلّم في الحوار","ورشة: التمايز","ورشة: التأمّل","ورشة: مطابقة خطة الوحدة على Classera"];
const lvl=["","غير موجود","بداية","متحقق","متميّز"];

/* grade limits: placeholders until the administration decides */
const gradeOf=p=>p>=90?"A":p>=80?"B":"C";

const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

function radarSvg(sc,size=240){
  const N=10,R=100,C=130,pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/N;return[C+r*Math.cos(a),C+r*Math.sin(a)]};
  let g="";for(let k=1;k<=4;k++)g+=`<polygon points="${items.map((_,i)=>pt(i,R*k/4).join(",")).join(" ")}" fill="none" stroke="var(--line)"/>`;
  g+=items.map((_,i)=>{const[x,y]=pt(i,R),[tx,ty]=pt(i,R+14);return`<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke="var(--line)"/><text x="${tx}" y="${ty}" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="var(--muted)">${i+1}</text>`}).join("");
  g+=`<polygon points="${sc.map((s,i)=>pt(i,R*s/4).join(",")).join(" ")}" fill="rgba(76,195,232,.35)" stroke="var(--teal)" stroke-width="2"/>`;
  return`<svg viewBox="0 0 260 260" width="${size}" height="${size}">${g}</svg>`}
