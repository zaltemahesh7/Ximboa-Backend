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
  question: {
    type: String,
    required: true,
  },
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
