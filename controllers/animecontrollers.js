const { anime } = require("../modules/anime");

module.exports.anime_get = async (req, res) => {
  const {
    q,
    genre,
    studio,
    episodesFrom,
    episodesTo,
    status,
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};

  if (q && q !== "") {
    query.title = { $regex: q, $options: "i" };
  }
  if (genre && genre !== "") {
    query["genres.name"] = genre;
  }
  if (studio && studio !== "") {
    query["studios.name"] = studio;
  }
  if (episodesFrom && episodesTo) {
    query.episodes = {
      $gte: parseInt(episodesFrom),
      $lte: parseInt(episodesTo),
    };
  } else if (episodesFrom) {
    query.episodes = { $gte: parseInt(episodesFrom) };
  } else if (episodesTo) {
    query.episodes = { $lte: parseInt(episodesTo) };
  }
  if (status && status !== "") {
    query.status = status;
  }

  console.log("Query Parameters:", req.query);
  console.log("Constructed Query:", query);

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const animes = await anime.find(query).skip(skip).limit(parseInt(limit));
    const totalAnimes = await anime.countDocuments(query);
    console.log("Total Animes Found:", totalAnimes);
    res.json({
      page: parseInt(page),
      totalAnimes,
      totalPages: Math.ceil(totalAnimes / limit),
      animes,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send(err);
  }
};

module.exports.anime_get_by_id = async (req, res) => {
  const id = req.params.id;

  try {
    const animeData = await anime.findById(id);
    if (!animeData) {
      return res.status(404).json({ error: "Anime not found" });
    }
    res.json(animeData);
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports.get_genres = async (req, res) => {
  try {
    const genres = await anime.distinct("genres.name");
    res.json(genres);
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports.get_studios = async (req, res) => {
  try {
    const studios = await anime.distinct("studios.name");
    res.json(studios);
  } catch (err) {
    res.status(500).send(err);
  }
};
