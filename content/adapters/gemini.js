/**
 * Font Changer v2.7 — مهايئ Gemini (بنية المهايئات)
 * يُحمَّل من manifest قبل content.js في عالم المحتوى المعزول نفسه،
 * ويُصدّر نفسه في self.FC_ADAPTERS ليختاره content.js حسب hostname.
 *
 * لماذا مهايئ؟ Gemini يستخدم متغيرات CSS داخلية (--gem-sys-color--*)
 * في مئات العناصر — تطارد المحددات لن تنجح؛ نستبدل المتغيرات نفسها.
 * كل موقع سيأخذ مهايئه الخاص (DeepSeek/Z.ai/Qwen لاحقاً) بنفس الشكل.
 */
(function () {
    'use strict';

    self.FC_ADAPTERS = self.FC_ADAPTERS || {};

    self.FC_ADAPTERS.gemini = {
        // نمط hostname الذي يعمل عليه هذا المهايئ
        hostPattern: /(^|\.)gemini\.google\.com$/,

        /**
         * متغيرات الألوان التي يستخدمها Gemini داخلياً.
         * light = ألوان "فاتح دافئ"، dark = ألوان "داكن مريح".
         * متغير بلا قيمة في وضع معين يُتجاهل في ذلك الوضع
         * (مثل --gem-sys-color--on-surface-low الغائب من الداكن).
         */
        colorVariables: {
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
        },

        /**
         * ألوان القواعد المباشرة (html/body والحاويات الرئيسية)
         */
        directColors: {
            light: { bg: '#f5f3ef', fg: '#2a2d31' },
            dark:  { bg: '#1e2126', fg: '#ddd9d3' }
        },

        /**
         * محددات حاويات عرض الردود (آلية v2.4/v2.5: فك قيد 708px + توسيع + توسيط)
         */
        widthSelectors: {
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
        },

        /**
         * محددات نص التذييل (بيانات فقط — applyFooterHide تستخدمها كسلوك قائم)
         */
        footerSelectors: [
            '[class*="disclaimer"]',
            '[class*="hallucination"]',
            '[class*="footer-note"]',
            '[class*="legal-text"]'
        ]
    };
})();
