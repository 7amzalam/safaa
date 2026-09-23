/**
 * صفاء v4.8 — content.js
 * يطبّق الخط وحجمه وارتفاع السطر والخلفية وعرض الردود على الصفحة.
 * ملفات الخطوط نفسها تأتي من fonts.css (data: URLs مضمّنة عبر manifest)،
 * لذلك لا يوجد أي طلب شبكي خارجي — متوافق مع CSP الصارم (Gemini وغيره).
 *
 * v2.7: بنية المهايئات — ملف content/adapters/gemini.js يحمل بيانات Gemini
 * (محددات العرض) ويُختار حسب hostname،
 * وapplyWidth تقبل عرضاً مخصصاً (widthCustom) من شريط التمرير.
 *
 * v2.8: إصلاح خليط الألوان — Gemini يعرّف المتغيرات محلياً على عناصر محددة
 * (bard-sidenav وinput-container وinput-area-v2 وفقاعة السؤال) فتتغلب على
 * ما نضعه على :root فقط؛ applyBackground الآن تستهدف هذه العناصر مباشرة
 * بنفس المتغيرات + خلفية مباشرة، وتضبط color-scheme على html/body.
 *
 * v2.9: اكتشاف أن Gemini يشغّل نظامين متوازيين للمتغيرات:
 * 1) --gem-sys-color--* (غطّيناه سابقاً) — للنصوص والردود.
 * 2) --lumi-sys-color--* (لم نلمسه أبداً) — للقوائم وحقل الإدخال والشريط
 *    الجانبي والأزرار؛ هذا كان مصدر الخليط المتبقي: قوائم منسدلة داكنة،
 *    شريط داكن فوق حقل الإدخال، زر ميكروفون بخلفية داكنة.
 * الإضافة في كلا الوضعين: استبدال متغيرات lumi + رموز قوائم Material
 * (mat-menu/dialog/list/card/divider) + محددات دقيقة: لوحات القوائم
 * (mat-mdc-menu-panel وlm-menu-theme)، logo-pill-label-container، إلغاء
 * التدرجات (input-gradient وtop/bottom-gradient)، زر الميكروفون شفاف،
 * أيقونات mat-icon/gem-icon، عناصر القائمة عند hover، الفواصل.
 *
 * v3.2: التفعيل الافتراضي للإملاء الصوتي + مراقب دوري (كل 2 ثانية) يعيد
 * إدراج الزر في تطبيقات SPA — التنقل بين المحادثات لا يعيد تحميل الصفحة
 * فكان الزر يختفي. القراءة تمر عبر lib/storage.js (دمج افتراضيات
 * lib/settings-schema.js + ترحيل لمرة واحدة للتثبيتات القديمة).
 *
 * v4.0: ربط الميزات الإضافية (ملفاتها في content/features/):
 * __AIR_BIDI__ (الاتجاه التلقائي) — (v5.0: حُذف __AIR_TIMER__ نهائياً)
 * (كانت تشمل __AIR_PROGRESS__ و__AIR_HIGHLIGHT__ — حُذفت نهائياً في v4.7)
 * جميعها تُطبَّق/تُوقَف من applyExtraFeatures حسب إعدادات الموقع،
 * وتُستدعى من applySavedSettingsForSite ومن changeFont ومن resetFont.
 *
 * v4.3: توسعة طبقة المحددات الاحتياطية لـ DeepSeek بعد تقرير المستخدم —
 * الشريط الجانبي كاملاً (الحاويات _7b40dad/_3586175، عناصر المحادثات
 * _546d736.b64fb9ae، عناوينها c08e6e93، بطاقة الحساب _2afd28d واسم
 * المستخدم _9d8da05، زر New chat _5a8ac7a، الأيقونات _39cc453/_1c42ad7
 * وfill لـ svg، أزرار العناصر _2090548، بطاقة الخيارات _23e1c55)
 * + شريط التمرير ds-scroll-area__vertical/horizontal-bar بحالتي hover.
 *
 * v4.5: إصلاح الألوان المتبقية في DeepSeek (تقرير المستخدم):
 * (1) بلوكات الكود كانت داكنة دائماً — الحاوية _121d384 والرأس d2a24f03
 *     واسم اللغة d813de27 وأزرار Copy _64bb515 وتوكنات .token.* —
 *     لا تستهلك --dsw-alias-* ولم تُلمس في v4.3.
 * (2) عناوين الأقسام f3d18f6a بخلفية شفافة صراحة.
 * (3) المحادثة النشطة _546d736.b64fb9ae بخلفية خفيفة ثابتة + استدارة 8px
 *     + hover لنقاط العنصر _2090548 + حاوية الأزرار _254829d شفافة.
 * (5) hover شريط التمرير: الفاتح 0.45 والداكن 0.40 (كانت 0.4/0.35).
 *
 * v4.6: «DeepSeek Final Colors» — تقرير المستخدم التشخيصي على الموقع الحقيقي
 * بعد v4.5: خمس عناصر داكنة متبقية + تدرجان بأسماء الفئات الحقيقية
 * (محددات v4.3/v4.5 كانت من تشخيص سابق ولا تطابق DOM الموقع الحالي):
 * (1) الجذر الخارجي للسايدبار b8812f16.a2f3d50e — بقي rgb(27,27,28) دائماً.
 * (2) حاوية الكود بأشكالها الحقيقية md-code-block/-dark/-light و[class*=].
 * (3) رأس الكود md-code-block-banner/-lite/-wrap — يأتي بعد الحاوية في
 *     الترتيب حتى يغلب [class*="md-code-block"] عند تساوي الخصوصية (0,1,0).
 * (4) زر DeepThink/Search المحدد ds-toggle-button--selected (+f79352dc):
 *     أزرق باهت في الفاتح وأزرق هادئ في الداكن بدل الداكن/النيلي.
 * (5) التدرجات: _254829d (fade زر النقاط — v4.5 صفّرت background-color فقط
 *     فبقي background-image وهذا ما ظهر في التقرير) تُزال كلياً،
 *     و_1d72f01 (fade أسفل السايدبار) يستبدل بتدرج بنفس النسب 80.65%
 *     بلون الثيم، مع احتياطي .ds-virtual-list--printable ._871cbca.
 *     (overlay _4cbcd96 تُرك عمداً — خلفية modal مقصودة بحسب التقرير).
 *
 * v4.7: «صفاء» — إعادة تسمية الإضافة (كانت Font Changer)، أيقونة جديدة
 * بحرف «ص» في assets/icons/ بأربعة أحجام، وحذف نهائي لميزتي شريط تقدم
 * القراءة (reading-progress.js / __AIR_PROGRESS__) وتمييز الجملة
 * (sentence-highlight.js / __AIR_HIGHLIGHT__): من manifest ومن
 * applyExtraFeatures ومن الواجهة والإعدادات — مفاتيح قديمة في storage
 * تُتجاهل تلقائياً.
 *
 * v4.8: «Z.ai Colors Fix» — طبقة ZAI_FALLBACK_LIGHT/DARK لتطبيق
 * «فاتح دافئ» و«داكن مريح» على chat.z.ai بمحددات الموقع الحقيقية
 * (Tailwind: nav.sticky وtext-stone-950 وbg-[#f8f8f8] وdark:bg-[#161616]
 * و#chat-input و#send-message-button و#upload-file-button…) مع !important
 * لغلبة dark: variants، وتحديث محددات z.ai الحيّة (build prod-fe-1.1.96)،
 * وإخراج Z.ai من المحرك الاحتياطي العام (v2.7) الذي كانت قواعده العامة
 * تتعارض مع الطبقة الجديدة — بوابتهما في applyBackground على z.ai حصراً.
 *
 * v4.9: «Z.ai Sidebar + Settings» — من تقارير المستخدم التشخيصية الثلاثة
 * (صفحة المحادثة / الإعدادات مع الإضافة / الإعدادات بلا الإضافة):
 * (1) عنوان صفحة الإعدادات (div IowanOldSt) كان #ffffff فوق الفاتح.
 * (2) روابط قوائم الإعدادات والمحادثات a.flex.h-9 (وspan.flex-1.truncate)
 *     بألوان oklab بيضاء/80% لا ترث الحاوية فتبدو مختلطة.
 * (3) توسيع كسر dark: من [class*="dark:bg-[#1"] إلى كل [class*="dark:bg-[#"]
 *     — لوحة الإعدادات اليمنى (#212121) وبطاقاته (#2b2b2b) وحقوله (#292929)
 *     وأزراره (#0d0d0d) كانت تُفلت فتبدو «يسار فاتح ويمين داكن»، وكذلك
 *     dark:border-[# وdark:text- (خارج الأزرار وsvg حمايةً لأزرار اللكنة).
 * (4) كسر خلفيات الفاتح المعلنة: bg-[#f8f8f8] وbg-[#fff وbg-white
 *     (والنصوص الداكنة داخل bg-white في الداكن المريح).
 * (5) حقول النماذج في الإعدادات: input/textarea/select بلوحة الثيم
 *     (مع استثناء chat-input/input-scroll للحفاظ على شفافيتهما).
 * (6) داكن مريح + html.dark (تفعيل الوضع الليلي من Z.ai نفسه): كسر dark:
 *     في كتلة الداكن المريح أيضاً — كان الخليط يستمر.
 */

/**
 * اختيار مهايئ الموقع الحالي حسب hostname (بنية v2.7)
 * المهايئات تُحمَّل من manifest قبل content.js في نفس العالم المعزول
 * وتُصدّر نفسها في self.FC_ADAPTERS — لإضافة موقع جديد: ملف واحد فقط.
 * @returns {object|null} مهايئ الموقع أو null إن لم يوجد
 */
function getAdapter() {
    const adapters = (typeof self !== 'undefined' && self.FC_ADAPTERS) || {};
    const host = window.location.hostname;
    for (const name of Object.keys(adapters)) {
        const a = adapters[name];
        if (a && a.hostPattern instanceof RegExp && a.hostPattern.test(host)) return a;
    }
    return null;
}

/**
 * تطبيق أنماط الخط على الصفحة
 * ينشئ أو يحدّث عنصر style باسم معروف
 * @param {string|number} size - حجم الخط بالبكسل
 * @param {string} family - اسم عائلة الخط
 * @param {string|number} lineHeight - ارتفاع السطر
 * @param {string} [importUrl] - غير مستخدم الآن (كان لـ Google Fonts سابقاً)
 */
function applyFontStyles(size, family, lineHeight, importUrl) {
    let styleElement = document.getElementById('custom-font-style-extension');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-font-style-extension';
        document.head.appendChild(styleElement);
    }
    styleElement.textContent = `
        ${importUrl || ''}
        body, p, div, span, a, li, td, th, h1, h2, h3, h4, h5, h6,
        input, textarea, button {
            font-size: ${size}px !important;
            font-family: '${family}', sans-serif !important;
            line-height: ${lineHeight} !important;
        }
    `;
}

/**
 * v4.1: طبقة المحددات الاحتياطية لألوان DeepSeek (chat.deepseek.com فقط).
 * تعمل تحت html[data-air-bg=...] كطبقة ثانية إن لم تكفِ المتغيرات
 * (--dsw-alias-*) — بعض عناصر DeepSeek لا تستهلك المتغيرات.
 * تُحقَن فقط عندما يكون الموقع deepseek.com (انظر applyBackground) حمايةً
 * لقائمة «لا تلمس»: Gemini/Z.ai — وإلا فإن قواعد header/hr/[class*="dropdown"]
 * العامة كانت ستلوّن عناصرها أيضاً.
 */
