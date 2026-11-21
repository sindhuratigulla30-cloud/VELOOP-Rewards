
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Gift,
  Ticket,
  Trophy,
  Wallet,
  Clock,
  RefreshCw,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react";
import API_URL from "./api.js";
import "./AdminDashboard.css";

const initialStats = {
  totalMembers: 0,
  activeMembers: 0,
  totalGiveaways: 0,
  activeGiveaways: 0,
  completedGiveaways: 0,
  totalParticipations: 0,
  totalWinners: 0,
  pendingClaims: 0,
  totalTransactions: 0
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(initialStats);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMembers: 0
  });

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState("");
  const [membersError, setMembersError] = useState("");

  const token = localStorage.getItem("velopToken");

  const handleLogout = () => {
    localStorage.removeItem("velopToken");
    localStorage.removeItem("velopUser");
    navigate("/login", { replace: true });
  };

  const requestHeaders = {
    Authorization: `Bearer ${token}`
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/dashboard`,
        { headers: requestHeaders }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.status === 403) {
        setError("Admin access is required to view this dashboard.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load statistics.");
      }

      setStats({ ...initialStats, ...data.statistics });
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      setMembersError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        status
      });

      const response = await fetch(
        `${API_URL}/api/admin/members?${params}`,
        { headers: requestHeaders }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load members.");
      }

      setMembers(data.members || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalMembers: 0
      });
    } catch (err) {
      setMembersError(err.message || "Unable to load members.");
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchStatistics();
  }, []);

  useEffect(() => {
    if (token) {
      fetchMembers();
    }
  }, [page, search, status]);

  const statCards = [
    {
      label: "Total Members",
      value: stats.totalMembers,
      icon: Users
    },
    {
      label: "Active Members",
      value: stats.activeMembers,
      icon: Activity
    },
    {
      label: "Total Giveaways",
      value: stats.totalGiveaways,
      icon: Gift
    },
    {
      label: "Active Giveaways",
      value: stats.activeGiveaways,
      icon: Ticket
    },
    {
      label: "Completed Giveaways",
      value: stats.completedGiveaways,
      icon: Trophy
    },
    {
      label: "Total Participations",
      value: stats.totalParticipations,
      icon: Users
    },
    {
      label: "Total Winners",
      value: stats.totalWinners,
      icon: Trophy
    },
    {
      label: "Pending Claims",
      value: stats.pendingClaims,
      icon: Clock
    },
    {
      label: "Wallet Transactions",
      value: stats.totalTransactions,
      icon: Wallet
    }
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={23} />
          </div>
          <div>
            <h2>VELOOP <span>ADMIN</span></h2>
            <p>Rewards Management Panel</p>
          </div>
        </div>

        <div className="admin-header-right">
          <span className="admin-role">
            <ShieldCheck size={15} /> Administrator
          </span>

          <button className="admin-logout" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-welcome">
          <div>
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h1>Dashboard Overview</h1>
            <p>Monitor members, giveaways and platform activity.</p>
          </div>

          <button
            className="admin-refresh"
            onClick={() => {
              fetchStatistics();
              fetchMembers();
            }}
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </section>

        {error && (
          <div className="admin-error">{error}</div>
        )}

        <section className="admin-stats-grid">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className="admin-stat-card" key={card.label}>
                <div className="admin-stat-top">
                  <span>{card.label}</span>
                  <div className="admin-stat-icon">
                    <Icon size={21} />
                  </div>
                </div>

                <h2>
                  {loading ? "..." : card.value.toLocaleString("en-IN")}
                </h2>
              </article>
            );
          })}
        </section>

        <section className="admin-members-section">
          <div className="admin-section-heading">
            <div>
              <p className="admin-eyebrow">USER MANAGEMENT</p>
              <h2>Registered Members</h2>
              <p>Search and view registered VELOOP users.</p>
            </div>

            <div className="admin-member-count">
              {pagination.totalMembers} Members
            </div>
          </div>

          <div className="admin-member-filters">
            <div className="admin-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {membersError && (
            <div className="admin-error">{membersError}</div>
          )}

          <div className="admin-table-wrapper">
            <table className="admin-members-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>VEs</th>
                  <th>SVEs</th>
                  <th>Tokens</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {membersLoading ? (
                  <tr>
                    <td colSpan="8" className="admin-empty">
                      Loading members...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="admin-empty">
                      No members found.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member._id}>
                      <td className="admin-member-name">
                        {member.name}
                      </td>
                      <td>{member.email}</td>
                      <td>{member.phone || "—"}</td>
                      <td>{member.wallet?.VEs ?? 0}</td>
                      <td>{member.wallet?.SVEs ?? 0}</td>
                      <td>{member.wallet?.Tokens ?? 0}</td>
                      <td>
                        <span
                          className={`admin-status ${member.status}`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td>
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <span>
              Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
            </span>

            <div>
              <button
                disabled={page <= 1 || membersLoading}
                onClick={() => setPage((current) => current - 1)}
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <button
                disabled={page >= pagination.totalPages || membersLoading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        <footer className="admin-footer">
          VELOOP Rewards · Admin Control Panel
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
