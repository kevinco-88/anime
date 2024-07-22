const mongoose = require("mongoose");

const animeSchema = new mongoose.Schema({
  mal_id: Number,
  url: String,
  images: {
    jpg: {
      image_url: String,
      small_image_url: String,
      large_image_url: String,
    },
    webp: {
      image_url: String,
      small_image_url: String,
      large_image_url: String,
    },
  },
  trailer: {
    youtube_id: String,
    url: String,
    embed_url: String,
    images: {
      image_url: String,
      small_image_url: String,
      medium_image_url: String,
      large_image_url: String,
      maximum_image_url: String,
    },
  },
  approved: Boolean,
  titles: [
    {
      type: {
        type: String,
      },
      title: String,
    },
  ],
  title: String,
  title_english: String,
  title_japanese: String,
  title_synonyms: [String],
  type: String,
  source: String,
  episodes: Number,
  status: String,
  airing: Boolean,
  aired: {
    from: Date,
    to: Date,
    prop: {
      from: {
        day: Number,
        month: Number,
        year: Number,
      },
      to: {
        day: Number,
        month: Number,
        year: Number,
      },
    },
    string: String,
  },
  duration: String,
  rating: String,
  score: Number,
  scored_by: Number,
  rank: Number,
  popularity: Number,
  members: Number,
  favorites: Number,
  synopsis: String,
  background: String,
  season: String,
  year: Number,
  broadcast: {
    day: String,
    time: String,
    timezone: String,
    string: String,
  },
  producers: [
    {
      mal_id: Number,
      type: String,
      name: String,
      url: String,
    },
  ],
  licensors: [String],
  studios: [
    {
      mal_id: Number,
      type: String,
      name: String,
      url: String,
    },
  ],
  genres: [
    {
      mal_id: Number,
      type: String,
      name: String,
      url: String,
    },
  ],
  explicit_genres: [String],
  themes: [String],
  demographics: [
    {
      mal_id: Number,
      type: String,
      name: String,
      url: String,
    },
  ],
});

const anime = mongoose.model("Anime", animeSchema);
module.exports = { anime };
