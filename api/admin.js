// Solid Metal Roofing — private photo page, server side.
// Everything the admin page does goes through here. Nothing works without
// the password Jake set in Vercel (ADMIN_PASSWORD).
//
// Storage: Vercel Blob (BLOB_READ_WRITE_TOKEN is added by Vercel).
//   data/photos.json         the gallery lists the website reads
//   data/backup/<time>.json  a copy of the previous list on every save
//   work/<name>.jpg          uploaded gallery photos
//   site/hero.jpg            the big photo at the top of the home page
//   site/share.jpg           the picture shown when the site is shared

const crypto = require('crypto');
const { put, del, head } = require('@vercel/blob');

const COOKIE = 'sm_admin';
const DAYS = 30;
const LIVE_SITE = 'https://www.solidmetalroofing.com';
const GALLERY_KEYS = ['residential', 'agricultural', 'siding', 'repairs'];
const TAGS = ['', 'Before', 'After', 'Repair', 'In progress'];
const MAX_UPLOAD = 4 * 1024 * 1024;

// ---------- sign-in ----------
function secret() {
  // Tied to the password: changing the password signs every device out.
  return crypto.createHash('sha256').update('sm-admin|' + process.env.ADMIN_PASSWORD).digest();
}
function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}
function makeCookie() {
  const exp = String(Date.now() + DAYS * 86400000);
  return exp + '.' + sign(exp);
}
function readCookie(req) {
  const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}
function signedIn(req) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const [exp, sig] = readCookie(req).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = Buffer.from(sign(exp));
  const got = Buffer.from(sig);
  return good.length === got.length && crypto.timingSafeEqual(good, got);
}
function samePassword(given) {
  const a = crypto.createHash('sha256').update(String(given || '')).digest();
  const b = crypto.createHash('sha256').update(String(process.env.ADMIN_PASSWORD)).digest();
  return crypto.timingSafeEqual(a, b);
}
function setCookie(res, value, maxAge) {
  res.setHeader('Set-Cookie', COOKIE + '=' + encodeURIComponent(value) +
    '; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=' + maxAge);
}

// ---------- helpers ----------
function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
function readRaw(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(new Error('too big')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
async function readJSON(req) {
  const raw = await readRaw(req, 1024 * 1024);
  return raw.length ? JSON.parse(raw.toString('utf8')) : {};
}
function isJpeg(buf) {
  return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}
function clean(s, max) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}
function okSrc(src) {
  return /^assets\/(work|photos)\/[a-z0-9._-]+\.jpg$/i.test(src) ||
    /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/work\/[A-Za-z0-9._-]+\.jpg$/.test(src);
}

// Only keep what the website understands, so a bad save can't break the page.
function tidyData(input) {
  const out = { v: 1, savedAt: new Date().toISOString(), galleries: {} };
  for (const k of GALLERY_KEYS) {
    const list = (input && input.galleries && input.galleries[k] && input.galleries[k].photos) || [];
    out.galleries[k] = {
      photos: list.filter(p => p && okSrc(p.src)).slice(0, 200).map(p => {
        const photo = { src: p.src, alt: clean(p.alt, 200) };
        const tag = TAGS.includes(p.tag) ? p.tag : '';
        if (tag) photo.tag = tag;
        const cap = clean(p.caption, 120);
        if (cap) photo.caption = cap;
        return photo;
      })
    };
  }
  return out;
}

// The top photo and share picture live at fixed addresses the pages point to.
// The first time someone signs in, copy today's pictures there.
async function seedSitePhotos() {
  for (const name of ['hero', 'share']) {
    try {
      await head('site/' + name + '.jpg');
    } catch (e) {
      const r = await fetch(LIVE_SITE + '/assets/photos/' + name + '.jpg');
      if (!r.ok) throw new Error('could not copy ' + name + ': ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      const b = await put('site/' + name + '.jpg', buf, {
        access: 'public', contentType: 'image/jpeg', addRandomSuffix: false,
        allowOverwrite: true, cacheControlMaxAge: 3600
      });
      console.log('admin: copied', name, 'to', b.url);
    }
  }
}

// ---------- actions ----------
module.exports = async function handler(req, res) {
  const action = (req.query && req.query.action) ||
    new URL(req.url, 'http://x').searchParams.get('action') || '';

  if (!process.env.ADMIN_PASSWORD) return send(res, 503, { error: 'The photo page password has not been set up in Vercel yet.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return send(res, 503, { error: 'Photo storage is not connected.' });

  // Every change must come from the admin page itself.
  if (req.method !== 'GET' && req.headers['x-sm-admin'] !== '1') return send(res, 403, { error: 'Not allowed.' });

  try {
    if (action === 'login' && req.method === 'POST') {
      const body = await readJSON(req);
      if (!samePassword(body.password)) {
        await new Promise(r => setTimeout(r, 1200)); // slows down guessing
        return send(res, 401, { error: 'That password is not right.' });
      }
      setCookie(res, makeCookie(), DAYS * 86400);
      try { await seedSitePhotos(); } catch (e) { console.error('admin: seed', e.message); }
      return send(res, 200, { ok: true });
    }

    if (action === 'logout') {
      setCookie(res, '', 0);
      return send(res, 200, { ok: true });
    }

    if (!signedIn(req)) return send(res, 401, { error: 'Please sign in.' });

    if (action === 'me') return send(res, 200, { ok: true });

    if (action === 'upload' && req.method === 'POST') {
      const kind = new URL(req.url, 'http://x').searchParams.get('kind');
      const buf = await readRaw(req, MAX_UPLOAD);
      if (!isJpeg(buf)) return send(res, 400, { error: 'That file is not a photo the site can use.' });
      let b;
      if (kind === 'hero' || kind === 'share') {
        b = await put('site/' + kind + '.jpg', buf, {
          access: 'public', contentType: 'image/jpeg', addRandomSuffix: false,
          allowOverwrite: true, cacheControlMaxAge: 3600
        });
      } else {
        b = await put('work/photo.jpg', buf, {
          access: 'public', contentType: 'image/jpeg', addRandomSuffix: true
        });
      }
      return send(res, 200, { url: b.url });
    }

    if (action === 'save' && req.method === 'POST') {
      const body = await readJSON(req);
      const data = tidyData(body.data);
      const json = JSON.stringify(data);
      await put('data/backup/' + Date.now() + '.json', json, {
        access: 'public', contentType: 'application/json', addRandomSuffix: true
      });
      const b = await put('data/photos.json', json, {
        access: 'public', contentType: 'application/json', addRandomSuffix: false,
        allowOverwrite: true, cacheControlMaxAge: 60
      });
      return send(res, 200, { ok: true, url: b.url, count: GALLERY_KEYS.reduce((n, k) => n + data.galleries[k].photos.length, 0) });
    }

    if (action === 'delete' && req.method === 'POST') {
      const body = await readJSON(req);
      const urls = (Array.isArray(body.urls) ? body.urls : []).filter(u => okSrc(u) && /^https:/.test(u));
      if (urls.length) await del(urls);
      return send(res, 200, { ok: true, deleted: urls.length });
    }

    return send(res, 404, { error: 'Unknown action.' });
  } catch (err) {
    console.error('admin:', action, err && err.message);
    return send(res, 500, { error: 'Something went wrong. Try again in a minute.' });
  }
};
