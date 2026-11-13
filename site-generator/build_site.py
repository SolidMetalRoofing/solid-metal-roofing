"""Generates the static HTML pages for solidmetalroofing.com into the repo."""
import json, os, sys, html

REPO = sys.argv[1]
BASE = 'https://www.solidmetalroofing.com/'
PHONE_D, PHONE_T = '(780) 307-8599', '+17803078599'
EMAIL = 'jake@solidmetalroofing.com'
GOOGLE = 'https://share.google/ceUGSSyYaEfDljCls'
TOWNS = ['Barrhead', 'Athabasca', 'Morinville', 'Thorhild', 'Whitecourt', 'Slave Lake', 'Lac La Biche', 'Sturgeon County', 'Westlock County']

PHONE_SVG = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>'
MAIL_SVG = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>'
CHECK = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6DB33F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>'
EXPAND = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>'
OUT = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>'

NAV = [('services.html', 'Services'), ('gallery.html', 'Our Work'), ('profiles.html', 'Profiles'), ('colours.html', 'Colours'),
       ('faq.html', 'FAQ'), ('about.html', 'About'), ('blog.html', 'Blog'), ('contact.html', 'Free Quote')]


def head(title, desc, path, extra=''):
    url = BASE + ('' if path == 'index.html' else path)
    return f'''<!DOCTYPE html>
<html lang="en-CA">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Solid Metal Roofing">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{BASE}assets/photos/share.jpg">
  <meta name="theme-color" content="#0A0A0A">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="favicon.ico" sizes="48x48">
  <link rel="icon" type="image/png" sizes="96x96" href="assets/favicon-96.png">
  <link rel="icon" type="image/png" sizes="192x192" href="assets/icon-192.png">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="manifest" href="manifest.json">
{extra}</head>
<body>
'''


def header():
    links = ''.join(f'<a href="{h}">{n}</a>' for h, n in NAV)
    mlinks = '<a href="index.html">Home<span aria-hidden="true">›</span></a>' + ''.join(f'<a href="{h}">{n}<span aria-hidden="true">›</span></a>' for h, n in NAV)
    return f'''  <a class="sr-only" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a href="index.html" class="logo" aria-label="Solid Metal Roofing home"><img src="assets/logo.png" alt="Solid Metal Roofing" width="560" height="350"></a>
      <nav class="nav-desktop" aria-label="Main">{links}</nav>
      <a href="tel:{PHONE_T}" class="btn sm hdr-call">{PHONE_SVG}Call Now</a>
      <button type="button" class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </header>
  <div class="mobile-menu" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="mobile-menu-top">
      <img src="assets/logo.png" alt="Solid Metal Roofing" width="560" height="350">
      <button type="button" class="x-btn" aria-label="Close menu">&times;</button>
    </div>
    <nav aria-label="Mobile">{mlinks}</nav>
    <div class="mobile-menu-cta">
      <a href="contact.html#quote-form" class="btn">{MAIL_SVG}Email Us</a>
      <a href="tel:{PHONE_T}" class="btn-outline">{PHONE_SVG}Call {PHONE_D}</a>
    </div>
  </div>
  <div class="pinbar">
    <a href="contact.html#quote-form" class="btn">{MAIL_SVG}Email</a>
    <a href="tel:{PHONE_T}" class="btn-outline">{PHONE_SVG}Call</a>
  </div>

  <main id="main">
'''


def footer():
    return f'''  </main>

  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <img src="assets/logo.png" alt="Solid Metal Roofing" width="560" height="350" loading="lazy">
          <p>Quality metal roofing you can count on. Metal reroofs and metal roof repairs in Westlock and area.</p>
          <div class="social">
            <a href="https://www.facebook.com/share/1T7RRtgvyo/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="https://www.instagram.com/solidmetalroofing?igsh=MXdqZnJwMWdjajAzNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
          </div>
        </div>
        <div><div class="footer-h">Roofing</div><ul class="footer-links"><li><a href="services.html">Services</a></li><li><a href="gallery.html">Our Work</a></li><li><a href="profiles.html">Panel Profiles</a></li><li><a href="colours.html">Colour Preview</a></li></ul></div>
        <div><div class="footer-h">Company</div><ul class="footer-links"><li><a href="about.html">About</a></li><li><a href="faq.html">FAQ</a></li><li><a href="blog.html">Blog</a></li><li><a href="contact.html">Free Quote</a></li></ul></div>
        <div><div class="footer-h">Contact</div><ul class="footer-links"><li>Westlock, Alberta</li><li><a href="tel:{PHONE_T}">{PHONE_D}</a></li><li><a href="mailto:{EMAIL}">{EMAIL}</a></li><li>Servicing Westlock &amp; area</li></ul></div>
      </div>
      <div class="footer-bottom"><span>&copy; 2026 Solid Metal Roofing. All rights reserved.</span><span>Panels by VersaFrame Inc.</span></div>
    </div>
  </footer>
  <script src="site-data.js"></script>
  <script src="script.js"></script>
</body>
</html>
'''


