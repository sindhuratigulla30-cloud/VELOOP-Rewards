
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gift,
  Wallet,
  User,
  LogOut,
  Ticket,
  ArrowRight,
  Coins,
  ShieldCheck,
  History,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import "./UserDashboard.css";
import API_URL from "./api.js";

function formatDate(value) {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [participationLoading, setParticipationLoading] =
    useState(true);
  const [transactionLoading, setTransactionLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [participationError, setParticipationError] = useState("");
  const [transactionError, setTransactionError] = useState("");

  const token = localStorage.getItem("velopToken");

  const handleLogout = () => {
    localStorage.removeItem("velopToken");
    localStorage.removeItem("velopUser");
    navigate("/login", { replace: true });
  };

  const fetchDashboard = async () => {
    const authToken = localStorage.getItem("velopToken");

    if (!authToken) {
      navigate("/login", { replace: true, state: { from: "/dashboard" } });
      return;
    }

    const headers = {
      Authorization: `Bearer ${authToken}`
    };

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/users/me`, {
        headers
      });

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load profile.");
      }

      setUser(data.user);
    } catch (err) {
      setError(err.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }

    // Load participation history separately.
    try {
      setParticipationLoading(true);
      setParticipationError("");

      const response = await fetch(
        `${API_URL}/api/users/me/participations`,
        { headers }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load participation history."
        );
      }

      setParticipations(data.participations || []);
    } catch (err) {
      setParticipationError(err.message);
    } finally {
      setParticipationLoading(false);
    }

    // Load wallet transaction history separately.
    try {
      setTransactionLoading(true);
      setTransactionError("");

      const response = await fetch(
        `${API_URL}/api/users/me/transactions`,
        { headers }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load wallet history."
        );
      }

      setTransactions(data.transactions || []);
    } catch (err) {
      setTransactionError(err.message);
    } finally {
      setTransactionLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Load once when the dashboard opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-loading">
        <p>{error}</p>
        <button onClick={handleLogout}>Login again</button>
      </div>
    );
  }

  if (!user) return null;

  const wallet = user.wallet || {};

  return (
    <div className="user-dashboard">
      <header className="dashboard-header">
        <Link to="/" className="dashboard-logo">
          <Gift size={25} /> VELOOP<span>.</span>
        </Link>

        <div className="dashboard-header-actions">
          <button
            className="dashboard-refresh"
            onClick={fetchDashboard}
            title="Refresh dashboard"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">
              MEMBER DASHBOARD
            </p>
            <h1>Welcome, {user.name}!</h1>
            <p>Explore giveaways and manage your rewards.</p>
          </div>

          <div className="dashboard-avatar">
            <User size={35} />
          </div>
        </section>

        {/* Profile */}
        <section className="dashboard-profile">
          <div className="dashboard-section-title">
            <User size={20} />
            <h2>My Profile</h2>
          </div>

          <div className="profile-details">
            <div>
              <span>Full Name</span>
              <strong>{user.name}</strong>
            </div>

            <div>
              <span>Email Address</span>
              <strong>{user.email}</strong>
            </div>

            <div>
              <span>Phone Number</span>
              <strong>{user.phone || "Not provided"}</strong>
            </div>

            <div>
              <span>Account Status</span>
              <strong className="account-active">
                {user.status || "Active"}
              </strong>
            </div>
          </div>
        </section>

        {/* Wallet */}
        <section className="dashboard-wallet">
          <div className="dashboard-section-title">
            <Wallet size={20} />
            <h2>My Wallet</h2>
          </div>

          <div className="wallet-grid">
            <div className="wallet-card">
              <Coins size={24} />
              <span>VEs Balance</span>
              <h2>
                {Number(wallet.VEs ?? 0).toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="wallet-card">
              <Ticket size={24} />
              <span>SVEs Balance</span>
              <h2>
                {Number(wallet.SVEs ?? 0).toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="wallet-card">
              <Gift size={24} />
              <span>Tokens Balance</span>
              <h2>
                {Number(wallet.Tokens ?? 0).toLocaleString("en-IN")}
              </h2>
            </div>
          </div>
        </section>

        {/* Participation History */}
        <section className="dashboard-history">
          <div className="dashboard-section-title">
            <Ticket size={20} />
            <h2>My Participations</h2>
            <span className="history-count">
              {participations.length}
            </span>
          </div>

          {participationLoading ? (
            <p className="history-message">
              Loading your participations...
            </p>
          ) : participationError ? (
            <p className="history-error">
              {participationError}
            </p>
          ) : participations.length === 0 ? (
            <div className="history-empty">
              <Gift size={35} />
              <h3>No participations yet</h3>
              <p>
                Join a giveaway to see your entries here.
              </p>
              <Link to="/" className="history-link">
                Explore Giveaways <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="history-list">
              {participations.map((item) => (
                <article
                  className="history-item"
                  key={item.id}
                >
                  <div className="history-item-icon">
                    <Gift size={22} />
                  </div>

                  <div className="history-item-info">
                    <h3>
                      {item.prize?.name || "Giveaway Prize"}
                    </h3>
                    <p>
                      {item.giveaway?.title || "VELOOP Giveaway"}
                    </p>
                    <small>
                      Joined: {formatDate(item.joinedAt)}
                    </small>
                  </div>

                  <div className="history-item-side">
                    <strong>
                      {item.entryFee} {item.currency}
                    </strong>
                    <span
                      className={`status-pill status-${item.status}`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Wallet Transactions */}
        <section className="dashboard-history">
          <div className="dashboard-section-title">
            <History size={20} />
            <h2>Wallet Transaction History</h2>
            <span className="history-count">
              {transactions.length}
            </span>
          </div>

          {transactionLoading ? (
            <p className="history-message">
              Loading wallet transactions...
            </p>
          ) : transactionError ? (
            <p className="history-error">
              {transactionError}
            </p>
          ) : transactions.length === 0 ? (
            <div className="history-empty">
              <Wallet size={35} />
              <h3>No transactions yet</h3>
              <p>
                Your wallet credits, entries and refunds will
                appear here.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {transactions.map((item) => (
                <article
                  className="history-item"
                  key={item.id}
                >
                  <div className="history-item-icon">
                    {item.type === "debit" ? (
                      <ArrowRight size={22} />
                    ) : item.type === "refund" ? (
                      <RefreshCw size={22} />
                    ) : (
                      <Coins size={22} />
                    )}
                  </div>

                  <div className="history-item-info">
                    <h3>
                      {item.description || item.type}
                    </h3>
                    <p>
                      {item.prize || item.giveaway || "Wallet transaction"}
                    </p>
                    <small>
                      {formatDate(item.createdAt)}
                    </small>
                  </div>

                  <div className="history-item-side">
                    <strong
                      className={
                        item.type === "debit"
                          ? "amount-debit"
                          : "amount-credit"
                      }
                    >
                      {item.type === "debit" ? "−" : "+"}
                      {item.amount} {item.currency}
                    </strong>

                    <span
                      className={`status-pill status-${item.status}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Explore */}
        <section className="dashboard-action">
          <div>
            <ShieldCheck size={30} />
            <h2>Discover Your Next Reward</h2>
            <p>
              Explore available prizes and enter your favourite
              giveaways.
            </p>
          </div>

          <Link to="/" className="explore-button">
            Explore Giveaways <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;
