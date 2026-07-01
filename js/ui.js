// Site-wide UI enhancements: theme toggle, back-to-top, offline banner.
// Injects its own controls so every page only needs to include this script.
(function () {
    'use strict';

    var THEME_KEY = 'part107_theme';

    // ----- Theme -----
    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            // localStorage may be unavailable (private mode) — theme still applies for the session
        }
        updateToggleIcon(theme);
    }

    function updateToggleIcon(theme) {
        var btn = document.getElementById('themeToggle');
        if (!btn) return;
        var dark = theme === 'dark';
        // Show the icon for the action the user can take.
        btn.innerHTML = dark ? '☀️' : '🌙';
        btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    function injectThemeToggle() {
        var navLinks = document.querySelector('.nav-links');
        if (!navLinks || document.getElementById('themeToggle')) return;
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.id = 'themeToggle';
        btn.className = 'theme-toggle';
        btn.type = 'button';
        li.appendChild(btn);
        navLinks.appendChild(li);
        btn.addEventListener('click', function () {
            applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
        });
        updateToggleIcon(currentTheme());
    }

    // ----- Search link (injected so it appears on every page) -----
    function injectSearchLink() {
        var navLinks = document.querySelector('.nav-links');
        if (!navLinks || document.getElementById('navSearchLink')) return;
        var path = location.pathname;
        var prefix = /\/(chapters|tools)\//.test(path) ? '../' : '';
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.id = 'navSearchLink';
        a.href = prefix + 'search.html';
        a.textContent = 'Search';
        // Mark active if we're on the search page
        if (/search\.html$/.test(path)) a.className = 'active';
        li.appendChild(a);
        navLinks.appendChild(li);
    }

    // ----- Back to top -----
    function injectBackToTop() {
        if (document.querySelector('.back-to-top')) return;
        var btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = '↑';
        document.body.appendChild(btn);

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        var ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                if (window.pageYOffset > 400) {
                    btn.classList.add('visible');
                } else {
                    btn.classList.remove('visible');
                }
                ticking = false;
            });
        }
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ----- Offline banner -----
    function injectOfflineBanner() {
        if (document.querySelector('.offline-banner')) return;
        var banner = document.createElement('div');
        banner.className = 'offline-banner';
        banner.setAttribute('role', 'status');
        banner.textContent = 'You are offline — viewing cached content.';
        document.body.appendChild(banner);

        function update() {
            if (navigator.onLine) {
                banner.classList.remove('show');
            } else {
                banner.classList.add('show');
            }
        }
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        update();
    }

    function init() {
        injectSearchLink();
        injectThemeToggle();
        injectBackToTop();
        injectOfflineBanner();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
