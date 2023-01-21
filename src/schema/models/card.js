import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const limitedSchema = new mongoose.Schema({
  existences: {
    type: Number,
    required: true,
  },
});

const cooldownSchema = new mongoose.Schema({
  cooldownFinishAt: {
    type: String,
    required: true,
  },
  secondsCooldown: {
    type: Number,
    required: true,
  },
  secondsAfterStack: {
    type: Number,
  },
});

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  rarity: {
    type: String,
    required: true,
    minlength: 3,
  },
  fragments: {
    type: Number,
    required: true,
  },
  command: {
    type: String,
    unique: true,
    required: true,
  },
  stackable: {
    type: Boolean,
    required: true,
  },
  secondsEffect: {
    type: Number,
  },
  limited: {
    type: limitedSchema,
  },
  cooldown: {
    type: cooldownSchema,
  },
});
schema.plugin(uniqueValidator);
export default mongoose.model("Card", schema, "Cards");
