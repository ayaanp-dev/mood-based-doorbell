import { cn } from "@/lib/utils"
import type { Mood } from "@/app/page"

interface MoodHistoryProps {
  history: Mood[]
}

export default function MoodHistory({ history }: MoodHistoryProps) {
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

  // Get background color based on mood
  const getBackgroundColor = (mood: Mood) => {
    switch (mood) {
      case "angry":
        return "bg-red-50 border-red-200"
      case "happy":
        return "bg-yellow-50 border-yellow-200"
      case "sad":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-slate-50 border-slate-200"
    }
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <p className="text-sm">No mood history yet</p>
        <p className="text-xs mt-1">Ring the doorbell to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {history.map((mood, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center p-3 rounded-lg border transition-all duration-300 hover:shadow-md",
            getBackgroundColor(mood),
          )}
        >
          <div className="flex-shrink-0 text-2xl mr-3">{getMoodEmoji(mood)}</div>
          <div className="flex-grow">
            <p className="font-medium capitalize text-gray-800">{mood}</p>
            <p className="text-xs text-gray-500">
              {new Date(Date.now() - index * 60000).toLocaleTimeString()} {/* Fake timestamps */}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

