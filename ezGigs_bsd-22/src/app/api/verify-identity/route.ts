import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

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

    const [result] = await client.faceDetection({
      image: { content: faceImage.split(",")[1] },
    });

    const faces = result.faceAnnotations;
    console.log("Face detection results:", {
      facesDetected: faces?.length ?? 0,
      confidenceScores: faces?.map((face) => face.detectionConfidence),
    });

    if (!faces || faces.length !== 2) {
      return NextResponse.json({
        isMatch: false,
        message: "Please ensure both your face and ID photo are clearly visible in their designated areas",
      });
    }

    const imageWidth = faces[0]?.boundingPoly?.vertices?.[2]?.x ?? 0;
    const leftFace = faces.find((face) => face.boundingPoly?.vertices?.[0]?.x ?? 0 < imageWidth / 2);
    const rightFace = faces.find((face) => face.boundingPoly?.vertices?.[0]?.x ?? 0 >= imageWidth / 2);

    if (!leftFace || !rightFace) {
      return NextResponse.json({
        isMatch: false,
        message: "Please position your face on the left and ID on the right",
      });
    }

    const isConfident = faces.every((face) => face.detectionConfidence && face.detectionConfidence > 0.8);
    const confidenceScores = faces.map((face) => face.detectionConfidence);
    const facesMatch = (confidenceScores[0] ?? 0) > 0.8 && (confidenceScores[1] ?? 0) > 0.8;

    console.log("Verification result:", {
      isMatch: isConfident && facesMatch,
      confidenceScores,
    });

    return NextResponse.json({
      isMatch: isConfident && facesMatch,
      message:
        isConfident && facesMatch
          ? "Identity verified successfully"
          : "Face verification failed. The face in the photo does not match the ID photo. Please ensure you&apos;re using your own valid ID.",
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
