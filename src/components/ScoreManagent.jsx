import { useEffect, useState } from 'react';
import './ScoreManagement.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function ScoreManagement() {
  const [teams, setTeams] = useState([]);
  const [connected, setConnected] = useState(false);

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

  useEffect(() => {
    loadScoreboard();
  }, []);

  const updateScore = async (teamId, amount) => {
    const updatedTeams = teams.map((team) => {
      if (team._id === teamId) {
        return {
          ...team,
          points: Math.max(
            0,
            Number(team.points || 0) + amount
          ),
        };
      }

      return team;
    });

    setTeams(updatedTeams);

    try {
      await fetch(`${SERVER_URL}/api/scoreboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: 'HIM MEELAD FEST',
          eventTitle: 'നൂറെ റസൂൽ',
          teams: updatedTeams,
        }),
      });
    } catch (error) {
      console.error('Score update failed:', error);
    }
  };

  const sortedTeams = [...teams].sort(
    (a, b) =>
      Number(b.points || 0) -
      Number(a.points || 0)
  );

  return (
    <div className="score-management">

      <header className="score-management-header">

        <div>
          <p>ADMIN CONTROL PANEL</p>

          <h1>🏆 Score Management</h1>

          <span>
            HIM MEELAD FEST · നൂറെ റസൂൽ
          </span>
        </div>

        <div className="score-status">
          ● {connected
            ? 'SERVER CONNECTED'
            : 'SERVER DISCONNECTED'}
        </div>

      </header>

      <main className="score-management-content">

        <div className="score-page-title">
          <h2>Live Team Scores</h2>

          <button onClick={loadScoreboard}>
            🔄 Refresh
          </button>
        </div>

        {sortedTeams.length === 0 ? (

          <div className="score-empty">
            <div>📊</div>
            <h3>No teams found</h3>
            <p>
              Import event data first.
            </p>
          </div>

        ) : (

          sortedTeams.map((team, index) => (

            <div
              className="score-team-card"
              key={team._id || index}
            >

              <div className="score-rank">
                {index === 0
                  ? '🥇'
                  : index === 1
                  ? '🥈'
                  : index === 2
                  ? '🥉'
                  : `#${index + 1}`}
              </div>

              <div className="score-team-info">

                <h3>
                  {team.name}
                </h3>

                <p>
                  {team.category || 'TEAM'}
                </p>

              </div>

              <div className="score-controls">

                <button
                  onClick={() =>
                    updateScore(team._id, -5)
                  }
                >
                  −5
                </button>

                <button
                  onClick={() =>
                    updateScore(team._id, 5)
                  }
                >
                  +5
                </button>

                <button
                  onClick={() =>
                    updateScore(team._id, 10)
                  }
                >
                  +10
                </button>

              </div>

              <div className="score-points">
                {Number(team.points || 0)}
              </div>

            </div>

          ))

        )}

      </main>

    </div>
  );
}

export default ScoreManagement;