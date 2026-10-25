import mongoose from "mongoose";

const dealerSchema = new mongoose.Schema(
  {
    sourceId: { type: Number, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    stateCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    postalCode: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false },
);

dealerSchema.index({ stateCode: 1, city: 1, name: 1 });
export default mongoose.model("Dealer", dealerSchema);
