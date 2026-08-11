import { useEffect, useState } from 'react';
import './ScoreManagement.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function ScoreManagement() {
  const [teams, setTeams] = useState([]);
  const [connected, setConnected] = useState(false);
  const [customPoints, setCustomPoints] = useState({});

  // -----------------------------------------
  // Get unique team ID
  // -----------------------------------------

  const getTeamId = (team, index) => {
    return (
      team._id ||
      team.loginId ||
      team.name ||
      `team-${index}`
    );
  };

  // -----------------------------------------
  // Load scoreboard
  // -----------------------------------------

  const loadScoreboard = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/api/scoreboard`
      );

      if (!response.ok) {
        throw new Error(
          'Failed to load scoreboard'
        );
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

  // -----------------------------------------
  // Initial load
  // -----------------------------------------

  useEffect(() => {
    loadScoreboard();
  }, []);

  // -----------------------------------------
  // Update score
  // -----------------------------------------

  const updateScore = async (
    teamId,
    amount
  ) => {
    if (!amount || Number.isNaN(Number(amount))) {
      return;
    }

    const scoreChange = Number(amount);

    const updatedTeams = teams.map(
      (team, index) => {
        const currentId =
          getTeamId(team, index);

        if (currentId === teamId) {
          const currentPoints =
            Number(team.points || 0);

          return {
            ...team,

            points: Math.max(
              0,
              currentPoints + scoreChange
            ),
          };
        }

        return team;
      }
    );

    // -----------------------------------------
    // Update UI immediately
    // -----------------------------------------

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
        `Score updated: ${scoreChange}`
      );

    } catch (error) {
      console.error(
        'Score update failed:',
        error
      );

      // Restore server data
      loadScoreboard();
    }
  };

  // -----------------------------------------
  // Custom score
  // -----------------------------------------

  const handleCustomScore = (
    teamId
  ) => {
    const value =
      customPoints[teamId];

    if (
      value === undefined ||
      value === '' ||
      Number.isNaN(Number(value))
    ) {
      return;
    }

    const amount = Number(value);

    if (amount === 0) {
      return;
    }

    updateScore(
      teamId,
      amount
    );

    // Clear input after adding
    setCustomPoints(
      (previous) => ({
        ...previous,
        [teamId]: '',
      })
    );
  };

  // -----------------------------------------
  // Custom input change
  // -----------------------------------------

  const handleCustomInput = (
    teamId,
    value
  ) => {
    setCustomPoints(
      (previous) => ({
        ...previous,
        [teamId]: value,
      })
    );
  };

  // -----------------------------------------
  // Enter key support
  // -----------------------------------------

  const handleCustomKeyDown = (
    event,
    teamId
  ) => {
    if (event.key === 'Enter') {
      handleCustomScore(teamId);
    }
  };

  // -----------------------------------------
  // Sort teams by points
  // -----------------------------------------

  const sortedTeams = [...teams].sort(
    (a, b) =>
      Number(b.points || 0) -
      Number(a.points || 0)
  );

  return (
    <div className="score-management">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="score-management-header">

        <div>

          <p>
            ADMIN CONTROL PANEL
          </p>

          <h1>
            🏆 Score Management
          </h1>

          <span>
            NOORE RASOOL · HIM MEELAD FEST'26
          </span>

        </div>

        <div className="score-status">

          <span>
            ●
          </span>{' '}

          {connected
            ? 'SERVER CONNECTED'
            : 'SERVER DISCONNECTED'}

        </div>

      </header>

      {/* =====================================
          CONTENT
      ===================================== */}

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

        {/* ===================================
            NO TEAMS
        =================================== */}

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

          /* =================================
             TEAMS
          ================================= */

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

                  {/* =========================
                      RANK
                  ========================= */}

                  <div className="score-rank">

                    {index === 0
                      ? '🥇'
                      : index === 1
                      ? '🥈'
                      : index === 2
                      ? '🥉'
                      : `#${index + 1}`}

                  </div>

                  {/* =========================
                      TEAM INFO
                  ========================= */}

                  <div className="score-team-info">

                    <h3>
                      {team.name}
                    </h3>

                    <p>
                      {team.category ||
                        'TEAM'}
                    </p>

                  </div>

                  {/* =========================
                      CURRENT SCORE
                  ========================= */}

                  <div className="score-points">

                    {Number(
                      team.points || 0
                    )}

                  </div>

                  {/* =========================
                      QUICK SCORE
                  ========================= */}

                  <div className="score-controls">

                    {/* MINUS 10 */}

                    <button
                      className="score-minus"
                      onClick={() =>
                        updateScore(
                          teamId,
                          -10
                        )
                      }
                    >
                      −10
                    </button>

                    {/* MINUS 5 */}

                    <button
                      className="score-minus"
                      onClick={() =>
                        updateScore(
                          teamId,
                          -5
                        )
                      }
                    >
                      −5
                    </button>

                    {/* PLUS 1 */}

                    <button
                      className="score-plus"
                      onClick={() =>
                        updateScore(
                          teamId,
                          1
                        )
                      }
                    >
                      +1
                    </button>

                    {/* PLUS 3 */}

                    <button
                      className="score-plus"
                      onClick={() =>
                        updateScore(
                          teamId,
                          3
                        )
                      }
                    >
                      +3
                    </button>

                    {/* PLUS 5 */}

                    <button
                      className="score-plus"
                      onClick={() =>
                        updateScore(
                          teamId,
                          5
                        )
                      }
                    >
                      +5
                    </button>

                    {/* PLUS 10 */}

                    <button
                      className="score-plus"
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

                  {/* =========================
                      CUSTOM SCORE
                  ========================= */}

                  <div className="custom-score-control">

                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="Custom points"
                      value={
                        customPoints[
                          teamId
                        ] ?? ''
                      }
                      onChange={(event) =>
                        handleCustomInput(
                          teamId,
                          event.target.value
                        )
                      }
                      onKeyDown={(event) =>
                        handleCustomKeyDown(
                          event,
                          teamId
                        )
                      }
                    />

                    <button
                      onClick={() =>
                        handleCustomScore(
                          teamId
                        )
                      }
                    >
                      ADD
                    </button>

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