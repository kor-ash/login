const express = require('express')
const app = express()
const port = 5000;
const mongoose = require('mongoose')
const config = require('./config/key')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { auth } = require('./middleware/auth')
const { User } = require("./models/User")
const { Board } = require("./models/Board")
const { Cmt } = require("./models/Comment")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.json())
const cors = require('cors')
app.use(cors())
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log("DB Connected")).catch(err => console.log(err))

app.post('/api/users/post', (req, res) => {
    const board = new Board(req.body)
    board.save((err, boaredInfo) => {
        if (err)
            return res.json({ success: false, err })
        return res.status(200).json({ title: req.body.title, text: req.body.text })
    })
})
app.get('/api/users/info', (req, res) => {
    //console.log(req.query)
    let tmp = []
    Board.find({ nick: req.query.nick }, (err, info) => {
        //console.log(info)
        for (let i = 0; i < info.length; i++) {
            tmp.push(info[i])
        }
        return res.send(tmp)
    })
})
app.get('/api/users/comment', (req, res) => {
    Cmt.findAll(function (err, results) {
        if (err)
            return res.json({ success: false })
        let tmp = []
        for (let i = 0; i < results.length; i++) {
            if (results[i].idx == req.query.idx) {
                tmp.push(results[i])
            }
        }
        return res.send(tmp)
    })
})
app.get('/api/users/content', (req, res) => {
    const boardName = req.query.boardName
    const idx = req.query.idx;
    //console.log(boardName, idx)
    Board.findAll(function (err, results) {
        // console.log("results:", results)
        if (err)
            return res.json({ success: false })
        let tmp = []
        for (let i = 0; i < results.length; i++) {
            if (results[i].boardName === boardName && results[i].idx == idx) {
                tmp.push({ "title": results[i].title, "text": results[i].text, "nick": results[i].nick })
            }
        }
        return res.send(tmp)
    })
})
app.post('/api/users/comment/register', (req, res) => {
    const cmt = new Cmt(req.body)
    //console.log(req.body)
    cmt.save((err, cmtInfo) => {
        if (err) {
            console.log(err)
            return res.json({ success: false, err })
        }
        return res.status(200).json({
            success: true
        })
    })

})
app.post('/api/users/comment/delete', (req, res) => {
    Cmt.deleteOne({ commentIdx: req.body.commentIdx, nick: req.body.nick }, (err, cmtInfo) => {
        if (err)
            return res.json({ success: false, err })
        return res.json({ success: true })
    })
})
app.post('/api/users/list', (req, res) => {
    Board.findAll(function (err, results) {
        if (err)
            return res.json({ success: false })
        let tmp = []
        for (let i = 0; i < results.length; i++) {
            if (results[i].boardName === req.body.boardName)
                tmp.push({ "title": results[i].title, "text": results[i].text, "idx": results[i].idx })
        }
        return res.send(tmp)
    })
})

app.post('/api/users/delete', (req, res) => {
    Board.deleteOne({ idx: req.body.idx, boardName: req.body.boardName }, (err, boardInfo) => {
        if (err)
            return res.json({ success: false, err })
        return res.json({ success: true })
    })
})
app.post('/api/users/register', (req, res) => {
    const user = new User(req.body)
    let idPossible = true //ID 중복
    let nickPossible = true
    let pwPossible = true //PW 길이제한
    //console.log(req.body)
    if (req.body.password.length < 5)
        pwPossible = false
    User.findOne({ nick: req.body.nick }, (err, userInfo) => {
        userInfo ? nickPossible = false : nickPossible = true
        User.findOne({ email: req.body.email }, (err, userinfo) => {
            !userinfo ? idPossible = true : idPossible = false
            if (idPossible && nickPossible && pwPossible) {
                user.save((err, userInfo) => {
                    if (err) {
                        return res.json({ success: false, err })
                    }
                    return res.status(200).json({ success: true })
                })
            }
            else
                return res.status(200).json({ success: false, pwlenViolate: !pwPossible, nickViolate: !nickPossible })
        })
    })

})
app.get('/api/hello', (req, res) => {
    res.send("안녕하세요~")
})
app.post('/api/users/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "없는 아이디 입니다."
            }
            )
        }
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err)
                res.cookie("x_auth", user.token).status(200).json({ loginSuccess: true, userId: user._id, nick: user.nick })
            })
        })
    })
})

app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})
app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
        if (err)
            return res.json({ success: false, err })
        return res.status(200).send({
            success: true
        })
    })
})
app.listen(port, () => { console.log(`Example ${port} is running!`) })