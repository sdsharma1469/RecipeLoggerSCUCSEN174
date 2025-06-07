"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";
import { Recipe } from "@/lib/types/Recipe";
import "./home.css";
import { useEffect } from "react";
import { getUserIdByUsername } from "@/lib/utils/UserHandling/IdbyUsername";

// Firebase imports for authentication, database, and storage
import { auth, storage } from "@/lib/firebase-client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Custom utility for uploading recipes
import { uploadRecipeClientSide } from "@/lib/utils/Recipes/Upload";

/**
 * UploadRecipePage Component
 * 
 * A comprehensive recipe upload form that allows users to:
 * - Add recipe details (name, description, ingredients, steps)
 * - Upload recipe images to Firebase Storage
 * - Set dietary tags and required tools
 * - Use AI to estimate recipe costs
 * - Submit complete recipes to Firestore database
 */
export default function UploadRecipePage() {
  // ===========================================
  // AI-RELATED STATE MANAGEMENT
  // ===========================================
  
  // Error state for AI service failures
  const [aiError, setAiError] = useState<string | null>(null);
  // Loading state for AI price estimation
  const [loadingAI, setLoadingAI] = useState(false);

  // ===========================================
  // RECIPE FORM STATE MANAGEMENT
  // ===========================================
  
  // Basic recipe information
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // Ingredients array with quantity, measurement unit, and name
  const [ingredients, setIngredients] = useState([{ quantity: "1", measurement: "cup", name: "" }]);
  
  // Recipe preparation steps
  const [steps, setSteps] = useState("");
  
  // General form status messages
  const [status, setStatus] = useState("");
  
  // Rating and difficulty metrics
  const [creatorRating, setCreatorRating] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  
  // User profile image URL with default placeholder
  const [profileImage, setProfileImage] = useState<string>(
    "https://placehold.co/100"
  );

  // ===========================================
  // IMAGE UPLOAD STATE MANAGEMENT
  // ===========================================
  
  // File object for selected image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // Base64 preview URL for selected image
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Loading state for image upload process
  const [uploadingImage, setUploadingImage] = useState(false);

  // ===========================================
  // DIETARY TAGS STATE (Boolean flags)
  // ===========================================
  
  const [halal, setHalal] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);
  const [lactoseFree, setLactoseFree] = useState(false);
  const [soy, setSoy] = useState(false);
  const [peanuts, setPeanuts] = useState(false);

  // ===========================================
  // COOKING TOOLS STATE (Boolean flags)
  // ===========================================
  
  const [knife, setKnife] = useState(false);
  const [oven, setOven] = useState(false);
  const [airFryer, setAirFryer] = useState(false);
  const [stainlessSteelPan, setStainlessSteelPan] = useState(false);
  const [grater, setGrater] = useState(false);
  const [wok, setWok] = useState(false);
  const [smallPot, setSmallPot] = useState(false);
  const [mediumPot, setMediumPot] = useState(false);
  const [largePot, setLargePot] = useState(false);

  // ===========================================
  // USER AUTHENTICATION STATE
  // ===========================================
  
  // Current logged-in username
  const [username, setUsername] = useState("");

  // ===========================================
  // PUTER AI SCRIPT LOADING EFFECT
  // ===========================================
  
  /**
   * Dynamically loads the Puter AI script for price estimation functionality
   * Handles script loading success/failure and cleanup
   */
  useEffect(() => {
    // Check if Puter AI is already available globally
    if (window.puter?.ai) {
      console.log("Puter AI already available");
      return;
    }

    // Create and configure script element
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/"; 
    script.async = true;

    // Handle successful script loading
    script.onload = () => {
      console.log("Puter AI script loaded successfully");
      setAiError(null);
    };

    // Handle script loading failures
    script.onerror = () => {
      console.error("Failed to load Puter AI script");
      setAiError("⚠️ Failed to load AI integration.");
    };

    // Add script to document
    document.body.appendChild(script);

    // Cleanup function to remove script on component unmount
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // ===========================================
  // USER PROFILE IMAGE LOADING EFFECT
  // ===========================================
  
  /**
   * Loads the current user's profile image from Firestore
   * Updates profileImage state when username changes
   */
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Get user ID from username
        const uid = await getUserIdByUsername(username);
        // Fetch user document from Firestore
        const userDoc = await getDoc(doc(db, "users", uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Update profile image if available
          if (userData.profileImageUrl) {
            setProfileImage(userData.profileImageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadUserProfile();
  }, [username]); // Re-run when username changes

  // ===========================================
  // FIREBASE AUTHENTICATION LISTENER
  // ===========================================
  
  /**
   * Sets up Firebase authentication state listener
   * Updates username when user login state changes
   */
  React.useEffect(() => {
    const firebaseAuth = getAuth();
    
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user document to get username
          const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
          if (userDoc.exists()) {
            // Use stored username or fallback to email
            setUsername(userDoc.data().username || currentUser.email || "User");
          } else {
            // Fallback if no user document exists
            setUsername(currentUser.email || "User");
          }
        } catch (error) {
          console.error("Firestore error:", error);
          setUsername(currentUser.email || "User");
        }
      } else {
        // User is not authenticated
        setUsername("Guest");
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  // ===========================================
  // IMAGE HANDLING FUNCTIONS
  // ===========================================
  
  /**
   * Handles image file selection from file input
   * Validates file type and size, creates preview
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - must be an image
      if (!file.type.startsWith('image/')) {
        setStatus("❌ Please select a valid image file.");
        return;
      }
      
      // Validate file size - 5MB maximum
      if (file.size > 5 * 1024 * 1024) {
        setStatus("❌ Image must be smaller than 5MB.");
        return;
      }

      // Set selected file
      setSelectedImage(file);
      
      // Create base64 preview using FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous error messages
      setStatus("");
    }
  };

  /**
   * Removes selected image and resets file input
   */
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    
    // Reset the file input element
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  /**
   * Uploads image file to Firebase Storage
   * @param file - Image file to upload
   * @param recipeId - Unique recipe ID for organizing storage
   * @returns Promise<string | null> - Download URL or null if failed
   */
  const uploadImage = async (file: File, recipeId: string): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      // Verify Firebase Storage is initialized
      if (!storage) {
        console.error("Firebase Storage not initialized");
        throw new Error("Storage service not available");
      }
      
      // Create unique filename with timestamp and sanitized original name
      const fileName = `recipes/${recipeId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const imageRef = ref(storage, fileName);
      
      console.log("Uploading image to:", fileName);
      
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(imageRef, file);
      // Get public download URL
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

  // ===========================================
  // AI PRICE ESTIMATION FUNCTION
  // ===========================================
  
  /**
   * Uses Puter AI to estimate total recipe cost based on ingredients
   * Sends ingredient list to AI model and parses price response
   * @returns Promise<number | null> - Estimated price or null if failed
   */
  const estimateRecipePrice = async () => {
    // Check if Puter AI service is available
    if (!window.puter?.ai) {
      setAiError("⚠️ AI service not available. Please refresh the page.");
      return null;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      // Format ingredients into readable string
      const ingredientsList = ingredients
        .filter(ing => ing.name.trim()) // Remove empty ingredients
        .map(ing => `${ing.quantity} ${ing.measurement} ${ing.name}`)
        .join(', ');

      // Validate that ingredients exist
      if (!ingredientsList) {
        setAiError("⚠️ Please add ingredients before estimating price.");
        setLoadingAI(false);
        return null;
      }

      // Construct detailed prompt for AI price estimation
      const prompt = `You are a grocery pricing expert. Estimate the total cost in USD for these recipe ingredients based on typical US supermarket prices: ${ingredientsList}

Please consider:
- Current average grocery store prices in the US
- Standard package sizes (don't assume buying exact quantities)
- Seasonal price variations
- Common brand pricing

IMPORTANT: Respond with ONLY a number (example: 15.75). No dollar signs, no text, no explanations - just the price as a decimal number.`;

      console.log("🔍 Sending prompt to AI:", prompt);
      console.log("🥕 Ingredients list:", ingredientsList);

      // Send request to AI service
      const response = await window.puter.ai.chat(prompt, {
        model: 'deepseek-chat',
        temperature: 0.1, // Low temperature for consistent numerical output
        max_tokens: 50,   // Short response expected
      });

      console.log("🤖 Raw AI response:", JSON.stringify(response));

      // Validate AI response
      if (!response) {
        console.error("❌ Empty response from AI");
        setAiError("⚠️ AI returned empty response.");
        setLoadingAI(false);
        return null;
      }

      // Clean and parse the response
      const cleanResponse = String(response).trim();
      console.log("🧹 Cleaned response:", JSON.stringify(cleanResponse));

      let estimatedPrice = null;

      // Try direct parsing first
      const directParse = parseFloat(cleanResponse);
      if (!isNaN(directParse) && directParse > 0) {
        estimatedPrice = directParse;
        console.log("✅ Direct parse successful:", estimatedPrice);
      } else {
        // Fallback: extract any numbers from response
        const allNumbers = cleanResponse.match(/\d+\.?\d*/g);
        console.log("🔢 All numbers found:", allNumbers);
        
        if (allNumbers && allNumbers.length > 0) {
          // Use first valid positive number found
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

      // Validate final price
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

  // ===========================================
  // FORM SUBMISSION HANDLER
  // ===========================================
  
  /**
   * Handles recipe form submission
   * Coordinates AI price estimation, image upload, and recipe creation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify user is authenticated
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      setStatus("❌ You must be signed in to upload.");
      return;
    }

    try {
      // Step 1: Get AI price estimation
      setStatus("💭 Estimating recipe cost...");
      const estimatedCost = await estimateRecipePrice();

      if (estimatedCost === null) {
        setStatus("❌ Failed to estimate recipe price. Please try again or check your ingredients.");
        return;
      }

      // Step 2: Generate unique recipe ID
      const recipeId = uuidv4();
      
      // Step 3: Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        setStatus("📸 Uploading image...");
        imageUrl = await uploadImage(selectedImage, recipeId);
        // Continue even if image upload fails
      }

      // Step 4: Create recipe object with all form data
      const recipe: Recipe = {
        recipeId,
        author: username,
        createdAt: Timestamp.now(),
        name,
        description,
        // Filter and format ingredients
        ingredients: ingredients
          .filter(ing => ing.name.trim()) // Remove empty ingredients
          .map((ing) => ({
            quantity: parseFloat(ing.quantity) || 0,
            measurement: ing.measurement,
            name: ing.name.trim(),
          })),
        // Split steps by newlines and remove empty ones
        steps: steps.split("\n").map((step) => step.trim()).filter(Boolean),
        comments: [], // Initialize empty comments array
        // Collect all dietary tags
        tags: { halal, vegan, vegetarian, lactoseFree, soy, peanuts },
        // Collect all required tools
        tools: {
          knife,
          oven,
          airFryer,
          stainlessSteelPan,
          kettle: false, // Hardcoded false (not in form)
          wok,
          smallPot,
          mediumPot,
          largePot,
          grater,
        },
        rating: [creatorRating], // Initialize with creator's rating
        authorDiff: creatorRating,
        userDiff: difficulty,
        price: estimatedCost,
        // Conditionally add imageUrl if it exists
        ...(imageUrl && { imageUrl }),
      };

      console.log("Attempting to upload recipe:", recipe);

      // Step 5: Upload recipe to Firestore
      setStatus("🔄 Uploading recipe...");
      const success = await uploadRecipeClientSide(recipe);

      if (success) {
        // Success message with price and image status
        setStatus(`✅ Recipe uploaded! Estimated cost: $${estimatedCost.toFixed(2)}${imageUrl ? ' (with image)' : ''}`);
        resetForm(); // Clear form for next recipe
      } else {
        setStatus("❌ Failed to upload recipe.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setStatus(`❌ Upload failed: ${error.message || 'Unknown error'}`);
    }
  };

  // ===========================================
  // FORM RESET FUNCTION
  // ===========================================
  
  /**
   * Resets all form fields to their default values
   * Called after successful recipe upload
   */
  const resetForm = () => {
    // Reset basic recipe fields
    setName("");
    setDescription("");
    setIngredients([{ quantity: "1", measurement: "cup", name: "" }]);
    setSteps("");
    setCreatorRating(0);
    setDifficulty(1);
    setEstimatedPrice(0);
    
    // Reset image fields
    setSelectedImage(null);
    setImagePreview(null);
    
    // Reset all dietary tags
    setHalal(false);
    setVegan(false);
    setVegetarian(false);
    setLactoseFree(false);
    setSoy(false);
    setPeanuts(false);
    
    // Reset all tool selections
    setKnife(false);
    setOven(false);
    setAirFryer(false);
    setStainlessSteelPan(false);
    setWok(false);
    setSmallPot(false);
    setMediumPot(false);
    setLargePot(false);
    
    // Reset file input element
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // ===========================================
  // INGREDIENT MANAGEMENT FUNCTIONS
  // ===========================================
  
  /**
   * Updates a specific field in an ingredient at given index
   * @param index - Index of ingredient to update
   * @param field - Field name to update (quantity, measurement, name)
   * @param value - New value for the field
   */
  const handleIngredientChange = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    updated[index][field as keyof typeof ingredients[0]] = value;
    setIngredients(updated);
  };

  /**
   * Adds a new empty ingredient to the ingredients array
   */
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { quantity: "1", measurement: "cup", name: "" }]);
  };

  /**
   * Removes ingredient at specified index
   * Prevents removal if only one ingredient remains
   * @param index - Index of ingredient to remove
   */
  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const updated = ingredients.filter((_, i) => i !== index);
      setIngredients(updated);
    }
  };

  // ===========================================
  // MEASUREMENT UNITS CONFIGURATION
  // ===========================================
  
  /**
   * Available measurement units for ingredients
   * Used to populate measurement dropdown selects
   */
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

  // ===========================================
  // COMPONENT RENDER
  // ===========================================
  
  return (
    <div style={{ backgroundColor: "#e8f5e9", minHeight: "100vh" }}>
      {/* ===========================================
          TOP NAVIGATION BAR
          =========================================== */}
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Recipe Logger</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          {/* Navigation links */}
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href={`/shoppingList/${username}`}>Cart</a> |
          
          {/* User profile section */}
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

      {/* ===========================================
          MAIN UPLOAD FORM CONTAINER
          =========================================== */}
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

        {/* Loading Indicators */}
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
          
          {/* ===========================================
              RECIPE TITLE INPUT
              =========================================== */}
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

          {/* ===========================================
              RECIPE DESCRIPTION TEXTAREA
              =========================================== */}
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

          {/* ===========================================
              IMAGE UPLOAD SECTION
              =========================================== */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Recipe Image (Optional)
            </label>
            
            {/* Show upload area if no image selected */}
            {!imagePreview ? (
              <div style={{ 
                border: "2px dashed #ddd", 
                borderRadius: "4px", 
                padding: "2rem", 
                textAlign: "center",
                backgroundColor: "#fafafa"
              }}>
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                {/* Clickable label for file input */}
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
              /* Show image preview with remove button */
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
                {/* Remove image button */}
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

          {/* ===========================================
              DIETARY TAGS SECTION
              =========================================== */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Dietary Tags</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
              {/* Each dietary tag as a checkbox */}
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
          {/* This section allows users to select which kitchen tools and appliances are required for the recipe */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Required Tools & Appliances</label>
            {/* Grid layout for checkboxes - 2 columns to save space */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
              {/* Basic kitchen tools */}
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
              {/* Different pot sizes for various cooking needs */}
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={smallPot} onChange={() => setSmallPot(!smallPot)} /> Small Pot
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={mediumPot} onChange={() => setMediumPot(!mediumPot)} /> Medium Pot
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={largePot} onChange={() => setLargePot(!largePot)} /> Large Pot
              </label>
              {/* Note: There's a bug here - the grater checkbox is using largePot state instead of grater state */}
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={largePot} onChange={() => setGrater(!grater)} /> Cheese Grater
              </label>
            </div>
          </div>

          {/* Ingredient Fields Section */}
          {/* Dynamic ingredient list where users can add/remove ingredients with quantity, measurement, and name */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Ingredients:</label>
            {/* Map through ingredients array to render each ingredient input row */}
            {ingredients.map((ingredient, index) => (
              <div key={index} style={{ display: "flex", gap: "0.5em", marginBottom: "0.5em" }}>
                {/* Quantity input - numeric field with minimum value of 0 */}
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
                {/* Measurement unit dropdown - predefined options for consistency */}
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
                  {/* Map through measurement options and capitalize first letter */}
                  {MEASUREMENT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>
                {/* Ingredient name input - flexible width to fill remaining space */}
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
                {/* Remove ingredient button - disabled if only one ingredient remains */}
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  disabled={ingredients.length <= 1}
                  style={{
                    padding: "0.5em",
                    cursor: "pointer",
                    borderRadius: "4px",
                    border: "none",
                    // Dynamic styling based on disabled state
                    backgroundColor: ingredients.length <= 1 ? "#ccc" : "#ffcdd2",
                    transition: "background-color 0.3s",
                  }}
                >
                  &times;
                </button>
              </div>
            ))}

            {/* Add/Remove ingredient buttons */}
            <div style={{ display: "flex", gap: "0.5em", marginTop: "0.5em" }}>
              {/* Add ingredient button - disabled if max limit (50) is reached */}
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
              {/* Alternative remove button - removes last ingredient, disabled if only one remains */}
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

          {/* Recipe Steps Section */}
          {/* Large textarea for users to input cooking instructions, one step per line */}
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

          {/* Ratings Section */}
          {/* Two side-by-side inputs for creator rating and difficulty level */}
          <div style={{ display: "flex", gap: "1rem" }}>
            {/* Creator's personal rating of the recipe (0-5 scale) */}
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
            {/* Difficulty level of the recipe (1-5 scale, 1 being easiest) */}
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
          {/* Main form submission button - disabled during AI processing or image upload */}
          <button
            type="submit"
            disabled={loadingAI || uploadingImage}
            style={{
              alignSelf: "flex-start",
              // Dynamic background color based on loading state
              backgroundColor: (loadingAI || uploadingImage) ? "#ccc" : "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              // Dynamic cursor based on loading state
              cursor: (loadingAI || uploadingImage) ? "not-allowed" : "pointer",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              transition: "background-color 0.3s",
            }}
          >
            {/* Dynamic button text based on current operation */}
            {loadingAI ? "Estimating Price..." : uploadingImage ? "Uploading Image..." : "Upload Recipe"}
          </button>

          {/* Status Message Display */}
          {/* Conditional rendering of status messages with dynamic styling based on success/error */}
          {status && (
            <p style={{ 
              marginTop: "1rem", 
              padding: "1rem",
              borderRadius: "4px",
              // Green background for success messages (✅), red for errors
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