import mongoose from "mongoose";

const weeklyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    weeklyBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    nutritionTargets: {
      calories: {
        type: Number,
        required: true,
        min: 0,
      },
      protein: {
        type: Number,
        required: true,
        min: 0,
      },
      carbs: {
        type: Number,
        required: true,
        min: 0,
      },
      fat: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

const WeeklyPlan = mongoose.model("WeeklyPlan", weeklyPlanSchema);

export default WeeklyPlan;