import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("./recipe-platform-156dc-firebase-adminsdk-fbsvc-d127e2224e.json", "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  try {
    await db.collection("recipes").add({
      title: "Pasta Carbonara",
      ingredients: ["pasta", "eggs", "cheese"],
      steps: ["Boil pasta", "Mix eggs", "Combine"],
      tags: ["italian"],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ratingAvg: 4.5,
      prepTime: 20,
      isVegetarian: false,
    });
    console.log("Seed complete!");
  } catch (error) {
    console.error("Error seeding:", error);
  }
}

seed();
