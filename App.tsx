import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/landing/LandingPage';
import { Login } from './components/Login';
import DesignerApp from './DesignerApp';
import { useAuth } from './contexts/AuthContext';
import AccountLockedModal from './components/AccountLockedModal';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>; // Or your LoadingScreen
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

function App() {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    // Check for account locks
    let lockedReason: 'credits' | 'expiry' | 'disabled' | null = null;

    if (profile) {
        if (!profile.is_active) {
            lockedReason = 'disabled';
        } else if (profile.credits <= 0 && profile.role !== 'admin') {
            lockedReason = 'credits';
        } else if (profile.expiry_date) {
            const expiry = new Date(profile.expiry_date);
            const now = new Date();
            if (expiry < now) {
                lockedReason = 'expiry';
            }
        }
    }

    return (
        <Router>
            <div className="min-h-screen bg-black text-white selection:bg-white/20">
                {lockedReason && <AccountLockedModal reason={lockedReason} />}
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/app/*"
                        element={
                            <ProtectedRoute>
                                <DesignerApp />
                            </ProtectedRoute>
                        }
                    />
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
