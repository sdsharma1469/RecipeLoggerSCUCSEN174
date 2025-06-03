import { getUserIdByUsername } from "../UserHandling/IdbyUsername";
import { fetchRecipeById } from "./RecipeByID";

export async function getAuthorIdByRecipeId(recipeId: string): Promise<string | null> {
  try {
    const recipe = await fetchRecipeById(recipeId)
    const authorUsername = recipe?.author

    if (!authorUsername) {
      console.warn(`⚠️ Author not found in recipe "${recipeId}".`)
      return null
    }

    const authorId = await getUserIdByUsername(authorUsername)
    return authorId
  } catch (error) {
    console.error("❌ Failed to get author ID from recipe:", error)
    return null
  }
}
