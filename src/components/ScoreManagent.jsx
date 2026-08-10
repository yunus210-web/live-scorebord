import { useEffect, useState } from 'react';
import './ScoreManagement.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function ScoreManagement() {
  const [teams, setTeams] = useState([]);
  const [connected, setConnected] = useState(false);

  // Get a unique ID for each team
  const getTeamId = (team, index) => {
    return (
      team._id ||
      team.loginId ||
      team.name ||
      `team-${index}`
    );
  };

  // Load scoreboard
  const loadScoreboard = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/api/scoreboard`
      );

      if (!response.ok) {
        throw new Error('Failed to load scoreboard');
      }

      const data = await response.json();

      setTeams(data.teams || []);
      setConnected(true);
    } catch (error) {
      console.error(
        'Failed to load scoreboard:',
        error
      );

      setConnected(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadScoreboard();
  }, []);

  // Update score
  const updateScore = async (teamId, amount) => {
    const updatedTeams = teams.map(
      (team, index) => {
        const currentId = getTeamId(
          team,
          index
        );

        if (currentId === teamId) {
          return {
            ...team,
            points: Math.max(
              0,
              Number(team.points || 0) + amount
            ),
          };
        }

        return team;
      }
    );

    // Update UI immediately
    setTeams(updatedTeams);

    try {
      const response = await fetch(
        `${SERVER_URL}/api/scoreboard`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            eventName:
              'HIM MEELAD FEST',

            eventTitle:
              'നൂറെ റസൂൽ',

            teams: updatedTeams,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Score update failed'
        );
      }

      console.log(
        'Score updated successfully'
      );

    } catch (error) {
      console.error(
        'Score update failed:',
        error
      );

      // Reload server data if update fails
      loadScoreboard();
    }
  };

  // Sort teams by points
  const sortedTeams = [...teams].sort(
    (a, b) =>
      Number(b.points || 0) -
      Number(a.points || 0)
  );

  return (
    <div className="score-management">

      {/* HEADER */}
      <header className="score-management-header">

        <div>

          <p>
            ADMIN CONTROL PANEL
          </p>

          <h1>
            🏆 Score Management
          </h1>

          <span>
            HIM MEELAD FEST · നൂറെ റസൂൽ
          </span>

        </div>

        <div className="score-status">

          ●{' '}
          {connected
            ? 'SERVER CONNECTED'
            : 'SERVER DISCONNECTED'}

        </div>

      </header>


      {/* CONTENT */}
      <main className="score-management-content">

        <div className="score-page-title">

          <h2>
            Live Team Scores
          </h2>

          <button
            onClick={loadScoreboard}
          >
            🔄 Refresh
          </button>

        </div>


        {/* NO TEAMS */}
        {sortedTeams.length === 0 ? (

          <div className="score-empty">

            <div>
              📊
            </div>

            <h3>
              No teams found
            </h3>

            <p>
              Import event data first.
            </p>

          </div>

        ) : (

          /* TEAMS */
          sortedTeams.map(
            (team, index) => {

              const teamId =
                getTeamId(
                  team,
                  index
                );

              return (

                <div
                  className="score-team-card"
                  key={teamId}
                >

                  {/* RANK */}
                  <div className="score-rank">

                    {index === 0
                      ? '🥇'
                      : index === 1
                      ? '🥈'
                      : index === 2
                      ? '🥉'
                      : `#${index + 1}`}

                  </div>


                  {/* TEAM INFO */}
                  <div className="score-team-info">

                    <h3>
                      {team.name}
                    </h3>

                    <p>
                      {team.category ||
                        'TEAM'}
                    </p>

                  </div>


                  {/* SCORE BUTTONS */}
                  <div className="score-controls">

                    {/* -5 */}
                    <button
                      onClick={() =>
                        updateScore(
                          teamId,
                          -5
                        )
                      }
                    >
                      −5
                    </button>


                    {/* +5 */}
                    <button
                      onClick={() =>
                        updateScore(
                          teamId,
                          5
                        )
                      }
                    >
                      +5
                    </button>


                    {/* +10 */}
                    <button
                      onClick={() =>
                        updateScore(
                          teamId,
                          10
                        )
                      }
                    >
                      +10
                    </button>

                  </div>


                  {/* POINTS */}
                  <div className="score-points">

                    {Number(
                      team.points || 0
                    )}

                  </div>

                </div>

              );
            }
          )

        )}

      </main>

    </div>
  );
}

export default ScoreManagement;