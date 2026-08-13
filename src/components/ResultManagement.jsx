import { useEffect, useMemo, useState } from 'react';

import './ResultManagement.css';

const SERVER_URL =
  'https://live-scorebord-production.up.railway.app';

function ResultManagement() {
  // =========================================
  // EVENT DATA
  // =========================================

  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [registrations, setRegistrations] = useState([]);

 
  // =========================================
  // SELECTED VALUES
  // =========================================

  const [category, setCategory] = useState('');
  const [competition, setCompetition] = useState('');
  

  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [third, setThird] = useState('');

  // =========================================
  // STATUS
  // =========================================

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');

  console.log("RESULT MANAGEMENT COMPONENT RENDERED");
  console.log("LOADING:",loading);
  console.log("MESSAGE:",message);

  // =========================================
  // NORMALIZE
  // =========================================

  const normalize = (value) => {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      return normalize(
        value.id ||
        value._id ||
        value.categoryId ||
        value.competitionId ||
        value.name ||
        value.title ||
        ''
      );
    }

    return String(value)
      .trim()
      .toLowerCase();
  };

  // =========================================
  // LOAD DATA
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

      console.log(
        'RESULT MANAGEMENT DATA:',
        data
      );

      setTeams(
        Array.isArray(data.teams)
          ? data.teams
          : []
      );

      setParticipants(
        Array.isArray(data.participants)
          ? data.participants
          : Array.isArray(data.students)
          ? data.students
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
      );

      setRegistrations(
        Array.isArray(data.registrations)
          ? data.registrations
          : []
      );

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

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadData();
  }, []);

  // =========================================
  // CATEGORY OPTIONS
  // =========================================

  const categoryOptions = useMemo(() => {
    return categories
      .map((item) => {

        if (typeof item === 'string') {
          return {
            id: item,
            name: item,
          };
        }

        return {
          id:
            item.id ||
            item._id ||
            item.categoryId ||
            item.name,

          name:
            item.name ||
            item.title ||
            item.category ||
            item.categoryName ||
            item.id ||
            item._id ||
            '',
        };
      })

      .filter(
        (item) =>
          item.id &&
          item.name
      )

      .filter(
        (item, index, array) =>
          index ===
          array.findIndex(
            (x) =>
              String(x.id) ===
              String(item.id)
          )
      );

  }, [categories]);

  // =========================================
  // COMPETITION OPTIONS
  // =========================================

  const competitionOptions = useMemo(() => {

    if (!category) {
      return [];
    }

    return competitions.filter(
      (item) => {

        const competitionCategory =
          item.category ||
          item.categoryId ||
          item.categoryID ||
          item.categoryName;

        return (
          normalize(
            competitionCategory
          ) ===
          normalize(category)
        );
      }
    );

  }, [
    competitions,
    category,
  ]);

  

  // =========================================
  // GET TEAM
  // =========================================

  const getTeam = (student) => {

    if (!student) {
      return null;
    }

    const teamValue =
      student.teamId ||
      student.team ||
      student.team_id;

    if (
      typeof teamValue === 'object' &&
      teamValue !== null
    ) {
      return teamValue;
    }

    return (
      teams.find(
        (team) =>
          normalize(
            team.id ||
            team._id ||
            team.loginId
          ) ===
          normalize(teamValue)
      ) || null
    );
  };

  // =========================================
  // GET TEAM NAME
  // =========================================

  const getTeamName = (student) => {

    if (!student) {
      return '';
    }

    const team =
      getTeam(student);

    return (
      team?.name ||
      team?.teamName ||
      student.teamName ||
      ''
    );
  };

  // =========================================
  // GET PARTICIPANT NAME
  // =========================================

  const getParticipantName = (student) => {

    if (!student) {
      return '';
    }

    return (
      student.name ||
      student.participantName ||
      student.studentName ||
      student.title ||
      'Unknown Participant'
    );
  };

  // =========================================
  // GET PARTICIPANT ID
  // =========================================

  const getParticipantId = (student) => {

    if (!student) {
      return '';
    }

    return (
      student.id ||
      student._id ||
      student.studentId ||
      student.chest ||
      student.chestNo ||
      student.name ||
      ''
    );
  };

