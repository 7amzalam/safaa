/**
 * AIR Settings Schema (v5.0) — المصدر الوحيد للقيم الافتراضية.
 * يُحمَّل قبل content.js (عبر manifest.json) وقبل popup.js (عبر popup.html)
 * فيُرى في عالم سكربت المحتوى وصفحة popup على حدّ سواء باسم AIR_SETTINGS_SCHEMA.
 *
 * v3.2: voiceEnabled أصبح true — زر الإملاء يعمل من أول لحظة بعد التثبيت
 * دون أي إعداد يدوي. التثبيتات القديمة التي حفظت voiceEnabled:false قبل هذا
 * الإصدار يعالجها ترحيل لمرة واحدة في lib/storage.js.
 *
 * v4.0: ميزة إضافية بمفتاحها الافتراضي:
 * - autoBidi: true — الاتجاه التلقائي (unicode-bidi: plaintext) مفعّل افتراضياً
 *   لأنه أهم للعربية: كل فقرة تتّخذ اتجاهها حسب نصها (RTL/LTR) تلقائياً.
 *
 * v4.7: حُذف مفتاحا readingProgress (شريط تقدم القراءة) وsentenceHighlight
 * (تمييز الجملة) نهائياً من الـ schema — حُذف ملفا الميزتين مع كل مراجعهما
 * (manifest/popup/content.js). مفاتيح قديمة محفوظة في storage تُتجاهل تلقائياً.
 *
 * v5.0: حُذفت مفاتيح مؤقت الجلسة (sessionTimerEnabled/Duration/Sound) نهائياً
 * — حُذف ملف الميزة وكل مراجعها، ومفاتيح قديمة في storage يتنظفها ترحيل v2
 * في lib/storage.js.
 */
(function (global) {
  'use strict';

  const SCHEMA = {
    fontSize: 16,
    lineHeight: 1.75,
    fontFamily: 'Readex Pro',
    bgMode: 'default',
    widthMode: 'medium',
    widthCustom: 1000,
    hideFooter: false,
    // v3.2: التفعيل الافتراضي للإملاء الصوتي (كان false قبل v3.2)
    voiceEnabled: true,
    voiceLanguage: 'ar-SA',
    voiceAutoCopy: true,
    // v4.0: الاتجاه التلقائي (v5.0: بقي وحده بعد حذف مفاتيح المؤقت)
    autoBidi: true                  // مهم للعربية - مفعّل افتراضياً
  };

  // رقم حزمة الترحيل المطبَّقة — يُخزَّن في chrome.storage.sync
  // تحت airSettingsVersion ويمنع إعادة تشغيل الترحيل (راجع lib/storage.js)
  // v2 (v5.0): تنظيف مفاتيح الميزات المحذوفة نهائياً من التخزين
  const MIGRATION_VERSION = 2;

  global.AIR_SETTINGS_SCHEMA = SCHEMA;
  global.AIR_MIGRATION_VERSION = MIGRATION_VERSION;
})(typeof self !== 'undefined' ? self : this);
