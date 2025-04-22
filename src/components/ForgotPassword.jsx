import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Check your inbox.');
      setError('');
      setEmail('');
    } catch (error) {
      setError(error.message);
      setMessage('');
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-50">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 11.5v2.5" />
              <path d="M12 2a5 5 0 0 0-5 5v3h10V7a5 5 0 0 0-5-5Z" />
              <path d="M2 10h20v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9Z" />
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Forgot password?</h1>
          <p className="text-sm text-gray-600">No worries, we'll send you reset instructions.</p>
        </div>
        
        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-green-700 focus:outline-none transition-all duration-200"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 bg-green-800 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 cursor-pointer"
          >
            Reset password
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;