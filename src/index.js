import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import packageRoutes from "./routes/package.routes.js";
import destinationRoutes from "./routes/destination.routes.js";
import guideRoutes from "./routes/guide.routes.js";
import hotelRoutes from "./routes/hotel.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------
// CLIENT_URL  — single origin (legacy, kept for backwards-compat)
// CLIENT_URLS — comma-separated list of allowed origins for multi-domain setups
//   e.g.  CLIENT_URLS=https://dillkashkashmir.com,https://www.dillkashkashmir.com
const extraOrigins = (process.env.CLIENT_URLS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...extraOrigins,
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, same-origin SSR)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin.endsWith(".devtunnels.ms")
      ) {
        return callback(null, true);
      }
      // Log the blocked origin so it's visible in production server logs
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      console.warn(`[CORS] Allowed origins: ${allowedOrigins.join(", ")}`);
      callback(new Error(`CORS: origin '${origin}' is not allowed. Add it to CLIENT_URL or CLIENT_URLS in the server .env`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

// --------------- Static files ---------------
// Serve uploaded images from server/public/uploads as /uploads/<filename>
app.use(express.static(path.join(__dirname, "../public")));


// --------------- Routes ---------------
app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", uploadRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --------------- Global Error Handler ---------------
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
});

// --------------- Start ---------------
app.listen(PORT, () => {
  console.log(`✅ DillKash Kashmir API running on http://localhost:${PORT}`);
});

export default app;
