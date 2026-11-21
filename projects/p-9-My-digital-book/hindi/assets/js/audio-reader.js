/* ==========================================================================
   ADVANCED DIGITAL E-BOOK – SMART AUDIO & MULTILINGUAL READER ENGINE
   Pure Frontend Architecture: Web Speech API (window.speechSynthesis)
   Zero Backend | Zero Paid APIs | Zero Audio Overlap | Static Hosting Ready
   ========================================================================== */

(function() {
    'use strict';

    // --------------------------------------------------------------------------
    // 1. EDUCATIONAL PRONUNCIATION DICTIONARY
    // --------------------------------------------------------------------------
    const PRONUNCIATION_DICT = {
        // Hindi speech context replacements (Devanagari phonetics for natural Hindi TTS)
        hi: [
            { regex: /\bGDP\b/gi, spoken: 'जी डी पी' },
            { regex: /\bReal GDP\b/gi, spoken: 'रियल जी डी पी' },
            { regex: /\bNominal GDP\b/gi, spoken: 'नॉमिनल जी डी पी' },
            { regex: /\bGNP\b/gi, spoken: 'जी एन पी' },
            { regex: /\bNDP\b/gi, spoken: 'एन डी पी' },
            { regex: /\bNNP\b/gi, spoken: 'एन एन पी' },
            { regex: /\bHDI\b/gi, spoken: 'एच डी आई' },
            { regex: /\bFDI\b/gi, spoken: 'एफ डी आई' },
            { regex: /\bFII\b/gi, spoken: 'एफ आई आई' },
            { regex: /\bFPI\b/gi, spoken: 'एफ पी आई' },
            { regex: /\bSDGs\b/gi, spoken: 'एस डी जी' },
            { regex: /\bSDG\b/gi, spoken: 'एस डी जी' },
            { regex: /\bNITI Aayog\b/gi, spoken: 'नीति आयोग' },
            { regex: /\bNITI\b/gi, spoken: 'नीति' },
            { regex: /\bMGNREGA\b/gi, spoken: 'मनरेगा' },
            { regex: /\bPQLI\b/gi, spoken: 'पी क्यू एल आई' },
            { regex: /\bMPI\b/gi, spoken: 'एम पी आई' },
            { regex: /\bMSME\b/gi, spoken: 'एम एस एम ई' },
            { regex: /\bRBI\b/gi, spoken: 'आर बी आई' },
            { regex: /\bPPP\b/gi, spoken: 'पी पी पी' },
            { regex: /\bFY\b/gi, spoken: 'वित्तीय वर्ष' },
            { regex: /\bCr\b/gi, spoken: 'करोड़' },
            { regex: /\bLakh\b/gi, spoken: 'लाख' },
            { regex: /\bvs\.?\b/gi, spoken: 'बनाम' },
            { regex: /\bi\.e\.?\b/gi, spoken: 'यानी' },
            { regex: /\be\.g\.?\b/gi, spoken: 'उदाहरण के लिए' },
            { regex: /%/g, spoken: ' प्रतिशत ' },
            { regex: /₹\s*([0-9]+(?:\.[0-9]+)?)/g, spoken: '$1 रुपये' },
            { regex: /\$\s*([0-9]+(?:\.[0-9]+)?)/g, spoken: '$1 डॉलर' },
            { regex: /\bEconomic Growth\b/gi, spoken: 'इकोनॉमिक ग्रोथ' },
            { regex: /\bEconomic Development\b/gi, spoken: 'इकोनॉमिक डेवलपमेंट' },
            { regex: /\bSustainable Development\b/gi, spoken: 'सस्टेनेबल डेवलपमेंट' },
            { regex: /\bCapital Formation\b/gi, spoken: 'कैपिटल फॉर्मेशन' },
            { regex: /\bFiscal Policy\b/gi, spoken: 'फिस्कल पॉलिसी' },
            { regex: /\bMonetary Policy\b/gi, spoken: 'मॉनेटरी पॉलिसी' },
            { regex: /\bInflation\b/gi, spoken: 'मुद्रास्फीति यानी इनफ्लेशन' },
            { regex: /\bDeflation\b/gi, spoken: 'अपस्फीति यानी डिफ्लेशन' }
        ],
        // English speech context replacements (Clear spelled-out letters)
        en: [
            { regex: /\bGDP\b/g, spoken: 'G D P' },
            { regex: /\bGNP\b/g, spoken: 'G N P' },
            { regex: /\bNDP\b/g, spoken: 'N D P' },
            { regex: /\bNNP\b/g, spoken: 'N N P' },
            { regex: /\bHDI\b/g, spoken: 'H D I' },
            { regex: /\bFDI\b/g, spoken: 'F D I' },
            { regex: /\bFII\b/g, spoken: 'F I I' },
            { regex: /\bFPI\b/g, spoken: 'F P I' },
            { regex: /\bSDGs\b/g, spoken: 'S D Gs' },
            { regex: /\bSDG\b/g, spoken: 'S D G' },
            { regex: /\bNITI Aayog\b/g, spoken: 'Niti Aayog' },
            { regex: /\bMGNREGA\b/g, spoken: 'M G N R E G A' },
            { regex: /\bPQLI\b/g, spoken: 'P Q L I' },
            { regex: /\bMPI\b/g, spoken: 'M P I' },
            { regex: /\bMSME\b/g, spoken: 'M S M E' },
            { regex: /\bRBI\b/g, spoken: 'R B I' },
            { regex: /\bPPP\b/g, spoken: 'P P P' },
            { regex: /\bFY\b/g, spoken: 'Financial Year' },
            { regex: /\bvs\.?\b/gi, spoken: 'versus' },
            { regex: /\bi\.e\.?\b/gi, spoken: 'that is' },
            { regex: /\be\.g\.?\b/gi, spoken: 'for example' },
            { regex: /%/g, spoken: ' percent ' },
            { regex: /₹\s*([0-9]+(?:\.[0-9]+)?)/g, spoken: '$1 rupees' },
            { regex: /\$\s*([0-9]+(?:\.[0-9]+)?)/g, spoken: '$1 dollars' }
        ]
    };

    function applyPronunciationRules(text, lang) {
        if (!text) return '';
        const rules = PRONUNCIATION_DICT[lang] || PRONUNCIATION_DICT.en;
        let processed = text;
        for (const rule of rules) {
            processed = processed.replace(rule.regex, rule.spoken);
        }
        return processed;
    }

    // --------------------------------------------------------------------------
    // 2. MULTILINGUAL TEXT SEGMENTATION & LANGUAGE DETECTION
    // --------------------------------------------------------------------------
    // Segments mixed Hindi-English sentences into alternating language utterances:
    // e.g. "आर्थिक संवृद्धि (Economic Growth) किसी देश के Real GDP में होने वाली वृद्धि को दर्शाती है।"
    // -> Segment 1: "आर्थिक संवृद्धि" (Hindi voice)
    // -> Segment 2: "Economic Growth" (English voice)
    // -> Segment 3: "किसी देश के" (Hindi voice)
    // -> Segment 4: "Real GDP" (English voice)
    // -> Segment 5: "में होने वाली वृद्धि को दर्शाती है।" (Hindi voice)
    function segmentTextByLanguage(text, baseLang = 'hi') {
        if (!text || !text.trim()) return [];

        // Clean out Markdown, MathJax / LaTeX symbols, footnote brackets
        let cleaned = text
            .replace(/\$+[^\$]+\$+/g, ' ') // LaTeX formulas
            .replace(/\[\s*\d+\s*\]/g, ' ') // footnotes like [1]
            .replace(/[\*\_\`\#]/g, '') // markdown artifacts
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleaned) return [];

        // Split into sentences / manageable phrases (under ~160 chars)
        // Splits by punctuation: full stop, danda (।), semicolon, question mark, newline
        const sentenceParts = cleaned.split(/(?<=[।\.\?!;:\n])\s+/);
        const finalSegments = [];

        for (const sentence of sentenceParts) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) continue;

            // Check if sentence contains both Devanagari and Latin characters
            const hasHindi = /[\u0900-\u097F]/.test(trimmedSentence);
            const hasEnglish = /[A-Za-z]/.test(trimmedSentence);

            if (hasHindi && hasEnglish) {
                // Mixed sentence: tokenize and segment
                const englishSpanRegex = /([A-Za-z][A-Za-z0-9\s,\.\'\-\/&]*[A-Za-z0-9]|[A-Za-z])/g;
                let lastIndex = 0;
                let m;

                while ((m = englishSpanRegex.exec(trimmedSentence)) !== null) {
                    const before = trimmedSentence.substring(lastIndex, m.index).trim();
                    if (before) {
                        const cleanBefore = before.replace(/^[\(\[\{\"\']+|[\)\]\}\"\']+$/g, '').trim();
                        if (cleanBefore) {
                            finalSegments.push({
                                text: applyPronunciationRules(cleanBefore, 'hi'),
                                rawText: cleanBefore,
                                lang: 'hi'
                            });
                        }
                    }

                    const englishText = m[0].trim();
                    if (englishText) {
                        const cleanEn = englishText.replace(/^[\(\[\{\"\']+|[\)\]\}\"\']+$/g, '').trim();
                        if (cleanEn) {
                            finalSegments.push({
                                text: applyPronunciationRules(cleanEn, 'en'),
                                rawText: cleanEn,
                                lang: 'en'
                            });
                        }
                    }

                    lastIndex = m.index + m[0].length;
                }

                if (lastIndex < trimmedSentence.length) {
                    const remaining = trimmedSentence.substring(lastIndex).trim();
                    const cleanRem = remaining.replace(/^[\(\[\{\"\']+|[\)\]\}\"\']+$/g, '').trim();
                    if (cleanRem) {
                        finalSegments.push({
                            text: applyPronunciationRules(cleanRem, 'hi'),
                            rawText: cleanRem,
                            lang: 'hi'
                        });
                    }
                }
            } else if (hasHindi) {
                finalSegments.push({
                    text: applyPronunciationRules(trimmedSentence, 'hi'),
                    rawText: trimmedSentence,
                    lang: 'hi'
                });
            } else if (hasEnglish) {
                finalSegments.push({
                    text: applyPronunciationRules(trimmedSentence, 'en'),
                    rawText: trimmedSentence,
                    lang: 'en'
                });
            } else {
                // Neutral (numbers/symbols) - use base language of page
                finalSegments.push({
                    text: applyPronunciationRules(trimmedSentence, baseLang),
                    rawText: trimmedSentence,
                    lang: baseLang
                });
            }
        }

        return finalSegments;
    }

    // --------------------------------------------------------------------------
    // 3. VOICE MANAGER (DYNAMIC DISCOVERY & NATURAL PREFERENCE)
    // --------------------------------------------------------------------------
    class VoiceManager {
        constructor() {
            this.voices = [];
            this.hindiVoice = null;
            this.englishVoice = null;
            this.selectedHindiVoiceName = localStorage.getItem('ba5_tts_hindi_voice') || null;
            this.selectedEnglishVoiceName = localStorage.getItem('ba5_tts_english_voice') || null;
            this.hindiVoiceMissing = false;
            this.onVoicesReadyCallbacks = [];

            this.init();
        }

        init() {
            if (!('speechSynthesis' in window)) {
                console.warn('[AudioReader] Web Speech API not supported in this browser.');
                return;
            }

            const loadVoices = () => {
                this.voices = window.speechSynthesis.getVoices() || [];
                if (this.voices.length > 0) {
                    this.resolveVoices();
                    this.notifyCallbacks();
                }
            };

            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }

            // Fallback poll in case onvoiceschanged does not fire promptly
            setTimeout(loadVoices, 300);
            setTimeout(loadVoices, 1000);
        }

        onReady(cb) {
            if (this.voices.length > 0) {
                cb();
            } else {
                this.onVoicesReadyCallbacks.push(cb);
            }
        }

        notifyCallbacks() {
            while (this.onVoicesReadyCallbacks.length) {
                const cb = this.onVoicesReadyCallbacks.shift();
                try { cb(); } catch (e) { console.error(e); }
            }
        }

        resolveVoices() {
            if (!this.voices.length) return;

            // 1. Resolve Hindi Voice
            let hiVoices = this.voices.filter(v => v.lang && (v.lang.toLowerCase() === 'hi-in' || v.lang.toLowerCase().startsWith('hi')));
            
            // Preference order: user-selected -> Natural/Online -> Google/Microsoft -> any Hindi
            if (this.selectedHindiVoiceName) {
                this.hindiVoice = this.voices.find(v => v.name === this.selectedHindiVoiceName) || null;
            }
            if (!this.hindiVoice && hiVoices.length > 0) {
                this.hindiVoice = hiVoices.find(v => /natural|online/i.test(v.name)) ||
                                  hiVoices.find(v => /google|microsoft|swara|hemant|lekha/i.test(v.name)) ||
                                  hiVoices[0];
            }

            // 2. Resolve English Voice (Prefer Indian English, then US/UK Natural)
            let enInVoices = this.voices.filter(v => v.lang && (v.lang.toLowerCase() === 'en-in'));
            let enAllVoices = this.voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));

            if (this.selectedEnglishVoiceName) {
                this.englishVoice = this.voices.find(v => v.name === this.selectedEnglishVoiceName) || null;
            }
            if (!this.englishVoice) {
                if (enInVoices.length > 0) {
                    this.englishVoice = enInVoices.find(v => /natural|online/i.test(v.name)) ||
                                        enInVoices.find(v => /google|microsoft|neerja|prabhat/i.test(v.name)) ||
                                        enInVoices[0];
                } else if (enAllVoices.length > 0) {
                    this.englishVoice = enAllVoices.find(v => /natural|online/i.test(v.name)) ||
                                        enAllVoices.find(v => /google|samantha|karen|daniel/i.test(v.name)) ||
                                        enAllVoices[0];
                } else {
                    this.englishVoice = this.voices[0] || null;
                }
            }

            // Check if Hindi voice is missing
            if (!this.hindiVoice) {
                this.hindiVoiceMissing = true;
                // Fallback to English/default voice so speech still functions
                this.hindiVoice = this.englishVoice || this.voices[0] || null;
            } else {
                this.hindiVoiceMissing = false;
            }
        }

        getVoiceForLanguage(lang) {
            if (lang === 'hi') {
                return this.hindiVoice || this.englishVoice || (this.voices.length ? this.voices[0] : null);
            }
            return this.englishVoice || (this.voices.length ? this.voices[0] : null);
        }

        setUserVoice(type, voiceName) {
            if (type === 'hi') {
                this.selectedHindiVoiceName = voiceName;
                localStorage.setItem('ba5_tts_hindi_voice', voiceName);
            } else {
                this.selectedEnglishVoiceName = voiceName;
                localStorage.setItem('ba5_tts_english_voice', voiceName);
            }
            this.resolveVoices();
        }
    }

    // --------------------------------------------------------------------------
    // 4. CENTRALIZED GLOBAL AUDIO CONTROLLER (ZERO AUDIO OVERLAP GUARANTEED)
    // --------------------------------------------------------------------------
    class GlobalAudioController {
        constructor() {
            this.state = 'IDLE'; // 'IDLE' | 'PLAYING' | 'PAUSED'
            this.mode = null;    // 'section' | 'unit'
            
            this.currentUnitId = null;
            this.currentUnitTitle = '';
            this.unitSections = [];
            this.unitSectionIndex = -1;

            this.activeTargetId = null;
            this.activeTargetElement = null;
            this.activeTargetTitle = '';

            this.utteranceQueue = [];
            this.utteranceIndex = 0;
            this.activeUtterance = null;

            this.sessionId = 0; // Incremented on every play/stop to cancel stale callbacks
            this.rate = parseFloat(localStorage.getItem('ba5_tts_rate')) || 1.0;
            this.autoScrollEnabled = localStorage.getItem('ba5_tts_autoscroll') !== 'false'; // default true

            this.voiceManager = new VoiceManager();
            this.heartbeatTimer = null;

            this.initEventGuards();
        }

        initEventGuards() {
            // Cancel speech immediately on page navigation, tab hide, or language change
            window.addEventListener('beforeunload', () => this.stop());
            window.addEventListener('pagehide', () => this.stop());
            window.addEventListener('popstate', () => this.stop());
            window.addEventListener('hashchange', () => {
                this.stop();
            });
        }

        // Chrome 15s freeze bug keepalive
        startHeartbeat() {
            this.clearHeartbeat();
            this.heartbeatTimer = setInterval(() => {
                if (this.state === 'PLAYING' && window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 10000);
        }

        clearHeartbeat() {
            if (this.heartbeatTimer) {
                clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null;
            }
        }

        // ----------------------------------------------------------------------
        // PUBLIC API: ZERO AUDIO OVERLAP PLAYBACK DISPATCHER
        // ----------------------------------------------------------------------

        /**
         * Play an individual educational section (Scenario 1 & 4)
         */
        playSection(targetId, targetElement, targetTitle) {
            // Scenario 4: Clicking the currently playing section toggles Pause/Resume
            if (this.state === 'PLAYING' && this.mode === 'section' && this.activeTargetId === targetId) {
                this.pause();
                return;
            }
            if (this.state === 'PAUSED' && this.mode === 'section' && this.activeTargetId === targetId) {
                this.resume();
                return;
            }

            // Immediately stop previous audio and cancel pending queues (CORE RULE)
            this.stop(false);

            this.mode = 'section';
            this.activeTargetId = targetId;
            this.activeTargetElement = targetElement || document.getElementById(targetId);
            this.activeTargetTitle = targetTitle || this.resolveElementTitle(this.activeTargetElement);

            if (!this.activeTargetElement) {
                console.error('[AudioReader] Target element not found:', targetId);
                return;
            }

            this.prepareAndStartTarget(this.activeTargetElement, this.activeTargetTitle);
        }

        /**
         * Play an entire unit sequentially (Scenario 2 & 3)
         */
        playUnit(unitId, unitDividerElement, unitTitle) {
            // If already playing this unit, toggle pause/resume
            if (this.state === 'PLAYING' && this.mode === 'unit' && this.currentUnitId === unitId) {
                this.pause();
                return;
            }
            if (this.state === 'PAUSED' && this.mode === 'unit' && this.currentUnitId === unitId) {
                this.resume();
                return;
            }

            // Immediately stop previous audio and clear speech queue (CORE RULE)
            this.stop(false);

            this.mode = 'unit';
            this.currentUnitId = unitId;
            const divider = unitDividerElement || document.getElementById(unitId);
            this.currentUnitTitle = unitTitle || (divider ? divider.querySelector('h2, .unit-badge')?.textContent.trim() : 'संपूर्ण यूनिट');

            // Collect all educational sections belonging to this unit in DOM order
            this.unitSections = this.collectUnitSections(divider);
            if (!this.unitSections.length) {
                console.warn('[AudioReader] No readable sections found for unit:', unitId);
                return;
            }

            this.unitSectionIndex = 0;
            this.playUnitCurrentSection();
        }

        collectUnitSections(unitDivider) {
            if (!unitDivider) return [];
            const sections = [];
            let el = unitDivider.nextElementSibling;

            while (el) {
                // Stop when encountering the next unit divider
                if (el.classList && el.classList.contains('unit-divider')) {
                    break;
                }

                // If element is a chapter article
                if (el.tagName === 'ARTICLE' && el.classList.contains('book-chapter')) {
                    // 1. Chapter title & intro/bhumika
                    const bhumika = el.querySelector('.chapter-bhumika');
                    if (bhumika) {
                        sections.push({
                            id: bhumika.id || (el.id + '-bhumika'),
                            element: bhumika,
                            title: (el.querySelector('.chapter-header h1')?.textContent || 'अध्याय भूमिका').trim()
                        });
                    }

                    // 2. Sections inside chapter
                    const innerSections = el.querySelectorAll('section[id], .book-definition, .book-example, .chapter-summary');
                    innerSections.forEach(s => {
                        sections.push({
                            id: s.id || ('sec-' + Math.random().toString(36).substr(2, 6)),
                            element: s,
                            title: this.resolveElementTitle(s)
                        });
                    });
                } else if (el.tagName === 'SECTION') {
                    sections.push({
                        id: el.id || ('sec-' + Math.random().toString(36).substr(2, 6)),
                        element: el,
                        title: this.resolveElementTitle(el)
                    });
                }

                el = el.nextElementSibling;
            }

            return sections;
        }

        playUnitCurrentSection() {
            if (this.unitSectionIndex < 0 || this.unitSectionIndex >= this.unitSections.length) {
                // Unit completed!
                this.stop();
                this.showToast(document.documentElement.lang === 'en' ? 'Unit completed.' : 'यूनिट पठन सफलतापूर्वक पूर्ण हुआ।');
                return;
            }

            const current = this.unitSections[this.unitSectionIndex];
            this.activeTargetId = current.id;
            this.activeTargetElement = current.element;
            this.activeTargetTitle = current.title;

            this.prepareAndStartTarget(current.element, current.title);
        }

        // ----------------------------------------------------------------------
        // SPEECH SYNTHESIS EXECUTION & QUEUE
        // ----------------------------------------------------------------------

        prepareAndStartTarget(targetElement, targetTitle) {
            const thisSession = ++this.sessionId;

            // Extract readable educational text
            const rawText = this.extractReadableText(targetElement);
            if (!rawText || !rawText.trim()) {
                console.warn('[AudioReader] Target has no readable text:', targetElement);
                if (this.mode === 'unit') {
                    this.unitSectionIndex++;
                    this.playUnitCurrentSection();
                }
                return;
            }

            // Detect page default language ('hi' or 'en')
            const pageLang = document.documentElement.lang === 'en' ? 'en' : 'hi';
            
            // Segment text into language-specific chunks
            const segments = segmentTextByLanguage(rawText, pageLang);
            if (!segments.length) return;

            this.utteranceQueue = segments;
            this.utteranceIndex = 0;
            this.state = 'PLAYING';

            // Visual Highlight & Auto Scroll
            this.applyActiveHighlight(targetElement);
            if (this.autoScrollEnabled) {
                this.scrollToElement(targetElement);
            }

            // Sync UI Buttons & Global Control Bar
            this.syncAllButtons();
            this.updateControlBarUI();

            // Start heartbeat keepalive
            this.startHeartbeat();

            // Speak first segment in queue
            this.speakNextSegment(thisSession);
        }

        speakNextSegment(currentSession) {
            // Guard: If session was cancelled or changed, abort immediately
            if (this.sessionId !== currentSession || this.state !== 'PLAYING') {
                return;
            }

            if (this.utteranceIndex >= this.utteranceQueue.length) {
                // Completed all segments for this section!
                if (this.mode === 'unit') {
                    this.unitSectionIndex++;
                    this.playUnitCurrentSection();
                } else {
                    this.stop();
                }
                return;
            }

            const segment = this.utteranceQueue[this.utteranceIndex];
            const voice = this.voiceManager.getVoiceForLanguage(segment.lang);

            const utterance = new SpeechSynthesisUtterance(segment.text);
            utterance.rate = this.rate;
            utterance.pitch = 1.0;
            utterance.lang = segment.lang === 'hi' ? 'hi-IN' : 'en-IN';

            if (voice) {
                utterance.voice = voice;
            }

            // Chrome garbage collection workaround: retain reference
            this.activeUtterance = utterance;

            utterance.onend = () => {
                if (this.sessionId !== currentSession) return;
                this.utteranceIndex++;
                this.speakNextSegment(currentSession);
            };

            utterance.onerror = (event) => {
                if (event.error === 'canceled' || event.error === 'interrupted') {
                    return;
                }
                console.warn('[AudioReader] Speech utterance error:', event.error);
                if (this.sessionId === currentSession) {
                    this.utteranceIndex++;
                    this.speakNextSegment(currentSession);
                }
            };

            // Dispatch to native engine
            try {
                window.speechSynthesis.speak(utterance);
            } catch (err) {
                console.error('[AudioReader] speechSynthesis.speak failed:', err);
                this.stop();
            }
        }

        // ----------------------------------------------------------------------
        // CONTROLS: PAUSE, RESUME, STOP, PREV, NEXT, RATE
        // ----------------------------------------------------------------------

        pause() {
            if (this.state !== 'PLAYING') return;
            this.state = 'PAUSED';
            this.clearHeartbeat();
            window.speechSynthesis.pause();
            this.syncAllButtons();
            this.updateControlBarUI();
        }

        resume() {
            if (this.state !== 'PAUSED') return;
            this.state = 'PLAYING';
            this.startHeartbeat();
            window.speechSynthesis.resume();
            this.syncAllButtons();
            this.updateControlBarUI();
        }

        stop(resetUI = true) {
            this.sessionId++; // Invalidates active async callbacks
            this.clearHeartbeat();
            this.state = 'IDLE';

            try {
                window.speechSynthesis.cancel();
            } catch (e) {}

            this.activeUtterance = null;
            this.utteranceQueue = [];
            this.utteranceIndex = 0;

            this.clearActiveHighlight();

            if (resetUI) {
                this.mode = null;
                this.currentUnitId = null;
                this.unitSections = [];
                this.unitSectionIndex = -1;
                this.activeTargetId = null;
                this.activeTargetElement = null;
                this.activeTargetTitle = '';

                this.syncAllButtons();
                this.updateControlBarUI();
            }
        }

        nextSection() {
            if (this.mode === 'unit' && this.unitSections.length > 0) {
                if (this.unitSectionIndex < this.unitSections.length - 1) {
                    this.unitSectionIndex++;
                    this.playUnitCurrentSection();
                } else {
                    this.stop();
                }
            } else if (this.activeTargetElement) {
                const allSecs = Array.from(document.querySelectorAll('section[id], .chapter-bhumika'));
                const curIdx = allSecs.indexOf(this.activeTargetElement);
                if (curIdx >= 0 && curIdx < allSecs.length - 1) {
                    const next = allSecs[curIdx + 1];
                    this.playSection(next.id, next, this.resolveElementTitle(next));
                }
            }
        }

        prevSection() {
            if (this.mode === 'unit' && this.unitSections.length > 0) {
                if (this.unitSectionIndex > 0) {
                    this.unitSectionIndex--;
                    this.playUnitCurrentSection();
                }
            } else if (this.activeTargetElement) {
                const allSecs = Array.from(document.querySelectorAll('section[id], .chapter-bhumika'));
                const curIdx = allSecs.indexOf(this.activeTargetElement);
                if (curIdx > 0) {
                    const prev = allSecs[curIdx - 1];
                    this.playSection(prev.id, prev, this.resolveElementTitle(prev));
                }
            }
        }

        setRate(newRate) {
            this.rate = parseFloat(newRate);
            localStorage.setItem('ba5_tts_rate', this.rate);
            
            if (this.state === 'PLAYING') {
                const curSession = this.sessionId;
                window.speechSynthesis.cancel();
                this.speakNextSegment(curSession);
            }
            this.updateControlBarUI();
        }

        toggleAutoScroll() {
            this.autoScrollEnabled = !this.autoScrollEnabled;
            localStorage.setItem('ba5_tts_autoscroll', this.autoScrollEnabled);
            this.updateControlBarUI();
        }

        // ----------------------------------------------------------------------
        // DOM HELPERS & TEXT EXTRACTION
        // ----------------------------------------------------------------------

        resolveElementTitle(element) {
            if (!element) return 'पाठ्य सामग्री';
            const h = element.querySelector('h1, h2, h3, .def-term, .chapter-num');
            if (h) return h.textContent.replace(/[\n\r]+/g, ' ').trim();
            if (element.classList && element.classList.contains('chapter-bhumika')) return 'भूमिका (Introduction)';
            return 'अध्याय खंड';
        }

        extractReadableText(container) {
            if (!container) return '';
            const clone = container.cloneNode(true);

            // Strip out non-educational elements: audio buttons, syllabus modals, images/svg, nav
            const removeSelectors = [
                '.tts-section-btn', '.tts-unit-btn', 'button', 'svg', 'figure',
                '.syllabus-modal-card', '.breadcrumb-container', '.nav-actions',
                'script', 'style', '.tts-ignore', '.content-only-exit-btn'
            ];
            removeSelectors.forEach(sel => {
                clone.querySelectorAll(sel).forEach(n => n.remove());
            });

            // Extract all paragraphs, headings, list items, definitions
            const readableBlocks = clone.querySelectorAll('h1, h2, h3, h4, p, li, .def-term, blockquote');
            if (readableBlocks.length > 0) {
                const texts = [];
                readableBlocks.forEach(b => {
                    const t = b.textContent.trim();
                    if (t) texts.push(t);
                });
                return texts.join('. ');
            }

            return clone.textContent.trim();
        }

        applyActiveHighlight(element) {
            this.clearActiveHighlight();
            if (!element) return;
            element.classList.add('tts-reading-active');
        }

        clearActiveHighlight() {
            document.querySelectorAll('.tts-reading-active').forEach(el => {
                el.classList.remove('tts-reading-active');
            });
        }

        scrollToElement(element) {
            if (!element) return;
            try {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {
                element.scrollIntoView(true);
            }
        }

        // ----------------------------------------------------------------------
        // UI SYNCHRONIZATION: BUTTONS & CONTROL BAR
        // ----------------------------------------------------------------------

        syncAllButtons() {
            // 1. Sync Section Buttons
            document.querySelectorAll('.tts-section-btn').forEach(btn => {
                const targetId = btn.getAttribute('data-tts-target');
                const isThisActive = (this.activeTargetId === targetId);

                btn.classList.remove('tts-btn-playing', 'tts-btn-paused');
                const icon = btn.querySelector('i');

                if (isThisActive && this.state === 'PLAYING') {
                    btn.classList.add('tts-btn-playing');
                    btn.setAttribute('title', 'रोकें (Pause)');
                    btn.setAttribute('aria-label', 'Pause audio');
                    if (icon) icon.className = 'fa-solid fa-pause';
                } else if (isThisActive && this.state === 'PAUSED') {
                    btn.classList.add('tts-btn-paused');
                    btn.setAttribute('title', 'पुनः चलाएं (Resume)');
                    btn.setAttribute('aria-label', 'Resume audio');
                    if (icon) icon.className = 'fa-solid fa-play';
                } else {
                    btn.setAttribute('title', 'यह भाग सुनें (Listen to Section)');
                    btn.setAttribute('aria-label', 'Listen to Section');
                    if (icon) icon.className = 'fa-solid fa-volume-high';
                }
            });

            // 2. Sync Unit Buttons
            document.querySelectorAll('.tts-unit-btn').forEach(btn => {
                const unitId = btn.getAttribute('data-unit-id');
                const isThisActive = (this.mode === 'unit' && this.currentUnitId === unitId);

                btn.classList.remove('tts-unit-playing', 'tts-unit-paused');
                const icon = btn.querySelector('i');
                const label = btn.querySelector('.tts-unit-btn-text');

                const isEnglish = document.documentElement.lang === 'en';

                if (isThisActive && this.state === 'PLAYING') {
                    btn.classList.add('tts-unit-playing');
                    if (icon) icon.className = 'fa-solid fa-pause';
                    if (label) label.textContent = isEnglish ? 'Pause Unit' : 'यूनिट रोकें';
                } else if (isThisActive && this.state === 'PAUSED') {
                    btn.classList.add('tts-unit-paused');
                    if (icon) icon.className = 'fa-solid fa-play';
                    if (label) label.textContent = isEnglish ? 'Resume Unit' : 'यूनिट जारी रखें';
                } else {
                    if (icon) icon.className = 'fa-solid fa-headphones';
                    if (label) label.textContent = isEnglish ? 'Listen to Entire Unit' : 'पूरी यूनिट सुनें';
                }
            });
        }

        updateControlBarUI() {
            const bar = document.getElementById('global-audio-bar');
            if (!bar) return;

            const isEnglish = document.documentElement.lang === 'en';

            if (this.state === 'IDLE') {
                bar.classList.add('bar-idle');
                bar.classList.remove('bar-active', 'bar-playing', 'bar-paused');
            } else {
                bar.classList.remove('bar-idle');
                bar.classList.add('bar-active');
                if (this.state === 'PLAYING') {
                    bar.classList.add('bar-playing');
                    bar.classList.remove('bar-paused');
                } else {
                    bar.classList.add('bar-paused');
                    bar.classList.remove('bar-playing');
                }
            }

            // Play/Pause button
            const playPauseBtn = document.getElementById('audio-bar-playpause');
            if (playPauseBtn) {
                const icon = playPauseBtn.querySelector('i');
                if (this.state === 'PLAYING') {
                    if (icon) icon.className = 'fa-solid fa-pause';
                    playPauseBtn.setAttribute('title', isEnglish ? 'Pause' : 'रोकें');
                } else {
                    if (icon) icon.className = 'fa-solid fa-play';
                    playPauseBtn.setAttribute('title', isEnglish ? 'Play / Resume' : 'चलाएं');
                }
            }

            // Current Titles
            const titleEl = document.getElementById('audio-bar-title');
            if (titleEl) {
                if (this.activeTargetTitle) {
                    titleEl.textContent = this.activeTargetTitle;
                } else {
                    titleEl.textContent = isEnglish ? 'Select a section to listen' : 'सुनने के लिए कोई अनुभाग चुनें';
                }
            }

            const metaEl = document.getElementById('audio-bar-meta');
            if (metaEl) {
                if (this.mode === 'unit') {
                    const total = this.unitSections.length;
                    const cur = this.unitSectionIndex + 1;
                    metaEl.textContent = `${this.currentUnitTitle} • ${isEnglish ? 'Section' : 'भाग'} ${cur}/${total}`;
                } else if (this.activeTargetTitle) {
                    metaEl.textContent = isEnglish ? 'Single Section Mode' : 'एकल अनुभाग वाचन';
                } else {
                    metaEl.textContent = isEnglish ? 'Ready' : 'तैयार';
                }
            }

            // Progress bar
            const progressFill = document.getElementById('audio-bar-progress-fill');
            if (progressFill) {
                let pct = 0;
                if (this.mode === 'unit' && this.unitSections.length > 0) {
                    pct = Math.round(((this.unitSectionIndex + 1) / this.unitSections.length) * 100);
                } else if (this.utteranceQueue.length > 0) {
                    pct = Math.round(((this.utteranceIndex + 1) / this.utteranceQueue.length) * 100);
                }
                progressFill.style.width = pct + '%';
            }

            // Speed pills
            document.querySelectorAll('.audio-speed-btn').forEach(btn => {
                const rateVal = parseFloat(btn.getAttribute('data-rate'));
                if (Math.abs(rateVal - this.rate) < 0.05) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Auto-scroll toggle
            const autoScrollBtn = document.getElementById('audio-bar-autoscroll');
            if (autoScrollBtn) {
                autoScrollBtn.classList.toggle('active', this.autoScrollEnabled);
                autoScrollBtn.setAttribute('title', this.autoScrollEnabled ? 
                    (isEnglish ? 'Auto-scroll is ON' : 'ऑटो-स्क्रॉल सक्रिय') : 
                    (isEnglish ? 'Auto-scroll is OFF' : 'ऑटो-स्क्रॉल निष्क्रिय'));
            }
        }

        showToast(msg) {
            const toast = document.createElement('div');
            toast.className = 'tts-toast';
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }
    }

    // --------------------------------------------------------------------------
    // 5. DOM INSTRUMENTATION (AUTO-INJECT SECTION & UNIT BUTTONS)
    // --------------------------------------------------------------------------
    function instrumentEducationalContent(controller) {
        const isEnglish = document.documentElement.lang === 'en';

        // 1. Inject Unit Listening Buttons in .unit-divider
        document.querySelectorAll('.unit-divider').forEach((divider, idx) => {
            if (divider.querySelector('.tts-unit-btn')) return;

            const unitId = divider.id || ('unit-divider-' + idx);
            if (!divider.id) divider.id = unitId;

            const unitBtn = document.createElement('button');
            unitBtn.className = 'tts-unit-btn';
            unitBtn.setAttribute('data-unit-id', unitId);
            unitBtn.setAttribute('type', 'button');
            unitBtn.setAttribute('aria-label', isEnglish ? 'Listen to Entire Unit' : 'पूरी यूनिट सुनें');
            unitBtn.innerHTML = `
                <i class="fa-solid fa-headphones"></i>
                <span class="tts-unit-btn-text">${isEnglish ? 'Listen to Entire Unit' : 'पूरी यूनिट सुनें'}</span>
            `;

            unitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                controller.playUnit(unitId, divider);
            });

            divider.appendChild(unitBtn);
        });

        // 2. Inject Section Buttons beside Chapter Introductions (.chapter-bhumika)
        document.querySelectorAll('.chapter-bhumika').forEach((bhumika, idx) => {
            if (bhumika.querySelector('.tts-section-btn')) return;

            const secId = bhumika.id || ('bhumika-' + idx);
            if (!bhumika.id) bhumika.id = secId;

            const btn = document.createElement('button');
            btn.className = 'tts-section-btn tts-btn-inline';
            btn.setAttribute('data-tts-target', secId);
            btn.setAttribute('type', 'button');
            btn.setAttribute('title', isEnglish ? 'Listen to Introduction' : 'भूमिका सुनें');
            btn.setAttribute('aria-label', isEnglish ? 'Listen to Introduction' : 'भूमिका सुनें');
            btn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                controller.playSection(secId, bhumika, isEnglish ? 'Chapter Introduction' : 'अध्याय भूमिका');
            });

            bhumika.insertAdjacentElement('afterbegin', btn);
        });

        // 3. Inject Section Buttons beside headings in section[id]
        document.querySelectorAll('section[id]').forEach(section => {
            const heading = section.querySelector('h2, h3');
            if (!heading || section.querySelector('.tts-section-btn')) return;

            const secId = section.id;
            const btn = document.createElement('button');
            btn.className = 'tts-section-btn';
            btn.setAttribute('data-tts-target', secId);
            btn.setAttribute('type', 'button');
            btn.setAttribute('title', isEnglish ? 'Listen to Section' : 'यह भाग सुनें');
            btn.setAttribute('aria-label', isEnglish ? 'Listen to Section' : 'यह भाग सुनें');
            btn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                controller.playSection(secId, section, heading.textContent.trim());
            });

            heading.appendChild(btn);
        });

        // 4. Inject Section Buttons inside Definitions (.book-definition)
        document.querySelectorAll('.book-definition').forEach((def, idx) => {
            const defTerm = def.querySelector('.def-term');
            if (!defTerm || def.querySelector('.tts-section-btn')) return;

            const defId = def.id || ('def-' + idx);
            if (!def.id) def.id = defId;

            const btn = document.createElement('button');
            btn.className = 'tts-section-btn tts-btn-sm';
            btn.setAttribute('data-tts-target', defId);
            btn.setAttribute('type', 'button');
            btn.setAttribute('title', isEnglish ? 'Listen to Definition' : 'परिभाषा सुनें');
            btn.setAttribute('aria-label', isEnglish ? 'Listen to Definition' : 'परिभाषा सुनें');
            btn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                controller.playSection(defId, def, defTerm.textContent.trim());
            });

            defTerm.appendChild(btn);
        });
    }

    // --------------------------------------------------------------------------
    // 6. COMPACT GLOBAL AUDIO CONTROL BAR & VOICE MODAL
    // --------------------------------------------------------------------------
    function renderGlobalControlBar(controller) {
        if (document.getElementById('global-audio-bar')) return;

        const isEnglish = document.documentElement.lang === 'en';

        const bar = document.createElement('div');
        bar.id = 'global-audio-bar';
        bar.className = 'global-audio-bar bar-idle';
        bar.setAttribute('role', 'region');
        bar.setAttribute('aria-label', isEnglish ? 'Audio Textbook Controller' : 'ऑडियो पाठ्यपुस्तक नियंत्रक');

        bar.innerHTML = `
            <div class="audio-bar-progress">
                <div class="audio-bar-progress-fill" id="audio-bar-progress-fill"></div>
            </div>
            <div class="audio-bar-container">
                <!-- Left: Status & Now Playing -->
                <div class="audio-bar-left">
                    <div class="audio-sound-wave" id="audio-sound-wave">
                        <span></span><span></span><span></span><span></span>
                    </div>
                    <div class="audio-info">
                        <div class="audio-title" id="audio-bar-title">${isEnglish ? 'Digital Textbook Audio' : 'डिजिटल पाठ्यपुस्तक ऑडियो'}</div>
                        <div class="audio-meta" id="audio-bar-meta">${isEnglish ? 'Ready' : 'तैयार'}</div>
                    </div>
                </div>

                <!-- Center: Navigation & Playback Controls -->
                <div class="audio-bar-center">
                    <button class="audio-btn" id="audio-bar-prev" title="${isEnglish ? 'Previous Section' : 'पिछला अनुभाग'}" aria-label="Previous">
                        <i class="fa-solid fa-backward-step"></i>
                    </button>
                    <button class="audio-btn audio-btn-play" id="audio-bar-playpause" title="${isEnglish ? 'Play / Pause' : 'चलाएं / रोकें'}" aria-label="Play or Pause">
                        <i class="fa-solid fa-play"></i>
                    </button>
                    <button class="audio-btn" id="audio-bar-stop" title="${isEnglish ? 'Stop Playback' : 'वाचन बंद करें'}" aria-label="Stop">
                        <i class="fa-solid fa-stop"></i>
                    </button>
                    <button class="audio-btn" id="audio-bar-next" title="${isEnglish ? 'Next Section' : 'अगला अनुभाग'}" aria-label="Next">
                        <i class="fa-solid fa-forward-step"></i>
                    </button>
                </div>

                <!-- Right: Speed, Auto-Scroll, Voices, Collapse -->
                <div class="audio-bar-right">
                    <!-- Playback Speed -->
                    <div class="audio-speed-group" title="${isEnglish ? 'Playback Speed' : 'वाचन गति'}">
                        <button class="audio-speed-btn" data-rate="0.75">0.75x</button>
                        <button class="audio-speed-btn active" data-rate="1">1x</button>
                        <button class="audio-speed-btn" data-rate="1.25">1.25x</button>
                        <button class="audio-speed-btn" data-rate="1.5">1.5x</button>
                        <button class="audio-speed-btn" data-rate="2">2x</button>
                    </div>

                    <!-- Auto-Scroll Toggle -->
                    <button class="audio-tool-btn active" id="audio-bar-autoscroll" title="${isEnglish ? 'Auto-scroll to reading text' : 'ऑटो-स्क्रॉल टॉगल'}">
                        <i class="fa-solid fa-arrows-down-to-line"></i>
                        <span class="tool-label">${isEnglish ? 'Scroll' : 'स्क्रॉल'}</span>
                    </button>

                    <!-- Voice Settings Modal Opener -->
                    <button class="audio-tool-btn" id="audio-bar-voices-btn" title="${isEnglish ? 'Voice Settings' : 'वॉयस सेटिंग्स'}">
                        <i class="fa-solid fa-sliders"></i>
                    </button>

                    <!-- Minimize / Expand -->
                    <button class="audio-tool-btn" id="audio-bar-toggle-min" title="${isEnglish ? 'Collapse / Expand' : 'छोटा / बड़ा करें'}">
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(bar);
        document.body.classList.add('has-global-audio-bar');

        // Event Listeners for Bar Controls
        document.getElementById('audio-bar-playpause').addEventListener('click', () => {
            if (controller.state === 'PLAYING') {
                controller.pause();
            } else if (controller.state === 'PAUSED') {
                controller.resume();
            } else {
                const firstUnit = document.querySelector('.unit-divider');
                if (firstUnit) {
                    controller.playUnit(firstUnit.id, firstUnit);
                }
            }
        });

        document.getElementById('audio-bar-stop').addEventListener('click', () => controller.stop());
        document.getElementById('audio-bar-prev').addEventListener('click', () => controller.prevSection());
        document.getElementById('audio-bar-next').addEventListener('click', () => controller.nextSection());

        document.querySelectorAll('.audio-speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const rate = btn.getAttribute('data-rate');
                controller.setRate(rate);
            });
        });

        document.getElementById('audio-bar-autoscroll').addEventListener('click', () => {
            controller.toggleAutoScroll();
        });

        document.getElementById('audio-bar-toggle-min').addEventListener('click', function(e) {
            e.stopPropagation();
            bar.classList.toggle('bar-minimized');
            document.body.classList.toggle('audio-bar-minimized', bar.classList.contains('bar-minimized'));
            const icon = this.querySelector('i');
            if (bar.classList.contains('bar-minimized')) {
                icon.className = 'fa-solid fa-chevron-up';
            } else {
                icon.className = 'fa-solid fa-chevron-down';
            }
        });

        // Tap anywhere on minimized bar to expand
        bar.addEventListener('click', function(e) {
            if (bar.classList.contains('bar-minimized')) {
                if (!e.target.closest('button')) {
                    bar.classList.remove('bar-minimized');
                    document.body.classList.remove('audio-bar-minimized');
                    const toggleBtn = document.getElementById('audio-bar-toggle-min');
                    if (toggleBtn) {
                        const icon = toggleBtn.querySelector('i');
                        if (icon) icon.className = 'fa-solid fa-chevron-down';
                    }
                }
            }
        });

        document.getElementById('audio-bar-voices-btn').addEventListener('click', () => {
            openVoiceSettingsModal(controller);
        });

        controller.voiceManager.onReady(() => {
            if (controller.voiceManager.hindiVoiceMissing && !sessionStorage.getItem('ba5_voice_warned')) {
                showVoiceNoticeBanner(isEnglish);
                sessionStorage.setItem('ba5_voice_warned', 'true');
            }
        });
    }

    function showVoiceNoticeBanner(isEnglish) {
        const banner = document.createElement('div');
        banner.className = 'tts-notice-banner';
        banner.innerHTML = `
            <div class="tts-notice-content">
                <i class="fa-solid fa-circle-info"></i>
                <span>${isEnglish ? 
                    'Notice: For the most natural Hindi voice, use Microsoft Edge or Google Chrome with Hindi speech pack.' : 
                    'सलाह: सर्वोत्तम हिंदी उच्चारण हेतु Microsoft Edge या Google Chrome का उपयोग करें जिसमें प्राकृतिक हिंदी वॉयस अंतर्निहित होती है।'}</span>
            </div>
            <button class="tts-notice-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);
        setTimeout(() => {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 400);
        }, 8000);
    }

    function openVoiceSettingsModal(controller) {
        let modal = document.getElementById('tts-voice-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'tts-voice-modal';
            modal.className = 'tts-voice-modal-overlay';
            document.body.appendChild(modal);
        }

        const isEnglish = document.documentElement.lang === 'en';
        const voices = controller.voiceManager.voices || [];
        const hiVoices = voices.filter(v => v.lang && v.lang.toLowerCase().includes('hi'));
        const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().includes('en'));

        const currentHi = controller.voiceManager.hindiVoice?.name || '';
        const currentEn = controller.voiceManager.englishVoice?.name || '';

        modal.innerHTML = `
            <div class="tts-voice-modal-card">
                <div class="tts-modal-header">
                    <h3><i class="fa-solid fa-sliders"></i> ${isEnglish ? 'Speech Voice Settings' : 'ऑडियो वॉयस सेटिंग्स'}</h3>
                    <button class="tts-modal-close" id="tts-voice-modal-close">&times;</button>
                </div>
                <div class="tts-modal-body">
                    <div class="tts-form-group">
                        <label><strong>${isEnglish ? 'Hindi Voice (हिंदी उच्चारण):' : 'हिंदी वॉयस (Hindi Voice):'}</strong></label>
                        <select id="tts-select-hindi" class="tts-select">
                            ${hiVoices.length > 0 ? 
                                hiVoices.map(v => `<option value="${v.name}" ${v.name === currentHi ? 'selected' : ''}>${v.name} (${v.lang})</option>`).join('') :
                                `<option value="">${isEnglish ? 'Default Browser Voice (No dedicated Hindi voice)' : 'डिफ़ॉल्ट सिस्टम वॉयस (हिंदी पैक अनुपलब्ध)'}</option>`
                            }
                        </select>
                    </div>

                    <div class="tts-form-group">
                        <label><strong>${isEnglish ? 'English Voice (अंग्रेजी उच्चारण):' : 'अंग्रेजी वॉयस (English Voice):'}</strong></label>
                        <select id="tts-select-english" class="tts-select">
                            ${enVoices.map(v => `<option value="${v.name}" ${v.name === currentEn ? 'selected' : ''}>${v.name} (${v.lang})</option>`).join('')}
                        </select>
                    </div>

                    <div class="tts-modal-tip">
                        <i class="fa-solid fa-lightbulb text-amber-500"></i>
                        <span>${isEnglish ? 
                            'Tip: Edge & Chrome offer "Natural" Microsoft and Google voices that sound like a real teacher.' : 
                            'सुझाव: Windows 10/11 में Microsoft Swara और Chrome में Google हिन्दी सबसे स्वाभाविक आवाज प्रदान करते हैं।'}</span>
                    </div>
                </div>
                <div class="tts-modal-footer">
                    <button class="nav-btn" id="tts-voice-save-btn" style="background:#1e3a8a; color:#fff; border:none; padding:0.5rem 1.25rem; border-radius:6px; cursor:pointer;">
                        ${isEnglish ? 'Save & Close' : 'सहेजें व बंद करें'}
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('show');

        const closeModal = () => modal.classList.remove('show');
        document.getElementById('tts-voice-modal-close').addEventListener('click', closeModal);
        document.getElementById('tts-voice-save-btn').addEventListener('click', () => {
            const hiVal = document.getElementById('tts-select-hindi').value;
            const enVal = document.getElementById('tts-select-english').value;
            if (hiVal) controller.voiceManager.setUserVoice('hi', hiVal);
            if (enVal) controller.voiceManager.setUserVoice('en', enVal);
            closeModal();
            controller.showToast(isEnglish ? 'Voice preferences updated.' : 'वॉयस प्राथमिकताएं सहेजी गईं।');
        });
    }

    // --------------------------------------------------------------------------
    // 7. INITIALIZATION ON DOM READY
    // --------------------------------------------------------------------------
    function init() {
        if (!('speechSynthesis' in window)) {
            console.warn('[AudioReader] Web Speech API not supported.');
            return;
        }

        const controller = new GlobalAudioController();
        window.__BA5_AUDIO_READER__ = controller;
        window.AudioReader = controller;

        const isBookPage = document.querySelector('.content-area, .book-page, .main-wrapper, .unit-divider');
        if (isBookPage) {
            instrumentEducationalContent(controller);
            renderGlobalControlBar(controller);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
