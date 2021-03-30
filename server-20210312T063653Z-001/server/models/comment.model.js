const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const CommentSchema = new mongoose.Schema(
  {
    orderId: {
      type: ObjectId,
      required: true,
    },
    userId: {
      type: ObjectId,
      required: true,
    },
    comment: {
      type: String,
    },
    status: {
      type: String,
    },
    location: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
