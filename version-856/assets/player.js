(function () {
    var ready = function (callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    };

    ready(function () {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var startButton = player.querySelector('[data-play-button]');
            var toggleButton = player.querySelector('[data-toggle-play]');
            var muteButton = player.querySelector('[data-toggle-mute]');
            var fullButton = player.querySelector('[data-fullscreen]');
            var errorBox = player.querySelector('[data-player-error]');
            var stream = video ? video.getAttribute('data-stream') : '';
            var engine = null;
            var attached = false;

            if (!video || !stream) {
                return;
            }

            var showError = function () {
                if (errorBox) {
                    errorBox.hidden = false;
                }
            };

            var attach = function () {
                if (attached) {
                    return;
                }
                attached = true;

                if (window.Hls && window.Hls.isSupported()) {
                    engine = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    engine.loadSource(stream);
                    engine.attachMedia(video);
                    engine.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                engine.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                engine.recoverMediaError();
                            } else {
                                showError();
                                engine.destroy();
                            }
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    showError();
                }
            };

            var update = function () {
                player.classList.toggle('is-playing', !video.paused && !video.ended);
                if (toggleButton) {
                    toggleButton.textContent = video.paused ? '播放' : '暂停';
                }
                if (muteButton) {
                    muteButton.textContent = video.muted ? '静音' : '声音';
                }
            };

            var play = function () {
                attach();
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(showError);
                }
            };

            var toggle = function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            };

            if (startButton) {
                startButton.addEventListener('click', play);
            }

            video.addEventListener('click', toggle);
            video.addEventListener('play', update);
            video.addEventListener('pause', update);
            video.addEventListener('ended', update);
            video.addEventListener('error', showError);

            if (toggleButton) {
                toggleButton.addEventListener('click', toggle);
            }

            if (muteButton) {
                muteButton.addEventListener('click', function () {
                    video.muted = !video.muted;
                    update();
                });
            }

            if (fullButton) {
                fullButton.addEventListener('click', function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (player.requestFullscreen) {
                        player.requestFullscreen();
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (engine) {
                    engine.destroy();
                }
            });

            update();
        });
    });
})();
