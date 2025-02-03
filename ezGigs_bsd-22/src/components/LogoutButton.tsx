import { LogOut } from "lucide-react";
import { actionLogoutHandler } from "@/services/logout";
import React from "react";

interface LogoutButtonProps {
  isOpen: boolean;
}

const LogoutButton = ({ isOpen }: LogoutButtonProps) => {
    const [loading, setLoading] = React.useState(false);

    const handleLogout = async () => {
        try {
            setLoading(true);
            await actionLogoutHandler();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className={`flex items-center gap-x-4 p-2 rounded-lg w-full
                transition-all duration-300 
                hover:scale-[1.02]
                group
                relative
                text-white/60 hover:bg-white/5 hover:text-[#00D2FF]
                border border-transparent hover:border-[#00D2FF]/30
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="transition-transform duration-300 group-hover:scale-110">
                <LogOut className="w-5 h-5" />
            </div>
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>
                {loading ? 'Logging out...' : 'Logout'}
            </span>
        </button>
    );
};

export default LogoutButton;