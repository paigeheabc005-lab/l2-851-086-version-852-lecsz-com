(function () {
    var header = document.querySelector('[data-site-header]');
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    var backTop = document.querySelector('[data-back-top]');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (navToggle && mobilePanel) {
        navToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('is-visible', window.scrollY > 360);
        }, { passive: true });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('active', thumbIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('mouseenter', function () {
                showSlide(Number(thumb.getAttribute('data-hero-thumb')) || 0);
                stopTimer();
            });
            thumb.addEventListener('mouseleave', startTimer);
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var categoryButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-category]'));
            var status = scope.querySelector('[data-filter-status]');
            var grid = scope.parentElement ? scope.parentElement.parentElement.querySelector('[data-card-grid]') : null;
            if (!grid) {
                grid = document.querySelector('[data-card-grid]');
            }
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
            var activeCategory = 'all';

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardCategory = card.getAttribute('data-category') || '';
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
                    var visible = matchesKeyword && matchesCategory;
                    card.classList.toggle('is-hidden', !visible);
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (status) {
                    status.textContent = visibleCount > 0 ? '筛选结果已更新' : '没有匹配结果';
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }

            categoryButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeCategory = button.getAttribute('data-filter-category') || 'all';
                    categoryButtons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    applyFilter();
                });
            });

            applyFilter();
        });
    }

    setupHero();
    setupFilters();
})();
