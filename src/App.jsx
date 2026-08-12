import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Display from './Display';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ScoreManagement from './components/ScoreManagent';
import TeamsManagement from './components/TeamsManagement';
import EventData from './components/EventData';
import ResultManagement from './components/ResultManagement';
import './App.css';

const SERVER_URL = 'https://live-scorebord-production.up.railway.app';

function App() {
  const [data, setData] = useState(null);
  const [scores, setScores] = useState({});
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  // Connect to live scoreboard server
  useEffect(() => {
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socket.on('scoreboard:update', (scoreboard) => {
      console.log('LIVE UPDATE:', scoreboard);

      if (scoreboard.teams) {
        setData({
          teams: scoreboard.teams,
        });

        const newScores = {};

        scoreboard.teams.forEach((team, index) => {
          const id = team._id || `team-${index}`;
          newScores[id] = Number(team.points) || 0;
        });

        setScores(newScores);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJsonImport = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setError('');

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        setData(jsonData);

        const initialScores = {};

        (jsonData.teams || []).forEach((team, index) => {
          const id = team._id || `team-${index}`;

          initialScores[id] = Number(team.points) || 0;
        });

        setScores(initialScores);

        // Send imported data to backend
        fetch(`${SERVER_URL}/api/scoreboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventName:
              jsonData.eventName || 'HIM MEELAD FEST',

            eventTitle:
              jsonData.eventTitle || 'നൂറെ റസൂൽ',

            teams: jsonData.teams || [],
          }),
        });

      } catch (err) {
        console.error(err);

        setError(
          'Invalid JSON file. Please select a valid JSON file.'
        );

        setData(null);
        setScores({});
      }
    };

    reader.readAsText(file);
  };

  const updateScore = (teamId, amount) => {
    setScores((previousScores) => {
      const newScores = {
        ...previousScores,
        [teamId]: Math.max(
          0,
          (previousScores[teamId] || 0) + amount
        ),
      };

      // Create updated teams
      const updatedTeams = (data?.teams || []).map(
        (team, index) => {
          const id = team._id || `team-${index}`;

          return {
            ...team,
            points: newScores[id] || 0,
          };
        }
      );

      // Send score update to backend
      fetch(`${SERVER_URL}/api/scoreboard`, {
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

      return newScores;
    });
  };

  const teams = (data?.teams || [])
    .map((team, index) => {
      const id = team._id || `team-${index}`;

      return {
        ...team,
        id,
        currentPoints: scores[id] || 0,
      };
    })
    .sort((a, b) => b.currentPoints - a.currentPoints);

  return (
    <div className="app">

      <header className="hero">
        <p className="subtitle">
          HAYATHUL ISLAM MADRASSA,PANTHAVOOR
        </p>

        <h1>NOORE RASOOL </h1>

        <p className="event-title">
          HIM MEELAD FEST'26 
        </p>

        <span>
          LIVE SCOREBOARD
        </span>

        <div
          style={{
            marginTop: '15px',
            fontSize: '13px',
            color: connected
              ? '#5cff9d'
              : '#ff5c72',
          }}
        >
          {connected
            ? '● SERVER CONNECTED'
            : '● SERVER DISCONNECTED'}
        </div>
      </header>

      <main className="scoreboard">

        <div className="import-box">

          <h2>
            📁 Import Event Data
          </h2>

          <p>
            Select your JSON backup file
          </p>

          <label className="upload-button">

            Choose JSON File

            <input
              type="file"
              accept=".json,application/json"
              onChange={handleJsonImport}
            />

          </label>

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          {data && (
            <div className="import-success">
              ✓ JSON imported successfully
            </div>
          )}

        </div>

        <div className="section-title">

          <h2>
            🏆 Live Score
          </h2>

          <span className="live">
            ● LIVE
          </span>

        </div>

        {teams.length > 0 ? (

          teams.map((team, index) => (

            <div
              className="team-card"
              key={team.id}
            >

              <div className="rank">

                {index === 0
                  ? '🥇'
                  : index === 1
                  ? '🥈'
                  : index === 2
                  ? '🥉'
                  : `#${index + 1}`}

              </div>

              <div className="team-info">

                <h3>
                  {team.name}
                </h3>

                <p>
                  {team.category || 'Team'}
                </p>

                <div className="score-controls">

                  <button
                    onClick={() =>
                      updateScore(team.id, -5)
                    }
                  >
                    −5
                  </button>

                  <button
                    onClick={() =>
                      updateScore(team.id, 5)
                    }
                  >
                    +5
                  </button>

                  <button
                    onClick={() =>
                      updateScore(team.id, 10)
                    }
                  >
                    +10
                  </button>

                </div>

              </div>

              <strong className="points">
                {team.currentPoints}
              </strong>

            </div>

          ))

        ) : (

          <div className="empty-state">

            <div>📊</div>

            <h3>
              No scoreboard data yet
            </h3>

            <p>
              Import your JSON file to load the teams.
            </p>

          </div>

        )}

      </main>

    </div>
  );
}

function AppRouter() {
  const path = window.location.pathname;

  if (path === '/display') {
    return <Display />;
  }

  if (path === '/admin') {
    return (
      <AdminLogin
        onLogin={() => {
          window.location.href = '/admin/dashboard';
        }}
      />
    );
  }

   if(path === '/admin/scores') {
    return <ScoreManagement />;
  }

  if(path === '/admin/event-data') {
    return <EventData />
  }

  if(path === '/admin/results') {
    return <ResultManagement />
  }

  if(path === '/admin/teams') {
    return <TeamsManagement />
  }

  if(path === '/admin/dashboard'){
    return <AdminDashboard/>;
  }

 

  return <App />;
}

export default AppRouter;
