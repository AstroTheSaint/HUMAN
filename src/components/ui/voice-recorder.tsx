"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Mic, StopCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  personId: string;
  onNoteAdded?: (data: any) => void;
}

/** Detect if browser is Safari */
function isSafari() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("safari") && !ua.includes("chrome");
}

/** Detect if device is iOS */
function isIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function VoiceRecorder({ personId, onNoteAdded }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  // Timer effect for recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  const cleanupRecording = () => {
    // Clean up audio analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping MediaRecorder:", e);
      }
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset state
    setAudioLevel(0);
    mediaRecorderRef.current = null;
  };

  const initMediaRecorder = async (stream: MediaStream) => {
    const supportedTypes = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    
    let mediaRecorder: MediaRecorder | null = null;
    
    // Safari specific handling
    if (isSafari()) {
      mediaRecorder = new MediaRecorder(stream);
    } else {
      // Try each MIME type until one works
      for (const mimeType of supportedTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          mediaRecorder = new MediaRecorder(stream, { mimeType });
          break;
        }
      }
      
      // Fallback if no supported types
      if (!mediaRecorder) {
        mediaRecorder = new MediaRecorder(stream);
      }
    }
    
    return mediaRecorder;
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setIsRecording(false); // Reset state
      
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      console.log("Microphone access granted");
      
      // Set up audio analyzer for visualization
      try {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;
        source.connect(analyser);
        analyserRef.current = analyser;
        
        // Audio level monitoring
        const analyzeAudio = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          setAudioLevel(Math.min((average / 255) * 1.5, 1));
          animationFrameRef.current = requestAnimationFrame(analyzeAudio);
        };
        
        analyzeAudio();
      } catch (e) {
        console.warn("Audio analysis setup failed:", e);
        // Continue without visualization if it fails
      }
      
      const mediaRecorder = await initMediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`Received audio chunk of size: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped");
        processRecording();
      };
      
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast({
          title: "Recording Error",
          description: "An error occurred while recording. Please try again.",
          variant: "destructive",
        });
        cleanupRecording();
        setIsRecording(false);
      };
      
      // Start recording and request data every 1 second
      mediaRecorder.start(1000);
      console.log("MediaRecorder started");
      setIsRecording(true);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Microphone Access Error",
        description: isIOS() ? 
          "Recording on iOS may be restricted. Please try using the notes feature instead." : 
          "Please allow microphone access to record voice notes.",
        variant: "destructive",
      });
      
      cleanupRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("Stopping MediaRecorder...");
      setIsRecording(false);
      
      // Add a small delay to allow any final chunks to be processed
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        } else {
          processRecording();
        }
      }, 500);
    }
  };

  const processRecording = async () => {
    console.log(`Processing ${audioChunksRef.current.length} audio chunks`);
    
    // Perform cleanup first
    cleanupRecording();
    
    if (audioChunksRef.current.length === 0) {
      toast({
        title: "Recording Error",
        description: "No audio recorded. Please try again or add a text note instead.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      
      console.log(`Created audio blob of type ${mimeType}, size: ${audioBlob.size} bytes`);
      
      // If the recording is too short, show a warning
      if (audioBlob.size < 1000) { // roughly 1KB as a minimum size
        toast({
          title: "Recording Too Short",
          description: "Please record a longer voice note or add a text note instead.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      await sendAudioToServer(audioBlob);
      
    } catch (error) {
      console.error("Error processing voice note:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process voice note. Please try again or add a text note instead.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    // Create form data for API
    const formData = new FormData();
    formData.append('audio', audioBlob, `recording.${audioBlob.type.split('/')[1] || 'webm'}`);
    formData.append('personId', personId);
    
    console.log("Sending audio to server...");
    
    // Send to API
    const response = await fetch('/api/voice-notes', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      toast({
        title: "Voice Note Added",
        description: "Your voice note has been processed and saved.",
      });
      
      if (onNoteAdded) {
        onNoteAdded(data);
      }
    } else {
      throw new Error(data.error || "Unknown error processing voice note");
    }
  };

  // Format recording time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 justify-center">
        {isRecording ? (
          <div className="relative">
            {/* Animated audio level indicator */}
            <div 
              className="absolute inset-0 rounded-full bg-red-900/30 transition-transform duration-100"
              style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
            />
            <div 
              className="absolute inset-[-8px] rounded-full bg-red-900/20 transition-transform duration-100"
              style={{ transform: `scale(${1 + audioLevel * 0.7})` }}
            />
            <div 
              className="absolute inset-[-16px] rounded-full bg-red-900/10 transition-transform duration-100"
              style={{ transform: `scale(${1 + audioLevel * 0.9})` }}
            />
            
            <Button
              variant="destructive"
              size="lg"
              className="flex items-center gap-2 relative z-10"
              onClick={stopRecording}
              disabled={isProcessing}
            >
              <StopCircle className="h-5 w-5" />
              Stop Recording ({formatTime(recordingTime)})
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            size="lg"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={startRecording}
            disabled={isProcessing}
          >
            <Mic className="h-5 w-5" />
            Record Voice Note
          </Button>
        )}
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-white/70">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing voice note...</span>
          </div>
        </div>
      )}
      
      {/* iOS Help text */}
      {isIOS() && !isRecording && !isProcessing && (
        <p className="text-xs text-center text-white/50 mt-2">
          Note: iOS devices may have limited recording capabilities in web browsers.
          If recording doesn't work, please use the text notes feature instead.
        </p>
      )}
    </div>
  );
} 