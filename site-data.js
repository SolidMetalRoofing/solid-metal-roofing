/* ============================================================
   SOLID METAL ROOFING — Site Data
   ============================================================

   HOW TO ADD A JOB PHOTO:
   1. Drop the image in /assets/work/ (about 1200px wide is plenty)
   2. Add one line to the right list in GALLERIES below:
        { src: 'assets/work/your-photo.jpg', alt: 'What it shows',
          tag: 'Before', caption: 'Short caption' }
      tag can be 'Before', 'After', 'Repair', 'In progress' or left out.

   HOW TO ADD A NEW BLOG POST:
   1. Add one entry to the BLOG_POSTS array below
   2. Add the article text to BLOG_CONTENT under the same slug

   COLOURS:
   Each colour needs a picture at assets/colours/<id>.jpg
   (woodgrain and textured use assets/colours/p-<id>.jpg and a
   swatch at assets/colours/thumbs/<id>.jpg).
   ============================================================ */

var GALLERIES = {
  residential: {
    title: 'Residential',
    body: 'Tear-off and reroof in steel — standing seam or exposed-fastener panels, with proper trims and flashings.',
    photos: [
      { src: 'assets/photos/bungalow.jpg', alt: 'Bungalow with a new dark brown metal roof', tag: 'After', caption: 'Full reroof in dark brown' },
      { src: 'assets/photos/hero.jpg', alt: 'Brown metal roof on a two-storey home with red siding', tag: 'After', caption: 'Two-storey reroof in brown' },
      { src: 'assets/work/residential-5a.jpg', alt: 'Old asphalt shingle roof before the reroof', tag: 'Before', caption: 'Old shingles' },
      { src: 'assets/work/residential-5b.jpg', alt: 'Bungalow with old shingles before the reroof', tag: 'Before', caption: 'Old shingles' },
      { src: 'assets/work/residential-6a.jpg', alt: 'New Iron Ore metal roof around a brick chimney', tag: 'After', caption: '9-36 profile in Iron Ore' },
      { src: 'assets/work/residential-6b.jpg', alt: 'Bungalow with a new Iron Ore metal roof', tag: 'After', caption: '9-36 profile in Iron Ore' },
      { src: 'assets/work/residential-7a.jpg', alt: 'New Iron Ore metal roof seen from the ridge', tag: 'After', caption: '9-36 profile in Iron Ore' },
      { src: 'assets/work/residential-7b.jpg', alt: 'Iron Ore metal roof over a porch', tag: 'After', caption: '9-36 profile in Iron Ore' },
      { src: 'assets/work/residential-2a.jpg', alt: 'Cedar shake roof before the reroof', tag: 'Before', caption: 'Cedar shakes' },
      { src: 'assets/work/residential-2b.jpg', alt: 'Cedar shake roof and dormer before the reroof', tag: 'Before', caption: 'Cedar shakes' },
      { src: 'assets/work/residential-3a.jpg', alt: 'Roof strapped and ready for metal panels', tag: 'In progress', caption: 'Strapped for 9-36 in Sapphire Blue' },
      { src: 'assets/work/residential-3b.jpg', alt: 'Sapphire Blue metal panels going on', tag: 'In progress', caption: '9-36 in Sapphire Blue' },
      { src: 'assets/work/residential-4a.jpg', alt: 'Finished Sapphire Blue metal roof', tag: 'After', caption: '9-36 in Sapphire Blue' },
      { src: 'assets/work/residential-4b.jpg', alt: 'Finished Sapphire Blue metal roof from the ridge', tag: 'After', caption: '9-36 in Sapphire Blue' },
      { src: 'assets/work/residential-1a.jpg', alt: 'Black metal garage roof close up', tag: 'After', caption: 'Garage roof, 9-36 profile in Black' },
      { src: 'assets/work/residential-1b.jpg', alt: 'Garage with a new black metal roof', tag: 'After', caption: 'Garage roof, 9-36 profile in Black' }
    ]
  },
  agricultural: {
    title: 'Agricultural',
    body: 'Re-sheeting barns, shops and quonsets with new steel roofing.',
    photos: [
      { src: 'assets/photos/barn.jpg', alt: 'Red gambrel barn with a charcoal steel roof', tag: 'After', caption: 'Barn re-sheeted in charcoal' },
      { src: 'assets/work/agricultural-2a.jpg', alt: 'Shed with old clear fibreglass roof panels', tag: 'Before', caption: 'Old fibreglass panels' },
      { src: 'assets/work/agricultural-2b.jpg', alt: 'Old fibreglass roof panels close up', tag: 'Before', caption: 'Old fibreglass panels' },
      { src: 'assets/work/agricultural-1a.jpg', alt: 'Shed with a new galvanized metal roof', tag: 'After', caption: '9-36 in galvanized' },
      { src: 'assets/work/agricultural-1b.jpg', alt: 'New galvanized 9-36 roof close up', tag: 'After', caption: '9-36 in galvanized' },
      { src: 'assets/work/agricultural-3a.jpg', alt: 'Grain shed before its new roof', tag: 'Before', caption: 'Grain shed roof' },
      { src: 'assets/work/agricultural-3b.jpg', alt: 'Grain shed with a new 9-36 metal roof', tag: 'After', caption: 'Grain shed roof, 9-36 profile' }
    ]
  },
  siding: {
    title: 'Siding & Trim',
    body: 'Steel siding, soffit and fascia to finish the job and match the roof.',
    photos: [
      { src: 'assets/photos/siding.jpg', alt: 'Red steel siding with white trim around windows and door', caption: 'Steel siding with white trim' }
    ]
  },
  repairs: {
    title: 'Repairs',
    body: 'Leaking metal roofs fixed properly — real pipe boots and flashings in place of silicone and caulking.',
    photos: [
      { src: 'assets/work/repairs-2a.jpg', alt: 'Worn panels on a metal roof before repair', tag: 'Before', caption: 'Panel replacement' },
      { src: 'assets/work/repairs-2b.jpg', alt: 'Old panels removed during a metal roof repair', tag: 'Repair', caption: 'Panel replacement' },
      { src: 'assets/work/repairs-1a.jpg', alt: 'Replaced metal roof panels', tag: 'After', caption: 'Panel replacement' },
      { src: 'assets/work/repairs-1b.jpg', alt: 'New panels blended into an existing metal roof', tag: 'After', caption: 'Panel replacement' },
      { src: 'assets/work/repairs-4a.jpg', alt: 'Old chimney on a metal roof before removal', tag: 'Before', caption: 'Chimney removal' },
      { src: 'assets/work/repairs-4b.jpg', alt: 'Metal roof patched after chimney removal', tag: 'After', caption: 'Chimney removal' },
      { src: 'assets/work/repairs-3a.jpg', alt: 'Snow stop being replaced on a metal roof', tag: 'Repair', caption: 'Snow stop replacement' },
      { src: 'assets/work/repairs-3b.jpg', alt: 'New snow stop on a metal roof', tag: 'After', caption: 'Snow stop replacement' },
      { src: 'assets/work/repairs-5a.jpg', alt: 'Metal roof having its screws replaced', tag: 'Repair', caption: 'Replacing screws' },
      { src: 'assets/work/repairs-5b.jpg', alt: 'Metal roof with screws replaced', tag: 'Repair', caption: 'Replacing screws' }
    ]
  }
};

