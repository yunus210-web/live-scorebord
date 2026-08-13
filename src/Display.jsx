import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Display.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function Display() {
  const [teams, setTeams] = useState([]);
  const [publishedResult, setPublishedResult] = useState(null);
  const [connected, setConnected] = useState(false);
  const [changedTeams, setChangedTeams] = useState({});
  const [celebration, setCelebration] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('TV Display connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('TV Display disconnected');
      setConnected(false);
    });

    socket.on('scoreboard:update', (scoreboard) => {
      console.log('TV LIVE UPDATE:', scoreboard);

      if (scoreboard?.publishedResult) {
        console.log(
          'TV PUBLISHED RESULT:',
          scoreboard.publishedResult
        );
        setPublishedResult(
         scoreboard.publishedResult
        );
      } 
      if(!scoreboard?.teams){
        return;
      }
      setTeams((previousTeams) => {
        // -----------------------------------------
        // Previous scores
        // -----------------------------------------

        const previousMap = {};

        previousTeams.forEach((team) => {
          previousMap[team._id] =
            Number(team.points || 0);
        });

        // -----------------------------------------
        // Detect score changes
        // -----------------------------------------

        const changed = {};

        scoreboard.teams.forEach((team) => {
          const oldPoints =
            previousMap[team._id];

          const newPoints =
            Number(team.points || 0);

          if (
            oldPoints !== undefined &&
            oldPoints !== newPoints
          ) {
            changed[team._id] =
              newPoints > oldPoints
                ? 'up'
                : 'down';
          }
        });

        // -----------------------------------------
        // Celebration
        // -----------------------------------------

        if (Object.keys(changed).length > 0) {
          setChangedTeams(changed);

          setCelebration(true);

          setTimeout(() => {
            setChangedTeams({});
            setCelebration(false);
          }, 900);
        }

        // -----------------------------------------
        // Sort teams by score
        // -----------------------------------------

        return [...scoreboard.teams].sort(
          (a, b) =>
            Number(b.points || 0) -
            Number(a.points || 0)
        );
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="tv-display">

      {/* =========================================
          🎉 CELEBRATION
      ========================================= */}

      {celebration && (
        <div className="celebration-container">

          {Array.from({ length: 35 }).map(
            (_, index) => (
              <span
                key={index}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay:
                    `${Math.random() * 0.25}s`,
                  animationDuration:
                    `${0.7 + Math.random() * 0.7}s`,
                }}
              />
            )
          )}

        </div>
      )}

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="tv-header">

        <div className="sabha">
          HAYATHUL ISLAM SABHA PANTHAVOOR
        </div>

        <div className="madrassa">
          HAYATHUL ISLAM MADRASSA, PANTHAVOOR
        </div>

        <h1>
          NOORE RASOOL 
        </h1>

        <h2>
          HIM MEELAD FEST'26
        </h2>

        <div className="live-status">

          <span>
            ●
          </span>

          LIVE SCORE

          <small>
            {connected
              ? ' SERVER CONNECTED'
              : ' SERVER DISCONNECTED'}
          </small>

        </div>

      </header>

      {/* =========================================
          SCOREBOARD
      ========================================= */}

      <main className="tv-scoreboard">
        {/* =========================================
    🏆 PUBLISHED RESULT
========================================= */}

{publishedResult && (
  <section className="published-result">

    <div className="published-result-title">
      🏆 RESULT PUBLISHED 🏆
    </div>

    <div className="published-result-competition">
      {publishedResult.competition}
    </div>

    <div className="winner-list">

      {/* 1st */}
      {publishedResult.first && (
        <div className="winner-card first">
          <div className="winner-medal">🥇</div>

          <div className="winner-position">
            1st PLACE
          </div>

          <div className="winner-name">
            {publishedResult.first.name}
          </div>

          <div className="winner-team">
            {publishedResult.first.team}
          </div>

          {publishedResult.first.chest && (
            <div className="winner-chest">
              Chest {publishedResult.first.chest}
            </div>
          )}
        </div>
      )}

      {/* 2nd */}
      {publishedResult.second && (
        <div className="winner-card second">
          <div className="winner-medal">🥈</div>

          <div className="winner-position">
            2nd PLACE
          </div>

          <div className="winner-name">
            {publishedResult.second.name}
          </div>

          <div className="winner-team">
            {publishedResult.second.team}
          </div>

          {publishedResult.second.chest && (
            <div className="winner-chest">
              Chest {publishedResult.second.chest}
            </div>
          )}
        </div>
      )}

      {/* 3rd */}
      {publishedResult.third && (
        <div className="winner-card third">
          <div className="winner-medal">🥉</div>

          <div className="winner-position">
            3rd PLACE
          </div>

          <div className="winner-name">
            {publishedResult.third.name}
          </div>

          <div className="winner-team">
            {publishedResult.third.team}
          </div>

          {publishedResult.third.chest && (
            <div className="winner-chest">
              Chest {publishedResult.third.chest}
            </div>
          )}
        </div>
      )}

    </div>

  </section>
)}
        <div className="tv-board-title">
          🏆 POINT TABLE 🏆
        </div>

        {teams.length === 0 ? (

          <div className="tv-loading">
            WAITING FOR LIVE SCORE...
          </div>

        ) : (

          teams.map((team, index) => (

            <div
              className={`
                tv-team
                ${index === 0
                  ? 'first-place'
                  : ''}
                ${changedTeams[team._id]
                  ? `score-changed ${changedTeams[team._id]}`
                  : ''}
              `}
              key={team._id || index}
            >

              {/* =================================
                  RANK
              ================================= */}

              <div className="tv-rank">

                {index === 0
                  ? '🥇'
                  : index === 1
                  ? '🥈'
                  : index === 2
                  ? '🥉'
                  : `#${index + 1}`}

              </div>

              {/* =================================
                  TEAM NAME
              ================================= */}

              <div className="tv-team-name">

                <h3>
                  {team.name}
                </h3>

                <span>
                  {team.category || 'TEAM'}
                </span>

              </div>

              {/* =================================
                  SCORE + ARROW
              ================================= */}

              <div className="points-area">

                {changedTeams[team._id] ===
                  'up' && (
                  <span
                    className="
                      score-arrow
                      score-up
                    "
                  >
                    
                  </span>
                )}

                {changedTeams[team._id] ===
                  'down' && (
                  <span
                    className="
                      score-arrow
                      score-down
                    "
                  >
                    
                  </span>
                )}

                <div
                  className={`
                    tv-points
                    ${changedTeams[team._id]
                      ? 'points-changed'
                      : ''}
                  `}
                >
                  {Number(
                    team.points || 0
                  )}
                </div>

              </div>

            </div>

          ))

        )}

      </main>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="tv-footer">

        <span>
          🏆 HIM MEELAD FEST
        </span>

        <span>
          {connected
            ? '🟢 LIVE • REAL TIME SCORE'
            : '🔴 DISCONNECTED'}
        </span>

      </footer>

    </div>
  );
}

export default Display;