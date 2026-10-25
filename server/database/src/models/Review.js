import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer", required: true, index: true },
    author: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    visitedAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("Review", reviewSchema);
