"use client";
import { useState } from "react";
import React from "react";
import { uploadRecipeClientSide } from "@/lib/utils/Recipes/Upload";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore"; // from Firebase client SDK
import "./home.css";
// Firebase Auth imports
import { auth } from "@/lib/firebase-client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client"; // Firestore instance

export default function UploadRecipePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [status, setStatus] = useState("");
  const [creatorRating, setCreatorRating] = useState(0);
  const [difficulty, setDifficulty] = useState(1);

  // Tags
  const [halal, setHalal] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);
  const [lactoseFree, setLactoseFree] = useState(false);
  const [soy, setSoy] = useState(false);
  const [peanuts, setPeanuts] = useState(false);

  // Tools/Appliances
  const [knife, setKnife] = useState(false);
  const [oven, setOven] = useState(false);
  const [airFryer, setAirFryer] = useState(false);
  const [stainlessSteelPan, setStainlessSteelPan] = useState(false);
  const [wok, setWok] = useState(false);
  const [smallPot, setSmallPot] = useState(false);
  const [mediumPot, setMediumPot] = useState(false);
  const [largePot, setLargePot] = useState(false);

  // 🔐 User Authentication & Username Detection
  const [username, setUsername] = useState("");

  React.useEffect(() => {
    const firebaseAuth = getAuth();
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || currentUser.email || "User");
          } else {
            setUsername(currentUser.email || "User");
          }
        } catch (error) {
          console.error("Firestore error:", error);
          setUsername(currentUser.email || "User");
        }
      } else {
        setUsername("Guest");
      }
    });
    return () => unsubscribe(); // Clean up listener
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipeId = uuidv4();
    const recipe = {
      recipeId,
      author: username,
      createdAt: Timestamp.now(),
      name,
      description,
      ingredients: ingredients
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name) => ({ quantity: 1, name })),
      steps: steps
        .split("\n")
        .map((step) => step.trim())
        .filter(Boolean),
      comments: [],
      tags: {
        halal,
        vegan,
        vegetarian,
        lactoseFree,
        soy,
        peanuts,
      },
      tools: {
        knife,
        oven,
        airFryer,
        stainlessSteelPan,
        wok,
        smallPot,
        mediumPot,
        largePot,
      },
      rating: [creatorRating],
      difficulty,
      cost: 0,
    };
    const success = await uploadRecipeClientSide(recipe);
    if (success) {
      setStatus("✅ Recipe uploaded!");
      resetForm();
    } else {
      setStatus("❌ Failed to upload recipe.");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIngredients("");
    setSteps("");
    setCreatorRating(0);
    setDifficulty(1);
    setHalal(false);
    setVegan(false);
    setVegetarian(false);
    setLactoseFree(false);
    setSoy(false);
    setPeanuts(false);

    setKnife(false);
    setOven(false);
    setAirFryer(false);
    setStainlessSteelPan(false);
    setWok(false);
    setSmallPot(false);
    setMediumPot(false);
    setLargePot(false);
  };

  

  return (
    <div>
      {/* Top Navigation Bar */}
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Recipe Logger</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={username ? `/home/${username}` : "/home"}>Home</a> |
          <a href={username ? `/explore/${username}` : "/explore"}>Explore</a> |
          <a href={username ? `/shoppingList/${username}` : "/shoppingList"}>Cart</a> |
          <img
            src="https://placehold.co/100  "
            alt="User Profile"
            style={{ borderRadius: "50%", width: "30px", height: "30px" }}
          />
          <span>{username}</span>
        </div>
      </div>

      {/* Main Upload Form */}
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Upload a Recipe</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Title */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Recipe Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minHeight: "80px",
              }}
            />
          </div>

          {/* Ingredients */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Ingredients (one per line. make sure to put in the correct measurements before the ingredient.)</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minHeight: "100px",
              }}
            />
          </div>

          {/* Steps */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Steps (one per line)</label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minHeight: "150px",
              }}
            />
          </div>

          {/* Dietary Tags */}
          <div>
            <h3 style={{ marginBottom: "0.5rem" }}>Dietary Tags</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={halal} onChange={() => setHalal(!halal)} /> Halal
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={vegan} onChange={() => setVegan(!vegan)} /> Vegan
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={vegetarian} onChange={() => setVegetarian(!vegetarian)} /> Vegetarian
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={lactoseFree} onChange={() => setLactoseFree(!lactoseFree)} /> Lactose Free
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={soy} onChange={() => setSoy(!soy)} /> Contains Soy
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={peanuts} onChange={() => setPeanuts(!peanuts)} /> Contains Peanuts
              </label>
            </div>
          </div>

          {/* Tools/Appliances Tags */}
          <div>
            <h3 style={{ marginBottom: "0.5rem" }}>Tools / Appliances</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={knife} onChange={() => setKnife(!knife)} /> Knife
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={oven} onChange={() => setOven(!oven)} /> Oven
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={airFryer} onChange={() => setAirFryer(!airFryer)} /> Air Fryer
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={stainlessSteelPan} onChange={() => setStainlessSteelPan(!stainlessSteelPan)} /> Stainless Steel Pan
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={wok} onChange={() => setWok(!wok)} /> Wok
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={smallPot} onChange={() => setSmallPot(!smallPot)} /> Small Pot
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={mediumPot} onChange={() => setMediumPot(!mediumPot)} /> Medium Pot
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={largePot} onChange={() => setLargePot(!largePot)} /> Large Pot
              </label>
            </div>
          </div>

          {/* Rating and Difficulty */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Your Rating (0–5)</label>
              <input
                type="number"
                min="0"
                max="5"
                value={creatorRating}
                onChange={(e) => setCreatorRating(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Difficulty (1–5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              marginTop: "1rem",
            }}
          >
            Upload Recipe
          </button>

          {/* Status Message */}
          <p style={{ marginTop: "1rem", color: status.includes("✅") ? "green" : "red" }}>{status}</p>
        </form>
      </div>
    </div>
  );
}