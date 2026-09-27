import express from "express";

import {
  getPizzaOptions,
  getPizzaTemplates,
  getPizzaById,
  toggleFavorite,
  getMyFavorites,
} from "../controllers/pizza.controller.js";

import authenticate from "../middleware/authenticate.js";
import optionalAuthenticate from "../middleware/optionalAuthenticate.js";

const router = express.Router();

router.get(
  "/",
  getPizzaOptions
);

router.get(
  "/templates",
  getPizzaTemplates
);

// IMPORTANT: this must be registered before the "/:id" route below,
// otherwise Express would try to treat "favorites" as a pizza id.
router.get(
  "/favorites/mine",
  authenticate,
  getMyFavorites
);

router.post(
  "/:id/favorite",
  authenticate,
  toggleFavorite
);

router.get(
  "/:id",
  optionalAuthenticate,
  getPizzaById
);

export default router;
