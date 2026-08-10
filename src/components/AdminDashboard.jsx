import { useEffect, useState } from 'react';
import './Admin.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

  
  function AdminDashboard() {
  const [connected, setConnected] = useState(false);
  const [teams, setTeams] = useState([]);
  
  useEffect(() => {
  const loadScoreboard = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/api/scoreboard`
      );

      const data = await response.json();

      setTeams(data.teams || []);
      setConnected(true);
    } catch (error) {
      console.error('Failed to load scoreboard:', error);
      setConnected(false);
    }
  };

  loadScoreboard();
}, []);


  const handleLogout = () => {
    window.location.href = '/admin';
  };

  return (
    <div className="admin-dashboard">

      <header className="admin-header">

        <div>
          <p className="admin-label">
            ADMIN CONTROL PANEL
          </p>

          <h1>
            🏆 Live Scoreboard
          </h1>

          <p className="admin-event">
            HIM MEELAD FEST · Noore Rasool
          </p>
        </div>

        <div className="admin-header-actions">

          <span
            className={
              connected
                ? 'admin-status connected'
                : 'admin-status'
            }
          >
            ● {connected ? 'SERVER CONNECTED' : 'SERVER DISCONNECTED'}
          </span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="admin-content">

        <section className="admin-welcome">

          <h2>
            Welcome, Admin 👋
          </h2>

          <p>
            From here you can control the live scoreboard
            and TV display.
          </p>

        </section>

        <section className="admin-grid">

          <div className="admin-panel">
            <div className="panel-icon">🏆</div>

            <h3>
              Score Management
            </h3>

            <p>
              Update team points and manage live scores.
            </p>

            <button className="panel-button"
              onClick={() => {
                window.location.href = '/admin/scores';
              }}
             >
              
              Manage Scores
            </button>
          </div>

          <div className="admin-panel">
            <div className="panel-icon">📺</div>

            <h3>
              TV Display
            </h3>

            <p>
              Open the full-screen scoreboard for TV or projector.
            </p>

            <button
              className="panel-button"
              onClick={() => {
                window.open('/display', '_blank');
              }}
            >
              Open TV Display
            </button>
          </div>

          <div className="admin-panel">
            <div className="panel-icon">📊</div>

            <h3>
              Teams
            </h3>

            <p>
              View and manage participating teams.
            </p>

            <button className="panel-button"
            onClick={() => {
              window.location.href = '/admin/teams';
            }}

            >
              Manage Teams
            </button>
          </div>

          <div className="admin-panel">
            <div className="panel-icon">📁</div>

            <h3>
              Event Data
            </h3>

            <p>
              Import event data from a JSON backup.
            </p>

            <button className="panel-button"
            onClick={() => {
              window.location.href = '/admin/event-data';
            }}

            >
              Import Data
            </button>
          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;