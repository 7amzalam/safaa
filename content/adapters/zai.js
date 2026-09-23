/**
 * AIR Voice Adapter — Z.ai (v4.4)
 * كيف نُدرج زر الإملاء في chat.z.ai وكيف نقرأ النص وكيف نكتبه في حقل الإدخال.
 * التشخيص على الموقع الحقيقي (بدون تسجيل): حقل الإدخال textarea#chat-input
 * وزر الإرسال #send-message-button داخل سلسلة أبواب:
 *   send → .flex → .flex.items-center → .flex.self-end.shrink-0.items-center.gap-1.5
 * الزر يُدرج داخل المجموعة الرئيسية gap-1.5 قبل حاوية الإرسال مباشرة.
 * ملاحظة: Z.ai يعمل بـ Svelte + Tailwind — الكتابة عبر native setter
 * وأحداث input/change/keyup، وأزرارنا بنفس classes تيلويند لتندمج طبيعياً.
 *
 * v4.4 — إصلاح اختفاء الزر أثناء توليد الرد: عند الضغط على «إرسال» يستبدل
 * الموقع زر الإرسال #send-message-button بزر إيقاف ⏹ ويعيد بناء المجموعة،
 * فيختفي زرنا معها. كان المهايئ يعتمد على زر الإرسال وحده لإيجاد مكان
 * الإدراج فيعود buttonContainer() بـ null طوال فترة التوليد ولا يستطيع
 * أي مراقب إعادة الإدراج. الآن سلسلة مراسٍ متدرجة تُرجع مرساة صالحة في كل
 * الأوضاع:
 *   1) غلاف زر الإرسال (الموضع المُثبت — الوضع العادي)
 *   2) المجموعة اليمنى للأزرار (.items-center.self-end) — تُبحث تصاعدياً
 *      من حقل الإدخال وهي باقية أثناء التوليد (تحوي Deep Think والإيقاف)
 *   3) شريط justify-between السفلي — الملاذ الأخير
 * وreposition() يعيد الزر إلى موضعه المثالي بجانب الإرسال فور عودة زر
 * الإرسال بعد انتهاء التوليد.
 */
window.__AIR_VOICE_ADAPTERS__ = window.__AIR_VOICE_ADAPTERS__ || {};

// ── v4.4: المجموعة اليمنى للأزرار — تُبحث من حقل الإدخال تصاعدياً ──
// تعمل في الوضعين: العادي (تحوي زر الإرسال) وأثناء التوليد (تحوي زر الإيقاف)
function __airZaiFindActionsGroup() {
  const ta = document.querySelector('#chat-input');
  if (!ta) return null;
  let scope = ta.parentElement;
  for (let i = 0; i < 8 && scope && scope !== document.body; i++) {
    // المجموعة الرئيسية: .flex.self-end.shrink-0.items-center.gap-1.5
    const group = scope.querySelector('.items-center.self-end')
      || scope.querySelector('.self-end');
    if (group) return group;
    scope = scope.parentElement;
  }
  // الملاذ الأخير: شريط الأزرار السفلي نفسه
  return ta.closest('.rounded-xl')?.querySelector('[class*="justify-between"]') || null;
}

window.__AIR_VOICE_ADAPTERS__.zai = {
  name: 'Z.ai',
  buttonContainer: () => {
    // المسار الأساسي: غلاف زر الإرسال (موضع الزر المُثبت في الوضع العادي)
    const sendBtn = document.querySelector('#send-message-button');
    if (sendBtn) {
      const c = sendBtn.closest('.flex.items-center') || sendBtn.parentElement;
      if (c) return c;
    }
    // أثناء التوليد: زر الإرسال مستبدل بزر الإيقاف — المجموعة اليمنى باقية
    return __airZaiFindActionsGroup();
  },
  insertButton: (btn) => {
    // 1) الوضع العادي: قبل غلاف زر الإرسال مباشرة (بجانبه — الموضع المُثبت)
    const sendBtn = document.querySelector('#send-message-button');
    if (sendBtn) {
      const container = sendBtn.closest('.flex.items-center') || sendBtn.parentElement;
      if (container && container.parentElement) {
        container.parentElement.insertBefore(btn, container);
        return true;
      }
    }
    // 2) أثناء التوليد: داخل المجموعة اليمنى — قبل غلاف آخر زر فيها
    //    (غلاف الإيقاف، بنيته المطابقة لغلاف الإرسال) وإلا في نهايتها،
    //    فيبقى الزر مرئياً بجانب زر الإيقاف طوال فترة التوليد.
    const group = __airZaiFindActionsGroup();
    if (group) {
      const wrap = group.querySelector(':scope > .flex.items-center:not(#air-voice-btn)');
      if (wrap) group.insertBefore(btn, wrap);
      else group.appendChild(btn);
      return true;
    }
    return false; // لا مرساة الآن — المراقبون والدوري سيكتفون لاحقاً
  },
  // ── v4.4: إعادة التموضع بعد انتهاء التوليد ──
  // أثناء التوليد يُدرج الزر داخل المجموعة (بجانب الإيقاف)؛ حين يعود زر
  // الإرسال ويبقى زرنا في غير موضعه المثالي نعيده قبل غلاف الإرسال مباشرة.
  reposition: (btn) => {
    const sendBtn = document.querySelector('#send-message-button');
    if (!sendBtn || !btn || !btn.parentElement) return false;
    const wrap = sendBtn.closest('.flex.items-center') || sendBtn.parentElement;
    if (wrap && wrap.parentElement && btn.nextElementSibling !== wrap) {
      wrap.parentElement.insertBefore(btn, wrap);
      return true;
    }
    return false;
  },
  getInputValue: () => {
    const ta = document.querySelector('#chat-input');
    return ta ? ta.value : '';
  },
  setInputValue: (text) => {
    const ta = document.querySelector('#chat-input');
    if (!ta) return;
    // Z.ai يستخدم Svelte — native setter + أحداث، وبعض الحالات تحتاج keyup إضافياً
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    ).set;
    setter.call(ta, text);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
    ta.focus();
    ta.dispatchEvent(new Event('keyup', { bubbles: true }));
  },
  buttonClass: 'flex items-center justify-center p-1.5 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer'
};
