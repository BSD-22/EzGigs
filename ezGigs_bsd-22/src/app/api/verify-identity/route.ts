import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";
import { google } from "@google-cloud/vision/build/protos/protos";

// Define a type for facial ratios
type FacialRatios = {
  eyeToMouthRatio?: number;
  noseToMouthRatio?: number;
  faceShape?: number;
};

// Add these new types at the top
type AgeRange = {
  min: number;
  max: number;
};

// Add FaceMetrics type definition
type FaceMetrics = {
  distance: number;
  scale: number;
  blurScore: number;
  normalizedScore: number;
};

// Update the POST function to include new calculations
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

    const similarityScore = calculateEnhancedFaceSimilarity(liveFace, idFace, liveLandmarks, idLandmarks);
    const enhancedBlurScore1 = calculateEnhancedBlurScore(liveFace, liveLandmarks);
    const enhancedBlurScore2 = calculateEnhancedBlurScore(idFace, idLandmarks);

    // Adaptive blur threshold based on distance
    const metrics1 = calculateNormalizedDistance(liveLandmarks);
    const metrics2 = calculateNormalizedDistance(idLandmarks);
    const blurThreshold = Math.max(0.4, 0.5 - Math.abs(metrics1.normalizedScore - metrics2.normalizedScore) * 0.2);

    const isNotBlurred = enhancedBlurScore1 > blurThreshold && enhancedBlurScore2 > blurThreshold;
    const landmarkSimilarity = calculateLandmarkSimilarity(liveLandmarks, idLandmarks);
    const facialRatiosSimilarity = calculateFacialRatios(liveLandmarks, idLandmarks);
    const rotationSimilarity = calculateRotationSimilarity(liveFace, idFace);
    const confidenceSimilarity = calculateConfidenceSimilarity(liveFace, idFace);
    const eyeDistanceSimilarity = calculateEyeDistanceSimilarity(liveLandmarks, idLandmarks);
    const noseSimilarity = calculateNoseSimilarity(liveLandmarks, idLandmarks);
    const mouthSimilarity = calculateMouthSimilarity(liveLandmarks, idLandmarks);
    const facialSymmetrySimilarity = calculateFacialSymmetry(liveLandmarks, idLandmarks);

    // Weight the scores based on importance with enhanced weights
    const weightedScore =
      similarityScore * 0.3 + // Increased from 0.25
      landmarkSimilarity * 0.2 + // Increased from 0.15
      facialRatiosSimilarity * 0.15 + // Unchanged
      rotationSimilarity * 0.1 + // Unchanged
      confidenceSimilarity * 0.1 + // Unchanged
      eyeDistanceSimilarity * 0.08 + // Decreased from 0.10
      noseSimilarity * 0.03 + // Decreased from 0.05
      mouthSimilarity * 0.02 + // Decreased from 0.05
      facialSymmetrySimilarity * 0.02; // Decreased from 0.05

    // Enhanced blur handling
    const blurScore1 = calculateBlurScore(liveFace);
    const blurScore2 = calculateBlurScore(idFace);
    const ageSimilarity = calculateAgeRangeSimilarity(liveFace, idFace);

    // Enhanced match criteria
    const isMatch =
      weightedScore > 0.65 &&
      isNotBlurred &&
      ageSimilarity > 0.5 && // Add age similarity check
      rotationSimilarity > 0.7; // Ensure faces are not too rotated

    console.log("Verification result:", {
      isMatch,
      weightedScore,
      blurScores: {
        livePhoto: blurScore1,
        idPhoto: blurScore2,
      },
      ageSimilarity,
      scores: {
        similarityScore,
        landmarkSimilarity,
        facialRatiosSimilarity,
        rotationSimilarity,
        confidenceSimilarity,
        eyeDistanceSimilarity,
        noseSimilarity,
        mouthSimilarity,
        facialSymmetrySimilarity,
      },
    });

    console.log("Detailed Verification Analysis:", {
      isMatch,
      isNotBlurred,
      confidenceScores: {
        livePhotoConfidence: faceConfidence,
        idPhotoConfidence: idConfidence,
        confidenceThresholds: {
          live: 0.75,
          id: 0.7,
        },
      },
      blurAnalysis: {
        livePhoto: {
          score: blurScore1,
          isAcceptable: blurScore1 > 0.5,
          likelihood: liveFace.blurredLikelihood,
        },
        idPhoto: {
          score: blurScore2,
          isAcceptable: blurScore2 > 0.5,
          likelihood: idFace.blurredLikelihood,
        },
      },
      ageAnalysis: {
        liveFace: estimateAge(liveFace),
        idFace: estimateAge(idFace),
        similarityScore: ageSimilarity,
      },
      faceMetrics: {
        live: {
          eyeDistance: calculateEyeDistance(liveLandmarks),
          noseLength: calculateNoseLength(liveLandmarks),
          faceHeight: calculateFaceHeight(liveLandmarks),
          foreheadHeight: calculateForeheadHeight(liveLandmarks),
          scale: getFaceScale(liveLandmarks),
        },
        id: {
          eyeDistance: calculateEyeDistance(idLandmarks),
          noseLength: calculateNoseLength(idLandmarks),
          faceHeight: calculateFaceHeight(idLandmarks),
          foreheadHeight: calculateForeheadHeight(idLandmarks),
          scale: getFaceScale(idLandmarks),
        },
      },
      detailedScores: {
        similarityScore: {
          value: similarityScore,
          weight: 0.25,
          weightedValue: similarityScore * 0.25,
        },
        landmarkSimilarity: {
          value: landmarkSimilarity,
          weight: 0.15,
          weightedValue: landmarkSimilarity * 0.15,
        },
        facialRatiosSimilarity: {
          value: facialRatiosSimilarity,
          weight: 0.15,
          weightedValue: facialRatiosSimilarity * 0.15,
        },
        rotationSimilarity: {
          value: rotationSimilarity,
          weight: 0.1,
          weightedValue: rotationSimilarity * 0.1,
          angles: {
            live: liveFace.rollAngle || 0,
            id: idFace.rollAngle || 0,
          },
        },
        confidenceSimilarity: {
          value: confidenceSimilarity,
          weight: 0.1,
          weightedValue: confidenceSimilarity * 0.1,
        },
        eyeDistanceSimilarity: {
          value: eyeDistanceSimilarity,
          weight: 0.1,
          weightedValue: eyeDistanceSimilarity * 0.1,
        },
        noseSimilarity: {
          value: noseSimilarity,
          weight: 0.05,
          weightedValue: noseSimilarity * 0.05,
        },
        mouthSimilarity: {
          value: mouthSimilarity,
          weight: 0.05,
          weightedValue: mouthSimilarity * 0.05,
        },
        facialSymmetrySimilarity: {
          value: facialSymmetrySimilarity,
          weight: 0.05,
          weightedValue: facialSymmetrySimilarity * 0.05,
        },
      },
      finalScores: {
        rawWeightedScore: weightedScore,
        meetsBlurRequirement: isNotBlurred,
        meetsConfidenceRequirement: faceConfidence > 0.75 && idConfidence > 0.7,
        finalVerdict: isMatch && faceConfidence > 0.75 && idConfidence > 0.7,
      },
    });

    // Update the response to include more detailed information
    return NextResponse.json({
      isMatch: isMatch && faceConfidence > 0.5 && idConfidence > 0.7,
      message: !isNotBlurred
        ? "One or both images are too blurry. Please provide clearer images."
        : isMatch
        ? "Identity verified successfully"
        : "Face verification failed. The live photo doesn't match the ID photo.",
      scores: {
        total: weightedScore,
        blur: {
          livePhoto: blurScore1,
          idPhoto: blurScore2,
          threshold: 0.5,
        },
        ageSimilarity,
        confidence: {
          live: faceConfidence,
          id: idConfidence,
          thresholds: {
            live: 0.75,
            id: 0.7,
          },
        },
        individual: {
          similarityScore,
          landmarkSimilarity,
          facialRatiosSimilarity,
          rotationSimilarity,
          confidenceSimilarity,
          eyeDistanceSimilarity,
          noseSimilarity,
          mouthSimilarity,
          facialSymmetrySimilarity,
        },
      },
      thresholds: {
        weightedScore: 0.72,
        blur: 0.5,
        confidence: {
          live: 0.75,
          id: 0.7,
        },
      },
    });
  } catch (error) {
    console.error("Error during verification:", error);
    return NextResponse.json(
      {
        isMatch: false,
        message: "An error occurred during verification",
      },
      { status: 500 }
    );
  }
}

