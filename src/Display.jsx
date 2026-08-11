import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Display.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function Display() {
  const [teams, setTeams] = useState([]);
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

      if (!scoreboard?.teams) return;

      setTeams((previousTeams) => {
        const previousMap = {};

        previousTeams.forEach((team) => {
          previousMap[team._id] = Number(team.points || 0);
        });

        const changed = {};

        scoreboard.teams.forEach((team) => {
          const oldPoints = previousMap[team._id];
          const newPoints = Number(team.points || 0);

          if (
            oldPoints !== undefined &&
            oldPoints !== newPoints
          ) {
            changed[team._id] = true;
          }
        });

        if (Object.keys(changed).length > 0) {
          setChangedTeams(changed);

          setCelebration(true);

          setTimeout(() => {
            setChangedTeams({});
          }, 900);
        }

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

    {celebration && (
      <div className="celebration-container">
        {Array.from({ length: 35 }).map((_, index) => (
          <span
            key={index}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.25}s`,
              animationDuration: `${0.7 + Math.random() * 0.7}s`,
            }}
          />
        ))}
      </div>
    )}

      {/* HEADER */}

      <header className="tv-header">

        <div className="sabha">
          PANTHAVOOR ISLAM SABHA
        </div>

        <div className="madrassa">
          HAYATHUL ISLAM MADRASSA, PANTHAVOOR
        </div>

        <h1>
          HIM MEELAD FEST
        </h1>

        <h2>
          നൂറെ റസൂൽ
        </h2>

        <div className="live-status">
          <span>●</span>
          LIVE SCORE

          <small>
            {connected
              ? ' SERVER CONNECTED'
              : ' SERVER DISCONNECTED'}
          </small>
        </div>

      </header>

      {/* SCOREBOARD */}

      <main className="tv-scoreboard">

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
                ${index === 0 ? 'first-place' : ''}
                ${changedTeams[team._id]
                  ? 'score-changed'
                  : ''}
              `}
              key={team._id || index}
            >

              <div className="tv-rank">

                {index === 0
                  ? '🥇'
                  : index === 1
                  ? '🥈'
                  : index === 2
                  ? '🥉'
                  : `#${index + 1}`}

              </div>

              <div className="tv-team-name">

                <h3>
                  {team.name}
                </h3>

                <span>
                  {team.category || 'TEAM'}
                </span>

              </div>

              <div
                className={`
                  tv-points
                  ${changedTeams[team._id]
                    ? 'points-changed'
                    : ''}
                `}
              >
                {Number(team.points || 0)}
              </div>

            </div>

          ))

        )}

      </main>

      {/* FOOTER */}

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