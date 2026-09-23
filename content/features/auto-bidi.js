/**
 * Font Changer v4.1 — auto-bidi.js (الاتجاه التلقائي للمقاطع المختلطة)
 *
 * الأساس (v4.0): unicode-bidi: plaintext + text-align: start — المتصفح
 * يختار اتجاه كل فقرة من أول حرف قوي فيها (عربي → RTL، لاتيني → LTR).
 *
 * v4.1 — إصلاح «مشكلة الأرقام»:
 *  1) القوائم المرقمة/النقطية (ol/ul): الأرقام (العلامات) توضع حسب اتجاه
 *     الحاوية لا حسب plaintext الخاص بعناصر القائمة — فكانت الأرقام تظهر
 *     في أقصى اليسار بينما النص العربي محاذى يميناً. الحل: مراقب DOM يكتشف
 *     القوائم التي محتواها عربي ويضبط اتجاهها rtl فتنتقل الأرقام يمين النص
 *     — حتى في الردود المتدفقة أثناء الكتابة.
 *  2) تغطية فقاعات رسائل المستخدم (query-content / user-query /
 *     user-message / userMessage / human-message) — كانت رسائل المستخدم
 *     خارج التغطية فكانت تبدأ بأرقام أو علامات محايدة فتُعرض باتجاه LTR
 *     مع أن نصها عربي.
 *  3) المراقب يعيد الفحص عند أي تحديث DOM (ردود البث المباشر).
 */
(function () {
  'use strict';

  let enabled = false;
  let styleEl = null;
  let mo = null;
  let moTimer = null;

  const CSS = `
    /* الاتجاه التلقائي — يعمل مع كل النصوص المختلطة (v4.0) */
    .md-content p,
    .md-content li,
    .md-content h1, .md-content h2, .md-content h3,
    .md-content h4, .md-content h5, .md-content h6,
    message-content p,
    message-content li,
    [class*="markdown"] p,
    [class*="markdown"] li,
    [class*="response-content"] p,
    [class*="response-content"] li {
      unicode-bidi: plaintext;
      text-align: start;
    }

    /* v4.1: فقاعات رسائل المستخدم — كانت خارج التغطية فتُعرض الرسائل
       العربية التي تبدأ برقم/علامة محايدة باتجاه LTR. plaintext على
       الحاوية وعلى عناصرها يحل الاتجاه من أول حرف قوي في كل فقرة. */
    :is([class*="query-content"], [class*="user-query"],
        [class*="user-message"], [class*="userMessage"],
        [class*="human-message"]),
    :is([class*="query-content"], [class*="user-query"],
        [class*="user-message"], [class*="userMessage"],
        [class*="human-message"]) :is(p, li, div, span,
        h1, h2, h3, h4, h5, h6) {
      unicode-bidi: plaintext;
      text-align: start;
    }

    /* استثناءات صارمة */
    pre, pre *, code, code *,
    kbd, samp,
    .katex, .MathJax,
    [dir="ltr"], [dir="rtl"],
    input, textarea {
      unicode-bidi: normal !important;
      text-align: initial;
    }

    /* v4.1: قائمة محتواها عربي — اتجاه الحاوية rtl حتى تظهر الأرقام
       والنقط يمين النص العربي بدل أقصى اليسار (مشكلة الأرقام الأبرز).
       تُدار بالـ class من المراقب أدناه، وتُنظف عند الإيقاف. */
    .air-bidi-list {
      direction: rtl !important;
    }
  `;

  const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  // جذور البحث: حاويات الرسائل فقط — لا نعبث بقوائم واجهة الموقع نفسها
  const ROOTS_SELECTOR = [
    '.md-content', 'message-content', '[class*="markdown"]',
    '[class*="response-content"]', '[class*="query-content"]',
    '[class*="user-query"]', '[class*="user-message"]',
    '[class*="userMessage"]', '[class*="human-message"]'
  ].join(', ');

  function isBidiForbidden(el) {
    return !!(el && el.closest &&
      el.closest('pre, code, kbd, samp, .katex, .MathJax, input, textarea, [contenteditable="true"]'));
  }

  /** v4.1: اتجاه القوائم حسب لغة محتواها (داخل حاويات الرسائل فقط) */
  function applyListDirections() {
    let roots;
    try { roots = document.querySelectorAll(ROOTS_SELECTOR); } catch (e) { return; }
    const seen = new Set();
    for (const root of roots) {
      if (seen.has(root)) continue;
      seen.add(root);
      let lists;
      try { lists = root.querySelectorAll('ol, ul'); } catch (e) { continue; }
      for (const el of lists) {
        if (isBidiForbidden(el)) continue;
        const arabic = ARABIC_RE.test(el.textContent || '');
        if (arabic) {
          if (!el.classList.contains('air-bidi-list')) el.classList.add('air-bidi-list');
        } else if (el.classList.contains('air-bidi-list')) {
          el.classList.remove('air-bidi-list');
        }
      }
    }
  }

  function scheduleApply() {
    if (moTimer) return;
    moTimer = setTimeout(() => {
      moTimer = null;
      if (enabled) applyListDirections();
    }, 300);
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'air-auto-bidi';
      styleEl.textContent = CSS;
      document.head.appendChild(styleEl);
    }
    applyListDirections();
    // تأخير ثانٍ: محتوى SPA قد يتأخر عن الحقن
    setTimeout(() => { if (enabled) applyListDirections(); }, 500);
    // مراقب DOM: ردود البث المباشر والتنقل بين المحادثات
    try {
      mo = new MutationObserver(scheduleApply);
      mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (e) { mo = null; }
  }

  function disable() {
    enabled = false;
    if (styleEl) { styleEl.remove(); styleEl = null; }
    if (mo) { mo.disconnect(); mo = null; }
    if (moTimer) { clearTimeout(moTimer); moTimer = null; }
    // تنظيف أثر القوائم
    try {
      document.querySelectorAll('.air-bidi-list').forEach(el => el.classList.remove('air-bidi-list'));
    } catch (e) {}
  }

  window.__AIR_BIDI__ = { enable, disable, isEnabled: () => enabled };
})();
