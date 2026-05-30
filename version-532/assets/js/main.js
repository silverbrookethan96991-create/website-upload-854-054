(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = qs("[data-mobile-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        activate(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activate(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function setupStaticFilters() {
    var area = qs("[data-filter-area]");
    var list = qs("[data-card-list]");
    if (!area || !list) {
      return;
    }

    var keywordInput = qs("[data-card-filter]", area);
    var typeSelect = qs("[data-filter-type]", area);
    var yearSelect = qs("[data-filter-year]", area);
    var emptyState = qs("[data-empty-state]");
    var cards = qsa("[data-card]", list);

    function apply() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year")
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
        var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
        var shouldShow = matchesKeyword && matchesType && matchesYear;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    [keywordInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a class=\"poster-frame\" href=\"" + escapeHtml(movie.url) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('image-error')\">",
      "    <span class=\"score-badge\">" + escapeHtml(movie.rating) + "</span>",
      "    <span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"movie-meta\">",
      "      <span>" + escapeHtml(movie.year) + "</span>",
      "      <span>" + escapeHtml(movie.region) + "</span>",
      "      <span>" + escapeHtml(movie.genre) + "</span>",
      "    </div>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function setupSearchPage() {
    var root = qs("[data-search-page]");
    if (!root || !window.MOVIES) {
      return;
    }

    var input = qs("[data-search-input]", root);
    var typeSelect = qs("[data-search-type]", root);
    var yearSelect = qs("[data-search-year]", root);
    var categorySelect = qs("[data-search-category]", root);
    var summary = qs("[data-search-summary]", root);
    var results = qs("[data-search-results]", root);

    input.value = getQueryParam("q");

    function render() {
      var keyword = normalize(input.value);
      var type = normalize(typeSelect.value);
      var year = normalize(yearSelect.value);
      var category = normalize(categorySelect.value);

      var matches = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.categoryName,
          movie.year,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okType = !type || normalize(movie.type) === type;
        var okYear = !year || normalize(movie.year) === year;
        var okCategory = !category || normalize(movie.categorySlug) === category;
        return okKeyword && okType && okYear && okCategory;
      });

      var display = matches.slice(0, 240);
      summary.textContent = "找到 " + matches.length + " 部影片" + (matches.length > display.length ? "，当前显示前 " + display.length + " 部。" : "。");
      results.innerHTML = display.map(movieCard).join("\n");
    }

    [input, typeSelect, yearSelect, categorySelect].forEach(function (control) {
      control.addEventListener("input", render);
      control.addEventListener("change", render);
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupStaticFilters();
    setupSearchPage();
  });
})();
