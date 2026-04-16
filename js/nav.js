// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    var dropdowns = document.querySelectorAll('.dropdown');

    if (!navLinks) return;

    if (toggle) {
        toggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
    }

    // Mobile dropdown toggle
    dropdowns.forEach(function (dd) {
        var link = dd.querySelector('a');
        if (link) {
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dd.classList.toggle('open');
                }
            });
        }
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768 && !link.parentElement.classList.contains('dropdown')) {
                navLinks.classList.remove('open');
            }
        });
    });
});