const DSW_FALLBACK_LIGHT = `
      /* v4.1: احتياطي DeepSeek — فاتح دافئ */
      html[data-air-bg="warm-light"] {
        .the-header, header, [class*="the-header"] {
          background-color: #f5f3ef !important;
          color: #2a2d31 !important;
          border-color: #d4d0c8 !important;
        }
        .fbb737a4, .ds-collapsible-text {
          background-color: #fdfcfa !important;
          color: #2a2d31 !important;
        }
        ._77cefa5._3d616d3, ._77cefa5 {
          background-color: #fdfcfa !important;
          border-color: #d4d0c8 !important;
        }
        textarea._27c9245, textarea[placeholder*="DeepSeek"] {
          background-color: transparent !important;
          color: #2a2d31 !important;
        }
        ._0fcaa63 {
          background-color: #f5f3ef !important;
          color: #6b7078 !important;
        }
        .aaff8b8f, ._871cbca {
          background-color: #f5f3ef !important;
          color: #2a2d31 !important;
        }
        ._546d736, ._546d736:hover {
          color: #2a2d31 !important;
        }
        ._546d736:hover {
          background-color: #efebe4 !important;
        }
        .ds-button { color: #2a2d31 !important; }
        .ds-button:hover { background-color: rgba(0,0,0,0.06) !important; }
        [role="menu"], .ds-menu, [class*="dropdown"] {
          background-color: #fdfcfa !important;
          border-color: #d4d0c8 !important;
          color: #2a2d31 !important;
        }
        .ds-divider, hr { border-color: #e0dcd4 !important; }

        /* v4.3: الشريط الجانبي كاملاً — الحاويات (بطاقة الحساب والصورة الرمزية
           وقسم السايدبار وعناصره). تقرير المستخدم: عناصر السايدبار بقيت داكنة
           لأن بعضها لا يستهلك --dsw-alias-* فحسب، بل يحمل ألواناً مباشرة. */
        ._871cbca, .aaff8b8f, ._7b40dad, ._7b40dad.f14f3a6d,
        ._3586175, ._6d215eb, ._77cdc67, ._8a693f3,
        ._3098d02, ._63701b7 {
          background-color: #f5f3ef !important;
          color: #2a2d31 !important;
        }

        /* v4.3: رؤوس المجموعات (Pinned / Today) بلون نص ثالث هادئ
           v4.5: + شفافية الخلفية صراحةً (مواصفة المشكلة 2) */
        .f3d18f6a, .f3d18f6a.a9b29780 {
          color: #6b7078 !important;
          background-color: transparent !important;
        }

        /* v4.3: عناصر القوائم — المحادثات، شفافة افتراضياً وبتظليل خفيف عند hover
           v4.5: المحادثة النشطة (b64fb9ae) خلفية خفيفة ثابتة + استدارة 8px (المشكلة 3) */
        ._546d736 {
          color: #2a2d31 !important;
          background-color: transparent !important;
          border-radius: 8px !important;
        }
        ._546d736:hover {
          background-color: #efebe4 !important;
        }
        ._546d736.b64fb9ae {
          color: #2a2d31 !important;
          background-color: #efebe4 !important;
        }
        ._546d736.b64fb9ae:hover {
          background-color: #efebe4 !important;
        }

        /* v4.3: عناوين المحادثات */
        .c08e6e93 { color: #2a2d31 !important; }

        /* v4.3: بطاقة الحساب في الأسفل + اسم المستخدم */
        ._2afd28d {
          background-color: #f5f3ef !important;
          color: #2a2d31 !important;
        }
        ._2afd28d:hover { background-color: #efebe4 !important; }
        ._9d8da05 { color: #2a2d31 !important; }

        /* v4.3: زر New chat */
        ._5a8ac7a, ._5a8ac7a[tabindex="0"] {
          color: #2a2d31 !important;
          background-color: transparent !important;
        }
        ._5a8ac7a:hover { background-color: #efebe4 !important; }

        /* v4.3: الأيقونات في السايدبار (ولون التعبئة fill لـ svg) */
        ._39cc453, ._39cc453 svg, ._1c42ad7, ._1c42ad7 svg {
          color: #4a4d52 !important;
          fill: #4a4d52 !important;
        }

        /* v4.3: أزرار العناصر (النقاط الثلاث) وبطاقة «خيارات إضافية»
           v4.5: + خلفية hover للنقاط وحاوية الأزرار _254829d شفافة (المشكلة 3) */
        ._2090548 { color: #6b7078 !important; }
        ._2090548:hover { background-color: rgba(0, 0, 0, 0.05) !important; }
        ._23e1c55 { background-color: transparent !important; }
        ._8023265 svg { color: #4a4d52 !important; }
        ._254829d { background-color: transparent !important; }

        /* v4.3: شريط التمرير — مكونات ds-scroll-area المخصصة */
        .ds-scroll-area__vertical-bar,
        .ds-scroll-area__horizontal-bar {
          background-color: rgba(42, 45, 49, 0.25) !important;
        }
        .ds-scroll-area__vertical-bar:hover,
        .ds-scroll-area__horizontal-bar:hover {
          background-color: rgba(42, 45, 49, 0.45) !important;
        }

        /* v4.5: بلوكات الكود (المشكلة 1) — كانت داكنة دائماً لأنها لا تستهلك
           --dsw-alias-*: الحاوية والرأس واسم اللغة وزر Copy + توكنات prism */
        ._121d384,
        ._121d384 > div:first-child:not(.d2a24f03),
        pre,
        pre code,
        pre[class*="language"],
        code[class*="language"],
        code {
          background-color: #efebe4 !important;
          color: #2a2d31 !important;
          border-color: #d4d0c8 !important;
        }
        .d2a24f03,
        .d2a24f03._246a029,
        .efa13877 {
          background-color: #e9e5dd !important;
          color: #4a4d52 !important;
          border-color: #d4d0c8 !important;
        }
        .d813de27 { color: #6b7078 !important; }
        ._64bb515,
        ._64bb515:hover {
          color: #4a4d52 !important;
          background-color: transparent !important;
        }
        ._64bb515:hover {
          background-color: rgba(0, 0, 0, 0.05) !important;
        }
        ._64bb515 svg,
        ._64bb515 path {
          color: currentColor !important;
          fill: currentColor !important;
        }
        .token.comment     { color: #6b7078 !important; }
        .token.keyword     { color: #9a4d8a !important; }
        .token.string      { color: #3a7a4f !important; }
        .token.function    { color: #4a7ba7 !important; }
        .token.number      { color: #b85a2a !important; }
        .token.operator    { color: #6b7078 !important; }
        .token.parameter   { color: #555a60 !important; }
        .token.variable    { color: #b85a2a !important; }
        .token.punctuation { color: #555a60 !important; }

        /* ─── v4.6: DeepSeek Final Colors — من تقرير المستخدم على الموقع الحقيقي ─── */

        /* 1) الشريط الجانبي الخارجي — الجذر الحقيقي (كان rgb(27,27,28) دائماً) */
        .b8812f16,
        .b8812f16.a2f3d50e {
          background-color: #f5f3ef !important;
          color: #2a2d31 !important;
          border-color: #d4d0c8 !important;
        }

        /* 2) حاوية الكود بكل أشكالها الحقيقية */
        .md-code-block,
        .md-code-block-dark,
        .md-code-block-light,
        [class*="md-code-block"] {
          background-color: #efebe4 !important;
          color: #2a2d31 !important;
          border-color: #d4d0c8 !important;
        }

        /* 3) رأس الكود — بعد الحاوية عمداً ليغلب [class*="md-code-block"]
           عند تساوي الخصوصية */
        .md-code-block-banner,
        .md-code-block-banner-lite,
        .md-code-block-banner-wrap,
        [class*="md-code-block-banner"] {
          background-color: #e9e5dd !important;
          color: #4a4d52 !important;
          border-color: #d4d0c8 !important;
        }

        /* 4) زر DeepThink / Search المحدد — أزرق باهت بدل الداكن */
        .ds-toggle-button--selected,
        .f79352dc.ds-toggle-button--selected {
          background-color: #e6eef5 !important;
          color: #4a7ba7 !important;
          border-color: #a8c7e0 !important;
        }

        /* 5) التدرجات — fade زر النقاط يزال كلياً (v4.5 صفّرت background-color
           فقط فبقي background-image وهو ما ظهر في تقرير المستخدم) */
        ._254829d {
          background-image: none !important;
          background-color: transparent !important;
        }

        /* 5-ب) fade أسفل السايدبار — يستبدل بتدرج فاتح بنفس النسب */
        ._1d72f01 {
          background-image: none !important;
          background: linear-gradient(transparent 0%, #f5f3ef 80.65%) !important;
        }

        /* احتياطي: أي gradient داكن داخل قائمة المحادثات الافتراضية */
        .ds-virtual-list--printable ._871cbca {
          background: #f5f3ef !important;
        }
      }
`;

