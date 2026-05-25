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
        try {
            var data = this.getAll();
            data[key] = value;
            localStorage.setItem(this.KEY, JSON.stringify(data));
        } catch (e) {
            // localStorage may be full or disabled (e.g., private browsing)
        }
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

    // Spaced Repetition (SM-2)
    getAllSRData: function () {
        return this.get('card_sr_data') || {};
    },

    getCardSRData: function (cardId) {
        var all = this.getAllSRData();
        var data = all[cardId];
        if (!data) {
            return { ef: 2.5, interval: 0, reps: 0, due: Date.now() };
        }
        return {
            ef: typeof data.ef === 'number' ? data.ef : 2.5,
            interval: typeof data.interval === 'number' ? data.interval : 0,
            reps: typeof data.reps === 'number' ? data.reps : 0,
            due: typeof data.due === 'number' ? data.due : Date.now()
        };
    },

    updateCardSR: function (cardId, quality) {
        var data = this.getCardSRData(cardId);
        var prevInterval = data.interval;

        if (quality < 3) {
            data.reps = 0;
            data.interval = 1;
        } else {
            data.reps = data.reps + 1;
            if (data.reps === 1) {
                data.interval = 1;
            } else if (data.reps === 2) {
                data.interval = 6;
            } else {
                data.interval = Math.round(prevInterval * data.ef);
                if (data.interval < 1) data.interval = 1;
            }
        }

        var newEf = data.ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
        if (newEf < 1.3) newEf = 1.3;
        data.ef = newEf;

        var msPerDay = 24 * 60 * 60 * 1000;
        data.due = Date.now() + data.interval * msPerDay;

        var all = this.getAllSRData();
        all[cardId] = data;
        this.set('card_sr_data', all);

        return data;
    },

    getDueCards: function (allCardIds) {
        var all = this.getAllSRData();
        var now = Date.now();
        var due = [];
        for (var i = 0; i < allCardIds.length; i++) {
            var id = allCardIds[i];
            var data = all[id];
            if (!data || typeof data.due !== 'number' || data.due <= now) {
                due.push(id);
            }
        }
        return due;
    },

    getSRStats: function () {
        var all = this.getAllSRData();
        var keys = Object.keys(all);
        var learning = 0;
        var mastered = 0;
        var now = Date.now();
        var dueCount = 0;
        for (var i = 0; i < keys.length; i++) {
            var d = all[keys[i]];
            var reps = typeof d.reps === 'number' ? d.reps : 0;
            var ef = typeof d.ef === 'number' ? d.ef : 2.5;
            if (reps > 0 && reps < 3) learning++;
            if (reps >= 3 && ef >= 2.5) mastered++;
            if (typeof d.due === 'number' && d.due <= now) dueCount++;
        }
        return {
            total: keys.length,
            due: dueCount,
            learning: learning,
            mastered: mastered
        };
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
