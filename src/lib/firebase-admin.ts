import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { ServiceAccount } from 'firebase-admin/app'

var admin = require("firebase-admin");
var serviceAccount = require("@/lib/Service.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('KEY FOUND?', !!process.env.FIREBASE_PRIVATE_KEY)
console.log('KEY PREVIEW:', process.env.FIREBASE_PRIVATE_KEY?.slice(0, 50))

const adminApp = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore(adminApp)

export { db, adminApp }