const DSW_FALLBACK_DARK = `
      /* v4.1: احتياطي DeepSeek — داكن مريح */
      html[data-air-bg="comfort-dark"] {
        .the-header, header, [class*="the-header"] {
          background-color: #1e2126 !important;
          color: #ddd9d3 !important;
          border-color: #3a3d42 !important;
        }
        .fbb737a4, .ds-collapsible-text {
          background-color: #26292f !important;
          color: #ddd9d3 !important;
        }
        ._77cefa5._3d616d3, ._77cefa5 {
          background-color: #26292f !important;
          border-color: #3a3d42 !important;
        }
        textarea._27c9245, textarea[placeholder*="DeepSeek"] {
          background-color: transparent !important;
          color: #ddd9d3 !important;
        }
        ._0fcaa63 {
          background-color: #1e2126 !important;
          color: #878b93 !important;
        }
        .aaff8b8f, ._871cbca {
          background-color: #1e2126 !important;
          color: #ddd9d3 !important;
        }
        ._546d736 { color: #ddd9d3 !important; }
        ._546d736:hover {
          background-color: #2a2e34 !important;
        }
        .ds-button { color: #ddd9d3 !important; }
        .ds-button:hover { background-color: rgba(255,255,255,0.08) !important; }
        [role="menu"], .ds-menu, [class*="dropdown"] {
          background-color: #26292f !important;
          border-color: #3a3d42 !important;
          color: #ddd9d3 !important;
        }
        .ds-divider, hr { border-color: #3a3d42 !important; }

        /* v4.3: الشريط الجانبي كاملاً — نفس منطق الفاتح بألوان داكنة مريحة */
        ._871cbca, .aaff8b8f, ._7b40dad, ._7b40dad.f14f3a6d,
        ._3586175, ._6d215eb, ._77cdc67, ._8a693f3,
        ._3098d02, ._63701b7 {
          background-color: #1e2126 !important;
          color: #ddd9d3 !important;
        }

        .f3d18f6a, .f3d18f6a.a9b29780 {
          color: #878b93 !important;
          background-color: transparent !important;
        }

        /* v4.5: المحادثة النشطة خلفية داكنة مريحة ثابتة + استدارة 8px (المشكلة 3) */
        ._546d736 {
          color: #ddd9d3 !important;
          background-color: transparent !important;
          border-radius: 8px !important;
        }
        ._546d736:hover {
          background-color: #2a2e34 !important;
        }
        ._546d736.b64fb9ae {
          color: #ddd9d3 !important;
          background-color: #2a2e34 !important;
        }
        ._546d736.b64fb9ae:hover {
          background-color: #2a2e34 !important;
        }

        .c08e6e93 { color: #ddd9d3 !important; }

        ._2afd28d {
          background-color: #1e2126 !important;
          color: #ddd9d3 !important;
        }
        ._2afd28d:hover { background-color: #2a2e34 !important; }
        ._9d8da05 { color: #ddd9d3 !important; }

        ._5a8ac7a, ._5a8ac7a[tabindex="0"] {
          color: #ddd9d3 !important;
          background-color: transparent !important;
        }
        ._5a8ac7a:hover { background-color: #2a2e34 !important; }

        ._39cc453, ._39cc453 svg, ._1c42ad7, ._1c42ad7 svg {
          color: #b8b4ae !important;
          fill: #b8b4ae !important;
        }

        ._2090548 { color: #878b93 !important; }
        ._2090548:hover { background-color: rgba(255, 255, 255, 0.08) !important; }
        ._23e1c55 { background-color: transparent !important; }
        ._8023265 svg { color: #b8b4ae !important; }
        ._254829d { background-color: transparent !important; }

        /* v4.3: شريط التمرير — مكونات ds-scroll-area المخصصة */
        .ds-scroll-area__vertical-bar,
        .ds-scroll-area__horizontal-bar {
          background-color: rgba(221, 217, 211, 0.20) !important;
        }
        .ds-scroll-area__vertical-bar:hover,
        .ds-scroll-area__horizontal-bar:hover {
          background-color: rgba(221, 217, 211, 0.40) !important;
        }

        /* v4.5: بلوكات الكود (المشكلة 1) — في الداكن المريح تبقى داكنة لكن
           بدرجة موحّدة مع الثيم مع توكنات فاتحة مقروءة */
        ._121d384,
        ._121d384 > div:first-child:not(.d2a24f03),
        pre,
        pre code,
        pre[class*="language"],
        code[class*="language"],
        code {
          background-color: #23272c !important;
          color: #ddd9d3 !important;
          border-color: #3a3d42 !important;
        }
        .d2a24f03,
        .d2a24f03._246a029,
        .efa13877 {
          background-color: #2a2e34 !important;
          color: #b8b4ae !important;
          border-color: #3a3d42 !important;
        }
        .d813de27 { color: #878b93 !important; }
        ._64bb515 {
          color: #b8b4ae !important;
        }
        ._64bb515:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }
        ._64bb515 svg,
        ._64bb515 path {
          color: currentColor !important;
          fill: currentColor !important;
        }
        .token.comment     { color: #6b7078 !important; }
        .token.keyword     { color: #c88ee1 !important; }
        .token.string      { color: #80da88 !important; }
        .token.function    { color: #86a8c9 !important; }
        .token.number      { color: #ffb683 !important; }
        .token.operator    { color: #878b93 !important; }
        .token.parameter   { color: #a8a4a0 !important; }
        .token.variable    { color: #ffb683 !important; }
        .token.punctuation { color: #a8a4a0 !important; }

        /* ─── v4.6: DeepSeek Final Colors — نفس منطق الفاتح بألوان الداكن المريح ─── */

        .b8812f16,
        .b8812f16.a2f3d50e {
          background-color: #1e2126 !important;
          color: #ddd9d3 !important;
          border-color: #3a3d42 !important;
        }

        .md-code-block,
        .md-code-block-dark,
        .md-code-block-light,
        [class*="md-code-block"] {
          background-color: #23272c !important;
          color: #ddd9d3 !important;
          border-color: #3a3d42 !important;
        }

        .md-code-block-banner,
        .md-code-block-banner-lite,
        .md-code-block-banner-wrap,
        [class*="md-code-block-banner"] {
          background-color: #2a2e34 !important;
          color: #b8b4ae !important;
          border-color: #3a3d42 !important;
        }

        .ds-toggle-button--selected,
        .f79352dc.ds-toggle-button--selected {
          background-color: #2a3038 !important;
          color: #86a8c9 !important;
          border-color: #3a4d63 !important;
        }

        ._254829d {
          background-image: none !important;
          background-color: transparent !important;
        }

        ._1d72f01 {
          background-image: none !important;
          background: linear-gradient(transparent 0%, #1e2126 80.65%) !important;
        }

        .ds-virtual-list--printable ._871cbca {
          background: #1e2126 !important;
        }
      }
`;

/**
 * v4.8: طبقة المحددات لألوان Z.ai (chat.z.ai) — من التقرير التشخيصي الكامل
 * للمستخدم (الوضعان الداكن والفاتح) + تحقق حي على الموقع (2026-09-23،
 * build prod-fe-1.1.96) بحقن الكتلتين قبل اعتمادهما:
 * - الفحص الحي للمتغيرات (سكربت القسم 2 من المواصفة + مسح عميق لكل الأوراق)
 *   لم يجد متغيرات ثيم حقيقية تحت :root/html/.dark/.light/body/.app ولا
 *   قواعد لأصناف bg-bg-bg/border-border-strong في أوراق الزائر المجهول —
 *   لذلك لا يوجد «استبدال متغيرات» بأسلوب Gemini (--gem-sys-color--) أو
 *   DeepSeek (--dsw-alias--) هنا؛ كتلة المتغيرات أدناه تبقى بأسماء التشخيص
 *   لتوثيق النية والتقاط أي استهلاك مستقبلي (تُحقن على z.ai فقط فلا تلمس
 *   مواقع أخرى، وتعريفها بلا مستهلكين خامل تماماً).
 * - المشكلة المعمارية (من التقرير): Tailwind dark: variants تُترجم إلى
 *   .dark\:bg-\[\#161616\]:where(.dark, .dark *) — خصوصية أعلى من القواعد
 *   العادية، فكل قاعدة هنا بـ !important (تحقق حي: القواعد أطبقت قيم
 *   #161616/#292929/white-25% في الوضع الداكن المحاكى و#f8f8f8/#e0e0e0
 *   في الفاتح، وقلبتهما الكتلتان بالكامل).
 * ملاحظة تنفيذية: داخل template literal تُكتب الهروبات CSS مضاعفة (\\:
 * و\\[ و\\#) لتصل `\:` و`\[` و`\#` إلى نص CSS سليماً، والمحددات
 * [class*="dark:bg-[#161616]"] لا تحتاج هروباً داخل السلسلة المقتبسة.
 * تُحقَنان فقط عندما يكون الموقع z.ai (انظر applyBackground) — حمايةً
 * لقائمة «لا تلمس»: Gemini/DeepSeek وبقية المواقع.
 */
