const mongoose = require('mongoose')
const cmtSchema = mongoose.Schema({
    text: {
        type: String,
        trim: true,
    },
    boardName: {
        type: String
    },
    idx: { //게시글 idx
        type: Number,
    },
    commentIdx: {
        type: String,
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
cmtSchema.static('findAll', function (cb) {
    return this.find({}, cb)
})
const Cmt = mongoose.model('Cmt', cmtSchema)
module.exports = { Cmt }