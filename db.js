import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()
const user = process.env.MONGO_USER
const password = process.env.MONGO_PASSWORD
const host = process.env.MONGO_HOST

const MONGODB_URI = `mongodb+srv://${user}:${password}@${host}`;

mongoose.set('strictQuery', true);

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('connected to MongoDB')
}).catch(error => {
    console.error('error connection to MongoDB', error.message)
})

