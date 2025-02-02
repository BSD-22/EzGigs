import Link from "next/link"

const LandingPage = () => {
  return (
    <>
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-[#F4F6F0] via-[#E8EDE1] to-[#F4F6F0] relative overflow-hidden">
      <nav className="flex items-center justify-between p-4">
        {/* Left Section */}
        <div className="flex items-center space-x-12">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <img
              src="https://ik.imagekit.io/3a0xukows/gigs%20fix%20full%20G.png?updatedAt=1738307050316"
              alt="Logo"
              className="w-10"
            />
          </Link>
          <span className="text-xl font-bold text-[#3b4135]">EzGigs</span>
        </div>
        <div className="flex items-center space-x-6">
        <Link href="/home" className="flex space-x-2 text-[#3b4135] font-semibols ">All-tickets</Link>
        <Link href="/home" className="flex space-x-2 text-[#3b4135] font-semibols ">Category</Link>
        <Link href="/home" className="flex space-x-2 text-[#3b4135] font-semibols ">Event</Link>
        <Link href="/home" className="flex space-x-2 text-[#3b4135] font-semibols ">Pricing</Link>
        <Link href="/home" className="flex space-x-2 text-[#3b4135] font-semibols ">Subscription</Link>
        </div>

          </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
        <a href="/contactUs" className="text-[#3b4135] font-semibols ">
        Contact Us
        </a>
        <span className="text-gray-300 text-3xl ">|</span>
          <a
            href="/login"
            className="text-[#3b4135] font-bold "
          >
            Sign in
          </a>
          <a
            href="/register"
            className="px-4 py-2 bg-[#3b4135] text-white rounded-md font-bold text-sm"
          >
            Get Ticket free
          </a>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="flex-1 flex justify-center items-center">
        <div className="flex flex-col md:flex-row px-6 py-16 space-y-8 md:space-y-0 md:space-x-8">
          <div className="max-w-4xl mx-auto text-center md:text-left md:mr-8">
            <h1 className="text-5xl font-bold text-gray-900 md:text-5xl">
            All in one place  
            </h1>
            <h1 className="text-5xl font-bold text-gray-900 md:text-5xl">
            for all event ticketing online
            </h1>
            <h1 className="text-5xl font-bold text-gray-900 md:text-5xl">
            selling & production
            </h1>
           
            <p className="mt-4 text-lg text-gray-600">
              Discover 1000+ Ticket online for all event, <br /> 
              get or create one now!
            </p>
            <div className="mt-8 flex justify-center space-x-4 md:justify-start">
              <Link href={"/home"}  className="px-6 py-3 bg-[#3b4135] text-white border border-[#3b4135] font-bold rounded-md hover:border-white">
              Get Started
              </Link>
              <Link href={"/home"}  className="px-6 py-3 bg-white text-[#3b4135] border border-white font-bold rounded-md hover:border-gray-300">
              Event
              </Link>
            </div>
          </div>
          <div className="mt-12 md:mt-0 self-center">
            <img
              src="https://ik.imagekit.io/3a0xukows/ticket.png?updatedAt=1738314771948"
              alt="Illustration"
              className="mx-auto w-96 max-w-3xl"
            />
          </div>
        </div>
      </div>
      </div>
      <footer className="bg-[#3b4135] border border-white/20 text-white py-4 flex flex-col items-center">
      <div className="flex justify-center">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-sm border border-white/20">
          <Link href="/">
            <img
              src="https://ik.imagekit.io/3a0xukows/gigs%20fix%20full%20size.png?updatedAt=1738307076179"
              alt="Logo"
              className="w-8"
            />
          </Link>
        </div>
      </div>
        <span className="text-sm hover:underline text-white">
        © 2025, EzGigs.com, Inc. or its tickets
        </span>
      </footer>
    </>
  );
};

export default LandingPage;
