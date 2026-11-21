
import "./App.css";
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import GiveawayDetails from "./GiveawayDetails.jsx";
import Auth from "./Auth.jsx";
import UserDashboard from "./UserDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

import iphoneImage from "./assets/iphone.png";
import watchImage from "./assets/watch.png";
import airpodsImage from "./assets/airpods.png";
import amazonImage from "./assets/amazon.png";
import giftBoxImage from "./assets/gift-box.png";
import API_URL from "./api.js";
import { giveawayDemoData } from "./data/giveawayData.js";

import {
  Gift,
  Ticket,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Trophy,
  Menu,
  Coins,
  RefreshCw,
  ChevronDown,
  Scale,
  Eye,
  LockKeyhole,
} from "lucide-react";

const prizeAssets = [
  iphoneImage,
  watchImage,
  airpodsImage,
  amazonImage,
  giftBoxImage,
  giftBoxImage
];

function getCountdown(endDate) {
  const distance = Math.max(
    0,
    new Date(endDate).getTime() - Date.now()
  );

  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60)
  };
}

function HomePage() {
  const [giveaway, setGiveaway] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [giveawayLoading, setGiveawayLoading] = useState(true);
  const [giveawayError, setGiveawayError] = useState("");
  const [winnerTab, setWinnerTab] = useState("current");
  const [winnerSlideIndex, setWinnerSlideIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const loadGiveaway = async () => {
    try {
      setGiveawayLoading(true);
      setGiveawayError("");

      const response = await fetch(`${API_URL}/api/giveaways/current`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load giveaway.");
      }

      setGiveaway(data.giveaway);
      setPrizes(data.prizes || []);
    } catch (error) {
      setGiveaway(null);
      setPrizes([]);
      setGiveawayError(error.message || "Unable to load giveaway.");
    } finally {
      setGiveawayLoading(false);
    }
  };

  useEffect(() => {
    loadGiveaway();
  }, []);

  useEffect(() => {
    if (!giveaway?.endDate) return;

    const updateCountdown = () => setCountdown(getCountdown(giveaway.endDate));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [giveaway]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWinnerSlideIndex((previous) =>
        (previous + 1) % giveawayDemoData.winners.length
      );
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

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

                <a className="enter-giveaway-btn" href="#giveaways">
                  Enter Giveaway
                  <ArrowRight size={18} />
                </a>
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
              <strong>{prizes.length || "—"}</strong>
              <span>Available prizes</span>
            </div>
          </div>

          <div className="stat-item">
            <Ticket />
            <div>
              <strong>{giveaway?.participantCount?.toLocaleString("en-IN") || "—"}</strong>
              <span>Participants</span>
            </div>
          </div>

          <div className="stat-item">
            <ShieldCheck />
            <div>
              <strong>{giveaway?.status ? giveaway.status.toUpperCase() : "—"}</strong>
              <span>Giveaway status</span>
            </div>
          </div>

          <div className="stat-item">
            <Trophy />
            <div>
              <strong>
                {giveaway
                  ? `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`
                  : "—"}
              </strong>
              <span>Ends in</span>
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

          {giveawayLoading ? (
            <div className="giveaway-loader" role="status" aria-live="polite">
              <div className="loader-gift">
                <Gift size={28} />
                <span></span>
              </div>
              <strong>Preparing today's rewards...</strong>
            </div>
          ) : giveawayError ? (
            <div className="giveaway-empty-state" role="alert">
              <h3>We couldn't load the giveaway information.</h3>
              <p>Please check your connection and try again.</p>
              <button type="button" className="primary-btn" onClick={loadGiveaway}>
                Try Again <RefreshCw size={16} />
              </button>
            </div>
          ) : prizes.length === 0 ? (
            <div className="giveaway-empty-state">
              <h3>No active giveaway is available</h3>
              <p>The next reward event is being prepared.</p>
            </div>
          ) : (
            <div className="prize-grid">
              {prizes.map((prize, index) => (
                <article className="prize-card" key={prize.prizeId || prize.name}>
                  <div className="prize-top">
                    <span className="prize-tag">
                      {index === 0 ? "1st Prize" : `${index + 1}${index === 1 ? "nd" : index === 2 ? "rd" : " Prize"}`}
                    </span>

                    <span className="prize-icon" aria-hidden="true">
                      <img
                        className="prize-image"
                        src={prizeAssets[index] || giftBoxImage}
                        alt={prize.name}
                      />
                    </span>
                  </div>

                  <h3>{prize.name}</h3>
                  <p>{prize.description}</p>

                  <div className="prize-footer">
                    <div className="entry-fee">
                      <Coins size={17} />
                      <span>{prize.entryFee.toLocaleString("en-IN")} {prize.currency}</span>
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
          )}
        </section>

        <section className="winners-section" id="winners">
          <div className="winners-heading">
            <div>
              <div className="section-label">WINNER ANNOUNCEMENTS</div>
              <h2>Reward <span>moments</span></h2>
            </div>

            <div className="winner-tabs" role="tablist" aria-label="Winner lists">
              <button
                type="button"
                role="tab"
                aria-selected={winnerTab === "current"}
                className={winnerTab === "current" ? "active" : ""}
                onClick={() => setWinnerTab("current")}
              >
                Current Giveaway
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={winnerTab === "previous"}
                className={winnerTab === "previous" ? "active" : ""}
                onClick={() => setWinnerTab("previous")}
              >
                Previous Winners
              </button>
            </div>
          </div>

          <div className="winner-announcement" aria-live="polite">
            <Trophy size={18} />
            <strong>{giveawayDemoData.winners[winnerSlideIndex].userId}</strong>
            <span>
              won {giveawayDemoData.winners[winnerSlideIndex].prize}
            </span>
            <small>Recent demo winner</small>
          </div>

          {winnerTab === "current" ? (
            giveaway?.status === "ended" ? (
              <div className="winner-list">
                {giveawayDemoData.winners.map((winner) => (
                  <article className="winner-card" key={`${winner.userId}-${winner.prize}`}>
                    <div className="winner-avatar"><Trophy size={20} /></div>
                    <div>
                      <strong>{winner.userId}</strong>
                      <span>Won {winner.prize}</span>
                    </div>
                    <time>{winner.date}</time>
                  </article>
                ))}
              </div>
            ) : (
              <div className="winner-pending">
                <Trophy size={30} />
                <div>
                  <strong>Winners have not been finalized</strong>
                  <p>Winner announcements will appear after the giveaway ends.</p>
                </div>
              </div>
            )
          ) : (
            <div className="winner-list">
              {giveawayDemoData.previousWinners.map((winner) => (
                <article className="winner-card" key={`${winner.userId}-${winner.prize}`}>
                  <div className="winner-avatar"><Trophy size={20} /></div>
                  <div>
                    <strong>{winner.userId}</strong>
                    <span>Won {winner.prize}</span>
                    <small>{winner.giveaway}</small>
                  </div>
                  <time>{winner.date}</time>
                </article>
              ))}
            </div>
          )}
          <p className="demo-note">Displayed winner examples are fictional demo data.</p>
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

        <section className="trust-section" id="rules">
          <div className="trust-copy">
            <div className="section-label">TRANSPARENT REWARD EXPERIENCE</div>
            <h2>Participation you can <span>understand</span></h2>
            <p>
              Every reward shows its entry requirement, eligibility conditions,
              and claim process before you participate.
            </p>
          </div>

          <div className="trust-grid">
            <article>
              <Scale size={22} />
              <h3>Clear rules</h3>
              <p>Entry fees and giveaway conditions are displayed before joining.</p>
            </article>
            <article>
              <LockKeyhole size={22} />
              <h3>Secure participation</h3>
              <p>Authenticated account actions protect participation and prize claims.</p>
            </article>
            <article>
              <Eye size={22} />
              <h3>Reward transparency</h3>
              <p>Prize quantities and winner announcements are presented clearly.</p>
            </article>
          </div>
        </section>

        <section className="faq-section">
          <div className="faq-heading">
            <div className="section-label">COMMON QUESTIONS</div>
            <h2>Giveaway <span>FAQ</span></h2>
          </div>

          <div className="faq-list">
            {[
              ["How do I participate?", "Open a reward, review the entry fee and rules, then confirm participation from the individual giveaway page."],
              ["How are winners selected?", "Winner selection and verification are controlled by VELOOP according to the completed giveaway's configured rules."],
              ["When are winners announced?", "Winners appear after the giveaway ends and the announcement is finalized."],
              ["What happens after I win?", "A winner can submit the required physical-delivery or gift-card claim details from their account."],
              ["Can I participate in multiple giveaways?", "Participation rules apply per giveaway event. A new giveaway is a separate participation opportunity."]
            ].map(([question, answer], index) => (
              <article className={`faq-item ${openFaq === index ? "open" : ""}`} key={question}>
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                >
                  <span>{question}</span>
                  <ChevronDown size={18} />
                </button>
                {openFaq === index && <p>{answer}</p>}
              </article>
            ))}
          </div>
        </section>

        <section className="bottom-banner">
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

// Read the authenticated user's information.
function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("velopUser") || "null"
    );
  } catch {
    return null;
  }
}

// Protect dashboard routes.
function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();

  const hasToken = Boolean(
    localStorage.getItem("velopToken")
  );

  const user = getStoredUser();

  if (!hasToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  return children;
}

// Redirect already logged-in users away from login/register.
function GuestOnlyRoute({ children }) {
  const hasToken = Boolean(
    localStorage.getItem("velopToken")
  );

  const user = getStoredUser();

  if (hasToken) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

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

      {/* Normal user dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Separate admin dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<HomePage />}
      />
    </Routes>
  );
}

export default App;
