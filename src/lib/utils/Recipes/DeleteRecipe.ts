import { getFirestore, doc, getDoc, updateDoc, arrayRemove, deleteDoc } from 'firebase/firestore'

export async function deleteRecipeByRecipeIDandUserID(userId: string, recipeId: string): Promise<boolean> {
  const db = getFirestore()

  console.log(`🔍 Fetching user with ID "${userId}"...`)
  const userRef = doc(db, 'Users', userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    console.warn(`❌ User with ID "${userId}" not found.`)
    return false
  }

  const { SavedRecipes = [], UploadedRecipes = [] } = userSnap.data()
  const isInSaved = SavedRecipes.includes(recipeId)
  const isInUploaded = UploadedRecipes.includes(recipeId)

  if (!isInSaved && !isInUploaded) {
    console.warn(`⚠️ Recipe ID "${recipeId}" not found in user's saved or uploaded lists.`)
    return false
  }

  console.log(`✅ User found. Checking recipe "${recipeId}" in Firestore...`)
  const recipeRef = doc(db, 'Recipes', recipeId)
  const recipeSnap = await getDoc(recipeRef)

  if (!recipeSnap.exists()) {
    console.warn(`⚠️ Recipe with ID "${recipeId}" not found in 'Recipes' collection.`)
    // Still remove from user's lists even if recipe doesn't exist
  }

  const updates: Record<string, any> = {}

  if (isInSaved) {
    console.log(`🗑️ Removing recipe "${recipeId}" from SavedRecipes.`)
    updates.SavedRecipes = arrayRemove(recipeId)
  }

  if (isInUploaded) {
    console.log(`🗑️ Removing recipe "${recipeId}" from UploadedRecipes.`)
    updates.UploadedRecipes = arrayRemove(recipeId)
  }

  try {
    await updateDoc(userRef, updates)
    console.log(`✅ User document updated.`)
  } catch (err) {
    console.error(`❌ Failed to update user document:`, err)
    return false
  }

  if (isInUploaded && recipeSnap.exists()) {
    try {
      await deleteDoc(recipeRef)
      console.log(`🗑️ Recipe document "${recipeId}" deleted from Firestore.`)
    } catch (err) {
      console.error(`❌ Failed to delete recipe document:`, err)
      return false
    }
  }

  console.log(`🎉 Recipe deletion process completed successfully.`)
  return true
}
