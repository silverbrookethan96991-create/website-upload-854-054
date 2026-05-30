(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-nav]");
        if (menuButton && nav) {
            menuButton.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });

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

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
        var activeFilter = "all";

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var searchText = card.getAttribute("data-search") || "";
                var filterText = card.getAttribute("data-filter") || "";
                var matchedQuery = !query || searchText.indexOf(query) !== -1;
                var matchedFilter = activeFilter === "all" || filterText.indexOf(activeFilter) !== -1;
                card.hidden = !(matchedQuery && matchedFilter);
            });
        }

        if (input && cards.length) {
            input.addEventListener("input", applyFilter);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = (button.getAttribute("data-filter-button") || "all").toLowerCase();
                filterButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });
    });
})();
