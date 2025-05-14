import { RecipeList } from "./RecipeIdList"

export interface UserProfile {
    uid: string
    email: string | null
    username: string | null
    name: string
    photoURL: string | null
    createdAt: Date | null
    savedRecipes: RecipeList | null
    uploadedRecipes : RecipeList | null
  }

