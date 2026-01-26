import React from 'react';
import { Lock, Smartphone, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AccountLockedModalProps {
    reason: 'credits' | 'expiry' | 'disabled';
}

const AccountLockedModal: React.FC<AccountLockedModalProps> = ({ reason }) => {
    const { signOut } = useAuth();
    const whatsappNumber = "923022922242";
    const whatsappUrl = `https://wa.me/${whatsappNumber}`;

    let title = "Account Locked";
    let message = "Your account has been locked.";

    if (reason === 'credits') {
        title = "Zero Generations Remaining";
        message = "You have used all your generation credits. Please recharge your account to continue designing.";
    } else if (reason === 'expiry') {
        title = "Account Expired";
        message = "Your account subscription has expired. Please renew your subscription to regain access.";
    } else if (reason === 'disabled') {
        title = "Account Disabled";
        message = "Your account has been disabled by the administrator.";
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-400 mb-8">{message}</p>

                <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-2">Contact Administrator for activation:</p>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        <Smartphone className="w-5 h-5" />
                        Contact via WhatsApp
                    </a>
                    <p className="text-xs text-gray-600 mt-2 font-mono">{whatsappNumber}</p>

                    <button
                        onClick={() => signOut()}
                        className="flex items-center justify-center gap-2 w-full mt-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-2 px-6 rounded-xl transition-all duration-200 text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountLockedModal;
