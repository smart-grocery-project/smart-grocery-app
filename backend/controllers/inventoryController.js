import Inventory from "../models/Inventory.js";

// CREATE inventory for user (if not exists)
export const createInventory = async (req, res) => {
  try {
    const userId = req.user.userId;

    let inventory = await Inventory.findOne({ user: userId });

    if (inventory) {
      return res.status(400).json({ message: "Inventory already exists" });
    }

    inventory = await Inventory.create({
      user: userId,
      items: [],
    });

    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET user inventory
export const getInventory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const inventory = await Inventory.findOne({ user: userId }).populate("items.product");

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    // const inventoryObj = inventory.toObject();
    // delete inventoryObj._id;
    // inventoryObj.items = inventoryObj.items.map(({ _id, ...rest }) => rest);

    // res.status(200).json(inventoryObj);
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD item to inventory
export const addItem = async (req, res) => {
  try {
    console.log("[ADD ITEM] 1. hit:", { userId: req.user?.userId, body: req.body });
    const userId = req.user.userId;
    const { product, quantity } = req.body;

    console.log("[ADD ITEM] 2. finding inventory...");
    const inventory = await Inventory.findOne({ user: userId });
    console.log("[ADD ITEM] 3. found inventory:", !!inventory);

    if (!inventory) {
      console.log("[ADD ITEM] no inventory — returning 404");
      return res.status(404).json({ message: "Inventory not found" });
    }

    console.log("[ADD ITEM] 4. pushing item...");
    inventory.items.push({
      product,
      quantity,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    console.log("[ADD ITEM] 5. saving...");
    await inventory.save();

    console.log("[ADD ITEM] 6. success");
    res.status(200).json(inventory);
  } catch (error) {
    console.log("[ADD ITEM] error:", error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const inventory = await Inventory.findOne({ user: userId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    inventory.items = inventory.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await inventory.save();

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const inventory = await Inventory.findOne({ user: userId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const item = inventory.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;

    await inventory.save();

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpiringItems = async (req, res) => {
  try {
    const userId = req.user.userId;

    const inventory = await Inventory.findOne({ user: userId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const now = new Date();

    const expiringItems = inventory.items.filter(
      (item) => item.expirationDate <= now
    );

    res.status(200).json(expiringItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};