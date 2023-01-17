import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const stackableSchema = new mongoose.Schema({
    timeEffect: {
        type: Boolean,
        required: true
    },
    secondsEffect: {
        type: Number,
    }
})

const limitedSchema = new mongoose.Schema({
    existences: {
        type: Number,
        required: true
    }
})

const cooldownSchema = new mongoose.Schema({
    secondsCooldown: {
        type: Number,
        required: true
    },
    addStackCooldown: {
        type: Boolean,
        required: true
    },
    stackSecondsApport: {
        type: Number,
    },
    cooldownFinishAt: {
        type: String,
        required: true
    },
})

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true,
    },
    rarity: {
        type: String,
        required: true,
        minlength: 3
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
    limited: {
        type: limitedSchema,
    },
    stackable: {
        type: stackableSchema,
    },
    cooldown: {
        type: cooldownSchema,
    },
})
schema.plugin(uniqueValidator)
export default mongoose.model('Card', schema, "Cards")