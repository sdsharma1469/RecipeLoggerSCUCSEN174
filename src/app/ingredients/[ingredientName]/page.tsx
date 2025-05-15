'use client';

import { fetchIngredientData } from '@/lib/utils/Ingredients/ingredientDataFetch'; // USDA API
import { fetchIngredientPrice } from '@/lib/utils/Ingredients/spoonacularPriceFetch'; // Spoonacular API
import { useEffect, useState } from 'react';
import './ingredients.css';

export default function IngredientPage({ params }: { params: { ingredientName: string } }) {
  const [ingredientData, setIngredientData] = useState<any>(null);
  const [priceInfo, setPriceInfo] = useState<any>(null);

  const ingredientName = decodeURIComponent(params.ingredientName);

  // function is used to fetch the data from the USDA API
  useEffect(() => {
    async function getUSDAData() {
      try {
        const data = await fetchIngredientData(ingredientName);
        setIngredientData(data);
      } catch (error) {
        console.error('Error fetching USDA data:', error);
      }
    }

    // function is used to fetch the data from the Spoonacular API. Consists of 
    async function getSpoonacularData() {
      try {
        const data = await fetchIngredientPrice(ingredientName);
        setPriceInfo(data);
      } catch (error) {
        console.error('Error fetching Spoonacular data:', error);
      }
    }

    getUSDAData();
    getSpoonacularData();
  }, [ingredientName]);

  // Extract calories if available
  const calories = ingredientData?.nutrients.find(
    (nutrient: any) =>
      nutrient.name.toLowerCase().includes('energy') ||
      nutrient.name.toLowerCase().includes('calories')
  );


  //Before heading into the return statment, I divided it up into 5 sections that are of interest to make up the ingredient page
  return (
    <div>
      <h1>{ingredientName}</h1>

      {/* 1. Image */}
      <div id="ingredient-image">
        {priceInfo?.image ? (
          <img src={priceInfo.image} alt={ingredientName} style={{ maxWidth: '250px' }} />
        ) : (
          <p>Loading image...</p>
        )}
      </div>

      {/* 2. Calories */}
      <div id="ingredient-calories">
        <br/>
        <h1><strong>Calories</strong></h1>
        {calories ? (
          <p>
            {calories.amount} {calories.unit}
          </p>
        ) : (
          <p>Calories info not found.</p>
        )}
      </div>

      {/* 3. Price */}
      <div id="ingredient-price">
        <br/>
        {priceInfo ? (
          <>
            <p>
              <strong>Estimated Cost:</strong> {priceInfo.estimatedCost}
            </p>
            <p>
              <strong>Possible Units:</strong> {priceInfo.possibleUnits?.join(', ')}
            </p>
          </>
        ) : (
          <p>Loading price information...</p>
        )}
      </div>

      {/* 4. Nutrients */}
      <div id="ingredient-nutrients">
        <br/>
        <h1><strong>Nutritional Info</strong></h1>
        {ingredientData ? (
          <ul>
            {ingredientData.nutrients.map((nutrient: any, index: number) => (
              <li key={index}>
                <strong>{nutrient.name}</strong>: {nutrient.amount} {nutrient.unit}
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading nutritional information...</p>
        )}
      </div>

      {/* 5. Buy Link */}
      <div id="ingredient-buy">
        <br/>
        <h2><strong>Where to Buy</strong></h2>
        <a className="amazon-link" href={`https://www.amazon.com/s?k=${encodeURIComponent(ingredientName)}&i=amazonfresh`} target="_blank" rel="noopener noreferrer">
          Search for {ingredientName} on Amazon Fresh
        </a>
      </div>
    </div>
  );
}
