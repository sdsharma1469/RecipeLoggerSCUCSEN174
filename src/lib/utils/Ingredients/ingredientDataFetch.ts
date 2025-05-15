const API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY;

export async function fetchIngredientData(ingredientName: string) {
  const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${ingredientName}&api_key=${API_KEY}`);

  if (!response.ok) {
    throw new Error("Failed to fetch ingredient data");
  }

  const result = await response.json();

  // Ensure the API returned results
  if (!result.foods || result.foods.length === 0) {
    return null; // No matching ingredient found
  }

  const mostRelevantFood = result.foods[0]; // Get the top-ranked result at least assuming that the API sorts already by order relevance

  // Extract relevant data
  return {
    name: mostRelevantFood.description, // Name of the ingredient
    nutrients: mostRelevantFood.foodNutrients.map((nutrient: any) => ({
      name: nutrient.nutrientName,
      amount: nutrient.value,
      unit: nutrient.unitName,
    })),
    cost: mostRelevantFood.price || "Cost data unavailable", // If price exists
  };
}