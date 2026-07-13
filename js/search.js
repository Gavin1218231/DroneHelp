// Client-side search across pages, topics, and flashcards.
// Loads a curated index plus the flashcard data, then does simple
// token-based ranking. ES5 style: var + function () {}.
(function () {
    'use strict';

    var CATEGORY_LABELS = {
        regulations: 'Regulations',
        airspace: 'Airspace',
        weather: 'Weather',
        loading: 'Loading & Performance',
        operations: 'Operations'
    };

    var entries = [];   // combined searchable entries
    var ready = false;
    var pendingQuery = null;

    var inputEl, resultsEl, countEl, statusEl;

    function normalize(s) {
        return (s || '').toLowerCase();
    }

    function toFlashcardEntries(cards) {
        var out = [];
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            var label = CATEGORY_LABELS[c.category] || c.category;
            out.push({
                title: c.front,
                type: 'Flashcard — ' + label,
                url: 'flashcards.html',
                snippet: c.back,
                keywords: normalize(c.front + ' ' + c.back + ' ' + c.category + ' flashcard'),
                _search: normalize(c.front + ' ' + c.back + ' ' + c.category)
            });
        }
        return out;
    }

    function prepIndexEntries(idx) {
        for (var i = 0; i < idx.length; i++) {
            var e = idx[i];
            e._search = normalize((e.title || '') + ' ' + (e.keywords || '') + ' ' + (e.snippet || ''));
        }
        return idx;
    }

    function score(entry, tokens) {
        // Require every token to appear somewhere; rank by field weight.
        var title = normalize(entry.title);
        var kw = normalize(entry.keywords);
        var total = 0;
        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (entry._search.indexOf(t) === -1) return 0; // AND semantics
            if (title.indexOf(t) !== -1) total += 3;
            else if (kw.indexOf(t) !== -1) total += 2;
            else total += 1;
            // Small bonus for whole-word title match
            if (title.indexOf(' ' + t + ' ') !== -1 || title.indexOf(t + ' ') === 0) total += 1;
        }
        return total;
    }

    function search(query) {
        var q = normalize(query).replace(/[^a-z0-9\s]/g, ' ').trim();
        if (!q) return [];
        var tokens = q.split(/\s+/);
        var scored = [];
        for (var i = 0; i < entries.length; i++) {
            var s = score(entries[i], tokens);
            if (s > 0) scored.push({ e: entries[i], s: s });
        }
        scored.sort(function (a, b) { return b.s - a.s; });
        return scored.slice(0, 60);
    }

    function escapeHtml(s) {
        return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function truncate(s, n) {
        s = s || '';
        return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
    }

    function render(results, query) {
        if (!resultsEl) return;
        if (!query) {
            resultsEl.innerHTML = '';
            if (countEl) countEl.textContent = '';
            return;
        }
        if (results.length === 0) {
            resultsEl.innerHTML = '<p class="search-empty">No results for &ldquo;' +
                escapeHtml(query) + '&rdquo;. Try a different term such as &ldquo;airspace&rdquo;, &ldquo;METAR&rdquo;, or &ldquo;load factor&rdquo;.</p>';
            if (countEl) countEl.textContent = '';
            return;
        }
        if (countEl) {
            countEl.textContent = results.length + (results.length === 1 ? ' result' : ' results');
        }
        var html = '<ul class="search-results">';
        for (var i = 0; i < results.length; i++) {
            var e = results[i].e;
            html += '<li class="search-result">' +
                '<a href="' + e.url + '">' +
                '<div class="search-result-head">' +
                '<span class="search-result-title">' + escapeHtml(e.title) + '</span>' +
                '<span class="search-result-type">' + escapeHtml(e.type) + '</span>' +
                '</div>' +
                '<p class="search-result-snippet">' + escapeHtml(truncate(e.snippet, 160)) + '</p>' +
                '</a></li>';
        }
        html += '</ul>';
        resultsEl.innerHTML = html;
    }

    var debounceTimer = null;
    function onInput() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(run, 120);
    }

    function run() {
        var query = inputEl ? inputEl.value : '';
        if (!ready) { pendingQuery = query; return; }
        render(search(query), query.trim());
        // Keep the URL shareable
        try {
            var url = query.trim()
                ? (location.pathname + '?q=' + encodeURIComponent(query.trim()))
                : location.pathname;
            history.replaceState(null, '', url);
        } catch (e) { /* ignore */ }
    }

    function getParam(name) {
        var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
        return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
    }

    function loadData() {
        if (typeof fetch !== 'function') {
            if (statusEl) statusEl.textContent = 'Search is not supported in this browser.';
            return;
        }
        Promise.all([
            fetch('data/search-index.json').then(function (r) { return r.ok ? r.json() : []; }),
            fetch('data/flashcards.json').then(function (r) { return r.ok ? r.json() : []; })
        ]).then(function (res) {
            entries = prepIndexEntries(res[0] || []).concat(toFlashcardEntries(res[1] || []));
            ready = true;
            if (statusEl) statusEl.textContent = '';
            if (pendingQuery !== null) { run(); pendingQuery = null; }
        }).catch(function (e) {
            if (statusEl) statusEl.textContent = 'Could not load search data. Please reload the page.';
            console.log('Search data load failed:', e);
        });
    }

    function init() {
        inputEl = document.getElementById('searchInput');
        resultsEl = document.getElementById('searchResults');
        countEl = document.getElementById('searchCount');
        statusEl = document.getElementById('searchStatus');
        if (!inputEl) return;

        inputEl.addEventListener('input', onInput);

        var initial = getParam('q');
        if (initial) inputEl.value = initial;
        if (statusEl) statusEl.textContent = 'Loading search index…';
        loadData();
        inputEl.focus();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
