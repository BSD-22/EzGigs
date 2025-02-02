type SkeletonProps = {
    viewMode: "grid" | "list";
};

export const TicketsSkeleton = ({ viewMode }: SkeletonProps) => {
    const SkeletonGridItem = () => (
        <div className="bg-white rounded-lg sm:rounded-[24px] overflow-hidden border border-[#D3D9C9]">
            <div className="relative h-[100px] sm:h-[180px] bg-gray-200 animate-pulse" />
            <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="space-y-2 mt-4">
                    <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    );

    const SkeletonListItem = () => (
        <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#D3D9C9]">
            <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-[280px] h-[180px] bg-gray-200 animate-pulse" />
                <div className="flex-1 p-4 space-y-4">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 p-3 sm:p-7">
            {/* Skeleton Header */}
            <div className="mb-4 sm:mb-10">
                <div className="h-8 sm:h-12 bg-gray-200 rounded-lg w-1/3 animate-pulse mb-2" />
                <div className="h-4 sm:h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
            </div>

            {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    {[...Array(6)].map((_, idx) => (
                        <SkeletonGridItem key={idx} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {[...Array(4)].map((_, idx) => (
                        <SkeletonListItem key={idx} />
                    ))}
                </div>
            )}
        </div>
    );
}; 