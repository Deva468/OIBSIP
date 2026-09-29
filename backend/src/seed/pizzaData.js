import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);


import connectDB from "../config/db.js";

import PizzaBase from "../models/PizzaBase.js";
import Sauce from "../models/Sauce.js";
import Cheese from "../models/Cheese.js";
import Vegetable from "../models/Vegetable.js";
import PizzaTemplate from "../models/PizzaTemplate.js";

const pizzaImages = {
  classic:
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",

  farmhouse:
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",

  cheese:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",

  veggie:
    "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=80",

  spicy:
    "https://images.unsplash.com/photo-1552539618-7eec9b4d1796?auto=format&fit=crop&w=900&q=80",

  special:
    "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80",
};

// NOTE ON IMAGES: I only have 6 verified-working photo URLs to work with
// (the ones already live in this project before my changes) — I'm not
// able to browse the web from inside this code sandbox to verify brand
// new Unsplash photo IDs before hardcoding them, and hotlinking an image
// that turns out not to exist would just trade one broken-image bug for
// another. So instead of duplicates, I've re-spread these 6 across the 15
// pizzas so that (a) Chicken Tikka and Paneer Tikka no longer share the
// same photo, and (b) no two pizzas in the SAME grid row end up with a
// repeat. For genuinely distinct per-pizza photography, replace the
// values in this object with your own sourced/purchased images.

