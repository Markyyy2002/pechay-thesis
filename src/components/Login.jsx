import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

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
    <div className="container" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="login-container">
        <div className="login-form-container">
          <h1>Welcome back!</h1>
          <h3>Enter your credentials to access your account</h3>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleLogin} className="login-form">
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
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          <div className="divider">or</div>
          <button onClick={handleGoogleLogin} className="google-button">
            <span className="google-logo"></span>
            <span>Sign in with Google</span>
          </button>
          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </p>
        </div>
        <div className="login-image"></div>
      </div>
    </div>
  );
};

export default Login;
