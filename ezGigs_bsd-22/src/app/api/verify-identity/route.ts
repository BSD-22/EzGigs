import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";
import { google } from "@google-cloud/vision/build/protos/protos";

// Define a type for facial ratios
type FacialRatios = {
  eyeToMouthRatio?: number;
  noseToMouthRatio?: number;
  faceShape?: number;
};

export async function POST(req: Request) {
  try {
    console.log("Starting identity verification process");
    const { faceImage, identityImage } = await req.json();

    console.log("Input validation:", {
      hasFaceImage: !!faceImage,
      hasIdentityImage: !!identityImage,
    });

    if (!faceImage || !identityImage) {
      console.log("Missing required images");
      return NextResponse.json({
        isMatch: false,
        message: "Both face and ID images are required",
      });
    }

    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}");
    const client = new vision.ImageAnnotatorClient({
      credentials: credentials,
    });
    console.log("Vision client initialized with credentials");

    const [faceResult] = await client.faceDetection({
      image: { content: faceImage.split(",")[1] },
    });

    const [idResult] = await client.faceDetection({
      image: { content: identityImage.split(",")[1] },
    });

    const faceFaces = faceResult.faceAnnotations;
    const idFaces = idResult.faceAnnotations;

    console.log("Face detection results:", {
      liveFaceDetected: faceFaces?.length ?? 0,
      idFaceDetected: idFaces?.length ?? 0,
    });

    if (!faceFaces || faceFaces.length !== 1) {
      return NextResponse.json({
        isMatch: false,
        message: "Please ensure your face is clearly visible in the camera",
      });
    }

    if (!idFaces || idFaces.length !== 1) {
      return NextResponse.json({
        isMatch: false,
        message: "Please ensure the face in your ID is clearly visible",
      });
    }

    const faceConfidence = faceFaces[0].detectionConfidence ?? 0;
    const idConfidence = idFaces[0].detectionConfidence ?? 0;

    const liveFace = faceFaces[0] as google.cloud.vision.v1.FaceAnnotation;
    const idFace = idFaces[0] as google.cloud.vision.v1.FaceAnnotation;

    // Cast landmarks to the correct type
    const liveLandmarks = liveFace.landmarks as google.cloud.vision.v1.FaceAnnotation.Landmark[];
    const idLandmarks = idFace.landmarks as google.cloud.vision.v1.FaceAnnotation.Landmark[];

    const similarityScore = calculateFaceSimilarity(liveFace, idFace);
    const landmarkSimilarity = calculateLandmarkSimilarity(liveLandmarks, idLandmarks);
    const facialRatiosSimilarity = calculateFacialRatios(liveLandmarks, idLandmarks);
    const rotationSimilarity = calculateRotationSimilarity(liveFace, idFace);
    const confidenceSimilarity = calculateConfidenceSimilarity(liveFace, idFace);

    // Combine all similarity scores into a final score
    const finalSimilarityScore = (similarityScore + landmarkSimilarity + facialRatiosSimilarity + rotationSimilarity + confidenceSimilarity) / 5;

    const isMatch = finalSimilarityScore > 0.76; // Adjusted threshold based on combined scores

    console.log("Verification result:", {
      isMatch,
      finalSimilarityScore,
      faceConfidence: liveFace.detectionConfidence,
      idConfidence: idFace.detectionConfidence,
    });

    return NextResponse.json({
      isMatch: isMatch && faceConfidence > 0.8 && idConfidence > 0.8, // Increased confidence thresholds
      message: isMatch ? "Identity verified successfully" : "Face verification failed. The live photo doesn't match the ID photo.",
    });
  } catch (error) {
    console.error("Verification error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        isMatch: false,
        message: "An error occurred during verification",
      },
      { status: 500 }
    );
  }
}

