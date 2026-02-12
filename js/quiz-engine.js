// Reusable quiz engine for chapter quizzes
function QuizEngine(containerId, questions, chapterKey) {
    this.container = document.getElementById(containerId);
    this.questions = questions;
    this.chapterKey = chapterKey;
    this.currentIndex = 0;
    this.score = 0;
    this.answered = [];
    this.init();
}

QuizEngine.prototype.init = function () {
    this.render();
    this.showQuestion(0);
    this.updateProgress();
};

QuizEngine.prototype.render = function () {
    var html = '<div class="quiz-header">' +
        '<span class="quiz-progress-text" id="quizProgress">Question 1 of ' + this.questions.length + '</span>' +
        '<span class="quiz-score" id="quizScore">Score: 0 / ' + this.questions.length + '</span>' +
        '</div><div class="quiz-body">';

    for (var i = 0; i < this.questions.length; i++) {
        var q = this.questions[i];
        html += '<div class="quiz-question" id="q' + i + '">' +
            '<h3>Q' + (i + 1) + '. ' + q.question + '</h3>' +
            '<div class="quiz-options">';

        for (var j = 0; j < q.options.length; j++) {
            html += '<div class="quiz-option" data-q="' + i + '" data-opt="' + j + '">' +
                String.fromCharCode(65 + j) + '. ' + q.options[j] + '</div>';
        }

        html += '</div>' +
            '<div class="quiz-explanation" id="explanation' + i + '">' + q.explanation + '</div>' +
            '</div>';
    }

    html += '<div class="quiz-results" id="quizResults" style="display:none;">' +
        '<h3>Quiz Complete!</h3>' +
        '<div class="score-display" id="finalScore"></div>' +
        '<p id="finalMessage"></p>' +
        '<button class="btn btn-action" onclick="location.reload()">Retake Quiz</button>' +
        '</div></div>' +
        '<div class="quiz-footer">' +
        '<button class="btn btn-secondary" id="prevBtn" onclick="quiz.prev()">Previous</button>' +
        '<button class="btn btn-action" id="nextBtn" onclick="quiz.next()">Next</button>' +
        '</div>';

    this.container.innerHTML = html;

    // Attach click handlers to options
    var self = this;
    var options = this.container.querySelectorAll('.quiz-option');
    options.forEach(function (opt) {
        opt.addEventListener('click', function () {
            var qIdx = parseInt(this.getAttribute('data-q'));
            var oIdx = parseInt(this.getAttribute('data-opt'));
            self.selectAnswer(qIdx, oIdx);
        });
    });
};

QuizEngine.prototype.showQuestion = function (idx) {
    var allQ = this.container.querySelectorAll('.quiz-question');
    allQ.forEach(function (el) { el.classList.remove('active'); });

    var results = document.getElementById('quizResults');
    if (idx >= this.questions.length) {
        results.style.display = 'block';
        this.showResults();
        return;
    }

    results.style.display = 'none';
    allQ[idx].classList.add('active');
    this.currentIndex = idx;
    this.updateProgress();
    this.updateButtons();
};

QuizEngine.prototype.selectAnswer = function (qIdx, optIdx) {
    if (this.answered[qIdx] !== undefined) return;

    this.answered[qIdx] = optIdx;
    var q = this.questions[qIdx];
    var correct = q.answer;
    var options = this.container.querySelectorAll('[data-q="' + qIdx + '"]');
    var explanation = document.getElementById('explanation' + qIdx);

    options.forEach(function (opt) {
        opt.classList.add('disabled');
        var oi = parseInt(opt.getAttribute('data-opt'));
        if (oi === correct) {
            opt.classList.add('correct');
        } else if (oi === optIdx && optIdx !== correct) {
            opt.classList.add('incorrect');
        }
    });

    if (optIdx === correct) {
        this.score++;
        explanation.classList.add('correct');
    } else {
        explanation.classList.add('incorrect');
    }
    explanation.classList.add('show');

    document.getElementById('quizScore').textContent = 'Score: ' + this.score + ' / ' + this.questions.length;
};

QuizEngine.prototype.next = function () {
    if (this.currentIndex < this.questions.length) {
        this.showQuestion(this.currentIndex + 1);
    }
};

QuizEngine.prototype.prev = function () {
    if (this.currentIndex > 0) {
        this.showQuestion(this.currentIndex - 1);
    }
};

QuizEngine.prototype.updateProgress = function () {
    var el = document.getElementById('quizProgress');
    if (el && this.currentIndex < this.questions.length) {
        el.textContent = 'Question ' + (this.currentIndex + 1) + ' of ' + this.questions.length;
    }
};

QuizEngine.prototype.updateButtons = function () {
    var prev = document.getElementById('prevBtn');
    var next = document.getElementById('nextBtn');
    if (prev) prev.disabled = this.currentIndex === 0;
    if (next) next.textContent = this.currentIndex >= this.questions.length - 1 ? 'Finish' : 'Next';
};

QuizEngine.prototype.showResults = function () {
    var pct = Math.round((this.score / this.questions.length) * 100);
    var scoreEl = document.getElementById('finalScore');
    var msgEl = document.getElementById('finalMessage');

    scoreEl.textContent = pct + '%';
    scoreEl.className = 'score-display ' + (pct >= 70 ? 'pass' : 'fail');

    if (pct >= 70) {
        msgEl.textContent = 'You passed! You got ' + this.score + ' out of ' + this.questions.length + ' correct. (70% needed to pass)';
    } else {
        msgEl.textContent = 'You scored ' + this.score + ' out of ' + this.questions.length + '. You need 70% to pass. Review the material and try again!';
    }

    // Save progress
    if (typeof Progress !== 'undefined' && this.chapterKey) {
        Progress.saveQuizScore(this.chapterKey, this.score, this.questions.length);
    }

    // Hide footer
    this.container.querySelector('.quiz-footer').style.display = 'none';
};
