import { cn } from "@/lib/utils"
import type { Mood } from "@/app/page"

interface MoodDisplayProps {
  mood: Mood
  confidence?: number
}

export default function MoodDisplay({ mood, confidence = 0 }: MoodDisplayProps) {
  const getMoodEmoji = (mood: Mood) => {
    switch (mood) {
      case "angry":
        return "😠"
      case "happy":
        return "😊"
      case "sad":
        return "😢"
      default:
        return "😐"
    }
  }

  const getMoodText = (mood: Mood) => {
    switch (mood) {
      case "angry":
        return "Someone's grumpy! Let's rock out."
      case "happy":
        return "Wow, someone's cheerful! Kazoo time!"
      case "sad":
        return "Aww, cheer up! Here's a sad trombone."
      default:
        return "Ring the doorbell to detect a mood!"
    }
  }

  const getMoodSound = (mood: Mood) => {
    switch (mood) {
      case "angry":
        return "Heavy Metal"
      case "happy":
        return "Kazoo 'Happy Birthday'"
      case "sad":
        return "Sad Trombone"
      default:
        return "Standard Doorbell"
    }
  }

  // Get gradient based on mood
  const getGradient = () => {
    switch (mood) {
      case "angry":
        return "bg-gradient-to-r from-red-400 to-orange-400"
      case "happy":
        return "bg-gradient-to-r from-yellow-400 to-amber-400"
      case "sad":
        return "bg-gradient-to-r from-blue-400 to-indigo-400"
      default:
        return "bg-gradient-to-r from-slate-400 to-gray-400"
    }
  }

  // Format confidence as percentage
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  }

  return (
    <div className="text-center w-full">
      <div
        className={cn(
          "text-7xl mb-4 transition-all duration-500 transform hover:scale-110",
          mood !== "neutral" && "animate-bounce",
        )}
      >
        {getMoodEmoji(mood)}
      </div>

      <h2
        className={cn(
          "text-2xl font-bold mb-3 bg-clip-text text-transparent transition-colors duration-500",
          mood === "angry" && "bg-gradient-to-r from-red-600 to-orange-600",
          mood === "happy" && "bg-gradient-to-r from-yellow-600 to-amber-600",
          mood === "sad" && "bg-gradient-to-r from-blue-600 to-indigo-600",
          mood === "neutral" && "bg-gradient-to-r from-slate-700 to-gray-700",
        )}
      >
        {mood !== "neutral" ? `Mood: ${mood.charAt(0).toUpperCase() + mood.slice(1)}` : "No Mood Detected"}
      </h2>

      <p className="text-gray-600 mb-5">{getMoodText(mood)}</p>

      {mood !== "neutral" && (
        <div className="space-y-3">
          {confidence > 0 && (
            <div className="flex items-center justify-center mb-3">
              <div className="bg-gray-100 rounded-full h-2 w-32 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    mood === "angry" && "bg-gradient-to-r from-red-400 to-orange-400",
                    mood === "happy" && "bg-gradient-to-r from-yellow-400 to-amber-400",
                    mood === "sad" && "bg-gradient-to-r from-blue-400 to-indigo-400",
                  )}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 ml-2">Confidence: {formatConfidence(confidence)}</span>
            </div>
          )}

          <div
            className={cn(
              "px-4 py-2 rounded-full text-sm inline-flex items-center text-white shadow-md",
              getGradient(),
            )}
          >
            <span className="mr-2">🔊</span> Now Playing: {getMoodSound(mood)}
          </div>
        </div>
      )}
    </div>
  )
}

