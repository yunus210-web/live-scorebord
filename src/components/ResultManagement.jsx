import { useEffect, useMemo, useState } from 'react';
import './ResultManagement.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function ResultManagement() {
  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  const [category, setCategory] = useState('');
  const [competition,setCompetition] = useState('');
  const [group, setGroup] = useState('');

  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [third, setThird] = useState('');

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');

  // =========================================
  // LOAD EVENT DATA
  // =========================================

  const loadData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `${SERVER_URL}/api/scoreboard`
      );

      if (!response.ok) {
        throw new Error(
          'Failed to load event data.'
        );
      }

      const data = await response.json();

      setTeams(
        Array.isArray(data.teams)
          ? data.teams
          : []
      );

      setParticipants(
        Array.isArray(data.participants)
          ? data.participants
          : []
      );

      setCategories(
        Array.isArray(data.categories)
          ? data.categories
          : []
      );

      setCompetitions(
        Array.isArray(data.competitions)
        ? data.competitions
        : []
      )

    } catch (error) {
      console.error(
        'Failed to load result data:',
        error
      );

      setMessage(
        `❌ ${error.message}`
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================
  // CATEGORY LIST
  // =========================================

  const categoryOptions = useMemo(() => {
    const values = [];

    categories.forEach((item) => {
      if (typeof item === 'string') {
        values.push(item);
        return;
      }

      const value =
        item.name ||
        item.title ||
        item.category ||
        item.categoryName;

      if (value) {
        values.push(String(value));
      }
    });

    participants.forEach((participant) => {
      const value =
        participant.categoryName ||
        participant.category ||
        participant.categoryTitle;

      if (value) {
        values.push(
          typeof value === 'object'
            ? value.name || value.title
            : String(value)
        );
      }
    });

    return [...new Set(
      values.filter(Boolean)
    )].sort();

  }, [categories, participants]);

  // =========================================
  // GROUP LIST
  // =========================================

  const groupOptions = useMemo(() => {
    const values = [];

    participants.forEach((participant) => {
      const value =
        participant.group ||
        participant.groupName ||
        participant.gender ||
        participant.teamCategory;

      if (value) {
        values.push(String(value));
      }
    });

    teams.forEach((team) => {
      const value =
        team.group ||
        team.groupName ||
        team.category;

      if (value) {
        values.push(String(value));
      }
    });

    return [...new Set(
      values.filter(Boolean)
    )].sort();

  }, [participants, teams]);

  // =========================================
  // FILTER PARTICIPANTS
  // =========================================

  const filteredParticipants = useMemo(() => {

    return participants.filter(
      (participant) => {

        // Category filter
        if (category) {

          const participantCategory =
            participant.categoryName ||
            participant.category ||
            participant.categoryTitle;

          let categoryValue =
            participantCategory;

          if (
            typeof categoryValue ===
            'object'
          ) {
            categoryValue =
              categoryValue.name ||
              categoryValue.title;
          }

          if (
            String(categoryValue || '')
              .toLowerCase() !==
            category.toLowerCase()
          ) {
            return false;
          }
        }

        // Group filter
        if (group) {

          const participantGroup =
            participant.group ||
            participant.groupName ||
            participant.gender ||
            participant.teamCategory;

          if (
            String(participantGroup || '')
              .toLowerCase() !==
            group.toLowerCase()
          ) {
            return false;
          }
        }

        return true;
      }
    );

  }, [
    participants,
    category,
    group,
  ]);

  // =========================================
  // PARTICIPANT DISPLAY NAME
  // =========================================

  const getParticipantName = (
    participant
  ) => {

    if (!participant) {
      return '';
    }

    return (
      participant.name ||
      participant.participantName ||
      participant.studentName ||
      participant.title ||
      'Unknown Participant'
    );
  };

  // =========================================
  // TEAM NAME
  // =========================================

  const getTeamName = (
    participant
  ) => {

    if (!participant) {
      return '';
    }

    const teamId =
      participant.teamId ||
      participant.team ||
      participant.team_id;

    if (
      typeof teamId === 'object'
    ) {
      return (
        teamId.name ||
        teamId.teamName ||
        ''
      );
    }

    const team = teams.find(
      (item) =>
        String(
          item._id ||
          item.id ||
          item.loginId ||
          ''
        ) ===
        String(teamId || '')
    );

    return (
      team?.name ||
      team?.teamName ||
      participant.teamName ||
      ''
    );
  };

  // =========================================
  // PUBLISH RESULT
  // =========================================

  const publishResult = async () => {

    if (!category) {
      setMessage(
        '⚠️ Please select a category.'
      );
      return;
    }

    if(!competition) {
        setMessage(
      '⚠️ Please select a competition/item.'      
        )
    }

    if (!group) {
      setMessage(
        '⚠️ Please select a group.'
      );
      return;
    }

    if (!first) {
      setMessage(
        '⚠️ Please select 1st place.'
      );
      return;
    }

    if (!second) {
      setMessage(
        '⚠️ Please select 2nd place.'
      );
      return;
    }

    if (!third) {
      setMessage(
        '⚠️ Please select 3rd place.'
      );
      return;
    }

    if (
      first === second ||
      first === third ||
      second === third
    ) {
      setMessage(
        '⚠️ Same participant cannot have multiple positions.'
      );
      return;
    }

    setPublishing(true);
    setMessage('');

    try {

      const selectedFirst =
        participants.find(
          (item) =>
            String(
              item._id ||
              item.id ||
              item.chest ||
              item.chestNo ||
              item.name
            ) === String(first)
        );

      const selectedSecond =
        participants.find(
          (item) =>
            String(
              item._id ||
              item.id ||
              item.chest ||
              item.chestNo ||
              item.name
            ) === String(second)
        );

      const selectedThird =
        participants.find(
          (item) =>
            String(
              item._id ||
              item.id ||
              item.chest ||
              item.chestNo ||
              item.name
            ) === String(third)
        );

      const result = {
        id: `result-${Date.now()}`,

        category,

        group,

        first: {
          participantId:
            selectedFirst?._id ||
            selectedFirst?.id ||
            first,

          name:
            getParticipantName(
              selectedFirst
            ),

          team:
            getTeamName(
              selectedFirst
            ),
        },

        second: {
          participantId:
            selectedSecond?._id ||
            selectedSecond?.id ||
            second,

          name:
            getParticipantName(
              selectedSecond
            ),

          team:
            getTeamName(
              selectedSecond
            ),
        },

        third: {
          participantId:
            selectedThird?._id ||
            selectedThird?.id ||
            third,

          name:
            getParticipantName(
              selectedThird
            ),

          team:
            getTeamName(
              selectedThird
            ),
        },

        published: true,

        publishedAt:
          new Date().toISOString(),
      };

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
              'NOORE RASOOL',

            teams,

            participants,

            categories,

            publishedResult: result,

            resultAnnouncement: {
              visible: true,

              status:
                'RESULT_COMING_SOON',

              updatedAt:
                new Date().toISOString(),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to publish result.'
        );
      }

      setMessage(
        '✅ Result published successfully!'
      );

      setFirst('');
      setSecond('');
      setThird('');

    } catch (error) {

      console.error(
        'Publish result failed:',
        error
      );

      setMessage(
        `❌ ${error.message}`
      );

    } finally {
      setPublishing(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="result-management">

      {/* HEADER */}

      <header className="result-management-header">

        <div>

          <p>
            ADMIN CONTROL PANEL
          </p>

          <h1>
            🏆 Result Management
          </h1>

          <span>
            NOORE RASOOL · HIM MEELAD FEST'26
          </span>

        </div>

        <button
          className="result-refresh"
          onClick={loadData}
          disabled={loading}
        >
          🔄 Refresh
        </button>

      </header>


      {/* CONTENT */}

      <main className="result-management-content">

        {loading ? (

          <div className="result-loading">
            Loading event data...
          </div>

        ) : (

          <section className="result-card">

            <div className="result-card-title">

              <h2>
                Publish Result
              </h2>

              <span>
                📺 Public Display
              </span>

            </div>


            {/* CATEGORY */}

            <div className="result-field">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) => {

                  setCategory(
                    e.target.value
                  );

                  setFirst('');
                  setSecond('');
                  setThird('');
                  setMessage('');

                }}
              >

                <option value="">
                  Select Category
                </option>

                {categoryOptions.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* COMPETITION / ITEM */}

<div className="result-field">

  <label>
    Competition / Item
  </label>

  <select
    value={competition}
    onChange={(e) => {

      setCompetition(e.target.value);

      setFirst('');
      setSecond('');
      setThird('');
      setMessage('');

    }}
  >

    <option value="">
      Select Competition / Item
    </option>

    {competitions.map((item) => {

      const id =
        item._id ||
        item.id ||
        item.itemId ||
        item.name;

      const name =
        item.name ||
        item.title ||
        item.itemName ||
        item.item;

      return (
        <option
          key={id}
          value={id}
        >
          {name}
        </option>
      );

    })}

  </select>

</div>


            {/* GROUP */}

            <div className="result-field">

              <label>
                Group
              </label>

              <select
                value={group}
                onChange={(e) => {

                  setGroup(
                    e.target.value
                  );

                  setFirst('');
                  setSecond('');
                  setThird('');
                  setMessage('');

                }}
              >

                <option value="">
                  Select Group
                </option>

                {groupOptions.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* PARTICIPANTS */}

            <div className="result-positions">

              {/* FIRST */}

              <div className="result-position first">

                <div className="position-icon">
                  🥇
                </div>

                <div>

                  <label>
                    1st Place
                  </label>

                  <select
                    value={first}
                    onChange={(e) =>
                      setFirst(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Participant
                    </option>

                    {filteredParticipants.map(
                      (participant) => {

                        const id =
                          participant._id ||
                          participant.id ||
                          participant.chest ||
                          participant.chestNo ||
                          participant.name;

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {getParticipantName(
                              participant
                            )}

                            {getTeamName(
                              participant
                            )
                              ? ` — ${getTeamName(
                                  participant
                                )}`
                              : ''}
                          </option>
                        );

                      }
                    )}

                  </select>

                </div>

              </div>


              {/* SECOND */}

              <div className="result-position second">

                <div className="position-icon">
                  🥈
                </div>

                <div>

                  <label>
                    2nd Place
                  </label>

                  <select
                    value={second}
                    onChange={(e) =>
                      setSecond(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Participant
                    </option>

                    {filteredParticipants.map(
                      (participant) => {

                        const id =
                          participant._id ||
                          participant.id ||
                          participant.chest ||
                          participant.chestNo ||
                          participant.name;

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {getParticipantName(
                              participant
                            )}

                            {getTeamName(
                              participant
                            )
                              ? ` — ${getTeamName(
                                  participant
                                )}`
                              : ''}
                          </option>
                        );

                      }
                    )}

                  </select>

                </div>

              </div>


              {/* THIRD */}

              <div className="result-position third">

                <div className="position-icon">
                  🥉
                </div>

                <div>

                  <label>
                    3rd Place
                  </label>

                  <select
                    value={third}
                    onChange={(e) =>
                      setThird(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Participant
                    </option>

                    {filteredParticipants.map(
                      (participant) => {

                        const id =
                          participant._id ||
                          participant.id ||
                          participant.chest ||
                          participant.chestNo ||
                          participant.name;

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {getParticipantName(
                              participant
                            )}

                            {getTeamName(
                              participant
                            )
                              ? ` — ${getTeamName(
                                  participant
                                )}`
                              : ''}
                          </option>
                        );

                      }
                    )}

                  </select>

                </div>

              </div>

            </div>


            {/* PUBLISH */}

            <button
              className="publish-result-button"
              onClick={publishResult}
              disabled={publishing}
            >

              {publishing
                ? 'Publishing...'
                : '📢 PUBLISH RESULT'}

            </button>


            {/* MESSAGE */}

            {message && (
              <div className="result-message">
                {message}
              </div>
            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default ResultManagement;