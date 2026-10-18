import pool from "./src/config/db.js";

async function seedHotels() {
  try {
    console.log("Seeding sample Kashmir hotels with rooms...");

    const sampleHotels = [
      {
        slug: "pearl-continental-muzaffarabad",
        name: "Pearl Continental Hotel Muzaffarabad",
        location: "Muzaffarabad",
        starRating: 5,
        pricePerNight: 28000,
        description:
          "Perched atop a hill overlooking the confluence of the Neelum and Jhelum rivers, PC Muzaffarabad offers 5-star panoramic luxury, world-class dining, and royal Kashmiri hospitality.",
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80",
        ],
        amenities: [
          "WiFi",
          "Heater",
          "River View",
          "Parking",
          "Complimentary Breakfast",
          "Room Service",
          "Hot Water",
          "Generator Backup",
        ],
        featured: 1,
        isActive: 1,
        checkInTime: "2:00 PM",
        checkOutTime: "12:00 PM",
        cancellationPolicy:
          "Free cancellation up to 48 hours prior to check-in. Cancellations within 48 hours are charged for 1 night.",
        houseRules:
          "• Government-issued CNIC/Passport is mandatory for all guests at check-in.\n• No smoking inside rooms; designated outdoor smoking areas available.\n• Quiet hours from 10:00 PM to 7:00 AM.",
        rooms: [
          { roomType: "Deluxe Mountain View", pricePerNight: 28000, maxGuests: 2, availableRooms: 8 },
          { roomType: "Executive River Suite", pricePerNight: 42000, maxGuests: 3, availableRooms: 4 },
          { roomType: "Presidential Royal Suite", pricePerNight: 75000, maxGuests: 4, availableRooms: 2 },
        ],
      },
      {
        slug: "green-village-resort-arang-kel",
        name: "Green Village Resort Arang Kel",
        location: "Arang Kel",
        starRating: 4,
        pricePerNight: 16000,
        description:
          "Located in the serene high-altitude meadows of Arang Kel, this wooden boutique resort offers panoramic views of lush green pastures, snowy peaks, and the whispering pine forests of Neelum.",
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80",
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
        ],
        amenities: [
          "WiFi",
          "Heater",
          "Complimentary Breakfast",
          "Room Service",
          "Hot Water",
          "Generator Backup",
        ],
        featured: 1,
        isActive: 1,
        checkInTime: "1:00 PM",
        checkOutTime: "11:00 AM",
        cancellationPolicy:
          "Free cancellation up to 72 hours before arrival. Due to meadow logistics, late cancellations incur a 50% fee.",
        houseRules:
          "• Mountain cable car access closes at 6:00 PM; please arrive before dusk.\n• Warm clothing recommended throughout the year.\n• Alcohol and loud music are strictly prohibited.",
        rooms: [
          { roomType: "Standard Wooden Cabin", pricePerNight: 16000, maxGuests: 2, availableRooms: 6 },
          { roomType: "Meadow Panoramic Cottage", pricePerNight: 22000, maxGuests: 4, availableRooms: 4 },
        ],
      },
      {
        slug: "keran-resort-riverside",
        name: "Neelum Riverfront Resort Keran",
        location: "Keran",
        starRating: 4,
        pricePerNight: 14000,
        description:
          "Set directly along the roaring banks of the Neelum River with direct sightlines across the Line of Control, this peaceful retreat is beloved for riverside barbecues and tranquil mornings.",
        images: [
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
          "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80",
        ],
        amenities: [
          "WiFi",
          "River View",
          "Parking",
          "Room Service",
          "Hot Water",
          "Generator Backup",
        ],
        featured: 0,
        isActive: 1,
        checkInTime: "2:00 PM",
        checkOutTime: "12:00 PM",
        cancellationPolicy:
          "Full refund if cancelled 3 days before travel date.",
        houseRules:
          "• Please respect border region photography regulations.\n• Bonfire arrangements available upon advance request at reception.",
        rooms: [
          { roomType: "Deluxe Riverfront Room", pricePerNight: 14000, maxGuests: 2, availableRooms: 10 },
          { roomType: "Family River Suite", pricePerNight: 22000, maxGuests: 5, availableRooms: 3 },
        ],
      },
    ];

    for (const h of sampleHotels) {
      // Upsert hotel
      const [existing] = await pool.execute("SELECT id FROM hotels WHERE slug = ?", [h.slug]);
      let hotelId;
      if (existing.length > 0) {
        hotelId = existing[0].id;
        await pool.execute(
          `UPDATE hotels SET
            name = ?, location = ?, star_rating = ?, price_per_night = ?,
            description = ?, images = ?, amenities = ?, featured = ?, is_active = ?,
            check_in_time = ?, check_out_time = ?, cancellation_policy = ?, house_rules = ?
           WHERE id = ?`,
          [
            h.name,
            h.location,
            h.starRating,
            h.pricePerNight,
            h.description,
            JSON.stringify(h.images),
            JSON.stringify(h.amenities),
            h.featured,
            h.isActive,
            h.checkInTime,
            h.checkOutTime,
            h.cancellationPolicy,
            h.houseRules,
            hotelId,
          ]
        );
      } else {
        const [res] = await pool.execute(
          `INSERT INTO hotels (slug, name, location, star_rating, price_per_night, description, images, amenities, featured, is_active, check_in_time, check_out_time, cancellation_policy, house_rules)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            h.slug,
            h.name,
            h.location,
            h.starRating,
            h.pricePerNight,
            h.description,
            JSON.stringify(h.images),
            JSON.stringify(h.amenities),
            h.featured,
            h.isActive,
            h.checkInTime,
            h.checkOutTime,
            h.cancellationPolicy,
            h.houseRules,
          ]
        );
        hotelId = res.insertId;
      }

      // Rooms
      await pool.execute("DELETE FROM hotel_rooms WHERE hotel_id = ?", [hotelId]);
      for (const room of h.rooms) {
        await pool.execute(
          `INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, max_guests, available_rooms)
           VALUES (?, ?, ?, ?, ?)`,
          [hotelId, room.roomType, room.pricePerNight, room.maxGuests, room.availableRooms]
        );
      }
    }

    console.log("Seeding complete successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seedHotels();
