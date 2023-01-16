import mongoose from "mongoose";

const fixedCard = new mongoose.Schema({
    cardType: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    description: {
        type: String,
        required: true,
    },
    totalCards: {
        type: Number,
        required: true,
    },
    fixedGame: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    fixedCards: [{
        type: fixedCard,
    }],
    channelPoints: {
        type: Number
    },
    bits: {
        type: Number
    },
})

export default mongoose.model('LootBag', schema, "LootBags")