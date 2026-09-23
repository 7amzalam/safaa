/**
 * AIR Voice Adapter — DeepSeek (v3.1)
 * كيف نُدرج زر الإملاء في DeepSeek وكيف نقرأ النص ونكتبه في حقل الإدخال.
 * ملاحظة: أسماء classes هنا (.bf38813a و.d96f2d2a) أسماء DeepSeek
 * المُبهمة (CSS modules) — قد تتغير عند تحديثات الموقع.
 */
window.__AIR_VOICE_ADAPTERS__ = window.__AIR_VOICE_ADAPTERS__ || {};

window.__AIR_VOICE_ADAPTERS__.deepseek = {
  name: 'DeepSeek',
  buttonContainer: () => document.querySelector('.bf38813a'),
  insertButton: (btn) => {
    const c = document.querySelector('.bf38813a');
    if (c) c.insertBefore(btn, c.firstChild);
  },
  getInputValue: () => {
    const ta = document.querySelector('textarea.d96f2d2a') ||
               document.querySelector('textarea[placeholder*="DeepSeek"]');
    return ta ? ta.value : '';
  },
  setInputValue: (text) => {
    const ta = document.querySelector('textarea.d96f2d2a') ||
               document.querySelector('textarea[placeholder*="DeepSeek"]');
    if (!ta) return;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    ).set;
    setter.call(ta, text);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
    ta.focus();
  },
  buttonClass: 'ds-button ds-button--icon ds-button--capsule ds-button--s'
};
