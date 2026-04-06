/* ============================================================
   SOLID METAL ROOFING — Site Data
   ============================================================
   
   HOW TO ADD A NEW BLOG POST:
   1. Write your .txt file and drop it in /assets/blogs/
   2. Add one entry to the BLOG_POSTS array below
   
   HOW TO ADD A NEW GALLERY PHOTO:
   1. Drop the image in the right /assets/ subfolder
      (residential/, commercial/, agricultural/, repairs/)
   2. Add one entry to the GALLERY_ITEMS array below
   
   That's it — no other files need editing.
   ============================================================ */

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
    summary: "Simple steps to extend the life of your roof — whether it's metal or shingles. Protect your investment year-round.",
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
   GALLERY PHOTO COUNTS
   
   HOW TO ADD PHOTOS:
   1. Rename your photo to the next number (e.g. 8.jpg)
   2. Drop it in the right folder (residential/, commercial/, etc.)
   3. Change the count below (e.g. residential: 7 → 8)
   That's it. No other editing needed.
   ============================================================ */

var GALLERY_COUNTS = {
  residential: 7,
  commercial: 1,
  agricultural: 3,
  repairs: 5
};

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