const ZAI_FALLBACK_LIGHT = `
      /* v4.8: احتياطي Z.ai — فاتح دافئ */
      html[data-air-bg="warm-light"] {

        /* ─── المتغيرات (أسماء التشخيص — الفحص الحي لم يجد متغيرات حقيقية
           فلا بديل يُستبدل؛ تبقى لالتقاط أي استهلاك مستقبلي) ─── */
        :root, html, html.light, html.dark, body, .app {
          --bg-bg: #f5f3ef !important;
          --bg-bg-secondary: #efebe4 !important;
          --bg-bg-tertiary: #e9e5dd !important;
          --border-strong: #d4d0c8 !important;
          --border-default: #e0dcd4 !important;
          --text-primary: #2a2d31 !important;
          --text-secondary: #4a4d52 !important;
          --text-tertiary: #6b7078 !important;
        }

        /* ─── Override dark: Tailwind classes — v4.9: نُقلت هذه المجموعة
           خارج الكتلة إلى صيغة مركّبة على الجذر (انظر أسفل الكتلة):
           التداخل العادي ينتج html[...] html.dark وهو مستحيل المطابقة
           لأن html لا يحتوي نفسه — كانت قواعد v4.8 هنا ميتة فعلياً ─── */

        /* ─── الخلفية الرئيسية للتطبيق ─── */
        .app,
        #app,
        #app > div,
        .app > div,
        body > div > div {
          background-color: #f5f3ef !important;
          color: #2a2d31 !important;
        }

        /* ─── التطبيق الكامل (الحاوية العلوية من التشخيص) ─── */
        div.text-stone-950,
        div[class*="text-stone-950"],
        div[class*="bg-[#f8f8f8]"][class*="h-screen"] {
          background-color: #f5f3ef !important;
          color: #2a2d31 !important;
        }

        /* ─── الشريط العلوي (Nav) ─── */
        nav.sticky,
        nav[class*="sticky"][class*="top-0"],
        nav[class*="h-[52px]"] {
          background-color: #f5f3ef !important;
          color: #2a2d31 !important;
          border-color: #e0dcd4 !important;
        }

        /* ─── نص Nav (اسم النموذج GLM-5.3-Flash) ─── */
        nav.sticky *,
        nav[class*="sticky"] span,
        nav[class*="sticky"] div {
          color: #2a2d31 !important;
        }

        /* ─── زر Share (النشط الداكن) ─── */
        button[class*="px-3"][class*="py-1.5"],
        nav.sticky button {
          background-color: #4a7ba7 !important;
          color: #fdfcfa !important;
          border-color: #4a7ba7 !important;
        }

        button[class*="px-3"][class*="py-1.5"]:hover,
        nav.sticky button:hover {
          background-color: #3a6b97 !important;
        }

        /* ─── حقل الإدخال ─── */
        .flex-1.flex.flex-col.relative.w-full.rounded-xl,
        [class*="rounded-xl"][class*="border"],
        form [class*="rounded-xl"] {
          background-color: #fdfcfa !important;
          color: #2a2d31 !important;
          border-color: #d4d0c8 !important;
        }

        /* Textarea */
        #chat-input,
        textarea[class*="input-scroll"] {
          background-color: transparent !important;
          color: #2a2d31 !important;
          caret-color: #4a7ba7 !important;
        }

        #chat-input::placeholder,
        textarea[class*="input-scroll"]::placeholder {
          color: #6b7078 !important;
        }

        /* ─── زر الإرسال (غير نشط) ─── */
        #send-message-button,
        button[class*="sendMessageButton"] {
          background-color: #e0dcd4 !important;
          color: #6b7078 !important;
        }

        /* ─── زر الإرسال (نشط - عند الكتابة) ─── */
        #send-message-button:not([disabled]),
        button[class*="sendMessageButton"]:not([disabled]) {
          background-color: #4a7ba7 !important;
          color: #fdfcfa !important;
        }

        /* ─── زر الرفع والمرفقات — v5.1: ‎[class~="p-1.5"] بدل ‎[class*="p-1.5"]:
           مطابقة السلسلة الفرعية كانت تلتقط gap-1.5 وغيرها فتُبطل خلفية
           أزرار داكنة كاملة في الإعدادات/القوائم (جزء من شكوى الأيقونات) ─── */
        #upload-file-button,
        button[class*="rounded-lg"][class~="p-1.5"] {
          background-color: transparent !important;
          color: #4a4d52 !important;
        }

        #upload-file-button:hover,
        button[class*="rounded-lg"][class~="p-1.5"]:hover {
          background-color: #efebe4 !important;
          color: #2a2d31 !important;
        }

        /* ─── بطاقة «Meet Your AI Agents» ─── */
        [class*="bg-bg-bg"][class*="rounded-xl"],
        [class*="border-border-strong"] {
          background-color: #fdfcfa !important;
          border-color: #d4d0c8 !important;
          color: #2a2d31 !important;
        }

        /* ─── رسائل المستخدم ─── */
        .user-message,
        .user-message *,
        [class*="user-message"] {
          color: #2a2d31 !important;
        }

        /* ─── رسائل المساعد (AI) ─── */
        .chat-assistant,
        .chat-assistant *,
        .markdown-prose,
        .markdown-prose * {
          color: #2a2d31 !important;
        }

        /* ─── القائمة الجانبية (عناصر المحادثات) ─── */
        button[class*="w-full"][class*="rounded-md"][class*="px-3.5"] {
          background-color: transparent !important;
          color: #2a2d31 !important;
        }

        button[class*="w-full"][class*="rounded-md"][class*="px-3.5"]:hover {
          background-color: #efebe4 !important;
        }

        /* ─── الأزرار داخل السايدبار ─── */
        aside, nav[class*="flex-col"],
        [class*="sidebar"], [class*="side-nav"] {
          background-color: #f5f3ef !important;
          color: #2a2d31 !important;
        }

        /* ─── الأيقونات و svg ─── */
        svg, svg * {
          color: inherit;
        }

        /* v5.1: إصلاح الأيقونات فقط (شكوى المستخدم) — (1) بلا فرض
           fill/stroke: الفرض كان يقلب أيقونات الخط المفرغة (fill="none"
           + stroke="currentColor" على الجذر) إلى كتل مصمتة داكنة
           «غريبة»، وأيقونات الخط تتبع color تلقائياً عبر currentColor
           فاللون وحده يكفي دون تكسير الشكل. (2) داخل الأزرار/الروابط
           ترث لون حاويتها: بيضاء فوق أزرار اللكنة الداكنة (#4a7ba7
           و#0d0d0d في القوائم) وداكنة فوق الأسطح الفاتحة — بدل فرض
           الداكن على كل الأزرار بما فيها الداكنة منها. */
        svg[class*="text"],
        button svg,
        a svg {
          color: inherit !important;
        }

        /* ─── النصوص الرمادية الصغيرة — v4.9: استثناء العناصر ذات أصناف
           dark:text- (وإلا اختُطف النمط الغير نشط في وضع الموقع الفاتح
           فمنع الوراثة من الثيم) ─── */
        [class*="text-gray"]:not([class*="dark:text-"]),
        [class*="text-stone"]:not([class*="dark:text-"]),
        [class*="text-neutral"]:not([class*="dark:text-"]) {
          color: #6b7078 !important;
        }

        /* ─── الأكواد ─── */
        pre, code,
        .md-code-block,
        [class*="code-block"] {
          background-color: #efebe4 !important;
          color: #2a2d31 !important;
          border-color: #d4d0c8 !important;
        }

        pre .token.comment,
        code .token.comment { color: #6b7078 !important; }
        pre .token.keyword,
        code .token.keyword { color: #9a4d8a !important; }
        pre .token.string,
        code .token.string { color: #3a7a4f !important; }
        pre .token.function,
        code .token.function { color: #4a7ba7 !important; }

        /* ─── v4.9: صفحة الإعدادات والقائمة الجانبية — محددات التقارير
           التشخيصية الثلاثة الحرفية (بلا تخمين) ─── */

        /* عنوان «Settings» (IowanOldSt) كان #ffffff فوق الفاتح */
        div[class*="IowanOldSt"] {
          color: #2a2d31 !important;
        }

        /* روابط قوائم الإعدادات والمحادثات (a.flex.h-9 من التقرير:
           15 عنصراً) كانت oklab بيضاء/80% لا ترث لون الحاوية */
        a.flex.h-9,
        html.dark a.flex.h-9 {
          color: #2a2d31 !important;
        }

        a.flex.h-9 span {
          color: #2a2d31 !important;
        }

        a.flex.h-9:hover {
          background-color: #efebe4 !important;
        }

        a.flex.h-9 svg {
          color: #4a4d52 !important;
        }

        /* نصوص text-white (oklab) داخل السايدبار/قوائم الإعدادات خارج
           الأزرار — أزرار اللكنة (Share وأخواتها) مستثناة صراحة */
        aside [class*="text-white"]:not(button):not(button *),
        nav[class*="flex-col"] [class*="text-white"]:not(button):not(button *) {
          color: #2a2d31 !important;
        }

        /* نصوص dark:text-… على Z.ai الداكن — نُقلت خارج الكتلة (صيغة
           مركّبة على الجذر) لأن التداخل العادي ميت هنا */

        /* خلفيات الفاتح المعلنة على Z.ai فاتح — نُقلت خارج الكتلة كذلك */

        /* حقول النماذج في صفحة الإعدادات — مع استثناء حقل المحادثة
           (#chat-input/input-scroll) للحفاظ على شفافيتهما */
        input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
        textarea:not(#chat-input):not([class*="input-scroll"]),
        select {
          background-color: #fdfcfa !important;
          color: #2a2d31 !important;
          border-color: #d4d0c8 !important;
        }
      }

      /* ─── v4.9: قواعد السمة على الجذر نفسه — صيغة مركّبة (الوضع +
         data-air-bg على html معاً). التداخل العادي مستحيل هنا لأن html
         لا يحتوي نفسه، وقواعد v4.8 ذات البادئة html.dark داخل الكتلة
         كانت ميتة — يُصلحها هذا التحويل مع توسيع الكسر إلى كل القيم ─── */
      html[data-air-bg="warm-light"].dark .dark\\:bg-\\[\\#161616\\],
      html[data-air-bg="warm-light"].dark [class*="dark:bg-[#"] {
        background-color: #f5f3ef !important;
      }

      html[data-air-bg="warm-light"].dark [class*="dark:bg-[#2b2b2b"],
      html[data-air-bg="warm-light"].dark [class*="dark:bg-[#292929"] {
        background-color: #fdfcfa !important;
      }

      html[data-air-bg="warm-light"].dark [class*="dark:border-[#"] {
        border-color: #e0dcd4 !important;
      }

      /* الحدود القوية (بطاقات/حاويات — القيمة المثبتة من تقرير v4.6) */
      html[data-air-bg="warm-light"].dark [class*="dark:border-[#3f3f3f"] {
        border-color: #d4d0c8 !important;
      }

      /* نصوص dark:text-… (نشطة فقط على الموقع الداكن — حمايةً لعناصر
         الفاتح المعكوسة) خارج الأزرار وsvg */
      html[data-air-bg="warm-light"].dark [class*="dark:text-"]:not(button):not(button *):not(svg) {
        color: #2a2d31 !important;
      }

      /* خلفيات الفاتح المعلنة على Z.ai فاتح (الشريط الجانبي ولوحة
         الإعدادات) — كانت تبقى رمادية باردة وسط الدافئ */
      html[data-air-bg="warm-light"].light [class*="bg-[#f8f8f8"] {
        background-color: #f5f3ef !important;
      }

      html[data-air-bg="warm-light"].light [class*="bg-[#fff"],
      html[data-air-bg="warm-light"].light [class*="bg-white"] {
        background-color: #fdfcfa !important;
      }
`;

