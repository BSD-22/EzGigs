const Footer = () => {
  return (
    <>
      <footer className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Social Media */}
            <div>
              <h2 className="text-xl font-bold flex items-center text-black ">
                <span className="mr-2">
                  <img
                    src="https://ik.imagekit.io/3a0xukows/gigs%20fix%20full%20G.png?updatedAt=1738307076179"
                    alt="gigs"
                    className="w-10"
                  />
                </span>{" "}
                EzGigs
              </h2>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-600 hover:text-black">
                  📸
                </a>
                <a href="#" className="text-gray-600 hover:text-black">
                  ✖️
                </a>
                <a href="#" className="text-gray-600 hover:text-black">
                  🔗
                </a>
                <a href="#" className="text-gray-600 hover:text-black">
                  📘
                </a>
                <a href="#" className="text-gray-600 hover:text-black">
                  ▶️
                </a>
              </div>
              <button className="mt-4 px-4 py-2 bg-gray-100 border rounded text-sm">
                🌍 English ▼
              </button>
            </div>
            {/* Company */}
            <div>
              <h3 className="font-semibold mb-2">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:underline">
                    About us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms &amp; privacy
                  </a>
                </li>
              </ul>
            </div>
            {/* Download */}
            <div>
              <h3 className="font-semibold mb-2">Download</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:underline">
                    iOS &amp; Android
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Mac &amp; Windows
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Calendar
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Web Clipper
                  </a>
                </li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-2">Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:underline">
                    Help center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Affiliates
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Footer Bottom */}
          <div className="mt-10 text-gray-500 text-sm text-center">
            <p>Do Not Sell or Share My Info | Cookie settings</p>
            <p> 2025 Notion Labs, Inc.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
