import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import './Display.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function Display() {

  // =========================================
  // SCOREBOARD STATE
  // =========================================

  const [teams, setTeams] = useState([]);

  const [connected, setConnected] =
    useState(false);

  const [changedTeams, setChangedTeams] =
    useState({});

  const [celebration, setCelebration] =
    useState(false);


  // =========================================
  // EVENT COUNTDOWN
  // =========================================

  const COUNTDOWN_TARGET = new Date(
    '2026-08-27T19:00:00+05:30'
  ).getTime();


  const [countdown, setCountdown] =
    useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });


  // =========================================
  // INITIAL SCOREBOARD LOAD
  // =========================================

  const loadScoreboard = async () => {

    try {

      console.log(
        '📊 Loading initial scoreboard...'
      );

      const response = await fetch(
        `${SERVER_URL}/api/scoreboard`
      );


      if (!response.ok) {

        throw new Error(
          'Failed to load scoreboard'
        );

      }


      const data =
        await response.json();


      console.log(
        '📊 INITIAL SCOREBOARD:',
        data
      );


      if (
        Array.isArray(data.teams)
      ) {

        const sortedTeams =
          [...data.teams].sort(
            (a, b) =>
              Number(b.points || 0) -
              Number(a.points || 0)
          );


        setTeams(sortedTeams);

      } else {

        setTeams([]);

      }


      setConnected(true);

    } catch (error) {

      console.error(
        '❌ Initial scoreboard load failed:',
        error
      );

      setConnected(false);

    }

  };


  // =========================================
  // LOAD SCOREBOARD ON PAGE OPEN
  // =========================================

  useEffect(() => {

    loadScoreboard();

  }, []);


  // =========================================
  // COUNTDOWN
  // =========================================

  useEffect(() => {

    const updateCountdown = () => {

      const now =
        new Date().getTime();

      const difference =
        COUNTDOWN_TARGET - now;


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
          difference /
          (1000 * 60 * 60 * 24)
        ),

        hours: Math.floor(
          (difference /
            (1000 * 60 * 60)) %
          24
        ),

        minutes: Math.floor(
          (difference /
            (1000 * 60)) %
          60
        ),

        seconds: Math.floor(
          (difference /
            1000) %
          60
        ),

      });

    };


    updateCountdown();


    const timer =
      setInterval(
        updateCountdown,
        1000
      );


    return () =>
      clearInterval(timer);

  }, []);


  // =========================================
  // SOCKET.IO LIVE SCORE
  // =========================================

  useEffect(() => {

    console.log(
      '🔌 Connecting to scoreboard server...'
    );


    const socket =
      io(SERVER_URL);


    // -----------------------------------------
    // CONNECTED
    // -----------------------------------------

    socket.on(
      'connect',
      () => {

        console.log(
          '🟢 TV Display connected'
        );

        setConnected(true);

      }
    );


    // -----------------------------------------
    // DISCONNECTED
    // -----------------------------------------

    socket.on(
      'disconnect',
      () => {

        console.log(
          '🔴 TV Display disconnected'
        );

        setConnected(false);

      }
    );


    // -----------------------------------------
    // LIVE SCORE UPDATE
    // -----------------------------------------

    socket.on(
      'scoreboard:update',
      (scoreboard) => {

        console.log(
          '📡 TV LIVE UPDATE:',
          scoreboard
        );


        if (
          !scoreboard ||
          !Array.isArray(
            scoreboard.teams
          )
        ) {

          console.warn(
            '⚠️ No teams in scoreboard update'
          );

          return;

        }


        setTeams(
          (previousTeams) => {

            // =================================
            // PREVIOUS SCORE MAP
            // =================================

            const previousMap = {};


            previousTeams.forEach(
              (team) => {

                const teamId =
                  team._id ||
                  team.id;


                previousMap[
                  teamId
                ] =
                  Number(
                    team.points || 0
                  );

              }
            );


            // =================================
            // DETECT SCORE CHANGES
            // =================================

            const changed = {};


            scoreboard.teams.forEach(
              (team) => {

                const teamId =
                  team._id ||
                  team.id;


                const oldPoints =
                  previousMap[
                    teamId
                  ];


                const newPoints =
                  Number(
                    team.points || 0
                  );


                if (
                  oldPoints !== undefined &&
                  oldPoints !== newPoints
                ) {

                  changed[
                    teamId
                  ] =
                    newPoints >
                    oldPoints
                      ? 'up'
                      : 'down';

                }

              }
            );


            // =================================
            // SCORE CHANGE CELEBRATION
            // =================================

            if (
              Object.keys(changed)
                .length > 0
            ) {

              console.log(
                '🎉 SCORE CHANGED:',
                changed
              );


              setChangedTeams(
                changed
              );


              setCelebration(
                true
              );


              setTimeout(
                () => {

                  setChangedTeams(
                    {}
                  );

                  setCelebration(
                    false
                  );

                },
                900
              );

            }


            // =================================
            // SORT BY POINTS
            // =================================

            return [
              ...scoreboard.teams
            ].sort(
              (a, b) =>
                Number(
                  b.points || 0
                ) -
                Number(
                  a.points || 0
                )
            );

          }
        );

      }
    );


    // =========================================
    // CLEANUP
    // =========================================

    return () => {

      console.log(
        '🔌 Disconnecting TV Display socket'
      );

      socket.disconnect();

    };

  }, []);


  // =========================================
  // JSX
  // =========================================

  return (

    <div className="tv-display">


      {/* =====================================
          🎉 SCORE CHANGE CELEBRATION
      ====================================== */}

      {celebration && (

        <div className="celebration-container">

          {Array.from({
            length: 35
          }).map(
            (_, index) => (

              <span
                key={index}
                className="confetti"
                style={{
                  left:
                    `${Math.random() * 100}%`,

                  animationDelay:
                    `${Math.random() * 0.25}s`,

                  animationDuration:
                    `${0.7 +
                      Math.random() *
                      0.7}s`,
                }}
              />

            )
          )}

        </div>

      )}


      {/* =====================================
          HEADER
      ====================================== */}

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


      {/* =====================================
          SCOREBOARD
      ====================================== */}

      <main className="tv-scoreboard">


        {/* ===================================
            ⏳ EVENT COUNTDOWN
        ==================================== */}

        {Date.now() <
          COUNTDOWN_TARGET && (

          <section className="event-countdown">


            <div className="countdown-heading">

              <span>
                ⏳
              </span>

              <span>
                EVENT COUNTDOWN
              </span>

            </div>


            <div className="countdown-values">


              {/* DAYS */}

              <div className="countdown-box">

                <div className="countdown-number">

                  {String(
                    countdown.days
                  ).padStart(
                    2,
                    '0'
                  )}

                </div>

                <div className="countdown-label">
                  DAYS
                </div>

              </div>


              <div className="countdown-colon">
                :
              </div>


              {/* HOURS */}

              <div className="countdown-box">

                <div className="countdown-number">

                  {String(
                    countdown.hours
                  ).padStart(
                    2,
                    '0'
                  )}

                </div>

                <div className="countdown-label">
                  HOURS
                </div>

              </div>


              <div className="countdown-colon">
                :
              </div>


              {/* MINUTES */}

              <div className="countdown-box">

                <div className="countdown-number">

                  {String(
                    countdown.minutes
                  ).padStart(
                    2,
                    '0'
                  )}

                </div>

                <div className="countdown-label">
                  MINUTES
                </div>

              </div>


              <div className="countdown-colon">
                :
              </div>


              {/* SECONDS */}

              <div className="countdown-box">

                <div className="countdown-number">

                  {String(
                    countdown.seconds
                  ).padStart(
                    2,
                    '0'
                  )}

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


        {/* ===================================
            POINT TABLE TITLE
        ==================================== */}

        <div className="tv-board-title">

          🏆 POINT TABLE 🏆

        </div>


        {/* ===================================
            NO TEAMS
        ==================================== */}

        {teams.length === 0 ? (

          <div className="tv-loading">

            WAITING FOR LIVE SCORE...

          </div>

        ) : (


          /* =================================
             TEAM LIST
          ================================== */

          teams.map(
            (team, index) => {


              const teamId =
                team._id ||
                team.id ||
                index;


              return (

                <div
                  className={`
                    tv-team
                    ${
                      index === 0
                        ? 'first-place'
                        : ''
                    }
                    ${
                      changedTeams[
                        teamId
                      ]
                        ? `
                          score-changed
                          ${
                            changedTeams[
                              teamId
                            ]
                          }
                        `
                        : ''
                    }
                  `}
                  key={teamId}
                >


                  {/* =========================
                      RANK
                  ========================== */}

                  <div className="tv-rank">

                    {index === 0
                      ? '🥇'
                      : index === 1
                      ? '🥈'
                      : index === 2
                      ? '🥉'
                      : `#${index + 1}`}

                  </div>


                  {/* =========================
                      TEAM NAME
                  ========================== */}

                  <div className="tv-team-name">

                    <h3>

                      {team.name ||
                        team.teamName ||
                        'TEAM'}

                    </h3>


                    <span>

                      {team.category ||
                        'TEAM'}

                    </span>

                  </div>


                  {/* =========================
                      POINTS
                  ========================== */}

                  <div className="points-area">


                    {/* SCORE UP */}

                    {changedTeams[
                      teamId
                    ] === 'up' && (

                      <span
                        className="
                          score-arrow
                          score-up
                        "
                      />

                    )}


                    {/* SCORE DOWN */}

                    {changedTeams[
                      teamId
                    ] === 'down' && (

                      <span
                        className="
                          score-arrow
                          score-down
                        "
                      />

                    )}


                    {/* POINTS */}

                    <div
                      className={`
                        tv-points
                        ${
                          changedTeams[
                            teamId
                          ]
                            ? 'points-changed'
                            : ''
                        }
                      `}
                    >

                      {Number(
                        team.points || 0
                      )}

                    </div>


                  </div>


                </div>

              );

            }

          )

        )}


      </main>


      {/* =====================================
          FOOTER
      ====================================== */}

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