import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 5
    },
    iconURL: {
        type: String,
        minlength: 5
    }
})

schema.plugin(uniqueValidator)
export default mongoose.model('Game', schema, "Games")