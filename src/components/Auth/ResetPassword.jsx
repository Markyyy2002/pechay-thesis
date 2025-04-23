import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../firebase';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [oobCode, setOobCode] = useState('');
  const [email, setEmail] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('oobCode');
    
    if (code) {
      setOobCode(code);
      verifyCode(code);
    } else {
      setError('Invalid password reset link. Please request a new one.');
      setLoading(false);
    }
  }, [location]);

  const verifyCode = async (code) => {
    try {
      const email = await verifyPasswordResetCode(auth, code);
      setEmail(email);
      setLoading(false);
    } catch (error) {
      setError('This password reset link is invalid or has expired. Please request a new one.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;

    setPasswordStrength(strength);
  }, [newPassword]);

  useEffect(() => {
    if (!confirmPassword) return;
    setPasswordMatch(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordStrength <= 2) {
      setError('Password is too weak. Please use a stronger password.');
      return;
    }
    
    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('Password has been reset successfully! You can now log in with your new password.');
      setError('');
      
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-screen bg-gray-50">
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-50">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Reset your password</h1>
          {email && (
            <p className="text-sm text-gray-600">
              Create a new password for <span className="font-medium">{email}</span>
            </p>
          )}
        </div>
        
        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-green-700 focus:outline-none transition-all duration-200"
              required
            />
            
            {newPassword && (
              <div className="mt-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex space-x-1 w-full">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 flex-1 rounded-full ${i < passwordStrength ? getStrengthColor() : "bg-gray-200"}`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-xs ml-2 w-16 text-right">
                    {getStrengthLabel()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Use 8+ characters with a mix of letters, numbers & symbols
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-green-700 focus:outline-none transition-all duration-200 ${
                confirmPassword && !passwordMatch ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {confirmPassword && !passwordMatch && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-password"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="mr-2"
            />
            <label htmlFor="show-password" className="text-sm text-gray-600 cursor-pointer">
              Show Password
            </label>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 bg-green-800 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 cursor-pointer"
            disabled={loading || !passwordMatch || passwordStrength <= 2}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;