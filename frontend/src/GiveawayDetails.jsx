
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
} from "lucide-react";
import "./GiveawayDetails.css";
import API_URL from "./api.js";

const prizeIcons = ["📱", "⌚", "🎧", "🎁", "💳", "🎟️"];

function GiveawayDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [giveaway, setGiveaway] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);

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

  const prizeIndex = Number(id);

  const validIndex =
    Number.isInteger(prizeIndex) &&
    prizeIndex >= 0 &&
    prizeIndex < prizes.length;

  const prize = validIndex ? prizes[prizeIndex] : null;

  const handleJoin = async () => {
    const token = localStorage.getItem("velopToken");

    if (!token) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    if (!giveaway || !prize) return;

    const confirmed = window.confirm(
      `Join ${prize.name} giveaway for ${prize.entryFee} ${prize.currency}?`
    );

    if (!confirmed) return;

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

      setFeedback({
        type: "success",
        message:
          `${data.message}. Remaining ${data.data.currency}: ` +
          data.data.remainingBalance,
      });
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
      <main className="details-page">
        <p>Loading giveaway details...</p>
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

  return (
    <main className="details-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} />
        Back to giveaways
      </Link>

      <div className="details-layout">
        <section className="details-prize-card">
          <div className="details-prize-icon">
            {prizeIcons[prizeIndex] || "🎁"}
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
                {Number(prize.entryFee).toLocaleString("en-IN")}{" "}
                {prize.currency}
              </strong>
            </div>
          </div>

          <button
            className="details-join-button"
            onClick={handleJoin}
            disabled={joining || giveaway.status !== "active"}
          >
            {joining
              ? "Joining..."
              : giveaway.status !== "active"
                ? "Giveaway Closed"
                : localStorage.getItem("velopToken")
                  ? "Join Giveaway"
                  : "Login to Participate"}
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
    </main>
  );
}

export default GiveawayDetails;
