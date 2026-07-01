// Dashboard analytics — reads Progress data and renders charts/recommendations.
// ES5 style: var + function () {}, no arrow funcs, no frameworks.

var Dashboard = {
    // Chapter ids (keys used in Progress.saveQuizScore) mapped to display labels and study links.
    CHAPTERS: [
        { id: 'regulations',         label: 'Regulations',           href: 'chapters/regulations.html' },
        { id: 'airspace',            label: 'Airspace',              href: 'chapters/airspace.html' },
        { id: 'weather',             label: 'Weather',               href: 'chapters/weather.html' },
        { id: 'loading-performance', label: 'Loading & Performance', href: 'chapters/loading-performance.html' },
        { id: 'operations',          label: 'Operations',            href: 'chapters/operations.html' }
    ],

    // Total flashcards available — used to estimate mastery percentage.
    // Loaded dynamically from data/flashcards.json (see init); the value
    // here is a fallback if the fetch fails.
    TOTAL_FLASHCARDS: 130,

    // Threshold below which we recommend more exam practice (avg of last 3 attempts).
    RECENT_AVG_THRESHOLD: 85,

    init: function () {
        var self = this;
        // Derive the real flashcard count so mastery math stays accurate as
        // cards are added/removed, then render. Falls back to the constant.
        if (typeof fetch === 'function') {
            fetch('data/flashcards.json')
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (data) {
                    if (data && data.length) self.TOTAL_FLASHCARDS = data.length;
                })
                .catch(function () { /* keep fallback constant */ })
                .then(function () { self.render(); });
        } else {
            self.render();
        }
    },

    render: function () {
        this.renderHeaderStats();
        this.renderTrend();
        this.renderStrengthBreakdown();
        this.renderRecommendations();
        this.renderActivity();
        this.bindReset();
    },

    // ---------- Header stat cards ----------
    renderHeaderStats: function () {
        // Reuse Progress.updateDashboard since the same element IDs are present.
        if (typeof Progress !== 'undefined' && typeof Progress.updateDashboard === 'function') {
            Progress.updateDashboard();
        }
    },

    // ---------- Exam score trend (inline SVG) ----------
    renderTrend: function () {
        var container = document.getElementById('trendArea');
        if (!container) return;

        var attempts = Progress.getExamAttempts();
        if (attempts.length < 2) {
            container.innerHTML = '<div class="empty-state">Take 2+ practice exams to see your trend.</div>';
            return;
        }

        // Build an inline SVG line chart of pct over attempts.
        var width = 600;
        var height = 220;
        var padLeft = 40;
        var padRight = 20;
        var padTop = 20;
        var padBottom = 32;
        var plotW = width - padLeft - padRight;
        var plotH = height - padTop - padBottom;

        var n = attempts.length;
        var xStep = n > 1 ? plotW / (n - 1) : 0;

        // Y axis: always 0-100 so colors/positions are predictable.
        var yToPx = function (pct) {
            return padTop + plotH - (pct / 100) * plotH;
        };

        // Gridlines + axis labels at 0, 25, 50, 70 (passing), 100.
        var gridValues = [0, 25, 50, 70, 100];
        var gridSvg = '';
        for (var g = 0; g < gridValues.length; g++) {
            var gy = yToPx(gridValues[g]);
            gridSvg += '<line class="gridline" x1="' + padLeft + '" y1="' + gy + '" x2="' + (padLeft + plotW) + '" y2="' + gy + '" />';
            gridSvg += '<text class="axis-label" x="' + (padLeft - 6) + '" y="' + (gy + 3) + '" text-anchor="end">' + gridValues[g] + '%</text>';
        }

        // Path + dots.
        var pathParts = [];
        var dotsSvg = '';
        for (var i = 0; i < n; i++) {
            var x = padLeft + i * xStep;
            var y = yToPx(attempts[i].pct);
            pathParts.push((i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1));
            dotsSvg += '<circle class="trend-dot" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4">';
            dotsSvg += '<title>Attempt ' + (i + 1) + ': ' + attempts[i].pct + '%</title>';
            dotsSvg += '</circle>';
        }

        // X axis attempt labels (skip some if too dense).
        var xLabelSvg = '';
        var labelEvery = n <= 10 ? 1 : Math.ceil(n / 10);
        for (var j = 0; j < n; j++) {
            if (j % labelEvery !== 0 && j !== n - 1) continue;
            var lx = padLeft + j * xStep;
            xLabelSvg += '<text class="axis-label" x="' + lx + '" y="' + (height - 10) + '" text-anchor="middle">#' + (j + 1) + '</text>';
        }

        var svg = '<svg class="trend-chart" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Exam score trend">';
        svg += gridSvg;
        svg += '<line class="axis" x1="' + padLeft + '" y1="' + (padTop + plotH) + '" x2="' + (padLeft + plotW) + '" y2="' + (padTop + plotH) + '" />';
        svg += '<path class="trend-line" d="' + pathParts.join(' ') + '" />';
        svg += dotsSvg;
        svg += xLabelSvg;
        svg += '</svg>';

        // Summary text under the chart.
        var first = attempts[0].pct;
        var last = attempts[n - 1].pct;
        var delta = last - first;
        var deltaText;
        if (delta > 0) {
            deltaText = '<span style="color:var(--secondary);font-weight:600;">+' + delta + ' points</span>';
        } else if (delta < 0) {
            deltaText = '<span style="color:var(--accent);font-weight:600;">' + delta + ' points</span>';
        } else {
            deltaText = '<span style="font-weight:600;">unchanged</span>';
        }
        var summary = '<p style="margin-top:12px;font-size:0.9rem;color:var(--text-light);">' +
            'First attempt: ' + first + '%, latest: ' + last + '% (' + deltaText + ' over ' + n + ' attempts)</p>';

        container.innerHTML = svg + summary;
    },

    // ---------- Chapter strength breakdown ----------
    renderStrengthBreakdown: function () {
        var container = document.getElementById('strengthArea');
        if (!container) return;

        var scores = (Progress.get('quiz_scores')) || {};
        var rows = [];
        for (var i = 0; i < this.CHAPTERS.length; i++) {
            var ch = this.CHAPTERS[i];
            var s = scores[ch.id];
            rows.push({
                id: ch.id,
                label: ch.label,
                href: ch.href,
                pct: s ? s.pct : null,
                hasScore: !!s
            });
        }

        // Sort weakest first: chapters without scores go to the top (they need attention too),
        // followed by lowest pct, then highest.
        rows.sort(function (a, b) {
            if (!a.hasScore && !b.hasScore) return 0;
            if (!a.hasScore) return -1;
            if (!b.hasScore) return 1;
            return a.pct - b.pct;
        });

        var html = '';
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            if (!row.hasScore) {
                html += '<div class="strength-row">' +
                    '<div class="strength-info">' +
                        '<span class="strength-name"><a href="' + row.href + '">' + row.label + '</a></span>' +
                        '<span class="strength-score">Not yet attempted</span>' +
                    '</div>' +
                    '<div class="strength-track"><div class="strength-fill none"></div></div>' +
                '</div>';
            } else {
                var cls = row.pct < 70 ? 'low' : (row.pct < 90 ? 'mid' : 'high');
                html += '<div class="strength-row">' +
                    '<div class="strength-info">' +
                        '<span class="strength-name"><a href="' + row.href + '">' + row.label + '</a></span>' +
                        '<span class="strength-score">' + row.pct + '%</span>' +
                    '</div>' +
                    '<div class="strength-track"><div class="strength-fill ' + cls + '" style="width:' + row.pct + '%"></div></div>' +
                '</div>';
            }
        }

        container.innerHTML = html;
    },

    // ---------- Weak-area recommendations ----------
    renderRecommendations: function () {
        var container = document.getElementById('recArea');
        if (!container) return;

        var recs = [];
        var scores = (Progress.get('quiz_scores')) || {};
        var attempts = Progress.getExamAttempts();
        var mastered = Progress.getMasteredCards();
        var chaptersDone = Progress.getChaptersCompleted();

        // 1. Weakest chapter recommendation (only if at least one chapter has a score).
        var lowestChapter = null;
        var lowestPct = 101;
        for (var i = 0; i < this.CHAPTERS.length; i++) {
            var ch = this.CHAPTERS[i];
            var s = scores[ch.id];
            if (s && s.pct < lowestPct) {
                lowestPct = s.pct;
                lowestChapter = ch;
            }
        }
        if (lowestChapter && lowestPct < 90) {
            recs.push({
                priority: lowestPct < 70,
                text: 'Your weakest chapter is <strong>' + lowestChapter.label + ' (' + lowestPct + '%)</strong> — ' +
                      '<a href="' + lowestChapter.href + '">review the chapter slides and retake the quiz</a>.'
            });
        }

        // 2. No exam attempts yet.
        if (attempts.length === 0) {
            recs.push({
                priority: true,
                text: 'You haven\'t taken any practice exams yet — <a href="practice-exam.html">try one</a> to identify gaps before test day.'
            });
        }

        // 3. Low flashcard mastery (< 30% of available cards).
        var masteryPct = this.TOTAL_FLASHCARDS > 0 ? (mastered.length / this.TOTAL_FLASHCARDS) * 100 : 0;
        if (masteryPct < 30) {
            recs.push({
                priority: false,
                text: 'Your flashcard mastery is low (<strong>' + mastered.length + ' / ' + this.TOTAL_FLASHCARDS + '</strong>) — ' +
                      '<a href="flashcards.html">try Spaced Review mode</a> to lock in the facts.'
            });
        }

        // 4. Last-3-attempts average < 85%.
        if (attempts.length >= 1) {
            var lastN = attempts.slice(Math.max(0, attempts.length - 3));
            var sum = 0;
            for (var k = 0; k < lastN.length; k++) sum += lastN[k].pct;
            var recentAvg = Math.round(sum / lastN.length);
            if (recentAvg < this.RECENT_AVG_THRESHOLD && attempts.length >= 1) {
                recs.push({
                    priority: recentAvg < 70,
                    text: 'Your last ' + lastN.length + ' practice exam' + (lastN.length === 1 ? '' : 's') +
                          ' averaged <strong>' + recentAvg + '%</strong>, below the 85% confidence target — ' +
                          '<a href="practice-exam.html">take another</a> to keep building stamina.'
                });
            }
        }

        // 5. No chapters marked read yet (gentle nudge for fresh users).
        if (chaptersDone === 0 && attempts.length === 0 && mastered.length === 0) {
            recs.push({
                priority: false,
                text: 'No study activity recorded yet. <a href="index.html#chapters">Start with Chapter 1: Regulations</a> to build a foundation.'
            });
        }

        // Trim to a maximum of 4 recommendations, priority-first.
        recs.sort(function (a, b) { return (b.priority ? 1 : 0) - (a.priority ? 1 : 0); });
        if (recs.length > 4) recs = recs.slice(0, 4);

        if (recs.length === 0) {
            container.innerHTML = '<li class="success">Great work! All quiz scores are 90%+, recent exam scores are strong, and your flashcard mastery is on track. Keep practicing to stay sharp before test day.</li>';
            return;
        }

        var html = '';
        for (var r = 0; r < recs.length; r++) {
            html += '<li' + (recs[r].priority ? ' class="priority"' : '') + '>' + recs[r].text + '</li>';
        }
        container.innerHTML = html;
    },

    // ---------- Recent activity log ----------
    renderActivity: function () {
        var container = document.getElementById('activityArea');
        if (!container) return;

        var attempts = Progress.getExamAttempts();
        if (attempts.length === 0) {
            container.innerHTML = '<li><span class="empty-state" style="padding:0;">No practice exams taken yet. <a href="practice-exam.html">Take your first practice exam</a>.</span></li>';
            return;
        }

        // Last 5 attempts, newest first.
        var recent = attempts.slice(Math.max(0, attempts.length - 5)).reverse();
        var html = '';
        for (var i = 0; i < recent.length; i++) {
            var a = recent[i];
            var dateStr = this.formatDate(a.date);
            var passCls = a.pct >= 70 ? 'pass' : 'fail';
            html += '<li>' +
                '<span><strong>' + a.score + ' / ' + a.total + '</strong> ' +
                '<span class="activity-date">— ' + dateStr + '</span></span>' +
                '<span class="activity-score ' + passCls + '">' + a.pct + '%</span>' +
            '</li>';
        }
        container.innerHTML = html;
    },

    formatDate: function (iso) {
        if (!iso) return '';
        try {
            var d = new Date(iso);
            if (isNaN(d.getTime())) return iso;
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var hh = d.getHours();
            var mm = d.getMinutes();
            var ampm = hh >= 12 ? 'PM' : 'AM';
            var hh12 = hh % 12;
            if (hh12 === 0) hh12 = 12;
            var mmStr = mm < 10 ? '0' + mm : '' + mm;
            return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() +
                ' at ' + hh12 + ':' + mmStr + ' ' + ampm;
        } catch (e) {
            return iso;
        }
    },

    // ---------- Reset progress ----------
    bindReset: function () {
        var btn = document.getElementById('resetBtn');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var confirmed = window.confirm(
                'Reset all progress?\n\n' +
                'This will permanently delete:\n' +
                '  - Chapter completion marks\n' +
                '  - Quiz scores\n' +
                '  - Flashcard mastery & spaced-repetition data\n' +
                '  - Practice exam history\n\n' +
                'This action cannot be undone.'
            );
            if (!confirmed) return;
            try {
                localStorage.removeItem('part107_progress');
            } catch (e) {
                // ignore (private browsing, etc.)
            }
            window.location.reload();
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    Dashboard.init();
});
