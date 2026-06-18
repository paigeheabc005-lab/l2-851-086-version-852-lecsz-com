(function () {
    var ready = function (callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    };

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
                menuButton.setAttribute('aria-expanded', mobileNav.classList.contains('is-open') ? 'true' : 'false');
            });
        }

        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
            });
        });

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var previous = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                    dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
                });
            };

            var start = function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            };

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    start();
                });
            });

            if (previous) {
                previous.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }

            if (slides.length > 1) {
                show(0);
                start();
            }
        }

        var filterRoot = document.querySelector('[data-filter-root]');
        if (filterRoot) {
            var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
            var yearSelect = filterRoot.querySelector('[data-filter-year]');
            var regionSelect = filterRoot.querySelector('[data-filter-region]');
            var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
            var empty = filterRoot.querySelector('[data-empty-state]');

            var normalize = function (text) {
                return (text || '').toString().trim().toLowerCase();
            };

            var apply = function () {
                var keyword = normalize(keywordInput && keywordInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-tags'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (region && cardRegion !== region) {
                        matched = false;
                    }

                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            };

            [keywordInput, yearSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        }
    });
})();
