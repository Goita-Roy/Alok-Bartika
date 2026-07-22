// GLOBAL PORTAL SYSTEM - BEGINEER.JS

const PortalSystem = {
    // 1. PROGRESS STATE MANAGEMENT
    progressKey: 'capstone_python_progress',

    init() {
        this.loadProgress();
        this.setupTheme();
        this.setupVoiceTutor();
        this.syncUI();
    },

    loadProgress() {
        const stored = localStorage.getItem(this.progressKey);
        this.progress = stored ? JSON.parse(stored) : {
            // Chapter 1 Sub-classes
            c1_basic: 'not-started',
            c1_setting_up: 'not-started',
            c1_pattern: 'not-started',
            c1_initials: 'not-started',
            c1_snail_mail: 'not-started',
            // Chapter 2 Sub-classes
            c2_basic: 'not-started',
            c2_data_types: 'not-started',
            c2_temperature: 'not-started',
            c2_bmi: 'not-started',
            c2_pythagorean: 'not-started',
            c2_currency: 'not-started',
            // Chapter 3 Sub-classes
            c3_basic: 'not-started',
            c3_syntax_error: 'not-started',
            c3_name_error: 'not-started',
            c3_type_error: 'not-started',
            // Chapter 4 Sub-classes
            c4_basic: 'not-started',
            c4_enter_pin: 'not-started',
            c4_guess_number: 'not-started',
            c4_99_bottles: 'not-started',
            // Chapter 5 Sub-classes
            c5_basic: 'not-started',
            c5_grocery: 'not-started',
            c5_todo: 'not-started',
            c5_inventory: 'not-started',
            // Chapter 6 Sub-classes
            c6_basic: 'not-started',
            c6_dry: 'not-started',
            c6_mars_orbiter: 'not-started',
            c6_calculator: 'not-started',
            // Chapter 7 Sub-classes
            c7_basic: 'not-started',
            c7_restaurants: 'not-started',
            c7_favorite_cities: 'not-started',
            c7_bank_accounts: 'not-started',
            // Chapter 8 Sub-classes
            c8_basic: 'not-started',
            c8_slot_machine: 'not-started',
            c8_countdown: 'not-started',
            c8_zen_of_python: 'not-started'
        };
    },

    saveProgress() {
        localStorage.setItem(this.progressKey, JSON.stringify(this.progress));
        this.syncUI();
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'CAPSTONE_PROGRESS_UPDATED',
                progress: this.progress
            }, '*');
        }
    },

    updateProgress(subclassId, state) {
        if (this.progress[subclassId] !== undefined) {
            this.progress[subclassId] = state;
            this.saveProgress();
            
            if (state === 'completed') {
                this.celebrate();
                this.tutorSpeak("সাবাশ! তুমি এই পার্টটি সফলভাবে সম্পন্ন করেছ!");
            }
        }
    },

    getChapterCompletedPercent(chapterNum) {
        const chapterSubclasses = {
            1: ['c1_basic', 'c1_setting_up', 'c1_pattern', 'c1_initials', 'c1_snail_mail'],
            2: ['c2_basic', 'c2_data_types', 'c2_temperature', 'c2_bmi', 'c2_pythagorean', 'c2_currency'],
            3: ['c3_basic', 'c3_syntax_error', 'c3_name_error', 'c3_type_error'],
            4: ['c4_basic', 'c4_enter_pin', 'c4_guess_number', 'c4_99_bottles'],
            5: ['c5_basic', 'c5_grocery', 'c5_todo', 'c5_inventory'],
            6: ['c6_basic', 'c6_dry', 'c6_mars_orbiter', 'c6_calculator'],
            7: ['c7_basic', 'c7_restaurants', 'c7_favorite_cities', 'c7_bank_accounts'],
            8: ['c8_basic', 'c8_slot_machine', 'c8_countdown', 'c8_zen_of_python']
        };

        const keys = chapterSubclasses[chapterNum] || [];
        if (keys.length === 0) return 0;

        const completedCount = keys.filter(k => this.progress[k] === 'completed').length;
        return Math.round((completedCount / keys.length) * 100);
    },

    syncUI() {
        // Sync interactive cards on Chapter pages
        const cards = document.querySelectorAll('[data-subclass-id]');
        cards.forEach(card => {
            const subclassId = card.getAttribute('data-subclass-id');
            let state = this.progress[subclassId] || 'not-started';
            
            // Set class - NO LOCKING SYSTEM
            card.className = `subclass-card ${state}`;
            
            // All cards are always clickable and visible
            card.style.pointerEvents = 'auto';
            card.style.opacity = '1';
            
            // Set badge
            const badge = card.querySelector('.badge');
            if (badge) {
                badge.className = `badge ${state}`;
                badge.innerHTML = this.getBadgeHTML(state);
            }
        });

        // Sync Chapter meters on index.html
        for (let i = 1; i <= 8; i++) {
            const percent = this.getChapterCompletedPercent(i);
            const fill = document.getElementById(`chapter-${i}-fill`);
            const label = document.getElementById(`chapter-${i}-percent`);
            if (fill) fill.style.width = `${percent}%`;
            if (label) label.innerText = `${percent}% Completed`;
        }

        // Sync overall progress if present
        const overallPercent = this.getOverallPercent();
        const overallFill = document.getElementById('overall-progress-fill');
        const overallText = document.getElementById('overall-progress-text');
        if (overallFill) overallFill.style.width = `${overallPercent}%`;
        if (overallText) overallText.innerText = `${overallPercent}%`;
    },

    getBadgeHTML(state) {
        switch (state) {
            case 'completed': return '<span>✅</span> Completed';
            case 'in-progress': return '<span>⚡</span> In Progress';
            default: return '<span>📓</span> Available';
        }
    },

    getOverallPercent() {
        const total = Object.keys(this.progress).length;
        const completed = Object.values(this.progress).filter(v => v === 'completed').length;
        return Math.round((completed / total) * 100);
    },

    // 2. THEME SYSTEM
    setupTheme() {
        const theme = localStorage.getItem('capstone_theme') || 'dark';
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        }

        // Add theme change button logic if available
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.innerText = theme === 'light' ? '☀️' : '🌙';
            themeBtn.addEventListener('click', () => {
                const currentLight = document.body.classList.toggle('light-mode');
                const newTheme = currentLight ? 'light' : 'dark';
                localStorage.setItem('capstone_theme', newTheme);
                themeBtn.innerText = currentLight ? '☀️' : '🌙';
                this.tutorSpeak(currentLight ? "লাইট মোড চালু করা হলো" : "ডার্ক মোড চালু করা হলো");
            });
        }
    },

    // 3. TUTOR BOT (VOICE)
    setupVoiceTutor() {
        this.voiceActive = localStorage.getItem('capstone_voice_bot') === 'true';
        const botBtn = document.getElementById('voice-bot-btn');
        if (botBtn) {
            if (this.voiceActive) botBtn.classList.add('active');
            botBtn.addEventListener('click', () => {
                this.voiceActive = !this.voiceActive;
                localStorage.setItem('capstone_voice_bot', this.voiceActive);
                if (this.voiceActive) {
                    botBtn.classList.add('active');
                    this.tutorSpeak("হ্যালো! আমি তোমার পাইথন টিউটর বট। যেকোনো টেক্সটে ক্লিক করলেই আমি সেটি পড়ে শোনাবো।");
                } else {
                    botBtn.classList.remove('active');
                    window.speechSynthesis.cancel();
                }
            });
        }

        // Global click speech reading
        document.addEventListener('click', (e) => {
            if (!this.voiceActive) return;
            const target = e.target;
            if (target.innerText && !['BUTTON', 'INPUT', 'A', 'TEXTAREA'].includes(target.tagName) && target.innerText.length < 300) {
                this.tutorSpeak(target.innerText);
            }
        });
    },

    tutorSpeak(text) {
        if (!this.voiceActive) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'bn-BD';
        
        // Find Bengali voice if exists, otherwise defaults
        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find(v => v.lang.includes('bn'));
        if (bnVoice) utterance.voice = bnVoice;
        
        window.speechSynthesis.speak(utterance);
    },

    // 4. CELEBRATION EFFECTS
    celebrate() {
        const count = 200;
        const defaults = { origin: { y: 0.7 } };

        function fire(particleRatio, opts) {
            if (typeof confetti === 'function') {
                confetti(Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(count * particleRatio)
                }));
            } else {
                // Inline pure CSS fallback celebration
                const bubble = document.createElement('div');
                bubble.style.position = 'fixed';
                bubble.style.bottom = '10%';
                bubble.style.left = '50%';
                bubble.style.transform = 'translateX(-50%)';
                bubble.style.background = '#10b981';
                bubble.style.color = '#fff';
                bubble.style.padding = '12px 24px';
                bubble.style.borderRadius = '30px';
                bubble.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
                bubble.style.zIndex = '9999';
                bubble.style.fontSize = '1.2rem';
                bubble.style.fontWeight = 'bold';
                bubble.innerHTML = '🎉 দারুণ কাজ করেছ! +১০ এক্সপি';
                document.body.appendChild(bubble);
                setTimeout(() => bubble.remove(), 2500);
            }
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Inject Canvas Confetti Script if not loaded
    if (!window.confetti) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        document.head.appendChild(script);
    }
    PortalSystem.init();
});