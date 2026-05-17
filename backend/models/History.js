import mongoose from "mongoose";

const historyItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  scannedDate: {
    type: Date,
    default: Date.now,
  },
});

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [historyItemSchema],
  },
  { timestamps: true }
);

const History = mongoose.model("History", historySchema);

export default History;