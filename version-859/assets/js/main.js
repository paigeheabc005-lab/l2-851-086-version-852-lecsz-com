(function () {
  var body = document.body;
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      body.classList.toggle("menu-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    var show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    start();
  }

  var searchTools = document.querySelector("[data-search-tools]");
  var filterInput = document.querySelector("[data-filter-input]");
  var filterGrid = document.querySelector("[data-filter-grid]");
  var filterResult = document.querySelector("[data-filter-result]");
  var categorySelect = document.querySelector("[data-category-select]");
  var yearSelect = document.querySelector("[data-year-select]");

  if (filterGrid && filterInput) {
    var cards = Array.prototype.slice.call(
      filterGrid.querySelectorAll(".movie-card"),
    );
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (initialQuery) {
      filterInput.value = initialQuery;
    }

    var normalize = function (value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    };

    var applyFilter = function () {
      var query = normalize(filterInput.value);
      var category = categorySelect ? categorySelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardCategory = card.getAttribute("data-category") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var ok = true;

        if (query && text.indexOf(query) === -1) {
          ok = false;
        }

        if (category && cardCategory !== category) {
          ok = false;
        }

        if (year && cardYear !== year) {
          ok = false;
        }

        card.classList.toggle("hidden-card", !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (filterResult) {
        filterResult.textContent = visible
          ? "筛选到 " + visible + " 部影片"
          : "暂无匹配影片";
      }
    };

    filterInput.addEventListener("input", applyFilter);

    if (categorySelect) {
      categorySelect.addEventListener("change", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    if (searchTools) {
      searchTools.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });
    }

    applyFilter();
  }
})();
