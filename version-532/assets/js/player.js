(function () {
  "use strict";

  function setupPlayer(shell) {
    var video = shell.querySelector("[data-hls-player]");
    var button = shell.querySelector("[data-player-button]");
    var message = shell.querySelector("[data-player-message]");
    var source = video ? video.getAttribute("data-src") : "";
    var hasLoaded = false;

    if (!video || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function attachSource() {
      if (hasLoaded) {
        return Promise.resolve();
      }

      hasLoaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        shell._hls = hls;
        setMessage("HLS.js 已加载播放源，正在准备播放。");
        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setMessage("浏览器原生 HLS 已加载播放源，正在准备播放。");
        return Promise.resolve();
      }

      setMessage("当前浏览器不支持 HLS 播放，可更换浏览器或检查网络环境。");
      return Promise.reject(new Error("HLS is not supported"));
    }

    function play() {
      attachSource()
        .then(function () {
          shell.classList.add("is-playing");
          return video.play();
        })
        .catch(function () {
          shell.classList.remove("is-playing");
        });
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]")).forEach(setupPlayer);
  });
})();
