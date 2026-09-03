/**
 * Destinations data seeder.
 * Usage: cd server && node src/database/seed-destinations.js
 */
import "dotenv/config";
import defaultPool from "../config/db.js";

export const initialDestinations = [
  {
    name: "Arang Kel",
    slug: "arang-kel",
    description: "A lush green meadow plateau above Kel — the postcard of Neelum Valley.",
    cover_image: "/assets/dest-arang-kel.jpg",
    sort_order: 1,
    gallery: [
      "/assets/dest-arang-kel.jpg",
      "/assets/hero-kashmir.jpg",
      "/assets/dest-keran.jpg",
    ],
  },
  {
    name: "Neelum River",
    slug: "neelum-river",
    description: "Turquoise waters winding 200km through the heart of the valley.",
    cover_image: "/assets/dest-neelum-river.jpg",
    sort_order: 2,
    gallery: [
      "/assets/dest-neelum-river.jpg",
      "/assets/dest-keran.jpg",
      "/assets/dest-muzaffarabad.jpg",
    ],
  },
  {
    name: "Sharda",
    slug: "sharda",
    description: "Riverside town home to the ancient Sharda University ruins.",
    cover_image: "/assets/dest-sharda.jpg",
    sort_order: 3,
    gallery: [
      "/assets/dest-sharda.jpg",
      "/assets/dest-keran.jpg",
      "/assets/dest-arang-kel.jpg",
    ],
  },
  {
    name: "Ratti Gali Lake",
    slug: "ratti-gali-lake",
    description: "A glacial alpine lake at 12,130 ft, ringed by snow-capped peaks.",
    cover_image: "/assets/dest-ratti-gali.jpg",
    sort_order: 4,
    gallery: [
      "/assets/dest-ratti-gali.jpg",
      "/assets/hero-kashmir.jpg",
      "/assets/dest-taobat.jpg",
    ],
  },
  {
    name: "Taobat",
    slug: "taobat",
    description: "The last village of Neelum Valley — raw, remote and unforgettable.",
    cover_image: "/assets/dest-taobat.jpg",
    sort_order: 5,
    gallery: [
      "/assets/dest-taobat.jpg",
      "/assets/dest-neelum-river.jpg",
      "/assets/dest-sharda.jpg",
    ],
  },
  {
    name: "Pir Chinasi",
    slug: "pir-chinasi",
    description: "Hilltop shrine with sweeping views over Muzaffarabad.",
    cover_image: "/assets/dest-pir-chinasi.jpg",
    sort_order: 6,
    gallery: [
      "/assets/dest-pir-chinasi.jpg",
      "/assets/dest-muzaffarabad.jpg",
      "/assets/hero-kashmir.jpg",
    ],
  },
  {
    name: "Kutton Waterfall",
    slug: "kutton-waterfall",
    description: "Multi-tiered falls thundering through Jagran Valley's forests.",
    cover_image: "/assets/dest-kutton.jpg",
    sort_order: 7,
    gallery: [
      "/assets/dest-kutton.jpg",
      "/assets/dest-dhani.jpg",
      "/assets/dest-keran.jpg",
    ],
  },
  {
    name: "Dhani Waterfall",
    slug: "dhani-waterfall",
    description: "One of AJK's tallest waterfalls, misting the mountainside.",
    cover_image: "/assets/dest-dhani.jpg",
    sort_order: 8,
    gallery: [
      "/assets/dest-dhani.jpg",
      "/assets/dest-kutton.jpg",
      "/assets/dest-neelum-river.jpg",
    ],
  },
];

export async function seedDestinations(pool = defaultPool) {
  let seededCount = 0;
  let skippedCount = 0;

  for (const dest of initialDestinations) {
    const [existing] = await pool.execute(
      "SELECT id FROM destinations WHERE slug = ?",
      [dest.slug]
    );

    if (existing.length > 0) {
      skippedCount++;
      continue;
    }

    const [result] = await pool.execute(
      `INSERT INTO destinations (name, slug, description, cover_image, is_active, sort_order)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [dest.name, dest.slug, dest.description, dest.cover_image, dest.sort_order || 0]
    );

    const destId = result.insertId;

    if (dest.gallery && dest.gallery.length > 0) {
      for (let i = 0; i < dest.gallery.length; i++) {
        await pool.execute(
          "INSERT INTO destination_gallery (destination_id, image_url, sort_order) VALUES (?, ?, ?)",
          [destId, dest.gallery[i], i]
        );
      }
    }

    console.log(`  ✓ Destination: ${dest.name}`);
    seededCount++;
  }

  return { seededCount, skippedCount, total: initialDestinations.length };
}

// Run directly if this script is executed
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("seed-destinations.js") ||
    process.argv[1].endsWith("seed-destinations"));

if (isDirectRun) {
  console.log("📍 Seeding destinations...");
  seedDestinations(defaultPool)
    .then(async ({ seededCount, skippedCount }) => {
      console.log(
        `\n✅ Destinations seeding finished: ${seededCount} seeded, ${skippedCount} skipped.`
      );
      await defaultPool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Destination seeding failed:", err.message);
      process.exit(1);
    });
}
