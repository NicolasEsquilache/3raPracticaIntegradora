import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    first_name: String,
    last_name: String,
    email: String,
    age: Number,
    password: String,
    cartId: String,
    role: {
        type: String,
        enum: ['admin', 'usuario'],
        default: 'usuario'
    }
});

const User = model('users', userSchema);

export default User;