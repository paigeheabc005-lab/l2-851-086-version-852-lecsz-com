(function () {
    function setupPlayer(card) {
        var video = card.querySelector('video[data-src]');
        var playButton = card.querySelector('[data-player-play]');
        var playerBox = card.querySelector('[data-player-box]');
        if (!video || !playButton || !playerBox) {
            return;
        }
        var source = video.getAttribute('data-src');
        var hasLoaded = false;
        var hlsInstance = null;

        function loadSource() {
            if (hasLoaded || !source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            hasLoaded = true;
        }

        function playVideo() {
            loadSource();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(function () {
                    playButton.classList.add('is-hidden');
                }).catch(function () {
                    playButton.classList.remove('is-hidden');
                });
            } else {
                playButton.classList.add('is-hidden');
            }
        }

        playButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            playVideo();
        });

        playerBox.addEventListener('click', function (event) {
            if (event.target === video || event.target.closest('[data-player-play]')) {
                return;
            }
            playVideo();
        });

        video.addEventListener('play', function () {
            playButton.classList.add('is-hidden');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                playButton.classList.remove('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            playButton.classList.remove('is-hidden');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player-card]')).forEach(setupPlayer);
    });
})();
