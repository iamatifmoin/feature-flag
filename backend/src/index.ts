import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import orgRoutes from "./routes/orgs.routes";
import flagRoutes from "./routes/flags.routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  allowedOrigins.push(
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "https://feature-flag-pi.vercel.app",
    "https://feature-flag-admin-sigma.vercel.app",
    "https://feature-flag-yssi.vercel.app"
  );
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orgs", orgRoutes);
app.use("/api/flags", flagRoutes);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
