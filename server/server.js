const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

const {seed, getCards, getCardInfo} = require('./controller')

app.post('/seed', seed)
app.get('/cards', getCards)
app.get('/card/:id', getCardInfo)
// seed()

app.listen(process.env.PORT, () => console.log(`Applying for credit cards on port ${process.env.PORT}.`))