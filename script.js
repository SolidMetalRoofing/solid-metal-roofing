/* ============================================================
   SOLID METAL ROOFING — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* --- MOBILE NAV --- */
  var menuToggle = document.querySelector('.menu-toggle');
  var navMobile = document.querySelector('.nav-mobile');

  if (menuToggle && navMobile) {
    menuToggle.addEventListener('click', function () {
      this.classList.toggle('open');
      navMobile.classList.toggle('open');
      document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
    });

    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('open');
        navMobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- HEADER SCROLL EFFECT --- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* --- SCROLL FADE-IN OBSERVER --- */
  var fadeObserver;
  if ('IntersectionObserver' in window) {
    fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  }

  function observeFadeIns(root) {
    var els = (root || document).querySelectorAll('.fade-in:not(.visible)');
    if (fadeObserver) {
      els.forEach(function (el) { fadeObserver.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  observeFadeIns();

  /* --- CONTACT FORM HANDLER --- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = contactForm.querySelector('[name="name"]');
      var email = contactForm.querySelector('[name="email"]');
      var message = contactForm.querySelector('[name="message"]');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (!isValidEmail(email.value.trim())) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(function () {
        showToast('Thank you! We\'ll be in touch within 24 hours.', 'success');
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1200);
    });
  }

  /* --- TOAST SYSTEM --- */
  function showToast(msg, type) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || '');
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('show');
      });
    });

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 4000);
  }

  /* --- HELPERS --- */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* --- SMOOTH SCROLL FOR ANCHOR LINKS --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* --- ACTIVE NAV HIGHLIGHT --- */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
    if (currentPage.indexOf('blog') === 0 && href === 'blog.html') {
      link.classList.add('active');
    }
  });

  /* ==========================================================
     DYNAMIC BLOG LISTING (blog.html)
     ----------------------------------------------------------
     Reads from: BLOG_POSTS in site-data.js
     To add a new post:
       1. Drop a .txt file in /assets/blogs/
       2. Add one entry to BLOG_POSTS in site-data.js
       That's it — no HTML editing needed.
     ========================================================== */
  var blogGrid = document.getElementById('blogGrid');
  if (blogGrid && typeof BLOG_POSTS !== 'undefined') {
    blogGrid.innerHTML = '';

    BLOG_POSTS.forEach(function (post) {
      var card = document.createElement('article');
      card.className = 'blog-card fade-in';

      var link = document.createElement('a');
      link.href = 'blog-article.html?slug=' + encodeURIComponent(post.slug);
      link.className = 'blog-card-link';

      link.innerHTML =
        '<div class="blog-card-img"><span>' + escapeHTML(post.category || '') + '</span></div>' +
        '<div class="blog-card-body">' +
          '<div class="blog-meta"><span>' + escapeHTML(post.date) + '</span> <span>\u2022</span> <span>' + escapeHTML(post.readTime) + '</span></div>' +
          '<h3>' + escapeHTML(post.title) + '</h3>' +
          '<p>' + escapeHTML(post.summary) + '</p>' +
          '<span class="read-more">Read Article \u2192</span>' +
        '</div>';

      card.appendChild(link);
      blogGrid.appendChild(card);
    });

    observeFadeIns(blogGrid);
  }

  /* ==========================================================
     DYNAMIC BLOG ARTICLE RENDERER
     ----------------------------------------------------------
     Works on:
       - blog-article.html?slug=xxx  (universal template)
       - Existing pages with data-blog-slug attribute

     .txt format expected in /assets/blogs/:
       Title: Your Title Here
       Date: April 5, 2026
       Category: Comparison
       ---
       Body text. Blank lines = new paragraph.
       Short solo lines (under 80 chars, no period) = headings.
     ========================================================== */
  function parseBlogTxt(raw) {
    var parts = raw.split('---');
    var metaRaw = parts.shift().trim();
    var body = parts.join('---').trim();

    var meta = {};
    metaRaw.split('\n').forEach(function (line) {
      var idx = line.indexOf(':');
      if (idx > -1) {
        var key = line.substring(0, idx).trim().toLowerCase();
        var val = line.substring(idx + 1).trim();
        meta[key] = val;
      }
    });

    return { meta: meta, body: body };
  }

  function renderBlogBody(bodyText) {
    var html = '';
    var blocks = bodyText.split(/\n\n+/);

    blocks.forEach(function (block) {
      block = block.trim();
      if (!block) return;

      var lines = block.split('\n');

      // A short single line with no period = heading
      if (lines.length === 1 && block.length < 80 && block.indexOf('.') === -1 && !/^\d/.test(block)) {
        html += '<h3>' + escapeHTML(block) + '</h3>';
      } else {
        var text = lines.map(function (l) { return l.trim(); }).join(' ');
        html += '<p>' + escapeHTML(text) + '</p>';
      }
    });

    return html;
  }

  function loadBlogArticle(slug, container) {
    if (typeof BLOG_CONTENT === 'undefined' || !BLOG_CONTENT[slug]) {
      container.innerHTML = '<p class="lead">Article not found. <a href="blog.html">\u2190 Back to Blog</a></p>';
      return;
    }

    var raw = BLOG_CONTENT[slug];
    var parsed = parseBlogTxt(raw);
    container.innerHTML = renderBlogBody(parsed.body);
    container.classList.add('visible');

    // Update page title/meta on universal template
    var titleEl = document.getElementById('article-title');
    var metaEl = document.getElementById('article-meta');
    var breadcrumbEl = document.getElementById('breadcrumb-title');

    if (titleEl && parsed.meta.title) {
      titleEl.textContent = parsed.meta.title;
      document.title = parsed.meta.title + ' | Solid Metal Roofing';
    }
    if (metaEl && parsed.meta.date) {
      metaEl.textContent = parsed.meta.date + (parsed.meta.category ? '  \u2022  ' + parsed.meta.category : '');
    }
    if (breadcrumbEl && parsed.meta.title) {
      breadcrumbEl.textContent = parsed.meta.title;
    }
  }

  // Universal template: blog-article.html?slug=xxx
  var urlParams = new URLSearchParams(window.location.search);
  var slugParam = urlParams.get('slug');
  var universalContainer = document.getElementById('article-body');
  if (slugParam && universalContainer) {
    loadBlogArticle(slugParam, universalContainer);
  }

  // Existing article pages with data-blog-slug attribute
  var existingArticle = document.querySelector('[data-blog-slug]');
  if (existingArticle) {
    loadBlogArticle(existingArticle.getAttribute('data-blog-slug'), existingArticle);
  }

  /* ==========================================================
     DYNAMIC GALLERY (gallery.html)
     ----------------------------------------------------------
     Reads from: GALLERY_COUNTS in site-data.js
     Photos must be named 1.jpg, 2.jpg, 3.jpg etc. in each folder.
     To add a photo:
       1. Rename it to the next number (e.g. 8.jpg)
       2. Drop it in the right /assets/ subfolder
       3. Update the count in site-data.js
     ========================================================== */
  var galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid && typeof GALLERY_COUNTS !== 'undefined') {
    galleryGrid.innerHTML = '';

    var categoryLabels = {
      residential: 'Residential',
      commercial: 'Commercial',
      agricultural: 'Agricultural',
      repairs: 'Repairs'
    };

    var categories = ['residential', 'commercial', 'agricultural', 'repairs'];
    var hasPhotos = false;

    categories.forEach(function (cat) {
      var count = GALLERY_COUNTS[cat] || 0;
      for (var i = 1; i <= count; i++) {
        hasPhotos = true;
        var div = document.createElement('div');
        div.className = 'gallery-item fade-in';
        div.setAttribute('data-category', cat);

        var label = categoryLabels[cat] || cat;
        div.innerHTML =
          '<img src="assets/' + cat + '/' + i + '.jpg" alt="' + label + ' Roofing Project — Alberta" loading="lazy">' +
          '<div class="gallery-overlay"><span>' + label + ' Project</span></div>';

        galleryGrid.appendChild(div);
      }
    });

    if (!hasPhotos) {
      galleryGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--gray-500);">Gallery photos coming soon.</p>';
    }

    observeFadeIns(galleryGrid);
    initGalleryFilter();
  }

  /* --- GALLERY FILTER (initialized after dynamic load) --- */
  function initGalleryFilter() {
    var filterBtns = document.querySelectorAll('.gallery-filter button');
    if (!filterBtns.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        var filter = this.getAttribute('data-filter');
        var items = document.querySelectorAll('.gallery-item');

        items.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  if (!galleryGrid) {
    initGalleryFilter();
  }

  /* ==========================================================
     LIGHTBOX — Fullscreen Image Viewer with Swipe
     ========================================================== */
  var lightbox = null;
  var lightboxImg = null;
  var lightboxCounter = null;
  var lightboxImages = [];
  var lightboxIndex = 0;
  var touchStartX = 0;
  var touchEndX = 0;

  function createLightbox() {
    if (lightbox) return;

    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML =
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-prev" aria-label="Previous">\u2039</button>' +
      '<button class="lightbox-next" aria-label="Next">\u203A</button>' +
      '<div class="lightbox-img-wrap"><img class="lightbox-img" alt="Gallery photo"></div>' +
      '<div class="lightbox-counter"></div>';

    document.body.appendChild(lightbox);

    lightboxImg = lightbox.querySelector('.lightbox-img');
    lightboxCounter = lightbox.querySelector('.lightbox-counter');

    // Close
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-img-wrap')) {
        closeLightbox();
      }
    });

    // Nav
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function (e) {
      e.stopPropagation();
      showLightboxImage(lightboxIndex - 1);
    });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function (e) {
      e.stopPropagation();
      showLightboxImage(lightboxIndex + 1);
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightboxImage(lightboxIndex - 1);
      if (e.key === 'ArrowRight') showLightboxImage(lightboxIndex + 1);
    });

    // Swipe
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          showLightboxImage(lightboxIndex + 1);
        } else {
          showLightboxImage(lightboxIndex - 1);
        }
      }
    }, { passive: true });
  }

  function openLightbox(index) {
    // Collect all currently visible gallery images
    lightboxImages = [];
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      if (item.style.display !== 'none') {
        var img = item.querySelector('img');
        if (img) lightboxImages.push(img.src);
      }
    });

    if (!lightboxImages.length) return;

    createLightbox();
    lightboxIndex = index;
    showLightboxImage(index);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function showLightboxImage(index) {
    if (index < 0) index = lightboxImages.length - 1;
    if (index >= lightboxImages.length) index = 0;
    lightboxIndex = index;
    lightboxImg.src = lightboxImages[index];
    lightboxCounter.textContent = (index + 1) + ' / ' + lightboxImages.length;
  }

  // Attach click handlers to gallery items (works with dynamic content)
  document.addEventListener('click', function (e) {
    var item = e.target.closest('.gallery-item');
    if (!item) return;

    e.preventDefault();
    // Find index among visible items
    var visibleItems = [];
    document.querySelectorAll('.gallery-item').forEach(function (el) {
      if (el.style.display !== 'none') visibleItems.push(el);
    });
    var idx = visibleItems.indexOf(item);
    if (idx === -1) idx = 0;
    openLightbox(idx);
  });

})();