// Add these new functions
function calculateBlurScore(face: google.cloud.vision.v1.FaceAnnotation) {
  const blurLikelihood = face.blurredLikelihood || 0;
  // Convert likelihood to number (VERY_UNLIKELY = 0, VERY_LIKELY = 4)
  const blurScores: { [key: string]: number } = {
    VERY_UNLIKELY: 1.0,
    UNLIKELY: 0.75,
    POSSIBLE: 0.5,
    LIKELY: 0.25,
    VERY_LIKELY: 0,
  };

  return blurScores[blurLikelihood] || 0;
}

function estimateAge(face: google.cloud.vision.v1.FaceAnnotation): AgeRange {
  const landmarks = face.landmarks as google.cloud.vision.v1.FaceAnnotation.Landmark[];

  // Get facial proportions
  const eyeDistance = calculateEyeDistance(landmarks);
  const noseLength = calculateNoseLength(landmarks);
  const faceHeight = calculateFaceHeight(landmarks);
  const foreheadHeight = calculateForeheadHeight(landmarks);

  // Basic age estimation based on facial proportions
  let minAge = 18;
  let maxAge = 60;

  // Adjust age range based on facial features
  if (eyeDistance && noseLength && faceHeight) {
    const eyeToFaceRatio = eyeDistance / faceHeight;
    const noseToFaceRatio = noseLength / faceHeight;
    const foreheadRatio = foreheadHeight / faceHeight;

    // Children typically have larger eyes relative to face
    if (eyeToFaceRatio > 0.25) {
      minAge = 18;
      maxAge = 25;
    }
    // Mature adults typically have more pronounced nose
    else if (noseToFaceRatio > 0.3) {
      minAge = 30;
      maxAge = 50;
    }
    // Older adults often have different forehead proportions
    else if (foreheadRatio < 0.28) {
      minAge = 40;
      maxAge = 65;
    }
  }

  return { min: minAge, max: maxAge };
}

function calculateAgeRangeSimilarity(face1: google.cloud.vision.v1.FaceAnnotation, face2: google.cloud.vision.v1.FaceAnnotation): number {
  const age1 = estimateAge(face1);
  const age2 = estimateAge(face2);

  // Calculate overlap of age ranges
  const overlapStart = Math.max(age1.min, age2.min);
  const overlapEnd = Math.min(age1.max, age2.max);
  const overlap = Math.max(0, overlapEnd - overlapStart);

  // Calculate total range
  const totalRange = Math.max(age1.max, age2.max) - Math.min(age1.min, age2.min);

  return overlap / totalRange;
}

// Helper functions for age estimation
function calculateEyeDistance(landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]): number {
  const leftEye = landmarks[1]?.position;
  const rightEye = landmarks[0]?.position;
  if (!leftEye?.x || !rightEye?.x) return 0;
  return Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow((rightEye.y || 0) - (leftEye.y || 0), 2));
}

function calculateNoseLength(landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]): number {
  const noseBridge = landmarks[2]?.position;
  const noseBottom = landmarks[3]?.position;
  if (!noseBridge?.y || !noseBottom?.y) return 0;
  return Math.abs(noseBottom.y - noseBridge.y);
}

function calculateFaceHeight(landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]): number {
  let minY = Infinity;
  let maxY = -Infinity;

  landmarks.forEach((landmark) => {
    if (landmark.position?.y) {
      minY = Math.min(minY, landmark.position.y);
      maxY = Math.max(maxY, landmark.position.y);
    }
  });

  return maxY - minY;
}