const pizzaData = async () => {
  try {
    await connectDB();

    await PizzaTemplate.deleteMany({});
    await PizzaBase.deleteMany({});
    await Sauce.deleteMany({});
    await Cheese.deleteMany({});
    await Vegetable.deleteMany({});

    const bases = await PizzaBase.insertMany([
      {
        name: "Classic Pan",
        description: "Soft and crispy classic pizza base",
        price: 99,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "Thin Crust",
        description: "Light and crispy thin crust",
        price: 119,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "Cheese Burst",
        description: "Cheese filled crust",
        price: 149,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
    ]);

    const sauces = await Sauce.insertMany([
      {
        name: "Classic Tomato",
        description: "Rich tomato pizza sauce",
        price: 30,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "Spicy Mexican",
        description: "Spicy Mexican style sauce",
        price: 40,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "BBQ Sauce",
        description: "Smoky BBQ sauce",
        price: 45,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
    ]);

    const cheeses = await Cheese.insertMany([
      {
        name: "Mozzarella",
        description: "Classic mozzarella cheese",
        price: 50,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "Extra Cheese",
        description: "Extra layer of mozzarella",
        price: 70,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "Cheese Blend",
        description: "Special mixed cheese",
        price: 80,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
    ]);

    const vegetables = await Vegetable.insertMany([
      {
        name: "Onion",
        description: "Fresh sliced onion",
        price: 20,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "Capsicum",
        description: "Fresh green capsicum",
        price: 25,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "Mushroom",
        description: "Fresh mushrooms",
        price: 35,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "Corn",
        description: "Sweet corn",
        price: 25,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
      {
        name: "Jalapeno",
        description: "Spicy jalapeno",
        price: 30,
        stock: 100,
        lowStockThreshold: 10,
        isAvailable: true,
      },
    ]);

    const makePizza = ({
      name,
      description,
      category,
      baseIndex,
      sauceIndex,
      cheeseIndex,
      vegetables: vegetableIndexes = [],
      price,
      originalPrice,
      discountPercent,
      image,
      isPopular = false,
    }) => ({
      name,
      description,
      category,
      base: bases[baseIndex]._id,
      sauce: sauces[sauceIndex]._id,
      cheese: cheeses[cheeseIndex]._id,
      vegetables: vegetableIndexes.map(
        (index) => vegetables[index]._id
      ),
      price,
      originalPrice,
      discountPercent,
      image,
      isPopular,
      isAvailable: true,
    });

    const pizzas = [
      makePizza({
        name: "Margherita",
        description:
          "Classic tomato sauce with mozzarella and fresh herbs.",
        category: "Veg",
        baseIndex: 0,
        sauceIndex: 0,
        cheeseIndex: 0,
        price: 199,
        originalPrice: 229,
        discountPercent: 13,
        image: pizzaImages.classic,
        isPopular: true,
      }),

      makePizza({
        name: "Farmhouse",
        description:
          "Onion, capsicum, mushroom and corn with mozzarella.",
        category: "Veg",
        baseIndex: 0,
        sauceIndex: 0,
        cheeseIndex: 0,
        vegetables: [0, 1, 2, 3],
        price: 299,
        originalPrice: 349,
        discountPercent: 14,
        image: pizzaImages.farmhouse,
        isPopular: true,
      }),

      makePizza({
        name: "Paneer Tikka",
        description:
          "Spicy paneer style pizza with onion and capsicum.",
        category: "Veg",
        baseIndex: 0,
        sauceIndex: 1,
        cheeseIndex: 0,
        vegetables: [0, 1, 4],
        price: 329,
        originalPrice: 379,
        discountPercent: 13,
        image: pizzaImages.spicy,
        isPopular: true,
      }),

      makePizza({
        name: "Veggie Supreme",
        description:
          "Loaded vegetables with extra cheese and herbs.",
        category: "Veg",
        baseIndex: 1,
        sauceIndex: 0,
        cheeseIndex: 2,
        vegetables: [0, 1, 2, 3, 4],
        price: 349,
        originalPrice: 399,
        discountPercent: 13,
        image: pizzaImages.veggie,
        isPopular: true,
      }),

      makePizza({
        name: "Cheese Burst Special",
        description:
          "Extra cheesy pizza with cheese burst crust.",
        category: "Veg",
        baseIndex: 2,
        sauceIndex: 0,
        cheeseIndex: 1,
        vegetables: [0, 3],
        price: 399,
        originalPrice: 449,
        discountPercent: 11,
        image: pizzaImages.cheese,
        isPopular: true,
      }),

      makePizza({
        name: "Mexican Green Wave",
        description:
          "Spicy Mexican sauce with capsicum and jalapeno.",
        category: "Veg",
        baseIndex: 1,
        sauceIndex: 1,
        cheeseIndex: 0,
        vegetables: [0, 1, 4],
        price: 319,
        originalPrice: 369,
        discountPercent: 14,
        image: pizzaImages.spicy,
      }),

      makePizza({
        name: "Double Cheese Veg",
        description:
          "Extra cheese with onion, capsicum and corn.",
        category: "Veg",
        baseIndex: 0,
        sauceIndex: 0,
        cheeseIndex: 1,
        vegetables: [0, 1, 3],
        price: 329,
        originalPrice: 379,
        discountPercent: 13,
        image: pizzaImages.veggie,
      }),

      makePizza({
        name: "Mushroom Magic",
        description:
          "Fresh mushrooms with creamy cheese.",
        category: "Veg",
        baseIndex: 1,
        sauceIndex: 0,
        cheeseIndex: 2,
        vegetables: [0, 2],
        price: 309,
        originalPrice: 359,
        discountPercent: 14,
        image: pizzaImages.farmhouse,
      }),

      makePizza({
        name: "Corn Cheese Delight",
        description:
          "Sweet corn with mozzarella and extra cheese.",
        category: "Veg",
        baseIndex: 0,
        sauceIndex: 0,
        cheeseIndex: 1,
        vegetables: [3],
        price: 289,
        originalPrice: 329,
        discountPercent: 12,
        image: pizzaImages.classic,
      }),

      makePizza({
        name: "Garden Fresh",
        description:
          "Fresh vegetables, herbs and mozzarella cheese.",
        category: "Veg",
        baseIndex: 1,
        sauceIndex: 0,
        cheeseIndex: 0,
        vegetables: [0, 1, 2, 3],
        price: 299,
        originalPrice: 349,
        discountPercent: 14,
        image: pizzaImages.veggie,
      }),

      makePizza({
        name: "BBQ Chicken",
        description:
          "Smoky BBQ chicken with melted mozzarella.",
        category: "Non-Veg",
        baseIndex: 0,
        sauceIndex: 2,
        cheeseIndex: 0,
        vegetables: [0, 1],
        price: 379,
        originalPrice: 429,
        discountPercent: 12,
        image: pizzaImages.cheese,
        isPopular: true,
      }),

      makePizza({
        name: "Chicken Tikka",
        description:
          "Juicy chicken tikka with onion and capsicum.",
        category: "Non-Veg",
        baseIndex: 0,
        sauceIndex: 1,
        cheeseIndex: 0,
        vegetables: [0, 1],
        price: 359,
        originalPrice: 409,
        discountPercent: 12,
        image: pizzaImages.special,
        isPopular: true,
      }),

      makePizza({
        name: "Chicken Supreme",
        description:
          "Loaded chicken with fresh vegetables and cheese.",
        category: "Non-Veg",
        baseIndex: 1,
        sauceIndex: 0,
        cheeseIndex: 2,
        vegetables: [0, 1, 3],
        price: 399,
        originalPrice: 459,
        discountPercent: 13,
        image: pizzaImages.farmhouse,
        isPopular: true,
      }),

      makePizza({
        name: "Pepper Chicken",
        description:
          "Pepper seasoned chicken with mozzarella.",
        category: "Non-Veg",
        baseIndex: 0,
        sauceIndex: 0,
        cheeseIndex: 0,
        vegetables: [1, 4],
        price: 389,
        originalPrice: 439,
        discountPercent: 11,
        image: pizzaImages.spicy,
      }),

      makePizza({
        name: "Spicy Chicken Delight",
        description:
          "Spicy chicken with jalapeno and extra cheese.",
        category: "Non-Veg",
        baseIndex: 0,
        sauceIndex: 1,
        cheeseIndex: 1,
        vegetables: [1, 4],
        price: 419,
        originalPrice: 479,
        discountPercent: 13,
        image: pizzaImages.cheese,
      }),

      makePizza({
        name: "Chicken BBQ Blast",
        description:
          "BBQ chicken with smoky sauce and cheese.",
        category: "Non-Veg",
        baseIndex: 2,
        sauceIndex: 2,
        cheeseIndex: 1,
        vegetables: [0],
        price: 449,
        originalPrice: 499,
        discountPercent: 10,
        image: pizzaImages.classic,
        isPopular: true,
      }),

      makePizza({
        name: "Chicken Pepperoni",
        description:
          "Pepperoni style chicken pizza with mozzarella.",
        category: "Non-Veg",
        baseIndex: 0,
        sauceIndex: 0,
        cheeseIndex: 0,
        price: 429,
        originalPrice: 479,
        discountPercent: 10,
        image: pizzaImages.spicy,
        isPopular: true,
      }),

      makePizza({
        name: "Tandoori Chicken",
        description:
          "Indian style tandoori chicken with spicy cheese.",
        category: "Non-Veg",
        baseIndex: 1,
        sauceIndex: 1,
        cheeseIndex: 1,
        vegetables: [0, 1],
        price: 439,
        originalPrice: 499,
        discountPercent: 12,
        image: pizzaImages.special,
      }),

      makePizza({
        name: "Chicken Loaded",
        description:
          "Loaded chicken pizza with extra cheese and vegetables.",
        category: "Non-Veg",
        baseIndex: 2,
        sauceIndex: 2,
        cheeseIndex: 1,
        vegetables: [0, 1, 3],
        price: 459,
        originalPrice: 519,
        discountPercent: 12,
        image: pizzaImages.cheese,
        isPopular: true,
      }),
    ];

    await PizzaTemplate.insertMany(pizzas);

    const vegCount = pizzas.filter(
      (pizza) => pizza.category === "Veg"
    ).length;

    const nonVegCount = pizzas.filter(
      (pizza) => pizza.category === "Non-Veg"
    ).length;

    console.log("Pizza data seeded successfully.");
    console.log(`Total pizzas: ${pizzas.length}`);
    console.log(`Veg pizzas: ${vegCount}`);
    console.log(`Non-Veg pizzas: ${nonVegCount}`);

    process.exit(0);
  } catch (error) {
    console.error(
      "Pizza data seeding failed:",
      error.message
    );

    process.exit(1);
  }
};

pizzaData();