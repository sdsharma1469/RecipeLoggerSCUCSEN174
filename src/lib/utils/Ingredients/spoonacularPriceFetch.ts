const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

export async function fetchIngredientPrice(ingredientName: string) {
    try {
        // This searchRes variable fetches the ingredient data by the name that was given.
        const searchRes = await fetch(`https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(ingredientName)}&apiKey=${SPOONACULAR_API_KEY}`);
        
        const searchData = await searchRes.json();


        if (searchData.results || searchData.results.length === 0) {
            throw new Error("Ingredient was no found on Spoonacular");
        }

        // Sets the ID of the first result for the ingredient
        const ingredientId = searchData.results[0].id;
    
        // Now we fetch the detailed specific info for the ingredient being the price
        const detailedRes = await fetch(`https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1&unit=piece&apiKey=${SPOONACULAR_API_KEY}`);
    
        const detailedInfo = await detailedRes.json();

        return {
            id: ingredientId,
            name: detailedInfo.name,
            image: 'https://spoonacular.com/cdn/ingredients_250x250/${detailedInfo.image}',
            estimatedCost: detailedInfo.estimatedCost ? '$${(detailedInfo.estimatedCost.value / 100).toFixed(2)} ${detailedInfo.estimatedCost.unit}' : 'Price not available',
            possibleUnits: detailedInfo.possibleUnits,
        };
    } catch (error) {
        console.error('Spoonacular price fetch error:', error);
        return null;
    }
}