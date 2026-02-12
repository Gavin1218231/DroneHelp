// Progress tracking via localStorage
var Progress = {
    KEY: 'part107_progress',

    getAll: function () {
        try {
            return JSON.parse(localStorage.getItem(this.KEY)) || {};
        } catch (e) {
            return {};
        }
    },

    get: function (key) {
        return this.getAll()[key];
    },

    set: function (key, value) {
        var data = this.getAll();
        data[key] = value;
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },

    // Chapter completion
    markChapterRead: function (chapter) {
        this.set('chapter_' + chapter + '_read', true);
    },

    isChapterRead: function (chapter) {
        return !!this.get('chapter_' + chapter + '_read');
    },

    getChaptersCompleted: function () {
        var chapters = ['regulations', 'airspace', 'weather', 'loading-performance', 'operations'];
        var count = 0;
        for (var i = 0; i < chapters.length; i++) {
            if (this.isChapterRead(chapters[i])) count++;
        }
        return count;
    },

    // Quiz scores
    saveQuizScore: function (chapter, score, total) {
        var scores = this.get('quiz_scores') || {};
        scores[chapter] = { score: score, total: total, pct: Math.round((score / total) * 100) };
        this.set('quiz_scores', scores);
    },

    getQuizAverage: function () {
        var scores = this.get('quiz_scores') || {};
        var keys = Object.keys(scores);
        if (keys.length === 0) return null;
        var sum = 0;
        for (var i = 0; i < keys.length; i++) {
            sum += scores[keys[i]].pct;
        }
        return Math.round(sum / keys.length);
    },

    // Flashcards
    getMasteredCards: function () {
        return this.get('mastered_cards') || [];
    },

    toggleMastered: function (cardId) {
        var mastered = this.getMasteredCards();
        var idx = mastered.indexOf(cardId);
        if (idx >= 0) {
            mastered.splice(idx, 1);
        } else {
            mastered.push(cardId);
        }
        this.set('mastered_cards', mastered);
        return mastered;
    },

    // Exam attempts
    saveExamAttempt: function (score, total) {
        var attempts = this.get('exam_attempts') || [];
        attempts.push({
            score: score,
            total: total,
            pct: Math.round((score / total) * 100),
            date: new Date().toISOString()
        });
        this.set('exam_attempts', attempts);
    },

    getExamAttempts: function () {
        return this.get('exam_attempts') || [];
    },

    // Dashboard update
    updateDashboard: function () {
        var chaptersEl = document.getElementById('chaptersCompleted');
        var quizEl = document.getElementById('quizAverage');
        var flashEl = document.getElementById('flashcardsMastered');
        var examEl = document.getElementById('examsTaken');

        if (chaptersEl) chaptersEl.textContent = this.getChaptersCompleted() + ' / 5';
        if (quizEl) {
            var avg = this.getQuizAverage();
            quizEl.textContent = avg !== null ? avg + '%' : '--';
        }
        if (flashEl) flashEl.textContent = this.getMasteredCards().length;
        if (examEl) examEl.textContent = this.getExamAttempts().length;
    }
};

// Update dashboard on load if on index page
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('progressDashboard')) {
        Progress.updateDashboard();
    }
});
