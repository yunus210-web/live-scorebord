import { useState } from 'react';
import './EventData.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function EventData() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!file) {
      setMessage('Please select a JSON file.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const text = await file.text();

      const jsonData = JSON.parse(text);

      // Same logic as the original working import
      const teams = jsonData.teams || [];

      if (!Array.isArray(teams) || teams.length === 0) {
        throw new Error(
          'No teams found in the JSON file.'
        );
      }

      // Send imported data to backend
      const response = await fetch(
        `${SERVER_URL}/api/scoreboard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventName:
              jsonData.eventName ||
              'HIM MEELAD FEST',

            eventTitle:
              jsonData.eventTitle ||
              'നൂറെ റസൂൽ',

            teams: teams,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Server update failed.'
        );
      }

      const result = await response.json();

      console.log(
        'Imported scoreboard:',
        result
      );

      setMessage(
        `✅ ${teams.length} teams imported successfully!`
      );

    } catch (error) {
      console.error(
        'Import failed:',
        error
      );

      setMessage(
        `❌ ${error.message}`
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-data">

      <header className="event-data-header">

        <div>

          <p>
            ADMIN CONTROL PANEL
          </p>

          <h1>
            📁 Event Data
          </h1>

          <span>
            NOORE RASOOL  · HIM MEELAD FEST'26
          </span>

        </div>

      </header>

      <main className="event-data-content">

        <section className="event-data-card">

          <div className="event-data-icon">
            📁
          </div>

          <h2>
            Import Event Data
          </h2>

          <p>
            Select your JSON backup file
            to restore the event data.
          </p>

          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {

              const selectedFile =
                e.target.files[0];

              setFile(selectedFile);
              setMessage('');

            }}
          />

          {file && (
            <p className="selected-file">
              📄 {file.name}
            </p>
          )}

          <button
            className="import-button"
            onClick={handleImport}
            disabled={loading}
          >

            {loading
              ? 'Importing...'
              : '📥 Import Data'}

          </button>

          {message && (
            <div className="import-message">
              {message}
            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default EventData;