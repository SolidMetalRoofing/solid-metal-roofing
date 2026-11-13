# Working tools for the Solid Metal Roofing website

This branch is NOT the website. It holds the scripts used to build it. The live site is the `main` branch.

- `site-generator/build_site.py` — writes every HTML page, sitemap.xml and robots.txt.
  Run: `python3 site-generator/build_site.py /path/to/main-checkout`
  Edit page copy here, re-run, then commit the changed HTML on `main`. styles.css, script.js and site-data.js are edited by hand on `main`.
- `panel-renders/pt.c`, `gen.py` — path tracer for the six 3D panel profile images.
  Build: `gcc -O3 -fopenmp -o pt pt.c -lm`. Run: `python3 gen.py out 1280 720 <samples>`.
- `colour-preview/` — data for the colour preview on the bungalow photo:
  `smp_hex.json` (35 standard colour hex values), `ids.txt` (colour ids), `roof_mask.npz` (roof mask for source-images/bungalow.jpg).
  The recolour script itself was not saved; it keeps each pixel's brightness and swaps the hue inside the mask, and maps woodgrain textures onto the roof with a perspective warp.
- `source-images/` — original logo and photos before cropping.
