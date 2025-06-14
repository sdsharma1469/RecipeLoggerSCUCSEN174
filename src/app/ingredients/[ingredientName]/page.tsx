// IngredientPage shows info about a single ingredient using deepseek integration and api's from a variety of sources

"use client";


import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { fetchIngredientData } from "@/lib/utils/Ingredients/ingredientDataFetch";
import { fetchIngredientImage } from "@/lib/utils/Ingredients/spoonacularImageFetch";
import { getUserIdByUsername } from "@/lib/utils/UserHandling/IdbyUsername";
import "./ingredients.css";

// Declare Puter global types so typescript doesn't return a bunch of errors
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string,
          options: {
            model: string;
            stream: boolean;
            temperature: number;
            max_tokens: number;
          }
        ) => AsyncIterable<{ text?: string }>;
      };
    };
  }
}

// This is the main function for exporting out the ingredient page with parameters taken in addition to the ingredient name given the current routing
export default function IngredientPage({ params }: { params: { ingredientName: string } }) {
  const decodedIngredientName = decodeURIComponent(params.ingredientName);
  const searchParams = useSearchParams();
  const passedUsername = searchParams.get("username");

  const [username, setUsername] = useState<string>(passedUsername || "Guest");
  const [ingredientData, setIngredientData] = useState<any>(null);
  const [ingredientImage, setIngredientImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [imageTimeout, setImageTimeout] = useState<boolean>(false);
  const [priceEstimate, setPriceEstimate] = useState<string>("Not fetched yet");
  const [macroEstimate, setMacroEstimate] = useState<{ protein: string; carbs: string; fat: string } | null>(null);
  const [aiStreamText, setAiStreamText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>(
    "https://placehold.co/100"
  );

  // Load Puter script as we can't load it in normally without usual <script> support in jsx
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/ ";
    script.async = true;
    script.onload = () => {
      console.log("Puter.js loaded successfully");
    };
    script.onerror = () => {
      setError("Failed to load Puter AI.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
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

  // Fetch username from Firebase
  useEffect(() => {
    const firebaseAuth = getAuth();
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || currentUser.email?.split("@")[0] || "User");
          }
        } catch (err) {
          console.error("Firestore error:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch USDA and Spoonacular data
  useEffect(() => {
    async function getUSDAData() {
      try {
        const data = await fetchIngredientData(decodedIngredientName);
        setIngredientData(data);
      } catch (error) {
        console.error("Error fetching USDA data:", error);
      }
    }

    // Performs the spoonacular function to set the image with appropriate timeouts if needed
    async function getSpoonacularImage() {
      try {
        setImageLoading(true);
        setImageTimeout(false);
        
        // Set up timeout
        const timeoutId = setTimeout(() => {
          setImageTimeout(true);
          setImageLoading(false);
        }, 8000);

        const data = await fetchIngredientImage(decodedIngredientName);
        
        // Clear timeout if image loads successfully
        clearTimeout(timeoutId);
        
        setIngredientImage(data?.image ?? null);
        setImageLoading(false);
      } catch (error) {
        console.error("Error fetching image:", error);
        setImageLoading(false);
      }
    }

    getUSDAData();
    getSpoonacularImage();
  }, [decodedIngredientName]);

  // Use Puter AI to get price + macro estimates for better accuracy
  const fetchIngredientInfo = async () => {
    setLoading(true);
    setAiStreamText("");
    setError(null);

    if (!window.puter?.ai?.chat) {
      setError("Please refresh Info to see estimated price. AI is currently not being used");
      setLoading(false);
      return;
    }

    // With appropriate setup, we setup the prompt here and calculate the estimated cost and macros via deepseek with the given ingredient name decoded from url
    try {
      const outputDiv = document.getElementById("ai-output");
      if (outputDiv) outputDiv.innerHTML = "";

      const prompt = `Give me the estimated cost and macronutrient breakdown for 1 cup of ${decodedIngredientName}. Return JSON like:\n{\n  \"price\": \"$2.50\",\n  \"protein\": \"2g\",\n  \"carbs\": \"3g\",\n  \"fat\": \"0.1g\"\n}`;

      const chatResponse = await window.puter.ai.chat(prompt, {
        model: "deepseek-chat",
        stream: true,
        temperature: 0.6,
        max_tokens: 100
      });

      // Initializing the full text here so when chatResponse it sent in parts we can check if it exists and concatenate a larger full file
      let fullText = "";
      for await (const part of chatResponse) {
        if (part?.text) {
          fullText += part.text;
          setAiStreamText(fullText);
        }
      }

      // With full text of the response we clean out the full text by elminating uneeded formating and then parse as a JSON to get the required info we want
      const cleaned = fullText.match(/{[\s\S]*}/)?.[0];
      if (cleaned) {
        const result = JSON.parse(cleaned);
        setPriceEstimate(result.price || "N/A");
        setMacroEstimate({
          protein: result.protein || "N/A",
          carbs: result.carbs || "N/A",
          fat: result.fat || "N/A"
        });
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (err) {
      console.error("AI stream error:", err);
      setError("Failed to fetch AI info.");
    } finally {
      setLoading(false);
    }
  };

  // Failsafe to show error if AI never loads. Serves as a timeout error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!window.puter?.ai?.chat) {
        setError("AI failed to load.");
        setLoading(false);
      }
    }, 8000);
    fetchIngredientInfo();
    return () => clearTimeout(timer);
  }, []);

  // Extract nutrient info from USDA to compare with nutritional data pulled from deepseek
  const calories = ingredientData?.nutrients.find((n: any) => n.name.toLowerCase().includes("energy") || n.name.toLowerCase().includes("calories"));
  const protein = ingredientData?.nutrients.find((n: any) => n.name.toLowerCase().includes("protein"));
  const carbohydrates = ingredientData?.nutrients.find((n: any) => n.name.toLowerCase().includes("carbohydrate") || n.name.toLowerCase().includes("carbs"));
  const fat = ingredientData?.nutrients.find((n: any) => n.name.toLowerCase().includes("lipid") || n.name.toLowerCase().includes("fat"));

  return (
    <div id="document-wrapper" style={{ backgroundColor: "#e8f5e9", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Recipe Logger</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={username ? `/home/${username}` : "/home"}>Home</a> |
          <a href={username ? `/explore/${username}` : "/explore"}>Explore</a> |
          <a href={username ? `/shoppingList/${username}` : "/shoppingList"}>Cart</a> |
          <img src={profileImage} alt="User Profile" style={{ borderRadius: "50%", width: "30px", height: "30px" }}/>
          <span>{username}</span>
        </div>
      </div>

      <div>
        <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.5em", fontWeight: "bold", marginBottom: "1.5rem" }}>{decodedIngredientName}</h1>

          <div id="ingredient-image" style={{ marginBottom: "1.5rem" }}>
            {imageLoading ? (
              <p>Loading image...</p>
            ) : imageTimeout ? (
              <p>Image failed to load (timeout after 8 seconds)</p>
            ) : ingredientImage ? (
              <img src={ingredientImage} alt={decodedIngredientName} style={{ width: "200px", borderRadius: "10px" }} />
            ) : (
              <p>No image available</p>
            )}
          </div>

          <div id="ingredient-calories" style={{ marginBottom: "1.5rem" }}>
            <strong>Calories:</strong> {calories ? `${calories.amount} ${calories.unit}` : "Not found"}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h2><strong>Estimated Cost & Macros</strong></h2>
            <button
              onClick={fetchIngredientInfo}
              disabled={loading}
              style={{ backgroundColor: loading ? "#ccc" : "#4caf50", color: "#fff", border: "none", padding: "0.5em 1em", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", transition: "background-color 0.3s", marginBottom: "1rem" }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = "#43a047")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4caf50")}
            >
              {loading ? "Thinking..." : "🔄 Refresh Info"}
            </button>

            <div style={{ backgroundColor: "#f8f8f8", padding: "1em", borderRadius: "8px", border: "1px solid #ddd", display: "flex", flexDirection: "column" }}>
              <p><strong>Deepseek Ingredient Details:</strong></p>
              <p><strong>Estimated Price:</strong> {priceEstimate}</p>
              {macroEstimate && (
                <>
                  <p><strong>Protein:</strong> {macroEstimate.protein}</p>
                  <p><strong>Carbs:</strong> {macroEstimate.carbs}</p>
                  <p><strong>Fat:</strong> {macroEstimate.fat}</p>
                </>
              )}
            </div>
          </div>

          <div id="ingredient-nutrients" style={{ marginBottom: "1.5rem" }}>
            <h2><strong>USDA Nutritional Info</strong></h2>
            {ingredientData ? (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {protein && <li><strong>Protein:</strong> {protein.amount} {protein.unit}</li>}
                {carbohydrates && <li><strong>Carbs:</strong> {carbohydrates.amount} {carbohydrates.unit}</li>}
                {fat && <li><strong>Fat:</strong> {fat.amount} {fat.unit}</li>}
              </ul>
            ) : (
              <p>Loading nutritional information...</p>
            )}
          </div>

          <div id="ingredient-buy" style={{ marginBottom: "2rem" }}>
            <h2><strong>Where to Buy</strong></h2>
            <a
              className="amazon-link"
              href={`https://www.amazon.com/s?k=${encodeURIComponent(decodedIngredientName)}&i=amazonfresh`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline", color: "#388e3c", fontWeight: "bold" }}
            >
              Search Amazon Fresh
            </a>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </main>
      </div>
    </div>
  );
}