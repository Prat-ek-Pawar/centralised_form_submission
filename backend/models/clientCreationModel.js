const mongoose = require("mongoose")
const {v4:uuidv4} = require("uuid")
const bcrypt = require("bcryptjs")

const clientSchema = mongoose.Schema(
    {
        clientID: { 
            type: String, 
            required: true, 
            default: uuidv4
        },
        userName: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },
        isLocked: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

clientSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

clientSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;