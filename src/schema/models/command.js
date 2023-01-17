import mongoose from "mongoose";

const schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    obtainDate: {
        type: String,
        required: true,
    },
    card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    result: {
        type: String,
        required: true
    },
})

export default mongoose.model('Command', schema, "Commands")