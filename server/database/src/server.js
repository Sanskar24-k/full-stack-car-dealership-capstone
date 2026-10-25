import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const port = Number(process.env.PORT || 3001);
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/car_dealership";

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  app.listen(port, "0.0.0.0", () => console.log(`Dealership service listening on http://localhost:${port}`));
} catch (error) {
  console.error(`Could not connect to MongoDB at ${mongoUri}: ${error.message}`);
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}