def banner(text, tag='h2'):
    return f'<div class="banner"><{tag}>{text}</{tag}></div>'


def page_hero(crumb, h1, sub):
    return f'''    <section class="page-hero seams">
      <div class="wrap">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a> › <span>{crumb}</span></nav>
        <h1>{h1}</h1>
        <p>{sub}</p>
      </div>
    </section>
'''


# ---------- shared blocks ----------
WORK = f'''        <div class="g2">
          <div data-gallery="residential"></div>
          <div data-gallery="agricultural"></div>
          <div data-gallery="siding"></div>
          <div data-gallery="repairs"></div>
        </div>
        <div class="card repair-card" id="repairs">
          <div class="left">
            <p class="label" style="font-size:18px;font-weight:800;letter-spacing:.08em">Metal Roof Repair</p>
            <h3>Existing metal roof leaking?</h3>
            <p class="body">I see a lot of metal roofs that were done poorly. If yours is leaking, call or email — I&#39;ll fix it properly, with the right boots and flashings, not more silicone.</p>
          </div>
          <ul class="checks">
            <li>{CHECK}<span>Missing or failed pipe boots on vent pipes and sewer stacks</span></li>
            <li>{CHECK}<span>Chimneys sealed with silicone instead of proper flashing</span></li>
            <li>{CHECK}<span>Gaps filled with caulking that has cracked or let go</span></li>
            <li>{CHECK}<span>Leaks you can&#39;t trace — I&#39;ll find where the water is getting in</span></li>
          </ul>
        </div>
        <div class="note"><p><strong>Metal only.</strong> I don&#39;t install asphalt shingles or flat roofs (tar, torch-on or rubber). If that&#39;s what you need, a contractor who specializes in it will serve you better.</p></div>
'''

PROFILES = [
    ('9-36 Panel', '9-36', 'Roof / Wall / Liner', '3/12 and greater', '36" width', "3' to 45'", '3/4" on 9" centre', 'Solid or Open Frame', '29 GA · 26 GA · 24 GA', 'Exposed fastener'),
    ('7/8" Corrugated', 'corrugated', 'Roof / Wall / Liner', '1/12 and greater', '35" (26 ga) · 36" (24 ga)', "3' to 45'", '7/8" on 2.66" centre', 'Solid or Open Frame', '26 GA · 24 GA · 22 GA', 'Exposed fastener'),
    ('12-36 Panel', '12-36', 'Roof / Wall', '1/12 and greater', '36" width', "3' to 45'", '1.5" on 12" centre', 'Solid or Open Frame', '26 GA · 24 GA · 22 GA', 'Exposed fastener'),
    ('Diamond Rib', 'diamond-rib', 'Roof / Wall', '3/12 and greater', '36" width', "3' to 45'", '3/4" on 6" centre', 'Solid or Open Frame', '26 GA · 24 GA', 'Exposed fastener'),
    ('Standing Seam', 'standing-seam', 'Roof', '1/12 and greater', '12" to 24" width', "3' to 45'", '1", 1-1/2", or 2"', 'Solid', '26 GA · 24 GA · 22 GA', 'Hidden fastener'),
    ('Snaplock', 'snaplock', 'Roof', '3/12 and greater', '12" to 20" width', "3' to 45'", '1"', 'Solid', '26 GA · 24 GA · 22 GA', 'Hidden fastener'),
]


