import "dotenv/config";
import mongoose from "mongoose";
import Dealer from "./models/Dealer.js";
import Review from "./models/Review.js";

const sampleDealers = [
  {
    name: "Roadway Auto Group",
    slug: "roadway-auto-group-topeka",
    description: "A locally owned dealership with carefully selected new and pre-owned vehicles and a neighborhood-first service team.",
    address: "1212 W 6th Avenue",
    city: "Topeka",
    state: "Kansas",
    stateCode: "KS",
    postalCode: "66606",
    phone: "(785) 555-0148",
    email: "hello@roadwaymotors.example",
    website: "https://roadwaymotors.example",
    imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Prairie Star Motors",
    slug: "prairie-star-motors-wichita",
    description: "A family-run Wichita auto center offering transparent vehicle history and friendly financing guidance.",
    address: "8400 E Kellogg Drive",
    city: "Wichita",
    state: "Kansas",
    stateCode: "KS",
    postalCode: "67207",
    phone: "(316) 555-0122",
    email: "sales@prairiestarmotors.example",
    website: "https://prairiestarmotors.example",
    imageUrl: "https://images.unsplash.com/photo-1562519819-016930ada31b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Sunflower City Cars",
    slug: "sunflower-city-cars-lawrence",
    description: "Independent vehicle specialists helping Lawrence drivers find practical, dependable cars.",
    address: "2730 Iowa Street",
    city: "Lawrence",
    state: "Kansas",
    stateCode: "KS",
    postalCode: "66046",
    phone: "(785) 555-0176",
    email: "team@sunflowercitycars.example",
    website: "https://sunflowercitycars.example",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Riverbend Auto Center",
    slug: "riverbend-auto-center-omaha",
    description: "A full-service Omaha dealership with a broad selection of inspected pre-owned vehicles.",
    address: "5050 S 144th Street",
    city: "Omaha",
    state: "Nebraska",
    stateCode: "NE",
    postalCode: "68137",
    phone: "(402) 555-0131",
    email: "hello@riverbendauto.example",
    website: "https://riverbendauto.example",
    imageUrl: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
  },
];

try {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/car_dealership");
  for (const item of sampleDealers) {
    const dealer = await Dealer.findOneAndUpdate({ slug: item.slug }, { $set: item }, { new: true, upsert: true });
    if (item.slug === "roadway-auto-group-topeka") {
      await Review.updateOne(
        { dealer: dealer._id, author: "Alex Morgan", comment: "Clear answers and a relaxed test drive." },
        { $setOnInsert: { dealer: dealer._id, author: "Alex Morgan", rating: 5, comment: "Clear answers and a relaxed test drive." } },
        { upsert: true },
      );
      await Review.updateOne(
        { dealer: dealer._id, author: "Casey Rivera", comment: "Helpful team and a smooth pickup." },
        { $setOnInsert: { dealer: dealer._id, author: "Casey Rivera", rating: 4, comment: "Helpful team and a smooth pickup." } },
        { upsert: true },
      );
    }
  }
  console.log(`Seeded ${sampleDealers.length} sample dealers.`);
} catch (error) {
  console.error(`Could not seed the dealership database: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
