import { useSearchParams } from "next/navigation";

const FlashErrorComponents = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-lg border border-red-400/20">
            <div className="flex items-center gap-2">
              <p className="font-medium">{decodeURIComponent(error)}</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default FlashErrorComponents;
