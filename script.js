/* ============================================================
   SOLID METAL ROOFING — Main JavaScript
   Reads photos, colours and blog posts from site-data.js
   ============================================================ */

(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }
  var ARROW_L = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  var ARROW_R = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';

  /* --- MOBILE MENU --- */
  var burger = $('.burger');
  var menu = $('.mobile-menu');
  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var c = $('.x-btn', menu); if (c) c.focus(); } else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(true); });
    $all('.x-btn, nav a, .mobile-menu-cta a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- ACTIVE NAV HIGHLIGHT --- */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $all('.nav-desktop a, .mobile-menu nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage.indexOf('blog') === 0 && href === 'blog.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ==========================================================
     LIGHTBOX — full-screen photo viewer with swipe
     open(list, index): list = [{ src, alt, caption }]
     ========================================================== */
  var lb = null, lbImg, lbCap, lbPrev, lbNext, lbList = [], lbIdx = 0, lbReturn = null;
  function lbBuild() {
    if (lb) return;
    lb = el('div', 'lightbox');
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML =
      '<button type="button" class="close" aria-label="Close">&times;</button>' +
      '<button type="button" class="gal-nav prev" aria-label="Previous photo">' + ARROW_L + '</button>' +
      '<button type="button" class="gal-nav next" aria-label="Next photo">' + ARROW_R + '</button>' +
      '<img alt=""><p></p>';
    document.body.appendChild(lb);
    lbImg = $('img', lb); lbCap = $('p', lb); lbPrev = $('.prev', lb); lbNext = $('.next', lb);
    $('.close', lb).addEventListener('click', lbClose);
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
    lbPrev.addEventListener('click', function () { lbGo(-1); });
    lbNext.addEventListener('click', function () { lbGo(1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowLeft') lbGo(-1);
      if (e.key === 'ArrowRight') lbGo(1);
    });
    swipe(lb, function (d) { lbGo(d); });
  }
  function lbShow() {
    var it = lbList[lbIdx];
    lbImg.src = it.src; lbImg.alt = it.alt || '';
    lbCap.textContent = it.caption || '';
    var many = lbList.length > 1;
    lbPrev.hidden = !many; lbNext.hidden = !many;
  }
  function lbGo(d) {
    if (lbList.length < 2) return;
    lbIdx = (lbIdx + d + lbList.length) % lbList.length;
    lbShow();
  }
  function lbOpen(list, idx) {
    lbBuild();
    lbReturn = document.activeElement;
    lbList = list; lbIdx = idx || 0;
    lbShow();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.close', lb).focus();
  }
  function lbClose() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lbReturn && lbReturn.focus) lbReturn.focus();
  }
  function swipe(node, cb) {
    var x0 = null;
    node.addEventListener('touchstart', function (e) { x0 = e.touches[0] ? e.touches[0].clientX : null; }, { passive: true });
    node.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var x1 = e.changedTouches[0] ? e.changedTouches[0].clientX : x0, dx = x1 - x0;
      x0 = null;
      if (dx > 40) cb(-1); else if (dx < -40) cb(1);
    }, { passive: true });
  }

  // Any image button marked data-zoom opens on its own
  $all('[data-zoom]').forEach(function (b) {
    b.addEventListener('click', function () {
      var img = $('img', b) || b;
      lbOpen([{ src: b.getAttribute('data-zoom') || img.src, alt: img.alt, caption: b.getAttribute('data-caption') || '' }], 0);
    });
  });

  function capOf(p) { return (p.tag ? p.tag + (p.caption ? ' — ' : '') : '') + (p.caption || ''); }

  /* ==========================================================
     PHOTO GALLERY CARDS  (<div data-gallery="residential">)
     ========================================================== */
  if (typeof GALLERIES !== 'undefined') {
    $all('[data-gallery]').forEach(function (host) {
      var G = GALLERIES[host.getAttribute('data-gallery')];
      if (!G || !G.photos.length) return;
      var i = 0, n = G.photos.length;
      host.className = 'card gal';
      host.innerHTML =
        '<div class="card-head"><h3>' + escapeHTML(G.title) + '</h3><span class="count" aria-live="polite"></span></div>' +
        '<div class="gal-frame"><img alt="" loading="lazy" tabindex="0" role="button">' +
        '<span class="gal-tag"></span><span class="gal-cap"></span>' +
        (n > 1 ? '<button type="button" class="gal-nav prev" aria-label="Previous photo">' + ARROW_L + '</button><button type="button" class="gal-nav next" aria-label="Next photo">' + ARROW_R + '</button>' : '') +
        '</div><p class="card-body">' + escapeHTML(G.body) + '</p>';
      var img = $('img', host), tag = $('.gal-tag', host), cap = $('.gal-cap', host), count = $('.count', host);
      function show() {
        var p = G.photos[i];
        img.src = p.src; img.alt = p.alt || '';
        tag.textContent = p.tag || ''; tag.style.display = p.tag ? '' : 'none';
        tag.className = 'gal-tag' + (p.tag === 'After' ? ' after' : '');
        cap.textContent = p.caption || ''; cap.style.display = p.caption ? '' : 'none';
        count.textContent = n > 1 ? (i + 1) + ' / ' + n : '';
      }
      function go(d) { i = (i + d + n) % n; show(); }
      function zoom() { lbOpen(G.photos.map(function (p) { return { src: p.src, alt: p.alt, caption: capOf(p) }; }), i); }
      if (n > 1) {
        $('.prev', host).addEventListener('click', function () { go(-1); });
        $('.next', host).addEventListener('click', function () { go(1); });
        swipe($('.gal-frame', host), go);
      }
      img.addEventListener('click', zoom);
      img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zoom(); } });
      show();
    });

    /* --- OUR WORK PAGE: every photo, filter by category --- */
    var grid = $('#workGrid');
    if (grid) {
      var all = [];
      Object.keys(GALLERIES).forEach(function (k) {
        GALLERIES[k].photos.forEach(function (p) { all.push({ cat: k, p: p }); });
      });
      var current = 'all';
      function visible() { return all.filter(function (a) { return current === 'all' || a.cat === current; }); }
      all.forEach(function (a) {
        var b = el('button', 'work-item');
        b.type = 'button';
        b.innerHTML = '<img loading="lazy" src="' + a.p.src + '" alt="' + escapeHTML(a.p.alt || '') + '">' +
          (a.p.tag ? '<span class="gal-tag' + (a.p.tag === 'After' ? ' after' : '') + '">' + escapeHTML(a.p.tag) + '</span>' : '') +
          (a.p.caption ? '<span class="gal-cap">' + escapeHTML(a.p.caption) + '</span>' : '');
        b.addEventListener('click', function () {
          var v = visible();
          lbOpen(v.map(function (x) { return { src: x.p.src, alt: x.p.alt, caption: capOf(x.p) }; }), v.indexOf(a));
        });
        a.node = b;
        grid.appendChild(b);
      });
      $all('.filters button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          current = btn.getAttribute('data-filter');
          $all('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', x === btn ? 'true' : 'false'); });
          all.forEach(function (a) { a.node.hidden = !(current === 'all' || a.cat === current); });
        });
      });
      var want = (window.location.hash || '').replace('#', '');
      var pre = want && $('.filters button[data-filter="' + want + '"]');
      if (pre) pre.click();
    }
  }

  /* ==========================================================
     COLOUR PREVIEW  (<div data-colours>)
     ========================================================== */
  var cw = $('[data-colours]');
  if (cw && typeof COLOURS !== 'undefined') {
    var photo = $('.cw-photo img', cw), photoBtn = $('.cw-photo', cw);
    var nameEls = $all('[data-colour-name]', cw);
    var stdBox = $('[data-swatches="standard"]', cw), woodBox = $('[data-swatches="woodgrain"]', cw), texBox = $('[data-swatches="textured"]', cw);
    var picked = null, buttons = [];
    function pick(c, btn) {
      picked = c;
      photo.src = c.img;
      photo.alt = 'Bungalow with a ' + c.name + ' metal roof';
      nameEls.forEach(function (n) { n.textContent = c.name; });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    }
    function addSwatch(box, c, withThumb) {
      var b = el('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      if (withThumb) {
        b.innerHTML = '<img loading="lazy" src="assets/colours/thumbs/' + c.id + '.jpg" alt=""><span>' + escapeHTML(c.name) + '</span>';
        c.img = 'assets/colours/p-' + c.id + '.jpg';
      } else {
        b.style.background = c.hex;
        b.title = c.name;
        b.setAttribute('aria-label', c.name);
        c.img = 'assets/colours/' + c.id + '.jpg';
      }
      b.addEventListener('click', function () { pick(c, b); });
      buttons.push(b);
      box.appendChild(b);
      return b;
    }
    var first = null;
    COLOURS.standard.forEach(function (c) { var b = addSwatch(stdBox, c, false); if (c.id === COLOURS.startWith) first = [c, b]; });
    COLOURS.woodgrain.forEach(function (c) { addSwatch(woodBox, c, true); });
    COLOURS.textured.forEach(function (c) { addSwatch(texBox, c, true); });
    if (!first) first = [COLOURS.standard[0], buttons[0]];
    pick(first[0], first[1]);

    $all('.cw-tabs button', cw).forEach(function (t) {
      t.addEventListener('click', function () {
        var which = t.getAttribute('data-tab');
        $all('.cw-tabs button', cw).forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
        $all('.cw-group', cw).forEach(function (g) { g.hidden = g.getAttribute('data-group') !== which; });
      });
    });
    photoBtn.addEventListener('click', function () {
      lbOpen([{ src: picked.img, alt: photo.alt, caption: 'VersaFrame ' + picked.name }], 0);
    });
  }

  /* --- GAUGE GUIDE --- */
  $all('.gauge-btns button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wasOpen = btn.getAttribute('aria-expanded') === 'true';
      $all('.gauge-btns button').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        var p = document.getElementById(b.getAttribute('aria-controls'));
        if (p) p.hidden = true;
        $('span', b).textContent = '+';
      });
      if (!wasOpen) {
        btn.setAttribute('aria-expanded', 'true');
        document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
        $('span', btn).textContent = '−';
      }
    });
  });

  /* --- QUOTE FORM (Web3Forms) --- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = contactForm.querySelector('[name="name"]');
      var email = contactForm.querySelector('[name="email"]');
      var message = contactForm.querySelector('[name="message"]');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        showToast('Please fill in your name, email and a short message.', 'error');
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

      // Build payload from form data and add Web3Forms metadata
      var formData = new FormData(contactForm);
      var serviceSel = contactForm.querySelector('[name="service"]');
      var serviceVal = serviceSel && serviceSel.value ? serviceSel.options[serviceSel.selectedIndex].text : '';
      formData.append('access_key', 'eaa44257-d5f7-4f60-8ef7-4a1f29bdda78');
      formData.append('subject', 'New Quote Request from ' + name.value.trim() + (serviceVal ? ' — ' + serviceVal : ''));
      formData.append('from_name', 'Solid Metal Roofing Website');
      formData.append('replyto', email.value.trim());

      fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.success) {
            showToast('Thank you! We\'ll be in touch within 24 hours. Have roof photos? Reply to our email with them.', 'success');
            contactForm.reset();
          } else {
            showToast('Something went wrong. Please call us at (780) 307-8599.', 'error');
          }
        })
        .catch(function () {
          showToast('Network error. Please call us at (780) 307-8599.', 'error');
        })
        .finally(function () {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  /* --- TOAST --- */
  function showToast(msg, type) {
    var existing = $('.toast');
    if (existing) existing.remove();
    var toast = el('div', 'toast ' + (type || ''));
    toast.setAttribute('role', 'status');
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { requestAnimationFrame(function () { toast.classList.add('show'); }); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 6000);
  }
  function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  /* ==========================================================
     BLOG LISTING (blog.html) — reads BLOG_POSTS in site-data.js
     ========================================================== */
  var blogGrid = document.getElementById('blogGrid');
  if (blogGrid && typeof BLOG_POSTS !== 'undefined') {
    blogGrid.innerHTML = '';
    BLOG_POSTS.forEach(function (post) {
      var card = el('article', 'card blog-card');
      card.innerHTML =
        '<a href="blog-article.html?slug=' + encodeURIComponent(post.slug) + '">' +
        '<div class="cat">' + escapeHTML(post.category || 'Article') + '</div>' +
        '<div class="in"><div class="meta">' + escapeHTML(post.date) + ' • ' + escapeHTML(post.readTime) + '</div>' +
        '<h3>' + escapeHTML(post.title) + '</h3><p>' + escapeHTML(post.summary) + '</p>' +
        '<span class="more">Read article →</span></div></a>';
      blogGrid.appendChild(card);
    });
  }

  /* ==========================================================
     BLOG ARTICLE RENDERER
     Works on blog-article.html?slug=xxx and on pages with a
     data-blog-slug attribute.
     Text format: "Title: ...\nDate: ...\nCategory: ...\n---\nBody"
     Blank line = new paragraph. A short line with no period = heading.
     ========================================================== */
  function parseBlogTxt(raw) {
    var parts = raw.split('---');
    var metaRaw = parts.shift().trim();
    var body = parts.join('---').trim();
    var meta = {};
    metaRaw.split('\n').forEach(function (line) {
      var idx = line.indexOf(':');
      if (idx > -1) meta[line.substring(0, idx).trim().toLowerCase()] = line.substring(idx + 1).trim();
    });
    return { meta: meta, body: body };
  }
  function renderBlogBody(bodyText) {
    var html = '';
    bodyText.split(/\n\n+/).forEach(function (block) {
      block = block.trim();
      if (!block) return;
      var lines = block.split('\n');
      if (lines.length === 1 && block.length < 80 && block.indexOf('.') === -1 && !/^\d/.test(block)) {
        html += '<h3>' + escapeHTML(block) + '</h3>';
      } else {
        html += '<p>' + escapeHTML(lines.map(function (l) { return l.trim(); }).join(' ')) + '</p>';
      }
    });
    return html;
  }
  function loadBlogArticle(slug, container) {
    if (typeof BLOG_CONTENT === 'undefined' || !BLOG_CONTENT[slug]) {
      container.innerHTML = '<p>Article not found. <a href="blog.html">← Back to Blog</a></p>';
      return;
    }
    var parsed = parseBlogTxt(BLOG_CONTENT[slug]);
    container.innerHTML = renderBlogBody(parsed.body);
    var titleEl = document.getElementById('article-title');
    var metaEl = document.getElementById('article-meta');
    var crumbEl = document.getElementById('breadcrumb-title');
    if (titleEl && parsed.meta.title) {
      titleEl.textContent = parsed.meta.title;
      document.title = parsed.meta.title + ' | Solid Metal Roofing';
    }
    if (metaEl && parsed.meta.date) metaEl.textContent = parsed.meta.date + (parsed.meta.category ? '  •  ' + parsed.meta.category : '');
    if (crumbEl && parsed.meta.title) crumbEl.textContent = parsed.meta.title;
  }
  /* ==========================================================
     GOOGLE REVIEWS  (<div data-reviews>, filled from /api/reviews)
     If anything fails the section stays hidden and only the
     Google button shows, same as before.
     ========================================================== */
  var reviewsBox = $('[data-reviews]');
  if (reviewsBox && window.fetch) {
    var STAR = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>';
    var starsHTML = function (n) {
      var full = Math.round(n), h = '';
      for (var s = 1; s <= 5; s++) h += '<span class="' + (s <= full ? 'on' : 'off') + '">' + STAR + '</span>';
      return '<div class="stars rv-stars" role="img" aria-label="' + n + ' out of 5 stars">' + h + '</div>';
    };
    fetch('/api/reviews').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.reviews || !d.reviews.length) return;
      var sum = $('[data-review-sum]', reviewsBox);
      var grid = $('[data-review-grid]', reviewsBox);
      if (d.rating) {
        sum.innerHTML = '<span class="rv-score">' + d.rating.toFixed(1) + '</span>' +
          '<div class="rv-sum-text">' + starsHTML(d.rating) +
          '<span class="muted">' + d.count + ' review' + (d.count === 1 ? '' : 's') + ' on Google</span></div>';
      } else {
        sum.hidden = true;
      }
      d.reviews.forEach(function (v) {
        var card = el('article', 'card review-card');
        var who = v.authorUrl
          ? '<a href="' + escapeHTML(v.authorUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHTML(v.author) + '</a>'
          : escapeHTML(v.author);
        card.innerHTML = starsHTML(v.rating) +
          '<p class="rv-text">' + escapeHTML(v.text) + '</p>' +
          '<button type="button" class="rv-more" hidden aria-expanded="false">Read more</button>' +
          '<div class="rv-foot"><span class="rv-who">' + who + '</span><span class="muted">' + escapeHTML(v.when) + (v.when ? ' · ' : '') + 'Google</span></div>';
        grid.appendChild(card);
      });
      reviewsBox.hidden = false;
      // "Read more" only on reviews that are actually cut off
      $all('.review-card', grid).forEach(function (card) {
        var p = $('.rv-text', card), b = $('.rv-more', card);
        if (p.scrollHeight > p.clientHeight + 2) {
          b.hidden = false;
          b.addEventListener('click', function () {
            var open = card.classList.toggle('open');
            b.textContent = open ? 'Show less' : 'Read more';
            b.setAttribute('aria-expanded', open ? 'true' : 'false');
          });
        }
      });
      var link = $('[data-reviews-link]');
      if (link) link.firstChild.nodeValue = 'Read all reviews on Google ';
    }).catch(function () { /* keep the Google button only */ });
  }

  var slugParam = new URLSearchParams(window.location.search).get('slug');
  var universal = document.getElementById('article-body');
  if (slugParam && universal) loadBlogArticle(slugParam, universal);
  var fixed = $('[data-blog-slug]');
  if (fixed) loadBlogArticle(fixed.getAttribute('data-blog-slug'), fixed);

})();
