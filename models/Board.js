const mongoose = require('mongoose')
const boardSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    title: {
        type: String,
        maxlength: 50
    },
    text: {
        type: String,
        trim: true,
    },
    boardName: {
        type: String
    },
    idx: {
        type: Number,
        unique: true
    },
    nick: {
        type: String,
        trim: true
    },
    date: {
        type: String,
        trim: true
    }
})
boardSchema.static('findAll', function (cb) {
    return this.find({}, cb)
})
const Board = mongoose.model('Board', boardSchema)
module.exports = { Board }