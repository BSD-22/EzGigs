import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <>
      <footer className="bg-white py-10 border border-top-1">
        <div className="max-w-[1152px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
            {/* Logo and Social Media */}
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <Link href={"/"}>
                <Image
                  width={200}
                  height={200}
                  src="https://ik.imagekit.io/3a0xukows/y1.png?updatedAt=1738605688822"
                  alt="gigs"
                  className="w-32"
                />
              </Link>

              <div className="flex space-x-4 mt-4">
                <Link href={"https://www.instagram.com/"}>
                  <Image
                    width={200}
                    height={200}
                    src="https://ik.imagekit.io/3a0xukows/instagram%20(1).png?updatedAt=1738630399808"
                    alt="instagram"
                    className="w-5"
                  />
                </Link>
                <Link href={"https://x.com/?lang=en&mx=2"}>
                  <Image
                    width={200}
                    height={200}
                    src="https://ik.imagekit.io/3a0xukows/twitter%20(1).png?updatedAt=1738630399909"
                    alt="X"
                    className="w-5"
                  />
                </Link>
                <Link href={"https://www.linkedin.com/home"}>
                  <Image
                    width={200}
                    height={200}
                    src="https://ik.imagekit.io/3a0xukows/linkedin.png?updatedAt=1738630399804"
                    alt="Linkedin"
                    className="w-5"
                  />
                </Link>
                <Link href={"https://www.facebook.com/login/?privacy_mutation_token=eyJ0eXBlIjowLCJjcmVhdGlvbl90aW1lIjoxNzM4NjUxOTY3LCJjYWxsc2l0ZV9pZCI6MjY5NTQ4NDUzMDcyMDk1MX0%3D"}>
                  <Image
                    width={200}
                    height={200}
                    src="https://ik.imagekit.io/3a0xukows/facebook.png?updatedAt=1738630399804"
                    alt="facebook"
                    className="w-5"
                  />
                </Link>
                <Link href={"https://www.youtube.com/"}>
                  <Image
                    width={200}
                    height={200}
                    src="https://ik.imagekit.io/3a0xukows/youtube.png?updatedAt=1738630399746"
                    alt="youtube"
                    className="w-5"
                  />
                </Link>
              </div>
              
              <div className="mt-8 md:mt-14">
                <button className="px-4 py-2 bg-white border rounded text-sm">
                  <span className="text-sm items-center flex justify-center text-black font-semibold">
                    <Image
                      width={200}
                      height={200}
                      className="w-5 mr-2"
                      src="https://ik.imagekit.io/3a0xukows/language.png?updatedAt=1738630667978"
                      alt="flag"
                    />
                    English
                  </span>
                </button>
                <div className="mt-6 text-sm">
                  <p className="text-gray-600">Online Ticket Production</p>
                  <p className="text-gray-600">Cookie settings</p>
                  <p className="text-black mt-4 text-sm">© 2025, EzGigs.com, Inc.</p>
                </div>
              </div>
            </div>

            {/* About Us */}
            <div className="mt-0 md:mt-6">
              <h3 className="font-semibold mb-4 text-black">About Us</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link
                    href={"/login"}
                    className="hover:underline text-sm">
                    {" "}
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Status
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    View Events
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Terms & Privacy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Featured */}
            <div className="mt-0 md:mt-6">
              <h3 className="font-semibold mb-4 text-black">Featured</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    AI
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Face Recognation
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Location
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Transaction
                  </Link>
                </li>
              </ul>
            </div>

            {/* Events */}
            <div className="mt-0 md:mt-6">
              <h3 className="font-semibold mb-4 text-black">Events</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Festival
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Concert
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Sports
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Workshop
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Teater & Drama
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    All Category
                  </Link>
                </li>
              </ul>
            </div>

            {/* EzGigs for */}
            <div className="mt-0 md:mt-6">
              <h3 className="font-semibold mb-4 text-black">EzGigs for</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Enterprise
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Small Business
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Personal
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/"}
                    className="hover:underline text-sm">
                    {" "}
                    Community
                  </Link>
                </li>
              </ul>
              <div className="text-sm mt-20 text-black font-bold hidden md:block">
                <Link href={"/"}>Explore more →</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
