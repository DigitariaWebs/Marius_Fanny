import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth";
import apiRoutes from "./routes"; 
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sanitizeBody } from "./middleware/validation";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// --- AJOUTE CETTE LIGNE ICI (AVANT LA CONNEXION) ---
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/marius_fanny";

// 1. CONNEXION MONGOOSE
mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI) // Maintenant, MONGODB_URI est bien défini !
  .then(() => console.log("✅ MONGOOSE CONNECTÉ"))
  .catch(err => console.error("❌ ERREUR CONNEXION MONGOOSE:", err));
  
mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MONGOOSE CONNECTÉ"))
  .catch(err => console.error("❌ ERREUR CONNEXION MONGOOSE:", err));

// 2. MIDDLEWARES
app.use(cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));
app.use(express.json());
app.use(sanitizeBody);

// 3. TES ROUTES PERSONNALISÉES (EN PREMIER)
// On monte apiRoutes sur /api. 
// Il va intercepter /api/auth/forgot_password avant Better Auth.
app.use("/api", apiRoutes);

// 4. BETTER AUTH (EN DEUXIÈME)
// Il gèrera tout ce que apiRoutes n'a pas capturé (login, signup, etc.)
app.use("/api/auth", toNodeHandler(auth));

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// 5. GESTION DES ERREURS
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});