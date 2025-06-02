"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { Recipe } from "@/types/Recipe";
import { fetchRecipeById } from "@/lib/utils/Recipes/RecipeByID";
import {
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase-client";
import "./recipeTemplate.css";

// Declare Puter global types to be used
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

// Defined a new tagProps type to fix that text variable being set to type any
type TagProps = {
  text: string;
};

// Creates the tag component so I don't gotta rewrite the styling every single time
const Tag = ({ text }: TagProps) => (
  <p style={{
    fontSize: "0.85em",
    backgroundColor: "#d2f4d2",
    padding: "0.2em 0.5em",
    marginRight: "0.3em",
    borderRadius: "5px",
    marginBottom: "0.5em"
  }}>
    {text}
  </p>
);

const RecipeTemplate: React.FC = () => {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "Guest";

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [rating, setRating] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [totalCost, setTotalCost] = useState<string | null>(null); // Added the total cost estimated here
  const [aiError, setAiError] = useState<string | null>(null); // Also added the Ai error states just in case
  const [nutrients, setNutrients] = useState<{ [key: string]: string } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiMacros, setAIMacros] = useState(null);
  const [aiPrice, setAIPrice] = useState(null);

  // Load Puter script as we can't load it in normally without usual <script> support in jsx
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/ ";
    script.async = true;
    script.onload = () => {
      console.log("Puter.js loaded successfully");
    };
    script.onerror = () => {
      setAiError("Failed to load Puter AI.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch recipe by ID and calculate average rating
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const fetchedRecipe = await fetchRecipeById(id);
        setRecipe(fetchedRecipe);

        const ratings: number[] = fetchedRecipe.rating || [];
        if (ratings.length > 0) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          setRating(Number(avg.toFixed(2)));
        } else {
          setRating(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // Check if recipe is saved by current user
  useEffect(() => {
    const checkSavedStatus = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userRef = doc(db, "Users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const savedList = userData.savedRecipes || [];
        const isSaved = savedList.some((r: any) => r.recipeId === id);
        setSaved(isSaved);
      }
    };

    checkSavedStatus();
  }, [id]);

  // Handler: Add Rating
  const handleAddRating = async (newRating: number) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to rate.");
      return;
    }

    try {
      const docSnap = await getDoc(doc(db, "Recipes", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const existingRatings = data.rating || [];
        await updateDoc(doc(db, "Recipes", id), {
          rating: [...existingRatings, newRating],
        });
        alert(`You rated this item ${newRating} star${newRating > 1 ? "s" : ""}.`);
        setShowStars(false);
      }
    } catch (error) {
      console.error("Error adding rating:", error);
      alert("Failed to submit rating.");
    }
  };

  // Handler: Save/Unsave Recipe
  const handleSaveRecipe = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in to save recipes.");
      return;
    }

    setSaving(true);
    const userRef = doc(db, "Users", currentUser.uid);
    const recipeData = {
      recipeId: id,
      recipeName: recipe?.name || "",
      author: recipe?.author || "",
      savedAt: Timestamp.now(),
    };

    try {
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const savedList = userData?.savedRecipes || [];
      const alreadySaved = savedList.some((r: any) => r.recipeId === id);

      if (alreadySaved) {
        const newSavedList = savedList.filter((r: any) => r.recipeId !== id);
        await updateDoc(userRef, { savedRecipes: newSavedList });
        setSaved(false);
        alert("Removed from saved recipes");
      } else {
        await updateDoc(userRef, {
          savedRecipes: [...savedList, recipeData],
        });
        setSaved(true);
        alert("Recipe saved!");
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      alert("Failed to update saved status.");
    } finally {
      setSaving(false);
    }
  };

  // Handler: Add to Shopping List
  const handleAddToCart = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in to add to your shopping list.");
      return;
    }

    const userRef = doc(db, "Users", currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const existingCart = userData.cart || [];

      const alreadyAdded = existingCart.some(
        (item: any) => item.recipeID === recipe?.recipeId
      );

      if (alreadyAdded) {
        alert("This recipe is already in your shopping list.");
        return;
      }

      const newIngredients = recipe?.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        checked: false,
      })) || [];

      const updatedCart = [
        ...existingCart,
        {
          recipeID: recipe?.recipeId,
          recipeName: recipe?.name,
          ingredients: newIngredients,
        },
      ];

      await updateDoc(userRef, { cart: updatedCart });
      alert("Recipe added to your shopping list!");
    }
  };

  // Rating star formatting
  const safeRating = typeof rating === "number" && rating >= 0 ? rating : 0;
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating % 1 >= 0.25 && safeRating % 1 <= 0.75;
  const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));
  const stars = [
    ...Array(fullStars).fill("full"),
    ...(halfStar ? ["half"] : []),
    ...Array(emptyStars).fill("empty"),
  ];

  // Format creation date
  const createdAtDate =
    recipe?.createdAt instanceof Timestamp
      ? recipe.createdAt.toDate()
      : recipe?.createdAt
      ? new Date(recipe.createdAt)
      : null;

  const handleFetchAICost = async () => {
    if (!window.puter?.ai?.chat || !recipe?.ingredients?.length) return;

    setLoadingAI(true);
    setAiError(null);

    try {
      const prompt = `Estimate the total cost and provide a nutritional breakdown (macros and major nutrients) for the following ingredients with their quantities. Return only JSON like: { "totalPrice": "$5.40", "nutrients": { "calories": "200 kcal", "protein": "10g", ... } }\n\nIngredients:\n${recipe.ingredients
        .map((ing) => `- ${ing.name} (${ing.quantity})`)
        .join("\n")}`;

      const response = await window.puter.ai.chat(prompt, {
        model: "deepseek-chat",
        stream: true,
        temperature: 0.6,
        max_tokens: 300,
      });

      let output = "";
      for await (const part of response) {
        if (part?.text) output += part.text;
      }

      const jsonMatch = output.match(/{[\s\S]*}/)?.[0];
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch);
        setTotalCost(parsed.totalPrice || "N/A");
        setNutrients(parsed.nutrients || {});
      } else {
        throw new Error("No valid JSON found in AI response.");
      }
    } catch (err) {
      console.error("AI error:", err);
      setAiError("Failed to fetch estimated cost and nutrients.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Show loading/errors
  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!recipe) return <p>No recipe found.</p>;

  return (
    <div>
      {/* Top Navigation Bar */}
      <div className="navbar">
      <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>View Recipe</div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
        <a
          href={`/home/${username}`}
          onMouseEnter={() => console.log("Home clicked. Username:", username)}
        >
          Home
        </a> |
        <a
          href={`/explore/${username}`}
          onClick={() => console.log("Explore clicked. Username:", username)}
        >
          Explore
        </a> |
        <a
          href={`/shoppingList/${username}`}
          onClick={() => console.log("Cart clicked. Username:", username)}
        >
          Cart
        </a> |
        <img
          src="https://placehold.co/100"
          alt="User Profile"
          style={{ borderRadius: '50%', width: '30px', height: '30px' }}
          onClick={() => console.log("Profile image clicked. Username:", username)}
        />
        <span>{username}</span>
      </div>
    </div>


      <div className="recipe-container">
        <div className="left-column">
          <h2 style={{ fontSize: "1.8em", fontWeight: "bold" }}>{recipe.name}</h2>
          <h3 style={{ fontSize: "1.2em", fontWeight: "bold" }}>
            Submitted by {recipe.author} on {createdAtDate?.toLocaleDateString() ?? 'Unknown date'}
          </h3>
          <img
            src="https://media.istockphoto.com/id/898671450/photo/bunch-of-ripe-bananas-and-apples-isolated-on-a-white-background.jpg?s=612x612&w=0&k=20&c=NLqbC3xJJIKqqciKcWFg57WXDpoVOtKMgGaixYUT8ys= "
            alt={recipe.name}
            className="recipe-image"
          />
          <h3 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Description:</h3>
          <p>{recipe.description}</p>
          <h3 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Ingredients:</h3>
          <ul className="list-disc ml-6">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>
              <a
                href={`/ingredients/${encodeURIComponent(ingredient.name)}?username=${username}`}
                className="text-blue-600 hover:underline"
              >
                {ingredient.quantity}{" "}
                {ingredient.quantity > 1 ? `${ingredient.measurement}s` : ingredient.measurement}{" "}
                {ingredient.name}
              </a>
            </li>
          ))}
          </ul>
    
          <h3 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Tools/Appliances:</h3>
          {recipe.tools.knife && <p style={{ fontSize: "1.1em" }}>Knife</p>}
          {recipe.tools.oven && <p style={{ fontSize: "1.1em" }}>Oven</p>}
          {recipe.tools.airFryer && <p style={{ fontSize: "1.1em" }}>Air Fryer</p>}
          {recipe.tools.stainlessSteelPan && <p style={{ fontSize: "1.1em" }}>Stainless Steel Pan</p>}
          {recipe.tools.kettle && <p style={{ fontSize: "1.1em" }}>Kettle</p>}
          {recipe.tools.wok && <p style={{ fontSize: "1.1em" }}>Wok</p>}
          {recipe.tools.smallPot && <p style={{ fontSize: "1.1em" }}>Small Pot</p>}
          {recipe.tools.mediumPot && <p style={{ fontSize: "1.1em" }}>Medium Pot</p>}
          {recipe.tools.largePot && <p style={{ fontSize: "1.1em" }}>Large Pot</p>}
          {recipe.tools.grater && <p style={{ fontSize: "1.1em" }}>Grater</p>}
          
          <h3 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Steps:</h3>
          <ol className="list-decimal ml-6">
            {recipe.steps.map((step, index) => (
              <li style={{ fontSize: "1.1em" }} key={index}>{step}</li>
            ))}
          </ol>
        </div>        

        {/* Right Column with Rating + Difficulty + Add to Cart Button */}
        <div className="right-column">
          <div className="flex text-yellow-500">
            {stars.map((star, index) => (
              <div style={{ fontSize: "1.6em" }} key={index}>
                {star === 'full' ? '★' : star === 'half' ? '⯪' : '☆'}
              </div>
            ))}
          </div>

          <button onClick={() => setShowStars((prev) => !prev)} className="bg-blue-500 text-white px-4 py-2 rounded">Add Rating</button>
          {showStars && (
            <div className="flex items-start flex-col">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} style={{ fontSize: "1.55em" }} onClick={() => handleAddRating(star)} className="flex text-yellow-500 hover:scale-110">{'★'.repeat(star)}{'☆'.repeat(5 - star)}</button>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Difficulty</h2>
          <h3 style={{ fontSize: "1.1em" }}>From author: {recipe.authorDiff}/5</h3>
          <h3 style={{ fontSize: "1.1em" }}>From users: {recipe.userDiff}/5</h3>

          <div style={{ fontSize: "1.2em", marginTop: "2rem", marginBottom: "1rem" }}>
            <h2><strong>Load Deepseek Results:</strong></h2>
            <button
              onClick={handleFetchAICost}
              disabled={loadingAI}
              style={{
                backgroundColor: loadingAI ? "#ccc" : "#4caf50",
                color: "#fff",
                border: "none",
                padding: "0.5em 1em",
                borderRadius: "4px",
                cursor: loadingAI ? "not-allowed" : "pointer",
                transition: "background-color 0.3s",
                marginBottom: "1rem",
                marginTop: "1rem"
              }}
              onMouseOver={(e) => !loadingAI && (e.currentTarget.style.backgroundColor = "#43a047")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4caf50")}
            >
              {loadingAI ? "Thinking..." : "🔄 Refresh Info"}
            </button>
            
            {aiError && <p style={{ color: "red" }}>{aiError}</p>}            
          </div>

          <h2 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Total Estimated Price</h2>
          <h3 style={{ fontSize: "1.1em" }}>{totalCost ? totalCost : "Please Fetch Price via Deepseek First"}</h3>

          <h3 style={{ fontSize: "1.2em", marginTop: "2rem", fontWeight: "bold" }}> Nutrients via Deepseek: </h3>
          <h3 style={{ fontSize: "1.1em"}}>Disclaimer: Nutrition Facts generally have a limit of 20% variance and these are estimated. Please do not take these as 100% factual. We are not experts. There may be some larger errors which can be fixed by refreshing 1-2 more times. </h3>
          {(totalCost || nutrients) && (
            <div
              style={{
                backgroundColor: "#f8f8f8",
                padding: "1em",
                borderRadius: "8px",
                border: "1px solid #ddd",
                display: "flex",
                flexDirection: "column",
                marginTop: "1rem"
              }}
            >
              {nutrients && Object.entries(nutrients).map(([key, value]) => (
                <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</p>
              ))}
            </div>
          )}


          <h3 style={{ fontSize: "1.2em", fontWeight: "bold", marginTop: "2rem" }}>Tags</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em" }}>
            {Object.values(recipe.tags).some(Boolean) ? (
              <>
                {recipe.tags.halal && <Tag text="Halal" />}
                {recipe.tags.lactoseFree && <Tag text="Lactose Free" />}
                {recipe.tags.vegan && <Tag text="Vegan" />}
                {recipe.tags.vegetarian && <Tag text="Vegetarian" />}
                {recipe.tags.peanuts && <Tag text="Peanuts" />}
                {recipe.tags.soy && <Tag text="Soy" />}
              </>
            ) : (
              <p style={{ fontSize: "0.9em", fontStyle: "italic" }}>No tags</p>
            )}
          </div>

          <h3 style={{ fontSize: "1.2em", fontWeight: "bold", marginTop: "2rem" }}>Tools</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em" }}>
            {Object.values(recipe.tools).some(Boolean) ? (
              <>
                {recipe.tools.airFryer && <Tag text="Air Fryer" />}
                {recipe.tools.knife && <Tag text="Knife" />}
                {recipe.tools.largePot && <Tag text="Large Pot" />}
                {recipe.tools.mediumPot && <Tag text="Medium Pot" />}
                {recipe.tools.oven && <Tag text="Oven" />}
                {recipe.tools.smallPot && <Tag text="Small Pot" />}
                {recipe.tools.stainlessSteelPan && <Tag text="Stainless Steel Pan" />}
                {recipe.tools.wok && <Tag text="Wok" />}
                {recipe.tools.grater && <Tag text="Grater" />}
              </>
            ) : (
              <p style={{ fontSize: "0.9em", fontStyle: "italic" }}>No tools</p>
            )}
          </div>
          
          {/* Save Recipe Button */}
          <button
            onClick={handleSaveRecipe}
            disabled={saving}
            style={{
              marginTop: "2rem",
              padding: "0.5rem 1rem",
              backgroundColor: saved ? "#f44336" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              width: "100%",
            }}
          >
            {saving ? "Saving..." : saved ? "Unsave Recipe" : "Save Recipe"}
          </button>

          {/* Add to Shopping List Button */}
          <button
            onClick={handleAddToCart}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#cce9cc", 
              color: "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              width: "100%",
            }}
          >
            Add to Shopping List
          </button>
        </div>
      </div>

      <div className="comment-section">
        <h2 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Comments:</h2>
        <ol>
          {recipe.comments.map((comment, index) => (
            <li style={{ fontSize: "1.1em" }} key={index}>{comment}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeTemplate;