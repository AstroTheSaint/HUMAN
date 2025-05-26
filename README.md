# Audio Story Page Template

A sophisticated audio story player template built with Next.js 15+, TypeScript, and Tailwind CSS. Features continuous playback across sections, variable speed control, keyboard shortcuts, and progress tracking. Perfect for creating immersive, audio-driven storytelling experiences with synchronized text.

🔴 [Live Demo](https://audio-story-page-template.vercel.app/)

## Browser Compatibility
✅ Safari Desktop & Mobile (including proper audio handling and autoplay)
✅ Chrome Desktop & Mobile
✅ Firefox Desktop & Mobile

## Setup Checklist

1. **Fork & Clone**
   - [ ] Fork this repository
   - [ ] Clone your fork: `git clone https://github.com/garysheng/audio-story-page-template.git`
   - [ ] Navigate to project: `cd audio-story-page-template`

2. **Install Dependencies**
   - [ ] Install Node.js 20+ if you haven't already
   - [ ] Run: `npm install`

3. **Add Your Content**
   - [ ] Replace audio files in `/public/story/` with your own MP3s
   - [ ] Update story sections in `src/components/story-playback.tsx`:
     ```typescript
     const STORY_SECTIONS = [
       {
         id: 'your-section-id',
         title: 'Your Section Title',
         content: 'Your **Markdown** content',
         audioUrl: '/story/your-audio-file.mp3'
       },
       // Add more sections...
     ]
     ```
   - [ ] Update page title in `src/app/page.tsx`

4. **Customize Styling (Optional)**
   - [ ] Modify colors in `src/app/globals.css`
   - [ ] Adjust background gradient in `src/app/page.tsx`
   - [ ] Update card animations in `tailwind.config.ts`

5. **Test Locally**
   - [ ] Run: `npm run dev`
   - [ ] Visit: `http://localhost:3000`
   - [ ] Test audio playback
   - [ ] Verify mobile responsiveness
   - [ ] Check dark mode

6. **Deploy**
   - [ ] Create a new repository for your project
   - [ ] Update git remote: `git remote set-url origin YOUR_NEW_REPO_URL`
   - [ ] Push changes: `git push -u origin main`
   - [ ] Deploy to Vercel (recommended) or your preferred hosting

## Audio File Requirements
- Format: MP3 (best browser compatibility)
- Recommended bitrate: 128-192 kbps
- Place files in: `/public/story/`
- Ensure filenames match `audioUrl` in story sections

## Development Notes
- Audio handling is optimized for Safari's strict autoplay policies
- Smooth transitions between sections with proper cleanup
- Mobile-first responsive design
- Keyboard shortcuts (space bar) with proper handling
- Progress tracking with automatic scrolling

## Need Help?
Feel free to open an issue if you run into any problems!

## Voice-First CRM Feature

The app now includes a voice-first CRM feature that allows Johnny (admin) to add voice notes for existing users. Here's how it works:

1. Navigate to the Admin Dashboard
2. Find the user you want to add information about
3. Click the "Record Voice Note" button
4. Speak naturally about the person, for example: "Marianne is a dentist from Ohio and I met her at a bar last night"
5. Click "Stop Recording" when finished
6. The system will automatically:
   - Transcribe the audio using OpenAI's Whisper API
   - Extract key information like occupation, location, and meeting details
   - Save the information to the user's profile
   - Add a new note with the transcription and extracted data

### Setting Up Voice-First CRM

To use this feature, you need to:

1. Add API keys to your `.env.local` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_key_here
   ```

2. Make sure your Firebase service account key is properly set up for server-side operations
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

### Technologies Used

The voice-first CRM feature uses:
- OpenAI's Whisper API for speech-to-text
- Google's Gemini AI for entity extraction
- Firebase for data storage and retrieval
- Next.js API routes for server-side processing
