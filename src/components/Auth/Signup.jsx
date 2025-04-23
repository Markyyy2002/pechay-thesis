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

            <div className="w-full mb-3 md:mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-md text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-green-700"
                required
              />
              
              {password && (
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

            <div className="w-full mb-3 md:mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 md:py-3 border rounded-md text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-green-700 ${
                  confirmPassword && !passwordMatch ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {confirmPassword && !passwordMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

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
              className="w-full py-2 md:py-3 font-medium bg-green-800 hover:bg-green-700 text-white rounded-full text-sm md:text-base cursor-pointer transition-colors duration-200"
              disabled={!passwordMatch || passwordStrength <= 2}
            >
              Sign Up
            </button>
          </form>

          <div className="text-center text-gray-600 my-2">or</div>

          <button
            onClick={handleGoogleSignup}
            className="w-full py-2 md:py-3 font-medium mx-auto flex justify-center items-center rounded-full text-sm md:text-base cursor-pointer border border-gray-400 hover:bg-gray-50 transition-colors duration-200"
          >
            <span className="w-5 h-5 md:w-6 md:h-6 bg-contain bg-no-repeat bg-center mr-2" style={{ backgroundImage: `url(${GoogleLogo})` }}></span>
            <span>Sign up with Google</span>
          </button>

          <p className="text-center text-xs md:text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-green-800 hover:underline cursor-pointer">
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