function calculateForeheadHeight(landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]): number {
  const foreheadTop = landmarks[0]?.position;
  const eyebrowTop = landmarks[1]?.position;
  if (!foreheadTop?.y || !eyebrowTop?.y) return 0;
  return Math.abs(eyebrowTop.y - foreheadTop.y);
}

// Enhanced distance normalization
function calculateNormalizedDistance(landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]): FaceMetrics {
  const faceScale = getFaceScale(landmarks);

  let avgZDepth = 0;
  let zCount = 0;
  landmarks.forEach((landmark) => {
    if (landmark.position?.z) {
      avgZDepth += landmark.position.z;
      zCount++;
    }
  });
  const distance = zCount > 0 ? avgZDepth / zCount : 0;

  // Normalize the distance based on face scale
  const normalizedDistance = distance / faceScale;

  return {
    distance,
    scale: faceScale,
    blurScore: 0,
    normalizedScore: normalizedDistance,
  };
}

function calculateEnhancedFaceSimilarity(
  face1: google.cloud.vision.v1.FaceAnnotation,
  face2: google.cloud.vision.v1.FaceAnnotation,
  landmarks1: google.cloud.vision.v1.FaceAnnotation.Landmark[],
  landmarks2: google.cloud.vision.v1.FaceAnnotation.Landmark[]
): number {
  const metrics1 = calculateNormalizedDistance(landmarks1);
  const metrics2 = calculateNormalizedDistance(landmarks2);

  metrics1.blurScore = calculateEnhancedBlurScore(face1, landmarks1);
  metrics2.blurScore = calculateEnhancedBlurScore(face2, landmarks2);

  const distanceDiff = Math.abs(metrics1.normalizedScore - metrics2.normalizedScore);
  const distanceSimilarity = Math.max(0, 1 - distanceDiff);

  const scaleDiff = Math.abs(metrics1.scale - metrics2.scale) / Math.max(metrics1.scale, metrics2.scale);
  const scaleSimilarity = Math.max(0, 1 - scaleDiff);

  return distanceSimilarity * 0.4 + scaleSimilarity * 0.4 + Math.min(metrics1.blurScore, metrics2.blurScore) * 0.2;
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

// Add new similarity calculation functions
function calculateEyeDistanceSimilarity(landmarks1: google.cloud.vision.v1.FaceAnnotation.Landmark[], landmarks2: google.cloud.vision.v1.FaceAnnotation.Landmark[]) {
  const getEyeDistance = (landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]) => {
    const leftEye = landmarks[1]?.position;
    const rightEye = landmarks[0]?.position;
    if (!leftEye?.x || !rightEye?.x) return 0;
    return Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow((rightEye.y || 0) - (leftEye.y || 0), 2));
  };

  const distance1 = getEyeDistance(landmarks1);
  const distance2 = getEyeDistance(landmarks2);

  if (distance1 === 0 || distance2 === 0) return 0;
  const ratio = Math.min(distance1, distance2) / Math.max(distance1, distance2);
  return Math.pow(ratio, 2);
}

