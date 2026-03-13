import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI manquant dans l'environnement");
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

async function run() {
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection("user");

    console.log("🔄 Migration des rôles four -> vendeur en cours...");

    const beforeCount = await users.countDocuments({ role: "four" });
    console.log(`📊 Utilisateurs avec rôle four avant migration: ${beforeCount}`);

    const updateResult = await users.updateMany(
      { role: "four" },
      {
        $set: {
          role: "vendeur",
          updatedAt: new Date(),
        },
      },
    );

    const afterCount = await users.countDocuments({ role: "four" });
    const vendeurCount = await users.countDocuments({ role: "vendeur" });

    console.log("✅ Migration terminée");
    console.log(`- Documents modifiés: ${updateResult.modifiedCount}`);
    console.log(`- Rôle four restant: ${afterCount}`);
    console.log(`- Rôle vendeur total: ${vendeurCount}`);

    const oldAccount = await users.findOne({ email: "four@gmail.com" });
    const newAccount = await users.findOne({ email: "vendeuse@gmail.com" });

    if (oldAccount && !newAccount) {
      console.log(
        "ℹ️ Compte legacy four@gmail.com trouvé. Pour créer vendeuse@gmail.com avec mot de passe vendeuse123, exécute: node backend/scripts/seed-roles.js",
      );
    }
  } catch (error) {
    console.error("❌ Erreur migration four -> vendeur:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
