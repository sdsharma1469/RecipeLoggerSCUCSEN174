import { RecipeList } from "./RecipeIdList"

  export interface UserProfile {
  uid: string;
  email: string | null;
  username: string | null;
  name: string;
  photoURL: string | null;
  createdAt: Date | null;
  savedRecipes: RecipeList | null;
  uploadedRecipes: RecipeList | null;
  cart: Array<{
    recipeID: string;
    recipeName: string;
    ingredients: Array<{
      name: string;
      quantity: number;
      checked: boolean; // whether user has "obtained" this item
    }>;
  }>;
  profileImageUrl?: string;
  profileImagePath?: string; // Store the storage path for potential cleanup
  createdAt: Date;
  updatedAt: Date;


}

export const updateUserProfileImage = async (
  userId: string, 
  imageUrl: string, 
  imagePath: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      profileImageUrl: imageUrl,
      profileImagePath: imagePath,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Failed to update user profile image:", error);
    throw error;
  }
};

export const getUserProfileImage = async (userId: string): Promise<string | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.profileImageUrl || null;
    }
    return null;
  } catch (error) {
    console.error("Failed to get user profile image:", error);
    return null;
  }
};

// Optional: Function to delete old profile image when updating
export const deleteOldProfileImage = async (imagePath: string): Promise<void> => {
  try {
    const storage = getStorage();
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Failed to delete old profile image:", error);
    // Don't throw error as this is cleanup - main functionality should continue
  }
};
