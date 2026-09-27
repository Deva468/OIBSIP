import PizzaBase from "../models/PizzaBase.js";
import Sauce from "../models/Sauce.js";
import Cheese from "../models/Cheese.js";
import Vegetable from "../models/Vegetable.js";
import PizzaTemplate from "../models/PizzaTemplate.js";
import User from "../models/User.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../services/activity.service.js";

const getPizzaOptions = asyncHandler(
  async (req, res) => {
    const [
      bases,
      sauces,
      cheeses,
      vegetables,
    ] = await Promise.all([
      PizzaBase.find({
        isAvailable: true,
        stock: { $gt: 0 },
      }),

      Sauce.find({
        isAvailable: true,
        stock: { $gt: 0 },
      }),

      Cheese.find({
        isAvailable: true,
        stock: { $gt: 0 },
      }),

      Vegetable.find({
        isAvailable: true,
        stock: { $gt: 0 },
      }),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          bases,
          sauces,
          cheeses,
          vegetables,
        },
        "Pizza options fetched successfully"
      )
    );
  }
);

const getPizzaTemplates = asyncHandler(
  async (req, res) => {
    const {
      search = "",
      category = "",
      popular = "",
      offers = "",
    } = req.query;

    const filter = {
      isAvailable: true,
    };

    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (
      category === "Veg" ||
      category === "Non-Veg"
    ) {
      filter.category = category;
    }

    if (popular === "true") {
      filter.isPopular = true;
    }

    if (offers === "true") {
      filter.discountPercent = {
        $gt: 0,
      };
    }

    const pizzas =
      await PizzaTemplate.find(filter)
        .populate("base")
        .populate("sauce")
        .populate("cheese")
        .populate("vegetables")
        .sort({
          isPopular: -1,
          createdAt: -1,
        });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          pizzas,
          total: pizzas.length,
        },
        "Pizza catalog fetched successfully"
      )
    );
  }
);

/*
-----------------------------------------------------------------------
getPizzaById
-----------------------------------------------------------------------
Fetches a single pizza template and records a "view_pizza" activity
whenever the caller is a logged-in user (req.user is only populated
when a valid token is sent, thanks to the optionalAuthenticate
middleware). Guests can still view pizzas, they just won't have the
view saved against a user in MongoDB.
-----------------------------------------------------------------------
*/

const getPizzaById = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const pizza =
      await PizzaTemplate.findById(id)
        .populate("base")
        .populate("sauce")
        .populate("cheese")
        .populate("vegetables");

    if (!pizza) {
      throw new ApiError(
        404,
        "Pizza not found"
      );
    }

    if (req.user?.userId) {
      logActivity({
        userId: req.user.userId,
        action: "view_pizza",
        entityType: "Pizza",
        entityId: pizza._id.toString(),
        metadata: {
          name: pizza.name,
          category: pizza.category,
        },
        req,
      });
    }

    res.status(200).json(
      new ApiResponse(
        200,
        { pizza },
        "Pizza fetched successfully"
      )
    );
  }
);

/*
-----------------------------------------------------------------------
toggleFavorite
-----------------------------------------------------------------------
Adds/removes a pizza from the logged-in user's favourites list in
MongoDB (User.favorites) and logs the matching activity so that
"fav" actions show up in the activity feed exactly like the user
requested.
-----------------------------------------------------------------------
*/

const toggleFavorite = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const pizza =
      await PizzaTemplate.findById(id);

    if (!pizza) {
      throw new ApiError(
        404,
        "Pizza not found"
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }

    const alreadyFavorite = user.favorites.some(
      (favoriteId) =>
        favoriteId.toString() === id
    );

    if (alreadyFavorite) {
      user.favorites = user.favorites.filter(
        (favoriteId) =>
          favoriteId.toString() !== id
      );
    } else {
      user.favorites.push(pizza._id);
    }

    await user.save();

    await logActivity({
      userId,
      action: alreadyFavorite
        ? "remove_favorite"
        : "add_favorite",
      entityType: "Pizza",
      entityId: pizza._id.toString(),
      metadata: {
        name: pizza.name,
      },
      req,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          isFavorite: !alreadyFavorite,
          favorites: user.favorites,
        },
        alreadyFavorite
          ? "Removed from favourites"
          : "Added to favourites"
      )
    );
  }
);

/*
-----------------------------------------------------------------------
getMyFavorites
-----------------------------------------------------------------------
Returns the logged-in user's favourite pizzas, fully populated, so
the Favorites page can read straight from MongoDB instead of
localStorage.
-----------------------------------------------------------------------
*/

const getMyFavorites = asyncHandler(
  async (req, res) => {
    const userId = req.user.userId || req.user.id;

    const user = await User.findById(userId).populate({
      path: "favorites",
      populate: [
        { path: "base" },
        { path: "sauce" },
        { path: "cheese" },
        { path: "vegetables" },
      ],
    });

    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }

    res.status(200).json(
      new ApiResponse(
        200,
        { pizzas: user.favorites || [] },
        "Favourites fetched successfully"
      )
    );
  }
);

export {
  getPizzaOptions,
  getPizzaTemplates,
  getPizzaById,
  toggleFavorite,
  getMyFavorites,
};