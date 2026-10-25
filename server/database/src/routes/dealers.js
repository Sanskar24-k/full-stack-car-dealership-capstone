import { Router } from "express";
import mongoose from "mongoose";
import Dealer from "../models/Dealer.js";
import Review from "../models/Review.js";

const router = Router();
const dealerFields = "name slug description address city state stateCode postalCode phone email website imageUrl";

function normalizeState(value) {
  const state = value.trim().toLowerCase();
  if (state === "ks" || state === "kansas") return "KS";
  return value.trim().toUpperCase();
}

router.get("/", async (_request, response, next) => {
  try {
    const dealers = await Dealer.find().select(dealerFields).sort({ stateCode: 1, city: 1, name: 1 }).lean();
    response.json({ count: dealers.length, dealers });
  } catch (error) {
    next(error);
  }
});

router.get("/state/:state", async (request, response, next) => {
  try {
    const stateCode = normalizeState(request.params.state);
    const dealers = await Dealer.find({ stateCode }).select(dealerFields).sort({ city: 1, name: 1 }).lean();
    response.json({ state: stateCode, count: dealers.length, dealers });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/reviews", async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ error: "Dealer ID must be a valid MongoDB ObjectId." });
  }
  try {
    const dealer = await Dealer.exists({ _id: request.params.id });
    if (!dealer) return response.status(404).json({ error: "Dealer not found." });
    const reviews = await Review.find({ dealer: request.params.id }).sort({ createdAt: -1 }).lean();
    response.json({ dealerId: request.params.id, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ error: "Dealer ID must be a valid MongoDB ObjectId." });
  }
  try {
    const dealer = await Dealer.findById(request.params.id).select(dealerFields).lean();
    if (!dealer) return response.status(404).json({ error: "Dealer not found." });
    response.json(dealer);
  } catch (error) {
    next(error);
  }
});

export default router;
