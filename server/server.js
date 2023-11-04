const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())
require('dotenv').config()
const fs = require('fs')
const seedQuery = fs.readFileSync(__dirname + '/seed.sql').toString().trim()
const Sequelize = require('sequelize')
const seq = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres'
})

const {getCards, getCardInfo, filter} = require('./controllers/cards')
const {getUserInfo, editUserInfo, editPicture, editPassword} = require('./controllers/user')
const {getAcquired, getWanted, addAcquired, addWanted, editAcquired, editWanted, deleteCards} = require('./controllers/profileCards')

app.post('/seed', (req, res) => (seq.query(seedQuery).then(() => res.sendStatus(200))))

app.get('/cards', getCards)
app.get('/card/:id', getCardInfo)
app.get('/cards/filter', filter)

app.get('/user/:id', getUserInfo)
app.put('/user/profile/:id', editUserInfo)
app.put('/user/profile/pic/:id', editPicture)

app.get('/user/cards/:id', getAcquired)
app.get('/user/wants/:id', getWanted)
app.post('/user/have', addAcquired)
app.post('/user/want', addWanted)
app.put('/user/haves/:id', editAcquired)
app.put('/user/wants/:id', editWanted)
app.delete('/user/delete/:id', deleteCards)

app.listen(process.env.PORT, () => console.log(`Applying for credit cards on port ${process.env.PORT}.`))