import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <>
      <div className="py-2 bg-white">
        <div className="flex items-center justify-end gap-3 max-w-6xl mx-auto">
          <Link href={"/about-us"} className="text-black font-semibold text-xs">
            About Us
          </Link>
          <span>|</span>
          <Link
            href={"/help-centre"}
            className="text-black font-semibold text-xs"
          >
            Help
          </Link>
          <span>|</span>
          <Link href={"/register"} className="text-black font-semibold text-xs">
            Join Us
          </Link>
          <span>|</span>
          <Link href={"/login"} className="text-black font-semibold text-xs">
            Sign In
          </Link>
        </div>
      </div>
      <Navbar />
      <div className="min-h-screen flex flex-col justify-center bg-white relative overflow-hidden">
        {/* Hero Section */}
        <div className="max-w-6xl w-full border border-1 rounded-2xl shadow-lg p-12 my-12 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
              <h1 className="text-[50px] font-bold text-gray-900">
                All in one place to production & selling ticket online
              </h1>

              <p className="mt-4 text-lg text-gray-600 font-semibold">
                Discover more than 100+ Ticket online, to manage your ticket
                production, and ease of getting an event ticket.
              </p>
              <div className="mt-8 flex gap-4 justify-center md:justify-start">
                <a
                  href="#production-section"
                  className="bg-[#7aa3a9] border border-gray-300 px-8 py-3 rounded-xl text-white font-bold text-center"
                >
                  Get Started
                </a>
                <a
                  href="#see-more"
                  className="bg-white border border-gray-300 px-4 py-3 rounded-xl text-black hover:bg-gray-100 font-bold"
                >
                  See More
                </a>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1">
              <img
                src="https://ik.imagekit.io/3a0xukows/poster%20fix.jpg?updatedAt=1738613982757"
                alt="poster"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
            <div className="bg-[#7aa3a9] shadow-lg rounded-2xl p-8 w-full max-w-sm">
              <h3 className="flex items-center font-semibold text-xl mb-3 text-white">
                <img
                  src="https://ik.imagekit.io/3a0xukows/ai%20(1).png?updatedAt=1738636951973"
                  alt="AI"
                  className="w-6 h-6 mr-2"
                />
                AI Assistance
              </h3>
              <p className="text-sm text-black">
                The AI Smart Assistant is your intelligent companion within the
                web app, Whether you need help finding information, completing
                finding a ticket event, or getting recommendations.
              </p>
            </div>
            <div className="bg-[#7aa3a9] shadow-lg rounded-2xl p-8 w-full max-w-sm">
              <h3 className="flex items-center font-semibold text-xl mb-3 text-white">
                <img
                  src="https://ik.imagekit.io/3a0xukows/face-recognition.png?updatedAt=1738637304014"
                  alt="Face Recognition"
                  className="w-6 h-6 mr-2"
                />
                Face Recognition
              </h3>
              <p className="text-sm text-black">
                The Face Recognition feature brings a new level of convenience
                and security to your web app experience. identity confirmation
                process so that the ticket production process is safe.
              </p>
            </div>
            <div className="bg-[#7aa3a9] shadow-lg rounded-2xl p-8 w-full max-w-sm">
              <h3 className="flex items-center font-semibold text-xl mb-3 text-whihte">
                <img
                  src="https://ik.imagekit.io/3a0xukows/google-maps.png?updatedAt=1738636974442"
                  alt="gps"
                  className="w-6 h-6 mr-2"
                />
                GPS
              </h3>
              <p className="text-sm text-black">
                The Real-Time GPS Tracking feature empowers you to navigate the
                world with confidence. directs you to the place you want to go
                according to your ticket order.
              </p>
            </div>
          </div>
        </div>
        <div
          id="production-section"
          className="max-w-6xl w-full border border-1 rounded-2xl shadow-lg p-10 my-12 mx-auto scroll mt-[-10]"
        >
          <h1 className="flex justify-center text-[50px] font-bold text-black">
            Your Ticket Online
          </h1>
          <h1 className="flex justify-center text-[50px] font-bold text-black mb-2">
            Production
          </h1>
          <p className="flex justify-center text-gray-600 text-lg">
            Find festival, concert, and workshop or Make own
          </p>
          <p className="flex justify-center text-gray-600 text-lg mb-6">
            ticket production to manage your event.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href={"/login"}>
              <button className="bg-[#7aa3a9] border border-gray-300 px-8 py-3 rounded-xl text-white font-bold">
                Start Here
              </button>
            </Link>
          </div>
          <div className="mt-8">
            <img
              src="https://ik.imagekit.io/3a0xukows/iphone-gigs.png?updatedAt=1738649997632"
              alt="iphone-gigs"
              className=" mx-auto w-80"
            />
          </div>
        </div>
        <div
          id="see-more"
          className="max-w-6xl w-full border border-1 rounded-2xl shadow-lg p-10 my-12 mx-auto scroll mt-[-10]"
        >
          <h1 className="flex justify-center text-[50px] font-bold text-black">
            Looking for Upcoming
          </h1>
          <h1 className="flex justify-center text-[50px] font-bold text-black">
            events
          </h1>
          <p className="flex justify-center text-gray-600 text-lg">
            See all lists of upcoming and ongoing events
          </p>
          <p className="flex justify-center text-gray-600 text-lg">
            on your home page.
          </p>
          <img
            src="https://ik.imagekit.io/3a0xukows/home%20jpg.jpg?updatedAt=1738654384612"
            alt="home"
            className=" mx-auto w-[600px]"
          />
        </div>
        <div className="max-w-6xl w-full border border-1 rounded-2xl shadow-lg p-10 my-12 mx-auto scroll mt-[-10]">
          <h1 className="flex justify-center text-[50px] font-bold text-black">
            Sell your tickets on the
          </h1>
          <h1 className="flex justify-center text-[50px] font-bold text-black">
            marketplace
          </h1>
          <p className="flex justify-center text-gray-600 text-lg">
            Create your own event tickets or
          </p>
          <p className="flex justify-center text-gray-600 text-lg">
            sell concert tickets you own to others.
          </p>
          <img
            src="https://ik.imagekit.io/3a0xukows/fix.jpg?updatedAt=1738661044352"
            alt="marketplace"
            className=" mx-auto w-[700px]"
          />
        </div>
        <Footer />
      </div>
    </>
  );
}