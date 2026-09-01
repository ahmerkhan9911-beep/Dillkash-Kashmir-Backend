/**
 * Tour packages data seeder.
 * Usage: cd server && npm run db:seed
 */
import "dotenv/config";
import defaultPool from "../config/db.js";

export const initialTours = [
  {
    slug: "neelum-keran-3-days",
    title: "3-Day Express Neelum Valley & Keran Tour",
    short_description: "Ideal for quick weekend trips from Lahore.",
    full_description: "A quick yet unforgettable trip to Neelum Valley covering Keran and surrounding areas. Perfect for those short on time but high on adventure.",
    duration_days: 3,
    package_type: "Family,Couples,Budget",
    price: 14500,
    rating: 4.8,
    reviews_count: 212,
    image_url: "/assets/dest-keran.jpg",
    departure_city: "Lahore",
    departure_day: "Friday",
    transport: "AC Saloon Coaster from Lahore",
    accommodation: "2 nights — riverside hotel in Keran",
    meals: "2 breakfasts + 2 dinners",
    featured: true,
    next_departure: "Fri, 28 Aug 2026",
    destinations: ["Muzaffarabad", "Neelum Valley", "Keran"],
    included: [
      "AC Saloon Coaster transport from Lahore & back",
      "2 nights hotel stay in Keran",
      "Daily breakfast & dinner",
      "Professional tour manager",
      "Neelum River sightseeing stops",
      "All tolls, taxes & fuel",
    ],
    notIncluded: [
      "Lunch & personal snacks",
      "Jeep rides (optional)",
      "Boating / rafting tickets",
      "Personal expenses",
    ],
    itinerary: [
      { day: 1, title: "Departure from Lahore", details: [
        "Evening pickup from Thokar Niaz Baig / Kalma Chowk",
        "Overnight comfortable journey via motorway & Hazara Expressway",
        "Early morning arrival in Muzaffarabad",
        "Breakfast stop & transfer to Neelum Valley",
        "Hotel check-in at Keran by afternoon, evening by the Neelum River",
      ]},
      { day: 2, title: "Keran & Local Sightseeing", details: [
        "Riverside breakfast with mountain views",
        "Keran local sightseeing & Upper Neelum viewpoint",
        "Walk along the Neelum River banks",
        "Bonfire & BBQ dinner at the hotel (weather permitting)",
      ]},
      { day: 3, title: "Return Journey to Lahore", details: [
        "Early breakfast & hotel checkout",
        "Photo stop at Dhani Waterfall viewpoint",
        "Departure for Lahore via Muzaffarabad",
        "Late-night arrival in Lahore with lifetime memories",
      ]},
    ],
    gallery: ["/assets/dest-keran.jpg", "/assets/dest-neelum-river.jpg", "/assets/dest-muzaffarabad.jpg", "/assets/dest-dhani.jpg"],
  },
  {
    slug: "complete-kashmir-5-days",
    title: "5-Day Complete Kashmir Exploration",
    short_description: "The full Neelum Valley experience — rivers, waterfalls & Arang Kel.",
    full_description: "The ultimate Kashmir package covering the best of Neelum Valley including Arang Kel, Sharda, and Kutton waterfall.",
    duration_days: 5,
    package_type: "Family,Couples,Honeymoon,Group",
    price: 24500,
    rating: 4.9,
    reviews_count: 348,
    image_url: "/assets/dest-arang-kel.jpg",
    departure_city: "Lahore",
    departure_day: "Wednesday",
    transport: "AC Saloon Coaster + 4x4 jeep to Arang Kel",
    accommodation: "4 nights — Keran, Sharda & Kutton hotels",
    meals: "4 breakfasts + 4 dinners",
    featured: true,
    next_departure: "Wed, 2 Sep 2026",
    destinations: ["Muzaffarabad", "Kutton", "Sharda", "Arang Kel", "Keran"],
    included: [
      "AC Saloon Coaster from Lahore & back",
      "4 nights hotel accommodation",
      "Daily breakfast & dinner",
      "4x4 jeep transfer to Arang Kel base",
      "Kutton Waterfall & Sharda sightseeing",
      "Experienced tour manager throughout",
    ],
    notIncluded: ["Lunch", "Chairlift / rafting tickets", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Lahore to Muzaffarabad", details: ["Night departure from Lahore pickup points", "Morning arrival in Muzaffarabad", "Breakfast & short city orientation", "Drive into Neelum Valley, night stay at Keran"] },
      { day: 2, title: "Keran to Kutton", details: ["Breakfast at Keran", "Scenic drive to Kutton", "Kutton Waterfall visit & photography", "Overnight stay at Kutton"] },
      { day: 3, title: "Sharda & Kel", details: ["Drive to Sharda, visit ancient Sharda ruins", "Continue to Kel", "4x4 transfer & hike / chairlift to Arang Kel meadows", "Evening return, night stay at Sharda"] },
      { day: 4, title: "Upper Neelum Exploration", details: ["Leisurely morning by the river", "Upper Neelum & Dhani Waterfall viewpoint", "Local bazaar visit for Kashmiri handicrafts", "Farewell dinner & bonfire"] },
      { day: 5, title: "Return to Lahore", details: ["Breakfast & checkout", "Return journey via Muzaffarabad", "Late-night drop-off at Lahore pickup points"] },
    ],
    gallery: ["/assets/dest-arang-kel.jpg", "/assets/dest-sharda.jpg", "/assets/dest-kutton.jpg", "/assets/dest-neelum-river.jpg"],
  },
  {
    slug: "ultimate-adventure-7-days",
    title: "7-Day Ultimate Adventure & Lakes Tour",
    short_description: "Ratti Gali Lake, Taobat & Baboon Valley — the wild side of AJK.",
    full_description: "For the truly adventurous — a 7-day expedition covering Ratti Gali Lake, Taobat (the last village), and the untouched Baboon Valley.",
    duration_days: 7,
    package_type: "Group,Corporate,Family",
    price: 36500,
    rating: 4.9,
    reviews_count: 187,
    image_url: "/assets/dest-ratti-gali.jpg",
    departure_city: "Lahore",
    departure_day: "Friday",
    transport: "Grand Cabin / Coaster + 4x4 Prado & Jeeps",
    accommodation: "6 nights — hotels + 1 night lakeside camping",
    meals: "6 breakfasts + 6 dinners",
    featured: true,
    next_departure: "Fri, 4 Sep 2026",
    destinations: ["Ratti Gali Lake", "Taobat", "Baboon Valley", "Sharda"],
    included: [
      "Luxury transport from Lahore & back",
      "6 nights accommodation (incl. Ratti Gali camping)",
      "4x4 jeep adventure to Ratti Gali & Taobat",
      "Daily breakfast & dinner",
      "Professional guide & first aid",
      "Photography support",
    ],
    notIncluded: ["Lunch", "Horse riding at Ratti Gali", "Personal gear", "Tips"],
    itinerary: [
      { day: 1, title: "Lahore to Neelum Valley", details: ["Night departure from Lahore", "Morning arrival, breakfast in Muzaffarabad", "Drive to Keran, riverside evening"] },
      { day: 2, title: "Keran to Sharda", details: ["Breakfast at Keran", "Scenic drive to Sharda", "Sharda ruins & river view point", "Night stay at Sharda"] },
      { day: 3, title: "Ratti Gali Base Camp", details: ["4x4 jeep departure to Ratti Gali base camp", "Trek / horse ride to Ratti Gali Lake", "Lakeside camping under the stars"] },
      { day: 4, title: "Ratti Gali to Kel", details: ["Sunrise at the lake", "Descend to base camp", "Drive to Kel, evening at leisure"] },
      { day: 5, title: "Taobat Expedition", details: ["Full-day 4x4 expedition to Taobat", "The last village of Neelum Valley", "Return to Kel for overnight stay"] },
      { day: 6, title: "Baboon Valley", details: ["Day trip to Baboon Valley meadows", "Picnic lunch & photography", "Farewell dinner at Sharda"] },
      { day: 7, title: "Return to Lahore", details: ["Breakfast & checkout", "Return journey with waterfall photo stops", "Late-night arrival in Lahore"] },
    ],
    gallery: ["/assets/dest-ratti-gali.jpg", "/assets/dest-taobat.jpg", "/assets/video-thumb.jpg", "/assets/dest-sharda.jpg"],
  },
  {
    slug: "honeymoon-keran-4-days",
    title: "4-Day Kashmir Honeymoon Special",
    short_description: "Private riverside rooms & romantic evenings in Keran & Sharda.",
    full_description: "A romantic getaway designed for newlyweds — private riverside rooms, candle-light dinners, and serene mountain settings.",
    duration_days: 4,
    package_type: "Honeymoon,Couples",
    price: 29500,
    rating: 4.8,
    reviews_count: 96,
    image_url: "/assets/dest-neelum-river.jpg",
    departure_city: "Lahore",
    departure_day: "Monday",
    transport: "Private Grand Cabin option available",
    accommodation: "3 nights — premium riverside rooms",
    meals: "3 breakfasts + 3 candle-light dinners",
    featured: false,
    next_departure: "Mon, 31 Aug 2026",
    destinations: ["Keran", "Sharda", "Upper Neelum"],
    included: [
      "Comfortable transport from Lahore & back",
      "3 nights premium private rooms",
      "Candle-light dinner setup",
      "Decorated room on request",
      "Tour manager on call",
    ],
    notIncluded: ["Lunch", "Personal expenses", "Optional jeep rides"],
    itinerary: [
      { day: 1, title: "Lahore to Keran", details: ["Overnight journey from Lahore", "Riverside check-in at Keran", "Private dinner by the Neelum River"] },
      { day: 2, title: "Keran Leisure Day", details: ["Late breakfast", "Upper Neelum viewpoint", "Bonfire evening for two"] },
      { day: 3, title: "Sharda Day Trip", details: ["Scenic drive to Sharda", "Ruins & river photography", "Candle-light dinner"] },
      { day: 4, title: "Return to Lahore", details: ["Breakfast & checkout", "Return journey to Lahore"] },
    ],
    gallery: ["/assets/dest-neelum-river.jpg", "/assets/dest-keran.jpg", "/assets/dest-sharda.jpg"],
  },
  {
    slug: "family-sharda-5-days",
    title: "5-Day Family Sharda & Kutton Retreat",
    short_description: "Slow-paced, kid-friendly tour with verified family hotels.",
    full_description: "A relaxed family tour with verified hotels, separate family rooms, and a pace that works for children.",
    duration_days: 5,
    package_type: "Family,Budget",
    price: 21500,
    rating: 4.7,
    reviews_count: 154,
    image_url: "/assets/dest-sharda.jpg",
    departure_city: "Lahore",
    departure_day: "Friday",
    transport: "AC Saloon Coaster from Lahore",
    accommodation: "4 nights — family rooms, verified hotels",
    meals: "4 breakfasts + 4 dinners",
    featured: false,
    next_departure: "Fri, 11 Sep 2026",
    destinations: ["Kutton", "Sharda", "Keran"],
    included: [
      "AC transport from Lahore & back",
      "Separate family rooms",
      "Daily breakfast & dinner",
      "Tour guide & first aid kit",
    ],
    notIncluded: ["Lunch", "Jeep rides", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Lahore to Keran", details: ["Night departure", "Morning arrival & breakfast", "Hotel check-in at Keran"] },
      { day: 2, title: "Kutton Waterfall", details: ["Drive to Kutton", "Waterfall visit & family picnic", "Night stay at Kutton"] },
      { day: 3, title: "Sharda Exploration", details: ["Sharda ruins & bazaar", "Riverside evening", "Night stay at Sharda"] },
      { day: 4, title: "Leisure & Local Culture", details: ["Free morning", "Kashmiri handicraft bazaar", "Farewell dinner"] },
      { day: 5, title: "Return to Lahore", details: ["Breakfast & departure", "Late-night arrival in Lahore"] },
    ],
    gallery: ["/assets/dest-sharda.jpg", "/assets/dest-kutton.jpg", "/assets/dest-keran.jpg"],
  },
  {
    slug: "corporate-retreat-3-days",
    title: "3-Day Corporate Kashmir Retreat",
    short_description: "Team-building in the mountains with dedicated coordinators.",
    full_description: "A corporate retreat package with meeting space, team activities, and scenic excursions to Pir Chinasi and Keran.",
    duration_days: 3,
    package_type: "Corporate,Group",
    price: 18500,
    rating: 4.8,
    reviews_count: 63,
    image_url: "/assets/dest-muzaffarabad.jpg",
    departure_city: "Lahore",
    departure_day: "On demand",
    transport: "Dedicated coaster with company branding option",
    accommodation: "2 nights — conference-friendly hotel",
    meals: "2 breakfasts + 2 dinners + hi-tea",
    featured: false,
    next_departure: "On demand",
    destinations: ["Muzaffarabad", "Pir Chinasi", "Keran"],
    included: [
      "Dedicated transport from Lahore office",
      "2 nights hotel with meeting space",
      "Team activity coordination",
      "Pir Chinasi viewpoint visit",
      "Group photography",
    ],
    notIncluded: ["Lunch", "AV equipment rental", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Lahore to Muzaffarabad", details: ["Morning departure", "Check-in & hi-tea", "Team session & dinner"] },
      { day: 2, title: "Pir Chinasi & Keran", details: ["Pir Chinasi sunrise viewpoint", "Drive to Keran", "Bonfire & team activities"] },
      { day: 3, title: "Return to Lahore", details: ["Breakfast & group photos", "Return journey to Lahore"] },
    ],
    gallery: ["/assets/dest-muzaffarabad.jpg", "/assets/dest-pir-chinasi.jpg", "/assets/dest-keran.jpg"],
  },
];

