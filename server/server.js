const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

const {seed, getCards, getCardInfo, getUserInfo, getUserCards, getWantedCards} = require('./controller')

app.post('/seed', seed)
app.get('/cards', getCards)
app.get('/card/:id', getCardInfo)
app.get('/user/:id', getUserInfo)
app.get('/user/cards/:id', getUserCards)
app.get('/user/wants/:id', getWantedCards)
// seed()

app.listen(process.env.PORT, () => console.log(`Applying for credit cards on port ${process.env.PORT}.`))