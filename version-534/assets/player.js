(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var overlay = wrap.querySelector('[data-player-overlay]');
      var button = wrap.querySelector('[data-player-button]');
      var message = wrap.querySelector('[data-player-message]');
      var url = video ? video.getAttribute('data-url') : '';
      var hls = null;
      var initialized = false;

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add('is-visible');
        }
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }

      function init() {
        if (!video || initialized) {
          return Promise.resolve();
        }

        initialized = true;
        video.controls = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });

          hls.loadSource(url);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              showMessage('网络连接异常，请稍后重试');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              showMessage('播放出现中断，正在恢复');
              hls.recoverMediaError();
            } else {
              showMessage('当前浏览器暂时无法播放该视频');
              hls.destroy();
            }
          });

          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1200);
          });
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          return Promise.resolve();
        }

        showMessage('当前浏览器暂时无法播放该视频');
        return Promise.reject(new Error('unsupported'));
      }

      function play() {
        init().then(function () {
          hideOverlay();
          var promise = video.play();

          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              showMessage('点击播放器即可继续观看');
            });
          }
        }).catch(function () {});
      }

      if (button) {
        button.addEventListener('click', play);
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!initialized || video.paused) {
            play();
          } else {
            video.pause();
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
