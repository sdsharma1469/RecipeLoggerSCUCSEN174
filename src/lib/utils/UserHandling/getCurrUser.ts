import { getAuth } from "firebase/auth"

export function getCurrentUserId(): string | null {
  const auth = getAuth()
  const user = auth.currentUser
  return user ? user.uid : null
}