function calculateNoseSimilarity(landmarks1: google.cloud.vision.v1.FaceAnnotation.Landmark[], landmarks2: google.cloud.vision.v1.FaceAnnotation.Landmark[]) {
  const getNosePosition = (landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]) => {
    const noseTip = landmarks[2]?.position;
    const noseBottom = landmarks[3]?.position;
    if (!noseTip?.y || !noseBottom?.y) return 0;
    return Math.abs(noseTip.y - noseBottom.y);
  };

  const nose1 = getNosePosition(landmarks1);
  const nose2 = getNosePosition(landmarks2);

  if (nose1 === 0 || nose2 === 0) return 0;
  const ratio = Math.min(nose1, nose2) / Math.max(nose1, nose2);
  return Math.pow(ratio, 2);
}

function calculateMouthSimilarity(landmarks1: google.cloud.vision.v1.FaceAnnotation.Landmark[], landmarks2: google.cloud.vision.v1.FaceAnnotation.Landmark[]) {
  const getMouthWidth = (landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]) => {
    const leftMouth = landmarks[4]?.position;
    const rightMouth = landmarks[3]?.position;
    if (!leftMouth?.x || !rightMouth?.x) return 0;
    return Math.sqrt(Math.pow(rightMouth.x - leftMouth.x, 2) + Math.pow((rightMouth.y || 0) - (leftMouth.y || 0), 2));
  };

  const width1 = getMouthWidth(landmarks1);
  const width2 = getMouthWidth(landmarks2);

  if (width1 === 0 || width2 === 0) return 0;
  const ratio = Math.min(width1, width2) / Math.max(width1, width2);
  return Math.pow(ratio, 2);
}

function calculateFacialSymmetry(landmarks1: google.cloud.vision.v1.FaceAnnotation.Landmark[], landmarks2: google.cloud.vision.v1.FaceAnnotation.Landmark[]) {
  const getSymmetryScore = (landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]) => {
    const nose = landmarks[2]?.position;
    const leftEye = landmarks[1]?.position;
    const rightEye = landmarks[0]?.position;
    const leftMouth = landmarks[4]?.position;
    const rightMouth = landmarks[3]?.position;

    if (!nose?.x || !leftEye?.x || !rightEye?.x || !leftMouth?.x || !rightMouth?.x) return 0;

    const leftSide = Math.abs(nose.x - leftEye.x) + Math.abs(nose.x - leftMouth.x);
    const rightSide = Math.abs(nose.x - rightEye.x) + Math.abs(nose.x - rightMouth.x);

    return Math.min(leftSide, rightSide) / Math.max(leftSide, rightSide);
  };

  const symmetry1 = getSymmetryScore(landmarks1);
  const symmetry2 = getSymmetryScore(landmarks2);

  if (symmetry1 === 0 || symmetry2 === 0) return 0;
  return Math.abs(symmetry1 - symmetry2);
}

// Enhanced blur detection
function calculateEnhancedBlurScore(face: google.cloud.vision.v1.FaceAnnotation, landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]): number {
  const baseBlurScore = calculateBlurScore(face);
  const faceScale = getFaceScale(landmarks);
  const edgeSharpness = calculateEdgeSharpness(landmarks);

  // Adjust blur score based on face size and edge sharpness
  const adjustedScore = baseBlurScore * (0.7 + 0.3 * (edgeSharpness / faceScale));

  return Math.min(1, Math.max(0, adjustedScore));
}

function calculateEdgeSharpness(landmarks: google.cloud.vision.v1.FaceAnnotation.Landmark[]): number {
  let sharpnessScore = 0;
  let count = 0;

  const keyPoints = [
    [0, 1], // Eyes
    [2, 3], // Nose
    [3, 4], // Mouth
  ];

  for (const [p1, p2] of keyPoints) {
    const point1 = landmarks[p1]?.position;
    const point2 = landmarks[p2]?.position;

    if (point1 && point2) {
      const distance = Math.sqrt(Math.pow((point2.x || 0) - (point1.x || 0), 2) + Math.pow((point2.y || 0) - (point1.y || 0), 2));
      sharpnessScore += distance;
      count++;
    }
  }

  return count > 0 ? sharpnessScore / count : 0;
}
