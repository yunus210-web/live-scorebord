const Result = require('../models/Result');

// =========================================
// CREATE / PUBLISH RESULT
// =========================================

const createResult = async (req, res) => {
  try {
    const {
      categoryId,
      category,
      competitionId,
      competition,
      first,
      second,
      third,
    } = req.body;

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (
      !categoryId ||
      !category ||
      !competitionId ||
      !competition
    ) {
      return res.status(400).json({
        message:
          'Category and competition are required.',
      });
    }

    if (!first || !second || !third) {
      return res.status(400).json({
        message:
          '1st, 2nd and 3rd place results are required.',
      });
    }

    // -------------------------------
    // CREATE RESULT
    // -------------------------------

    const result = await Result.create({
      categoryId,
      category,
      competitionId,
      competition,

      first: {
        participantId:
          first.participantId || '',
        name:
          first.name || '',
        chest:
          first.chest || '',
        team:
          first.team || '',
      },

      second: {
        participantId:
          second.participantId || '',
        name:
          second.name || '',
        chest:
          second.chest || '',
        team:
          second.team || '',
      },

      third: {
        participantId:
          third.participantId || '',
        name:
          third.name || '',
        chest:
          third.chest || '',
        team:
          third.team || '',
      },

      published: true,
      publishedAt: new Date(),
    });

    // -------------------------------
    // RESPONSE
    // -------------------------------

    return res.status(201).json({
      success: true,
      message:
        'Result published successfully.',
      result,
    });

  } catch (error) {

    console.error(
      'CREATE RESULT ERROR:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to publish result.',
      error:
        error.message,
    });
  }
};


// =========================================
// GET ALL PUBLISHED RESULTS
// =========================================

const getResults = async (req, res) => {
  try {

    const results =
      await Result.find({
        published: true,
      })
      .sort({
        publishedAt: -1,
      });

    return res.status(200).json({
      success: true,
      results,
    });

  } catch (error) {

    console.error(
      'GET RESULTS ERROR:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to load results.',
      error:
        error.message,
    });
  }
};


module.exports = {
  createResult,
  getResults,
};