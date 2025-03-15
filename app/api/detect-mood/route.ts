import { type NextRequest, NextResponse } from "next/server"
import { detectFaceExpressions } from "@/lib/face-detection"

export async function POST(request: NextRequest) {
  try {
    // Get the image data from the request
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    // Detect face expressions in the image
    const result = await detectFaceExpressions(imageData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in detect-mood API:", error)
    return NextResponse.json({ error: "Failed to detect mood" }, { status: 500 })
  }
}

