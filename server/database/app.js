import express from "express";
import cors from "cors";
import dealersRouter from "./src/routes/dealers.js";

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => response.json({ service: "dealership-directory", status: "ok" }));
app.use("/dealers", dealersRouter);
// IBM capstone rubric route; it shares the same data-backed list handler.
app.use("/fetchDealers", dealersRouter);
app.use("/fetchDealer", dealersRouter);
app.use((_request, response) => response.status(404).json({ error: "Route not found." }));
app.use((error, _request, response, _next) => {
  console.error("Dealership service error:", error.message);
  if (error.name === "ValidationError") return response.status(400).json({ error: "Invalid dealer data." });
  if (error.name === "MongoServerSelectionError" || error.name === "MongooseServerSelectionError") {
    return response.status(503).json({ error: "The dealership database is unavailable." });
  }
  response.status(500).json({ error: "Internal service error." });
});

export default app;