// =========================================
// FILTER PARTICIPANTS
// =========================================

const filteredParticipants = useMemo(() => {

  return participants.filter((student) => {

    // -------------------------------------
    // CATEGORY FILTER
    // -------------------------------------

    if (category) {

      let studentCategory =
        student.categoryId ||
        student.category ||
        student.categoryName ||
        student.categoryTitle;

      if (
        typeof studentCategory === 'object' &&
        studentCategory !== null
      ) {
        studentCategory =
          studentCategory.id ||
          studentCategory._id ||
          studentCategory.name ||
          studentCategory.title ||
          '';
      }

      if (
        normalize(studentCategory) !==
        normalize(category)
      ) {
        return false;
      }
    }

    // -------------------------------------
    // COMPETITION REGISTRATION FILTER
    // -------------------------------------

    if (competition) {

      const studentId =
        getParticipantId(student);

      const isRegistered =
        registrations.some((registration) => {

          const registrationCompId =
            registration.compId ||
            registration.competitionId ||
            registration.competition ||
            registration.itemId;

          const registrationStudentId =
            registration.studentId ||
            registration.student_id ||
            registration.student ||
            registration.participantId ||
            registration.participant;

          return (
            normalize(registrationCompId) ===
              normalize(competition)
            &&
            normalize(registrationStudentId) ===
              normalize(studentId)
          );
        });

      if (!isRegistered) {
        return false;
      }
    }

    // -------------------------------------
    // NO GROUP FILTER
    // -------------------------------------
    // IMPORTANT:
    // എല്ലാ ടീമുകളിലെയും registered
    // participants ഇവിടെ വരും.

    return true;
  });

}, [
  participants,
  registrations,
  category,
  competition,
  teams
]);

  // =========================================
  // PARTICIPANT OPTIONS
  // =========================================

  const renderParticipantOptions = () => {

    if (
      !category ||
      !competition
      
    ) {
      return null;
    }

    if (
      filteredParticipants.length === 0
    ) {
      return (
        <option value="">
          No registered participants found
        </option>
      );
    }

    return filteredParticipants.map(
      (student) => {

        const id =
          getParticipantId(student);

        const name =
          getParticipantName(student);

        const chest =
          student.chest ||
          student.chestNo;

        return (
          <option
            key={String(id)}
            value={String(id)}
          >
            {name}
            {chest
              ? ` — Chest ${chest}`
              : ''}
          </option>
        );
      }
    );
  };

  // =========================================
  // RESET AFTER CATEGORY CHANGE
  // =========================================

  const handleCategoryChange = (value) => {

    setCategory(value);

    setCompetition('');
    

    setFirst('');
    setSecond('');
    setThird('');

    setMessage('');
  };

  // =========================================
  // RESET AFTER COMPETITION CHANGE
  // =========================================

  const handleCompetitionChange = (value) => {

    setCompetition(value);

    

    setFirst('');
    setSecond('');
    setThird('');

    setMessage('');
  };

  // =========================================
  // RESET AFTER GROUP CHANGE
  // =========================================

  const handleGroupChange = (value) => {

    setGroup(value);

    setFirst('');
    setSecond('');
    setThird('');

    setMessage('');
  };

  

  // =========================================
  // PUBLISH RESULT
  // =========================================

  const publishResult = async () => {

    // ---------------------------------------
    // VALIDATION
    // ---------------------------------------

    if (!category) {
      setMessage(
        '⚠️ Please select a category.'
      );
      return;
    }

    if (!competition) {
      setMessage(
        '⚠️ Please select a competition / item.'
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

      // ---------------------------------------
      // FIND PARTICIPANTS
      // ---------------------------------------

      const getId = (student) => {

        if (!student) {
          return '';
        }

        return (
          student._id ||
          student.id ||
          student.studentId ||
          student.chest ||
          student.chestNo ||
          student.name ||
          ''
        );
      };

      const selectedFirst =
        participants.find(
          (student) =>
            String(getId(student)) ===
            String(first)
        );

      const selectedSecond =
        participants.find(
          (student) =>
            String(getId(student)) ===
            String(second)
        );

      const selectedThird =
        participants.find(
          (student) =>
            String(getId(student)) ===
            String(third)
        );

      if (!selectedFirst) {
        throw new Error(
          '1st place participant not found.'
        );
      }

      if (!selectedSecond) {
        throw new Error(
          '2nd place participant not found.'
        );
      }

      if (!selectedThird) {
        throw new Error(
          '3rd place participant not found.'
        );
      }

      // ---------------------------------------
      // FIND COMPETITION
      // ---------------------------------------

      const selectedCompetition =
        competitions.find(
          (item) =>
            String(
              item.id ||
              item._id ||
              item.compId ||
              item.itemId
            ) ===
            String(competition)
        );

      const competitionName =
        selectedCompetition?.name ||
        selectedCompetition?.title ||
        selectedCompetition?.itemName ||
        selectedCompetition?.item ||
        competition;

      // ---------------------------------------
      // CREATE RESULT
      // ---------------------------------------

      const result = {

        id:
          `result-${Date.now()}`,

        categoryId:
          category,

        category:
          category,

        competitionId:
          competition,

        competition:
          competitionName,

      

        first: {

          participantId:
            getId(selectedFirst),

          name:
            getParticipantName(
              selectedFirst
            ),

          chest:
            selectedFirst?.chest ||
            selectedFirst?.chestNo ||
            '',

          team:
            getTeamName(
              selectedFirst
            ),
        },

        second: {

          participantId:
            getId(selectedSecond),

          name:
            getParticipantName(
              selectedSecond
            ),

          chest:
            selectedSecond?.chest ||
            selectedSecond?.chestNo ||
            '',

          team:
            getTeamName(
              selectedSecond
            ),
        },

        third: {

          participantId:
            getId(selectedThird),

          name:
            getParticipantName(
              selectedThird
            ),

          chest:
            selectedThird?.chest ||
            selectedThird?.chestNo ||
            '',

          team:
            getTeamName(
              selectedThird
            ),
        },

        published:
          true,

        publishedAt:
          new Date().toISOString(),
      };

      console.log(
        '🏆 PUBLISHING RESULT:',
        result
      );

      // ---------------------------------------
      // SEND TO BACKEND
      // ---------------------------------------

      const response =
        await fetch(
          `${SERVER_URL}/api/scoreboard`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({

                eventName:
                  'HIM MEELAD FEST',

                eventTitle:
                  'NOORE RASOOL',

                teams,

                participants,

                students:
                  participants,

                categories,

                competitions,

                publishedResult:
                  result,

                resultAnnouncement: {

                  visible:
                    true,

                  status:
                    'RESULT_PUBLISHED',

                  updatedAt:
                    new Date().toISOString(),
                },
              }),
          }
        );

      // ---------------------------------------
      // RESPONSE
      // ---------------------------------------

      if (!response.ok) {

        let errorMessage =
          'Failed to publish result.';

        try {

          const errorData =
            await response.json();

          errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;

        } catch {
          // Default error
        }

        throw new Error(
          errorMessage
        );
      }

      // ---------------------------------------
      // SUCCESS
      // ---------------------------------------

      setMessage(
        '✅ Result published successfully!'
      );

      setFirst('');
      setSecond('');
      setThird('');

    } catch (error) {

      console.error(
        '❌ Publish result failed:',
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
  // LOADING
  // =========================================

  if (loading) {

    return (
      <div className="result-management">
        <h1 style={{color:"red"}}>RESULT MANAGEMENT TEST</h1>

        <div className="result-loading">
          ⏳ Loading result management...
        </div>

      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="result-management">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="result-header">

        <div>
          <h2>🏆 Result Management</h2>

          <p>
            Publish competition results
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="refresh-result-btn"
          disabled={loading}
        >
          🔄 Refresh
        </button>

      </div>

      {/* =====================================
          MESSAGE
      ====================================== */}

      {message && (
        <div
          className={
            message.startsWith('❌')
              ? 'result-message error'
              : message.startsWith('⚠️')
              ? 'result-message warning'
              : 'result-message success'
          }
        >
          {message}
        </div>
      )}

      {/* =====================================
          FILTER CARD
      ====================================== */}

      <div className="result-card">

        <h3>
          📋 Select Competition
        </h3>

        {/* CATEGORY */}

        <div className="result-field">

          <label>
            Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              handleCategoryChange(
                e.target.value
              )
            }
          >

            <option value="">
              Select Category
            </option>

            {categoryOptions.map(
              (item) => (
                <option
                  key={String(item.id)}
                  value={String(item.id)}
                >
                  {item.name}
                </option>
              )
            )}

          </select>

        </div>

        {/* COMPETITION */}

        <div className="result-field">

          <label>
            Competition / Item
          </label>

          <select
            value={competition}
            onChange={(e) =>
              handleCompetitionChange(
                e.target.value
              )
            }
            disabled={!category}
          >

            <option value="">
              {!category
                ? 'Select category first'
                : competitionOptions.length === 0
                ? 'No competitions found'
                : 'Select Competition / Item'}
            </option>

            {competitionOptions.map(
              (item) => {

                const id =
                  item.id ||
                  item._id ||
                  item.compId ||
                  item.itemId;

                const name =
                  item.name ||
                  item.title ||
                  item.itemName ||
                  item.item ||
                  id;

                return (
                  <option
                    key={String(id)}
                    value={String(id)}
                  >
                    {name}
                  </option>
                );
              }
            )}

          </select>

        </div>

        

        

      </div>

      {/* =====================================
          PARTICIPANT RESULT CARD
      ====================================== */}

      {/* =====================================
    PARTICIPANT RESULT CARD
====================================== */}

<div className="result-card">

  <h3>
    🥇 Select Winners
  </h3>

  <p style={{
    marginBottom: '20px',
    opacity: 0.8
  }}>
    All teams participating in this competition
    are included.
  </p>

  {/* FIRST */}

  <div className="result-position first">

    <label>
      🥇 1st Place
    </label>

    <select
      value={first}
      onChange={(e) =>
        setFirst(e.target.value)
      }
      disabled={
        !category ||
        !competition
      }
    >

      <option value="">
        Select 1st place participant
      </option>

      {renderParticipantOptions()}

    </select>

  </div>


  {/* SECOND */}

  <div className="result-position second">

    <label>
      🥈 2nd Place
    </label>

    <select
      value={second}
      onChange={(e) =>
        setSecond(e.target.value)
      }
      disabled={
        !category ||
        !competition
      }
    >

      <option value="">
        Select 2nd place participant
      </option>

      {renderParticipantOptions()}

    </select>

  </div>


  {/* THIRD */}

  <div className="result-position third">

    <label>
      🥉 3rd Place
    </label>

    <select
      value={third}
      onChange={(e) =>
        setThird(e.target.value)
      }
      disabled={
        !category ||
        !competition
      }
    >

      <option value="">
        Select 3rd place participant
      </option>

      {renderParticipantOptions()}

    </select>

  </div>


  {/* PARTICIPANT COUNT */}

  {category &&
    competition && (
      <div className="participant-count">

        👥 Registered participants:
        <strong>
          {' '}
          {filteredParticipants.length}
        </strong>

      </div>
    )}

</div>

      {/* =====================================
          PUBLISH
      ====================================== */}

      <div className="result-publish-section">

        <button
          type="button"
          onClick={publishResult}
          disabled={publishing}
          className="publish-result-btn"
        >

          {publishing
            ? '⏳ Publishing...'
            : '🏆 Publish Result'}

        </button>

      </div>

    </div>
  );
}

export default ResultManagement;

