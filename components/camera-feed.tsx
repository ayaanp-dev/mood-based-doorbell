"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, CameraOff, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Add this with your other imports
type Mood = 'happy' | 'sad' | 'angry';

interface CameraFeedProps {
  onCapture: (imageData: string) => void
  onMoodDetected: (mood: Mood, confidence: number) => void
  isAnalyzing: boolean
}

export default function CameraFeed({ onCapture, onMoodDetected, isAnalyzing }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceBounds, setFaceBounds] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(true) // Set to true if you're not using face-api.js

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOn(true)
        setError(null)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Could not access camera. Please check permissions.")
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()

      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCameraOn(false)
    }
  }

  // Toggle camera
  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  // Capture frame from video and detect mood
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraOn) {
      return;
    }
  
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
  
      if (!context) {
        throw new Error("Could not get canvas context");
      }
  
      // Set higher resolution for better face detection
      canvas.width = 1280;  // Higher resolution
      canvas.height = 720;  // Higher resolution
  
      // Wait for the next frame to ensure clear image
      await new Promise(requestAnimationFrame);
  
      // Draw video frame to canvas with image smoothing
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      // Convert canvas to blob with higher quality
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Failed to create blob"));
          },
          "image/jpeg",
          1.0  // Maximum quality
        );
      });
  
      // Create FormData
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");
  
      // Send to API
      const response = await fetch("https://mood-based-doorbell-backend.onrender.com/detect-mood", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
  
      if (data.mood) {
        setFaceDetected(true);
        onMoodDetected(data.mood as Mood, 1.0);
        setError(null);
        
        setTimeout(() => {
          setFaceDetected(false);
        }, 3000);
      } else {
        setError("No mood detected. Please try again.");
      }
    } catch (err) {
      console.error("Error in captureFrame:", err);
      setError(err instanceof Error ? err.message : "Failed to detect mood");
    } finally {
      isAnalyzing = false;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <Card className="border-0 shadow-lg overflow-hidden bg-white bg-opacity-80 backdrop-blur-md">
      <div className="aspect-video bg-slate-950 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn("w-full h-full object-cover", !isCameraOn && "hidden")}
          onPlay={() => setFaceDetected(false)}
        />

        {!isCameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 text-slate-400">
            <Camera className="w-16 h-16 opacity-50 mb-4" />
            <p className="text-slate-300 text-lg">Turn on camera to detect mood</p>
            {isModelLoading && (
              <div className="mt-4 flex items-center">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                <p className="text-slate-400 text-sm">Loading AI models...</p>
              </div>
            )}
          </div>
        )}

        {/* Face detection overlay */}
        {faceDetected && isCameraOn && (
          <div
            className="absolute border-2 border-green-400 rounded-md"
            style={{
              left: `${(faceBounds.x / (videoRef.current?.videoWidth || 640)) * 100}%`,
              top: `${(faceBounds.y / (videoRef.current?.videoHeight || 480)) * 100}%`,
              width: `${(faceBounds.width / (videoRef.current?.videoWidth || 640)) * 100}%`,
              height: `${(faceBounds.height / (videoRef.current?.videoHeight || 480)) * 100}%`,
              boxShadow: "0 0 0 1000px rgba(0, 255, 0, 0.1)",
            }}
          >
            <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full" />
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full" />
            <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-green-400 rounded-full" />
            <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-2 h-2 bg-green-400 rounded-full" />
          </div>
        )}

        {/* Analyzing overlay */}
        {isAnalyzing && isCameraOn && (
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <RefreshCw className="w-10 h-10 mx-auto mb-4 animate-spin" />
              <p className="text-xl font-medium">Analyzing Expression...</p>
              <p className="text-sm mt-2 text-gray-300">Please wait while our AI detects your mood</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-900 bg-opacity-90 p-3 text-white flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="p-4 flex justify-between items-center bg-white">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCamera}
          className="flex items-center"
          disabled={isAnalyzing || isModelLoading}
        >
          {isCameraOn ? (
            <>
              <CameraOff className="w-4 h-4 mr-2" />
              Turn Off Camera
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Turn On Camera
            </>
          )}
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={captureFrame}
          disabled={!isCameraOn || isAnalyzing || !modelLoaded}
          className={cn(
            "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white",
            (!isCameraOn || isAnalyzing || !modelLoaded) && "opacity-50",
          )}
        >
          Detect Mood
        </Button>
      </div>

      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  )
}

