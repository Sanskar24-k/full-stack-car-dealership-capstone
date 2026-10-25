import "dotenv/config";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import Dealer from "./models/Dealer.js";
import Review from "./models/Review.js";

const seedFile = new URL("../data/dealerships.json", import.meta.url);
const { dealerships } = JSON.parse(await readFile(seedFile, "utf8"));
if (!Array.isArray(dealerships) || dealerships.length !== 50) {
  throw new Error(`Expected exactly 50 dealership records in ${seedFile.pathname}.`);
}

const vehiclePhotos = [
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
];
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const records = dealerships.map((item) => ({
  sourceId: item.id,
  name: item.full_name,
  slug: `${slugify(item.short_name)}-${item.id}`,
  description: `${item.full_name} serves drivers in ${item.city}, ${item.state}. Visit the team at ${item.address}.`,
  address: item.address,
  city: item.city,
  state: item.state,
  stateCode: item.st,
  postalCode: String(item.zip),
  phone: "",
  email: "",
  website: "",
  imageUrl: vehiclePhotos[(item.id - 1) % vehiclePhotos.length],
}));

try {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/car_dealership");
  const dealers = await Promise.all(records.map((record) =>
    Dealer.findOneAndUpdate(
      { sourceId: record.sourceId },
      { $set: record },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ),
  ));

  const kansasDealer = dealers.find((dealer) => dealer.sourceId === 8) || dealers[0];
  const sampleReviews = [
    { author: "Alex Morgan", rating: 5, comment: "Fantastic team and a smooth, helpful experience." },
    { author: "Casey Rivera", rating: 3, comment: "The visit was fine and the information was clear." },
    { author: "Jamie Chen", rating: 1, comment: "The wait was slow and the service was disappointing." },
  ];
  for (const review of sampleReviews) {
    await Review.updateOne(
      { dealer: kansasDealer._id, author: review.author, comment: review.comment },
      { $setOnInsert: { dealer: kansasDealer._id, ...review } },
      { upsert: true },
    );
  }
  console.log(`Seeded ${dealers.length} dealerships from the IBM capstone JSON file.`);
} catch (error) {
  console.error(`Could not seed the dealership database: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}