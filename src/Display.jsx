import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Display.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function Display() {
  const [teams, setTeams] = useState([]);
  console.log("DISPLAY TEAMS:",teams);
  console.log("DISPLAY TEAMS COUNT:",teams.length);
  
  const [connected, setConnected] = useState(false);
  const [changedTeams, setChangedTeams] = useState({});
  const [celebration, setCelebration] = useState(false);
  // =========================================
// ⏳ EVENT COUNTDOWN
// =========================================

const COUNTDOWN_TARGET = new Date(
  '2026-08-27T19:00:00+05:30'
).getTime();

const [countdown, setCountdown] = useState({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});

useEffect(() => {

  const updateCountdown = () => {

    const now = new Date().getTime();
    const difference = COUNTDOWN_TARGET - now;

    if (difference <= 0) {
      setCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });

      return;
    }

    setCountdown({
      days: Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ),

      hours: Math.floor(
        (difference / (1000 * 60 * 60)) % 24
      ),

      minutes: Math.floor(
        (difference / (1000 * 60)) % 60
      ),

      seconds: Math.floor(
        (difference / 1000) % 60
      ),
    });
  };

  updateCountdown();

  const timer = setInterval(
    updateCountdown,
    1000
  );

  return () => clearInterval(timer);

}, []);

  useEffect(() => {
    const loadTeams = async () => {

    try {

      const response = await fetch(
        `${SERVER_URL}/api/teams`
      );

      if (!response.ok) {
        throw new Error(
          `Teams API returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log("INITIAL TEAMS API:", data);

      const initialTeams =
        Array.isArray(data)
          ? data
          : data.teams || data.data || [];

      const sortedTeams = [...initialTeams].sort(
        (a, b) =>
          Number(b.points || 0) -
          Number(a.points || 0)
      );

      setTeams(sortedTeams);

    } catch (error) {

      console.error(
        "FAILED TO LOAD INITIAL TEAMS:",
        error
      );

    }

  };

  // Initial load
  loadTeams();


  
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
    ⏳ EVENT COUNTDOWN
========================================= */}
{Date.now()< COUNTDOWN_TARGET &&(
<section className="event-countdown">

  <div className="countdown-heading">
    <span>⏳</span>
    <span>EVENT COUNTDOWN</span>
  </div>

  <div className="countdown-values">

    <div className="countdown-box">
      <div className="countdown-number">
        {String(countdown.days).padStart(2, '0')}
      </div>
      <div className="countdown-label">
        DAYS
      </div>
    </div>

    <div className="countdown-colon">:</div>

    <div className="countdown-box">
      <div className="countdown-number">
        {String(countdown.hours).padStart(2, '0')}
      </div>
      <div className="countdown-label">
        HOURS
      </div>
    </div>

    <div className="countdown-colon">:</div>

    <div className="countdown-box">
      <div className="countdown-number">
        {String(countdown.minutes).padStart(2, '0')}
      </div>
      <div className="countdown-label">
        MINUTES
      </div>
    </div>

    <div className="countdown-colon">:</div>

    <div className="countdown-box">
      <div className="countdown-number">
        {String(countdown.seconds).padStart(2, '0')}
      </div>
      <div className="countdown-label">
        SECONDS
      </div>
    </div>

  </div>

  <div className="countdown-event-name">
    HIM MEELAD FEST
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