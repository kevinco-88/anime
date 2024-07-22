const { Router } = require("express");
const animeController = require("../controllers/animecontrollers");

const router = Router();

router.get("/api/animes", animeController.anime_get);
router.get("/api/animes/:id", animeController.anime_get_by_id);
router.get("/api/genres", animeController.get_genres);
router.get("/api/studios", animeController.get_studios);

module.exports = router;
