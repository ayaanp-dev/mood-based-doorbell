"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mood } from "@/app/page"

interface DoorbellButtonProps {
  isRinging: boolean
  onRing: () => void
  disabled?: boolean
  mood: Mood
}

export default function DoorbellButton({ isRinging, onRing, disabled = false, mood }: DoorbellButtonProps) {
  const [ringAnimation, setRingAnimation] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(false)

  useEffect(() => {
    if (isRinging) {
      setRingAnimation(true)
      const timeout = setTimeout(() => {
        setRingAnimation(false)
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [isRinging])

  // Add subtle pulse animation when not ringing
  useEffect(() => {
    if (!isRinging && !disabled) {
      const interval = setInterval(() => {
        setPulseAnimation(true)
        setTimeout(() => setPulseAnimation(false), 1500)
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [isRinging, disabled])

  // Get gradient based on mood
  const getGradient = () => {
    switch (mood) {
      case "angry":
        return "bg-gradient-to-br from-red-400 to-orange-500"
      case "happy":
        return "bg-gradient-to-br from-yellow-400 to-amber-500"
      case "sad":
        return "bg-gradient-to-br from-blue-400 to-indigo-500"
      default:
        return "bg-gradient-to-br from-slate-400 to-gray-500"
    }
  }

  // Get hover gradient based on mood
  const getHoverGradient = () => {
    switch (mood) {
      case "angry":
        return "hover:from-red-500 hover:to-orange-600"
      case "happy":
        return "hover:from-yellow-500 hover:to-amber-600"
      case "sad":
        return "hover:from-blue-500 hover:to-indigo-600"
      default:
        return "hover:from-slate-500 hover:to-gray-600"
    }
  }

  const handleClick = () => {
    if (!disabled) {
      onRing()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="relative">
        {/* Pulse effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full opacity-0 transition-opacity duration-1000",
            pulseAnimation && "opacity-70 animate-ping",
            getGradient(),
          )}
        />

        {/* Shadow ring */}
        <div
          className={cn("absolute inset-0 rounded-full blur-md opacity-30 transition-all duration-500", getGradient())}
        />

        <Button
          size="lg"
          className={cn(
            "h-40 w-40 rounded-full transition-all duration-300 shadow-lg relative overflow-hidden border-4 border-white",
            getGradient(),
            getHoverGradient(),
            ringAnimation && "animate-bounce scale-105",
            disabled && "opacity-70 cursor-not-allowed",
          )}
          onClick={handleClick}
          disabled={disabled}
        >
          <Bell
            className={cn(
              "h-16 w-16 text-white transition-all",
              ringAnimation && "animate-[wiggle_0.5s_ease-in-out_infinite]",
            )}
          />

          {ringAnimation && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute h-full w-full bg-white opacity-20 animate-ping rounded-full"></div>
            </div>
          )}
        </Button>
      </div>

      <p
        className={cn(
          "mt-6 text-xl font-medium transition-colors duration-500",
          disabled ? "text-gray-400" : "text-gray-700",
        )}
      >
        {disabled ? "Detecting..." : "Ring Me!"}
      </p>
    </div>
  )
}

