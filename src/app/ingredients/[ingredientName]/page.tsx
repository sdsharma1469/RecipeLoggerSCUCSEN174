'use client'

import { fetchIngredientData } from '@/lib/utils/Ingredients/ingredientDataFetch'
import { useEffect, useState } from 'react'
import './ingredients.css'

export default function IngredientPage({ params }: { params: { ingredientName: string } }) {
  const [ingredientData, setIngredientData] = useState<any>(null);
  const ingredientName = decodeURIComponent(params.ingredientName);

  useEffect(() => {
    async function getData() {
      try {
        const data = await fetchIngredientData(ingredientName);
        setIngredientData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    getData();
  }, [ingredientName]);

  return (
    <div>
      <h1>Ingredient: {ingredientData?.name || ingredientName}</h1>
      {ingredientData ? (
        <>
          <h2>Nutritional Info:</h2>
          <ul>
            {ingredientData.nutrients.map((nutrient: any, index: number) => (
              <li key={index}>
                <strong>{nutrient.name}</strong>: {nutrient.amount} {nutrient.unit}
              </li>
            ))}
          </ul>
          <h2>Estimated Cost:</h2>
          <p>{ingredientData.cost}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}