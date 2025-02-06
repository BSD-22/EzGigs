const ChatSkeleton = () => {
  return (
    <div className="w-full h-[100dvh] md:h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-[#F4F6F0] via-[#E8EDE1] to-[#F4F6F0] overflow-hidden fixed inset-0 md:relative z-[60]">
      {/* Header Skeleton */}
      <div className="w-full flex-none p-3 md:p-4 bg-white border-b border-[#D3D9C9] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Chat List Skeleton */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="space-y-3 md:space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex justify-between items-center">
              <div className="flex-1 bg-white rounded-xl md:rounded-2xl overflow-hidden border border-[#D3D9C9] p-3 md:p-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 md:h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 md:h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-12 h-4 bg-gray-200 rounded animate-pulse shrink-0" />
                </div>
              </div>
              <div className="w-8 h-8 ml-2 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;
