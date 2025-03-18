import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css"; // Import the same CSS file

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
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
    <div className="container" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="login-container">
        <div className="login-form-container">
          <h1>Create an account!</h1>
          <h3>Enter your details to get started</h3>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignup} className="login-form">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <input
              type={showPassword ? "text" : "password"} // Toggle input type based on showPassword state
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
            <div className="show-password-container">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)} // Toggle showPassword state
              />
              <label htmlFor="show-password" className="show-password-label">
                Show Password
              </label>
            </div>
            <button type="submit" className="login-button">
              Sign Up
            </button>
          </form>
          <div className="divider">or</div>
          <button onClick={handleGoogleSignup} className="google-button">
            <span className="google-logo"></span>
            <span>Sign up with Google</span>
          </button>
          <p className="signup-text">
            Already have an account?{" "}
            <Link to="/login" className="signup-link">
              Login
            </Link>
          </p>
        </div>
        <div className="login-image"></div>
      </div>
    </div>
  );
};

export default Signup;
