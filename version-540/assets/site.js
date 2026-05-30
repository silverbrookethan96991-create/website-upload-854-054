(function() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }

    var carousels = document.querySelectorAll('[data-carousel]');
    carousels.forEach(function(carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    var searchInputs = document.querySelectorAll('[data-search-input]');
    searchInputs.forEach(function(input) {
        var scopeSelector = input.getAttribute('data-search-input');
        var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
        if (!scope) {
            scope = document;
        }
        var items = Array.prototype.slice.call(scope.querySelectorAll('.search-item'));
        var empty = scope.querySelector('[data-empty-state]');

        input.addEventListener('input', function() {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            items.forEach(function(item) {
                var haystack = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '')).toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                item.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        });
    });
})();
