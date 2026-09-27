import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: [
        "PizzaBase",
        "Sauce",
        "Cheese",
        "Vegetable",
        "PizzaTemplate",
      ],
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: String,
      enum: [
        "ADD",
        "REMOVE",
        "ORDER_DEDUCTION",
        "RESTOCK",
        "ADJUSTMENT",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    previousStock: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const InventoryLog = mongoose.model(
  "InventoryLog",
  inventoryLogSchema
);

export default InventoryLog;