const ZAI_FALLBACK_DARK = `
      /* v4.8: احتياطي Z.ai — داكن مريح */
      html[data-air-bg="comfort-dark"] {

        /* ─── المتغيرات (أسماء التشخيص — انظر ملاحظة الفاتح أعلاه) ─── */
        :root, html, html.dark, html.light, body, .app {
          --bg-bg: #1e2126 !important;
          --bg-bg-secondary: #23272c !important;
          --bg-bg-tertiary: #2a2e34 !important;
          --border-strong: #3a3d42 !important;
          --border-default: #2a2d32 !important;
          --text-primary: #ddd9d3 !important;
          --text-secondary: #b8b4ae !important;
          --text-tertiary: #878b93 !important;
        }

        /* ─── Override light/dark classes — v4.9: نُقلت كلها خارج الكتلة
           إلى صيغة مركّبة على الجذر (html لا يحتوي نفسه فالتداخل العادي
           ينتج قواعد ميتة) — انظر أسفل الكتلة ─── */

        .app, #app, #app > div,
        body > div > div,
        div[class*="text-stone-950"],
        div[class*="bg-[#f8f8f8]"][class*="h-screen"] {
          background-color: #1e2126 !important;
          color: #ddd9d3 !important;
        }

        /* ─── الشريط العلوي ─── */
        nav.sticky,
        nav[class*="sticky"][class*="top-0"] {
          background-color: #1e2126 !important;
          color: #ddd9d3 !important;
          border-color: #3a3d42 !important;
        }

        nav.sticky *,
        nav.sticky span,
        nav.sticky div {
          color: #ddd9d3 !important;
        }

        /* ─── زر Share ─── */
        button[class*="px-3"][class*="py-1.5"],
        nav.sticky button {
          background-color: #2a2e34 !important;
          color: #ddd9d3 !important;
          border-color: #3a3d42 !important;
        }

        button[class*="px-3"][class*="py-1.5"]:hover,
        nav.sticky button:hover {
          background-color: #33373d !important;
        }

        /* ─── حقل الإدخال ─── */
        .flex-1.flex.flex-col.relative.w-full.rounded-xl,
        form [class*="rounded-xl"] {
          background-color: #26292f !important;
          color: #ddd9d3 !important;
          border-color: #3a3d42 !important;
        }

        #chat-input,
        textarea[class*="input-scroll"] {
          background-color: transparent !important;
          color: #ddd9d3 !important;
          caret-color: #86a8c9 !important;
        }

        #chat-input::placeholder {
          color: #878b93 !important;
        }

        /* ─── زر الإرسال ─── */
        #send-message-button {
          background-color: #2a2e34 !important;
          color: #878b93 !important;
        }

        #send-message-button:not([disabled]) {
          background-color: #86a8c9 !important;
          color: #16181c !important;
        }

        /* ─── زر الرفع ─── */
        #upload-file-button {
          background-color: transparent !important;
          color: #b8b4ae !important;
        }

        #upload-file-button:hover {
          background-color: #2a2e34 !important;
        }

        /* ─── بطاقة «Meet Your AI Agents» ─── */
        [class*="bg-bg-bg"][class*="rounded-xl"],
        [class*="border-border-strong"] {
          background-color: #23272c !important;
          border-color: #3a3d42 !important;
          color: #ddd9d3 !important;
        }

        /* ─── رسائل المستخدم والمساعد ─── */
        .user-message, .user-message *,
        .chat-assistant, .chat-assistant *,
        .markdown-prose, .markdown-prose * {
          color: #ddd9d3 !important;
        }

        /* ─── القائمة الجانبية ─── */
        button[class*="w-full"][class*="rounded-md"][class*="px-3.5"] {
          background-color: transparent !important;
          color: #ddd9d3 !important;
        }

        button[class*="w-full"][class*="rounded-md"][class*="px-3.5"]:hover {
          background-color: #2a2e34 !important;
        }

        aside, nav[class*="flex-col"],
        [class*="sidebar"], [class*="side-nav"] {
          background-color: #1e2126 !important;
          color: #ddd9d3 !important;
        }

        /* ─── الأيقونات — v5.1: نفس إصلاح الكتلة الدافئة (بلا فرض
           fill/stroke ولا فرض لون موحد): أيقونات الأزرار/الروابط ترث
           لون حاويتها (فاتحة فوق الداكن وداكنة فوق الأزرار الفاتحة) */
        svg, svg * {
          color: inherit;
        }

        svg[class*="text"],
        button svg,
        a svg {
          color: inherit !important;
        }

        /* ─── النصوص الرمادية — v4.9: استثناء العناصر ذات أصناف dark:text-
           (وإلا اختُطف النمط الغير نشط على الموقع الفاتح فمنع الوراثة) ─── */
        [class*="text-gray"]:not([class*="dark:text-"]),
        [class*="text-stone"]:not([class*="dark:text-"]),
        [class*="text-neutral"]:not([class*="dark:text-"]) {
          color: #878b93 !important;
        }

        /* ─── الأكواد ─── */
        pre, code,
        .md-code-block,
        [class*="code-block"] {
          background-color: #23272c !important;
          color: #ddd9d3 !important;
          border-color: #3a3d42 !important;
        }

        /* ─── v4.9: صفحة الإعدادات والقائمة الجانبية — محددات التقارير
           التشخيصية الثلاثة الحرفية (بلا تخمين) ─── */

        /* عنوان «Settings» (IowanOldSt) — اتساق لون الثيم */
        div[class*="IowanOldSt"] {
          color: #ddd9d3 !important;
        }

        /* روابط قوائم الإعدادات والمحادثات (a.flex.h-9 من التقرير) */
        a.flex.h-9,
        html.dark a.flex.h-9 {
          color: #ddd9d3 !important;
        }

        a.flex.h-9 span {
          color: #ddd9d3 !important;
        }

        a.flex.h-9:hover {
          background-color: #2a2e34 !important;
        }

        a.flex.h-9 svg {
          color: #b8b4ae !important;
        }

        /* نصوص text-white (oklab) داخل السايدبار/قوائم الإعدادات خارج
           الأزرار — أوحّدها بلون الثيم الدافئ بدل الأبيض النقي */
        aside [class*="text-white"]:not(button):not(button *),
        nav[class*="flex-col"] [class*="text-white"]:not(button):not(button *) {
          color: #ddd9d3 !important;
        }

        /* نصوص dark:text-… — نُقلت خارج الكتلة (صيغة مركّبة على الجذر) */

        /* حقول النماذج في صفحة الإعدادات — مع استثناء حقل المحادثة
           (#chat-input/input-scroll) للحفاظ على شفافيتهما */
        input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
        textarea:not(#chat-input):not([class*="input-scroll"]),
        select {
          background-color: #26292f !important;
          color: #ddd9d3 !important;
          border-color: #3a3d42 !important;
        }
      }

      /* ─── v4.9: قواعد السمة على الجذر نفسه — صيغة مركّبة (الوضع +
         data-air-bg على html معاً) بدل التداخل الميت داخلياً ─── */
      html[data-air-bg="comfort-dark"].light .bg-\\[\\#f8f8f8\\],
      html[data-air-bg="comfort-dark"].light [class*="bg-[#f8f8f8"] {
        background-color: #1e2126 !important;
      }

      /* بطاقات ولوحات bg-white/bg-[#fff (لوحة الإعدادات اليمنى كانت
         تبقى فاتحة) — مع استثناء حقول النماذج لتبقى على لون الحقول
         المرتفع في قاعدة النماذج بدل لون اللوحات */
      html[data-air-bg="comfort-dark"].light [class*="bg-[#fff"]:not(input):not(select):not(textarea),
      html[data-air-bg="comfort-dark"].light [class*="bg-white"]:not(input):not(select):not(textarea) {
        background-color: #1e2126 !important;
      }

      /* نصوص داكنة داخل عناصر bg-white — وإلا ظلت داكنة على داكن */
      html[data-air-bg="comfort-dark"].light [class*="bg-white"] [class*="text-stone-9"],
      html[data-air-bg="comfort-dark"].light [class*="bg-white"] [class*="text-black"],
      html[data-air-bg="comfort-dark"].light [class*="bg-white"] [class*="text-gray-9"],
      html[data-air-bg="comfort-dark"].light [class*="bg-white"] [class*="text-neutral-9"] {
        color: #ddd9d3 !important;
      }

      html[data-air-bg="comfort-dark"] button[class*="bg-white"] {
        color: #ddd9d3 !important;
      }

      /* Z.ai داكن (html.dark) + داكن مريح — تفعيل الوضع الليلي من Z.ai
         نفسه كان يُبقي الخليط لأن كتلة الداكن لم تكسر dark: إطلاقاً */
      html[data-air-bg="comfort-dark"].dark .dark\\:bg-\\[\\#161616\\],
      html[data-air-bg="comfort-dark"].dark [class*="dark:bg-[#"] {
        background-color: #1e2126 !important;
      }

      html[data-air-bg="comfort-dark"].dark [class*="dark:bg-[#2b2b2b"],
      html[data-air-bg="comfort-dark"].dark [class*="dark:bg-[#292929"],
      html[data-air-bg="comfort-dark"].dark [class*="dark:bg-white"] {
        background-color: #23272c !important;
      }

      html[data-air-bg="comfort-dark"].dark [class*="dark:border-[#"] {
        border-color: #3a3d42 !important;
      }

      /* نصوص dark:text-… (نشطة فقط على الموقع الداكن) خارج الأزرار وsvg */
      html[data-air-bg="comfort-dark"].dark [class*="dark:text-"]:not(button):not(button *):not(svg) {
        color: #ddd9d3 !important;
      }
`;

/**
 * تطبيق خلفية الواجهة: default / warm-light / comfort-dark
 * v2.8 إصلاح خليط الألوان (تشخيص Console على Gemini الحقيقي):
 * Gemini يعرّف نفس المتغيرات محلياً على bard-sidenav وinput-container
 * وinput-area-v2 و.user-query-bubble-with-background، فكانت هذه العناصر
 * تبقى بألوان Gemini الأصلية وسط الصفحة الملوّنة (خليط).
 * الحل: استهداف هذه العناصر مباشرة بنفس المتغيرات + background-color مباشر،
 * وضبط color-scheme على html/body حتى تتبعه الحقول والقوائم الأصلية.
 * default يمسح كل شيء ويعيد color-scheme لحالته الأصلية.
 * v2.9: كلا الوضعين يستبدلان أيضاً نظام --lumi-sys-color--* ورموز
 * Material للقوائم/الحوارات/القوائم-list ويطبّقان المحددات الدقيقة.
 * @param {string} mode
 */
