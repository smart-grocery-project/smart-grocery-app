import WeeklyPlan from "../models/WeeklyPlan.js";

// CREATE or UPDATE weekly plan
export const upsertWeeklyPlan = async (req, res) => {
  try {
    const userId = req.user.userId;

    // const userExists = await User.findById(userId);
    // if (!userExists) {
    //     return res.status(404).json({ message: "User not found" });
    // }

    const { weeklyBudget, calories, protein, carbs, fat } = req.body;

    if (
      weeklyBudget == null ||
      calories == null ||
      protein == null ||
      carbs == null ||
      fat == null
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const plan = await WeeklyPlan.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        weeklyBudget,
        nutritionTargets: {
          calories,
          protein,
          carbs,
          fat,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET weekly plan
export const getWeeklyPlan = async (req, res) => {
  try {
    const userId = req.user.userId;

    const plan = await WeeklyPlan.findOne({ user: userId });

    if (!plan) {
      return res.status(404).json({
        message: "Weekly plan not found",
      });
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};