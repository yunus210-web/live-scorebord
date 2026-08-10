import { useState } from 'react';
import './EventData.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function EventData() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
  try {
    const response = await fetch(
      `${SERVER_URL}/api/scoreboard`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch event data.');
    }

    const data = await response.json();

    const backup = {
      eventName: data.eventName || 'HIM MEELAD FEST',
      eventTitle: data.eventTitle || 'നൂറെ റസൂൽ',
      teams: data.teams || [],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'him-meelad-fest-backup.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    setMessage(`❌ ${error.message}`);
  }
};

  const handleImport = async () => {
    if (!file) {
      setMessage('Please select a JSON file.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data.teams)) {
        throw new Error('Invalid backup: teams data not found.');
      }

      const response = await fetch(
        `${SERVER_URL}/api/scoreboard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventName: data.eventName || 'HIM MEELAD FEST',
            eventTitle: data.eventTitle || 'നൂറെ റസൂൽ',
            teams: data.teams,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Server update failed.');
      }

      setMessage('✅ Event data imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-data">

      <header className="event-data-header">

        <div>
          <p>ADMIN CONTROL PANEL</p>

          <h1>📁 Event Data</h1>

          <span>
            HIM MEELAD FEST · നൂറെ റസൂൽ
          </span>
        </div>

      </header>

      <main className="event-data-content">

        <section className="event-data-card">

          <div className="event-data-icon">
            📁
          </div>

          <h2>Import Event Data</h2>

          <p>
            Import a previously saved JSON backup
            and restore the event scoreboard.
          </p>

          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setMessage('');
            }}
          />

          {file && (
            <p className="selected-file">
              📄 {file.name}
            </p>
          )}

          <button
          className='export-button'
          onClick={handleExport}

          ></button>

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