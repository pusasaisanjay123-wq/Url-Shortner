import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import urlRoutes from "./routes/authUrl.js";
import { isAuthenticated, isNotAuthenticated } from "./middleware/auth.js";
import Url from "./models/Url.js";
import fs from 'fs';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to find Frontend directory in both Local and Docker setups
const resolveFrontendPath = () => {
  const candidates = [
    path.join(__dirname, 'Frontend'),           // Docker (/app/Frontend)
    path.join(__dirname, '..', 'Frontend'),      // Local (Backend/../Frontend)
    path.join(process.cwd(), 'Frontend'),       // Root execution
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      console.log('Found Frontend folder at:', dir);
      return dir;
    }
  }
  
  console.error('Could not find Frontend directory in:', candidates);
  return path.join(__dirname, 'Frontend');
};

const frontendPath = resolveFrontendPath()

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(frontendPath)));

// Session configuration
const sessionConfig = {
  secret:
    process.env.SESSION_SECRET ||
    "url-shortener-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
};

if (process.env.NODE_ENV !== "test") {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    collectionName: "sessions",
    ttl: 24 * 60 * 60,
  });
}

app.use(session(sessionConfig));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);

// Page Routes
app.get("/", (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.redirect("/login");
});

app.get("/login", isNotAuthenticated, (req, res) => {
   const file = fs.existsSync(path.join(frontendPath, 'index.html'))
    ? path.join(frontendPath, 'index.html')
    : path.join(frontendPath, 'login.html');
    
  res.sendFile(file);
  // res.sendFile(path.join(__dirname, "..", "Frontend", "index.html"));
});

app.get("/signup", isNotAuthenticated, (req, res) => {
  res.sendFile(path.join(frontendPath, "signup.html"));
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.sendFile(path.join(frontendPath, "dashboard.html"));
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Short URL redirect
app.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    if (
      shortCode.includes(".") ||
      ["api", "health", "login", "signup", "dashboard"].includes(shortCode)
    ) {
      return res.status(404).json({ error: "Not found" });
    }

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>URL Not Found</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h1>404 - Short URL Not Found</h1>
          <p>The short URL you are looking for does not exist.</p>
          <a href="/login">Go to Login</a>
        </body>
        </html>
      `);
    }

    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export default app;
