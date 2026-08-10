import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Display.css';

const SERVER_URL = 'https://him-meelad-fest-26-production.up.railway.app';

function Display() {
  const [teams, setTeams] = useState([]);
  const [connected, setConnected] = useState(false);

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

      if (scoreboard?.teams) {
        const sortedTeams = [...scoreboard.teams].sort(
          (a, b) =>
            Number(b.points || 0) -
            Number(a.points || 0)
        );

        setTeams(sortedTeams);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="tv-display">

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
          <span>●</span> LIVE SCORE
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
              className={`tv-team ${
                index === 0
                  ? 'first-place'
                  : ''
              }`}
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

              <div className="tv-points">
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