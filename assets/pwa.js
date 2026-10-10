/* Add to home screen: registers the service worker and wires every [data-install] button. */
(function () {
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const buttons = () => document.querySelectorAll("[data-install]");
  let deferred = null;
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; });
  addEventListener("appinstalled", () => { deferred = null; buttons().forEach((b) => (b.hidden = true)); });
  if (standalone) { document.addEventListener("DOMContentLoaded", () => buttons().forEach((b) => (b.hidden = true))); return; }

  function help() {
    const old = document.getElementById("pwa-help"); if (old) old.remove();
    const steps = ios
      ? ["افتح الموقع في <b>Safari</b>", "اضغط زر المشاركة <b>⬆︎</b> أسفل الشاشة", "اختر <b>«إضافة إلى الشاشة الرئيسية»</b>", "اضغط <b>إضافة</b>"]
      : ["افتح قائمة المتصفح <b>⋮</b> أعلى الشاشة", "اختر <b>«تثبيت التطبيق»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b>", "اضغط <b>تثبيت</b>"];
    const box = document.createElement("div"); box.id = "pwa-help";
    box.style.cssText = "position:fixed;inset:0;z-index:999;background:rgba(11,31,77,.55);backdrop-filter:blur(4px);display:grid;place-items:center;padding:18px;font-family:inherit;direction:rtl";
    box.innerHTML = `<div style="background:#fff;color:#0f1b3a;max-width:380px;width:100%;border-radius:20px;padding:22px;box-shadow:0 30px 70px -20px rgba(0,0,0,.5);text-align:right;line-height:1.8">
      <img src="assets/icons/icon-192.png" alt="" style="width:64px;height:64px;border-radius:16px;display:block;margin:0 auto 10px">
      <h3 style="margin:0 0 6px;font-size:1.1rem;text-align:center">أضِف الاستمارة إلى الشاشة الرئيسية</h3>
      <p style="margin:0 0 8px;color:#5b6785;font-size:.9rem;text-align:center">تفتح كتطبيق بأيقونة المنهل، وتعمل حتى دون إنترنت.</p>
      <ol style="margin:0;padding-inline-start:22px;font-size:.95rem">${steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      <button style="margin-top:16px;width:100%;padding:11px;border:0;border-radius:12px;background:linear-gradient(135deg,#4cc3e8,#1fa9c9);color:#fff;font-weight:700;font-family:inherit;font-size:1rem;cursor:pointer">حسناً</button></div>`;
    box.addEventListener("click", (e) => { if (e.target === box || e.target.tagName === "BUTTON") box.remove(); });
    document.body.appendChild(box);
  }
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-install]"); if (!b) return;
    e.preventDefault();
    if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (er) {} deferred = null; }
    else help();
  });
})();
