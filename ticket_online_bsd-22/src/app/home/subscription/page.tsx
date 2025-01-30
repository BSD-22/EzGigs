"use client";

const SubscriptionPage = () => {
  const subscriptionPlans = [
    {
      name: "Bronze",
      description: "Standard package without discount",
      discount: "0%",
      features: ["Ticket purchase access", "Latest concert notifications", "24/7 Customer support"],
      color: "from-[#CD7F32] to-[#B87333]",
    },
    {
      name: "Silver",
      description: "5% discount on every ticket purchase",
      discount: "5%",
      features: ["All Bronze features", "5% discount on purchases", "Pre-sale ticket access"],
      color: "from-[#C0C0C0] to-[#A8A8A8]",
    },
    {
      name: "Gold",
      description: "8% discount on every ticket purchase",
      discount: "8%",
      features: ["All Silver features", "8% discount on purchases", "Priority customer support"],
      color: "from-[#FFD700] to-[#DAA520]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-[#E8EDE1] to-[#F4F6F0] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D3D9C9] rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-[#4A5043] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#656D5D] rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative py-20 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-[#2C3228] mb-4">Choose Your Subscription Plan</h1>
          <p className="text-[#4A5043] text-lg">Get special benefits for every concert ticket purchase</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="opacity-90">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-black">{plan.discount}</span>
                  <span className="ml-2">Discount</span>
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-[#4A5043]">
                      <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className="w-full mt-8 py-4 bg-gradient-to-r from-[#4A5043] to-[#2C3228] text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#2C3228]/25 flex items-center justify-center group">
                  <span>Select Plan</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