def profile_card(p):
    name, slug, use, slope, cover, length, rib, sub, ga, fast = p
    e = html.escape
    rows = ''.join(f'<dt>{k}</dt><dd>{e(v)}</dd>' for k, v in [('USE', use), ('SLOPE', slope), ('COVER', cover), ('LENGTH', length), ('RIB', rib), ('SUB', sub)])
    return f'''          <article class="card profile" id="{slug}">
            <div class="card-head"><h3>{e(name)}</h3></div>
            <button type="button" class="profile-img" data-zoom="assets/profiles/{slug}.jpg" data-caption="{e(name)}" aria-label="View {e(name)} full screen"><img src="assets/profiles/{slug}.jpg" alt="3D render of the {e(name)} metal roofing profile" width="1280" height="588" loading="lazy"></button>
            <dl class="specs">{rows}</dl>
            <div class="profile-foot"><span>{ga}</span><span>{fast}</span></div>
          </article>
'''


MINI = '        <div class="mini-profiles">\n' + ''.join(
    f'          <a class="card" href="profiles.html#{p[1]}"><img src="assets/profiles/{p[1]}.jpg" alt="3D render of the {html.escape(p[0])} metal roofing profile" width="1280" height="588" loading="lazy"><div class="name">{html.escape(p[0])}</div></a>\n' for p in PROFILES) + '        </div>\n'

GAUGES = [
    ('24', '24 GA — Thickest', '24 gauge — premium', 'Best for standing seam, high-end homes, commercial buildings, and roofs over open purlins.',
     'The thickest of the three. It is the industry standard for standing seam and engineered commercial roofs, spans open framing better, and gives the most dent resistance against hail, heavy snow and wind.',
     'Costs more than 26 gauge, is heavier and harder to work, and comes in fewer colours. More steel than most houses and outbuildings need.',
     'All six — 9-36, 7/8" Corrugated, 12-36, Diamond Rib, Standing Seam, Snaplock.'),
    ('26', '26 GA — Mid', '26 gauge — most popular for homes', 'The usual choice for houses and larger barns.',
     'Noticeably stiffer than 29 gauge, so it holds up better to Alberta hail, keeps panels looking straighter, and handles snow loads well. It is the balance of strength and price most homeowners pick, and it comes in every stock colour.',
     'Costs a bit more than 29 gauge.',
     'All six — 9-36, 7/8" Corrugated, 12-36, Diamond Rib, Standing Seam, Snaplock.'),
    ('29', '29 GA — Thinnest', '29 gauge — standard', 'Most common on outbuildings: sheds, garages, shops, smaller barns, and wall or liner panels.',
     'The most economical option and plenty for buildings that are not your home. Lightweight and quick to install.',
     'Dents more easily in hail and shows waviness in the panels sooner. Not the pick for a house where looks and longevity matter.',
     '9-36 only.'),
]
GAUGE = '''        <div class="card gauge" id="gauge">
          <p class="label" style="font-weight:800;letter-spacing:.16em;font-size:15px">Understanding gauge</p>
          <p class="body"><strong style="color:#fff">Lower number = thicker steel.</strong> A thicker panel gives better dent resistance and a longer service life, especially against hail and Alberta weather. Tap a gauge to see where it fits.</p>
          <div class="gauge-btns" role="group" aria-label="Choose a gauge">
''' + ''.join(f'            <button type="button" aria-expanded="false" aria-controls="ga{g[0]}">{g[1]} <span aria-hidden="true">+</span></button>\n' for g in GAUGES) + '          </div>\n' + ''.join(
    f'''          <div class="gauge-panel" id="ga{g[0]}" hidden>
            <p class="t">{g[2]}</p>
            <p class="b">{g[3]}</p>
            <p>{g[4]}</p>
            <p class="s"><strong>Trade-off:</strong> {g[5]}</p>
            <p class="s"><strong>Profiles:</strong> {html.escape(g[6])}</p>
          </div>
''' for g in GAUGES) + '        </div>\n'

