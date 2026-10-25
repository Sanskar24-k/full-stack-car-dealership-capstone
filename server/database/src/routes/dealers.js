import { Router } from "express";
import mongoose from "mongoose";
import Dealer from "../models/Dealer.js";
import Review from "../models/Review.js";
const router = Router();
const dealerFields = "name slug description address city state stateCode postalCode phone email website imageUrl";
function normalizeState(value) { const state = value.trim().toLowerCase(); if (state === "ks" || state === "kansas") return "KS"; return value.trim().toUpperCase(); }
router.get("/", async (_req, res, next) => { try { const dealers = await Dealer.find().select(dealerFields).sort({ stateCode: 1, city: 1, name: 1 }).lean(); res.json({ count: dealers.length, dealers }); } catch (e) { next(e); } });
router.get("/state/:state", async (req, res, next) => { try { const stateCode = normalizeState(req.params.state); const dealers = await Dealer.find({ stateCode }).select(dealerFields).sort({ city: 1, name: 1 }).lean(); res.json({ state: stateCode, count: dealers.length, dealers }); } catch (e) { next(e); } });
router.get("/:id/reviews", async (req, res, next) => { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Dealer ID must be a valid MongoDB ObjectId." }); try { if (!await Dealer.exists({ _id: req.params.id })) return res.status(404).json({ error: "Dealer not found." }); const reviews = await Review.find({ dealer: req.params.id }).sort({ createdAt: -1 }).lean(); res.json({ dealerId: req.params.id, count: reviews.length, reviews }); } catch (e) { next(e); } });
router.post("/:id/reviews", async (req, res, next) => { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Dealer ID must be a valid MongoDB ObjectId." }); try { if (!await Dealer.exists({ _id: req.params.id })) return res.status(404).json({ error: "Dealer not found." }); const review = await Review.create({ dealer: req.params.id, author: String(req.body.author || "").trim(), rating: Number(req.body.rating), comment: String(req.body.comment || "").trim() }); res.status(201).json(review); } catch (e) { next(e); } });
router.get("/:id", async (req, res, next) => { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Dealer ID must be a valid MongoDB ObjectId." }); try { const dealer = await Dealer.findById(req.params.id).select(dealerFields).lean(); if (!dealer) return res.status(404).json({ error: "Dealer not found." }); res.json(dealer); } catch (e) { next(e); } });
export default router;
