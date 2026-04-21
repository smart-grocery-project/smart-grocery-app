import History from "../models/History.js";

// Create history (if not exists)
export const createHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    let history = await History.findOne({ user: userId });

    if (history) {
      return res.status(400).json({ message: "History already exists" });
    }

    history = await History.create({
      user: userId,
      items: [],
    });

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add scanned product
export const addHistoryItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    const history = await History.findOne({ user: userId });

    if (!history) {
      return res.status(404).json({ message: "History not found" });
    }

    history.items.push({
      product: productId,
    });

    await history.save();

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get history
export const getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const history = await History.findOne({ user: userId })
      .populate("items.product");

    if (!history) {
      return res.status(404).json({ message: "History not found" });
    }

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};