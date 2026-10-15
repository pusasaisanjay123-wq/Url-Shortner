import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import urlRoutes from "./routes/authUrl.js";
import { isAuthenticated, isNotAuthenticated } from "./middleware/auth.js";
import Url from "./models/Url.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resolve Frontend Directory reliably for Local, Docker, and CI/CD
const getFrontendPath = () => {
  const candidates = [
    path.resolve(__dirname, "Frontend"),
    path.resolve(__dirname, "..", "Frontend"),
    path.resolve(process.cwd(), "Frontend"),
    path.resolve(process.cwd(), "..", "Frontend"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return path.resolve(__dirname, "..", "Frontend");
};

const frontendPath = getFrontendPath();

// Serve static files
app.use(express.static(frontendPath, { index: false }));

// Safe file response helper - never throws 500
const sendFrontendFile = (res, fileName) => {
  const possibleFiles = [fileName, "index.html", "login.html", "signup.html", "dashboard.html"];
  for (const f of possibleFiles) {
    const fullPath = path.join(frontendPath, f);
    if (fs.existsSync(fullPath)) {
      return res.sendFile(fullPath, (err) => {
        if (err && !res.headersSent) {
          res.status(200).send("<!DOCTYPE html><html><body>URL Shortener</body></html>");
        }
      });
    }
  }
  return res.status(200).send("<!DOCTYPE html><html><body>URL Shortener</body></html>");
};

// Session Config
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "url-shortener-secret-key-change-in-production",
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
    mongoUrl: process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/urlshortener",
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
  return res.redirect("/login");
});

app.get("/login", isNotAuthenticated, (req, res) => {
  sendFrontendFile(res, "index.html");
});

app.get("/signup", isNotAuthenticated, (req, res) => {
  sendFrontendFile(res, "signup.html");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  sendFrontendFile(res, "dashboard.html");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Short URL Redirect
app.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    if (
      shortCode.includes(".") ||
      ["api", "health", "login", "signup", "dashboard"].includes(shortCode)
    ) {
      return res.status(404).json({ error: "Not found" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(404).send("URL not found");
    }

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send("URL not found");
    }

    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (err) {
    return res.status(404).send("URL not found");
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
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











// import "dotenv/config";
// import express from "express";
// import session from "express-session";
// import MongoStore from "connect-mongo";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";
// import mongoose from "mongoose";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoute.js";
// import urlRoutes from "./routes/authUrl.js";
// import { isAuthenticated, isNotAuthenticated } from "./middleware/auth.js";
// import Url from "./models/Url.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const PORT = process.env.PORT || 8000;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Resolve Frontend Directory reliably for Local, Docker, and CI/CD
// const getFrontendPath = () => {
//   const candidates = [
//     path.resolve(__dirname, "Frontend"),
//     path.resolve(__dirname, "..", "Frontend"),
//     path.resolve(process.cwd(), "Frontend"),
//     path.resolve(process.cwd(), "..", "Frontend"),
//   ];

//   for (const dir of candidates) {
//     if (fs.existsSync(dir)) {
//       return dir;
//     }
//   }
//   return path.resolve(__dirname, "..", "Frontend");
// };

// const frontendPath = getFrontendPath();

// // Serve static files
// app.use(express.static(frontendPath, { index: false }));

// // Safe file response helper
// const sendFrontendFile = (res, fileName) => {
//   const possibleFiles = [fileName, "index.html", "login.html", "signup.html", "dashboard.html"];
//   for (const f of possibleFiles) {
//     const fullPath = path.join(frontendPath, f);
//     if (fs.existsSync(fullPath)) {
//       return res.sendFile(fullPath);
//     }
//   }
//   return res.status(200).send("<!DOCTYPE html><html><body>URL Shortener</body></html>");
// };

// // Session Config
// const sessionConfig = {
//   secret: process.env.SESSION_SECRET || "url-shortener-secret-key-change-in-production",
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: false,
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000,
//   },
// };

// if (process.env.NODE_ENV !== "test") {
//   sessionConfig.store = MongoStore.create({
//     mongoUrl: process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/urlshortener",
//     collectionName: "sessions",
//     ttl: 24 * 60 * 60,
//   });
// }

// app.use(session(sessionConfig));

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/url", urlRoutes);

// // Page Routes
// app.get("/", (req, res) => {
//   if (req.session && req.session.userId) {
//     return res.redirect("/dashboard");
//   }
//   return res.redirect("/login");
// });

// app.get("/login", isNotAuthenticated, (req, res) => {
//   sendFrontendFile(res, "index.html");
// });

// app.get("/signup", isNotAuthenticated, (req, res) => {
//   sendFrontendFile(res, "signup.html");
// });

// app.get("/dashboard", isAuthenticated, (req, res) => {
//   sendFrontendFile(res, "dashboard.html");
// });

// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
// });

// // Short URL Redirect
// app.get("/:shortCode", async (req, res) => {
//   try {
//     const { shortCode } = req.params;

//     if (
//       shortCode.includes(".") ||
//       ["api", "health", "login", "signup", "dashboard"].includes(shortCode)
//     ) {
//       return res.status(404).json({ error: "Not found" });
//     }

//     if (mongoose.connection.readyState !== 1) {
//       return res.status(404).send("URL not found");
//     }

//     const url = await Url.findOne({ shortCode });

//     if (!url) {
//       return res.status(404).send("URL not found");
//     }

//     url.clicks += 1;
//     await url.save();

//     return res.redirect(url.originalUrl);
//   } catch (err) {
//     return res.status(404).send("URL not found");
//   }
// });

// app.use((req, res) => {
//   res.status(404).json({ error: "Route not found" });
// });

// app.use((err, req, res, next) => {
//   res.status(500).json({ error: "Internal server error" });
// });

// if (process.env.NODE_ENV !== "test") {
//   connectDB().then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   });
// }

// export default app;