function applyBackground(mode) {
    const el = document.getElementById('custom-bg-extension') || (() => {
        const s = document.createElement('style');
        s.id = 'custom-bg-extension';
        document.head.appendChild(s);
        return s;
    })();

    const html = document.documentElement;
    const body = document.body;

    if (mode === 'default') {
        html.removeAttribute('data-air-bg');
        html.style.removeProperty('color-scheme');
        if (body) body.style.removeProperty('color-scheme');
        el.textContent = '';
        return;
    }

    html.setAttribute('data-air-bg', mode);

    if (mode === 'warm-light') {
        html.style.setProperty('color-scheme', 'light', 'important');
        if (body) body.style.setProperty('color-scheme', 'light', 'important');
        el.textContent = `
      :root, html, body, chat-app, chat-window,
      bard-sidenav, input-container, input-area-v2,
      .user-query-bubble-with-background {
        --gem-sys-color--surface: #f5f3ef !important;
        --gem-sys-color--surface-bright: #fdfcfa !important;
        --gem-sys-color--surface-container: #efebe4 !important;
        --gem-sys-color--surface-container-low: #f5f3ef !important;
        --gem-sys-color--surface-container-high: #e9e5dd !important;
        --gem-sys-color--surface-container-highest: #e3ddd4 !important;
        --gem-sys-color--surface-container-lowest: #fdfcfa !important;
        --gem-sys-color--surface-dim: #ede9e1 !important;
        --gem-sys-color--on-surface: #2a2d31 !important;
        --gem-sys-color--on-surface-variant: #4a4d52 !important;
        --gem-sys-color--on-surface-low: #6b7078 !important;
        --gem-sys-color--outline: #b8b4ad !important;
        --gem-sys-color--outline-variant: #d4d0c8 !important;
        --gem-sys-color--outline-low: #e0dcd4 !important;
        --bard-color-footer-background: #f5f3ef !important;
        --bard-color-draft-chip-background: #e9e5dd !important;
        --bard-color-sidenav-background-desktop: #f5f3ef !important;
        --bard-color-sidenav-background-mobile: #f5f3ef !important;
        --bard-color-onhover-conversation-metadata-button-v2: #e9e5dd !important;
        --bard-color-new-conversation-button: #e9e5dd !important;
        --bard-color-on-new-conversation-button: #2a2d31 !important;
        --mat-app-background-color: #f5f3ef !important;
        --mat-app-text-color: #2a2d31 !important;
        --mat-sidenav-container-background-color: #f5f3ef !important;
        --mat-sidenav-content-background-color: #f5f3ef !important;
        --mat-sidenav-content-text-color: #2a2d31 !important;
        --mat-sidenav-container-text-color: #4a4d52 !important;
        --bard-color-synthetic--chat-window-surface: #f5f3ef !important;
        --bard-color-synthetic--mat-card-background: #efebe4 !important;

        /* v2.9: نظام lumi المتوازي — القوائم وحقل الإدخال والشريط الجانبي والأزرار */
        --lumi-sys-color--surface: #f5f3ef !important;
        --lumi-sys-color--surface-bright: #fdfcfa !important;
        --lumi-sys-color--surface-dim: #efebe4 !important;
        --lumi-sys-color--surface-background: #f5f3ef !important;
        --lumi-sys-color--on-surface: #2a2d31 !important;
        --lumi-sys-color--on-surface-variant: rgba(42, 45, 49, 0.65) !important;
        --lumi-sys-color--on-surface-low: rgba(42, 45, 49, 0.38) !important;
        --lumi-sys-color-states--hover-on-surface: rgba(0, 0, 0, 0.08) !important;
        --lumi-sys-color-states--focus-on-surface: rgba(0, 0, 0, 0.12) !important;
        --lumi-sys-color-states--pressed-on-surface: rgba(0, 0, 0, 0.14) !important;
        --lumi-sys-color--surface-accent: #e6eef5 !important;
        --lumi-sys-color--black: #2a2d31 !important;
        --lumi-sys-color--white: #fdfcfa !important;

        /* v2.9: رموز Material Design للقوائم والحوارات والقوائم-list */
        --mat-menu-container-color: #fdfcfa !important;
        --mat-menu-item-label-text-color: #2a2d31 !important;
        --mat-menu-item-icon-color: #4a4d52 !important;
        --mat-menu-item-hover-state-layer-color: rgba(0,0,0,0.06) !important;
        --mat-menu-item-focus-state-layer-color: rgba(0,0,0,0.10) !important;
        --mat-dialog-container-color: #fdfcfa !important;
        --mat-dialog-subhead-color: #2a2d31 !important;
        --mat-dialog-supporting-text-color: #4a4d52 !important;
        --mat-list-list-item-label-text-color: #2a2d31 !important;
        --mat-list-list-item-hover-state-layer-color: rgba(0,0,0,0.06) !important;
        --mat-list-list-item-leading-icon-color: #4a4d52 !important;
        --mat-card-subtitle-text-color: #4a4d52 !important;
        --mat-divider-color: #e0dcd4 !important;
      }

      html, body, chat-app, chat-window,
      bard-sidenav, input-container, input-area-v2 {
        background-color: #f5f3ef !important;
        color: #2a2d31 !important;
      }

      .user-query-bubble-with-background {
        background-color: #e6eef5 !important;
        color: #2a2d31 !important;
      }

      input-area-v2, .initial-input-area-container {
        background-color: #fdfcfa !important;
        border-color: #d4d0c8 !important;
      }

      button svg, button mat-icon, [role="button"] svg {
        color: inherit !important;
      }

      /* v2.9: المحددات الدقيقة — لوحات القوائم والبطاقات وحقل الإدخال وشعار الحبة */
      mat-card, .mat-mdc-card,
      [class*="lm-menu-theme"], .mat-mdc-menu-panel,
      .mat-mdc-menu-content, mat-menu,
      input-area-v2, .initial-input-area-container,
      input-container, logo-pill-label-container,
      [data-test-id="logo-pill-label-container"],
      .mat-mdc-card.lm-menu-theme,
      input-area-switch-label {
        background-color: #fdfcfa !important;
        color: #2a2d31 !important;
      }

      /* v2.9: إلغاء التدرّج الداكن فوق حقل الإدخال */
      .input-gradient,
      input-container.input-gradient,
      [class*="input-gradient"] {
        background: transparent !important;
        background-image: none !important;
      }

      /* v2.9: إلغاء التدرجات لأعلى/أسفل الصفحة */
      .top-gradient, .bottom-gradient,
      .top-gradient-container, .bottom-gradient-container {
        background: transparent !important;
        background-image: none !important;
      }

      /* v2.9: زر الميكروفون — خلفية شفافة وأيقونة بلون النص */
      .speech_dictation_mic_button, [class*="speech_dictation"],
      gem-icon-button.speech_dictation_mic_button button {
        background-color: transparent !important;
        color: #4a4d52 !important;
      }

      /* v2.9: أيقونات Material */
      mat-icon, .mat-icon, gem-icon {
        color: #4a4d52 !important;
      }

      /* v2.9: الشريط الجانبي بلون الخلفية نفسها */
      bard-sidenav, .overflow-container,
      mat-nav-list, gem-nav-list-item,
      mat-mdc-nav-list, .gds-sidenav-list {
        background-color: #f5f3ef !important;
        color: #2a2d31 !important;
      }

      /* v2.9: عناصر القائمة عند hover */
      .mat-mdc-menu-item:hover, .lm-menu-item-theme:hover,
      .mdc-list-item:hover, gem-nav-list-item:hover {
        background-color: rgba(0,0,0,0.06) !important;
      }

      /* v2.9: الفواصل */
      mat-divider, .mat-divider, .divider {
        border-color: #e0dcd4 !important;
      }

      /* v4.1: متغيرات DeepSeek (--dsw-alias-*) — فاتح دافئ.
         تُوضع على :root وhtml وbody و.dark و.light معاً لضمان التغطية
         أينما عرّفها الموقع محلياً (نفس أسلوب --gem-sys-color-- الناجح).
         على المواقع الأخرى لا أحد يستهلك هذه الأسماء فتبقى خاملة تماماً. */
      :root, html, body, .dark, .light {
        --dsw-alias-bg-base: #f5f3ef !important;
        --dsw-alias-bg-primary: #f5f3ef !important;
        --dsw-alias-bg-secondary: #fdfcfa !important;
        --dsw-alias-bg-tertiary: #efebe4 !important;
        --dsw-alias-bg-elevated: #fdfcfa !important;
        --dsw-alias-bg-surface: #fdfcfa !important;
        --dsw-alias-bg-surface-container: #efebe4 !important;
        --dsw-alias-fg-base: #2a2d31 !important;
        --dsw-alias-fg-primary: #2a2d31 !important;
        --dsw-alias-fg-secondary: #4a4d52 !important;
        --dsw-alias-fg-tertiary: #6b7078 !important;
        --dsw-alias-text-primary: #2a2d31 !important;
        --dsw-alias-text-secondary: #4a4d52 !important;
        --dsw-alias-text-tertiary: #6b7078 !important;
        --dsw-alias-border-base: #d4d0c8 !important;
        --dsw-alias-border-primary: #d4d0c8 !important;
        --dsw-alias-border-secondary: #e0dcd4 !important;
        --dsw-alias-brand-primary: #4a7ba7 !important;
      }
    `;
    } else if (mode === 'comfort-dark') {
        html.style.setProperty('color-scheme', 'dark', 'important');
        if (body) body.style.setProperty('color-scheme', 'dark', 'important');
        el.textContent = `
      :root, html, body, chat-app, chat-window,
      bard-sidenav, input-container, input-area-v2,
      .user-query-bubble-with-background {
        --gem-sys-color--surface: #1e2126 !important;
        --gem-sys-color--surface-bright: #26292f !important;
        --gem-sys-color--surface-container: #23272c !important;
        --gem-sys-color--surface-container-low: #1e2126 !important;
        --gem-sys-color--surface-container-high: #2a2e34 !important;
        --gem-sys-color--surface-container-highest: #33373d !important;
        --gem-sys-color--surface-container-lowest: #1a1d21 !important;
        --gem-sys-color--surface-dim: #1e2126 !important;
        --gem-sys-color--on-surface: #ddd9d3 !important;
        --gem-sys-color--on-surface-variant: #b8b4ae !important;
        --gem-sys-color--outline: #6a6d72 !important;
        --gem-sys-color--outline-variant: #3a3d42 !important;
        --gem-sys-color--outline-low: #2a2d32 !important;
        --bard-color-footer-background: #1e2126 !important;
        --bard-color-draft-chip-background: #2a2e34 !important;
        --bard-color-sidenav-background-desktop: #1e2126 !important;
        --bard-color-sidenav-background-mobile: #1e2126 !important;
        --bard-color-onhover-conversation-metadata-button-v2: #2a2e34 !important;
        --bard-color-new-conversation-button: #2a2e34 !important;
        --bard-color-on-new-conversation-button: #ddd9d3 !important;
        --mat-app-background-color: #1e2126 !important;
        --mat-app-text-color: #ddd9d3 !important;
        --mat-sidenav-container-background-color: #1e2126 !important;
        --mat-sidenav-content-background-color: #1e2126 !important;
        --mat-sidenav-content-text-color: #ddd9d3 !important;
        --mat-sidenav-container-text-color: #b8b4ae !important;
        --bard-color-synthetic--chat-window-surface: #1e2126 !important;
        --bard-color-synthetic--mat-card-background: #23272c !important;

        /* v2.9: نظام lumi المتوازي — القوائم وحقل الإدخال والشريط الجانبي والأزرار */
        --lumi-sys-color--surface: #1e2126 !important;
        --lumi-sys-color--surface-bright: #26292f !important;
        --lumi-sys-color--surface-dim: #1a1d21 !important;
        --lumi-sys-color--surface-background: #1e2126 !important;
        --lumi-sys-color--on-surface: #ddd9d3 !important;
        --lumi-sys-color--on-surface-variant: rgba(221, 217, 211, 0.65) !important;
        --lumi-sys-color--on-surface-low: rgba(221, 217, 211, 0.38) !important;
        --lumi-sys-color-states--hover-on-surface: rgba(255, 255, 255, 0.08) !important;
        --lumi-sys-color-states--focus-on-surface: rgba(255, 255, 255, 0.12) !important;
        --lumi-sys-color-states--pressed-on-surface: rgba(255, 255, 255, 0.14) !important;
        --lumi-sys-color--surface-accent: #2a3038 !important;
        --lumi-sys-color--black: #ddd9d3 !important;
        --lumi-sys-color--white: #1e2126 !important;

        /* v2.9: رموز Material Design للقوائم والحوارات والقوائم-list */
        --mat-menu-container-color: #26292f !important;
        --mat-menu-item-label-text-color: #ddd9d3 !important;
        --mat-menu-item-icon-color: #b8b4ae !important;
        --mat-menu-item-hover-state-layer-color: rgba(255,255,255,0.06) !important;
        --mat-dialog-container-color: #26292f !important;
        --mat-dialog-subhead-color: #ddd9d3 !important;
        --mat-dialog-supporting-text-color: #b8b4ae !important;
        --mat-list-list-item-label-text-color: #ddd9d3 !important;
        --mat-list-list-item-hover-state-layer-color: rgba(255,255,255,0.06) !important;
        --mat-list-list-item-leading-icon-color: #b8b4ae !important;
        --mat-divider-color: #3a3d42 !important;
      }

      html, body, chat-app, chat-window,
      bard-sidenav, input-container, input-area-v2 {
        background-color: #1e2126 !important;
        color: #ddd9d3 !important;
      }

      .user-query-bubble-with-background {
        background-color: #2a3038 !important;
        color: #ddd9d3 !important;
      }

      input-area-v2, .initial-input-area-container {
        background-color: #26292f !important;
        border-color: #3a3d42 !important;
      }

      button svg, button mat-icon, [role="button"] svg {
        color: inherit !important;
      }

      /* v2.9: المحددات الدقيقة — لوحات القوائم والبطاقات وحقل الإدخال وشعار الحبة */
      mat-card, .mat-mdc-card, [class*="lm-menu-theme"],
      .mat-mdc-menu-panel, .mat-mdc-menu-content, mat-menu,
      input-area-v2, .initial-input-area-container,
      input-container, logo-pill-label-container,
      [data-test-id="logo-pill-label-container"],
      .mat-mdc-card.lm-menu-theme, input-area-switch-label {
        background-color: #26292f !important;
        color: #ddd9d3 !important;
      }

      /* v2.9: إلغاء التدرّج الداكن فوق حقل الإدخال */
      .input-gradient, input-container.input-gradient,
      [class*="input-gradient"] {
        background: transparent !important;
        background-image: none !important;
      }

      /* v2.9: إلغاء التدرجات لأعلى/أسفل الصفحة */
      .top-gradient, .bottom-gradient,
      .top-gradient-container, .bottom-gradient-container {
        background: transparent !important;
        background-image: none !important;
      }

      /* v2.9: زر الميكروفون — خلفية شفافة وأيقونة بلون النص */
      .speech_dictation_mic_button, [class*="speech_dictation"] {
        background-color: transparent !important;
        color: #b8b4ae !important;
      }

      /* v2.9: أيقونات Material */
      mat-icon, .mat-icon, gem-icon {
        color: #b8b4ae !important;
      }

      /* v2.9: الشريط الجانبي بلون الخلفية نفسها */
      bard-sidenav, .overflow-container, mat-nav-list,
      gem-nav-list-item, mat-mdc-nav-list, .gds-sidenav-list {
        background-color: #1e2126 !important;
        color: #ddd9d3 !important;
      }

      /* v2.9: عناصر القائمة عند hover */
      .mat-mdc-menu-item:hover, .lm-menu-item-theme:hover,
      .mdc-list-item:hover, gem-nav-list-item:hover {
        background-color: rgba(255,255,255,0.06) !important;
      }

      /* v2.9: الفواصل */
      mat-divider, .mat-divider, .divider {
        border-color: #3a3d42 !important;
      }

      /* v4.1: متغيرات DeepSeek (--dsw-alias-*) — داكن مريح
         (نفس آلية الفاتح الدافئ أعلاه) */
      :root, html, body, .dark, .light {
        --dsw-alias-bg-base: #1e2126 !important;
        --dsw-alias-bg-primary: #1e2126 !important;
        --dsw-alias-bg-secondary: #26292f !important;
        --dsw-alias-bg-tertiary: #2a2e34 !important;
        --dsw-alias-bg-elevated: #26292f !important;
        --dsw-alias-bg-surface: #26292f !important;
        --dsw-alias-bg-surface-container: #2a2e34 !important;
        --dsw-alias-fg-base: #ddd9d3 !important;
        --dsw-alias-fg-primary: #ddd9d3 !important;
        --dsw-alias-fg-secondary: #b8b4ae !important;
        --dsw-alias-fg-tertiary: #878b93 !important;
        --dsw-alias-text-primary: #ddd9d3 !important;
        --dsw-alias-text-secondary: #b8b4ae !important;
        --dsw-alias-text-tertiary: #878b93 !important;
        --dsw-alias-border-base: #3a3d42 !important;
        --dsw-alias-border-primary: #3a3d42 !important;
        --dsw-alias-border-secondary: #2a2d32 !important;
        --dsw-alias-brand-primary: #86a8c9 !important;
      }
    `;
    }

    // v4.1: طبقة المحددات الاحتياطية — على DeepSeek فقط (انظر تعليق
    // DSW_FALLBACK_LIGHT أعلاه). المتغيرات عمّت كل المواقع بالفعل، أما
    // header/hr/[class*="dropdown"] فتبقى حصراً على deepseek.com
    // حمايةً لـ Gemini/Z.ai (قائمة «لا تلمس»). color-scheme مضبوط
    // أعلاه منذ v2.8 بنفس منطق المواصفة (light/dark مع important
    // على html/body، والمسح في default).
    // v4.8: Z.ai صار له طبقتاه الخاصتان ZAI_FALLBACK_LIGHT/DARK —
    // بنفس الآلية والبوابة (z.ai حصراً) وبنفس الاستثناء لبقية المواقع.
    const isZaiHost = /(^|\.)z\.ai$/i.test(window.location.hostname);
    if (isZaiHost) {
        el.textContent += (mode === 'warm-light') ? ZAI_FALLBACK_LIGHT : ZAI_FALLBACK_DARK;
    } else if (/deepseek\.com$/i.test(window.location.hostname)) {
        el.textContent += (mode === 'warm-light') ? DSW_FALLBACK_LIGHT : DSW_FALLBACK_DARK;
    }

    // المحرك الاحتياطي لمواقع بلا مهايئ (Qwen وغيرها) — كما في v2.7:
    // قواعد عامة تحفظ تمظهرها (خلفيات الحاويات + ألوان النص + حماية الأزرار والوسائط).
    // تُدرَج قبل قواعد v2.8 أعلاه حتى تبقى قواعد Gemini الأحدث أقوى عند تطابق التحديد.
    // v4.8 (تنظيف القسم 6 من مواصفة Z.ai): أُخرجت Z.ai من هذا المحرك نهائياً —
    // قواعده العامة (div[class*="chat"] وcolor على كل النصوص وreset
    // الأزرار/الحقول) كانت تتعارض مع طبقة Z.ai الدقيقة أعلاه، والموقع
    // صار له طبقة مخصصة كاملة بدلاً منها. DeepSeek/Qwen على حالها.
    if (!getAdapter() && !isZaiHost) {
        const key = mode === 'warm-light' ? 'light' : 'dark';
        el.textContent = `
        [role="main"], main, #main,
        div[class*="chat"], div[class*="conversation"],
        div[class*="thread"], div[class*="messages"],
        bard-sidenav-container, chat-window, chat-app,
        [class*="sidenav"], [class*="main-content"],
        [class*="input-area"], [class*="input-container"],
        [class*="background"], [class*="surface"] {
            background-color: ${DEFAULT_GEM_DIRECT[key].bg} !important;
        }
        body, p, div, span, a, li, h1, h2, h3, h4, h5, h6 {
            color: ${DEFAULT_GEM_DIRECT[key].fg} !important;
        }
        /* لا نلمس الأزرار والأيقونات والوسائط وشريط الإدخال */
        button, [role="button"], svg, img, video, input, textarea {
            color: initial !important;
            background-color: initial !important;
        }` + el.textContent;
    }
}