function calculateFaceSimilarity(face1: google.cloud.vision.v1.FaceAnnotation, face2: google.cloud.vision.v1.FaceAnnotation) {
  const landmarks1 = face1.landmarks as google.cloud.vision.v1.FaceAnnotation.Landmark[];
  const landmarks2 = face2.landmarks as google.cloud.vision.v1.FaceAnnotation.Landmark[];

  if (landmarks1.length !== landmarks2.length) {
    return 0;
  }

  // Calculate center for both faces
  const center1 = getCenterPoint(landmarks1);
  const center2 = getCenterPoint(landmarks2);

  let totalDistance = 0;
  let validLandmarks = 0;
  const keyPoints = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]); // Focus on key facial features

  const scale1 = getFaceScale(landmarks1); // Calculate scale for the first face
  const scale2 = getFaceScale(landmarks2); // Calculate scale for the second face
  const avgScale = (scale1 + scale2) / 2; // Average scale

  for (let i = 0; i < landmarks1.length; i++) {
    if (!keyPoints.has(i)) continue; // Only compare important landmarks

    const l1 = landmarks1[i]?.position;
    const l2 = landmarks2[i]?.position;

    if (!l1?.x || !l1?.y || !l1?.z || !l2?.x || !l2?.y || !l2?.z) {
      continue;
    }

    // Normalize positions by both center and scale
    const norm1 = {
      x: (l1.x - center1.x) / avgScale,
      y: (l1.y - center1.y) / avgScale,
      z: (l1.z - center1.z) / avgScale,
    };
    const norm2 = {
      x: (l2.x - center2.x) / avgScale,
      y: (l2.y - center2.y) / avgScale,
      z: (l2.z - center2.z) / avgScale,
    };

    // Use squared distance to emphasize larger differences
    const distance = Math.pow(norm1.x - norm2.x, 2) + Math.pow(norm1.y - norm2.y, 2) + Math.pow(norm1.z - norm2.z, 2);

    totalDistance += Math.sqrt(distance);
    validLandmarks++;
  }

  if (validLandmarks === 0) return 0;
  const avgDistance = totalDistance / validLandmarks;
  // Make the scoring more exponential
  return Math.pow(Math.max(0, 1 - avgDistance), 3);
}

function calculateLandmarkSimilarity(landmarks1: google.cloud.vision.v1.FaceAnnotation.Landmark[], landmarks2: google.cloud.vision.v1.FaceAnnotation.Landmark[]) {
  let totalDistance = 0;
  let validLandmarks = 0;
  const keyPoints = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]); // Focus on key facial features

  // Calculate center for both sets of landmarks
  const center1 = getCenterPoint(landmarks1);
  const center2 = getCenterPoint(landmarks2);

  const scale1 = getFaceScale(landmarks1); // Calculate scale for the first face
  const scale2 = getFaceScale(landmarks2); // Calculate scale for the second face
  const avgScale = (scale1 + scale2) / 2; // Average scale

  for (let i = 0; i < landmarks1.length; i++) {
    if (!keyPoints.has(i)) continue; // Only compare important landmarks

    const l1 = landmarks1[i]?.position;
    const l2 = landmarks2[i]?.position;

    if (!l1?.x || !l1?.y || !l1?.z || !l2?.x || !l2?.y || !l2?.z) {
      continue;
    }

    // Normalize positions by both center and scale
    const norm1 = {
      x: (l1.x - center1.x) / avgScale,
      y: (l1.y - center1.y) / avgScale,
      z: (l1.z - center1.z) / avgScale,
    };
    const norm2 = {
      x: (l2.x - center2.x) / avgScale,
      y: (l2.y - center2.y) / avgScale,
      z: (l2.z - center2.z) / avgScale,
    };

    // Use squared distance to emphasize larger differences
    const distance = Math.pow(norm1.x - norm2.x, 2) + Math.pow(norm1.y - norm2.y, 2) + Math.pow(norm1.z - norm2.z, 2);

    totalDistance += Math.sqrt(distance);
    validLandmarks++;
  }

  if (validLandmarks === 0) return 0;
  const avgDistance = totalDistance / validLandmarks;
  // Make the scoring more exponential
  return Math.pow(Math.max(0, 1 - avgDistance), 3);
}

