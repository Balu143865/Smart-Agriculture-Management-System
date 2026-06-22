import express from "express";
import registerHandler from "./auth/register.js";
import loginHandler from "./auth/login.js";
import forgotPasswordHandler from "./auth/forgot-password.js";
import meHandler from "./auth/me.js";
import profileHandler from "./auth/profile.js";
import farmsHandler from "./farms/index.js";
import cropsHandler from "./crops/index.js";
import financesHandler from "./finances/index.js";
import marketPricesHandler from "./market-prices/index.js";
import weatherHandler from "./weather/index.js";
import fertilizerHandler from "./fertilizer/index.js";
import recommendationsCropHandler from "./recommendations/crop.js";
import recommendationsFertilizerHandler from "./recommendations/fertilizer.js";
import diseaseHistoryHandler from "./disease/history.js";
import diseaseDetectHandler from "./disease/detect.js";
import diseaseChatHandler from "./disease/chat.js";
import adminUsersHandler from "./admin/users.js";
import adminSystemHandler from "./admin/system.js";

const app = express();

// Standard Express body-parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global middleware for CORS headers (Vercel-friendly)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Helper to bridge Express route params (e.g. `/api/farms/:id`) to `req.query.id` for backend compat
const bridgeParams = (handler) => async (req, res, next) => {
  req.query = { ...req.query, ...req.params };
  try {
    await handler(req, res, next);
  } catch (err) {
    next(err);
  }
};

// Mount route mappings from legacy vercel.json structure to Express
app.all("/api/auth/register", registerHandler);
app.all("/api/auth/login", loginHandler);
app.all("/api/auth/forgot-password", forgotPasswordHandler);
app.all("/api/auth/me", meHandler);
app.all("/api/auth/profile", profileHandler);

app.all("/api/farms/:id", bridgeParams(farmsHandler));
app.all("/api/farms", farmsHandler);

app.all("/api/crops/:id", bridgeParams(cropsHandler));
app.all("/api/crops", cropsHandler);

app.all("/api/finances/:id", bridgeParams(financesHandler));
app.all("/api/finances", financesHandler);

app.all("/api/market-prices/:id", bridgeParams(marketPricesHandler));
app.all("/api/market-prices", marketPricesHandler);

app.all("/api/weather", weatherHandler);
app.all("/api/fertilizer", fertilizerHandler);

app.all("/api/recommendations/crop", recommendationsCropHandler);
app.all("/api/recommendations/fertilizer", recommendationsFertilizerHandler);

app.all("/api/disease/history", diseaseHistoryHandler);
app.all("/api/disease/detect", diseaseDetectHandler);
app.all("/api/disease/chat", diseaseChatHandler);

app.all("/api/admin/users/:id/role", async (req, res, next) => {
  req.query = { ...req.query, id: req.params.id, action: "role" };
  try {
    await adminUsersHandler(req, res, next);
  } catch (err) {
    next(err);
  }
});
app.all("/api/admin/users/:id", bridgeParams(adminUsersHandler));
app.all("/api/admin/users", adminUsersHandler);

app.all("/api/admin/system", adminSystemHandler);

// Handle resource fallback or 404
app.use((req, res) => {
  res.status(404).json({ error: `Route not registered: ${req.path}` });
});

export default app;
