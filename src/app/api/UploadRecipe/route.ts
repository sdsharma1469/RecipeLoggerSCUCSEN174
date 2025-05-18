// src/app/api/UploadRecipe/route.ts
import { NextRequest } from "next/server";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase-client"; // Your Firebase instance
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const { recipe } = await req.json();

  try {
    const recipesCollection = collection(db, "recipes");
    const docRef = await addDoc(recipesCollection, recipe);
    console.log("Uploaded recipe ID:", docRef.id);
    return Response.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Firebase upload error:", error);
    return Response.json({ success: false });
  }
}