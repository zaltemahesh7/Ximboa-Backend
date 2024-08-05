const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  c_id: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  t_id: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
  question: { type: String, required: true },
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
