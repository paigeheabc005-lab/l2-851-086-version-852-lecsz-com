(function () {
    const site = {};

    site.initNavigation = function () {
        const toggle = document.querySelector(".menu-toggle");
        const menu = document.querySelector("#mobile-menu");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            const isOpen = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    };

    site.initHeroCarousel = function () {
        const carousel = document.querySelector("[data-hero-carousel]");

        if (!carousel) {
            return;
        }

        const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
        const prev = carousel.querySelector("[data-hero-prev]");
        const next = carousel.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                const active = slideIndex === index;
                slide.classList.toggle("active", active);
                slide.setAttribute("aria-hidden", String(!active));
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    };

    site.initCardFilters = function () {
        const inputs = Array.from(document.querySelectorAll("[data-card-filter], [data-page-search]"));

        if (!inputs.length) {
            return;
        }

        const cards = Array.from(document.querySelectorAll(".searchable-grid .movie-card"));
        const emptyState = document.querySelector("[data-empty-state]");

        function apply(value) {
            const query = value.trim().toLowerCase();
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = (card.getAttribute("data-search") || "").toLowerCase();
                const matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";

        inputs.forEach(function (input) {
            if (query && input.hasAttribute("data-page-search")) {
                input.value = query;
            }

            input.addEventListener("input", function () {
                apply(input.value);
            });
        });

        if (query) {
            apply(query);
        }
    };

    site.initMoviePlayer = function (options) {
        const video = document.getElementById(options.videoId);
        const overlay = document.getElementById(options.overlayId);
        const streamUrl = options.streamUrl;
        let loaded = false;
        let hls = null;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function playVideo() {
            overlay.classList.add("is-hidden");
            video.controls = true;
            const promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        function loadStream() {
            if (loaded) {
                playVideo();
                return;
            }

            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                return;
            }

            video.src = streamUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
            playVideo();
        }

        overlay.addEventListener("click", loadStream);
        video.addEventListener("click", function () {
            if (video.paused) {
                loadStream();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        site.initNavigation();
        site.initHeroCarousel();
        site.initCardFilters();
    });

    window.MovieSite = site;
})();
