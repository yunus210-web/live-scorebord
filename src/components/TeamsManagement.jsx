import { useEffect, useState } from 'react';
import './TeamsManagement.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function TeamsManagement() {
  const [teams, setTeams] = useState([]);
  const [connected, setConnected] = useState(false);

  const loadTeams = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/api/scoreboard`
      );

      const data = await response.json();

      setTeams(data.teams || []);
      setConnected(true);
    } catch (error) {
      console.error('Failed to load teams:', error);
      setConnected(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <div className="teams-management">

      <header className="teams-header">

        <div>
          <p>ADMIN CONTROL PANEL</p>

          <h1>📊 Teams Management</h1>

          <span>
            NOORE RASOOL  · HIM MEELAD FEST'26
          </span>
        </div>

        <div
          className={
            connected
              ? 'teams-status connected'
              : 'teams-status'
          }
        >
          ● {connected
            ? 'SERVER CONNECTED'
            : 'SERVER DISCONNECTED'}
        </div>

      </header>

      <main className="teams-content">

        <div className="teams-title">

          <div>
            <h2>Participating Teams</h2>

            <p>
              View all teams and their current points.
            </p>
          </div>

          <button onClick={loadTeams}>
            🔄 Refresh
          </button>

        </div>

        {teams.length === 0 ? (

          <div className="teams-empty">
            <div>📊</div>

            <h3>No teams found</h3>

            <p>
              Import event data first.
            </p>
          </div>

        ) : (

          <div className="teams-list">

            {teams.map((team, index) => (

              <div
                className="team-management-card"
                key={team._id || index}
              >

                <div className="team-number">
                  #{index + 1}
                </div>

                <div className="team-details">

                  <h3>
                    {team.name}
                  </h3>

                  <p>
                    {team.category || 'TEAM'}
                  </p>

                </div>

                <div className="team-points">
                  {Number(team.points || 0)}
                  <small>POINTS</small>
                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default TeamsManagement;