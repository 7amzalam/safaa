/**
 * AIR Storage (v5.0) — طبقة قراءة موحدة فوق chrome.storage.sync.
 * 1) الدمج: أي مفتاح غائب في إعدادات الموقع يُملأ من AIR_SETTINGS_SCHEMA،
 *    لذلك تعمل الميزات الجديدة افتراضياً حتى في المواقع بلا إعدادات محفوظة.
 * 2) الترحيل (Migration) بخطوات مرقمة حسب airSettingsVersion:
 *    الخطوة 1 (v3.2): قلب voiceEnabled:false المحفوظة صراحةً — للتثبيتات
 *    الأقدم من v1 فقط؛ من اكتملت نسخته >= 1 تُحترم قيمه الحالية (بما فيها أي
 *    إيقاف صريح لاحق للإملاء) لأن إعادة الخطوة الأولى كانت ستقلبها قسراً.
 *    الخطوة 2 (v5.0): حذف مفاتيح الميزات المحذوفة نهائياً من كل المواقع
 *    المحفوظة: sessionTimer* (مؤقت الجلسة) وreadingProgress وsentenceHighlight
 *    — تنظيف دائم يخفف storage.sync.
 *    migrate() تُستدعى عند كل قراءة لكنها لا تفعل شيئاً بعد اكتمال النسخة.
 */
(function (global) {
  'use strict';

  const SCHEMA = global.AIR_SETTINGS_SCHEMA || {};
  const AREA = chrome.storage.sync;

  // مفاتيح الميزات المحذوفة نهائياً — ينظفها ترحيل v2 (v5.0)
  const REMOVED_KEYS = [
    'sessionTimerEnabled', 'sessionTimerDuration', 'sessionTimerSound',
    'readingProgress', 'sentenceHighlight'
  ];

  /**
   * ترحيل بخطوات مرقمة حسب airSettingsVersion (راجع توثيق الملف أعلاه).
   * @returns {Promise<{migrated: boolean, changed?: boolean}>}
   */
  async function migrate() {
    const data = await AREA.get(['fontSettings', 'airSettingsVersion']);
    const from = data.airSettingsVersion || 0;
    if (from >= global.AIR_MIGRATION_VERSION) {
      return { migrated: false };
    }
    const all = data.fontSettings || {};
    let changed = false;

    // الخطوة 1 (v3.2) — للتثبيتات الأقدم من v1 فقط
    if (from < 1) {
      for (const host of Object.keys(all)) {
        const site = all[host];
        if (!site || typeof site !== 'object') continue;
        if (site.voiceEnabled !== true) { site.voiceEnabled = true; changed = true; }
        if (site.voiceLanguage === undefined) { site.voiceLanguage = SCHEMA.voiceLanguage; changed = true; }
        if (site.voiceAutoCopy === undefined) { site.voiceAutoCopy = SCHEMA.voiceAutoCopy; changed = true; }
      }
    }

    // الخطوة 2 (v5.0) — مفاتيح الميزات المحذوفة تُنظف من كل المواقع
    for (const host of Object.keys(all)) {
      const site = all[host];
      if (!site || typeof site !== 'object') continue;
      for (const k of REMOVED_KEYS) {
        if (k in site) { delete site[k]; changed = true; }
      }
    }

    const payload = { airSettingsVersion: global.AIR_MIGRATION_VERSION };
    if (changed) payload.fontSettings = all;
    await AREA.set(payload);
    return { migrated: true, changed };
  }

  /**
   * قراءة إعدادات موقع واحد بعد ضمان الترحيل، مدمجةً بالافتراضيات.
   * القيم المحفوظة للموقع لا تُلمس — الافتراضي يملأ الغائب فقط.
   * @param {string} hostname
   * @returns {Promise<{exists: boolean, settings: object}>}
   *   exists=false تعني «لا إعدادات محفوظة لهذا الموقع» (settings = الافتراضيات)
   */
  async function loadSite(hostname) {
    await migrate();
    const data = await AREA.get('fontSettings');
    const stored = (data.fontSettings || {})[hostname];
    const settings = Object.assign({}, SCHEMA, stored || {});
    return { exists: !!stored, settings };
  }

  global.AIR_STORAGE = { migrate, loadSite };
})(typeof self !== 'undefined' ? self : this);
