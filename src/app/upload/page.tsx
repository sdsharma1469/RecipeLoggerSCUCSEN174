"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";
import { Recipe } from "@/lib/types/Recipe"; // Assuming you have a Recipe type defined
import "./home.css";

// Firebase imports
import { auth } from "@/lib/firebase-client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client"; // Firestore instance

// Upload utility
import { uploadRecipeClientSide } from "@/lib/utils/Recipes/Upload";

export default function UploadRecipePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([{ quantity: "1", measurement: "cup", name: "" }]);
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

  // Tools
  const [knife, setKnife] = useState(false);
  const [oven, setOven] = useState(false);
  const [airFryer, setAirFryer] = useState(false);
  const [stainlessSteelPan, setStainlessSteelPan] = useState(false);
  const [wok, setWok] = useState(false);
  const [smallPot, setSmallPot] = useState(false);
  const [mediumPot, setMediumPot] = useState(false);
  const [largePot, setLargePot] = useState(false);

  // Auth
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

    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      setStatus("❌ You must be signed in to upload.");
      return;
    }

    const recipeId = uuidv4();
    const recipe = {
      recipeId,
      author: username,
      createdAt: Timestamp.now(),
      name,
      description,
      ingredients: ingredients.map((ing) => ({
        quantity: parseFloat(ing.quantity) || 0,
        measurement: ing.measurement,
        name: ing.name.trim(),
      })),
      steps: steps.split("\n").map((step) => step.trim()).filter(Boolean),
      comments: [],
      tags: { halal, vegan, vegetarian, lactoseFree, soy, peanuts },
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
      authorDiff: creatorRating,
      userDiff: difficulty,
      cost: 0,
    };

    console.log("Attempting to upload recipe:", recipe); // 🔍 Debug log

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
    setIngredients([{ quantity: "1", measurement: "cup", name: "" }]);
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

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    updated[index][field as keyof typeof ingredients[0]] = value;
    setIngredients(updated);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { quantity: "1", measurement: "cup", name: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const updated = ingredients.filter((_, i) => i !== index);
      setIngredients(updated);
    }
  };

  const MEASUREMENT_OPTIONS = [
    "whole",
    "kg",
    "g",
    "lb",
    "oz",
    "liter",
    "ml",
    "cup",
    "tablespoon",
    "teaspoon"
  ];

  return (
    <div style={{ backgroundColor: "#e8f5e9", minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Recipe Logger</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href={`/shoppingList/${username}`}>Cart</a> |
          <img
            src="https://placehold.co/100" 
            alt="User Profile"
            style={{
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              border: "2px solid #4caf50",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
            }}
          />
          <span>{username}</span>
        </div>
      </div>

      {/* Main Upload Form */}
      <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Upload a Recipe</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Title */}
          <input
            type="text"
            placeholder="Recipe name"
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

          {/* Description */}
          <textarea
            placeholder="Short description"
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

          {/* Ingredients */}
          <div>
            <label>Dietary Tags</label>
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

          {/* Ingredient Fields */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Ingredients:</label>
            {ingredients.map((ingredient, index) => (
              <div key={index} style={{ display: "flex", gap: "0.5em", marginBottom: "0.5em" }}>
                <input
                  type="number"
                  min="0"
                  placeholder="Qty"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                  style={{
                    width: "60px",
                    padding: "0.5em",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
                <select
                  value={ingredient.measurement}
                  onChange={(e) => handleIngredientChange(index, "measurement", e.target.value)}
                  style={{
                    width: "100px",
                    padding: "0.5em",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  {MEASUREMENT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.5em",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  disabled={ingredients.length <= 1}
                  style={{
                    padding: "0.5em",
                    cursor: "pointer",
                    borderRadius: "4px",
                    border: "none",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#d6ead6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  &times;
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: "0.5em", marginTop: "0.5em" }}>
              <button
                type="button"
                onClick={handleAddIngredient}
                disabled={ingredients.length >= 20}
                style={{
                  padding: "0.5em",
                  cursor: "pointer",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#cce9cc",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#b3ddaa")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#cce9cc")
                }
              >
                ➕ Add Ingredient
              </button>
              <button
                type="button"
                onClick={() => setIngredients(ingredients.slice(0, -1))}
                disabled={ingredients.length <= 1}
                style={{
                  padding: "0.5em",
                  cursor: "pointer",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#ffe0b2",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ffd194")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ffe0b2")
                }
              >
                ➖ Remove Ingredient
              </button>
            </div>
          </div>

          {/* Steps */}
          <textarea
            placeholder="Steps (one per line)"
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

          {/* Ratings */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label>Your Rating (0–5)</label>
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
              <label>Difficulty (1–5)</label>
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
              alignSelf: "flex-start",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#43a047")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#4CAF50")
            }
          >
            Upload Recipe
          </button>

          {/* Status Message */}
          <p style={{ marginTop: "1rem", color: status.includes("✅") ? "green" : "red" }}>{status}</p>
        </form>
      </main>
    </div>
  );
}