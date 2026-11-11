
import "./App.css";
import { Link, Navigate, Routes, Route, useLocation } from "react-router-dom";
import GiveawayDetails from "./GiveawayDetails.jsx";
import Auth from "./Auth.jsx";
import UserDashboard from "./UserDashboard.jsx";

import iphoneImage from "./assets/iphone.png";
import watchImage from "./assets/watch.png";
import airpodsImage from "./assets/airpods.png";
import amazonImage from "./assets/amazon.png";
import giftBoxImage from "./assets/gift-box.png";

import {
  Gift,
  Ticket,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Trophy,
  Menu,
  Coins,
} from "lucide-react";

const prizes = [
  {
    name: "iPhone",
    detail: "Win the latest Apple smartphone",
    fee: "250 VEs",
    image: iphoneImage,
    tag: "Popular",
  },
  {
    name: "Apple Watch",
    detail: "A smarter way to stay connected",
    fee: "200 VEs",
    image: watchImage,
    tag: "Featured",
  },
  {
    name: "AirPods",
    detail: "Experience premium wireless audio",
    fee: "500 SVEs",
    image: airpodsImage,
    tag: "Premium",
  },
  {
    name: "Amazon Gift Card",
    detail: "Shop your favourite products",
    fee: "500 VEs",
    image: amazonImage,
    tag: "Gift card",
  },
  {
    name: "₹500 Voucher",
    detail: "A little reward for you",
    fee: "300 VEs",
    image: giftBoxImage,
    tag: "Popular",
  },
  {
    name: "₹20 Voucher",
    detail: "Small rewards, exciting moments",
    fee: "2,000 Tokens",
    image: giftBoxImage,
    tag: "Token reward",
  },
];

