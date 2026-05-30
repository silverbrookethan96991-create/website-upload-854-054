(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });
      show(0);
      start();
    }

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var keyword = searchPage.querySelector("[data-search-input]");
      var region = searchPage.querySelector("[data-region-filter]");
      var type = searchPage.querySelector("[data-type-filter]");
      var year = searchPage.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      if (keyword) {
        keyword.value = q;
      }

      function matchText(card, value) {
        if (!value) {
          return true;
        }
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" ").toLowerCase();
        return haystack.indexOf(value.toLowerCase()) !== -1;
      }

      function run() {
        var qv = keyword ? keyword.value.trim() : "";
        var rv = region ? region.value : "";
        var tv = type ? type.value : "";
        var yv = year ? year.value : "";
        cards.forEach(function (card) {
          var ok = matchText(card, qv);
          if (rv) {
            ok = ok && card.getAttribute("data-region") === rv;
          }
          if (tv) {
            ok = ok && card.getAttribute("data-type") === tv;
          }
          if (yv) {
            ok = ok && card.getAttribute("data-year") === yv;
          }
          card.classList.toggle("hidden-card", !ok);
        });
      }

      [keyword, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", run);
          control.addEventListener("change", run);
        }
      });
      run();
    }
  });
})();
