"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from 'next/navigation';
import type { Recipe } from '@/types/Recipe';
import { fetchRecipeById } from "@/lib/utils/Recipes/RecipeByID";
import { Timestamp, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase-client"; // Firestore instance
import './recipeTemplate.css';

const RecipeTemplate: React.FC = () => {
  const { id } = useParams() as { id: string };
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [username, setUsername] = useState("");

  // Fetch recipe from id and calculate rating
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const fetchedRecipe = await fetchRecipeById(id);
        setRecipe(fetchedRecipe);
        const ratings: number[] = fetchedRecipe.rating || [];
          if (ratings.length > 0) {
            const sum = ratings.reduce((a, b) => a + b, 0);
            const avg = sum / ratings.length;
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

  // Add to rating array in recipe
  const [showStars, setShowStars] = useState(false);
  const handleAddRating = async (newrating: number) => {
    const user = auth.currentUser
    if (!user) {
      console.warn('🚫 User not logged in');
      return false;
    }
    try {
      const docSnap = await getDoc(doc(db, 'Recipes', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const existingRatings = data.rating || [];
        await updateDoc(doc(db, 'Recipes', id), {
          rating: [...existingRatings, newrating],
        });
      }
      alert(`You rated this item ${newrating} star${newrating > 1 ? 's' : ''}.`);
      setShowStars(false);
    } catch (error) {
      console.error('Error adding rating:', error);
      alert('Failed to submit rating.');
    }
  };

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!recipe) return <p>No recipe found.</p>;

  // Format created date
  let createdAtDate: Date | null = null;
  if (recipe.createdAt instanceof Timestamp) {
    createdAtDate = recipe.createdAt.toDate();
  } else if (typeof recipe.createdAt === 'string' || recipe.createdAt instanceof Date) {
    createdAtDate = new Date(recipe.createdAt);
  }

  // Star rating logic
  const safeRating = typeof rating === 'number' && rating !== null && rating >= 0 ? rating : 0;
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating % 1 >= 0.25 && safeRating % 1 <= 0.75;
  const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));
  const stars = [
    ...Array(fullStars).fill('full'),
    ...(halfStar ? ['half'] : []),
    ...Array(emptyStars).fill('empty')
  ];
  console.log(stars);

  // Add to Shopping List handler
  const handleAddToCart = async () => {
    const auth = getAuth();
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
        (item: any) => item.recipeID === recipe.recipeId
      );

      if (alreadyAdded) {
        alert("This recipe is already in your shopping list.");
        return;
      }

      const newIngredients = recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        checked: false,
      }));

      const updatedCart = [
        ...existingCart,
        {
          recipeID: recipe.recipeId,
          recipeName: recipe.name,
          ingredients: newIngredients,
        },
      ];

      await updateDoc(userRef, { cart: updatedCart });
      alert("Recipe added to your shopping list!");
    }
  };

  return (
    <div>
      {/* Top Navigation Bar */}
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>View Recipe</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href={username ? `/shoppingList/${username}` : "/shoppingList"}>Cart</a> |
          <img
            src="https://placehold.co/100   "
            alt="User Profile"
            style={{ borderRadius: '50%', width: '30px', height: '30px' }}
          />
          <span>{username}</span>
        </div>
      </div>

      <div className="container">
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

          <h3 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Ingredients:</h3>
          <ul className="list-disc ml-6">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                <a
                  href={`/ingredients/${encodeURIComponent(ingredient.name)}?username=${username}`}
                  className="text-blue-600 hover:underline"
                >
                  {ingredient.quantity} × {ingredient.name}
                </a>
              </li>
            ))}
          </ul>

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
          <h3 style={{ fontSize: "1.1em" }}>From author: {recipe.authorDiff}/10</h3>
          <h3 style={{ fontSize: "1.1em" }}>From users: {recipe.userDiff}/10</h3>

          <h2 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Average Price</h2>
          <h3 style={{ fontSize: "1.1em" }}>${recipe.cost}</h3>
      
          <h3 style={{ fontSize: "1.2em", fontWeight: "bold" }}>Tags</h3>
          {recipe.tags.halal && <p style={{ fontSize: "1.1em" }}>Halal</p>}
          {recipe.tags.lactoseFree && <p style={{ fontSize: "1.1em" }}>Lactose Free</p>}
          {recipe.tags.vegan && <p style={{ fontSize: "1.1em" }}>Vegan</p>}
          {recipe.tags.vegetarian && <p style={{ fontSize: "1.1em" }}>Vegetarian</p>}

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