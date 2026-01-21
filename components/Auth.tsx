
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  signOut,
  AuthError 
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { createUserProfile } from '../services/userService';
import { Button } from './Button';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isReset) {
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent. Check your inbox.");
        setLoading(false);
        return;
      }

      if (isLogin) {
        // 1. Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // 2. Force refresh the user token to get the latest emailVerified status
        await userCredential.user.reload();
        
        // 3. Check verification status using the current auth instance
        const currentUser = auth.currentUser; 

        if (currentUser && !currentUser.emailVerified) {
          await signOut(auth);
          setError("Email not verified. Please check your inbox and click the verification link, then try logging in again.");
          setLoading(false);
          return;
        }
        
        // 4. Ensure profile exists in DB
        if (currentUser) {
          await createUserProfile(currentUser.uid, currentUser.email || "");
        }

      } else {
        // Sign Up Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create Firestore Profile with 5 Credits
        await createUserProfile(userCredential.user.uid, userCredential.user.email || "");

        // Send Verification Email
        await sendEmailVerification(userCredential.user);
        
        // Sign out immediately so they can't access app until verified
        await signOut(auth);

        setIsLogin(true); // Switch back to login view
        setMessage("Account created successfully! We have sent a verification email to your inbox. Please verify your email before logging in.");
        setEmail(''); // Clear form
        setPassword('');
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error(err);
      const firebaseError = err as AuthError;
      let errorMsg = "An error occurred.";
      
      switch (firebaseError.code) {
        case 'auth/invalid-email': 
          errorMsg = "Invalid email address."; 
          break;
        case 'auth/user-disabled': 
          errorMsg = "User account disabled."; 
          break;
        case 'auth/user-not-found': 
          errorMsg = "No account found with this email. Please Sign Up."; 
          break;
        case 'auth/wrong-password': 
          errorMsg = "Incorrect password."; 
          break;
        case 'auth/invalid-credential':
          errorMsg = "Incorrect email/password or account does not exist. If you recently switched versions, please Sign Up again.";
          break;
        case 'auth/email-already-in-use': 
          errorMsg = "Email already in use. Please Log In."; 
          break;
        case 'auth/weak-password': 
          errorMsg = "Password should be at least 6 characters."; 
          break;
        case 'auth/operation-not-allowed': 
          errorMsg = "Email/Password login is not enabled in Firebase Console."; 
          break;
        case 'auth/network-request-failed': 
          errorMsg = "Network error. Please check your internet connection or firewall/VPN settings."; 
          break;
        case 'auth/too-many-requests': 
          errorMsg = "Too many failed attempts. Please try again later."; 
          break;
        default: 
          errorMsg = firebaseError.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setMessage(null);
    setIsReset(false);
  };

  const toggleReset = () => {
    setIsReset(!isReset);
    setError(null);
    setMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 bg-[url('https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-black/60 border border-white/10 backdrop-blur-md shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter brand-font bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
            CULTURE<span className="text-purple-500">PIECE</span>
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Designer Access Portal</p>
        </div>

        <div className="flex gap-4 mb-6 border-b border-white/10">
          {!isReset && (
            <>
              <button 
                onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${isLogin ? 'text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-white'}`}
              >
                Log In
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${!isLogin ? 'text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-white'}`}
              >
                Sign Up
              </button>
            </>
          )}
          {isReset && (
            <button 
              className="pb-2 text-sm font-bold uppercase tracking-wider text-white border-b-2 border-purple-500"
            >
              Reset Password
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-700 focus:border-purple-500 py-2 text-white outline-none transition-colors"
              placeholder="ENTER EMAIL"
              required
            />
          </div>

          {!isReset && (
            <div>
              <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-700 focus:border-purple-500 py-2 text-white outline-none transition-colors"
                placeholder="ENTER PASSWORD"
                required
              />
            </div>
          )}

          {error && <div className="p-3 bg-red-900/30 border border-red-800 text-red-200 text-xs font-medium">{error}</div>}
          {message && <div className="p-3 bg-green-900/30 border border-green-800 text-green-200 text-xs font-medium">{message}</div>}

          <Button 
            fullWidth 
            type="submit" 
            disabled={loading}
            className="mt-4"
          >
            {loading ? "Processing..." : (isReset ? "Send Reset Link" : (isLogin ? "Enter Studio" : "Create Account"))}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {!isReset ? (
            <button onClick={toggleReset} className="text-xs text-gray-500 hover:text-purple-400 transition-colors">
              Forgot your password?
            </button>
          ) : (
            <button onClick={toggleReset} className="text-xs text-gray-500 hover:text-white transition-colors">
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
