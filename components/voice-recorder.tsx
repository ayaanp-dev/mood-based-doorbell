"use client"

import { useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"

interface VoiceRecorderProps {
  isRecording: boolean
  onRecordingComplete: (mood: string) => void
}

export default function VoiceRecorder({ isRecording, onRecordingComplete }: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (isRecording) {
      startRecording()
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        await detectMood(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()

      // Record for 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop()
        }
      }, 5000)
    } catch (err) {
      console.error("Error accessing microphone:", err)
    }
  }

  const detectMood = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.wav')

      const response = await fetch('https://mood-based-doorbell-backend.onrender.com/detect-voice-mood', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      onRecordingComplete(data.mood)
    } catch (err) {
      console.error("Error detecting mood:", err)
      onRecordingComplete('happy') // fallback to happy on error
    }
  }

  return (
    isRecording ? (
      <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-sm text-gray-600">Recording voice...</span>
        </div>
        <Progress value={100} className="mt-2" />
      </div>
    ) : null
  )
}