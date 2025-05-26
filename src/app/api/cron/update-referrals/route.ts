import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import * as admin from 'firebase-admin';
import type { Person } from '@/types';

// This is a Vercel cron job endpoint to update referral counts daily
// It should be configured to run daily via Vercel cron settings
export async function GET(request: NextRequest) {
  try {
    // Check if it's actually called by Vercel Cron
    // No auth for simplicity, but in production you'd want to add some security
    
    console.log("Starting daily referral counts update...");
    
    // Get all users
    const usersSnapshot = await adminDb.collection('people').get();
    const allUsers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Person, 'id'>
    }));
    
    // Count referrals for each user
    const referralCounts = new Map<string, number>();
    
    allUsers.forEach(userData => {
      if (userData.referrerId && typeof userData.referrerId === 'string') {
        const count = referralCounts.get(userData.referrerId) || 0;
        referralCounts.set(userData.referrerId, count + 1);
      }
    });
    
    // Update each user's referral count in Firestore
    const batch = adminDb.batch();
    
    allUsers.forEach(userData => {
      if (!userData.id) return;
      const userRef = adminDb.collection('people').doc(userData.id);
      batch.update(userRef, {
        referralCount: referralCounts.get(userData.id) || 0
      });
    });
    
    await batch.commit();
    
    const timestamp = new Date().toISOString();
    console.log(`Referral counts updated successfully at ${timestamp}`);
    
    // Log the operation in a separate collection for tracking
    await adminDb.collection('cronLogs').add({
      operation: 'update-referrals',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      usersProcessed: allUsers.length,
      success: true
    });
    
    return NextResponse.json({
      success: true,
      message: "Referral counts updated successfully",
      timestamp,
      usersProcessed: allUsers.length
    });
    
  } catch (error) {
    console.error('Error updating referral counts:', error);
    
    // Log the error
    try {
      await adminDb.collection('cronLogs').add({
        operation: 'update-referrals',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        success: false,
        error: JSON.stringify(error)
      });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update referral counts',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 