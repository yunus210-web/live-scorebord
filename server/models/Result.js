const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    competitionId: {
      type: String,
      required: true,
    },

    competition: {
      type: String,
      required: true,
    },

    first: {
      participantId: String,
      name: String,
      chest: String,
      team: String,
    },

    second: {
      participantId: String,
      name: String,
      chest: String,
      team: String,
    },

    third: {
      participantId: String,
      name: String,
      chest: String,
      team: String,
    },

    published: {
      type: Boolean,
      default: true,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Result',
  resultSchema
);