(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startHeroTimer() {
        if (heroTimer || slides.length <= 1) {
            return;
        }

        heroTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    function resetHeroTimer() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
            heroTimer = null;
        }
        startHeroTimer();
    }

    var nextButton = document.querySelector('[data-hero-next]');
    var prevButton = document.querySelector('[data-hero-prev]');

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            resetHeroTimer();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            resetHeroTimer();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            resetHeroTimer();
        });
    });

    showSlide(0);
    startHeroTimer();

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function installCardFilter(scope) {
        var input = scope.querySelector('[data-filter-input]');
        var grid = scope.parentElement.querySelector('.filterable-grid') || document.querySelector('.filterable-grid');
        var count = document.querySelector('[data-result-count]');

        if (!input || !grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.children);

        function applyFilter(value) {
            var keyword = normalizeText(value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalizeText([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.textContent
                ].join(' '));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden-by-filter', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '显示 ' + visible + ' 部影片';
            }
        }

        input.addEventListener('input', function () {
            applyFilter(input.value);
        });

        document.querySelectorAll('[data-filter-chip]').forEach(function (chip) {
            chip.addEventListener('click', function () {
                input.value = chip.getAttribute('data-filter-chip') || chip.textContent || '';
                applyFilter(input.value);
            });
        });
    }

    document.querySelectorAll('[data-card-filter]').forEach(installCardFilter);

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function createSearchCard(item) {
        var title = escapeHtml(item.title);
        var description = escapeHtml(item.description);
        var type = escapeHtml(item.type);
        var region = escapeHtml(item.region);
        var year = escapeHtml(item.year);
        var rating = escapeHtml(item.rating);
        var duration = escapeHtml(item.duration);
        var url = escapeHtml(item.url);
        var cover = escapeHtml(item.cover);

        return '' +
            '<article class="movie-card">' +
                '<a href="' + url + '" aria-label="观看 ' + title + '">' +
                    '<div class="card-cover">' +
                        '<img src="' + cover + '" alt="' + title + '" loading="lazy">' +
                        '<div class="cover-shade"></div>' +
                        '<div class="play-hover" aria-hidden="true">▶</div>' +
                        '<span class="rating-badge">★ ' + rating + '</span>' +
                        '<span class="duration-badge">' + duration + '</span>' +
                    '</div>' +
                    '<div class="card-body">' +
                        '<h3>' + title + '</h3>' +
                        '<p>' + description + '</p>' +
                        '<div class="card-meta">' +
                            '<span>' + type + '</span>' +
                            '<span>' + region + '</span>' +
                            '<span>' + year + '</span>' +
                        '</div>' +
                    '</div>' +
                '</a>' +
            '</article>';
    }

    var globalSearch = document.querySelector('[data-global-search]');
    var globalInput = globalSearch ? globalSearch.querySelector('input') : null;
    var globalResults = document.querySelector('[data-search-results]');
    var globalCount = document.querySelector('[data-search-count]');

    function runGlobalSearch(keyword) {
        if (!globalResults || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
            return;
        }

        var normalized = normalizeText(keyword);
        if (!normalized) {
            globalResults.innerHTML = '';
            if (globalCount) {
                globalCount.textContent = '请输入关键词开始搜索';
            }
            return;
        }

        var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
            return normalizeText(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.tags + ' ' + item.category).indexOf(normalized) !== -1;
        }).slice(0, 120);

        globalResults.innerHTML = results.map(createSearchCard).join('');
        if (globalCount) {
            globalCount.textContent = '找到 ' + results.length + ' 条结果' + (results.length === 120 ? '（最多显示 120 条）' : '');
        }
    }

    if (globalSearch && globalInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        globalInput.value = initialQuery;
        runGlobalSearch(initialQuery);

        globalSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            runGlobalSearch(globalInput.value);
        });

        globalInput.addEventListener('input', function () {
            runGlobalSearch(globalInput.value);
        });
    }

    function initializePlayer(player) {
        var video = player.querySelector('video');
        var startButton = player.querySelector('[data-player-start]');
        var status = player.querySelector('[data-player-status]');
        var src = player.getAttribute('data-src');

        if (!video || !src) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function playVideo() {
            player.classList.add('is-playing');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.play().catch(function () {
                    setStatus('播放已初始化，请再次点击视频播放。');
                });
                setStatus('正在使用浏览器原生 HLS 播放。');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!player._hlsInstance) {
                    player._hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    player._hlsInstance.loadSource(src);
                    player._hlsInstance.attachMedia(video);
                    player._hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            setStatus('播放已初始化，请再次点击视频播放。');
                        });
                    });
                    player._hlsInstance.on(window.Hls.Events.ERROR, function () {
                        setStatus('HLS 加载遇到网络或跨域限制，可刷新或更换浏览器再试。');
                    });
                } else {
                    video.play().catch(function () {
                        setStatus('播放已初始化，请再次点击视频播放。');
                    });
                }
                setStatus('HLS.js 已初始化播放源。');
                return;
            }

            video.src = src;
            video.play().catch(function () {
                setStatus('当前浏览器可能不支持 HLS 播放。');
            });
        }

        if (startButton) {
            startButton.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
    }

    document.querySelectorAll('.movie-player').forEach(initializePlayer);
}());
