import mongoose from "mongoose";

const userCardSchema = new mongoose.Schema({
    card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})

const statsSchema = new mongoose.Schema({
    creationDate: {
        type: String,
        required: true
    },
    favoriteCard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card'
    },
    totalOpenings: {
        type: Number,
        required: true
    },
    totalCardUses: {
        type: Number,
        required: true
    },
    usedCards: [{
        type: userCardSchema,
    }]
})

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    passwordHash: {
        type: String,
        minlength: 5
    },
    status: {
        type: String,
        required: true,
    },
    stats: {
        type: statsSchema,
    },
    cards: [{
        type: userCardSchema,
    }]
})

export default mongoose.model('User', schema, "Users")