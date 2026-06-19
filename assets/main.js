// ===== Переключение темы (универсальный) =====
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    if (themeToggle && themeIcon) {
        // ВСЕГДА устанавливаем светлую тему
        document.documentElement.setAttribute('data-bs-theme', 'light');
        localStorage.setItem('theme', 'light');

        function updateThemeIcon(theme) {
            if (theme === 'dark') {
                themeIcon.innerHTML = `<path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>`;
                themeIcon.setAttribute('class', 'bi bi-brightness-high-fill');
            } else {
                themeIcon.innerHTML = `<path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>`;
                themeIcon.setAttribute('class', 'bi bi-moon-fill');
            }
        }

        updateThemeIcon('light');

        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-bs-theme');
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-bs-theme', next);
            localStorage.setItem('theme', next);
            updateThemeIcon(next);
        });
    }
});

// ===== Счётчик дней до ОГЭ =====
const daysLeft = document.getElementById('daysLeft');
if (daysLeft) {
    const examDate = new Date('2026-05-25');
    const today = new Date();
    const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    daysLeft.textContent = diff > 0 ? diff : 'сегодня!';
}

// ===== Калькулятор баллов =====
const calcRange = document.getElementById('calcRange');
const calcValue = document.getElementById('calcValue');
const calcResult = document.getElementById('calcResult');

if (calcRange) {
    const thresholds = [0, 5, 10, 15, 19];

    function updateCalc() {
        const val = parseInt(calcRange.value);
        calcValue.textContent = val;

        let grade = 2;
        if (val >= thresholds[3]) grade = 5;
        else if (val >= thresholds[2]) grade = 4;
        else if (val >= thresholds[1]) grade = 3;

        calcResult.textContent = grade;
        const colors = ['#c0392b', '#e8937a', '#f39c12', '#27ae60'];
        calcResult.style.color = grade >= 4 ? colors[grade-2] : colors[grade-2] || '#c0392b';
    }

    calcRange.addEventListener('input', updateCalc);
    updateCalc();
}

// ===== Трекер прогресса =====
const checklist = document.getElementById('checklist');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressEmoji = document.getElementById('progressEmoji');

if (checklist) {
    const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');
    const total = checkboxes.length;
    const STORAGE_KEY = 'info_progress';

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    checkboxes.forEach(cb => {
        const task = cb.dataset.task;
        if (saved[task]) cb.checked = true;
        cb.addEventListener('change', () => {
            const current = {};
            checkboxes.forEach(c => { current[c.dataset.task] = c.checked; });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
            updateProgress();
        });
    });

    function updateProgress() {
        const checked = checklist.querySelectorAll('input:checked').length;
        const percent = (checked / total) * 100;
        progressBar.style.width = percent + '%';
        progressText.textContent = `${checked} из ${total}`;

        let emoji = 'начинаем';
        if (percent === 100) emoji = 'ты молодец!';
        else if (percent >= 70) emoji = 'почти готов';
        else if (percent >= 40) emoji = 'хороший темп';
        else if (percent > 0) emoji = 'двигаемся';
        progressEmoji.textContent = emoji;
    }
    updateProgress();
}

// ===== Таймер Помодоро =====
const pomodoroDisplay = document.getElementById('pomodoroDisplay');
const pomodoroStart = document.getElementById('pomodoroStart');
const pomodoroReset = document.getElementById('pomodoroReset');
const modeBtns = document.querySelectorAll('.mode-btn');
const sessionCountEl = document.getElementById('sessionCount');

if (pomodoroDisplay) {
    let timeLeft = 25 * 60;
    let timerId = null;
    let currentMode = 'work';
    let sessions = parseInt(localStorage.getItem('info_sessions') || '0');
    sessionCountEl.textContent = sessions;

    const modes = {
        work: { time: 25 * 60, label: 'Работа' },
        break: { time: 5 * 60, label: 'Отдых' }
    };

    function formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateDisplay() {
        pomodoroDisplay.textContent = formatTime(timeLeft);
    }

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            timeLeft = modes[currentMode].time;
            clearInterval(timerId);
            timerId = null;
            pomodoroStart.textContent = 'Старт';
            updateDisplay();
        });
    });

    pomodoroStart.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            pomodoroStart.textContent = 'Старт';
        } else {
            pomodoroStart.textContent = 'Пауза';
            timerId = setInterval(() => {
                timeLeft--;
                updateDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerId);
                    timerId = null;
                    pomodoroStart.textContent = 'Старт';
                    if (currentMode === 'work') {
                        sessions++;
                        localStorage.setItem('info_sessions', sessions);
                        sessionCountEl.textContent = sessions;
                        alert('Отличная работа! Время отдохнуть 5 минут.');
                    } else {
                        alert('Отдохнули? Пора за работу!');
                    }
                    timeLeft = modes[currentMode].time;
                    updateDisplay();
                }
            }, 1000);
        }
    });

    pomodoroReset.addEventListener('click', () => {
        clearInterval(timerId);
        timerId = null;
        timeLeft = modes[currentMode].time;
        pomodoroStart.textContent = 'Старт';
        updateDisplay();
    });

    updateDisplay();
}

// ===== Табы расписания =====
const scheduleTabs = document.querySelectorAll('#scheduleTabs .nav-link');
const planBlocks = document.querySelectorAll('.plan-block');

scheduleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        scheduleTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        planBlocks.forEach(block => {
            block.classList.add('d-none');
            if (block.id === target) block.classList.remove('d-none');
        });
    });
});

// ===== Поиск по FAQ =====
const faqSearch = document.getElementById('faqSearch');
if (faqSearch) {
    const items = document.querySelectorAll('#faqAccordion .accordion-item');
    faqSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// ===== Кнопка наверх =====
const toTopBtn = document.getElementById('toTop');
if (toTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) toTopBtn.classList.add('visible');
        else toTopBtn.classList.remove('visible');
    });
    toTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== Закрытие меню при клике =====
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const collapse = document.getElementById('mainNav');
        if (collapse && collapse.classList.contains('show')) {
            const bs = bootstrap.Collapse.getInstance(collapse);
            if (bs) bs.hide();
        }
    });
});

// ===== Активная ссылка в меню =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.split('/').pop();
    if (linkFile === currentPage) link.classList.add('active');
    else if (currentPage === '' && linkFile === 'index.html') link.classList.add('active');
});