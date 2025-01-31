const LandingPage = () => {
  return (
    <>
      <nav className=" flex items-center justify-between p-4 bg-white shadow">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <img
            src="https://ik.imagekit.io/3a0xukows/ez%20gigs.png?updatedAt=1738296154689"
            alt="Logo"
            className=""
          />
          <a href="/" className="text-lg font-bold text-gray-900">
            ezgigs
          </a>
        </div>
        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <a
            href="/login"
            className="text-gray-900  hover:text-gray-900 hidden md:block"
          >
            Log in
          </a>
          <a
            href="/register"
            className="px-4 py-1 bg-black text-white rounded-md"
          >
            Get free account
          </a>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Create Workspace with
          </h1>
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl p-2">
            Notion template
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Discover 10+ Notion templates to organize work and life, <br />{" "}
            saving you valuable time.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <a
              href="/dashboards"
              className="px-6 py-3 bg-black text-white border border-black rounded-md hover:border-white"
            >
              Browse Templates
            </a>
            <a
              href="https://www.notion.so/login?from=marketing&pathname=%2F"
              className="px-6 py-3 bg-white text-black border border-black rounded-md hover:border-gray-300"
            >
              Get Notion
            </a>
          </div>
        </div>
        <div className="mt-12">
          <img
            src="https://ik.imagekit.io/3a0xukows/Screenshot%20(28).png?updatedAt=1735886376374"
            alt="Illustration"
            className="mx-auto w-full max-w-3xl"
          />
        </div>
      </section>
    </>
  );
};

export default LandingPage;
