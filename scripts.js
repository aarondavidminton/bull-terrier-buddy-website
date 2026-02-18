(function () {
  var allImages = Array.from(document.querySelectorAll("img"));
  allImages.forEach(function (img, idx) {
    // Keep only the first hero image eager for LCP, lazy-load the rest.
    var isPrimaryHero = idx === 0 && !!img.closest(".hero");
    if (!isPrimaryHero) img.loading = "lazy";
    img.decoding = "async";
  });

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var elements = Array.from(document.querySelectorAll("section, .card"));
  var isGuideOrBlogPage = !!document.getElementById("guides-grid") || !!document.querySelector(".blog-list");
  if (elements.length) {
    if (prefersReduced || isGuideOrBlogPage) {
      // Guides/blog should render immediately without scroll-triggered reveal effects.
      elements.forEach(function (el) { el.classList.add("is-visible"); });
    } else if (elements.length > 24) {
      // Large pages (guides/blog) skip reveal animation to reduce scripting/layout cost.
      elements.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      elements.forEach(function (el) { el.classList.add("reveal"); });
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      elements.forEach(function (el) { observer.observe(el); });
    }
  }

  var navLinks = document.querySelector(".nav-links");
  if (navLinks && !document.querySelector(".nav-toggle")) {
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-toggle";
    toggle.setAttribute("aria-label", "Open menu");
    toggle.innerHTML = '<span class="nav-toggle-icon"></span>';
    var nav = document.querySelector(".nav");
    if (nav) {
      nav.appendChild(toggle);
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("nav-open");
      });
      navLinks.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") document.body.classList.remove("nav-open");
      });
    }
  }

  var guidesGrid = document.getElementById("guides-grid");
  if (guidesGrid) {
    var searchInput = document.getElementById("guides-search");
    var resultCount = document.getElementById("guides-result-count");
    var cards = Array.from(guidesGrid.querySelectorAll(".guide-card"));
    var catPills = document.querySelectorAll(".guide-cat-pill");
    var category = "all";

    function updateGuides() {
      var q = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var cardCat = card.getAttribute("data-category");
        var searchText = (card.getAttribute("data-search") || "").toLowerCase();
        var show = (category === "all" || cardCat === category) && (!q || searchText.indexOf(q) !== -1);
        card.classList.toggle("is-hidden", !show);
        if (show) visible++;
      });
      if (resultCount) {
        resultCount.textContent = visible === cards.length ? "" : visible + " guide" + (visible !== 1 ? "s" : "") + " found";
      }
    }

    if (searchInput) searchInput.addEventListener("input", updateGuides);
    catPills.forEach(function (btn) {
      btn.addEventListener("click", function () {
        catPills.forEach(function (b) { b.classList.remove("guide-cat-active"); });
        btn.classList.add("guide-cat-active");
        category = btn.getAttribute("data-category") || "all";
        updateGuides();
      });
    });
    updateGuides();
  }

  var blogList = document.querySelector(".blog-list");
  if (blogList) {
    var sortSelect = document.getElementById("blog-sort");
    var blogSearch = document.getElementById("blog-search");
    var blogResultCount = document.getElementById("blog-result-count");
    var blogCatPills = document.querySelectorAll(".blog-cat-pill");
    var blogCategory = "all";
    var articles = Array.from(blogList.querySelectorAll(".blog-post-card"));

    function updateBlogFilter() {
      var q = (blogSearch && blogSearch.value) ? blogSearch.value.trim().toLowerCase() : "";
      var visible = 0;
      articles.forEach(function (article) {
        var cat = article.getAttribute("data-category");
        var searchText = (article.getAttribute("data-search") || "").toLowerCase();
        var show = (blogCategory === "all" || cat === blogCategory) && (!q || searchText.indexOf(q) !== -1);
        article.classList.toggle("is-hidden", !show);
        if (show) visible++;
      });
      if (blogResultCount) {
        blogResultCount.textContent = visible === articles.length ? "" : visible + " post" + (visible !== 1 ? "s" : "") + " found";
      }
    }

    function sortBlog(dir) {
      var fragment = document.createDocumentFragment();
      var sorted = articles.slice().sort(function (a, b) {
        var ta = new Date(a.getAttribute("data-date") || 0).getTime();
        var tb = new Date(b.getAttribute("data-date") || 0).getTime();
        return dir === "oldest" ? ta - tb : tb - ta;
      });
      sorted.forEach(function (el) { fragment.appendChild(el); });
      blogList.appendChild(fragment);
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", function () { sortBlog(sortSelect.value || "newest"); });
      sortBlog(sortSelect.value || "newest");
    }
    if (blogSearch) blogSearch.addEventListener("input", updateBlogFilter);
    blogCatPills.forEach(function (btn) {
      btn.addEventListener("click", function () {
        blogCatPills.forEach(function (b) { b.classList.remove("guide-cat-active"); });
        btn.classList.add("guide-cat-active");
        blogCategory = btn.getAttribute("data-category") || "all";
        updateBlogFilter();
      });
    });
    updateBlogFilter();
  }
})();
