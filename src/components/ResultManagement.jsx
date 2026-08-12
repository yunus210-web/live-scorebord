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
  const [group, setGroup] = useState('');

  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [third, setThird] = useState('');

  // =========================================
  // STATUS
  // =========================================

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

      console.log(
        'RESULT MANAGEMENT DATA:',
        data
      );

      // =====================================
      // TEAMS
      // =====================================

      setTeams(
        Array.isArray(data.teams)
          ? data.teams
          : []
      );

      // =====================================
      // PARTICIPANTS / STUDENTS
      // =====================================

      setParticipants(
        Array.isArray(data.participants)
          ? data.participants
          : Array.isArray(data.students)
          ? data.students
          : []
      );

      // =====================================
      // CATEGORIES
      // =====================================

      setCategories(
        Array.isArray(data.categories)
          ? data.categories
          : []
      );

      // =====================================
      // COMPETITIONS
      // =====================================

      setCompetitions(
        Array.isArray(data.competitions)
          ? data.competitions
          : []
      );

      // =====================================
      // REGISTRATIONS
      // =====================================

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
  // HELPER: NORMALIZE VALUE
  // =========================================

  const normalize = (value) => {
    return String(value || '')
      .trim()
      .toLowerCase();
  };

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
            item._id,
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
          item.categoryID;

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
  // GROUP / TEAM OPTIONS
  // =========================================

  const groupOptions = useMemo(() => {

    return teams
      .filter(
        (team) =>
          team &&
          (
            team.name ||
            team.teamName
          )
      )
      .map((team) => ({
        id:
          team.id ||
          team._id ||
          team.loginId,

        name:
          team.name ||
          team.teamName,
      }))
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
      )
      .sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

  }, [teams]);

  // =========================================
  // GET TEAM
  // =========================================

  const getTeam = (student) => {

    if (!student) {
      return null;
    }

    const teamId =
      student.teamId ||
      student.team ||
      student.team_id;

    // If team is already an object
    if (
      typeof teamId === 'object' &&
      teamId !== null
    ) {
      return teamId;
    }

    return (
      teams.find(
        (team) =>
          String(
            team.id ||
            team._id ||
            team.loginId ||
            ''
          ) ===
          String(teamId || '')
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

  const getParticipantName = (
    student
  ) => {

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

  const getParticipantId = (
    student
  ) => {

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
  //
  // CATEGORY
  // ↓
  // COMPETITION
  // ↓
  // GROUP / TEAM
  // ↓
  // REGISTERED STUDENTS
  // =========================================

  const filteredParticipants = useMemo(() => {

    return participants.filter(
      (student) => {

        // =====================================
        // CATEGORY FILTER
        // =====================================

        if (category) {

          const studentCategory =
            student.categoryId ||
            student.category ||
            student.categoryName ||
            student.categoryTitle;

          let studentCategoryValue =
            studentCategory;

          if (
            typeof studentCategoryValue ===
            'object' &&
            studentCategoryValue !== null
          ) {
            studentCategoryValue =
              studentCategoryValue.id ||
              studentCategoryValue._id ||
              studentCategoryValue.name ||
              studentCategoryValue.title;
          }

          if (
            normalize(
              studentCategoryValue
            ) !==
            normalize(category)
          ) {
            return false;
          }
        }

        // =====================================
        // COMPETITION / REGISTRATION FILTER
        // =====================================

        if (competition) {

          const studentId =
            getParticipantId(
              student
            );

          const isRegistered =
            registrations.some(
              (registration) => {

                const registrationCompId =
                  registration.compId ||
                  registration.competitionId ||
                  registration.competition ||
                  registration.itemId;

                const registrationStudentId =
                  registration.studentId ||
                  registration.student_id ||
                  registration.student;

                return (
                  normalize(
                    registrationCompId
                  ) ===
                  normalize(
                    competition
                  ) &&
                  normalize(
                    registrationStudentId
                  ) ===
                  normalize(
                    studentId
                  )
                );

              }
            );

          if (!isRegistered) {
            return false;
          }
        }

        // =====================================
        // GROUP / TEAM FILTER
        // =====================================

        if (group) {

          const team =
            getTeam(student);

          const studentTeamId =
            team?.id ||
            team?._id ||
            team?.loginId;

          if (
            normalize(
              studentTeamId
            ) !==
            normalize(group)
          ) {
            return false;
          }
        }

        return true;

      }
    );

  }, [
    participants,
    registrations,
    teams,
    category,
    competition,
    group,
  ]);

  // =========================================
  // PARTICIPANT OPTIONS
  // =========================================

  const renderParticipantOptions = () => {

    if (
      !category ||
      !competition ||
      !group
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
          getParticipantId(
            student
          );

        const name =
          getParticipantName(
            student
          );

        const chest =
          student.chest ||
          student.chestNo;

        return (
          <option
            key={id}
            value={id}
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
  // PUBLISH RESULT
  // =========================================

  const publishResult = async () => {

  // =====================================
  // CATEGORY VALIDATION
  // =====================================

  if (!category) {
    setMessage(
      '⚠️ Please select a category.'
    );
    return;
  }

  // =====================================
  // COMPETITION VALIDATION
  // =====================================

  if (!competition) {
    setMessage(
      '⚠️ Please select a competition / item.'
    );
    return;
  }

  // =====================================
  // GROUP VALIDATION
  // =====================================

  if (!group) {
    setMessage(
      '⚠️ Please select a group.'
    );
    return;
  }

  // =====================================
  // FIRST VALIDATION
  // =====================================

  if (!first) {
    setMessage(
      '⚠️ Please select 1st place.'
    );
    return;
  }

  // =====================================
  // SECOND VALIDATION
  // =====================================

  if (!second) {
    setMessage(
      '⚠️ Please select 2nd place.'
    );
    return;
  }

  // =====================================
  // THIRD VALIDATION
  // =====================================

  if (!third) {
    setMessage(
      '⚠️ Please select 3rd place.'
    );
    return;
  }

  // =====================================
  // DUPLICATE PARTICIPANT CHECK
  // =====================================

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

    // =====================================
    // FIND SELECTED PARTICIPANTS
    // =====================================

    const getId = (student) => {
      if (!student) return '';

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

    // =====================================
    // CHECK PARTICIPANTS
    // =====================================

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

    // =====================================
    // FIND COMPETITION
    // =====================================

    const selectedCompetition =
      competitions.find(
        (item) =>
          String(
            item.id ||
            item._id ||
            item.compId ||
            item.itemId
          ) === String(competition)
      );

    // =====================================
    // COMPETITION NAME
    // =====================================

    const competitionName =
      selectedCompetition?.name ||
      selectedCompetition?.title ||
      selectedCompetition?.itemName ||
      selectedCompetition?.item ||
      competition;

    // =====================================
    // CREATE RESULT
    // =====================================

    const result = {

      id:
        `result-${Date.now()}`,

      // CATEGORY
      categoryId:
        category,

      category:
        category,

      // COMPETITION
      competitionId:
        competition,

      competition:
        competitionName,

      // GROUP
      group:
        group,

      // =================================
      // FIRST PLACE
      // =================================

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

      // =================================
      // SECOND PLACE
      // =================================

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

      // =================================
      // THIRD PLACE
      // =================================

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

      // STATUS

      published:
        true,

      publishedAt:
        new Date().toISOString(),

    };

    console.log(
      '🏆 PUBLISHING RESULT:',
      result
    );

    // =====================================
    // SEND RESULT TO BACKEND
    // =====================================

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

    // =====================================
    // RESPONSE ERROR CHECK
    // =====================================

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
        // JSON response ഇല്ലെങ്കിൽ
        // default error ഉപയോഗിക്കും
      }

      throw new Error(
        errorMessage
      );
    }

    // =====================================
    // SUCCESS
    // =====================================

    setMessage(
      '✅ Result published successfully!'
    );

    // Clear selections

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

}
export default ResultManagement;