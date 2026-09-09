import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is running." });
});

// --- Feature routes ---
app.use("/api/auth", authRoutes);
// Future phases mount here as they're built:
// app.use("/api/incidents", incidentRoutes);
// app.use("/api/rescue", rescueRoutes);
// app.use("/api/hospitals", hospitalRoutes);
// app.use("/api/shelters", shelterRoutes);
// app.use("/api/volunteers", volunteerRoutes);
// app.use("/api/alerts", alertRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/map", mapRoutes);
// app.use("/api/weather", weatherRoutes);
// app.use("/api/prediction", predictionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
