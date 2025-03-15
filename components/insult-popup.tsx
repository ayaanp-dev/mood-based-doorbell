"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface InsultPopupProps {
  message: string
}

export default function InsultPopup({ message }: InsultPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setIsVisible(true)

    // Animate out before component unmounts
    const timeout = setTimeout(() => {
      setIsVisible(false)
    }, 3500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      )}
    >
      <Card className="bg-gradient-to-r from-red-100 to-orange-100 border-red-300 p-5 flex items-center shadow-xl max-w-md rounded-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        <div className="bg-red-50 p-2 rounded-full mr-4">
          <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
        </div>
        <div>
          <p className="font-bold text-red-800 mb-1">Excessive Ringing Detected!</p>
          <p className="text-red-700">{message}</p>
        </div>
      </Card>
    </div>
  )
}

