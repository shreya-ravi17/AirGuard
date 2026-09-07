import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { auth } from "../../firebase/firebase";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");

      // App.jsx will automatically redirect
      // the authenticated user to the dashboard
    } catch (err) {
      console.error(err);

      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-shape shape-one"></div>
      <div className="login-background-shape shape-two"></div>
      <div className="login-background-shape shape-three"></div>

      <div className="login-container">

        {/* LEFT SIDE */}
        <div className="login-brand">

          <div className="login-logo">
            <div className="login-logo-icon">
              <Leaf size={28} />
            </div>

            <div>
              <h2>AirGuard</h2>
              <span>Air Quality Intelligence</span>
            </div>
          </div>

          <div className="brand-content">
            <div className="brand-tag">
              SMART AIR MONITORING
            </div>

            <h1>
              Breathe smarter.
              <br />
              <span>Live healthier.</span>
            </h1>

            <p>
              Monitor your environment, track air quality, and receive
              intelligent predictions designed to help you make healthier
              decisions every day.
            </p>

            <div className="brand-features">

              <div className="brand-feature">
                <span className="feature-dot"></span>
                Real-time air quality monitoring
              </div>

              <div className="brand-feature">
                <span className="feature-dot"></span>
                AI-powered AQI predictions
              </div>

              <div className="brand-feature">
                <span className="feature-dot"></span>
                Smart alerts and health insights
              </div>

            </div>
          </div>

          <div className="brand-footer">
            <div className="live-indicator">
              <span></span>
              System Online
            </div>

            <p>© 2026 AirGuard</p>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="login-form-side">

          <div className="login-form-wrapper">

            <div className="login-mobile-logo">
              <div className="login-logo-icon">
                <Leaf size={25} />
              </div>

              <h2>AirGuard</h2>
            </div>

            <div className="login-heading">
              <span className="welcome-tag">
                WELCOME BACK
              </span>

              <h2>Sign in to AirGuard</h2>

              <p>
                Enter your details to access your air quality dashboard.
              </p>
            </div>

            {error && (
              <div className="login-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* EMAIL */}
              <div className="login-input-group">
                <label>Email Address</label>

                <div className="login-input">
                  <Mail size={19} />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="login-input-group">
                <label>Password</label>

                <div className="login-input">
                  <Lock size={19} />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={19} />
                  </>
                )}
              </button>

            </form>

            <div className="login-security">
              <span className="security-icon">✓</span>
              Your connection is secure and encrypted
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;
