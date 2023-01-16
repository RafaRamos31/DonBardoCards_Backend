import mongoose from "mongoose";

const rarityWeight = new mongoose.Schema({
    cardType: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        required: true
    }
})

const schema = new mongoose.Schema({
    ref: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
    },
    currentGame: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    appUsername: {
        type: String,
        required: true,
    },
    giftLootbag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LootBag'
    },
    rarityWeights: [{
        type: rarityWeight,
    }],
})

export default mongoose.model('StreamStatus', schema, "StreamStatus")