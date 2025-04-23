import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import GoogleLogo from "../../assets/image/google.png";
import NurseryImage from "../../assets/image/nursery.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home"); // Update to your desired route
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home"); // Update to your desired route
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-gray-50 md:bg-white p-4 md:p-0">
      <div className="flex w-full md:w-[90vw] lg:w-[80vw] xl:w-[60vw] md:h-[90vh] shadow-sm md:shadow-md rounded-2xl overflow-hidden">
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-6 md:p-8 lg:p-12">
          <div className="mb-8 md:mb-6">
            <h1 className="text-2xl md:text-2xl font-semibold text-gray-800 mb-2">Welcome back!</h1>
            <h3 className="text-sm md:text-sm text-gray-600 font-normal">Enter your credentials to access your account</h3>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded-lg">{error}</p>}
          
          <form onSubmit={handleLogin} className="flex flex-col items-center w-full space-y-4 md:space-y-3">
            <div className="w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                required
              />
            </div>
            
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-green-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex items-center w-full">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="h-4 w-4 text-green-800 focus:ring-green-700 border-gray-300 rounded"
              />
              <label htmlFor="show-password" className="ml-2 text-sm text-gray-600 cursor-pointer">
                Show Password
              </label>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 md:py-3 font-medium bg-green-800 hover:bg-green-700 text-white rounded-lg text-sm md:text-base cursor-pointer transition-colors duration-200 mt-4"
            >
              Login
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          
          <button 
            onClick={handleGoogleLogin} 
            className="w-full py-3 md:py-3 font-medium mx-auto flex justify-center items-center rounded-lg text-sm md:text-base cursor-pointer border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            <img src={GoogleLogo} alt="Google" className="w-5 h-5 mr-2" />
            <span>Sign in with Google</span>
          </button>
          
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-800 font-medium hover:underline cursor-pointer">
              Sign Up
            </Link>
          </p>
        </div>
        
        <div className="hidden md:block md:w-1/2 bg-cover bg-center rounded-r-lg" style={{ backgroundImage: `url(${NurseryImage})` }}></div>
      </div>
    </div>
  );
};

export default Login;
