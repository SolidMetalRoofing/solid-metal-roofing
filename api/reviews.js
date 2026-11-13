// Solid Metal Roofing — live Google reviews
// Runs on Vercel. Asks Google for the business's reviews and lets Vercel's
// cache keep the answer for a week, so Google is only asked about once a week.
// The Google key lives in the Vercel secret GOOGLE_PLACES_API_KEY and never
// reaches the browser.

const WEEK = 7 * 24 * 60 * 60;
const SEARCHES = ['Solid Metal Roofing Westlock', 'Solid Metal Roofing Alberta', 'Solid Metal Roofing'];
// Westlock, AB — keeps the search near home
const NEAR = { circle: { center: { latitude: 54.152, longitude: -113.857 }, radius: 50000 } };
const NAME_CHECK = /solid\s*metal/i;

async function findPlaceId(key) {
  // Name + id only (Google's "Pro" tier: 5,000 free a month; this runs about weekly).
  for (const q of SEARCHES) {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName'
      },
      body: JSON.stringify({ textQuery: q, pageSize: 10, locationBias: NEAR, includePureServiceAreaBusinesses: true })
    });
    if (!r.ok) throw new Error('search ' + r.status + ' ' + (await r.text()).replace(/\s+/g, ' ').slice(0, 1500));
    const d = await r.json();
    const hit = (d.places || []).find(p => NAME_CHECK.test((p.displayName && p.displayName.text) || ''));
    if (hit) {
      console.log('reviews: using place', hit.id, hit.displayName.text);
      return hit.id;
    }
    console.log('reviews: no match for "' + q + '":', (d.places || []).map(p => p.displayName && p.displayName.text).join(' | '));
  }
  return null;
}

async function getDetails(key, id) {
  const r = await fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(id) + '?languageCode=en', {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews,googleMapsUri'
    }
  });
  if (!r.ok) throw new Error('details ' + r.status + ' ' + (await r.text()).replace(/\s+/g, " ").slice(0, 1500));
  return r.json();
}

function tidy(place) {
  return {
    name: place.displayName && place.displayName.text,
    rating: place.rating || null,
    count: place.userRatingCount || 0,
    mapsUrl: place.googleMapsUri || null,
    reviews: (place.reviews || []).slice(0, 5).map(v => ({
      rating: v.rating || 0,
      text: (v.originalText && v.originalText.text) || (v.text && v.text.text) || '',
      author: (v.authorAttribution && v.authorAttribution.displayName) || 'Google user',
      authorUrl: (v.authorAttribution && v.authorAttribution.uri) || null,
      when: v.relativePublishTimeDescription || ''
    }))
  };
}

module.exports = async function handler(req, res) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    if (!key) throw new Error('GOOGLE_PLACES_API_KEY is not set');

    let place = null;
    if (process.env.GOOGLE_PLACE_ID) {
      place = await getDetails(key, process.env.GOOGLE_PLACE_ID);
    } else {
      // Only a match whose name looks like ours is used.
      const id = await findPlaceId(key);
      if (!id) throw new Error('business not found on Google');
      place = await getDetails(key, id);
    }

    // Vercel's cache holds this for a week, then serves the old copy for a
    // day while it fetches a fresh one.
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=' + WEEK + ', stale-while-revalidate=86400');
    res.statusCode = 200;
    res.end(JSON.stringify(tidy(place)));
  } catch (err) {
    console.error('reviews:', err.message);
    // Short cache on failure so a fix shows up soon; the page falls back to the Google button.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600');
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'reviews unavailable' }));
  }
};
