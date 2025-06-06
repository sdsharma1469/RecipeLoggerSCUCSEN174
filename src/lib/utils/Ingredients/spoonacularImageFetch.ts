// This file ensures that we get the Spoonacular data from its API key mostly for the image and with a splicing feature to attempt getting the right image at all costs

const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

async function searchSpoonacularIngredient(query: string) {
  //Searches for the ingredient based on the query in the URL.
  const res = await fetch(`https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(query)}&number=1&apiKey=${SPOONACULAR_API_KEY}`);
  return await res.json();
}

export async function fetchIngredientImage(ingredientName: string) {
  try {
    // 1. Try full query meaning we take the name of the ingredient here and search spoonacular
    let searchData = await searchSpoonacularIngredient(ingredientName);

    // 2. If nothing found, fallback to simpler query meaning we slice up the name of the ingredient name into something more simple. EX if "Brown Rice" does NOT exist in spoonacular database, this code will change it to "Rice"
    if (!searchData.results || searchData.results.length === 0) {
      const fallback = ingredientName.split(' ').slice(-2).join(' '); // last 2 words
      console.warn(`Retrying with fallback: ${fallback}`);
      searchData = await searchSpoonacularIngredient(fallback);
    }

    // Checks if no ingredients are found in the spoonacular API even after splicing
    if (!searchData.results || searchData.results.length === 0) {
      throw new Error('No ingredient found after fallback.');
    }

    // Saves ingredient ID which is used to get the more detailed information
    const ingredientId = searchData.results[0].id; 

    //Detailed results using the ingredient ID
    const detailedRes = await fetch(
      `https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1&unit=piece&apiKey=${SPOONACULAR_API_KEY}`
    );

    // Gathers the actual json the detailed response returns
    const detailedInfo = await detailedRes.json();

    return {
      id: ingredientId, // In case we want the spoonacular ID
      name: detailedInfo.name, // In case we want the name of the ingredient in database
      image: `https://spoonacular.com/cdn/ingredients_250x250/${detailedInfo.image}`, // The actual image
      
      // Below is where I used to get the estimated cost from. It takes it and writes the value into the correct format too

      /* estimatedCost: detailedInfo.estimatedCost
        ? `$${(detailedInfo.estimatedCost.value / 100).toFixed(2)} ${detailedInfo.estimatedCost.unit}`
        : 'Price not available', */
    };
  } catch (error) {
    console.error('Spoonacular price fetch error:', error);
    return null;
  }
}