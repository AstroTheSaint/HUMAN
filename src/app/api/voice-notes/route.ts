import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { auth } from '@/lib/firebase/firebase-client';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google Generative AI (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY as string);

export async function POST(request: NextRequest) {
  try {
    // Get form data with audio file and personId
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const personId = formData.get('personId') as string;
    
    if (!audioFile || !personId) {
      return NextResponse.json(
        { error: 'Audio file and person ID are required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for OpenAI
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Call Whisper API to transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], audioFile.name, { type: audioFile.type }),
      model: 'whisper-1',
    });

    // If transcript is empty, return error
    if (!transcription.text) {
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 }
      );
    }

    // Use Google's Gemini to extract structured information
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `
      Extract structured information from this transcript of a voice note about a person.
      
      Transcript: "${transcription.text}"
      
      Please extract the following information if present:
      - Occupation or profession
      - Location (city, state, country)
      - Meeting details (when and where the person was met)
      - Birthday (format as YYYY-MM-DD if possible)
      - Any other important personal information
      
      Format the response as JSON with these keys: occupation, location, meetingDetails, birthday, otherInfo.
      If information isn't available for a field, return an empty string for that field.
      For birthday, return in YYYY-MM-DD format if possible, or any date format you can extract.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const extractedText = response.text();
    
    // Try to parse the extracted information as JSON
    let extractedData = {
      occupation: '',
      location: '',
      meetingDetails: '',
      birthday: '',
      otherInfo: ''
    };
    
    try {
      // Handle the case where Gemini might wrap the JSON in markdown code blocks
      const jsonMatch = extractedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         extractedText.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, extractedText];
                         
      const jsonString = jsonMatch[1] || extractedText;
      extractedData = JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse extracted information:', error);
      // Continue with empty extracted data
    }
    
    // Add note to the person document
    const noteRef = adminDb.collection('people').doc(personId).collection('notes').doc();
    
    await noteRef.set({
      content: transcription.text,
      createdAt: FieldValue.serverTimestamp(),
      isFromVoice: true,
      transcript: transcription.text,
      extractedData: extractedData
    });
    
    // Update person document with extracted information if available
    const personUpdateData: Record<string, any> = {};
    
    if (extractedData.occupation && extractedData.occupation !== '') {
      personUpdateData.occupation = extractedData.occupation;
    }
    
    if (extractedData.location && extractedData.location !== '') {
      // We'll add general location data to the person record
      // More detailed parsing could be done, but this is a simple approach
      personUpdateData.location = extractedData.location;
    }
    
    if (extractedData.meetingDetails && extractedData.meetingDetails !== '') {
      personUpdateData.meetingPlace = extractedData.meetingDetails;
    }
    
    // Handle birthday if present
    if (extractedData.birthday && extractedData.birthday !== '') {
      try {
        // Try to parse the date string into a JavaScript Date
        const birthdayDate = new Date(extractedData.birthday);
        
        // Check if it's a valid date
        if (!isNaN(birthdayDate.getTime())) {
          // Store as Firestore timestamp
          personUpdateData.birthday = birthdayDate;
        }
      } catch (error) {
        console.error('Error parsing birthday:', error);
        // Store the raw string if we can't parse it as a date
        personUpdateData.birthdayText = extractedData.birthday;
      }
    }
    
    // Update the person document if we have data to update
    if (Object.keys(personUpdateData).length > 0) {
      await adminDb.collection('people').doc(personId).update(personUpdateData);
    }
    
    // Return success response with the transcription and extracted data
    return NextResponse.json({
      success: true,
      noteId: noteRef.id,
      transcript: transcription.text,
      extractedData: extractedData
    });
    
  } catch (error) {
    console.error('Error processing voice note:', error);
    return NextResponse.json(
      { error: 'Failed to process voice note' },
      { status: 500 }
    );
  }
} 