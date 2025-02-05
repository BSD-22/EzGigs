"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState, useRef } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
import { TicketPurchase } from "@/db/models/ticket";

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TicketPurchase, "_id" | "ticketId" | "categoryName" | "seatNumber" | "price" | "paymentStatus" | "paymentIntentId" | "purchaseDate">) => Promise<void>;
  requiresVerification?: boolean;
}

export default function TicketPurchaseModal({ isOpen, onClose, onSubmit, requiresVerification = false }: TicketPurchaseModalProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);
  const [captureStep, setCaptureStep] = useState<"face" | "id" | null>(null);
  const [verificationImages, setVerificationImages] = useState({
    face: "",
    identity: "",
  });
  const [buyerData, setBuyerData] = useState({
    buyerEmail: "",
    buyerName: "",
    buyerPhone: "",
    identityType: "KTP" as TicketPurchase["identityType"],
    identityDetails: "",
  });

  const handleOpenCamera = () => {
    setShowCamera(true);
    setCaptureStep("face");
    setVerificationImages({ face: "", identity: "" });
  };

  const verifyIdentity = async (faceImage: string, identityImage: string) => {
    try {
      const verifyRes = await fetch("/api/verify-identity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faceImage,
          identityImage,
        }),
      });

      const result = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error("API request failed");
      }

      return result;
    } catch (error) {
      console.error("Error in verifyIdentity:", error);
      return { isMatch: false, message: "Network error occurred" };
    }
  };

  const getVerificationInstructions = () => {
    if (captureStep === "face") {
      return "Take a clear selfie of your face";
    }

    switch (buyerData.identityType) {
      case "KTP":
        return "Show your KTP clearly to the camera";
      case "SIM":
        return "Show your Driver's License (SIM) clearly to the camera";
      case "Student":
        return "Show your Student ID Card clearly to the camera";
      case "Passport":
        return "Show your Passport's photo page clearly to the camera";
      default:
        return "Show your ID card clearly to the camera";
    }
  };

  const handleCapturePhoto = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error("Failed to capture photo. Please try again.");
      return;
    }

    if (captureStep === "face") {
      setVerificationImages((prev) => ({ ...prev, face: imageSrc }));
      setCaptureStep("id");
      toast.info("Great! Now please show your ID card");
      return;
    }

    if (captureStep === "id") {
      setIsVerifying(true);
      setVerificationMessage("Verifying your identity...");

      try {
        const result = await verifyIdentity(verificationImages.face, imageSrc);

        if (result.isMatch) {
          setIsIdentityVerified(true);
          setBuyerData((prev) => ({ ...prev, identityDetails: verificationImages.face }));
          toast.success("Identity verified successfully!");
          setShowCamera(false);
          setCaptureStep(null);
        } else {
          setIsIdentityVerified(false);
          setVerificationImages({ face: "", identity: "" });
          setCaptureStep("face");
          toast.error(result.message || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during verification:", error);
        setIsIdentityVerified(false);
        setVerificationImages({ face: "", identity: "" });
        setCaptureStep("face");
        toast.error("Verification failed. Please try again.");
      } finally {
        setIsVerifying(false);
        setVerificationMessage("");
      }
    }
  };

  const handleSubmit = async () => {
    if (requiresVerification && !isIdentityVerified) {
      toast.error("Please complete identity verification first");
      return;
    }

    if (!buyerData.buyerEmail || !buyerData.buyerName || !buyerData.buyerPhone || (requiresVerification && !buyerData.identityDetails)) {
      toast.error("Please provide all required information");
      return;
    }

    try {
      await onSubmit(buyerData);
    } catch (error) {
      console.error("Error submitting purchase:", error);
      toast.error("Failed to process purchase. Please try again.");
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="relative z-50">
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-3xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <DialogTitle className="text-2xl font-bold text-[#2C3228] mb-6 sticky top-0 bg-white">Complete Your Booking</DialogTitle>

              <div className="space-y-5">
                {/* Form fields */}
                <div>
                  <label className="block text-sm font-medium text-[#4A5043] mb-2">Name</label>
                  <input
                    type="text"
                    value={buyerData.buyerName}
                    onChange={(e) => setBuyerData((prev) => ({ ...prev, buyerName: e.target.value }))}
                    className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A5043] mb-2">Email</label>
                  <input
                    type="email"
                    value={buyerData.buyerEmail}
                    onChange={(e) => setBuyerData((prev) => ({ ...prev, buyerEmail: e.target.value }))}
                    className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A5043] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={buyerData.buyerPhone}
                    onChange={(e) => setBuyerData((prev) => ({ ...prev, buyerPhone: e.target.value }))}
                    className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Add Identity Type dropdown */}
                <div>
                  <label className="block text-sm font-medium text-[#4A5043] mb-2">Identity Type</label>
                  <select
                    value={buyerData.identityType}
                    onChange={(e) => setBuyerData((prev) => ({ ...prev, identityType: e.target.value as TicketPurchase["identityType"] }))}
                    className="w-full bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl px-4 py-3 text-[#2C3228] focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all">
                    <option value="KTP">KTP</option>
                    <option value="SIM">SIM</option>
                    <option value="Student">Student ID</option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>

                {requiresVerification && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-[#4A5043] mb-2">Identity Verification</label>
                    {buyerData.identityDetails ? (
                      <div className="relative">
                        <Image
                          width={400}
                          height={300}
                          src={buyerData.identityDetails}
                          alt="Identity verification photo"
                          className="w-full rounded-xl"
                        />
                        <button
                          onClick={() => {
                            setBuyerData((prev) => ({ ...prev, identityDetails: "" }));
                            setIsIdentityVerified(false);
                          }}
                          className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-colors">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleOpenCamera}
                        className="w-full px-4 py-3 bg-[#4A5043] text-white rounded-xl hover:bg-[#2C3228] transition-colors">
                        Take Verification Photo
                      </button>
                    )}
                  </div>
                )}

                {/* Submit buttons */}
                <div className="flex gap-3 mt-8 sticky bottom-0 bg-white pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-[#D3D9C9] rounded-xl text-[#4A5043] hover:bg-[#F4F6F0] transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      requiresVerification
                        ? !isIdentityVerified || !buyerData.buyerEmail || !buyerData.buyerName || !buyerData.buyerPhone || isVerifying
                        : !buyerData.buyerEmail || !buyerData.buyerName || !buyerData.buyerPhone
                    }
                    className="flex-1 px-4 py-3 bg-[#4A5043] text-white rounded-xl hover:bg-[#2C3228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isVerifying ? "Verifying..." : "Continue to Payment"}
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog
        open={showCamera}
        onClose={() => setShowCamera(false)}
        className="relative z-50">
        <div
          className="fixed inset-0 bg-black/70"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <DialogTitle
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {captureStep === "face" ? "Take a Selfie" : `Show Your ${buyerData.identityType}`}
            </DialogTitle>
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-4">{getVerificationInstructions()}</p>
              <div className="text-sm text-gray-600 mb-4">
                <p className="font-medium">Instructions:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Position your face clearly in the frame</li>
                  <li>Ensure good lighting and clear visibility</li>
                  <li>Keep steady while taking the photo</li>
                  <li>Make sure your {buyerData.identityType} is clearly visible</li>
                </ul>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              {verificationMessage && <p className="mt-2 text-sm text-gray-500">{verificationMessage}</p>}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-[#4A5043] px-4 py-2 text-sm font-medium text-white hover:bg-[#2C3228] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={handleCapturePhoto}>
                {isVerifying ? "Verifying..." : "Take Photo"}
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => setShowCamera(false)}>
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
