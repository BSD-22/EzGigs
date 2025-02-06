"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [, setIsContactOpen] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const eventRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ticketRef.current &&
        !ticketRef.current.contains(event.target as Node) &&
        eventRef.current &&
        !eventRef.current.contains(event.target as Node) &&
        subscriptionRef.current &&
        !subscriptionRef.current.contains(event.target as Node)
      ) {
        setIsTicketOpen(false);
        setIsEventOpen(false);
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
      <nav className="flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="max-w-[1152px] mx-auto w-full px-4 md:px-8">
          <div className="flex items-center justify-between py-2">
            {/* Left Section - Logo */}
            <div className="flex items-center">
                <Link href="/">
                  <Image
                    width={200}
                    height={200}
                    src="https://ik.imagekit.io/3a0xukows/y1.png?updatedAt=1738605688822"
                    alt="Logo"
                    className="w-20 md:w-28" 
                  />
                </Link>
            </div>

            {/* Middle Section - Navigation (Hidden on Mobile) */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-3xl mx-auto">
              <div className="flex items-center space-x-4 justify-center w-full">
                {/* Feature dropdown */}
                <div
                  className="relative inline-block text-left"
                  ref={ticketRef}
                  onMouseEnter={() => setIsTicketOpen(true)}
                  onMouseLeave={() => setIsTicketOpen(false)}>
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
                      onMouseLeave={() => setIsTicketOpen(false)}>
                      <Link
                        href={"/login"}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm">
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/ai.png?updatedAt=1738571078291"
                          alt="icon"
                          className="w-5 h-5 mr-2"
                        />
                        <div className="flex flex-col">
                          <span>AI</span>
                          <span className="text-gray-500 text-xs">Integreted AI assistance</span>
                        </div>
                      </Link>
                      <Link
                        href={"/login"}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm">
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/google-docs.png?updatedAt=1738571425742"
                          alt="icon"
                          className="w-5 h-5 mr-2"
                        />
                        <div className="flex flex-col">
                          <span>Information</span>
                          <span className="text-gray-500 text-xs">Flow of application</span>
                        </div>
                      </Link>
                      <Link
                        href={"/login"}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm">
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/calendar.png?updatedAt=1738571561150"
                          alt="icon"
                          className="w-5 h-5 mr-2"
                        />
                        <div className="flex flex-col">
                          <span>Schedule</span>
                          <span className="text-gray-500 text-xs">View time schedule</span>
                        </div>
                      </Link>
                      <Link
                        href={"/login"}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm">
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/location%20(1).png?updatedAt=1738571735634"
                          alt="icon"
                          className="w-5 h-5 mr-2"
                        />
                        <div className="flex flex-col">
                          <span>Location</span>
                          <span className="text-gray-500 text-xs">Find places event</span>
                        </div>
                      </Link>
                      <Link
                        href={"/login"}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm">
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/user.png?updatedAt=1738571871834"
                          alt="icon"
                          className="w-5 h-5 mr-2"
                        />
                        <div className="flex flex-col">
                          <span>Face Recognation</span>
                          <span className="text-gray-500 text-xs">AI-based face detection</span>
                        </div>
                      </Link>
                      <Link
                        href={"/login"}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm">
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/transaction.png?updatedAt=1738571924403"
                          alt="icon"
                          className="w-5 h-5 mr-2"
                        />
                        <div className="flex flex-col">
                          <span>Transaction</span>
                          <span className="text-gray-500 text-xs">Manage your transactions</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Events dropdown */}
                <div
                  className="relative inline-block text-left"
                  ref={eventRef}
                  onMouseEnter={() => setIsEventOpen(true)}
                  onMouseLeave={() => setIsEventOpen(false)}>
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
                      onMouseLeave={() => setIsEventOpen(false)}>
                      <Link
                        href={"/login"}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm">
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/ticket.png?updatedAt=1738575206640"
                          alt="icon"
                          className="w-5 h-5 mr-2"
                        />
                        <div className="flex flex-col">
                          <span>Upcoming</span>
                          <span className="text-gray-500 text-xs">View upcoming event or festival</span>
                        </div>
                      </Link>
                      <Link
                        href={"/login"}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm">
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/loading.png?updatedAt=1738575146003"
                          alt="icon"
                          className="w-5 h-5 mr-2"
                        />
                        <div className="flex flex-col">
                          <span>Ongoing</span>
                          <span className="text-gray-500 text-xs">What event&apos;s today</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Subscription dropdown */}
                <div
                  className="relative inline-block text-left"
                  ref={subscriptionRef}
                  onMouseEnter={() => setIsSubscriptionOpen(true)}
                  onMouseLeave={() => setIsSubscriptionOpen(false)}>
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
                      onMouseLeave={() => setIsSubscriptionOpen(false)}>
                      <Link
                        href={"/login"}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 text-black font-semibold text-sm">
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/premium-quality.png?updatedAt=1738574348467"
                          alt="icon"
                          className="w-5 h-5 mr-2"
                        />
                        <div className="flex flex-col">
                          <span>Pricing</span>
                          <span className="text-gray-500 text-xs">Upgrade to premium</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3 md:space-x-4">
              
              <Link href={"/login"}>
                <Image
                  width={200}
                  height={200}
                  src="https://ik.imagekit.io/3a0xukows/user%20(1).png?updatedAt=1738592812020"
                  alt="login"
                  className="w-5 h-5"
                />
              </Link>
              <Link href={"/login"}>
                <Image
                  width={200}
                  height={200}
                  src="https://ik.imagekit.io/3a0xukows/heart%20(1).png?updatedAt=1738592202042"
                  alt="love"
                  className="w-5 h-5"
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
