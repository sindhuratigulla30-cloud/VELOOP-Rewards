
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Coins,
  CheckCircle,
  Gift,
} from "lucide-react";
import "./GiveawayDetails.css";
import API_URL from "./api.js";
import iphoneImage from "./assets/iphone.png";
import watchImage from "./assets/watch.png";
import airpodsImage from "./assets/airpods.png";
import amazonImage from "./assets/amazon.png";
import giftBoxImage from "./assets/gift-box.png";

const prizeImages = [
  iphoneImage,
  watchImage,
  airpodsImage,
  amazonImage,
  giftBoxImage,
  giftBoxImage,
];

function GiveawayDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [giveaway, setGiveaway] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // Fetch current giveaway and prizes.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchGiveaway() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/giveaways/current`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load giveaway."
          );
        }

        setGiveaway(data.giveaway);
        setPrizes(data.prizes || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load giveaway.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchGiveaway();

    return () => controller.abort();
  }, []);

  // Fetch the actual logged-in user's wallet.
  useEffect(() => {
    const token = localStorage.getItem("velopToken");

    if (!token) {
      setWallet(null);
      setWalletLoading(false);
      setWalletError("");
      return;
    }

    const controller = new AbortController();

    async function fetchWallet() {
      try {
        setWalletLoading(true);
        setWalletError("");

        const response = await fetch(
          `${API_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load wallet."
          );
        }

        if (!data.user || !data.user.wallet) {
          throw new Error("Wallet information is unavailable.");
        }

        setWallet(data.user.wallet);
      } catch (err) {
        if (err.name !== "AbortError") {
          setWalletError(
            err.message || "Unable to load wallet."
          );
          setWallet(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setWalletLoading(false);
        }
      }
    }

    fetchWallet();

    return () => controller.abort();
  }, []);

  const prizeIndex = Number(id);

  const validIndex =
    Number.isInteger(prizeIndex) &&
    prizeIndex >= 0 &&
    prizeIndex < prizes.length;

  const prize = validIndex ? prizes[prizeIndex] : null;

  // Open login or participation confirmation.
  const handleJoin = () => {
    const token = localStorage.getItem("velopToken");

    if (!token) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    if (!giveaway || !prize || !wallet) return;
    if (walletLoading || walletError || !sufficientBalance) return;

    setConfirmationOpen(true);
  };

  // Confirm and join the giveaway.
  const confirmJoin = async () => {
    const token = localStorage.getItem("velopToken");

    if (!token || !giveaway || !prize || !wallet) return;

    try {
      setJoining(true);
      setFeedback(null);

      const response = await fetch(
        `${API_URL}/api/giveaways/${giveaway._id}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Idempotency-Key": `${giveaway._id}-${prize.prizeId}-${token.slice(-12)}`,
          },
          body: JSON.stringify({
            prizeId: prize.prizeId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to join giveaway."
        );
      }

      // Update the displayed wallet after successful participation.
      setWallet((previousWallet) => ({
        ...previousWallet,
        [data.data.currency]: data.data.remainingBalance,
      }));

      setFeedback({
        type: "success",
        message:
          `${data.message}. Remaining ${data.data.currency}: ` +
          data.data.remainingBalance,
      });

      setConfirmationOpen(false);
    } catch (err) {
      if (
        err.message.toLowerCase().includes("token") ||
        err.message.toLowerCase().includes("log in")
      ) {
        localStorage.removeItem("velopToken");
        localStorage.removeItem("velopUser");

        navigate("/login", {
          state: { from: location.pathname },
        });
        return;
      }

      setFeedback({
        type: "error",
        message: err.message || "Something went wrong.",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <main className="details-page details-loading">
        <div
          className="giveaway-loader"
          role="status"
          aria-live="polite"
        >
          <div className="loader-gift">
            <Gift size={28} />
            <span></span>
          </div>
          <strong>Loading available prizes...</strong>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="details-page">
        <h2>Unable to load giveaway</h2>
        <p>{error}</p>
        <button
          className="details-join-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
        <br />
        <Link to="/">Return to homepage</Link>
      </main>
    );
  }

  if (!giveaway || !prize) {
    return (
      <main className="details-page">
        <h2>Giveaway not found</h2>
        <p>This prize is not available.</p>
        <Link to="/">Return to homepage</Link>
      </main>
    );
  }

  const rules = giveaway.rules || [];
  const terms = giveaway.termsAndConditions || [];

  // Use the actual wallet balance, never demo data.
  const balance = Number(wallet?.[prize.currency] ?? 0);
  const entryFee = Number(prize.entryFee);
  const sufficientBalance = balance >= entryFee;
  const balanceAfter = Math.max(0, balance - entryFee);

  const canJoin =
    !!wallet &&
    !walletLoading &&
    !walletError &&
    sufficientBalance;

  return (
    <main className="details-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} />
        Back to giveaways
      </Link>

      <div className="details-layout">
        <section className="details-prize-card">
          <div className="details-prize-icon">
            <img
              src={prizeImages[prizeIndex] || giftBoxImage}
              alt={prize.name}
            />
          </div>

          <span className="details-status">
            {giveaway.status === "active"
              ? "ACTIVE GIVEAWAY"
              : "GIVEAWAY INFORMATION"}
          </span>

          <h1>{prize.name}</h1>
          <p>{prize.description}</p>

          <div className="details-fee">
            <Coins size={20} />
            <div>
              <small>ENTRY FEE</small>
              <strong>
                {entryFee.toLocaleString("en-IN")}{" "}
                {prize.currency}
              </strong>
            </div>
          </div>

          <div
            className={`balance-status ${
              canJoin ? "sufficient" : "insufficient"
            }`}
          >
            <ShieldCheck size={17} />

            <div>
              <small>Your Balance</small>

              <strong>
                {walletLoading
                  ? "Loading..."
                  : walletError
                    ? "Unavailable"
                    : wallet
                      ? `${balance.toLocaleString("en-IN")} ${prize.currency}`
                      : `0 ${prize.currency}`}
              </strong>

              <span>
                {walletLoading
                  ? "Checking your wallet balance..."
                  : walletError
                    ? "Unable to verify wallet balance."
                    : !wallet
                      ? "Login to view your wallet balance."
                      : sufficientBalance
                        ? `Enough ${prize.currency} available`
                        : `Need ${(entryFee - balance).toLocaleString("en-IN")} more ${prize.currency}`}
              </span>
            </div>
          </div>

          <button
            className="details-join-button"
            onClick={handleJoin}
            disabled={
              joining ||
              walletLoading ||
              !!walletError ||
              !wallet ||
              giveaway.status !== "active" ||
              !sufficientBalance
            }
          >
            {joining
              ? "Joining..."
              : giveaway.status !== "active"
                ? "Giveaway Closed"
                : walletLoading
                  ? "Checking Balance..."
                  : walletError
                    ? "Wallet Unavailable"
                    : !wallet
                      ? "Login to Participate"
                      : !sufficientBalance
                        ? `Earn More ${prize.currency}`
                        : `Join for ${entryFee.toLocaleString("en-IN")} ${prize.currency}`}
          </button>

          {feedback && (
            <div
              className={`join-feedback ${
                feedback.type === "success"
                  ? "join-success"
                  : "join-error"
              }`}
            >
              {feedback.type === "success" && (
                <CheckCircle size={18} />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <small className="secure-note">
            <ShieldCheck size={15} />
            Secure participation
          </small>
        </section>

        <section className="details-information">
          <div className="information-card">
            <span className="section-label">
              ABOUT THIS GIVEAWAY
            </span>
            <h2>{giveaway.title}</h2>
            <p>{giveaway.description}</p>
            <p>
              Review the participation rules and eligibility
              requirements before joining.
            </p>
          </div>

          <div className="information-card">
            <h2>Giveaway Rules</h2>
            <ul>
              {rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="information-card">
            <h2>Important Information</h2>
            <p>
              Participation is subject to account verification,
              eligibility checks and sufficient wallet balance.
            </p>
            <p>
              Giveaway Status:{" "}
              <strong>{giveaway.status.toUpperCase()}</strong>
            </p>
            <p>
              Ends on:{" "}
              {new Date(giveaway.endDate).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="information-card">
            <h2>How This Giveaway Works</h2>
            <ol className="giveaway-timeline">
              <li><span>01</span>Review the prize and entry fee</li>
              <li><span>02</span>Check your account eligibility</li>
              <li><span>03</span>Confirm participation and fee</li>
              <li><span>04</span>Wait until the giveaway ends</li>
              <li><span>05</span>Claim if you are selected</li>
            </ol>
          </div>

          <div className="information-card">
            <h2>About the Prize</h2>
            <p>{prize.description}</p>
            <p>
              Claim requirements depend on whether this is a physical
              prize, digital reward, or gift card.
            </p>
          </div>

          <div className="information-card">
            <h2>Terms and Conditions</h2>

            {terms.length > 0 ? (
              <ul>
                {terms.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            ) : (
              <p>
                Participation is subject to the official giveaway
                rules and verification process.
              </p>
            )}
          </div>
        </section>
      </div>

      {confirmationOpen && (
        <div
          className="claim-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmationOpen(false);
            }
          }}
        >
          <section
            className="claim-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-participation-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close confirmation"
              onClick={() => setConfirmationOpen(false)}
            >
              ×
            </button>

            <span className="section-label">
              CONFIRM PARTICIPATION
            </span>

            <h2 id="confirm-participation-title">
              {prize.name}
            </h2>

            <div className="confirmation-grid">
              <div>
                <small>Entry Fee</small>
                <strong>
                  {entryFee.toLocaleString("en-IN")}{" "}
                  {prize.currency}
                </strong>
              </div>

              <div>
                <small>Your Balance</small>
                <strong>
                  {balance.toLocaleString("en-IN")}{" "}
                  {prize.currency}
                </strong>
              </div>

              <div>
                <small>Balance After Joining</small>
                <strong>
                  {balanceAfter.toLocaleString("en-IN")}{" "}
                  {prize.currency}
                </strong>
              </div>
            </div>

            <p className="confirmation-note">
              By continuing, you confirm that you have reviewed
              the giveaway rules and terms.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setConfirmationOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="details-join-button"
                onClick={confirmJoin}
                disabled={joining || !canJoin}
              >
                {joining
                  ? "Joining Giveaway..."
                  : "Confirm & Join"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default GiveawayDetails;
