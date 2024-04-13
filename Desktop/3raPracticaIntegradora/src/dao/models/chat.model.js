import mongoose from 'mongoose'

const chatCollection = 'chat'

const chatSchema = new mongoose.Schema({
    email: { type: String, required: true },
    message: { type: String, required: true },
    postTime: { type: Date, default: Date.now }
})

export const chatModel = mongoose.model(chatCollection, chatSchema)