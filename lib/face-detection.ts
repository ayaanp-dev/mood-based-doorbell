import * as faceapi from 'face-api.js';

// Track model loading status
let modelsLoaded = false;

// Initialize and load the required models
export async function loadFaceDetectionModels() {
  try {
    // Skip if models are already loaded
    if (modelsLoaded) return true;
    
    // Load models from public directory
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    return false;
  }
}

// Map face-api expressions to our mood types
export function mapExpressionToMood(expressions: faceapi.FaceExpressions): 'angry' | 'happy' | 'sad' | 'neutral' {
  // Get the expression with the highest confidence
  const sortedExpressions = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
  const [topExpression] = sortedExpressions;
  
  // Map the expression to our mood types
  switch (topExpression[0]) {
    case 'angry':
      return 'angry';
    case 'happy':
      return 'happy';
    case 'sad':
    case 'fearful':
    case 'disgusted':
      return 'sad';
    default:
      return 'neutral';
  }
}

// Detect faces and expressions in an image
export async function detectFaceExpressions(imageData: string): Promise<{
  mood: 'angry' | 'happy' | 'sad' | 'neutral';
  confidence: number;
  faceDetected: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
}> {
  try {
    // Ensure models are loaded
    const modelsReady = await loadFaceDetectionModels();
    if (!modelsReady) {
      throw new Error('Face detection models failed to load');
    }
    
    // Create an HTML image element from the image data
    const img = new Image();
    img.src = imageData;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    
    // Detect all faces with expressions
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    
    // If no faces detected, return neutral mood
    if (!detections.length) {
      return {
        mood: 'neutral',
        confidence: 0,
        faceDetected: false
      };
    }
    
    // Get the face with the highest confidence
    const detection = detections[0];
    const mood = mapExpressionToMood(detection.expressions);
    
    // Get the confidence score for the detected mood
    const confidence = Object.entries(detection.expressions)
      .find(([expression]) => {
        if (mood === 'sad') {
          return ['sad', 'fearful', 'disgusted'].includes(expression);
        }
        return expression === mood;
      })?.[1] || 0;
    
    // Get the bounding box for the detected face
    const boundingBox = detection.detection.box;
    
    return {
      mood,
      confidence,
      faceDetected: true,
      boundingBox: {
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height
      }
    };
  } catch (error) {
    console.error('Error detecting face expressions:', error);
    return {
      mood: 'neutral',
      confidence: 0,
      faceDetected: false
    };
  }
}
