const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "Registration",
    required: true,
  },
  trainerid: {
    type: Schema.Types.ObjectId,
    ref: "Registration",
    required: true,
  },
  courseid: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  question: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
