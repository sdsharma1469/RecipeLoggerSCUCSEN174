'use client'

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import type { Recipe } from '@/types/Recipe';
import { fetchRecipeById } from "@/lib/utils/Recipes/RecipeByID";
import './recipeTemplate.css' 

const starRating = 5;
const authorRating = 7;
const userRating = 8;

const RecipeTemplate: React.FC = () => {
    const { id } = useParams() as { id: string };
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const fetchedRecipe = await fetchRecipeById(id);
                setRecipe(fetchedRecipe);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, []);
    if (loading) return <p>Loading recipe...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!recipe) return <p>No recipe found.</p>;
    return (
        <div>
        <div className="navbar">
            <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>View Recipe</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
            <a href="home/shaunaksharma">Home</a> | <a href="/explore">Explore</a> | <a href="/profile">Profile</a>
            </div>
        </div>
        <div className="container">
            <div className="left-column">
                <h2 style={{ fontSize: "1.8em", fontWeight: "bold"}}>{recipe.name}</h2>
                <h3 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Submitted by {recipe.author} on {recipe.createdAt}</h3>
                <img
                    src="https://media.istockphoto.com/id/898671450/photo/bunch-of-ripe-bananas-and-apples-isolated-on-a-white-background.jpg?s=612x612&w=0&k=20&c=NLqbC3xJJIKqqciKcWFg57WXDpoVOtKMgGaixYUT8ys="
                    alt={recipe.name}
                    className="recipe-image"
                />
                <h3 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Ingredients:</h3>
                <ul className="list-disc ml-6">
                    {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                    ))}
                </ul>
                <h3 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Steps:</h3>
                <ol className="list-decimal ml-6">
                    {recipe.steps.map((step, index) => (
                    <li style={{ fontSize: "1.1em" }} key={index}>{step}</li>
                    ))}
                </ol>
            </div>
            <div className="right-column">
                <h2 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Stars: </h2>
                <h3 style={{ fontSize: "1.1em"}}>{recipe.rating}/5</h3>
                <h2 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Difficulty:</h2>
                <h3 style={{ fontSize: "1.1em"}}>Author Rating: {authorRating}/10</h3>
                <h3 style={{ fontSize: "1.1em"}}>User Rating: {userRating}/10</h3>
                <h3 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Tags:</h3>
                {recipe.halal ? <p>Halal</p> : <div></div>}
                {recipe.lactoseFree ? <p>Welcome back!</p> : <div></div>}
                {recipe.vegan ? <p>Vegan</p> : <div></div>}
                {recipe.vegetarian ? <p>Vegetarian</p> : <div></div>}
    
                <h2 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Comments:</h2>
                <ol>
                    {recipe.comments.map((commentt, index) => (
                    <li style={{ fontSize: "1.1em" }} key={index}>{commentt}</li>
                    ))}
                </ol>
            </div>
        </div>
        </div>
    );
    };

    export default RecipeTemplate;