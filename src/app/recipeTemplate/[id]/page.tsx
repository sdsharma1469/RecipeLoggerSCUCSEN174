'use client'

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from 'next/navigation';
import type { Recipe } from '@/types/Recipe';
import { fetchRecipeById } from "@/lib/utils/Recipes/RecipeByID";
import { Timestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from '@/lib/firebase-client'
import './recipeTemplate.css';

const RecipeTemplate: React.FC = () => {
  const { id } = useParams() as { id: string };
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'Guest';
  const user = auth.currentUser;
  const [average, setAverage] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const fetchedRecipe = await fetchRecipeById(id);
        setRecipe(fetchedRecipe);
        const ratings: number[] = fettings || [];
          if (ratings.length > 0) {
            const sum = ratings.reduce((a, b) => a + b, 0);
            const avg = sum / ratings.length;
            setAverage(Number(avg.toFixed(2)));
          } else {
            setAverage(null); // no ratings yet
          }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, []);

  const [showStars, setShowStars] = useState(false);
  const handleAddRating = async (rating: number) => {
    try {
      await updateDoc(doc(db, 'Recipes', id), {
        rating: arrayUnion(rating)
      });
      alert(`You rated this item ${rating} star${rating > 1 ? 's' : ''}.`);
      setShowStars(false);
    } catch (error) {
      console.error('Error adding rating:', error);
      alert('Failed to submit rating.');
    }
  };

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!recipe) return <p>No recipe found.</p>;

  // Handle date rendering
  let createdAtDate: Date | null = null;
  if (recipe.createdAt instanceof Timestamp) {
    createdAtDate = recipe.createdAt.toDate();
  } else if (typeof recipe.createdAt === 'string' || recipe.createdAt instanceof Date) {
    createdAtDate = new Date(recipe.createdAt);
  }
  
  const safeRating = typeof recipe.rating === 'number' && recipe.rating >= 0 ? recipe.rating : 0;
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating % 1 >= 0.25 && safeRating % 1 <= 0.75;
  const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));
  const stars = [
    ...Array(fullStars).fill('full'),
    ...(halfStar ? ['half'] : []),
    ...Array(emptyStars).fill('empty')
  ];

  return (
    <div>
      <div className="navbar">
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>View Recipe</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href="/cart">Cart</a> |
          <img
            src="https://placehold.co/100"
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
            src="https://media.istockphoto.com/id/898671450/photo/bunch-of-ripe-bananas-and-apples-isolated-on-a-white-background.jpg?s=612x612&w=0&k=20&c=NLqbC3xJJIKqqciKcWFg57WXDpoVOtKMgGaixYUT8ys="
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