/* VersaFrame Inc. colours. Hex values are sampled from their chart and are a guide only. */
var COLOURS = {
  standard: [
    { id: 'white-white', name: 'White White', hex: '#E5E5EA' },
    { id: 'bright-white', name: 'Bright White', hex: '#FFFFFF' },
    { id: 'bone-white', name: 'Bone White', hex: '#C6C9B5' },
    { id: 'stone-grey', name: 'Stone Grey', hex: '#AEAA98' },
    { id: 'regent-grey', name: 'Regent Grey', hex: '#9E9FA2' },
    { id: 'antique-linen', name: 'Antique Linen', hex: '#EFEDBA' },
    { id: 'wicker', name: 'Wicker', hex: '#CDB6A0' },
    { id: 'tan', name: 'Tan', hex: '#A19863' },
    { id: 'buckskin', name: 'Buckskin', hex: '#694A2E' },
    { id: 'charcoal', name: 'Charcoal', hex: '#474947' },
    { id: 'graphite', name: 'Graphite', hex: '#595D5B' },
    { id: 'iron-ore', name: 'Iron Ore', hex: '#343845' },
    { id: 'metro-brown', name: 'Metro Brown', hex: '#575141' },
    { id: 'light-brown', name: 'Light Brown', hex: '#5E472C' },
    { id: 'coffee-brown', name: 'Coffee Brown', hex: '#3E3125' },
    { id: 'medium-brown', name: 'Medium Brown', hex: '#331D0F' },
    { id: 'dark-brown', name: 'Dark Brown', hex: '#2E251F' },
    { id: 'black', name: 'Black', hex: '#231F20' },
    { id: 'sapphire-blue', name: 'Sapphire Blue', hex: '#739FBF' },
    { id: 'slate-blue', name: 'Slate Blue', hex: '#46677B' },
    { id: 'royal-blue', name: 'Royal Blue', hex: '#3979BD' },
    { id: 'heron-blue', name: 'Heron Blue', hex: '#172C47' },
    { id: 'turquoise', name: 'Turquoise', hex: '#539178' },
    { id: 'pacific-turquoise', name: 'Pacific Turquoise', hex: '#5E7B66' },
    { id: 'forest-green', name: 'Forest Green', hex: '#2F6C46' },
    { id: 'deep-water-green', name: 'Deep Water Green', hex: '#235A62' },
    { id: 'melchers-green', name: 'Melchers Green', hex: '#1F3926' },
    { id: 'bright-red', name: 'Bright Red', hex: '#B42124' },
    { id: 'dark-red', name: 'Dark Red', hex: '#93241E' },
    { id: 'tile-red', name: 'Tile Red', hex: '#7A1520' },
    { id: 'orange', name: 'Orange', hex: '#E53621' },
    { id: 'burgundy', name: 'Burgundy', hex: '#3D202B' },
    { id: 'gold', name: 'Gold', hex: '#C4A130' },
    { id: 'copper-metallic', name: 'Copper Metallic', hex: '#C47E40' },
    { id: 'agalume', name: 'Agalume', hex: '#8B8B8A' }
  ],
  woodgrain: [
    { id: 'ash', name: 'Ash' },
    { id: 'espresso', name: 'Espresso' },
    { id: 'gunstock', name: 'Gunstock' },
    { id: 'saddle', name: 'Saddle' },
    { id: 'autumn', name: 'Autumn' },
    { id: 'light-pine', name: 'Light Pine' },
    { id: 'barnboard', name: 'Barnboard' },
    { id: 'birch', name: 'Birch' },
    { id: 'frontier', name: 'Frontier' },
    { id: 'acorn', name: 'Acorn' },
    { id: 'durango', name: 'Durango' },
    { id: 'homestead', name: 'Homestead' },
    { id: 'ponderosa', name: 'Ponderosa' },
    { id: 'canyon', name: 'Canyon' },
    { id: 'light-zinc', name: 'Light Zinc' },
    { id: 'dark-zinc', name: 'Dark Zinc' },
    { id: 'rustic-red', name: 'Rustic Red' },
    { id: 'aged-copper', name: 'Aged Copper' }
  ],
  textured: [
    { id: 'black-onyx-tex', name: 'Black Onyx' },
    { id: 'burnished-slate-tex', name: 'Burnished Slate' },
    { id: 'graphite-tex', name: 'Graphite' },
    { id: 'kona-brown-tex', name: 'Kona Brown' }
  ],
  startWith: 'dark-brown'
};

