/**
 * AIR Voice Input — الإملاء الصوتي (v4.4)
 * محرك الميزة: إنشاء الزر عبر createButton(adapter) عند الطلب من content.js،
 * ضبط اللغة setLanguage (دون إيقاف تسجيل جارٍ)، النسخ التلقائي setAutoCopy،
 * وإزالة الزر removeButton (توقف أي تسجيل جارٍ). دورة الحياة بيد
 * content.js: التطبيق الأولي + المراقب الدوري يعيدان إنشاء الزر في SPA
 * عبر getAdapter() لاختيار مهايئ الموقع (DeepSeek وZ.ai حالياً).
 * الواجهة العامة: window.__AIR_VOICE__.
 * يستخدم Web Speech API المدمجة في كروم — بلا مكتبات خارجية.
 *
 * v4.3: زر الميكروفون كان يختفي أثناء توليد الرد في Z.ai — Svelte يعيد
 * بناء DOM فيحذف الزر ولا يعيده (والمراقب الدوري 2s في content.js بطيء).
 * الحل: مراقب MutationObserver ذكي بطبقتين يُثبّت داخل createButton:
 * 1) مراقب محلي على والد حاوية الأزرار — يلتقط حذف الزر/إعادة بناء جواره
 *    فوراً (بدون مهلة). لاحظ: subtree=true بدل subtree=false في المواصفة
 *    لأن زر DeepSeek يعيش داخل الحاوية نفسها (.bf38813a) فكانت subtree=false
 *    ستغيب حذفه الداخلي — والنطاق يبقى صغيراً رخيصاً (منطقة الإدخال فقط).
 * 2) مراقب body الكامل مقيّد بـ rAF (فحص واحد كحد أقصى لكل إطار، الفحص
 *    نفسه O(1): هل #air-voice-btn موجود؟) — يلتقط استبدال الحاوية كلها
 *    حيث يموت المراقب المحلي مع عقدته المرصودة.
 * حارس voiceEnabled يمنع المراقبَين من مقاتلة الإزالة المقصودة (popup).
 * المراقب الدوري في content.js يبقى شبكة أمان أخيرة فقط.
 *
 * v4.4 — استكمال سيناريو «إرسال أثناء التسجيل» على Z.ai: زر الإرسال يُستبدل
 * بزر إيقاف وتُعاد بناء المجموعة فيختفي زرنا طوال التوليد، والتسجيل الجارٍ
 * يبقى بلا واجهة (يُتم في الخلفية بلا زر يوقفه). ثلاثة إصلاحات:
 * 1) createButton يفشل بهدوء إذا لم يجد المهايئ مرساة إدراج (لا زر إرسال
 *    ولا مجموعة) — كان ينشئ زراً يتيمًا خارج DOM ويُثبّت مراقبين على لا شيء.
 * 2) الزر المُعاد إنشاؤه أثناء تسجيل جارٍ يستعيد حالته المرئية (أحمر نابض)
 *    فوراً — كان يبدو زرًا عاديًا والمستخدم لا يعرف أن التسجيل شغال، ونقره
 *    كان يوقف التسجيل المخفي بدل بدء تسجيل جديد.
 * 3) مراقب body عند كل فحص: إن كان الزر موجودًا لكن في غير موضعه المثالي
 *    (بعد انتهاء التوليد وعودة زر الإرسال) أعاده المهايئ عبر reposition().
 * 4) onresult يعيد أساس النسخ إذا تغيّر الحقل خارج إرادتنا: الضغط على
 *    إرسال أثناء التسجيل يصفّر الحقل — كنا نعيد حقن النص القديم كله في
 *    رسالة الإرسال التالية. الآن تُعتمد قيمة الحقل الحالية أساسًا وتُستكمل
 *    الإملاء الجديد فوقها.
 */
