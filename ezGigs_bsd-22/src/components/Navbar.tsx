"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTicketOpen(false), setIsEventOpen(false);
        setIsSubscriptionOpen(false);
        setIsContactOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function for Teams button
  const handleTicketClick = () => {
    console.log("Ticket button clicked");
    // Add your logic here
  };

  const handleEventClick = () => {
    console.log("Event button clicked");
    // Add your logic here
  };

  const handleSubscriptionClick = () => {
    console.log("Subscription button clicked");
    // Add your logic here
  };
  return (
    <>
      <nav className="flex items-center justify-evenly p-2.5 sticky top-0 bg-white z-50">
        {/* Left Section - Reduced padding */}
        <div className="flex items-center px-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <img
                src="https://ik.imagekit.io/3a0xukows/gigs%20rainbow.png?updatedAt=1738598363582"
                alt="Logo"
                className="w-8 h-8"
              />
            </Link>
          </div>
        </div>

        {/* Middle Section - Added fixed width and better centering */}
        <div className="flex items-center justify-center flex-1 max-w-3xl mx-auto">
          <div className="flex items-center space-x-4 justify-center w-full">
            {/* Feature dropdown */}
            <div
              className="relative inline-block text-left"
              ref={dropdownRef}
              onMouseEnter={() => setIsTicketOpen(true)}
              onMouseLeave={() => setIsTicketOpen(false)}
            >
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 text-black font-semibold rounded-md flex items-center gap-2"
                  onClick={handleTicketClick} // Call Teams function
                >
                  Featured
                </button>
              </div>

              {isTicketOpen && (
                <div
                  className="absolute left-0 w-64 bg-white border rounded-md shadow-lg"
                  onMouseEnter={() => setIsTicketOpen(true)}
                  onMouseLeave={() => setIsTicketOpen(false)}
                >
                  <Link
                    href={"/home"}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm"
                  >
                    <img
                      src="https://ik.imagekit.io/3a0xukows/ai.png?updatedAt=1738571078291"
                      alt="icon"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span>AI</span>
                      <span className="text-gray-500 text-xs">
                        Integreted AI assistance
                      </span>
                    </div>
                  </Link>
                  <Link
                    href={"/home"}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm"
                  >
                    <img
                      src="https://ik.imagekit.io/3a0xukows/google-docs.png?updatedAt=1738571425742"
                      alt="icon"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span>Information</span>
                      <span className="text-gray-500 text-xs">
                        Flow of application
                      </span>
                    </div>
                  </Link>
                  <Link
                    href={"/home"}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm"
                  >
                    <img
                      src="https://ik.imagekit.io/3a0xukows/calendar.png?updatedAt=1738571561150"
                      alt="icon"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span>Schedule</span>
                      <span className="text-gray-500 text-xs">
                        View time schedule
                      </span>
                    </div>
                  </Link>
                  <Link
                    href={"/home"}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm"
                  >
                    <img
                      src="https://ik.imagekit.io/3a0xukows/location%20(1).png?updatedAt=1738571735634"
                      alt="icon"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span>Location</span>
                      <span className="text-gray-500 text-xs">
                        Find places event
                      </span>
                    </div>
                  </Link>
                  <Link
                    href={"/home"}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm"
                  >
                    <img
                      src="https://ik.imagekit.io/3a0xukows/user.png?updatedAt=1738571871834"
                      alt="icon"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span>Face Recognation</span>
                      <span className="text-gray-500 text-xs">
                        AI-based face detection
                      </span>
                    </div>
                  </Link>
                  <Link
                    href={"/home"}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm"
                  >
                    <img
                      src="https://ik.imagekit.io/3a0xukows/transaction.png?updatedAt=1738571924403"
                      alt="icon"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span>Transaction</span>
                      <span className="text-gray-500 text-xs">
                        Manage your transactions
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Events dropdown */}
            <div
              className="relative inline-block text-left"
              ref={dropdownRef}
              onMouseEnter={() => setIsEventOpen(true)}
              onMouseLeave={() => setIsEventOpen(false)}
            >
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 text-black font-semibold rounded-md flex items-center gap-2"
                  onClick={handleEventClick} // Call Teams function
                >
                  Events
                </button>
              </div>

              {isEventOpen && (
                <div
                  className="absolute left-0 w-64 bg-white border rounded-md shadow-lg"
                  onMouseEnter={() => setIsEventOpen(true)}
                  onMouseLeave={() => setIsEventOpen(false)}
                >
                  <Link
                    href={"/home"}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm"
                  >
                    <img
                      src="https://ik.imagekit.io/3a0xukows/ticket.png?updatedAt=1738575206640"
                      alt="icon"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span>Upcoming</span>
                      <span className="text-gray-500 text-xs">
                        View upcoming event or festival
                      </span>
                    </div>
                  </Link>
                  <Link
                    href={"/home"}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm"
                  >
                    <img
                      src="https://ik.imagekit.io/3a0xukows/loading.png?updatedAt=1738575146003"
                      alt="icon"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span>Ongoing</span>
                      <span className="text-gray-500 text-xs">
                        What event's today
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Subscription dropdown */}
            <div
              className="relative inline-block text-left"
              ref={dropdownRef}
              onMouseEnter={() => setIsSubscriptionOpen(true)}
              onMouseLeave={() => setIsSubscriptionOpen(false)}
            >
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 text-black font-sm font-semibold rounded-md flex items-center gap-2"
                  onClick={handleSubscriptionClick} // Call Teams function
                >
                  Subscription
                </button>
              </div>

              {isSubscriptionOpen && (
                <div
                  className="absolute left-0 w-64 bg-white border rounded-md shadow-lg"
                  onMouseEnter={() => setIsSubscriptionOpen(true)}
                  onMouseLeave={() => setIsSubscriptionOpen(false)}
                >
                  <Link
                    href={"/home"}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm"
                  >
                    <img
                      src="https://ik.imagekit.io/3a0xukows/premium-quality.png?updatedAt=1738574348467"
                      alt="icon"
                      className="w-5 h-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span>Pricing</span>
                      <span className="text-gray-500 text-xs">
                        Upgrade to premium
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href={"contact-us"}
              className="font-semibold text-black px-4 py-2"
            >
              About Us
            </Link>
          </div>
        </div>

        {/* Right Section - Reduced padding */}
        <div className="flex items-center space-x-4 px-8">
          <div className="relative">
            <img
              src="https://ik.imagekit.io/3a0xukows/glass.png?updatedAt=1738593019666"
              alt="search"
              className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <input
              type="text"
              className=" w-40 px-9 py-2 bg-[#f5f5f5] text-[#707072] rounded-2xl font-semibold text-sm"
              placeholder="Search"
            />
          </div>
          <Link href={"/login"}>
            <img
              src="https://ik.imagekit.io/3a0xukows/user%20(1).png?updatedAt=1738592812020"
              alt="login"
              className="w-5 h-5"
            />
          </Link>
          <Link href={"/my-tickets"}>
            <img
              src="https://ik.imagekit.io/3a0xukows/heart%20(1).png?updatedAt=1738592202042"
              alt="love"
              className="w-5 h-5"
            />
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