function HomePage() {
  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Gift size={23} />
          </span>
          VELOOP<span className="brand-dot">.</span>
        </Link>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#giveaways">Giveaways</a>
          <a href="#how-it-works">How it works</a>
          <a href="#winners">Winners</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="signup-btn">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>

        <button className="mobile-menu" aria-label="Menu">
          <Menu />
        </button>
      </nav>

      <main>
        <section className="hero giveaway-hero" id="home">
          <div className="hero-glow"></div>

          <div className="giveaway-shell">
            <div className="giveaway-top-row">
              <div className="giveaway-code-pill">
                <Gift size={18} />
                <span>Giveaway Code</span>
              </div>

              <div className="giveaway-header-text">
                <Sparkles size={16} />
                <span>Unlock Amazing Rewards</span>
                <Sparkles size={16} />
              </div>
            </div>

            <div className="giveaway-main-row">
              <div className="giveaway-box-visual" aria-hidden="true">
                <div className="gift-illustration">
                  <div className="gift-lid"></div>
                  <div className="gift-bow"></div>
                  <div className="gift-body"></div>
                  <div className="gift-stars star-a"></div>
                  <div className="gift-stars star-b"></div>
                  <div className="gift-stars star-c"></div>
                  <div className="gift-stars star-d"></div>
                  <div className="gift-glow"></div>
                </div>
              </div>

              <div className="giveaway-copy">
                <h1>
                  Exclusive Giveaway
                  <span>Rewards</span>
                </h1>

                <p>
                  Enter special giveaway codes and unlock exciting VEs
                  rewards instantly.
                </p>

                <div className="benefits-row">
                  <div className="benefit-pill">
                    <ShieldCheck size={18} />
                    <span>100% Safe</span>
                    <small>Secure &amp; Trusted</small>
                  </div>

                  <div className="benefit-pill">
                    <Sparkles size={18} />
                    <span>Instant Rewards</span>
                    <small>Get Rewards Fast</small>
                  </div>

                  <div className="benefit-pill">
                    <Ticket size={18} />
                    <span>Exclusive VEs</span>
                    <small>Special for You</small>
                  </div>
                </div>

                <button className="enter-giveaway-btn">
                  Enter Giveaway
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="giveaway-voucher-visual" aria-hidden="true">
                <div className="voucher-card">
                  <div className="voucher-clip"></div>
                  <div className="voucher-ribbon"></div>
                  <div className="voucher-value">₹500</div>
                  <div className="voucher-mark">GIVEAWAY</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="stat-item">
            <Gift />
            <div>
              <strong>Exciting</strong>
              <span>Prizes to discover</span>
            </div>
          </div>

          <div className="stat-item">
            <Ticket />
            <div>
              <strong>Easy</strong>
              <span>Giveaway participation</span>
            </div>
          </div>

          <div className="stat-item">
            <ShieldCheck />
            <div>
              <strong>Secure</strong>
              <span>Account experience</span>
            </div>
          </div>

          <div className="stat-item">
            <Trophy />
            <div>
              <strong>Special</strong>
              <span>Winner celebrations</span>
            </div>
          </div>
        </section>

        <section className="giveaways-section" id="giveaways">
          <div className="section-heading">
            <div>
              <div className="section-label">
                THE REWARDS COLLECTION
              </div>

              <h2>
                Choose your <span>giveaway</span>
              </h2>

              <p>
                Find a reward you love and explore its giveaway details.
              </p>
            </div>

            <a href="#giveaways" className="view-all">
              View all <ArrowRight size={17} />
            </a>
          </div>

          <div className="prize-grid">
            {prizes.map((prize, index) => (
              <article className="prize-card" key={prize.name}>
                <div className="prize-top">
                  <span className="prize-tag">{prize.tag}</span>
                  <span className="prize-icon" aria-hidden="true">
                    <img className="prize-image" src={prize.image} alt={prize.name} />
                  </span>
                </div>

                <h3>{prize.name}</h3>
                <p>{prize.detail}</p>

                <div className="prize-footer">
                  <div className="entry-fee">
                    <Coins size={17} />
                    <span>{prize.fee}</span>
                  </div>

                  <Link
                    className="join-btn"
                    to={`/giveaway/${index}`}
                  >
                    View details <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-label">
            SIMPLE. EXCITING. REWARDING.
          </div>

          <h2>
            How <span>VELOOP</span> works
          </h2>

          <div className="steps">
            <div className="step-card">
              <div className="step-number">01</div>
              <Gift size={27} />
              <h3>Explore</h3>
              <p>
                Discover the giveaways and rewards available to you.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <Ticket size={27} />
              <h3>Choose</h3>
              <p>
                Check the rules, eligibility and entry fee for a prize.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <Trophy size={27} />
              <h3>Participate</h3>
              <p>
                Sign in and confirm your participation securely.
              </p>
            </div>
          </div>
        </section>

        <section className="bottom-banner" id="winners">
          <div>
            <div className="section-label">
              YOUR NEXT REWARD STARTS HERE
            </div>

            <h2>Ready for a little excitement?</h2>

            <p>
              Explore the rewards and find your next favourite giveaway.
            </p>
          </div>

          <a href="#giveaways" className="primary-btn">
            Explore Now <ArrowRight size={18} />
          </a>
        </section>
      </main>

      <footer>
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Gift size={20} />
          </span>
          VELOOP<span className="brand-dot">.</span>
        </Link>

        <p>Discover rewards. Enjoy the experience.</p>
        <span className="copyright">© 2026 VELOOP Rewards</span>
      </footer>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem("velopToken"));

  if (!hasToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

function GuestOnlyRoute({ children }) {
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem("velopToken"));

  if (hasToken) {
    return (
      <Navigate
        to={location.state?.from || "/dashboard"}
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/giveaway/:id"
        element={<GiveawayDetails />}
      />

      <Route
        path="/login"
        element={
          <GuestOnlyRoute>
            <Auth mode="login" />
          </GuestOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestOnlyRoute>
            <Auth mode="register" />
          </GuestOnlyRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;
