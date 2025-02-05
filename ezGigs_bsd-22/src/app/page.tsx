import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="bg-white">
      {/* Top Links Section */}
      <div className="max-w-[1152px] mx-auto px-4 md:px-8">
        <div className="py-2 flex items-center justify-end gap-2 md:gap-3 text-[10px] md:text-xs">
          <Link
            href={"/"}
            className="text-black font-semibold">
            About Us
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={"/"}
            className="text-black font-semibold">
            Help
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={"/register"}
            className="text-black font-semibold">
            Join Us
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={"/login"}
            className="text-black font-semibold">
            Sign In
          </Link>
        </div>
      </div>

      <Navbar />

      <div className="min-h-screen flex flex-col mt-8">
        {/* Hero Section */}
        <div className="max-w-[1152px] mx-auto w-full px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-[28px] md:text-[50px] font-bold text-gray-900 leading-tight">Your Gateway to Live Concert Experiences</h1>
              <p className="mt-4 text-base md:text-lg text-gray-600 font-semibold">
                Easily buy & sell concert tickets in Indonesia&apos;s most secure marketplace. Join thousands of music enthusiasts making unforgettable memories.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a
                  href="#production-section"
                  className="bg-[#7aa3a9] px-8 py-3 rounded-xl text-white font-bold text-center w-full sm:w-auto">
                  Get Started
                </a>
                <a
                  href="#see-more"
                  className="bg-white border border-gray-300 px-4 py-3 rounded-xl text-black hover:bg-gray-100 font-bold text-center w-full sm:w-auto">
                  See More
                </a>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 mt-8 md:mt-0">
              <Image
                width={600}
                height={400}
                src="https://ik.imagekit.io/3a0xukows/poster%20fix.jpg?updatedAt=1738613982757"
                alt="poster"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
            {/* Card 1 - AI Analytics */}
            <div className="group">
              <div className="h-full bg-[#7aa3a9]/15 rounded-2xl p-8 ring-[0.5px] ring-[#7aa3a9]/30 transition-all duration-500 group-hover:ring-[#7aa3a9] group-hover:shadow-[0_0_20px_rgba(122,163,169,0.6)] shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-br from-[#7aa3a9] to-[#96c1c7] rounded-xl p-3 w-fit">
                    <Image
                      width={200}
                      height={200}
                      src="https://ik.imagekit.io/3a0xukows/ai%20(1).png?updatedAt=1738636951973"
                      alt="AI"
                      className="w-8 h-8 filter brightness-0 invert"
                    />
                  </div>
                  <span className="px-3 py-1 text-xs font-medium text-[#7aa3a9] bg-[#7aa3a9]/10 rounded-full">Smart Analytics</span>
                </div>

                <h3 className="mt-4 text-2xl font-bold text-[#2c3e50]">Ticket Intelligence</h3>

                <p className="mt-4 text-[#5d7285] text-sm leading-relaxed">Supercharge your ticket sales with AI:</p>

                <ul className="mt-4 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#5d7285]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7aa3a9]/10">
                      <span className="text-[#7aa3a9]">📊</span>
                    </div>
                    Real-time sales performance insights
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[#5d7285]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7aa3a9]/10">
                      <span className="text-[#7aa3a9]">🎯</span>
                    </div>
                    Smart pricing recommendations
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[#5d7285]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7aa3a9]/10">
                      <span className="text-[#7aa3a9]">📈</span>
                    </div>
                    Predictive demand forecasting
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2 - Secure Payment */}
            <div className="group">
              <div className="h-full bg-[#7aa3a9]/15 rounded-2xl p-8 ring-[0.5px] ring-[#7aa3a9]/30 transition-all duration-500 group-hover:ring-[#7aa3a9] group-hover:shadow-[0_0_20px_rgba(122,163,169,0.6)] shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-br from-[#7aa3a9] to-[#96c1c7] rounded-xl p-3 w-fit">
                    <Image
                      width={200}
                      height={200}
                      src="https://ik.imagekit.io/3a0xukows/face-recognition.png?updatedAt=1738637304014"
                      alt="Face Recognition"
                      className="w-8 h-8 filter brightness-0 invert"
                    />
                  </div>
                  <span className="px-3 py-1 text-xs font-medium text-[#7aa3a9] bg-[#7aa3a9]/10 rounded-full">Secure Pay</span>
                </div>

                <h3 className="mt-4 text-2xl font-bold text-[#2c3e50]">FacePay Verified</h3>

                <p className="mt-4 text-[#5d7285] text-sm leading-relaxed">Next-gen payment security system:</p>

                <ul className="mt-4 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#5d7285]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7aa3a9]/10">
                      <span className="text-[#7aa3a9]">🤳</span>
                    </div>
                    Instant ID verification with selfie
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[#5d7285]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7aa3a9]/10">
                      <span className="text-[#7aa3a9]">🔐</span>
                    </div>
                    Biometric payment authentication
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[#5d7285]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7aa3a9]/10">
                      <span className="text-[#7aa3a9]">✨</span>
                    </div>
                    Fraud-proof transaction system
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3 - Venue Finder */}
            <div className="group">
              <div className="h-full bg-[#7aa3a9]/15 rounded-2xl p-8 ring-[0.5px] ring-[#7aa3a9]/30 transition-all duration-500 group-hover:ring-[#7aa3a9] group-hover:shadow-[0_0_20px_rgba(122,163,169,0.6)] shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-br from-[#7aa3a9] to-[#96c1c7] rounded-xl p-3 w-fit">
                    <Image
                      width={200}
                      height={200}
                      src="https://ik.imagekit.io/3a0xukows/google-maps.png?updatedAt=1738636974442"
                      alt="gps"
                      className="w-8 h-8 filter brightness-0 invert"
                    />
                  </div>
                  <span className="px-3 py-1 text-xs font-medium text-[#7aa3a9] bg-[#7aa3a9]/10 rounded-full">Smart Locator</span>
                </div>

                <h3 className="mt-4 text-2xl font-bold text-[#2c3e50]">Perfect Venue Finder</h3>

                <p className="mt-4 text-[#5d7285] text-sm leading-relaxed">Find your ideal concert venue:</p>

                <ul className="mt-4 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#5d7285]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7aa3a9]/10">
                      <span className="text-[#7aa3a9]">🎭</span>
                    </div>
                    Smart venue recommendations
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[#5d7285]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7aa3a9]/10">
                      <span className="text-[#7aa3a9]">📍</span>
                    </div>
                    Capacity & accessibility info
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[#5d7285]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7aa3a9]/10">
                      <span className="text-[#7aa3a9]">💫</span>
                    </div>
                    Virtual venue tour available
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Production Section */}
        <div
          id="production-section"
          className="max-w-[1152px] mx-auto w-full mt-12 scroll-mt-24">
          <h1 className="text-[32px] md:text-[50px] font-bold text-black text-center leading-tight">Your Ticket Online</h1>
          <h1 className="text-[32px] md:text-[50px] font-bold text-black text-center mb-2 leading-tight">Production</h1>
          <p className="text-base md:text-lg text-gray-600 text-center px-4">Find festival, concert, and workshop or Make own</p>
          <p className="text-base md:text-lg text-gray-600 text-center mb-6 px-4">ticket production to manage your event.</p>
          <div className="flex justify-center px-4">
            <Link href="/login">
              <button className="bg-[#7aa3a9] px-8 py-3 rounded-xl text-white font-bold w-full sm:w-auto">Start Here</button>
            </Link>
          </div>
          <div className="mt-8 flex justify-center">
            <Image
              width={200}
              height={200}
              src="https://ik.imagekit.io/3a0xukows/iphone-gigs.png?updatedAt=1738649997632"
              alt="iphone-gigs"
              className="w-60 md:w-80"
            />
          </div>
        </div>

        {/* See More Section */}
        <div
          id="see-more"
          className="max-w-[1152px] mx-auto w-full mt-12 scroll-mt-24">
          <h1 className="text-[32px] md:text-[50px] font-bold text-black text-center leading-tight">Looking for Upcoming</h1>
          <h1 className="text-[32px] md:text-[50px] font-bold text-black text-center leading-tight">events</h1>
          <p className="text-base md:text-lg text-gray-600 text-center px-4">See all lists of upcoming and ongoing events</p>
          <p className="text-base md:text-lg text-gray-600 text-center px-4">on your home page.</p>
          <div className="flex justify-center mt-8 px-4">
            <Image
              width={200}
              height={200}
              src="https://ik.imagekit.io/3a0xukows/home%20jpg.jpg?updatedAt=1738654384612"
              alt="home"
              className="w-full md:w-[600px]"
            />
          </div>
        </div>

        {/* Marketplace Section */}
        <div className="max-w-[1152px] mx-auto w-full mt-12 mb-12">
          <h1 className="text-[32px] md:text-[50px] font-bold text-black text-center leading-tight">Sell your tickets on the</h1>
          <h1 className="text-[32px] md:text-[50px] font-bold text-black text-center leading-tight">marketplace</h1>
          <p className="text-base md:text-lg text-gray-600 text-center px-4">Create your own event tickets or</p>
          <p className="text-base md:text-lg text-gray-600 text-center px-4">sell concert tickets you own to others.</p>
          <div className="flex justify-center mt-8 px-4">
            <Image
              width={200}
              height={200}
              src="https://ik.imagekit.io/3a0xukows/fix.jpg?updatedAt=1738661044352"
              alt="marketplace"
              className="w-full md:w-[700px]"
            />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
