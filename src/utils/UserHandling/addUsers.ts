import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'

export async function addUserToFirestore(user: User) {
  console.log('📥 addUserToFirestore called with:', user.email)
  const username = user.displayName?.toLowerCase().replace(/\s+/g, '') || user.email?.split('@')[0]

  const db = getFirestore()

  try {
    const userRef = doc(db, 'Users', user.uid)
    await setDoc(userRef, {
      email: user.email,
      username: username|| '',
      createdAt: new Date(),
      SavedRecipes : [],
      UploadedRecipes : [],
    }, { merge: true })

    console.log('✅ User added to Firestore')
  } catch (error) {
    console.error('❌ Firestore write error:', error)
  }
}