(function () {
  'use strict';

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  let recognition = null;
  let isRecording = false;
  let currentAdapter = null;
  let currentBtn = null;
  let currentLang = 'ar-SA';
  let autoCopy = true;
  // v4.3: هل الميزة مفعّلة فعلاً؟ createButton=true وremoveButton=false —
  // يعتمده المراقبان كي لا يعيدا إدراج الزر بعد إيقاف المستخدم له من popup
  let voiceEnabled = false;

  // ─── v4.3: مراقبا إعادة الإدراج بعد إعادة بناء DOM (Svelte/React) ───
  // يستدعيان من createButton بعد إدراج الزر، ويعملان مع أي مهايئ.
  function startBtnObservers(adapter) {
    // إفصاح المراقبين السابقين عند كل تثبيت (المهايئ قد تغيّر بعد تنقل SPA)
    if (window.__AIR_BTN_OBSERVER__) window.__AIR_BTN_OBSERVER__.disconnect();
    if (window.__AIR_BODY_OBSERVER__) window.__AIR_BODY_OBSERVER__.disconnect();

    // الطبقة 1 — المراقب المحلي: والد حاوية الأزرار فقط.
    // الرد فوري (microtask) — هذا مسار <100ms الأساسي.
    window.__AIR_BTN_OBSERVER__ = new MutationObserver(() => {
      if (!voiceEnabled || document.getElementById('air-voice-btn')) return;
      const container = adapter.buttonContainer && adapter.buttonContainer();
      if (container && !container.querySelector('#air-voice-btn')) {
        createButton(adapter);
        console.log('[AIR Voice] Button re-inserted after Svelte DOM change');
      }
    });
    const container = adapter.buttonContainer && adapter.buttonContainer();
    if (container && container.parentElement) {
      window.__AIR_BTN_OBSERVER__.observe(container.parentElement, {
        childList: true,
        subtree: true
      });
    }

    // الطبقة 2 — مراقب body مقيّد بـ rAF: يلتقط استبدال الحاوية نفسها
    // (عندها يموت المراقب المحلي مع عقدته). كلفة قصوى: فحص واحد لكل
    // إطار رسم ≈ 60/ث — أرخص من الدوري 500ms الذي استبدلته المواصفة.
    let scheduled = false;
    window.__AIR_BODY_OBSERVER__ = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        if (!voiceEnabled) return;
        const btn = document.getElementById('air-voice-btn');
        if (!btn) {
          const a = getAdapter();
          if (a && a.buttonContainer && a.buttonContainer()) {
            createButton(a);
            console.log('[AIR Voice] Button re-inserted after Svelte DOM change');
          }
          return;
        }
        // v4.4: الزر موجود لكن ربما في غير موضعه المثالي — بعد انتهاء
        // التوليد يعود زر الإرسال فنعيد الزر بجانبه (التقارب O(1) لكل إطار)
        const a = getAdapter();
        if (a && typeof a.reposition === 'function') a.reposition(btn);
      });
    });
    window.__AIR_BODY_OBSERVER__.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ─── إنشاء الزر ───
  function createButton(adapter) {
    if (document.getElementById('air-voice-btn')) return;
    voiceEnabled = true; // v4.3: المراقبان يُسمح لهما بالعمل من الآن
    const wasRecording = isRecording; // v4.4: هل أُعيد الإنشاء أثناء تسجيل جارٍ؟
    const btn = document.createElement('div');
    btn.id = 'air-voice-btn';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', 'إملاء صوتي');
    btn.className = adapter.buttonClass;
    btn.style.setProperty('--dsl-button-height', '34px');
    btn.innerHTML = `
      <div class="ds-button__background"></div>
      <div class="ds-button__icon ds-button__icon--last-child">
        <div class="ds-icon" style="font-size: inherit;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 1 0 5 0V4A2.5 2.5 0 0 0 8 1.5Z"
                  stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
            <path d="M3.5 7.5v.5a4.5 4.5 0 0 0 9 0v-.5M8 12.5v2M5.5 14.5h5"
                  stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    `;
    btn.style.cssText += 'cursor:pointer;user-select:none;transition:color 0.2s,background 0.2s;';
    // v3.3: حجم الأيقونة 16px يتماشى مع باقي أزرار Z.ai (تيلويند)
    btn.querySelector('svg')?.setAttribute('width', '16');
    btn.querySelector('svg')?.setAttribute('height', '16');
    btn.addEventListener('click', toggleRecording);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRecording(); }
    });
    // v4.4: إن لم يجد المهايئ مرساة إدراج (أثناء التوليد غائبان زر الإرسال
    // والمجموعة) لا تنشئ زرًا يتيمًا خارج DOM — المراقبون والدوري سيعيدون المحاولة
    const ok = adapter.insertButton(btn);
    if (ok === false) return;
    currentAdapter = adapter; // v3.1: إصلاح — بدون هذا يبقى currentAdapter null ويرمي النقر خطأ
    currentBtn = btn;

    // v4.4: أُعيد إنشاء الزر أثناء تسجيل جارٍ (إعادة بناء Svelte حذفته)؟
    // استعد الحالة المرئية فوراً — وإلا بدا زرًا عاديًا ونقرُه يوقف التسجيل
    // المخفي بدل بدء تسجيل جديد
    if (wasRecording) {
      btn.classList.add('air-voice-btn--recording');
      btn.dataset.airRecording = '1';
    }

    // v4.3: راقب حاوية الأزرار لاكتشاف إعادة البناء وإعادة الإدراج <100ms
    // (بعد insertButton عمداً — الرصد يبدأ والزر في مكانه الصحيح)
    startBtnObservers(adapter);
  }

  // ─── تبديل التسجيل ───
  function toggleRecording() {
    if (isRecording) {
      recognition.stop();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    recognition = new SR();
    recognition.lang = currentLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // v4.4: let — onresult يعيد أساس النسخ عند تغيّر الحقل خارج إرادتنا (إرسال أثناء التسجيل)
    let originalText = currentAdapter.getInputValue() || '';
    let separator = originalText && !originalText.endsWith(' ') && !originalText.endsWith('\n')
      ? ' ' : '';
    let finalText = '';
    // v4.4: آخر قيمة كتبناها في الحقل — كشف تغيير خارجي (إرسال أثناء التسجيل)
    let lastWritten = null;

    recognition.onstart = () => {
      isRecording = true;
      currentBtn.classList.add('air-voice-btn--recording');
      currentBtn.dataset.airRecording = '1'; // v4.4: قراءة الحالة من DOM (تشخيص/اختبار)
    };

    recognition.onresult = (e) => {
      // v4.4: تغيّر الحقل خارج إرادتنا؟ الضغط على «إرسال» أثناء التسجيل
      // يصفّر الحقل — بلا هذا الفحص كنا نعيد حقن النص القديم كله في
      // رسالة الإرسال التالية. الآن تُعتمد قيمة الحقل الحالية أساسًا
      // ويُستكمل الإملاء الجديد فوقها.
      const nowValue = currentAdapter.getInputValue() || '';
      if (lastWritten !== null && nowValue !== lastWritten) {
        originalText = nowValue;
        separator = originalText && !originalText.endsWith(' ') && !originalText.endsWith('\n')
          ? ' ' : '';
        finalText = '';
      }
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      const combined = originalText + separator + finalText + interim;
      lastWritten = combined;
      currentAdapter.setInputValue(combined);
    };

    recognition.onerror = (e) => {
      console.warn('[AIR Voice]', e.error);
      isRecording = false;
      if (currentBtn) {
        currentBtn.classList.remove('air-voice-btn--recording');
        delete currentBtn.dataset.airRecording;
        currentBtn.classList.add('air-voice-btn--error');
        setTimeout(() => currentBtn?.classList.remove('air-voice-btn--error'), 3000);
      }
    };

    recognition.onend = () => {
      isRecording = false;
      if (currentBtn) {
        currentBtn.classList.remove('air-voice-btn--recording');
        delete currentBtn.dataset.airRecording;
      }

      // ★ نسخ تلقائي للحافظة بعد التوقف مباشرة
      if (autoCopy) {
        const fullText = currentAdapter.getInputValue() || '';
        const trimmed = fullText.trim();
        if (trimmed) {
          navigator.clipboard.writeText(trimmed).then(() => {
            console.log('[AIR Voice] Copied to clipboard:',
              trimmed.substring(0, 50) + (trimmed.length > 50 ? '…' : ''));
          }).catch(err => {
            console.warn('[AIR Voice] Clipboard copy failed:', err);
          });
        }
      }
    };

    try { recognition.start(); } catch (e) { console.warn('[AIR Voice]', e); }
  }

  // ─── تغيير اللغة ───
  function setLanguage(lang) {
    currentLang = lang || 'ar-SA';
    // لا نوقف التسجيل الجاري
  }

  // ─── تشغيل/إيقاف النسخ التلقائي ───
  function setAutoCopy(on) {
    autoCopy = !!on;
  }

  // ─── اختيار مهايئ الموقع حسب hostname (v3.2 + z.ai في v3.3) ───
  // يستهلكه المراقب الدوري في content.js عند إعادة إدراج الزر بعد تنقلات SPA
  function getAdapter() {
    const host = location.hostname;
    if (host.includes('deepseek.com'))
      return window.__AIR_VOICE_ADAPTERS__?.deepseek;
    if (host.includes('chat.z.ai') || host.includes('z.ai'))
      return window.__AIR_VOICE_ADAPTERS__?.zai;
    // لاحقاً: qwen
    return null;
  }

  // ─── إزالة الزر ───
  function removeButton() {
    const btn = document.getElementById('air-voice-btn');
    if (btn) btn.remove();
    voiceEnabled = false; // v4.3: المراقبان لا يعيدان الإدراج بعد إزالة مقصودة
    if (isRecording && recognition) {
      try { recognition.stop(); } catch (e) { /* لا شيء */ }
      isRecording = false;
    }
  }

  // ─── واجهة عامة ───
  window.__AIR_VOICE__ = {
    setLanguage,
    setAutoCopy,
    createButton,
    removeButton,
    getAdapter, // v3.2: يعتمدها ensureVoiceButton في content.js
    isRecording: () => isRecording
  };

  // ─── قناة تشخيصية عبر window.postMessage (v4.4) ───
  // سكربتات المحتوى تعمل في عالم معزول فلا تصلها متغيرات الصفحة —
  // postMessage هو الجسر الرسمي بين العالمين. تتيح القناة لصفحة الاختبار
  // وأدوات الفحص محاكاة نتائج التعرف في بيئات بلا مايكروفون وقراءة حالة
  // التسجيل. خاملة في الاستخدام الطبيعي (لا أحد يرسل الرسالة المميزة).
  // الرسائل: {__airVoiceDebug:true, cmd:'start'|'emit'|'end'|'state',
  //           transcript, isFinal} — والرد: {__airVoiceDebugState, recording}
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || d.__airVoiceDebug !== true) return;
    try {
      if (d.cmd === 'start') {
        isRecording = true;
        if (currentBtn) {
          currentBtn.classList.add('air-voice-btn--recording');
          currentBtn.dataset.airRecording = '1';
        }
      } else if (d.cmd === 'emit' && recognition && recognition.onresult) {
        recognition.onresult({
          resultIndex: 0,
          results: [{ 0: { transcript: String(d.transcript || '') }, isFinal: !!d.isFinal }]
        });
      } else if (d.cmd === 'end' && recognition && recognition.onend) {
        recognition.onend();
      } else if (d.cmd === 'state') {
        window.postMessage({ __airVoiceDebugState: true, recording: isRecording }, '*');
      }
    } catch (err) { console.warn('[AIR Voice] debug channel:', err); }
  });

  // ─── CSS ───
  const style = document.createElement('style');
  style.textContent = `
    #air-voice-btn { position: relative; }
    #air-voice-btn:hover { background-color: rgba(255,255,255,0.06); }
    #air-voice-btn.air-voice-btn--recording {
      color: #ef4444 !important;
      background-color: rgba(239, 68, 68, 0.12) !important;
      animation: air-voice-pulse 1.4s ease-in-out infinite;
    }
    #air-voice-btn.air-voice-btn--error { color: #f59e0b !important; }
    @keyframes air-voice-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
      50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
    }
  `;
  document.head.appendChild(style);
})();
