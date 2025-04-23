import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import GoogleLogo from "../../assets/image/google.png";
import NurseryImage from "../../assets/image/nursery.jpg";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  // Check if passwords match
  useEffect(() => {
    if (!confirmPassword) return;
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

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

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (passwordStrength <= 2) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-gray-50 md:bg-white p-4 md:p-0">
      <div className="flex w-full md:w-[90vw] lg:w-[80vw] xl:w-[60vw] md:h-[90vh] shadow-sm md:shadow-md rounded-2xl overflow-hidden">
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-6 md:p-8 lg:p-12">
          <div className="mb-8 md:mb-6">
            <h1 className="text-2xl md:text-2xl font-semibold text-gray-800 mb-2">Create an account!</h1>
            <h3 className="text-sm md:text-sm text-gray-600 font-normal">Enter your details to get started</h3>
          </div>

          {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded-lg">{error}</p>}

          <form onSubmit={handleSignup} className="flex flex-col items-center w-full space-y-4 md:space-y-3">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                required
              />
              
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex space-x-1 w-full">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1.5 flex-1 rounded-full ${i < passwordStrength ? getStrengthColor() : "bg-gray-200"}`}
                        ></div>
                      ))}
                    </div>
                    <span className="text-xs ml-2 w-16 text-right font-medium">
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use 8+ characters with a mix of letters, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            <div className="w-full">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 md:py-3 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent ${
                  confirmPassword && !passwordMatch ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                required
              />
              {confirmPassword && !passwordMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
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
              className="w-full py-3 md:py-3 font-medium bg-green-800 hover:bg-green-700 text-white rounded-lg text-sm md:text-base cursor-pointer transition-colors duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={!passwordMatch || passwordStrength <= 2}
            >
              Sign Up
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>

          <button
            onClick={handleGoogleSignup}
            className="w-full py-3 md:py-3 font-medium mx-auto flex justify-center items-center rounded-lg text-sm md:text-base cursor-pointer border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            <img src={GoogleLogo} alt="Google" className="w-5 h-5 mr-2" />
            <span>Sign up with Google</span>
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-green-800 font-medium hover:underline cursor-pointer">
              Login
            </Link>
          </p>
        </div>

        <div className="hidden md:block md:w-1/2 bg-cover bg-center rounded-r-lg" style={{ backgroundImage: `url(${NurseryImage})` }}></div>
      </div>
    </div>
  );
};

export default Signup;
