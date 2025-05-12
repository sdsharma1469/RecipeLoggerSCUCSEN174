'use client'

import React, { useState, useEffect } from "react";
import './recipeTemplate.css' 
import { Rubik_80s_Fade } from "next/font/google";

const recipeName = "Test Recipe";

const recipeIngredients = [
    "2 Apples",
    "4 Bananas"
];
console.log(recipeIngredients);
const recipeSteps = [
    "I like apples",
    "and bananas.",
    "Me too bro.",
    "Me too."
];

const starRating = 5;

const authorRating = 7;

const userRating = 8;

const RecipeTemplate: React.FC = () => {
    useEffect(() => {
        const fetchRecipe = async () => {
        try {

        } catch (error) {
            console.error("Error fetching recipe: ", error);
        }
        };
        fetchRecipe();
    }, []);

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
                <h2 style={{ fontSize: "1.8em", fontWeight: "bold"}}>{recipeName}</h2>
                <img
                    src="https://media.istockphoto.com/id/898671450/photo/bunch-of-ripe-bananas-and-apples-isolated-on-a-white-background.jpg?s=612x612&w=0&k=20&c=NLqbC3xJJIKqqciKcWFg57WXDpoVOtKMgGaixYUT8ys="
                    alt={recipeName}
                    className="recipe-image"
                    />
                <h3 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Ingredients:</h3>
                <ul>
                    {recipeIngredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                    ))}
                </ul>
                <h3 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Steps:</h3>
                <ol>
                    {recipeSteps.map((step, index) => (
                    <li style={{ fontSize: "1.1em" }} key={index}>{step}</li>
                    ))}
                </ol>
            </div>
            <div className="right-column">
                <h2 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Stars: </h2>
                <h3 style={{ fontSize: "1.1em"}}>{starRating}/5</h3>
                <h2 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Difficulty:</h2>
                <h3 style={{ fontSize: "1.1em"}}>Author Rating: {authorRating}/10</h3>
                <h3 style={{ fontSize: "1.1em"}}>User Rating: {userRating}/10</h3>
                <ul>
                    {recipeIngredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                    ))}
                </ul>
                <h2 style={{ fontSize: "1.2em", fontWeight: "bold"}}>Reviews:</h2>
            </div>
        </div>
        </div>
    );
    };

    export default RecipeTemplate;