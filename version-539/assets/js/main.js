(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";

        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }

        window.location.href = target;
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 6200);
    }

    function normalize(value) {
      return (value || "").toString().toLowerCase();
    }

    function bindLocalFilter(inputSelector, itemSelector, emptySelector) {
      var input = document.querySelector(inputSelector);
      var items = Array.prototype.slice.call(document.querySelectorAll(itemSelector));
      var empty = document.querySelector(emptySelector);

      if (!input || !items.length) {
        return;
      }

      function applyFilter() {
        var query = normalize(input.value.trim());
        var visible = 0;

        items.forEach(function (item) {
          var text = normalize(item.getAttribute("data-title") + " " + item.getAttribute("data-genre") + " " + item.getAttribute("data-tags") + " " + item.textContent);
          var match = !query || text.indexOf(query) !== -1;
          item.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", applyFilter);
      applyFilter();
    }

    bindLocalFilter("[data-local-filter]", "[data-movie-card]", "[data-no-results]");

    var searchInput = document.querySelector("[data-search-input]");
    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      searchInput.value = query;
      bindLocalFilter("[data-search-input]", "[data-search-card]", "[data-search-empty]");
    }
  });
})();
