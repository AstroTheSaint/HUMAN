import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

// Initialize Firebase Admin
const apps = getApps()

if (!apps.length) {
  const serviceAccountBase64 = process.env.FIREBASE_ADMIN_KEY_BASE64
  if (!serviceAccountBase64) {
    console.warn('FIREBASE_ADMIN_KEY_BASE64 environment variable is not set')
    throw new Error('FIREBASE_ADMIN_KEY_BASE64 environment variable is not set')
  }

  try {
    // Decode base64 to JSON string, then parse to object
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString())

    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    })
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
    throw new Error('Failed to initialize Firebase Admin with provided credentials')
  }
}

// Export admin services
export const adminDb = getFirestore()
export const adminAuth = getAuth()
export const adminStorage = getStorage()

// Helper function to convert a Firestore timestamp to a JS Date
export const convertTimestampToDate = (
  data: FirebaseFirestore.DocumentData
): any => {
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => convertTimestampToDate(item));
  }
  
  // Handle objects
  if (data && typeof data === 'object') {
    Object.keys(data).forEach(key => {
      // Check if the value is a Firestore Timestamp
      if (data[key] && typeof data[key] === 'object' && data[key].toDate) {
        data[key] = data[key].toDate();
      } 
      // Recursively convert nested objects
      else if (data[key] && typeof data[key] === 'object') {
        data[key] = convertTimestampToDate(data[key]);
      }
    });
  }
  
  return data;
}; 