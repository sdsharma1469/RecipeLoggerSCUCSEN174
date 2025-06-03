"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";
import { Recipe } from "@/lib/types/Recipe";
import "./home.css";
import { useEffect } from "react";
import { getUserIdByUsername } from "@/lib/utils/UserHandling/IdbyUsername";

// Firebase imports
import { auth, storage } from "@/lib/firebase-client"; // Added storage import
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Added storage functions

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
    const [profileImage, setProfileImage] = useState<string>(
      "https://placehold.co/100"
    );

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
  const [grater, setGrater] = useState(false);
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
      // Check if script still exists before removing
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Function gets the image from the user logged in at the moment
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const uid = await getUserIdByUsername(username);
        const userDoc = await getDoc(doc(db, "users", uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.profileImageUrl) {
            setProfileImage(userData.profileImageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadUserProfile();
  }, [username]);

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

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setStatus("❌ Please select a valid image file.");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setStatus("❌ Image must be smaller than 5MB.");
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous status messages
      setStatus("");
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file: File, recipeId: string): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      // Check if Firebase Storage is properly initialized
      if (!storage) {
        console.error("Firebase Storage not initialized");
        throw new Error("Storage service not available");
      }
      
      const fileName = `recipes/${recipeId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const imageRef = ref(storage, fileName);
      
      console.log("Uploading image to:", fileName);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log("Image uploaded successfully:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      setStatus("❌ Failed to upload image. Recipe will be saved without image.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

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
        temperature: 0.1,
        max_tokens: 50,
      });

      console.log("🤖 Raw AI response:", JSON.stringify(response));

      if (!response) {
        console.error("❌ Empty response from AI");
        setAiError("⚠️ AI returned empty response.");
        setLoadingAI(false);
        return null;
      }

      const cleanResponse = String(response).trim();
      console.log("🧹 Cleaned response:", JSON.stringify(cleanResponse));

      let estimatedPrice = null;

      const directParse = parseFloat(cleanResponse);
      if (!isNaN(directParse) && directParse > 0) {
        estimatedPrice = directParse;
        console.log("✅ Direct parse successful:", estimatedPrice);
      } else {
        const allNumbers = cleanResponse.match(/\d+\.?\d*/g);
        console.log("🔢 All numbers found:", allNumbers);
        
        if (allNumbers && allNumbers.length > 0) {
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

    try {
      setStatus("💭 Estimating recipe cost...");
      const estimatedCost = await estimateRecipePrice();

      if (estimatedCost === null) {
        setStatus("❌ Failed to estimate recipe price. Please try again or check your ingredients.");
        return;
      }

      const recipeId = uuidv4();
      
      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        setStatus("📸 Uploading image...");
        imageUrl = await uploadImage(selectedImage, recipeId);
        // Continue even if image upload fails
      }

      const recipe: Recipe = {
        recipeId,
        author: username,
        createdAt: Timestamp.now(),
        name,
        description,
        ingredients: ingredients
          .filter(ing => ing.name.trim()) // Filter out empty ingredients
          .map((ing) => ({
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
          kettle: false,
          wok,
          smallPot,
          mediumPot,
          largePot,
          grater,
        },
        rating: [creatorRating],
        authorDiff: creatorRating,
        userDiff: difficulty,
        price: estimatedCost,
        ...(imageUrl && { imageUrl }), // Only add imageUrl if it exists
      };

      console.log("Attempting to upload recipe:", recipe);

      setStatus("🔄 Uploading recipe...");
      const success = await uploadRecipeClientSide(recipe);

      if (success) {
        setStatus(`✅ Recipe uploaded! Estimated cost: $${estimatedCost.toFixed(2)}${imageUrl ? ' (with image)' : ''}`);
        resetForm();
      } else {
        setStatus("❌ Failed to upload recipe.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setStatus(`❌ Upload failed: ${error.message || 'Unknown error'}`);
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
    setSelectedImage(null);
    setImagePreview(null);
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
    
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
            src={profileImage} 
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
        {(loadingAI || uploadingImage) && (
          <div style={{ 
            backgroundColor: "#e3f2fd", 
            color: "#1565c0", 
            padding: "1rem", 
            borderRadius: "4px", 
            marginBottom: "1rem",
            border: "1px solid #bbdefb"
          }}>
            {loadingAI && "🤖 AI is estimating recipe price..."}
            {uploadingImage && "📸 Uploading image..."}
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

          {/* Image Upload Section */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Recipe Image (Optional)
            </label>
            
            {!imagePreview ? (
              <div style={{ 
                border: "2px dashed #ddd", 
                borderRadius: "4px", 
                padding: "2rem", 
                textAlign: "center",
                backgroundColor: "#fafafa"
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload"
                  style={{
                    cursor: "pointer",
                    color: "#4caf50",
                    fontWeight: "bold"
                  }}
                >
                  📷 Click to upload image
                </label>
                <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                  Maximum file size: 5MB
                </p>
              </div>
            ) : (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={imagePreview}
                  alt="Recipe preview"
                  style={{
                    maxWidth: "300px",
                    maxHeight: "200px",
                    borderRadius: "4px",
                    border: "1px solid #ddd"
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "rgba(255, 0, 0, 0.7)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>

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
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={largePot} onChange={() => setGrater(!grater)} /> Cheese Grater
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
                disabled={ingredients.length >= 50}
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
            disabled={loadingAI || uploadingImage}
            style={{
              alignSelf: "flex-start",
              backgroundColor: (loadingAI || uploadingImage) ? "#ccc" : "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: (loadingAI || uploadingImage) ? "not-allowed" : "pointer",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              transition: "background-color 0.3s",
            }}
          >
            {loadingAI ? "Estimating Price..." : uploadingImage ? "Uploading Image..." : "Upload Recipe"}
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