/**
 * لوحة المتغيرات المرجعية (نسخة Gemini نفسها من content/adapters/gemini.js)
 * v2.8: كود الخلفية يضع المتغيرات مباشرة داخل CSS (استهداف العناصر الخاملة) —
 * تبقى هذه اللوحة مرجعاً موثقاً للقيم، وDEFAULT_GEM_DIRECT يستهلكها المحرك
 * الاحتياطي لمواقع بلا مهايئ (DeepSeek/Qwen/Z.ai).
 */
const DEFAULT_GEM_VARIABLES = {
    '--gem-sys-color--surface':                  { light: '#f5f3ef', dark: '#1e2126' },
    '--gem-sys-color--surface-bright':           { light: '#fdfcfa', dark: '#26292f' },
    '--gem-sys-color--surface-container':        { light: '#efebe4', dark: '#23272c' },
    '--gem-sys-color--surface-container-low':    { light: '#f5f3ef', dark: '#1e2126' },
    '--gem-sys-color--surface-container-high':   { light: '#e9e5dd', dark: '#2a2e34' },
    '--gem-sys-color--surface-container-highest':{ light: '#e3ddd4', dark: '#33373d' },
    '--gem-sys-color--surface-container-lowest': { light: '#fdfcfa', dark: '#1a1d21' },
    '--gem-sys-color--surface-dim':              { light: '#ede9e1', dark: '#1e2126' },
    '--gem-sys-color--on-surface':               { light: '#2a2d31', dark: '#ddd9d3' },
    '--gem-sys-color--on-surface-variant':       { light: '#4a4d52', dark: '#b8b4ae' },
    '--gem-sys-color--on-surface-low':           { light: '#6b7078' },
    '--gem-sys-color--outline':                  { light: '#b8b4ad', dark: '#6a6d72' },
    '--gem-sys-color--outline-variant':          { light: '#d4d0c8', dark: '#3a3d42' },
    '--gem-sys-color--outline-low':              { light: '#e0dcd4', dark: '#2a2d32' },
    '--mat-app-background-color':                { light: '#f5f3ef', dark: '#1e2126' },
    '--mat-app-text-color':                      { light: '#2a2d31', dark: '#ddd9d3' },
    '--bard-color-synthetic--chat-window-surface': { light: '#f5f3ef', dark: '#1e2126' },
    '--bard-color-synthetic--mat-card-background': { light: '#efebe4', dark: '#23272c' }
};

const DEFAULT_GEM_DIRECT = {
    light: { bg: '#f5f3ef', fg: '#2a2d31' },
    dark:  { bg: '#1e2126', fg: '#ddd9d3' }
};

/**
 * محددات العرض الافتراضية (نسخة Gemini نفسها) — لمواقع بلا مهايئ بعد
 */
const DEFAULT_WIDTH_SELECTORS = {
    unlockText: [
        '.md-content > *:not(#_)',
        '.md-content > *',
        '.md-content p',
        '.md-content h1', '.md-content h2', '.md-content h3',
        '.md-content ul', '.md-content ol'
    ],
    scroller: [
        'infinite-scroller',
        'infinite-scroller.chat-history',
        '[class*="infinite-scroller"]'
    ],
    containers: [
        'message-content',
        'structured-content-container',
        'model-response-content',
        'response-container',
        'model-response',
        '.container',
        '.response-content',
        '.response-container-content',
        '.presented-response-container'
    ],
    inputBar: ['.initial-input-area-container'],
    inputProtection: [
        '.initial-input-area button',
        '.initial-input-area textarea',
        '.initial-input-area input'
    ]
};

/**
 * تطبيق عرض الردود: أزرار مريح/متوسط/عريض + عرض مخصص من الشريط (v2.7)
 * comfort (بلا widthCustom) أو widthCustom=760 → مسح كامل (أصل Gemini)،
 * widthCustom إن وُجد يغلب الأزرار (الشريط = تحكم دقيق 760→1600px)،
 * وباقي القواعد كما هي في v2.5 مع margin-inline: auto (توسيط إلزامي).
 * @param {string} mode - comfort / medium / wide
 * @param {number} [customWidth] - العرض المخصص بالبكسل من الشريط
 */
function applyWidth(mode, customWidth) {
    let el = document.getElementById('custom-width-extension');
    if (!el) {
        el = document.createElement('style');
        el.id = 'custom-width-extension';
        document.head.appendChild(el);
    }
    const isDefault = mode === 'comfort' && !customWidth;
    const isCustomDefault = customWidth === 760;
    if (isDefault || isCustomDefault) {
        el.textContent = '';
        return;
    }
    let newWidth;
    if (customWidth) newWidth = customWidth + 'px';
    else if (mode === 'wide') newWidth = '1400px';
    else if (mode === 'medium') newWidth = '1000px';
    else newWidth = '760px';

    const adapter = getAdapter();
    const sel = (adapter && adapter.widthSelectors) || DEFAULT_WIDTH_SELECTORS;
    el.textContent = `
        /* 1) فك قيد الفقرة 708px — هذا هو المفتاح الأساسي */
        ${sel.unlockText.join(',\n        ')} {
            max-width: 100% !important;
            margin-inline: 0 !important;
        }

        /* 2) توسيع حاوية الردود + توسيط إلزامي */
        ${sel.scroller.join(',\n        ')} {
            max-width: ${newWidth} !important;
            width: 100% !important;
            margin-inline: auto !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }

        /* 3) توسيع الحاويات الوسيطة + توسيط */
        ${sel.containers.join(',\n        ')} {
            max-width: ${newWidth} !important;
            width: 100% !important;
            margin-inline: auto !important;
        }

        /* 4) شريط الإدخال متوافق + مركزي */
        ${sel.inputBar.join(',\n        ')} {
            max-width: ${newWidth} !important;
            margin-inline: auto !important;
        }

        /* 5) حماية عناصر الإدخال من التمدد */
        ${sel.inputProtection.join(',\n        ')} {
            max-width: none !important;
            width: auto !important;
        }
    `;
}

/**
 * إخفاء نص التذييل السفلي في Gemini
 * ملاحظة: النص يُولَّد ديناميكياً ويُحقن بـ JavaScript،
 * لذلك المحددات هنا احتمالية — إن لم تطابق نضيف اسم class الفعلي لاحقاً.
 * v2.2
 * @param {boolean} on
 */