COLOURS = f'''        <div class="card cw split top" data-colours>
          <div class="cw-side">
            <h3 class="h-big">See it on a house <span class="green">before you pick.</span></h3>
            <p class="body">Real VersaFrame colours on a real job. Tap one. Screens aren&#39;t exact — ask and I&#39;ll bring a physical sample to your place.</p>
            <div class="cw-tabs" role="group" aria-label="Colour line">
              <button type="button" data-tab="standard" aria-pressed="true">Standard SMP</button>
              <button type="button" data-tab="premium" aria-pressed="false">PVDF Premium</button>
            </div>
            <div class="cw-group" data-group="standard">
              <p class="label">SMP standard colours · 29, 26 &amp; 24 gauge</p>
              <div class="swatches" data-swatches="standard" role="group" aria-label="Standard roof colours"></div>
              <p class="body">Selected: <strong style="color:#fff" data-colour-name></strong></p>
            </div>
            <div class="cw-group" data-group="premium" hidden>
              <p class="label">Wood-look / printed</p>
              <div class="tswatches" data-swatches="woodgrain" role="group" aria-label="Printed woodgrain finishes"></div>
              <p class="label" style="margin-top:6px">Textured / matte</p>
              <div class="tswatches" data-swatches="textured" role="group" aria-label="Textured finishes"></div>
              <p class="body">Selected: <strong style="color:#fff" data-colour-name></strong> — printed finishes look best in person; ask and I&#39;ll bring samples.</p>
            </div>
          </div>
          <figure class="cw-fig">
            <button type="button" class="cw-photo" aria-label="View this colour full screen">
              <img src="assets/colours/dark-brown.jpg" alt="Bungalow with a Dark Brown metal roof" width="1400" height="795">
              <span>{EXPAND}Full screen</span>
            </button>
            <figcaption>A real Solid Metal Roofing job, shown in VersaFrame <span data-colour-name>Dark Brown</span>.</figcaption>
          </figure>
        </div>
'''

FAQS = [
    ('Will snow slide off a metal roof?', 'Yes — metal sheds snow much faster than shingles. Over doors, walkways and decks I recommend snow guards so it comes off in a controlled way. We will go over where they make sense on your house.'),
    ('Is it loud when it rains?', 'Over a solid roof deck with underlayment, most people hear very little difference from shingles. The noisy reputation comes mostly from tin on open framing, like an old shed.'),
    ('Can you go over my old shingles?', 'Sometimes. It depends on how many layers are on, the condition of the deck and what the job needs. I check on site and tell you straight whether a tear-off is the better call.'),
    ('How long does a metal roof last?', 'Decades longer than asphalt. The paint and panel warranty depends on the product and gauge you choose. I will show you the manufacturer&#39;s warranty for your panel with your quote.'),
    ('What does a metal roof cost?', 'More up front than shingles, usually less over the life of the house since you are not reroofing every 15–20 years. Every roof is different, so I measure and give you a real number for free.'),
    ('My metal roof is leaking. Can you fix it?', 'Yes. Most leaks I see on metal roofs come from missing pipe boots, chimneys sealed with silicone instead of flashing, or caulked gaps that have failed. I will find where the water is getting in and fix it properly with the right boots and flashings.'),
    ('Do you do shingles or flat roofs?', 'No. I only install metal. For asphalt shingles or flat roofs like tar, torch-on or rubber, you will want a contractor who specializes in those.'),
    ('How far do you travel?', 'I am based in Westlock and work within about two hours. If you are a bit farther out, or it is a bigger job, call anyway. We may be able to work something out.'),
]


def faq_block(items, open_first=True):
    out = '        <div class="faq">\n'
    for i, (q, a) in enumerate(items):
        out += f'          <details{" open" if (i == 0 and open_first) else ""}><summary>{q}</summary><p>{a}</p></details>\n'
    return out + '        </div>\n'


AREA = '''        <div class="split">
          <div class="stack" style="gap:14px">
            <h3 class="h-big">Based in Westlock. <span class="green">Working within about two hours.</span></h3>
            <p class="body">A little farther out, or a bigger job? Call anyway — we may be able to work something out.</p>
          </div>
          <div class="chips"><span class="home">Westlock</span>''' + ''.join(f'<span>{t}</span>' for t in TOWNS) + '''</div>
        </div>
'''

THREE = '''          <div class="three">
            <p class="label">Three things we&#39;ll decide together</p>
            <p><strong>1. Your colour.</strong> Try them on a real roof in the <a href="colours.html">colour preview</a>.</p>
            <p><strong>2. Your panel profile.</strong> Compare all six in <a href="profiles.html">roofing profiles</a>.</p>
            <p><strong>3. Tear-off or roof over.</strong> I&#39;ll check your roof and tell you straight whether the old shingles should come off or can stay.</p>
            <p class="tip">Have a look at colours and profiles before I come out, and your quote goes a lot faster.</p>
          </div>
'''

QUOTE = f'''    <section class="section" id="quote">
      <div class="wrap">
        <div class="card quote seams">
          <h2>Ready for a roof you won&#39;t <span class="green">think about again?</span></h2>
          <p class="body" style="font-size:18px;max-width:600px">Free, no-pressure quote. I&#39;ll come measure your roof and give you a real number.</p>
{THREE}          <div class="btn-row" style="justify-content:center;margin-top:8px">
            <a href="contact.html#quote-form" class="btn">Get a free quote</a>
            <a href="tel:{PHONE_T}" class="btn-outline">Call {PHONE_D}</a>
          </div>
        </div>
      </div>
    </section>
'''