var BLOG_POSTS = [
  {
    slug: "metal-vs-shingles",
    title: "Metal Roofing vs Asphalt Shingles — Which Is Better for Alberta?",
    summary: "Shingles look cheaper upfront — but when you factor in replacements, repairs, and energy costs, the math tells a different story.",
    date: "April 5, 2026",
    readTime: "5 min read",
    category: "Comparison"
  },
  {
    slug: "roof-maintenance",
    title: "How to Maintain Your Metal Roof for Decades of Protection",
    summary: "Simple steps to extend the life of your metal roof and protect your investment year-round.",
    date: "April 5, 2026",
    readTime: "4 min read",
    category: "Maintenance"
  },
  {
    slug: "metal-roof-benefits",
    title: "The Real Benefits of Metal Roofing in Alberta",
    summary: "From hail resistance to energy savings — here's why metal roofing is the smart long-term choice for Alberta properties.",
    date: "April 5, 2026",
    readTime: "6 min read",
    category: "Residential"
  }
];

/* ============================================================
   BLOG CONTENT
   Each key matches a slug from BLOG_POSTS above.
   Format: "Title: ...\nDate: ...\nCategory: ...\n---\nBody text"
   ============================================================ */

var BLOG_CONTENT = {

"metal-vs-shingles":
"Title: Metal Roofing vs Asphalt Shingles — Which Is Better for Alberta?\n" +
"Date: April 5, 2026\n" +
"Category: Comparison\n" +
"---\n" +
"Choosing between metal and asphalt shingles comes down to durability, cost, and long-term value — especially in Alberta's unpredictable climate.\n\n" +
"Durability\n\n" +
"Metal roofs last 40–70 years and resist hail, wind, and snow. Asphalt shingles typically last 15–25 years and can crack or lose granules after repeated freeze-thaw cycles.\n\n" +
"Energy Efficiency\n\n" +
"Metal reflects sunlight, keeping homes cooler in summer and reducing energy bills. Shingles absorb heat, which can raise attic temperatures.\n\n" +
"Maintenance\n\n" +
"Metal requires little upkeep beyond occasional cleaning. Shingles need regular inspections for curling, moss, and missing tabs.\n\n" +
"Cost\n\n" +
"Metal roofing costs more upfront — often 2–3 times the price of shingles — but pays off over time through longevity and energy savings. Shingles are cheaper initially but require more frequent replacement.\n\n" +
"Environmental Impact\n\n" +
"Metal is recyclable and often made from recycled materials. Asphalt shingles are petroleum-based and end up in landfills after disposal.\n\n" +
"Verdict\n\n" +
"For Alberta homeowners planning to stay long-term, metal roofing offers superior protection, lower lifetime cost, and better energy performance. Shingles remain a short-term, budget-friendly option but can't match metal's resilience.",

"roof-maintenance":
"Title: How to Maintain Your Metal Roof for Decades of Protection\n" +
"Date: April 5, 2026\n" +
"Category: Maintenance\n" +
"---\n" +
"Metal roofs are known for low maintenance, but a few simple habits will keep them performing flawlessly in Alberta's harsh climate.\n\n" +
"Inspect Annually\n\n" +
"Check seams, fasteners, and flashing once a year — especially after winter. Expansion and contraction from temperature swings can loosen hardware over time.\n\n" +
"Clean Debris\n\n" +
"Remove leaves, branches, and dirt from valleys and gutters. Metal roofs naturally shed snow, but keeping drainage clear prevents water buildup.\n\n" +
"Check Coatings\n\n" +
"Polymer finishes protect against corrosion and fading. If your roof's color looks dull or scratched, consider a professional re-coating to extend its life.\n\n" +
"Preventative Care\n\n" +
"Schedule a professional inspection every few years. Contractors can reseal seams and apply protective membranes that reduce thermal stress and prevent leaks.\n\n" +
"Avoid Common Mistakes\n\n" +
"Never walk on panels with hard-soled shoes or drag tools across the surface. Use soft footwear and padded ladders to avoid scratches.\n\n" +
"With minimal upkeep, your metal roof can easily last half a century — saving thousands in repair and replacement costs.",

"metal-roof-benefits":
"Title: The Real Benefits of Metal Roofing in Alberta\n" +
"Date: April 5, 2026\n" +
"Category: Residential\n" +
"---\n" +
"Metal roofing has become Alberta's most reliable choice for homeowners who want long-term protection and lower maintenance. Unlike asphalt shingles, metal panels are engineered to handle Alberta's extreme weather — from freeze-thaw cycles to hailstorms and Chinooks.\n\n" +
"Durability and Lifespan\n\n" +
"Metal roofs last 40–70 years, far longer than shingles that typically need replacement every 15–25 years. They resist cracking, curling, and deterioration caused by temperature swings.\n\n" +
"Energy Efficiency\n\n" +
"Reflective coatings on metal panels reduce heat absorption, cutting cooling costs by up to 25%. In winter, proper insulation helps retain warmth, making metal roofs energy-efficient year-round.\n\n" +
"Weather Resistance\n\n" +
"Metal roofing sheds snow easily, resists hail damage, and withstands winds up to 200 km/h. It's also non-combustible, offering Class A fire protection.\n\n" +
"Environmental Impact\n\n" +
"Most metal roofs contain recycled materials and are 100% recyclable at the end of their lifespan, reducing landfill waste.\n\n" +
"Return on Investment\n\n" +
"Homeowners recover 60–85% of installation costs at resale. A metal roof adds curb appeal and buyer confidence — especially in hail-prone regions like central Alberta."

};
