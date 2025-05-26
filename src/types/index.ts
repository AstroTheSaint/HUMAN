import { Timestamp, FieldValue } from 'firebase/firestore'

// Frontend type with Timestamp for dates
export interface Person {
  name: string;
  email: string;
  phone: string;
  createdAt?: Timestamp;
  status?: 'pending' | 'active';
  id?: string;
  referrerId?: string;
  uid?: string;
  referrerNote?: string;
  
  // Additional fields for CRM functionality
  occupation?: string;
  city?: string;
  state?: string;
  country?: string;
  meetingDate?: Timestamp;
  meetingPlace?: string;
  gender?: string;
  birthday?: Timestamp;
  birthdayText?: string; // For storing birthday as text when it can't be parsed to a date
  interests?: string[];
  referralCount?: number; // Number of people this person has referred
  
  // Notes
  notes?: Array<{
    id: string;
    content: string;
    createdAt: Timestamp;
    isFromVoice?: boolean;
    transcript?: string;
    extractedData?: {
      occupation?: string;
      location?: string;
      meetingDetails?: string;
      otherInfo?: string;
      birthday?: string;
    };
  }>;
}

// Backend type with FieldValue support for server timestamps
export interface PersonCreate extends Omit<Person, 'createdAt' | 'meetingDate' | 'birthday'> {
  createdAt?: Timestamp | FieldValue;
  meetingDate?: Timestamp | FieldValue;
  birthday?: Timestamp | FieldValue;
} 