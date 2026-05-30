(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  ready(function () {
    var resultBox = document.querySelector('[data-search-results]');
    var titleBox = document.querySelector('[data-search-title]');

    if (!resultBox) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var data = window.MOVIE_SEARCH_INDEX || [];

    if (titleBox) {
      titleBox.textContent = query ? '搜索：' + query : '搜索片库';
    }

    if (!query) {
      resultBox.innerHTML = '<div class="search-empty"><p>输入片名、地区、年份或类型即可查找内容。</p></div>';
      return;
    }

    var lower = query.toLowerCase();
    var results = data.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(lower) !== -1;
    }).slice(0, 120);

    if (!results.length) {
      resultBox.innerHTML = '<div class="search-empty"><p>没有找到匹配内容，可以换一个关键词。</p></div>';
      return;
    }

    resultBox.innerHTML = results.map(function (item) {
      return '<article class="compact-card">'
        + '<a href="' + item.url + '" class="compact-cover"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>'
        + '<div><h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>'
        + '<p>' + escapeHtml(item.oneLine) + '</p>'
        + '<div class="compact-meta"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>'
        + '</div></article>';
    }).join('');
  });
})();