export async function seedPackages(pool = defaultPool) {
  let seededCount = 0;
  let skippedCount = 0;

  for (const tour of initialTours) {
    // Check if package slug already exists
    const [existing] = await pool.execute("SELECT id FROM packages WHERE slug = ?", [tour.slug]);
    if (existing.length > 0) {
      console.log(`  ℹ️  Package "${tour.title}" (${tour.slug}) already exists — skipped`);
      skippedCount++;
      continue;
    }

    // Insert package
    const [pkgResult] = await pool.execute(
      `INSERT INTO packages (slug, title, short_description, full_description, duration_days, package_type,
        price, rating, reviews_count, image_url, departure_city, departure_day,
        transport, accommodation, meals, featured, is_active, next_departure)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        tour.slug,
        tour.title,
        tour.short_description,
        tour.full_description,
        tour.duration_days,
        tour.package_type,
        tour.price,
        tour.rating,
        tour.reviews_count,
        tour.image_url,
        tour.departure_city,
        tour.departure_day,
        tour.transport,
        tour.accommodation,
        tour.meals,
        tour.featured ? 1 : 0,
        tour.next_departure,
      ]
    );
    const pkgId = pkgResult.insertId;

    // Destinations
    for (let i = 0; i < tour.destinations.length; i++) {
      await pool.execute(
        "INSERT INTO package_destinations (package_id, destination_name, sort_order) VALUES (?, ?, ?)",
        [pkgId, tour.destinations[i], i]
      );
    }

    // Itinerary
    for (const day of tour.itinerary) {
      const [itResult] = await pool.execute(
        "INSERT INTO package_itineraries (package_id, day_number, title, sort_order) VALUES (?, ?, ?, ?)",
        [pkgId, day.day, day.title, day.day]
      );
      for (let d = 0; d < day.details.length; d++) {
        await pool.execute(
          "INSERT INTO package_itinerary_details (itinerary_id, detail_text, sort_order) VALUES (?, ?, ?)",
          [itResult.insertId, day.details[d], d]
        );
      }
    }

    // Inclusions
    for (let i = 0; i < tour.included.length; i++) {
      await pool.execute(
        "INSERT INTO package_inclusions (package_id, item_text, sort_order) VALUES (?, ?, ?)",
        [pkgId, tour.included[i], i]
      );
    }

    // Exclusions
    for (let i = 0; i < tour.notIncluded.length; i++) {
      await pool.execute(
        "INSERT INTO package_exclusions (package_id, item_text, sort_order) VALUES (?, ?, ?)",
        [pkgId, tour.notIncluded[i], i]
      );
    }

    // Gallery
    for (let i = 0; i < tour.gallery.length; i++) {
      await pool.execute(
        "INSERT INTO package_gallery (package_id, image_url, sort_order) VALUES (?, ?, ?)",
        [pkgId, tour.gallery[i], i]
      );
    }

    console.log(`  ✓ ${tour.title}`);
    seededCount++;
  }

  return { seededCount, skippedCount, total: initialTours.length };
}

// Run directly if this script is executed
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith("seed.js") || process.argv[1].endsWith("seed")
);

if (isDirectRun) {
  console.log("📦 Seeding tour packages...");
  seedPackages(defaultPool)
    .then(async ({ seededCount, skippedCount }) => {
      console.log(`\n✅ Packages seeding finished: ${seededCount} seeded, ${skippedCount} skipped.`);
      await defaultPool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Package seeding failed:", err.message);
      process.exit(1);
    });
}