// Update the function signature to use the new type
function getFacialRatios(landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]): FacialRatios {
  const getPoint = (idx: number) => landmarks[idx]?.position;

  // Get key points (assuming standard landmark indices)
  const leftEye = getPoint(1);
  const rightEye = getPoint(0);
  const nose = getPoint(2);
  const leftMouth = getPoint(4);
  const rightMouth = getPoint(3);

  if (!leftEye || !rightEye || !nose || !leftMouth || !rightMouth) {
    return {};
  }

  // Calculate key ratios
  if (leftEye && rightEye) {
    const eyeDistance = Math.sqrt(Math.pow((rightEye.x ?? 0) - (leftEye.x ?? 0), 2) + Math.pow((rightEye.y ?? 0) - (leftEye.y ?? 0), 2));

    if (leftMouth && rightMouth) {
      const mouthWidth = Math.sqrt(Math.pow((rightMouth.x ?? 0) - (leftMouth.x ?? 0), 2) + Math.pow((rightMouth.y ?? 0) - (leftMouth.y ?? 0), 2));

      const noseToMouthCenter = Math.sqrt(Math.pow((nose.x ?? 0) - ((leftMouth.x ?? 0) + (rightMouth.x ?? 0)) / 2, 2) + Math.pow((nose.y ?? 0) - ((leftMouth.y ?? 0) + (rightMouth.y ?? 0)) / 2, 2));

      return {
        eyeToMouthRatio: eyeDistance / mouthWidth,
        noseToMouthRatio: noseToMouthCenter / mouthWidth,
        faceShape: eyeDistance / noseToMouthCenter,
      };
    }
  }

  return {};
}

function calculateFacialRatios(landmarks1: google.cloud.vision.v1.FaceAnnotation.Landmark[], landmarks2: google.cloud.vision.v1.FaceAnnotation.Landmark[]) {
  const ratios1 = getFacialRatios(landmarks1);
  const ratios2 = getFacialRatios(landmarks2);

  let totalDiff = 0;
  let count = 0;

  const keys: (keyof FacialRatios)[] = ["eyeToMouthRatio", "noseToMouthRatio", "faceShape"];

  for (const key of keys) {
    if (key in ratios2) {
      const diff = Math.abs((ratios1[key] ?? 0) - (ratios2[key] ?? 0));
      totalDiff += diff;
      count++;
    }
  }

  if (count === 0) return 0;
  const avgDiff = totalDiff / count;
  return Math.pow(Math.max(0, 1 - avgDiff * 2), 2);
}

function calculateRotationSimilarity(face1: google.cloud.vision.v1.FaceAnnotation, face2: google.cloud.vision.v1.FaceAnnotation) {
  const angles1 = face1.rollAngle || 0;
  const angles2 = face2.rollAngle || 0;

  // Reduce rotation tolerance from 30 to 15 degrees
  const angleDiff = Math.abs(angles1 - angles2);
  return Math.max(0, 1 - angleDiff / 15);
}

function calculateConfidenceSimilarity(face1: google.cloud.vision.v1.FaceAnnotation, face2: google.cloud.vision.v1.FaceAnnotation) {
  const conf1 = face1.detectionConfidence || 0;
  const conf2 = face2.detectionConfidence || 0;
  return Math.min(conf1, conf2);
}

function getFaceScale(landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]) {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  landmarks.forEach((landmark) => {
    if (landmark.position?.x && landmark.position?.y) {
      minX = Math.min(minX, landmark.position.x);
      maxX = Math.max(maxX, landmark.position.x);
      minY = Math.min(minY, landmark.position.y);
      maxY = Math.max(maxY, landmark.position.y);
    }
  });

  return Math.max(maxX - minX, maxY - minY);
}

function getCenterPoint(landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]) {
  let sumX = 0,
    sumY = 0,
    sumZ = 0;
  let count = 0;

  landmarks.forEach((landmark) => {
    if (landmark.position?.x && landmark.position?.y && landmark.position?.z) {
      sumX += landmark.position.x;
      sumY += landmark.position.y;
      sumZ += landmark.position.z;
      count++;
    }
  });

  return {
    x: count > 0 ? sumX / count : 0,
    y: count > 0 ? sumY / count : 0,
    z: count > 0 ? sumZ / count : 0,
  };
}
