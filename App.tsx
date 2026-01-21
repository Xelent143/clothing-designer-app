import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/landing/LandingPage';
import { Login } from './components/Login';
import DesignerApp from './DesignerApp';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>; // Or your LoadingScreen
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage onStart={() => window.location.href = '/login'} />} />
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
        </Router>
    );
};

export default App;
