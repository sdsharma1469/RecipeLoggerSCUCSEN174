import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { ServiceAccount } from 'firebase-admin/app'


console.log('KEY FOUND?', !!process.env.FIREBASE_PRIVATE_KEY)
console.log('KEY PREVIEW:', process.env.FIREBASE_PRIVATE_KEY?.slice(0, 50))

const serviceAccount: ServiceAccount = {
  projectId: 'scurecipes',
  clientEmail: 'firebase-adminsdk-fbsvc@scurecipes.iam.gserviceaccount.com',
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
}

const app = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore(app)

export { db, app }
