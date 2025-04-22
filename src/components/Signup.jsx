import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/home"); // Update to your desired route
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home"); // Update to your desired route
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="flex w-full md:w-[90vw] lg:w-[80vw] xl:w-[60vw] h-[90vh] shadow-none md:shadow-md rounded-lg overflow-hidden">
        <div className="w-full md:w-1/2 md:bg-white flex flex-col justify-center p-6 md:p-8 lg:p-12">
          <h1 className="text-xl md:text-2xl font-medium text-gray-800 mb-1">Create an account!</h1>
          <h3 className="text-xs md:text-sm text-gray-600 font-normal mb-4 md:mb-6">Enter your details to get started</h3>
          
          {error && <p className="text-red-500 text-xs md:text-sm mb-4 text-center">{error}</p>}
          
          <form onSubmit={handleSignup} className="flex flex-col items-center w-full">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 md:py-3 mb-3 md:mb-4 border border-gray-300 rounded-md text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-green-700"
              required
            />
            
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 md:py-3 mb-3 md:mb-4 border border-gray-300 rounded-md text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-green-700"
              required
            />
            
            <div className="flex items-center mb-3 md:mb-4 w-full">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              <label htmlFor="show-password" className="text-xs md:text-sm text-gray-600 cursor-pointer">
                Show Password
              </label>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-2 md:py-3 bg-green-800 hover:bg-green-700 text-white rounded-full text-sm md:text-base cursor-pointer transition-colors duration-200"
            >
              Sign Up
            </button>
          </form>
          
          <div className="text-center text-gray-600 my-2">or</div>
          
          <button 
            onClick={handleGoogleSignup} 
            className="w-full py-2 md:py-3 mx-auto flex justify-center items-center rounded-full text-sm md:text-base cursor-pointer border border-gray-400 hover:bg-gray-50 transition-colors duration-200"
          >
            <span className="w-5 h-5 md:w-6 md:h-6 bg-contain bg-no-repeat bg-center mr-2" style={{ backgroundImage: "url('/src/assets/image/google.png')" }}></span>
            <span>Sign up with Google</span>
          </button>
          
          <p className="text-center text-xs md:text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-green-800 hover:underline cursor-pointer">
              Login
            </Link>
          </p>
        </div>
        
        <div className="hidden md:block md:w-1/2 bg-cover bg-center rounded-r-lg" style={{ backgroundImage: "url('/src/assets/image/nursery.jpg')" }}></div>
      </div>
    </div>
  );
};

export default Signup;