REVIEWS = f'''        <div class="reviews" data-reviews hidden>
          <div class="card review-sum" data-review-sum></div>
          <div class="g3 review-grid" data-review-grid></div>
        </div>
        <div class="card review-cta">
          <div class="stack" style="gap:8px;max-width:640px">
            <h3 class="h-big" style="font-size:26px">Don&#39;t take my word for it.</h3>
            <p class="body">Read what past customers have said about their roofs on our Google profile.</p>
          </div>
          <a href="{GOOGLE}" target="_blank" rel="noopener noreferrer" class="btn-outline" data-reviews-link>Read our reviews on Google {OUT}</a>
        </div>
'''


def section(inner, sid=''):
    return f'    <section class="section"{f" id={chr(34)}{sid}{chr(34)}" if sid else ""}>\n      <div class="wrap stack">\n{inner}      </div>\n    </section>\n'


def write(name, content):
    with open(os.path.join(REPO, name), 'w') as f:
        f.write(content)
    print('wrote', name, len(content))


AREAS_JSON = json.dumps([{"@type": "Place", "name": t + ', Alberta'} for t in ['Westlock'] + TOWNS])
LD_BUSINESS = f'''  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    "name": "Solid Metal Roofing",
    "url": "{BASE}",
    "logo": "{BASE}assets/logo.png",
    "image": "{BASE}assets/photos/share.jpg",
    "telephone": "{PHONE_T}",
    "email": "{EMAIL}",
    "description": "Metal reroofs and metal roof repairs for homes, barns and shops in Westlock, Alberta and area.",
    "address": {{ "@type": "PostalAddress", "addressLocality": "Westlock", "addressRegion": "AB", "addressCountry": "CA" }},
    "areaServed": {AREAS_JSON},
    "sameAs": ["https://www.facebook.com/share/1T7RRtgvyo/", "https://www.instagram.com/solidmetalroofing"]
  }}
  </script>
'''
import re
strip = lambda s: html.unescape(re.sub('<[^>]+>', '', s))
LD_FAQ = '  <script type="application/ld+json">\n  ' + json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
    {"@type": "Question", "name": strip(q), "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in FAQS]}, ensure_ascii=False) + '\n  </script>\n'

TOWN_LIST = 'Westlock, Barrhead, Athabasca, Morinville, Whitecourt, Slave Lake and Lac La Biche'

# ---------- index ----------
write('index.html', head('Metal Roofing in Westlock, Barrhead & Athabasca | Solid Metal Roofing',
                         f'Metal reroofs and metal roof repairs for homes, barns and shops in {TOWN_LIST}. Free quotes. Call {PHONE_D}.',
                         'index.html', LD_BUSINESS) + header() + f'''    <section class="hero seams">
      <div class="wrap split">
        <div class="hero-copy">
          <p class="eyebrow">Quality metal roofing you can count on</p>
          <h1>Metal roofs, built right for <span class="green">Westlock</span> &amp; area.</h1>
          <p class="sub">Metal reroofs for homes, barns and shops north of Edmonton. Owner-installed — the guy who quotes your roof is the guy who builds it.</p>
          <div class="btn-row">
            <a href="contact.html#quote-form" class="btn">Get a free quote</a>
            <a href="tel:{PHONE_T}" class="btn-outline">{PHONE_D}</a>
          </div>
        </div>
        <div class="hero-img"><img src="assets/photos/hero.jpg" alt="Brown metal roof on a two-storey home with red siding, surrounded by aspen trees" width="1440" height="800" fetchpriority="high"></div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="card stats">
          <div><b>10+</b><span>Years in the trade</span></div>
          <div><b>2025</b><span>Est. in Westlock</span></div>
        </div>
      </div>
    </section>

''' + section(banner('What we do — metal roofing') + '\n' + WORK, 'work')
      + section(banner('Roofing profiles') + '\n        <p class="lead">Premium metal panels manufactured by <strong class="green">VersaFrame Inc.</strong>, one of Western Canada&#39;s leading metal roofing manufacturers. Tap a profile for full specs.</p>\n' + MINI + '        <div><a href="profiles.html" class="btn-outline sm">See all profile specs</a></div>\n', 'profiles')
      + section(banner('Colour preview') + '\n' + COLOURS + GAUGE, 'colours')
      + section(banner('What customers say') + '\n' + REVIEWS, 'reviews')
      + section(banner('Common questions') + '\n' + faq_block(FAQS[:5]) + '        <div style="text-align:center"><a href="faq.html" class="btn-outline sm">See all questions</a></div>\n', 'faq')
      + section(banner('Service area') + '\n' + AREA, 'area') + QUOTE + footer())

# ---------- services ----------
write('services.html', head('Metal Reroofing & Metal Roof Repair in Westlock | Solid Metal Roofing',
                            f'Residential and agricultural metal reroofs, steel siding and trim, and metal roof repairs in Westlock and area. Metal only. Call {PHONE_D}.',
                            'services.html') + header()
      + page_hero('Services', 'What we do — <span class="green">metal roofing</span>', 'Tear-off and reroof in steel for homes, barns and shops, plus proper repairs on existing metal roofs. Flip through real jobs in each category.')
      + section(WORK) + section(banner('Service area') + '\n' + AREA) + QUOTE + footer())

# ---------- gallery ----------
write('gallery.html', head('Our Work: Metal Roofing Photos | Solid Metal Roofing, Westlock',
                           'Before and after photos of metal reroofs, barn re-sheeting and metal roof repairs by Solid Metal Roofing in Westlock and area.',
                           'gallery.html') + header()
      + page_hero('Our Work', 'Our <span class="green">work</span>', 'Real jobs from Westlock and area. Tap any photo to view it full screen, then swipe through the rest.')
      + section('''        <div class="filters" role="group" aria-label="Filter photos">
          <button type="button" data-filter="all" aria-pressed="true">All</button>
          <button type="button" data-filter="residential" aria-pressed="false">Residential</button>
          <button type="button" data-filter="agricultural" aria-pressed="false">Agricultural</button>
          <button type="button" data-filter="siding" aria-pressed="false">Siding &amp; Trim</button>
          <button type="button" data-filter="repairs" aria-pressed="false">Repairs</button>
        </div>
        <div class="work-grid" id="workGrid"></div>
        <noscript><p class="body">Turn on JavaScript to view the photo gallery.</p></noscript>
''') + QUOTE + footer())

# ---------- profiles ----------
write('profiles.html', head('Metal Roofing Profiles & Gauges | Solid Metal Roofing, Westlock',
                            'Compare six VersaFrame metal roofing profiles: 9-36, 12-36, 7/8" corrugated, Diamond Rib, Standing Seam and Snaplock. Specs, gauges and where each one fits.'.replace('"', '&quot;'),
                            'profiles.html') + header()
      + page_hero('Profiles', 'Roofing <span class="green">profiles</span>', 'Premium metal panels manufactured by VersaFrame Inc., one of Western Canada&#39;s leading metal roofing manufacturers. Tap a picture to view it full screen.')
      + section('        <div class="g2">\n' + ''.join(profile_card(p) for p in PROFILES) + '        </div>\n' + GAUGE
                + '        <div class="note"><p><strong>Not sure which profile?</strong> That&#39;s normal. I&#39;ll go over the options for your roof and slope when I come out to quote.</p></div>\n')
      + QUOTE + footer())

# ---------- colours ----------
write('colours.html', head('Metal Roof Colours: Preview on a Real Roof | Solid Metal Roofing',
                           'Try 35 standard VersaFrame colours and 22 woodgrain and textured finishes on a real metal roof before you choose. Serving Westlock and area.',
                           'colours.html') + header()
      + page_hero('Colours', 'Colour <span class="green">preview</span>', 'Pick any VersaFrame colour and see it on a real roof we installed. Then ask for a physical sample before you decide.')
      + section(COLOURS + GAUGE + '        <div class="note"><p><strong>Screens are a guide only.</strong> Colours look different on every phone and monitor. I&#39;ll bring physical samples to your place so you can see them against your siding and trim.</p></div>\n')
      + QUOTE + footer())

# ---------- faq ----------
write('faq.html', head('Metal Roofing FAQ | Solid Metal Roofing, Westlock',
                       'Answers to common metal roofing questions: snow, noise, going over shingles, cost, leaks and how far we travel from Westlock.',
                       'faq.html', LD_FAQ) + header()
      + page_hero('FAQ', 'Common <span class="green">questions</span>', 'What people around Westlock ask me most before they decide on a metal roof.')
      + section(faq_block(FAQS)) + QUOTE + footer())

# ---------- contact ----------
write('contact.html', head('Free Metal Roofing Quote in Westlock & Area | Solid Metal Roofing',
                           f'Get a free metal roofing quote in {TOWN_LIST}. Call {PHONE_D} or send the form.',
                           'contact.html') + header()
      + page_hero('Free Quote', 'Get a <span class="green">free quote</span>', 'Send the form or call. I&#39;ll come measure your roof and give you a real number, with no pressure.')
      + f'''    <section class="section" id="quote-form">
      <div class="wrap split top">
        <form id="contactForm" class="card form" novalidate>
          <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" aria-hidden="true">
          <div class="field-row">
            <div class="field"><label for="name">Name *</label><input type="text" id="name" name="name" required autocomplete="name"></div>
            <div class="field"><label for="town">Town or area</label><input type="text" id="town" name="town" placeholder="e.g. Barrhead" autocomplete="address-level2"></div>
          </div>
          <div class="field-row">
            <div class="field"><label for="email">Email *</label><input type="email" id="email" name="email" required autocomplete="email"></div>
            <div class="field"><label for="phone">Phone</label><input type="tel" id="phone" name="phone" placeholder="(780) 555-0000" autocomplete="tel"></div>
          </div>
          <div class="field"><label for="service">What do you need?</label>
            <select id="service" name="service">
              <option value="">Select one...</option>
              <option value="residential-reroof">Residential metal reroof</option>
              <option value="barn-shop-reroof">Barn / shop metal reroof</option>
              <option value="metal-roof-repair">Metal roof repair</option>
              <option value="other">Other / not sure</option>
            </select>
          </div>
          <div class="field"><label for="message">About your roof *</label><textarea id="message" name="message" required placeholder="House, barn or shop? Rough size, what is on it now, and any colour or profile you like."></textarea></div>
          <button type="submit" class="btn">Send my quote request</button>
          <p class="muted" style="font-size:14px">Have photos of your roof? Reply to our email with them after you send this.</p>
        </form>
        <div class="stack" style="gap:20px">
          <div class="card" style="padding:24px">
            <ul class="contact-list">
              <li><small class="label">Call or text</small><a href="tel:{PHONE_T}">{PHONE_D}</a></li>
              <li><small class="label">Email</small><a href="mailto:{EMAIL}">{EMAIL}</a></li>
              <li><small class="label">Based in</small><span style="color:#fff;font-weight:700;font-size:19px">Westlock, Alberta</span></li>
            </ul>
          </div>
{THREE.replace('max-width:600px', '')}          <div class="note"><p><strong>Metal only.</strong> I don&#39;t install asphalt shingles or flat roofs.</p></div>
        </div>
      </div>
    </section>
''' + section(banner('Service area') + '\n' + AREA) + footer())

# ---------- about ----------
write('about.html', head('About Solid Metal Roofing | Metal Roofer in Westlock, Alberta',
                         'Solid Metal Roofing is an owner-operated metal roofing company based in Westlock, Alberta, focused only on metal roofs for homes, barns and shops.',
                         'about.html') + header()
      + page_hero('About', 'About <span class="green">Solid Metal Roofing</span>', 'Westlock-based and owner-operated. Built on the belief that every property deserves a roof that can take whatever Alberta throws at it.')
      + '''    <section class="section">
      <div class="wrap split top">
        <div class="about-photo"><img src="assets/jake.jpg" alt="Jake, owner of Solid Metal Roofing" width="1280" height="1600" loading="lazy"></div>
        <div class="prose">
          <h2>Our story</h2>
          <p>Solid Metal Roofing started from a simple idea: homeowners and farmers around here deserve roofing that doesn&#39;t need replacing every 15 years. After years working in the trades and seeing roofs fail after every hailstorm season, we decided to build a company focused exclusively on metal — the material that outlasts everything else.</p>
          <p>Today we reroof homes, barns and shops in Westlock and the surrounding area. Every project gets the same level of care: proper planning, quality materials and a clean installation. The guy who quotes your roof is the guy who builds it.</p>
          <p>We&#39;re not the biggest roofing company in Alberta. We&#39;re the one that shows up, does it right, and stands behind the work.</p>
        </div>
      </div>
    </section>
''' + section(banner('What we stand for') + '''
        <div class="g3">
          <div class="card card-body value"><h3>Integrity</h3><p>Honest quotes, honest timelines, honest work. We tell you what you need — not what pads the invoice.</p></div>
          <div class="card card-body value"><h3>Quality</h3><p>We use premium panels from VersaFrame, a trusted Canadian supplier, and install to manufacturer specs — every time, no shortcuts.</p></div>
          <div class="card card-body value"><h3>Community</h3><p>We live here. We work here. Our reputation is our livelihood — and we protect it the same way we protect your property.</p></div>
        </div>
''') + section(banner('Why choose us') + '''
        <div class="g2">
          <div class="card card-body value"><h3>Licensed &amp; insured</h3><p>Fully licensed, WCB-covered, and insured for your peace of mind on every project.</p></div>
          <div class="card card-body value"><h3>Transparent pricing</h3><p>Detailed, written quotes with no hidden fees. You know the cost before we touch a single panel.</p></div>
          <div class="card card-body value"><h3>On-time delivery</h3><p>We set a schedule and stick to it. No ghosting, no month-long delays, no excuses.</p></div>
          <div class="card card-body value"><h3>Warranty backed</h3><p>Our workmanship warranty sits on top of manufacturer material warranties. Double the protection.</p></div>
        </div>
''') + QUOTE + footer())

# ---------- blog ----------
write('blog.html', head('Metal Roofing Blog | Solid Metal Roofing, Westlock',
                        'Metal roofing advice from Solid Metal Roofing in Westlock: metal vs shingles, maintenance and the real benefits in Alberta weather.',
                        'blog.html') + header()
      + page_hero('Blog', 'Roofing <span class="green">advice</span>', 'Straight answers on metal roofing from the job site.')
      + section('        <div class="g3" id="blogGrid"></div>\n        <noscript><p class="body">Turn on JavaScript to view the articles.</p></noscript>\n') + QUOTE + footer())


def article_page(fname, title, desc, slug=None):
    body = (f'<article class="prose" data-blog-slug="{slug}"><p>Loading article...</p></article>' if slug
            else '<article class="prose" id="article-body"><p>Loading article...</p></article>')
    h1 = f'<h1{"" if slug else " id=" + chr(34) + "article-title" + chr(34)}>{title}</h1>'
    meta = '' if slug else '<p id="article-meta"></p>'
    crumb = title if slug else '<span id="breadcrumb-title">Article</span>'
    write(fname, head(f'{html.unescape(title)} | Solid Metal Roofing'.replace('&', '&amp;') if slug else 'Blog | Solid Metal Roofing', desc, fname) + header() + f'''    <section class="page-hero seams">
      <div class="wrap">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a> › <a href="blog.html">Blog</a> › <span>{crumb}</span></nav>
        {h1}
        {meta}
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="article">
          {body}
          <p style="margin-top:32px;padding-top:24px;border-top:1px solid #2A2A2A"><a href="blog.html" style="font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-size:15px">← Back to blog</a></p>
        </div>
      </div>
    </section>
''' + QUOTE + footer())


article_page('blog-article.html', 'Article', 'Metal roofing advice from Solid Metal Roofing in Westlock, Alberta.')
article_page('blog-metal-vs-shingles.html', 'Metal Roofing vs Asphalt Shingles — Which Is Better for Alberta?', 'Metal roofing compared with asphalt shingles on lifespan, cost, energy and maintenance in Alberta weather.', 'metal-vs-shingles')
article_page('blog-roof-maintenance.html', 'How to Maintain Your Metal Roof for Decades of Protection', 'Simple steps to extend the life of your metal roof and protect your investment year-round.', 'roof-maintenance')
article_page('blog-metal-roof-benefits.html', 'The Real Benefits of Metal Roofing in Alberta', 'From hail resistance to energy savings: why metal roofing is the smart long-term choice for Alberta properties.', 'metal-roof-benefits')

# ---------- sitemap, robots ----------
pages = ['index.html', 'services.html', 'gallery.html', 'profiles.html', 'colours.html', 'faq.html', 'about.html', 'contact.html', 'blog.html',
         'blog-metal-vs-shingles.html', 'blog-roof-maintenance.html', 'blog-metal-roof-benefits.html']
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
    f'  <url><loc>{BASE}{"" if p == "index.html" else p}</loc><lastmod>2026-11-12</lastmod></url>\n' for p in pages) + '</urlset>\n'
write('sitemap.xml', sm)
write('robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {BASE}sitemap.xml\n')
