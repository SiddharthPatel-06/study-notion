const mongoose = require("mongoose");
const SubSection = require("./SubSection");

const sectionSchema = new mongoose.Schema({
  sectoinName: {
    type: String,
  },
  subSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
});

module.exports = mongoose.model("Section", sectionSchema);
