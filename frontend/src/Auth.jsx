
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Gift,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
} from "lucide-react";
import "./Auth.css";
import API_URL from "./api.js";

// Remove trailing slashes from backend URL
const BASE_URL = API_URL.replace(/\/+$/, "");

function Auth({ mode = "login" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/dashboard";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      isRegister &&
      formData.password !== formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const endpoint = isRegister
      ? "/api/auth/register"
      : "/api/auth/login";

    const payload = isRegister
      ? {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }
      : {
          email: formData.email.trim(),
          password: formData.password,
        };

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Authentication failed."
        );
      }

      if (!data.token) {
        throw new Error(
          "Authentication token was not returned by the server."
        );
      }

      localStorage.setItem("velopToken", data.token);
      localStorage.setItem(
        "velopUser",
        JSON.stringify(data.user)
      );

      setSuccess(
        isRegister
          ? "Your VELOOP account has been created successfully!"
          : "Login successful! Welcome back."
      );

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to connect to the VELOOP server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-glow"></div>

      <div className="auth-card">
        <Link to="/" className="auth-back">
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">
            <Gift size={25} />
          </span>
          VELOOP<span>.</span>
        </Link>

        <div className="auth-heading">
          <div className="auth-label">
            {isRegister
              ? "JOIN THE REWARDS COMMUNITY"
              : "WELCOME BACK"}
          </div>

          <h1>
            {isRegister
              ? "Create your account"
              : "Sign in to VELOOP"}
          </h1>

          <p>
            {isRegister
              ? "Create your account and discover exciting rewards."
              : "Sign in to explore giveaways and manage your account."}
          </p>
        </div>

        {error && (
          <div className="auth-message auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-message auth-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <div className="auth-input-wrapper">
                <User size={18} />
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={60}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="auth-field">
              <label htmlFor="phone">Phone number</label>
              <div className="auth-input-wrapper">
                <Phone size={18} />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} />
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                maxLength={72}
                autoComplete={
                  isRegister
                    ? "new-password"
                    : "current-password"
                }
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>
              <div className="auth-input-wrapper">
                <Lock size={18} />
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link
                to="/login"
                state={{ from: location.state?.from }}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                to="/register"
                state={{ from: location.state?.from }}
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        <div className="auth-security">
          <Lock size={14} />
          Your account is protected by secure authentication.
        </div>
      </div>
    </div>
  );
}

export default Auth;
