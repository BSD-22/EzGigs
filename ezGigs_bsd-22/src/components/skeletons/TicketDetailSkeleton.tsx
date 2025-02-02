"use client";

export const TicketDetailSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-white to-[#E8EDE1]">
    <div className="relative h-[250px] sm:h-[400px] bg-gray-200 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-32 bg-gray-300/30 rounded-full" />
            <div className="h-6 w-24 bg-gray-300/30 rounded-full" />
          </div>
          <div className="h-8 sm:h-12 w-3/4 bg-gray-300/30 rounded-lg" />
          <div className="h-4 sm:h-6 w-1/2 bg-gray-300/30 rounded-lg" />
        </div>
      </div>
    </div>

    {/* Skeleton Content */}
    <div className="p-3 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Skeleton */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
              </div>
            </div>

            {/* Map Skeleton */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Right Column - Tickets Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {[...Array(3)].map((_, idx) => (
                  <div
                    key={idx}
                    className="w-full p-4 rounded-xl border border-[#D3D9C9] animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-gray-200 rounded" />
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </div>
                      <div className="h-8 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
