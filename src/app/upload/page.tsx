"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";
import { Recipe } from "@/lib/types/Recipe";
import "./home.css";
import { useEffect } from "react";

// Firebase imports
import { auth } from "@/lib/firebase-client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

// Upload utility
import { uploadRecipeClientSide } from "@/lib/utils/Recipes/Upload";

export default function UploadRecipePage() {
  const [aiError, setAiError] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([{ quantity: "1", measurement: "cup", name: "" }]);
  const [steps, setSteps] = useState("");
  const [status, setStatus] = useState("");
  const [creatorRating, setCreatorRating] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

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

  useEffect(() => {
    if (window.puter?.ai) {
      console.log("Puter AI already available");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/"; 
    script.async = true;

    script.onload = () => {
      console.log("Puter AI script loaded successfully");
      setAiError(null);
    };

    script.onerror = () => {
      console.error("Failed to load Puter AI script");
      setAiError("⚠️ Failed to load AI integration.");
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

    return () => unsubscribe();
  }, []);

  const estimateRecipePrice = async () => {
    if (!window.puter?.ai) {
      setAiError("⚠️ AI service not available. Please refresh the page.");
      return null;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      const ingredientsList = ingredients
        .filter(ing => ing.name.trim())
        .map(ing => `${ing.quantity} ${ing.measurement} ${ing.name}`)
        .join(', ');

      if (!ingredientsList) {
        setAiError("⚠️ Please add ingredients before estimating price.");
        setLoadingAI(false);
        return null;
      }

      const prompt = `You are a grocery pricing expert. Estimate the total cost in USD for these recipe ingredients based on typical US supermarket prices: ${ingredientsList}

Please consider:
- Current average grocery store prices in the US
- Standard package sizes (don't assume buying exact quantities)
- Seasonal price variations
- Common brand pricing

IMPORTANT: Respond with ONLY a number (example: 15.75). No dollar signs, no text, no explanations - just the price as a decimal number.`;

      console.log("🔍 Sending prompt to AI:", prompt);
      console.log("🥕 Ingredients list:", ingredientsList);

      const response = await window.puter.ai.chat(prompt, {
        model: 'deepseek-chat',
        temperature: 0.1, // Lower temperature for more consistent responses
        max_tokens: 50, // Much lower since we only need a number
      });

      console.log("🤖 Raw AI response:", JSON.stringify(response));
      console.log("🤖 Response type:", typeof response);
      console.log("🤖 Response length:", response?.length);

      if (!response) {
        console.error("❌ Empty response from AI");
        setAiError("⚠️ AI returned empty response.");
        setLoadingAI(false);
        return null;
      }

      // Clean the response thoroughly
      const cleanResponse = String(response).trim();
      console.log("🧹 Cleaned response:", JSON.stringify(cleanResponse));

      // More comprehensive number extraction
      let estimatedPrice = null;

      // Try direct parsing first
      const directParse = parseFloat(cleanResponse);
      if (!isNaN(directParse) && directParse > 0) {
        estimatedPrice = directParse;
        console.log("✅ Direct parse successful:", estimatedPrice);
      } else {
        // Try extracting any number from the text
        const allNumbers = cleanResponse.match(/\d+\.?\d*/g);
        console.log("🔢 All numbers found:", allNumbers);
        
        if (allNumbers && allNumbers.length > 0) {
          // Take the first valid number
          for (const numStr of allNumbers) {
            const num = parseFloat(numStr);
            if (!isNaN(num) && num > 0) {
              estimatedPrice = num;
              console.log("✅ Extracted price from text:", estimatedPrice);
              break;
            }
          }
        }
      }

      setLoadingAI(false);

      if (estimatedPrice === null || estimatedPrice <= 0) {
        console.error("❌ Could not extract valid price from response:", cleanResponse);
        setAiError(`⚠️ AI returned invalid price format: "${cleanResponse}"`);
        return null;
      }

      console.log("🎯 Final estimated price:", estimatedPrice);
      return estimatedPrice;

    } catch (error) {
      console.error("💥 AI estimation error:", error);
      setAiError(`⚠️ Failed to estimate price: ${error.message || 'Unknown error'}`);
      setLoadingAI(false);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      setStatus("❌ You must be signed in to upload.");
      return;
    }

    setStatus("💭 Estimating recipe cost...");
    const estimatedCost = await estimateRecipePrice();

    // Check if price estimation failed
    if (estimatedCost === null) {
      setStatus("❌ Failed to estimate recipe price. Please try again or check your ingredients.");
      return; // Don't proceed with upload if price estimation fails
    }

    const recipeId = uuidv4();
    const recipe: Recipe = {
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
        kettle: false, // Added missing kettle field from Recipe type
        wok,
        smallPot,
        mediumPot,
        largePot,
      },
      rating: [creatorRating],
      authorDiff: creatorRating,
      userDiff: difficulty,
      price: estimatedCost, // This will now be the exact value from DeepSeek
    };

    console.log("Attempting to upload recipe:", recipe);

    const success = await uploadRecipeClientSide(recipe);

    if (success) {
      setStatus(`✅ Recipe uploaded! Estimated cost: $${estimatedCost.toFixed(2)}`);
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
    setEstimatedPrice(0);
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
        
        {/* AI Error Display */}
        {aiError && (
          <div style={{ 
            backgroundColor: "#ffebee", 
            color: "#c62828", 
            padding: "1rem", 
            borderRadius: "4px", 
            marginBottom: "1rem",
            border: "1px solid #ffcdd2"
          }}>
            {aiError}
          </div>
        )}

        {/* Loading Indicator */}
        {loadingAI && (
          <div style={{ 
            backgroundColor: "#e3f2fd", 
            color: "#1565c0", 
            padding: "1rem", 
            borderRadius: "4px", 
            marginBottom: "1rem",
            border: "1px solid #bbdefb"
          }}>
            🤖 AI is estimating recipe price...
          </div>
        )}

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

          {/* Dietary Tags */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Dietary Tags</label>
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

          {/* Tools/Appliances Section */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Required Tools & Appliances</label>
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

          {/* Ingredient Fields */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Ingredients:</label>
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
                    backgroundColor: ingredients.length <= 1 ? "#ccc" : "#ffcdd2",
                    transition: "background-color 0.3s",
                  }}
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
            disabled={loadingAI}
            style={{
              alignSelf: "flex-start",
              backgroundColor: loadingAI ? "#ccc" : "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: loadingAI ? "not-allowed" : "pointer",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              transition: "background-color 0.3s",
            }}
          >
            {loadingAI ? "Estimating Price..." : "Upload Recipe"}
          </button>

          {/* Status Message */}
          {status && (
            <p style={{ 
              marginTop: "1rem", 
              padding: "1rem",
              borderRadius: "4px",
              backgroundColor: status.includes("✅") ? "#e8f5e9" : "#ffebee",
              color: status.includes("✅") ? "#2e7d32" : "#c62828",
              border: `1px solid ${status.includes("✅") ? "#c8e6c9" : "#ffcdd2"}`
            }}>
              {status}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}