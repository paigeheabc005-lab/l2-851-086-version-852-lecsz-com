(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    var index = window.SEARCH_INDEX || [];
    queryAll("[data-search-form]").forEach(function (form) {
      var input = form.querySelector("input[name='q']");
      var suggest = form.querySelector("[data-search-suggest]");
      if (!input) {
        return;
      }
      form.addEventListener("submit", function (event) {
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
      if (!suggest) {
        return;
      }
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        if (!value) {
          suggest.classList.remove("is-open");
          suggest.innerHTML = "";
          return;
        }
        var results = index.filter(function (item) {
          var text = [item.title, item.region, item.category, item.year, item.tags, item.oneLine].join(" ").toLowerCase();
          return text.indexOf(value) !== -1;
        }).slice(0, 6);
        if (!results.length) {
          suggest.classList.remove("is-open");
          suggest.innerHTML = "";
          return;
        }
        suggest.innerHTML = results.map(function (item) {
          return '<a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '<br><small>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + '</small></a>';
        }).join("");
        suggest.classList.add("is-open");
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          suggest.classList.remove("is-open");
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = queryAll("[data-hero-slide]", hero);
    var dots = queryAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  }

  function initCategoryFilter() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var input = document.getElementById("categoryFilter");
    var empty = document.querySelector("[data-filter-empty]");
    var cards = queryAll(".searchable-card", grid);
    var activeTerm = "";
    function apply() {
      var words = ((input && input.value) || "").trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = [card.getAttribute("data-title"), card.getAttribute("data-year"), card.getAttribute("data-category"), card.getAttribute("data-keywords")].join(" ").toLowerCase();
        var ok = (!words || text.indexOf(words) !== -1) && (!activeTerm || text.indexOf(activeTerm.toLowerCase()) !== -1);
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    queryAll("[data-filter-term]").forEach(function (button) {
      button.addEventListener("click", function () {
        var term = button.getAttribute("data-filter-term") || "";
        activeTerm = activeTerm === term ? "" : term;
        queryAll("[data-filter-term]").forEach(function (item) {
          item.classList.toggle("is-active", item.getAttribute("data-filter-term") === activeTerm);
        });
        apply();
      });
    });
    var clear = document.querySelector("[data-filter-clear]");
    if (clear) {
      clear.addEventListener("click", function () {
        activeTerm = "";
        if (input) {
          input.value = "";
        }
        queryAll("[data-filter-term]").forEach(function (item) {
          item.classList.remove("is-active");
        });
        apply();
      });
    }
  }

  function initSearchPage() {
    var holder = document.getElementById("searchPageResults");
    if (!holder) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("searchPageInput");
    var title = document.getElementById("searchPageTitle");
    var empty = document.getElementById("searchPageEmpty");
    var index = window.SEARCH_INDEX || [];
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var results = index.filter(function (item) {
      var text = [item.title, item.region, item.category, item.year, item.tags, item.oneLine].join(" ").toLowerCase();
      return text.indexOf(lower) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = '“' + query + '”的搜索结果';
    }
    if (!results.length) {
      if (empty) {
        empty.textContent = "没有找到相关影片";
        empty.classList.add("is-visible");
      }
      return;
    }
    if (empty) {
      empty.classList.remove("is-visible");
    }
    holder.innerHTML = results.map(function (item) {
      return '<article class="movie-card">'
        + '<a class="movie-card__link" href="' + escapeHtml(item.url) + '">'
        + '<span class="movie-card__poster-wrap">'
        + '<img class="movie-card__poster" src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
        + '<span class="movie-card__play">▶</span>'
        + '<span class="movie-card__badge">' + escapeHtml(item.year) + '</span>'
        + '</span>'
        + '<span class="movie-card__body">'
        + '<strong class="movie-card__title">' + escapeHtml(item.title) + '</strong>'
        + '<span class="movie-card__desc">' + escapeHtml(item.oneLine) + '</span>'
        + '<span class="movie-card__meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></span>'
        + '</span>'
        + '</a>'
        + '</article>';
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initCategoryFilter();
    initSearchPage();
  });
})();
