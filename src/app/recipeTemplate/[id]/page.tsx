'use client'

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from 'next/navigation';
import type { Recipe } from '@/types/Recipe';
import { fetchRecipeById } from "@/lib/utils/Recipes/RecipeByID";
import { Timestamp } from "firebase-admin/firestore"
import './recipeTemplate.css' 

const starRating = 5;
const authorRating = 7;
const userRating = 8;

const RecipeTemplate: React.FC = () => {
    const { id } = useParams() as { id: string };
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams(); // I added here a way to get the username from the URL from the explore page!
    const username = searchParams.get('username') || 'Guest'; // I added here a way to get the username from the URL from the explore page!
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
    const fullStars = Math.floor(recipe.rating);
    const halfStar = recipe.rating % 1 >= 0.25 && recipe.rating % 1 <= 0.75;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
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
                <a href="/cart">Cart </a> |
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
                <h2 style={{ fontSize: "1.8em", fontWeight: "bold"}}>{recipe.name}</h2>
                <h3 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Submitted by {recipe.author} on {recipe.createdAt.toDate().toLocaleDateString()}</h3>
                <img
                    src="https://media.istockphoto.com/id/898671450/photo/bunch-of-ripe-bananas-and-apples-isolated-on-a-white-background.jpg?s=612x612&w=0&k=20&c=NLqbC3xJJIKqqciKcWFg57WXDpoVOtKMgGaixYUT8ys="
                    alt={recipe.name}
                    className="recipe-image"
                />
                <h3 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Ingredients:</h3>
                <ul className="list-disc ml-6">
                    {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}><a href={`/ingredients/${ingredient}?username=${username}`} className="text-blue-600 hover:underline">{ingredient}</a></li>
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
                <div className="flex text-yellow-500">
                    {stars.map((star, index) => (
                        <div style={{ fontSize: "1.6em" }} key={index}>{star === 'full' ? '★' : star === 'half' ? '⯪' : '☆'}</div>
                    ))}
                </div>
                <h2 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Difficulty</h2>
                <h3 style={{ fontSize: "1.1em"}}>From author: {recipe.authorDiff}/10</h3>
                <h3 style={{ fontSize: "1.1em"}}>From users: {recipe.userDiff}/10</h3>
                <h2 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Average Price </h2>
                <h3 style={{ fontSize: "1.1em"}}>${recipe.cost}</h3>
                <h3 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Tags</h3>
                {recipe.halal ? <p style={{ fontSize: "1.1em"}}>Halal</p> : <div></div>}
                {recipe.lactoseFree ? <p style={{ fontSize: "1.1em"}}>Lactose Free</p> : <div></div>}
                {recipe.vegan ? <p style={{ fontSize: "1.1em"}}>Vegan</p> : <div></div>}
                {recipe.vegetarian ? <p style={{ fontSize: "1.1em"}}>Vegetarian</p> : <div></div>}
            </div>
        </div>
        <div className="comment-section">
                <h2 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Comments:</h2>
                <ol>
                    {recipe.comments.map((commentt, index) => (
                    <li style={{ fontSize: "1.1em" }} key={index}>{commentt}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
    };

    export default RecipeTemplate;