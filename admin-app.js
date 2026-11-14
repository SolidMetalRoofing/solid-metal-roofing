/* ============================================================
   SOLID METAL ROOFING — Photo page (admin.html)
   Talks to /api/admin. Photos are shrunk in the browser before upload.
   ============================================================ */
(function () {
  'use strict';

  var BASE = 'https://mttgkfr92yzwx5eu.public.blob.vercel-storage.com';
  var API = '/api/admin?action=';
  var KEYS = ['residential', 'agricultural', 'siding', 'repairs'];
  var TAGS = ['', 'Before', 'After', 'Repair', 'In progress'];
  var MAX_EDGE = 1600;

  var $ = function (s) { return document.querySelector(s); };
  var data = null;          // { galleries: { key: { photos: [...] } } }
  var current = 'residential';
  var dirty = false;
  var toDelete = [];        // uploaded photos removed since the last save

  // ---------- server ----------
  function call(action, opts) {
    opts = opts || {};
    var headers = { 'X-SM-Admin': '1' };
    if (opts.json) headers['Content-Type'] = 'application/json';
    if (opts.blob) headers['Content-Type'] = 'application/octet-stream';
    return fetch(API + action + (opts.query || ''), {
      method: opts.method || 'POST',
      headers: headers,
      credentials: 'same-origin',
      body: opts.json ? JSON.stringify(opts.json) : opts.blob
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (!r.ok) { var e = new Error(b.error || 'Something went wrong.'); e.status = r.status; throw e; }
        return b;
      });
    });
  }

  // ---------- screens ----------
  function showLogin() {
    $('#loginForm').hidden = false;
    $('#editor').hidden = true; $('#bar').hidden = true; $('#logoutBtn').hidden = true;
    $('#pw').focus();
  }
  function showEditor() {
    $('#loginForm').hidden = true;
    $('#editor').hidden = false; $('#bar').hidden = false; $('#logoutBtn').hidden = false;
    loadData();
  }

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#loginErr'); err.hidden = true;
    var btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Checking…';
    call('login', { json: { password: $('#pw').value } })
      .then(function () { $('#pw').value = ''; showEditor(); })
      .catch(function (x) { err.textContent = x.message; err.hidden = false; })
      .then(function () { btn.disabled = false; btn.textContent = 'Sign in'; });
  });
  $('#logoutBtn').addEventListener('click', function () {
    if (dirty && !confirm('You have changes that are not saved. Sign out anyway?')) return;
    dirty = false;
    call('logout').then(showLogin, showLogin);
  });

  // ---------- data ----------
  function fromSiteData() {
    var out = { galleries: {} };
    KEYS.forEach(function (k) {
      out.galleries[k] = { photos: (GALLERIES[k] ? GALLERIES[k].photos : []).map(function (p) {
        return { src: p.src, alt: p.alt || '', tag: p.tag || '', caption: p.caption || '' };
      }) };
    });
    return out;
  }
  function loadData() {
    fetch(BASE + '/data/photos.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (d) {
        data = fromSiteData();
        if (d && d.galleries) KEYS.forEach(function (k) {
          if (d.galleries[k] && Array.isArray(d.galleries[k].photos)) data.galleries[k].photos = d.galleries[k].photos.map(function (p) {
            return { src: p.src, alt: p.alt || '', tag: p.tag || '', caption: p.caption || '' };
          });
        });
        renderTabs(); render();
      });
  }
  function title(k) { return (GALLERIES[k] && GALLERIES[k].title) || k; }
  function markDirty() {
    dirty = true;
    $('#status').textContent = 'Changes not saved yet';
    $('#status').className = 'ad-status';
    $('#saveBtn').disabled = false;
  }
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  // ---------- tabs ----------
  var SINGLES = [
    { key: 'hero', label: 'Top photo', note: 'The big photo at the top of the home page. A wide (landscape) photo works best; the edges may be trimmed to fit. Changes show on the site within about an hour.' },
    { key: 'share', label: 'Link picture', note: 'The picture people see when your website link is shared in a text, Facebook or email. Use a wide (landscape) photo. Facebook and others keep the old picture for a while, sometimes days.' }
  ];
  function renderTabs() {
    var tabs = $('#tabs'); tabs.innerHTML = '';
    KEYS.concat(SINGLES.map(function (s) { return s.key; })).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      var single = SINGLES.filter(function (s) { return s.key === k; })[0];
      b.textContent = single ? single.label : title(k) + ' (' + data.galleries[k].photos.length + ')';
      b.setAttribute('aria-pressed', k === current ? 'true' : 'false');
      b.addEventListener('click', function () { current = k; renderTabs(); render(); });
      tabs.appendChild(b);
    });
  }

  // ---------- one gallery ----------
  function render() {
    var single = SINGLES.filter(function (s) { return s.key === current; })[0];
    $('#galleryPane').hidden = !!single;
    $('#singlePane').hidden = !single;
    if (single) return renderSingle(single);

    var list = $('#list'); list.innerHTML = '';
    var photos = data.galleries[current].photos;
    if (!photos.length) {
      var p = document.createElement('p'); p.className = 'ad-note';
      p.textContent = 'No photos here yet. This section is hidden on the website until it has at least one.';
      list.appendChild(p);
    }
    photos.forEach(function (ph, i) {
      var card = document.createElement('div');
      card.className = 'card ad-photo';
      var img = document.createElement('img'); img.src = ph.src; img.alt = ''; img.loading = 'lazy';
      var f = document.createElement('div'); f.className = 'ad-fields';

      f.appendChild(field('Label', select(TAGS, ph.tag, function (v) { ph.tag = v; markDirty(); }, 'No label')));
      f.appendChild(field('Caption (short, shows on the photo)', input(ph.caption, 120, 'e.g. 9-36 in Iron Ore', function (v) { ph.caption = v; markDirty(); })));
      f.appendChild(field('Describe the photo (for Google and blind visitors)', input(ph.alt, 200, 'e.g. Bungalow with a new brown metal roof', function (v) { ph.alt = v; markDirty(); })));

      var row = document.createElement('div'); row.className = 'ad-row';
      row.appendChild(btn('↑ Up', i === 0, function () { move(i, -1); }, 'Move up'));
      row.appendChild(btn('↓ Down', i === photos.length - 1, function () { move(i, 1); }, 'Move down'));
      var mv = select([''].concat(KEYS.filter(function (k) { return k !== current; })), '', function (v) {
        if (!v) return;
        data.galleries[v].photos.push(photos.splice(i, 1)[0]);
        markDirty(); renderTabs(); render();
      }, 'Move to…', title);
      mv.setAttribute('aria-label', 'Move to another section');
      row.appendChild(mv);
      row.appendChild(btn('Remove', false, function () {
        if (!confirm('Remove this photo from the website?')) return;
        var gone = photos.splice(i, 1)[0];
        if (/^https:/.test(gone.src)) toDelete.push(gone.src);
        markDirty(); renderTabs(); render();
      }, 'Remove photo', 'danger'));
      f.appendChild(row);

      card.appendChild(img); card.appendChild(f);
      list.appendChild(card);
    });
  }
  function move(i, d) {
    var photos = data.galleries[current].photos;
    var t = photos[i]; photos[i] = photos[i + d]; photos[i + d] = t;
    markDirty(); render();
  }
  function field(label, control) {
    var w = document.createElement('div'); w.className = 'field';
    var id = 'f' + Math.random().toString(36).slice(2);
    var l = document.createElement('label'); l.textContent = label; l.htmlFor = id; control.id = id;
    w.appendChild(l); w.appendChild(control);
    return w;
  }
  function input(value, max, ph, onChange) {
    var el = document.createElement('input'); el.type = 'text'; el.value = value || ''; el.maxLength = max; el.placeholder = ph;
    el.addEventListener('input', function () { onChange(el.value); });
    return el;
  }
  function select(options, value, onChange, emptyLabel, labelFn) {
    var el = document.createElement('select');
    options.forEach(function (o) {
      var op = document.createElement('option'); op.value = o;
      op.textContent = o ? (labelFn ? labelFn(o) : o) : emptyLabel;
      if (o === value) op.selected = true;
      el.appendChild(op);
    });
    el.addEventListener('change', function () { onChange(el.value); });
    return el;
  }
  function btn(text, disabled, onClick, label, cls) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.disabled = disabled;
    if (label) b.setAttribute('aria-label', label);
    if (cls) b.className = cls;
    b.addEventListener('click', onClick);
    return b;
  }

  // ---------- shrink a photo before upload ----------
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, MAX_EDGE / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = Math.round(w * s); c.height = Math.round(h * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error('Could not read that photo.')); }, 'image/jpeg', 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Could not read "' + file.name + '". Try a JPG photo.')); };
      img.src = url;
    });
  }
  function upload(file, kind) {
    return shrink(file).then(function (b) { return call('upload', { blob: b, query: '&kind=' + kind }); });
  }

  $('#addInput').addEventListener('change', function (e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    var busy = $('#addBusy'), done = 0, failed = [];
    var target = current;
    busy.hidden = false; busy.textContent = 'Uploading 1 of ' + files.length + '…';
    files.reduce(function (p, file) {
      return p.then(function () {
        return upload(file, 'work').then(function (r) {
          data.galleries[target].photos.push({ src: r.url, alt: '', tag: '', caption: '' });
          markDirty();
        }).catch(function (x) {
          if (x.status === 401) throw x;
          failed.push(x.message);
        }).then(function () {
          done++; busy.textContent = 'Uploading ' + Math.min(done + 1, files.length) + ' of ' + files.length + '…';
        });
      });
    }, Promise.resolve()).then(function () {
      busy.textContent = failed.length ? failed.join(' ') : 'Added. Add a label and caption, then tap Save changes.';
      renderTabs(); render();
    }, function () { busy.hidden = true; showLogin(); });
  });

  // ---------- top photo / link picture ----------
  function renderSingle(s) {
    var pane = $('#singlePane'); pane.innerHTML = '';
    var card = document.createElement('div'); card.className = 'card ad-single';
    var img = document.createElement('img'); img.alt = 'Current ' + s.label.toLowerCase();
    img.src = BASE + '/site/' + s.key + '.jpg?t=' + Date.now();
    img.onerror = function () { img.onerror = null; img.src = 'assets/photos/' + s.key + '.jpg'; };
    var note = document.createElement('p'); note.className = 'ad-note'; note.textContent = s.note;
    var msg = document.createElement('p'); msg.className = 'ad-busy'; msg.hidden = true;
    var lab = document.createElement('label'); lab.className = 'ad-add';
    lab.innerHTML = '<span class="btn">Replace this photo</span>';
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    lab.appendChild(inp);
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0]; inp.value = '';
      if (!f) return;
      msg.hidden = false; msg.className = 'ad-busy'; msg.textContent = 'Uploading…';
      upload(f, s.key).then(function () {
        img.src = BASE + '/site/' + s.key + '.jpg?t=' + Date.now();
        msg.className = 'ad-ok'; msg.textContent = 'Done. No need to tap Save for this one.';
      }).catch(function (x) {
        if (x.status === 401) return showLogin();
        msg.className = 'ad-err'; msg.textContent = x.message;
      });
    });
    card.appendChild(img); card.appendChild(note); card.appendChild(lab); card.appendChild(msg);
    pane.appendChild(card);
  }

  // ---------- save ----------
  $('#saveBtn').addEventListener('click', function () {
    var b = $('#saveBtn'); b.disabled = true;
    $('#status').textContent = 'Saving…';
    call('save', { json: { data: data } }).then(function () {
      dirty = false;
      var gone = toDelete; toDelete = [];
      if (gone.length) call('delete', { json: { urls: gone } }).catch(function () {});
      $('#status').textContent = 'Saved. Live on the site within about 2 minutes.';
      $('#status').className = 'ad-status ad-ok';
    }).catch(function (x) {
      if (x.status === 401) { alert('You were signed out. Sign in again, then save.'); return showLogin(); }
      $('#status').textContent = x.message; $('#status').className = 'ad-status ad-err';
      b.disabled = false;
    });
  });

  // ---------- start ----------
  fetch(API + 'me', { credentials: 'same-origin' }).then(function (r) {
    if (r.ok) return showEditor();
    if (r.status === 503) return r.json().then(function (b) {
      showLogin(); $('#loginErr').textContent = b.error; $('#loginErr').hidden = false;
    });
    showLogin();
  }, showLogin);
})();
