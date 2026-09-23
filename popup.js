/**
 * صفاء v5.0 — popup.js
 * عربي فقط: أربعة خطوط مضمّنة في fonts.css + حجم الخط + ارتفاع السطر + خلفية الواجهة
 * + عرض الردود (أزرار سريعة + شريط ضبط دقيق) + إخفاء التذييل
 * + الإملاء الصوتي (تفعيل/لغة/نسخ تلقائي — v3.1).
 * + الأدوات الإضافية: الاتجاه التلقائي.
 *   (v4.7: حُذف شريط تقدم القراءة وتمييز الجملة نهائياً من الواجهة والإعدادات)
 *   (v5.0: حُذف مؤقت الجلسة نهائياً من الواجهة والإعدادات)
 * كل الإعدادات تُحفظ لكل موقع (hostname) في chrome.storage.sync.
 * v3.2: الافتراضيات من lib/settings-schema.js (voiceEnabled=true) + ترحيل
 * التثبيتات القديمة عند الفتح عبر lib/storage.js.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- عناصر الواجهة ---
    const elements = {
        fontSize: document.getElementById('fontSize'),
        fontSizeValue: document.getElementById('fontSizeValue'),
        lineHeight: document.getElementById('lineHeight'),
        lineHeightValue: document.getElementById('lineHeightValue'),
        fontFamily: document.getElementById('fontFamily'),
        widthSlider: document.getElementById('widthSlider'),
        widthValue: document.getElementById('widthValue'),
        hideFooter: document.getElementById('hideFooter'),
        tgVoice: document.getElementById('tg-voice'),
        voiceOptions: document.getElementById('voice-options'),
        voiceLanguage: document.getElementById('voice-language'),
        tgVoiceCopy: document.getElementById('tg-voice-copy'),
        // v4.0: الأدوات الإضافية (v5.0: bidi فقط — حُذف المؤقت نهائياً)
        tgBidi: document.getElementById('tg-bidi'),
        resetButton: document.getElementById('resetButton'),
        sitesList: document.getElementById('sitesList')
    };

    // الخطوط الأربعة المضمّنة في fonts.css (لا حاجة لأي @import أو Google Fonts)
    const fonts = [
        { name: 'Readex Pro' },
        { name: 'IBM Plex Sans Arabic' },
        { name: 'Tajawal' },
        { name: 'Cairo' }
    ];

    // v3.2: المصدر الوحيد للافتراضيات lib/settings-schema.js (voiceEnabled=true)
    const DEFAULTS = window.AIR_SETTINGS_SCHEMA;

    // v2.7: قيم الأزرار السريعة — النقر على زر يضبط الشريط على قيمته
    const WIDTH_PRESETS = { comfort: 760, medium: 1000, wide: 1400 };

    // حالة العرض الحالية (الزر النشط + الشريط) — المصدر الوحيد للحقيقة
    let widthState = { mode: DEFAULTS.widthMode, custom: DEFAULTS.widthCustom };

    let currentHostname;

    // --- الدوال الرئيسية ---

    /**
     * تعبئة قائمة الخطوط (عربي فقط — بدون مبدّل لغة)
     */
    function populateFontOptions() {
        elements.fontFamily.innerHTML = '';
        fonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font.name;
            option.textContent = font.name;
            elements.fontFamily.appendChild(option);
        });
    }

    /**
     * الحصول على الموقع الحالي وتهيئة الواجهة
     */
    async function initialize() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;
        currentHostname = new URL(tab.url).hostname;

        // v3.2: ترحيل لمرة واحدة — تثبيتات ما قبل v3.2 تحمل voiceEnabled:false
        // محفوظةً صراحةً؛ يُقلبها إلى true مرة واحدة (راجع lib/storage.js)
        if (self.AIR_STORAGE) {
            try { await self.AIR_STORAGE.migrate(); } catch (e) { console.warn('[AIR] migrate:', e); }
        }

        populateFontOptions();
        loadSettingsForCurrentSite();
        renderSitesList();
        addEventListeners();
    }

    /**
     * تحميل إعدادات الموقع الحالي وعرضها في الواجهة
     */
    async function loadSettingsForCurrentSite() {
        const data = await chrome.storage.sync.get('fontSettings');
        const siteSettings = (data.fontSettings || {})[currentHostname];

        const fontSize = siteSettings?.fontSize ?? DEFAULTS.fontSize;
        const lineHeight = siteSettings?.lineHeight ?? DEFAULTS.lineHeight;
        const bgMode = siteSettings?.bgMode ?? DEFAULTS.bgMode;
        widthState.mode = siteSettings?.widthMode ?? DEFAULTS.widthMode;
        widthState.custom = Number(siteSettings?.widthCustom ?? DEFAULTS.widthCustom);
        const hideFooter = siteSettings?.hideFooter ?? DEFAULTS.hideFooter;

        // v3.1: إعدادات الإملاء الصوتي
        const voiceEnabled = siteSettings?.voiceEnabled ?? DEFAULTS.voiceEnabled;
        const voiceLanguage = siteSettings?.voiceLanguage ?? DEFAULTS.voiceLanguage;
        const voiceAutoCopy = siteSettings?.voiceAutoCopy ?? DEFAULTS.voiceAutoCopy;

        // v4.0: الأدوات الإضافية (v4.7: حُذف readingProgress/sentenceHighlight،
        // v5.0: حُذف sessionTimer*)
        const autoBidi = siteSettings?.autoBidi ?? DEFAULTS.autoBidi;

        elements.fontSize.value = fontSize;
        elements.fontSizeValue.textContent = fontSize;
        elements.lineHeight.value = lineHeight;
        elements.lineHeightValue.textContent = Number(lineHeight).toFixed(2);

        if (siteSettings && Array.from(elements.fontFamily.options).some(opt => opt.value === siteSettings.fontFamily)) {
            elements.fontFamily.value = siteSettings.fontFamily;
        }
        setActiveBgButton(bgMode);
        syncWidthUI();
        elements.hideFooter.checked = hideFooter === true;

        // v3.1: مزامنة مفاتيح الإملاء والقائمة (القيمة فقط إن كانت ضمن الخيارات)
        elements.tgVoice.checked = voiceEnabled === true;
        elements.voiceOptions.hidden = !(voiceEnabled === true);
        if (Array.from(elements.voiceLanguage.options).some(opt => opt.value === voiceLanguage)) {
            elements.voiceLanguage.value = voiceLanguage;
        }
        elements.tgVoiceCopy.checked = voiceAutoCopy !== false;

        // v4.0: مزامنة مفاتيح الأدوات الإضافية
        elements.tgBidi.checked = autoBidi === true;
    }

    /**
     * مزامنة واجهة العرض مع widthState (v2.7):
     * قيمة الشريط + النص، والزر النشط فقط إذا كانت القيمة تطابق قيمة الزر بالضبط
     * (قيمة مخصصة بين القيم الجاهزة = بلا زر نشط)
     */
    function syncWidthUI() {
        elements.widthSlider.value = widthState.custom;
        elements.widthValue.textContent = widthState.custom + 'px';
        const preset = WIDTH_PRESETS[widthState.mode];
        setActiveWidthButton(preset === Number(widthState.custom) ? widthState.mode : null);
    }

    /**
     * تفعيل الزر المطابق لوضع الخلفية
     */
    function setActiveBgButton(mode) {
        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.bg === mode);
        });
    }

    /**
     * تفعيل الزر المطابق لوضع عرض الرد
     */
    function setActiveWidthButton(mode) {
        document.querySelectorAll('.width-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.width === mode);
        });
    }

    /**
     * جمع إعدادات الموقع من حالة الواجهة الحالية (v3.2)
     * يستخدمه الحفظ الكامل والمحفوظات الفورية (اللغة/النسخ) — فتنشأ إعدادات
     * الموقع من أول تغيير حتى لو لم يسبق أي حفظ كامل (كان v3.1 يتجاهل
     * تغيير اللغة/النسخ صامتاً على المواقع بلا إدخال محفوظ).
     */
    function collectUISettings() {
        return {
            fontSize: elements.fontSize.value,
            fontFamily: elements.fontFamily.value,
            lineHeight: parseFloat(elements.lineHeight.value),
            bgMode: document.querySelector('.bg-btn.active')?.dataset.bg || 'default',
            widthMode: widthState.mode,
            widthCustom: Number(widthState.custom),
            hideFooter: elements.hideFooter.checked,
            voiceEnabled: elements.tgVoice.checked,
            voiceLanguage: elements.voiceLanguage.value,
            voiceAutoCopy: elements.tgVoiceCopy.checked,
            // v4.0: الأدوات الإضافية (v5.0: bidi فقط)
            autoBidi: elements.tgBidi.checked
        };
    }

    /**
     * حفظ إعدادات الموقع الحالي في storage.sync وتطبيقها فوراً
     */
    async function saveAndApplyChanges() {
        const newSiteSettings = collectUISettings();

        const data = await chrome.storage.sync.get('fontSettings');
        const allSettings = data.fontSettings || {};
        allSettings[currentHostname] = newSiteSettings;
        await chrome.storage.sync.set({ fontSettings: allSettings });

        elements.fontSizeValue.textContent = newSiteSettings.fontSize;
        elements.lineHeightValue.textContent = newSiteSettings.lineHeight.toFixed(2);

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { action: 'changeFont', ...newSiteSettings });

        renderSitesList();
    }

    /**
     * إعادة ضبط إعدادات الموقع الحالي فقط
     */
    async function handleReset() {
        const data = await chrome.storage.sync.get('fontSettings');
        const allSettings = data.fontSettings || {};
        delete allSettings[currentHostname];
        await chrome.storage.sync.set({ fontSettings: allSettings });

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { action: 'resetFont' });

        // إعادة القيم الافتراضية في الواجهة
        elements.fontSize.value = DEFAULTS.fontSize;
        elements.fontSizeValue.textContent = DEFAULTS.fontSize;
        elements.lineHeight.value = DEFAULTS.lineHeight;
        elements.lineHeightValue.textContent = DEFAULTS.lineHeight.toFixed(2);
        elements.fontFamily.selectedIndex = 0;
        setActiveBgButton('default');
        widthState = { mode: DEFAULTS.widthMode, custom: DEFAULTS.widthCustom };
        syncWidthUI();
        elements.hideFooter.checked = DEFAULTS.hideFooter;

        // v3.2: إعادة الإملاء الصوتي للافتراضي (تفعيل + ar-SA + نسخ مفعّل)
        elements.tgVoice.checked = DEFAULTS.voiceEnabled;
        elements.voiceOptions.hidden = !DEFAULTS.voiceEnabled;
        elements.voiceLanguage.value = DEFAULTS.voiceLanguage;
        elements.tgVoiceCopy.checked = DEFAULTS.voiceAutoCopy;

        // v4.0: إعادة الأدوات الإضافية للافتراضي (bidi مفعّل)
        elements.tgBidi.checked = DEFAULTS.autoBidi;

        renderSitesList();
    }

    /**
     * عرض قائمة المواقع المخصصة مع زر حذف لكل موقع
     */
    async function renderSitesList() {
        const data = await chrome.storage.sync.get('fontSettings');
        const allSettings = data.fontSettings || {};
        elements.sitesList.innerHTML = '';

        for (const hostname of Object.keys(allSettings)) {
            const li = document.createElement('li');
            const siteName = document.createElement('span');
            siteName.textContent = hostname;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'حذف';
            deleteBtn.dataset.hostname = hostname;
            deleteBtn.onclick = async (e) => {
                const hostToDelete = e.target.dataset.hostname;
                if (confirm(`هل تريد حذف إعدادات ${hostToDelete}؟`)) {
                    const data = await chrome.storage.sync.get('fontSettings');
                    const allSettings = data.fontSettings || {};
                    delete allSettings[hostToDelete];
                    await chrome.storage.sync.set({ fontSettings: allSettings });

                    if (hostToDelete === currentHostname) {
                        handleReset();
                    } else {
                        renderSitesList();
                    }
                }
            };

            li.appendChild(siteName);
            li.appendChild(deleteBtn);
            elements.sitesList.appendChild(li);
        }
    }

    /**
     * ربط الأحداث: كل تغيير يُحفظ ويُطبَّق فوراً
     */
    function addEventListeners() {
        elements.fontSize.oninput = saveAndApplyChanges;
        elements.lineHeight.oninput = saveAndApplyChanges;
        elements.fontFamily.onchange = saveAndApplyChanges;
        elements.resetButton.onclick = handleReset;

        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.onclick = () => {
                setActiveBgButton(btn.dataset.bg);
                saveAndApplyChanges();
            };
        });

        document.querySelectorAll('.width-btn').forEach(btn => {
            btn.onclick = () => {
                // v2.7: زر سريع = حفظ الوضع + ضبط الشريط على قيمة الزر
                widthState.mode = btn.dataset.width;
                widthState.custom = WIDTH_PRESETS[btn.dataset.width];
                syncWidthUI();
                saveAndApplyChanges();
            };
        });

        // v2.7: شريط الضبط الدقيق — تحريكه يحفظ widthCustom فوراً،
        // يبطل الأزرار الثلاثة، ويعيد تفعيل الزر المطابق عند القيم الجاهزة بالضبط
        elements.widthSlider.oninput = () => {
            widthState.custom = Number(elements.widthSlider.value);
            if (widthState.custom === 760) widthState.mode = 'comfort';
            else if (widthState.custom === 1000) widthState.mode = 'medium';
            else if (widthState.custom === 1400) widthState.mode = 'wide';
            syncWidthUI();
            saveAndApplyChanges();
        };

        elements.hideFooter.onchange = saveAndApplyChanges;

        // ─── v3.1: الإملاء الصوتي ───
        // مفتاح التفعيل: حفظ + إظهار/إخفاء الخيارات + changeFont
        // (content.js ينشئ الزر عبر مهايئ الموقع أو يزيله حسب voiceEnabled)
        elements.tgVoice.onchange = () => {
            elements.voiceOptions.hidden = !elements.tgVoice.checked;
            saveAndApplyChanges();
        };

        // قائمة اللغة: حفظ فوري + setVoiceLanguage دون إيقاف أي تسجيل جارٍ
        elements.voiceLanguage.onchange = async () => {
            const lang = elements.voiceLanguage.value;
            const data = await chrome.storage.sync.get('fontSettings');
            const allSettings = data.fontSettings || {};
            // v3.2: أول تغيير على موقع بلا إعدادات محفوظة ينشئ الإدخال من الواجهة
            allSettings[currentHostname] = allSettings[currentHostname] || collectUISettings();
            allSettings[currentHostname].voiceLanguage = lang;
            await chrome.storage.sync.set({ fontSettings: allSettings });
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.tabs.sendMessage(tab.id, { action: 'setVoiceLanguage', voiceLanguage: lang });
        };

        // مفتاح النسخ التلقائي: حفظ فوري + setVoiceAutoCopy
        elements.tgVoiceCopy.onchange = async () => {
            const on = elements.tgVoiceCopy.checked;
            const data = await chrome.storage.sync.get('fontSettings');
            const allSettings = data.fontSettings || {};
            // v3.2: أول تغيير على موقع بلا إعدادات محفوظة ينشئ الإدخال من الواجهة
            allSettings[currentHostname] = allSettings[currentHostname] || collectUISettings();
            allSettings[currentHostname].voiceAutoCopy = on;
            await chrome.storage.sync.set({ fontSettings: allSettings });
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.tabs.sendMessage(tab.id, { action: 'setVoiceAutoCopy', voiceAutoCopy: on });
        };

        // ─── v4.0: الأدوات الإضافية ───
        // كل مفتاح عند التبديل → احفظ فوراً + أرسل changeFont (saveAndApplyChanges)
        // — content.js يربط الميزة عبر __AIR_BIDI__ حسب الإعدادات المرسلة
        //   (v4.7: حُذف PROGRESS/HIGHLIGHT نهائياً، v5.0: حُذف TIMER نهائياً).
        elements.tgBidi.onchange = saveAndApplyChanges;
    }

    // تشغيل كل شيء
    initialize();
});