function applyFooterHide(on) {
    let el = document.getElementById('custom-footer-extension');
    if (!el) {
        el = document.createElement('style');
        el.id = 'custom-footer-extension';
        document.head.appendChild(el);
    }
    el.textContent = on ? `
        [class*="disclaimer"],
        [class*="hallucination"],
        [class*="footer-note"],
        [class*="legal-text"] {
            display: none !important;
        }
    ` : '';
}

/**
 * إزالة أنماط الخط المخصصة من الصفحة
 */
function removeCustomStyles() {
    const styleElement = document.getElementById('custom-font-style-extension');
    if (styleElement) {
        styleElement.remove();
    }
}

/**
 * v3.1: اختيار مهايئ الإملاء الصوتي حسب hostname
 * (نظام مستقل عن FC_ADAPTERS — النطاق: DeepSeek + Z.ai منذ v3.3، لاحقاً qwen)
 * @returns {object|null} مهايئ الصوت أو null إن لا مهايئ لهذا الموقع
 */
function getVoiceAdapter() {
    const adapters = window.__AIR_VOICE_ADAPTERS__ || {};
    const host = window.location.hostname;
    if (host.includes('deepseek.com')) return adapters.deepseek || null;
    if (host.includes('z.ai')) return adapters.zai || null;
    return null; // لاحقاً: qwen
}

/**
 * v3.1: تطبيق إعدادات الإملاء الصوتي على الصفحة الحالية
 * عند التفعيل: إنشاء الزر عبر مهايئ الموقع (إن لم يكن موجوداً) + ضبط اللغة
 * والنسخ التلقائي — دون إيقاف أي تسجيل جارٍ (setLanguage/setAutoCopy فقط).
 * عند الإيقاف: إزالة الزر (وإيقاف التسجيل إن كان جارياً).
 * @param {object} settings - إعدادات الموقع (voiceEnabled/voiceLanguage/voiceAutoCopy)
 */
function applyVoiceSettings(settings) {
    if (!window.__AIR_VOICE__) return;
    if (settings && settings.voiceEnabled) {
        if (!document.getElementById('air-voice-btn')) {
            const adapter = getVoiceAdapter();
            if (adapter) window.__AIR_VOICE__.createButton(adapter);
        }
        window.__AIR_VOICE__.setLanguage(settings.voiceLanguage || 'ar-SA');
        window.__AIR_VOICE__.setAutoCopy(settings.voiceAutoCopy !== false);
    } else {
        window.__AIR_VOICE__.removeButton();
    }
}

/**
 * v4.0: ربط الميزات الإضافية حسب الإعدادات:
 * - الاتجاه التلقائي (autoBidi) → __AIR_BIDI__.enable/disable
 * (v4.7: حُذف شريط التقدم __AIR_PROGRESS__ وتمييز الجملة __AIR_HIGHLIGHT__ نهائياً)
 * (v5.0: حُذف مؤقت الجلسة __AIR_TIMER__ نهائياً)
 * كل ميزة تُتحقق من وجود واجهتها العامة أولاً (الملفات تُحمَّل قبل content.js
 * في manifest، لكن الفحص يحمي من أي ترتيب مستقبلي).
 * @param {object} settings - إعدادات الموقع المدمجة
 */
function applyExtraFeatures(settings) {
    // Auto-Bidi — lazy-init: الملف يُحمّل بلا أي عمل، والتشغيل هنا فقط
    // إذا كان المفتاح مفعّلاً (الإيقاف ينظف style والمراقب)
    if (window.__AIR_BIDI__) {
        settings.autoBidi ? window.__AIR_BIDI__.enable() : window.__AIR_BIDI__.disable();
    }
}

/**
 * الاستماع لرسائل النافذة المنبثقة
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // v3.1: ضبط لغة الإملاء (لا يوقف أي تسجيل جارٍ)
    if (request.action === 'setVoiceLanguage' && window.__AIR_VOICE__) {
        window.__AIR_VOICE__.setLanguage(request.voiceLanguage);
        sendResponse({ status: 'ok' });
        return true;
    }

    // v3.1: تشغيل/إيقاف النسخ التلقائي للحافظة
    if (request.action === 'setVoiceAutoCopy' && window.__AIR_VOICE__) {
        window.__AIR_VOICE__.setAutoCopy(request.voiceAutoCopy);
        sendResponse({ status: 'ok' });
        return true;
    }

    if (request.action === 'changeFont') {
        applyFontStyles(
            request.fontSize,
            request.fontFamily,
            request.lineHeight ?? 1.75,
            request.fontImportUrl
        );
        applyBackground(request.bgMode ?? 'default');
        applyWidth(request.widthMode ?? 'comfort', request.widthCustom);
        applyFooterHide(request.hideFooter === true);
        // v3.1: تفعيل/إيقاف الإملاء + ضبط اللغة والنسخ حسب الإعدادات المرسلة
        applyVoiceSettings(request);
        // v4.0: ربط الميزات الإضافية حسب الإعدادات المرسلة
        applyExtraFeatures(request);
    } else if (request.action === 'resetFont') {
        removeCustomStyles();
        applyBackground('default');
        applyWidth('comfort');
        applyFooterHide(false);
        // v3.1: إعادة الضبط تزيل زر الإملاء
        applyVoiceSettings({});
        // v4.0: إعادة الميزات الإضافية للافتراضيات (autoBidi=true في الـ schema،
        // المؤقت موقف) — نفس ما يحدث عند إعادة تحميل الصفحة بعد الحذف
        applyExtraFeatures(Object.assign({}, self.AIR_SETTINGS_SCHEMA || {}));
    }
    sendResponse({ status: 'success' });
    return true;
});

/**
 * تطبيق الإعدادات المحفوظة للموقع الحالي فقط
 * ملاحظة: نتجاهل fontImportUrl القديمة عمداً — الخطوط مضمّنة في fonts.css
 *
 * v3.2: القراءة عبر AIR_STORAGE.loadSite (ترحيل لمرة واحدة + دمج افتراضيات
 * الـ schema):
 * - إعدادات المظهر (خط/خلفية/عرض/تذييل) تُطبَّق فقط إن وُجدت إعدادات محفوظة
 *   للموقع — السلوك القائم بلا تغيير (لا نعبث بمظهر مواقع بلا إعدادات).
 * - الإملاء الصوتي يُطبَّق دائماً من الإعدادات المدمجة — افتراضياً مفعّل حتى
 *   في المواقع بلا إعدادات محفوظة (voiceEnabled: true في الـ schema).
 */
function applySavedSettingsForSite() {
    const hostname = window.location.hostname;
    if (!self.AIR_STORAGE || !self.AIR_STORAGE.loadSite) {
        console.warn('[AIR] AIR_STORAGE غير متاح — تحقق من ترتيب الحقن في manifest');
        return;
    }
    self.AIR_STORAGE.loadSite(hostname).then(({ exists, settings }) => {
        if (exists) {
            applyFontStyles(
                settings.fontSize,
                settings.fontFamily,
                settings.lineHeight ?? 1.75
            );
            applyBackground(settings.bgMode ?? 'default');
            applyWidth(settings.widthMode ?? 'comfort', settings.widthCustom);
            applyFooterHide(settings.hideFooter === true);
        }
        // v3.2: الإملاء الصوتي يُطبَّق دائماً حسب الإعدادات المدمجة
        applyVoiceSettings(settings);
        // v4.0: الميزات الإضافية تُطبَّق دائماً حسب الإعدادات المدمجة
        // (autoBidi=true افتراضياً حتى في المواقع بلا إعدادات محفوظة)
        applyExtraFeatures(settings);
    }).catch(err => console.warn('[AIR] loadSite failed:', err));
}

// تطبيق الإعدادات المحفوظة فور حقن السكربت
applySavedSettingsForSite();

// ─── v3.2: المراقب الدوري للزر الصوتي (تطبيقات SPA) ───
// DeepSeek وGemini وQwen وZ.ai تطبيقات SPA: التنقل بين المحادثات لا يعيد
// تحميل الصفحة، فتُعاد تصيير منطقة الإدخال ويختفي الزر. المراقب يعيد إدراجه
// خلال ≤2 ثانية، وفوراً عند العودة للتبويب وبعد تنقلات history.
let voiceWatcher = null;
let lastVoiceCheck = 0;

function startVoiceWatcher() {
    if (voiceWatcher) return;

    // فحص فوري
    ensureVoiceButton();

    // فحص دوري كل 2 ثانية (معدل معقول جداً)
    voiceWatcher = setInterval(() => {
        // تجاهل إذا كان التبويب مخفياً
        if (document.hidden) return;

        // تجاهل إذا كان آخر فحص قريب جداً
        const now = Date.now();
        if (now - lastVoiceCheck < 1500) return;
        lastVoiceCheck = now;

        ensureVoiceButton();
    }, 2000);
}

function stopVoiceWatcher() {
    if (voiceWatcher) {
        clearInterval(voiceWatcher);
        voiceWatcher = null;
    }
}

function ensureVoiceButton() {
    if (!window.__AIR_VOICE__) return;
    if (!self.AIR_STORAGE) return;

    // القراءة عبر الطبقة الموحّدة: ترحيل (عند اللزوم) + دمج الافتراضيات
    // — الموقع بلا إعدادات محفوظة يعطي voiceEnabled=true (الافتراضي الجديد)
    self.AIR_STORAGE.loadSite(location.hostname).then(({ settings }) => {
        // هل الميزة مفعّلة؟ (الإيقاف الصريح المحفوظ يُحترم)
        if (!settings || !settings.voiceEnabled) {
            window.__AIR_VOICE__.removeButton();
            return;
        }

        // هل الزر موجود؟
        if (document.getElementById('air-voice-btn')) return; // الموجود سليم، لا تعيد الإضافة

        // الزر مفقود — أعد إضافته (v3.3: اختيار المهايئ inline حسب الموقع)
        const host = location.hostname;
        let adapter = null;
        if (host.includes('deepseek.com')) adapter = window.__AIR_VOICE_ADAPTERS__?.deepseek;
        if (host.includes('z.ai')) adapter = window.__AIR_VOICE_ADAPTERS__?.zai;
        if (adapter && adapter.buttonContainer && adapter.buttonContainer()) {
            window.__AIR_VOICE__.createButton(adapter);
            window.__AIR_VOICE__.setLanguage(settings.voiceLanguage || 'ar-SA');
            window.__AIR_VOICE__.setAutoCopy(settings.voiceAutoCopy !== false);
            console.log('[AIR Voice] Button re-inserted after SPA navigation');
        }
    }).catch(() => {});
}

// ابدأ المراقب بعد التحميل
startVoiceWatcher();

// عند العودة للتبويب: فحص فوري (الإخفاء لا يوقف المراقب —
// دورة التكرار تتخطى الفحص فقط طالما التبويب مخفي، توفيراً للموارد)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        ensureVoiceButton();
    }
});

// الاستماع لتنقلات SPA
const _pushState = history.pushState;
history.pushState = function (...args) {
    _pushState.apply(this, args);
    setTimeout(ensureVoiceButton, 300);
};
const _replaceState = history.replaceState;
history.replaceState = function (...args) {
    _replaceState.apply(this, args);
    setTimeout(ensureVoiceButton, 300);
};
window.addEventListener('popstate', () => setTimeout(ensureVoiceButton, 300));
window.addEventListener('hashchange', () => setTimeout(ensureVoiceButton, 300));
