import mongoose from "mongoose";

const pizzaTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Veg", "Non-Veg"],
      required: true,
      index: true,
    },

    base: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PizzaBase",
      required: true,
    },

    sauce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sauce",
      required: true,
    },

    cheese: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cheese",
      required: true,
    },

    vegetables: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vegetable",
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    isPopular: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Per-pizza stock count, tracked separately from the raw ingredient
    // stock (bases/sauces/cheeses/vegetables). This is what the admin
    // Inventory Manager's "Stock" column reads and edits directly.
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const PizzaTemplate = mongoose.model(
  "PizzaTemplate",
  pizzaTemplateSchema
);

export default PizzaTemplate;