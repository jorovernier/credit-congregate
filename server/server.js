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

const {getCards, getCardInfo} = require('./controllers/controller')
const {getUserInfo, getUserCards, getWantedCards, editWantedNotes} = require('./controllers/user')

app.post('/seed', (req, res) => (seq.query(seedQuery).then(() => res.sendStatus(200))))
// seed()

app.get('/cards', getCards)
app.get('/card/:id', getCardInfo)

app.get('/user/:id', getUserInfo)
app.get('/user/cards/:id', getUserCards)
app.get('/user/wants/:id', getWantedCards)
app.put('/user/wants/:id', editWantedNotes)

app.listen(process.env.PORT, () => console.log(`Applying for credit cards on port ${process.env.PORT}.`))