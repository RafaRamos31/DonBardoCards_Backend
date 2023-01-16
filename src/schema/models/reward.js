import mongoose from "mongoose";

const schema = new mongoose.Schema({
    purchaserID: {
        type: String,
        required: true,
    },
    purchaserName: {
        type: String,
        required: true,
    },
    obtainDate: {
        type: String,
        required: true,
    },
    lootBag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LootBag',
        required: true
    },
})

export default mongoose.model('Reward', schema, "Rewards")