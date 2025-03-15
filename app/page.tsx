"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Volume2, VolumeX, History, BarChart3, Camera, Smile, Sparkles } from "lucide-react"
import MoodDisplay from "@/components/mood-display"
import DoorbellButton from "@/components/doorbell-button"
import MoodHistory from "@/components/mood-history"
import InsultPopup from "@/components/insult-popup"
import CameraFeed from "@/components/camera-feed"
import VoiceRecorder from "@/components/voice-recorder"
import { cn } from "@/lib/utils"

// Mood types
export type Mood = "angry" | "happy" | "sad" | "neutral"

// Sound mapping
const moodSounds = {
  angry: "/angry-metal.mp3", // These would be actual sound files in a real implementation
  happy: "/happy-kazoo.mp3",
  sad: "/sad-trombone.mp3",
  neutral: "/doorbell-ring.mp3",
}

// Insult messages for repeat ringers
const insults = [
  "Stop ringing, you maniac!",
  "Are you training for the Doorbell Olympics?",
  "The doorbell needs a break from you!",
  "We get it, you like pressing buttons!",
  "Please stop. The doorbell is tired.",
]

export default function Home() {
  const [currentMood, setCurrentMood] = useState<Mood>("neutral")
  const [isRinging, setIsRinging] = useState(false)
  const [ringCount, setRingCount] = useState(0)
  const [showInsult, setShowInsult] = useState(false)
  const [insultMessage, setInsultMessage] = useState("")
  const [moodHistory, setMoodHistory] = useState<Mood[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isDetecting] = useState(false)
  const [detectionProgress] = useState(0)
  const [capturedImage] = useState<string | null>(null)
  const [isAnalyzingCamera, setIsAnalyzingCamera] = useState(false)
  const [lastConfidence, setLastConfidence] = useState(0)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handle mood detection from camera
  const handleMoodDetected = (mood: Mood, confidence: number) => {
    setCurrentMood(mood)
    setLastConfidence(confidence)
    setMoodHistory((prev) => [mood, ...prev].slice(0, 10))
    setIsAnalyzingCamera(false)
    playSound(mood)

    // Increment ring count for the insult feature
    setRingCount((prev) => prev + 1)

    // Check if we should show an insult
    if (ringCount >= 2) {
      const randomInsult = insults[Math.floor(Math.random() * insults.length)]
      setInsultMessage(randomInsult)
      setShowInsult(true)

      // Hide insult after a few seconds
      setTimeout(() => {
        setShowInsult(false)
      }, 4000)
    }
  }

  // Play sound based on mood
  const playSound = (mood: Mood) => {
    if (isMuted) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = moodSounds[mood]
      audioRef.current.play().catch((e) => console.error("Error playing sound:", e))
    }
  }

  // Handle doorbell ring
  const handleRing = () => {
    if (isRinging) return

    setIsRinging(true)
    setRingCount((prev) => prev + 1)
    setIsRecordingVoice(true)
    setCurrentMood('neutral') // Reset mood while recording

    // Start recording process
    setTimeout(() => {
      setIsRinging(false)
    }, 1000)

    // Show insult if needed
    if (ringCount >= 2) {
      const randomInsult = insults[Math.floor(Math.random() * insults.length)]
      setInsultMessage(randomInsult)
      setShowInsult(true)

      setTimeout(() => {
        setShowInsult(false)
      }, 4000)
    }
  }

  // Add handler for voice mood detection
  const handleVoiceMoodDetected = (mood: string) => {
    setIsRecordingVoice(false)
    setCurrentMood(mood as Mood)
    setMoodHistory((prev) => [mood as Mood, ...prev].slice(0, 10))
    playSound(mood as Mood)
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  // Reset ring count after a cooldown period
  useEffect(() => {
    if (ringCount > 0) {
      const timeout = setTimeout(() => {
        setRingCount(0)
      }, 30000) // Reset after 30 seconds

      return () => clearTimeout(timeout)
    }
  }, [ringCount])

  // Get background gradient based on mood
  const getBackgroundGradient = () => {
    switch (currentMood) {
      case "angry":
        return "bg-gradient-to-br from-red-50 via-red-100 to-orange-50"
      case "happy":
        return "bg-gradient-to-br from-yellow-50 via-amber-100 to-orange-50"
      case "sad":
        return "bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50"
      default:
        return "bg-gradient-to-br from-slate-50 via-slate-100 to-gray-50"
    }
  }

  return (
    <main
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 transition-all duration-700",
        getBackgroundGradient(),
      )}
    >
      <audio ref={audioRef} />
      <VoiceRecorder 
        isRecording={isRecordingVoice}
        onRecordingComplete={handleVoiceMoodDetected}
      />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20 blur-3xl transition-all duration-700",
            currentMood === "angry" && "bg-red-400",
            currentMood === "happy" && "bg-yellow-400",
            currentMood === "sad" && "bg-blue-400",
            currentMood === "neutral" && "bg-slate-400",
          )}
        />
        <div
          className={cn(
            "absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl transition-all duration-700",
            currentMood === "angry" && "bg-orange-400",
            currentMood === "happy" && "bg-amber-400",
            currentMood === "sad" && "bg-indigo-400",
            currentMood === "neutral" && "bg-gray-400",
          )}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center mb-2">
            <Sparkles
              className={cn(
                "w-6 h-6 mr-2 transition-colors duration-500",
                currentMood === "angry" && "text-red-500",
                currentMood === "happy" && "text-yellow-500",
                currentMood === "sad" && "text-blue-500",
                currentMood === "neutral" && "text-slate-500",
              )}
            />
            <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              The Emotional Doorbell
            </h1>
            <Sparkles
              className={cn(
                "w-6 h-6 ml-2 transition-colors duration-500",
                currentMood === "angry" && "text-red-500",
                currentMood === "happy" && "text-yellow-500",
                currentMood === "sad" && "text-blue-500",
                currentMood === "neutral" && "text-slate-500",
              )}
            />
          </div>
          <p className="text-xl font-bold text-center text-gray-600 max-w-md">
            Ring the doorbell and let your mood shine through AI-powered emotion detection. Listen to terrible music.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="doorbell" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-white bg-opacity-70 backdrop-blur-md rounded-lg">
                <TabsTrigger value="doorbell" className="data-[state=active]:bg-white">
                  <Bell className="h-4 w-4 mr-2" />
                  Doorbell
                </TabsTrigger>
                <TabsTrigger value="camera" className="data-[state=active]:bg-white">
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </TabsTrigger>
              </TabsList>

              <TabsContent value="doorbell" className="mt-6">
                <Card className="p-8 border-0 shadow-lg bg-white bg-opacity-80 backdrop-blur-md">
                  <DoorbellButton isRinging={isRinging} onRing={handleRing} disabled={isDetecting} mood={currentMood} />

                  {isDetecting ? (
                    <div className="w-full mt-8">
                      <p className="text-center mb-3 text-gray-600 font-medium">Detecting mood...</p>
                      <Progress
                        value={detectionProgress}
                        className={cn(
                          "h-2 w-full transition-colors duration-500",
                          currentMood === "angry" && "bg-red-100",
                          currentMood === "happy" && "bg-yellow-100",
                          currentMood === "sad" && "bg-blue-100",
                          currentMood === "neutral" && "bg-slate-100",
                        )}
                      />
                    </div>
                  ) : (
                    <MoodDisplay mood={currentMood} confidence={lastConfidence} />
                  )}

                  <p className="text-center text-lg font-medium text-gray-700 mt-4">
                    get voice therapy 😃
                  </p>

                  <div className="flex items-center justify-between w-full mt-8">
                    <Badge variant="outline" className="text-sm px-3 py-1 bg-white">
                      Rings: {ringCount}
                    </Badge>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleMute}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                      className="bg-white"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="camera" className="mt-6">
                <div className="space-y-6">
                  <CameraFeed
                    onMoodDetected={handleMoodDetected}
                    isAnalyzing={isAnalyzingCamera}
                  />

                  <p className="text-center text-lg font-medium text-gray-700">
                    ur so ugly 😃
                  </p>

                  {capturedImage && (
                    <Card className="p-6 border-0 shadow-lg bg-white bg-opacity-80 backdrop-blur-md overflow-hidden">
                      <h3 className="text-lg font-medium mb-4 flex items-center text-gray-800">
                        <Smile className="h-5 w-5 mr-2" />
                        Captured Image
                      </h3>
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                        <img
                          src={capturedImage || "/placeholder.svg"}
                          alt="Captured face"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-3 italic">This image was used for mood detection.</p>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white bg-opacity-80 backdrop-blur-md overflow-hidden">
              <div
                className={cn(
                  "h-2 w-full transition-colors duration-500",
                  currentMood === "angry" && "bg-gradient-to-r from-red-400 to-orange-400",
                  currentMood === "happy" && "bg-gradient-to-r from-yellow-400 to-amber-400",
                  currentMood === "sad" && "bg-gradient-to-r from-blue-400 to-indigo-400",
                  currentMood === "neutral" && "bg-gradient-to-r from-slate-400 to-gray-400",
                )}
              />

              <div className="p-6">
                <MoodDisplay mood={currentMood} confidence={lastConfidence} />

                <div className="mt-8">
                  <div className="flex items-center mb-4">
                    <History className="h-4 w-4 mr-2 text-gray-500" />
                    <h3 className="font-medium text-gray-800">Mood History</h3>
                  </div>
                  <MoodHistory history={moodHistory} />
                </div>

                <div className="mt-8">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-4 w-4 mr-2 text-gray-500" />
                    <h3 className="font-medium text-gray-800">Mood Statistics</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">😠 Angry</span>
                        <span className="font-medium">{moodHistory.filter((m) => m === "angry").length}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 to-orange-400 transition-all duration-500"
                          style={{
                            width: `${moodHistory.length ? (moodHistory.filter((m) => m === "angry").length / moodHistory.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">😊 Happy</span>
                        <span className="font-medium">{moodHistory.filter((m) => m === "happy").length}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 transition-all duration-500"
                          style={{
                            width: `${moodHistory.length ? (moodHistory.filter((m) => m === "happy").length / moodHistory.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">😢 Sad</span>
                        <span className="font-medium">{moodHistory.filter((m) => m === "sad").length}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-500"
                          style={{
                            width: `${moodHistory.length ? (moodHistory.filter((m) => m === "sad").length / moodHistory.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {showInsult && <InsultPopup message={insultMessage} />}
    </main>
  )
}

