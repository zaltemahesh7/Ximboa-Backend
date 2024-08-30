const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enrollmentSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course_id: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrollment_date: {
    type: Date,
    default: Date.now,
  },
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
module.exports = Enrollment;
