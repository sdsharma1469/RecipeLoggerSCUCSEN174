const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

async function searchSpoonacularIngredient(query: string) {
  const res = await fetch(
    `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(
      query
    )}&number=1&apiKey=${SPOONACULAR_API_KEY}`
  );
  return await res.json();
}

export async function fetchIngredientPrice(ingredientName: string) {
  try {
    // 1. Try full query
    let searchData = await searchSpoonacularIngredient(ingredientName);

    // 2. If nothing found, fallback to simpler query
    if (!searchData.results || searchData.results.length === 0) {
      const fallback = ingredientName.split(' ').slice(-2).join(' '); // last 2 words
      console.warn(`Retrying with fallback: ${fallback}`);
      searchData = await searchSpoonacularIngredient(fallback);
    }

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error('No ingredient found after fallback.');
    }

    const ingredientId = searchData.results[0].id;

    const detailedRes = await fetch(
      `https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1&unit=piece&apiKey=${SPOONACULAR_API_KEY}`
    );

    const detailedInfo = await detailedRes.json();

    return {
      id: ingredientId,
      name: detailedInfo.name,
      image: `https://spoonacular.com/cdn/ingredients_250x250/${detailedInfo.image}`,
      estimatedCost: detailedInfo.estimatedCost
        ? `$${(detailedInfo.estimatedCost.value / 100).toFixed(2)} ${detailedInfo.estimatedCost.unit}`
        : 'Price not available',
      possibleUnits: detailedInfo.possibleUnits,
    };
  } catch (error) {
    console.error('Spoonacular price fetch error:', error);
    return null;
  }
}
