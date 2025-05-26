// Re-export client-side Firebase
export * from './firebase-client';

// Make server-side Firebase accessible via a different import path
// These will only be used in server components or API routes
export * as admin from './firebase-admin'; 