/* ==========================================================================
   B.A. 5TH SEMESTER DIGITAL TEXTBOOK - QUIZ ENGINE & INTERACTIVE CONTROLLER
   ========================================================================== */

let quizState = {
    subjectKey: null,
    questions: [],
    currentIndex: 0,
    answers: {}, // index -> { selected: number|null, isCorrect: boolean, isSkipped: boolean, submitted: boolean }
    completedCount: 0,
    startTime: null,
    endTime: null
};

document.addEventListener('DOMContentLoaded', () => {
    initQuizPortal();
});

function initQuizPortal() {
    // Esc key handler to exit quiz overlay if open
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('quiz-view-overlay');
            if (overlay && overlay.classList.contains('active')) {
                if (confirm('Kya aap quiz se bahar nikalna chahte hain? Aapka current progress lost ho jayega.')) {
                    closeQuizOverlay();
                }
            }
        }
    });
}

/* Open Pre-Quiz Start Modal for a subject */
function startSubjectQuiz(subjectKey) {
    if (!quizData[subjectKey]) {
        alert('Iss subject ka quiz data prepare ho raha hai...');
        return;
    }

    const data = quizData[subjectKey];
    quizState.subjectKey = subjectKey;
    quizState.questions = data.questions;
    quizState.currentIndex = 0;
    quizState.answers = {};
    quizState.completedCount = 0;
    quizState.startTime = null;
    quizState.endTime = null;

    // Populate Pre-Start Screen Modal
    const preTitle = document.getElementById('quiz-pre-title');
    const preSub = document.getElementById('quiz-pre-subtitle');
    const preIcon = document.getElementById('quiz-pre-icon');
    
    if (preTitle) preTitle.textContent = data.title;
    if (preSub) preSub.textContent = data.subjectName;
    if (preIcon) preIcon.className = `${data.icon} text-3xl`;

    const preModal = document.getElementById('quiz-pre-modal-overlay');
    if (preModal) {
        preModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeQuizPreModal() {
    const preModal = document.getElementById('quiz-pre-modal-overlay');
    if (preModal) {
        preModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* Launch Live Quiz Overlay */
function launchLiveQuiz() {
    closeQuizPreModal();
    quizState.startTime = Date.now();

    const quizOverlay = document.getElementById('quiz-view-overlay');
    if (quizOverlay) {
        quizOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Reset view to Question Screen
    showQuizScreen('question-screen');
    renderQuestion(0);
}

function closeQuizOverlay() {
    const quizOverlay = document.getElementById('quiz-view-overlay');
    if (quizOverlay) {
        quizOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showQuizScreen(screenId) {
    const screens = ['question-screen', 'milestone-screen', 'result-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === screenId) ? 'block' : 'none';
    });
}

/* Render single MCQ question */
function renderQuestion(index) {
    if (index < 0 || index >= quizState.questions.length) return;

    quizState.currentIndex = index;
    const q = quizState.questions[index];
    const userAns = quizState.answers[index];

    // Live Progress Updates
    updateLiveProgressUI();

    // Question Difficulty Badge
    const diffBadge = document.getElementById('quiz-diff-badge');
    if (diffBadge) {
        if (q.difficulty === 'easy') {
            diffBadge.className = 'quiz-badge badge-easy';
            diffBadge.innerHTML = `<i class="fa-solid fa-seedling"></i> AASAN LEVEL (Q1 - Q25)`;
        } else if (q.difficulty === 'normal') {
            diffBadge.className = 'quiz-badge badge-normal';
            diffBadge.innerHTML = `<i class="fa-solid fa-fire text-amber-500"></i> NORMAL LEVEL (Q26 - Q50)`;
        } else if (q.difficulty === 'medium') {
            diffBadge.className = 'quiz-badge badge-medium';
            diffBadge.innerHTML = `<i class="fa-solid fa-bolt text-orange-500"></i> MEDIUM LEVEL (Q51 - Q75)`;
        } else {
            diffBadge.className = 'quiz-badge badge-hard';
            diffBadge.innerHTML = `<i class="fa-solid fa-skull text-red-500"></i> TOUGH LEVEL (Q76 - Q100)`;
        }
    }

    // Question Text
    const qText = document.getElementById('quiz-question-text');
    if (qText) qText.textContent = `Q${q.num}. ${q.q}`;

    // Options Container
    const optionsContainer = document.getElementById('quiz-options-container');
    if (optionsContainer) {
        optionsContainer.innerHTML = q.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
            let classNames = 'quiz-option-btn';
            
            if (userAns && userAns.submitted) {
                if (optIdx === q.correct) {
                    classNames += ' correct-opt';
                } else if (userAns.selected === optIdx) {
                    classNames += ' wrong-opt';
                }
            } else if (userAns && userAns.selected === optIdx) {
                classNames += ' selected-opt';
            }

            return `
                <button type="button" class="${classNames}" onclick="selectQuizOption(${optIdx})" ${userAns && userAns.submitted ? 'disabled' : ''}>
                    <span class="opt-letter">${letter}</span>
                    <span class="opt-text">${opt}</span>
                </button>
            `;
        }).join('');
    }

    // Immediate Explanation & Feedback Box
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const submitBtn = document.getElementById('quiz-submit-btn');
    const nextBtn = document.getElementById('quiz-next-btn');

    if (userAns && userAns.submitted) {
        if (feedbackBox) {
            feedbackBox.style.display = 'block';
            const userLetter = userAns.selected !== null ? String.fromCharCode(65 + userAns.selected) : 'Answer Nahi Diya';
            const correctLetter = String.fromCharCode(65 + q.correct);
            
            let statusText = '';
            if (userAns.isSkipped) {
                statusText = `<span class="badge-skipped"><i class="fa-solid fa-circle-minus"></i> Skip Kiya</span>`;
            } else if (userAns.isCorrect) {
                statusText = `<span class="badge-correct"><i class="fa-solid fa-circle-check"></i> Sahi Jawab!</span>`;
            } else {
                statusText = `<span class="badge-wrong"><i class="fa-solid fa-circle-xmark"></i> Galat Jawab!</span>`;
            }

            feedbackBox.innerHTML = `
                <div class="feedback-header">
                    ${statusText}
                    <div class="text-sm font-semibold mt-1">
                        <span>Aapka Jawab: <strong>${userLetter}</strong></span>
                        <span class="ml-4">Sahi Jawab: <strong class="text-emerald-500">${correctLetter}</strong></span>
                    </div>
                </div>
                <div class="feedback-why">
                    <strong><i class="fa-solid fa-lightbulb text-amber-400"></i> Explanation (Kyun?):</strong>
                    <p class="mt-1 hindi-text">${q.why}</p>
                </div>
            `;
        }
        if (submitBtn) submitBtn.style.display = 'none';
        if (nextBtn) {
            nextBtn.style.display = 'inline-flex';
            if (index === 99) {
                nextBtn.innerHTML = `Quiz Finish Karein & Result Dekhein <i class="fa-solid fa-trophy ml-2 text-amber-400"></i>`;
            } else if (index === 24 || index === 49 || index === 74) {
                nextBtn.innerHTML = `Milestone Dekhein & Agle Level Par Chalein <i class="fa-solid fa-arrow-right ml-2"></i>`;
            } else {
                nextBtn.innerHTML = `Agla Sawal <i class="fa-solid fa-arrow-right ml-2"></i>`;
            }
        }
    } else {
        if (feedbackBox) feedbackBox.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-flex';
        if (nextBtn) nextBtn.style.display = 'none';
    }
}

/* User selects option A, B, C, D */
function selectQuizOption(optIdx) {
    const curIdx = quizState.currentIndex;
    if (quizState.answers[curIdx] && quizState.answers[curIdx].submitted) return;

    quizState.answers[curIdx] = {
        selected: optIdx,
        isCorrect: false,
        isSkipped: false,
        submitted: false
    };

    // Update selected styling immediately
    const optionBtns = document.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach((btn, idx) => {
        btn.classList.toggle('selected-opt', idx === optIdx);
    });
}

/* Submit Answer & Reveal Immediate Explanation */
function submitQuizAnswer() {
    const curIdx = quizState.currentIndex;
    const q = quizState.questions[curIdx];
    let userAns = quizState.answers[curIdx];

    if (!userAns || userAns.selected === undefined || userAns.selected === null) {
        // Mark as skipped if student submits without selecting
        userAns = {
            selected: null,
            isCorrect: false,
            isSkipped: true,
            submitted: true
        };
        quizState.answers[curIdx] = userAns;
    } else {
        userAns.isCorrect = (userAns.selected === q.correct);
        userAns.isSkipped = false;
        userAns.submitted = true;
    }

    quizState.completedCount = Object.keys(quizState.answers).filter(k => quizState.answers[k].submitted).length;

    // Re-render current question with feedback
    renderQuestion(curIdx);
}

/* Handle Next Question Click */
function handleNextQuestion() {
    const curIdx = quizState.currentIndex;

    // Check for Milestone Animations at 25, 50, 75
    if (curIdx === 24) {
        showMilestoneScreen(25, "🎉 Great Progress!", "Aapne sabhi 25 Aasan Sawal complete kar liye!", "Normal Level me aapka swagat hai");
        return;
    } else if (curIdx === 49) {
        showMilestoneScreen(50, "🔥 Halfway Complete!", "50 Sawal safaltapurvak poore ho gaye!", "Medium Level me aapka swagat hai");
        return;
    } else if (curIdx === 74) {
        showMilestoneScreen(75, "⚡ Behtareen Performance!", "75 Sawal poore ho chuke hain!", "Tough Level me aapka swagat hai");
        return;
    } else if (curIdx === 99) {
        // Quiz Complete
        finishQuizAndShowResults();
        return;
    }

    renderQuestion(curIdx + 1);
}

/* Show Milestone Celebration Animation Screen */
function showMilestoneScreen(count, heading, subtitle, nextMsg) {
    showQuizScreen('milestone-screen');

    const mHeading = document.getElementById('milestone-heading');
    const mSub = document.getElementById('milestone-subtitle');
    const mNext = document.getElementById('milestone-next-msg');
    const mCount = document.getElementById('milestone-count-text');

    if (mHeading) mHeading.textContent = heading;
    if (mSub) mSub.textContent = subtitle;
    if (mNext) mNext.textContent = nextMsg;
    if (mCount) mCount.textContent = `${count} / 100 Questions Completed`;
}

function continueFromMilestone() {
    showQuizScreen('question-screen');
    renderQuestion(quizState.currentIndex + 1);
}

/* Live Progress UI Updates */
function updateLiveProgressUI() {
    const curNum = quizState.currentIndex + 1;
    const completed = quizState.completedCount;
    const remaining = 100 - completed;
    const percent = Math.round((completed / 100) * 100);

    const liveNum = document.getElementById('quiz-live-num');
    const liveComp = document.getElementById('quiz-live-completed');
    const liveRem = document.getElementById('quiz-live-remaining');
    const progressBar = document.getElementById('quiz-live-bar');

    if (liveNum) liveNum.textContent = `Question ${curNum} of 100`;
    if (liveComp) liveComp.textContent = `${completed} / 100 Completed`;
    if (liveRem) liveRem.textContent = `${remaining} Remaining`;
    if (progressBar) progressBar.style.width = `${percent}%`;

    // Difficulty breakdown progress
    let easyComp = 0, normComp = 0, medComp = 0, hardComp = 0;

    for (let i = 0; i < 100; i++) {
        if (quizState.answers[i] && quizState.answers[i].submitted) {
            if (i < 25) easyComp++;
            else if (i < 50) normComp++;
            else if (i < 75) medComp++;
            else hardComp++;
        }
    }

    const elEasy = document.getElementById('quiz-prog-easy');
    const elNorm = document.getElementById('quiz-prog-norm');
    const elMed = document.getElementById('quiz-prog-med');
    const elHard = document.getElementById('quiz-prog-hard');

    if (elEasy) elEasy.textContent = `Easy: ${easyComp} / 25`;
    if (elNorm) elNorm.textContent = `Normal: ${normComp} / 25`;
    if (elMed) elMed.textContent = `Medium: ${medComp} / 25`;
    if (elHard) elHard.textContent = `Hard: ${hardComp} / 25`;
}

/* Finish Quiz & Render Complete Results Dashboard */
function finishQuizAndShowResults() {
    quizState.endTime = Date.now();
    showQuizScreen('result-screen');

    let totalCorrect = 0;
    let totalWrong = 0;
    let totalSkipped = 0;

    let diffStats = {
        easy: { correct: 0, wrong: 0, skipped: 0 },
        normal: { correct: 0, wrong: 0, skipped: 0 },
        medium: { correct: 0, wrong: 0, skipped: 0 },
        hard: { correct: 0, wrong: 0, skipped: 0 }
    };

    for (let i = 0; i < 100; i++) {
        const q = quizState.questions[i];
        const ans = quizState.answers[i];
        const tier = q.difficulty;

        if (!ans || !ans.submitted || ans.isSkipped) {
            totalSkipped++;
            diffStats[tier].skipped++;
        } else if (ans.isCorrect) {
            totalCorrect++;
            diffStats[tier].correct++;
        } else {
            totalWrong++;
            diffStats[tier].wrong++;
        }
    }

    const accuracy = Math.round((totalCorrect / 100) * 100);

    // Overall Score Dashboard Elements
    const resScore = document.getElementById('res-score');
    const resAccuracy = document.getElementById('res-accuracy');
    const resCorrect = document.getElementById('res-correct');
    const resWrong = document.getElementById('res-wrong');
    const resSkipped = document.getElementById('res-skipped');

    if (resScore) resScore.textContent = `${totalCorrect} / 100`;
    if (resAccuracy) resAccuracy.textContent = `${accuracy}%`;
    if (resCorrect) resCorrect.textContent = totalCorrect;
    if (resWrong) resWrong.textContent = totalWrong;
    if (resSkipped) resSkipped.textContent = totalSkipped;

    // Populate Difficulty Breakdown Table
    const diffTableBody = document.getElementById('res-diff-table-body');
    if (diffTableBody) {
        diffTableBody.innerHTML = `
            <tr>
                <td><strong class="text-emerald-500">🟢 Easy</strong></td>
                <td>25</td>
                <td class="text-emerald-600 font-bold">${diffStats.easy.correct}</td>
                <td class="text-red-500 font-bold">${diffStats.easy.wrong}</td>
                <td class="text-subtle font-bold">${diffStats.easy.skipped}</td>
            </tr>
            <tr>
                <td><strong class="text-amber-500">🟡 Normal</strong></td>
                <td>25</td>
                <td class="text-emerald-600 font-bold">${diffStats.normal.correct}</td>
                <td class="text-red-500 font-bold">${diffStats.normal.wrong}</td>
                <td class="text-subtle font-bold">${diffStats.normal.skipped}</td>
            </tr>
            <tr>
                <td><strong class="text-orange-500">🟠 Medium</strong></td>
                <td>25</td>
                <td class="text-emerald-600 font-bold">${diffStats.medium.correct}</td>
                <td class="text-red-500 font-bold">${diffStats.medium.wrong}</td>
                <td class="text-subtle font-bold">${diffStats.medium.skipped}</td>
            </tr>
            <tr>
                <td><strong class="text-red-500">🔴 Hard</strong></td>
                <td>25</td>
                <td class="text-emerald-600 font-bold">${diffStats.hard.correct}</td>
                <td class="text-red-500 font-bold">${diffStats.hard.wrong}</td>
                <td class="text-subtle font-bold">${diffStats.hard.skipped}</td>
            </tr>
        `;
    }

    // Render Full 100 Question Review List
    renderCompleteReviewList('all');
}

/* Render Complete 100 Question Review List with Filter */
function renderCompleteReviewList(filter = 'all') {
    const container = document.getElementById('res-review-container');
    if (!container) return;

    let reviewHtml = '';

    for (let i = 0; i < 100; i++) {
        const q = quizState.questions[i];
        const ans = quizState.answers[i];

        let isCorrect = false;
        let isSkipped = false;
        let userLetter = 'Not Answered';

        if (!ans || !ans.submitted || ans.isSkipped) {
            isSkipped = true;
        } else {
            isCorrect = ans.isCorrect;
            userLetter = ans.selected !== null ? String.fromCharCode(65 + ans.selected) : 'Not Answered';
        }

        if (filter === 'correct' && !isCorrect) continue;
        if (filter === 'wrong' && (isCorrect || isSkipped)) continue;
        if (filter === 'skipped' && !isSkipped) continue;

        const correctLetter = String.fromCharCode(65 + q.correct);
        let badgeHtml = '';
        let cardBorderClass = '';

        if (isSkipped) {
            badgeHtml = `<span class="quiz-badge badge-skipped"><i class="fa-solid fa-circle-minus"></i> ⭕ Skipped</span>`;
            cardBorderClass = 'border-subtle';
        } else if (isCorrect) {
            badgeHtml = `<span class="quiz-badge badge-correct"><i class="fa-solid fa-circle-check"></i> ✅ Correct</span>`;
            cardBorderClass = 'border-success';
        } else {
            badgeHtml = `<span class="quiz-badge badge-wrong"><i class="fa-solid fa-circle-xmark"></i> ❌ Wrong</span>`;
            cardBorderClass = 'border-danger';
        }

        reviewHtml += `
            <div class="review-card ${cardBorderClass}">
                <div class="review-card-header">
                    <span class="text-sm font-bold">Q${q.num}. (${q.difficulty.toUpperCase()})</span>
                    ${badgeHtml}
                </div>
                <div class="review-question-text">
                    ${q.q}
                </div>
                <div class="review-answers-grid">
                    <div>Your Answer: <strong class="${isCorrect ? 'text-emerald-500' : (isSkipped ? 'text-subtle' : 'text-red-500')}">${userLetter} ${isCorrect ? '✅' : (isSkipped ? '⭕' : '❌')}</strong></div>
                    <div>Correct Answer: <strong class="text-emerald-500">${correctLetter} ✅ (${q.options[q.correct]})</strong></div>
                </div>
                <div class="review-explanation">
                    <strong><i class="fa-solid fa-lightbulb text-amber-400"></i> Why? Explanation:</strong>
                    <p class="hindi-text text-sm mt-1">${q.why}</p>
                </div>
            </div>
        `;
    }

    if (reviewHtml === '') {
        reviewHtml = `<div class="p-4 text-center text-subtle">No questions found matching this filter.</div>`;
    }

    container.innerHTML = reviewHtml;
}

function filterReviewList(type, btnElement) {
    const btns = document.querySelectorAll('.review-filter-btn');
    btns.forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    renderCompleteReviewList(type);
}
