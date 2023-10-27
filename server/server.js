const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

const {seed, getCards, getCardInfo, getUserInfo, getUserCards} = require('./controller')

app.post('/seed', seed)
app.get('/cards', getCards)
app.get('/card/:id', getCardInfo)
app.get('/users/:id', getUserInfo)
app.get('/user/:id', getUserCards)
// seed()

app.listen(process.env.PORT, () => console.log(`Applying for credit cards on port ${process.env.PORT}.`))