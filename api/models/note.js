const mongose = require("mongoose");

const noteSchema = new mongose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [3, "Title must be at least 3 characters"]
  },
  content: {
    type: String,
    required: [true, "Content is required"],
    minlength: [5, "Content must be at least 5 characters"]
  },
  tags: {
        type: [String],
        default: []
    },
    isPinned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongose.model("Note", noteSchema);