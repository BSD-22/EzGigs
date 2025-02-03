import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center bg-white relative overflow-hidden">
        {/* Hero Section */}
        <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg p-12 text-center my-12 mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900">
              All in one place to production
            </h1>
            <h1 className="text-3xl font-semibold text-gray-800 mt-2">
              or selling ticket online
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover 30+ Ticket online to organize work and life, saving you
              valuable time.
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <button className="bg-[#7aa3a9] border border-gray-300 px-8 py-4 rounded-xl text-black hover:bg-gray-100 font-bold">
                Get Started
              </button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
            <div className="bg-[#7aa3a9] shadow-lg rounded-2xl p-8 w-full max-w-sm">
              <h3 className="font-semibold text-xl mb-3">Journal</h3>
              <p className="text-sm text-gray-500">
                Organize your thoughts & reflections.
              </p>
            </div>
            <div className="bg-[#7aa3a9] shadow-lg rounded-2xl p-8 w-full max-w-sm">
              <h3 className="font-semibold text-xl mb-3">Habit Tracker</h3>
              <p className="text-sm text-gray-500">
                Build better habits and stay consistent.
              </p>
            </div>
            <div className="bg-[#7aa3a9] shadow-lg rounded-2xl p-8 w-full max-w-sm">
              <h3 className="font-semibold text-xl mb-3">Book Tracker</h3>
              <p className="text-sm text-gray-500">
                Keep track of your reading progress.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-8 text-center my-12 mx-auto">
          <h1 className="text-4xl font-bold mb-4">Your Second Brain</h1>
          <p className="text-gray-600 text-lg mb-6">
            An all-in-one Notion system to organize your tasks, projects, goals,
            notes, and references.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-black border border-gray-300 px-6 py-3 rounded-xl text-white hover:bg-gray-800 font-bold">
              Learn More
            </button>
            <button className="bg-white border border-gray-300 px-6 py-3 rounded-xl text-black hover:bg-gray-100 font-bold">
              Get Ticket
            </button>
          </div>
          <div className="mt-8">
            <img
              src="your-image-url.png"
              alt="Second Brain UI"
              className="rounded-xl shadow-lg mx-auto w-full max-w-lg"
            />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
