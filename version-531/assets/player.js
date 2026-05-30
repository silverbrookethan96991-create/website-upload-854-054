(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    if (typeof streamConfig !== "object" || !streamConfig) {
      return;
    }
    var video = document.getElementById(streamConfig.videoId);
    var button = document.getElementById(streamConfig.buttonId);
    if (!video || !button) {
      return;
    }
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded) {
        return;
      }
      var source = streamConfig.source;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function play() {
      attach();
      button.classList.add("is-hidden");
      var started = video.play();
      if (started && typeof started.catch === "function") {
        started.catch(function () {});
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
