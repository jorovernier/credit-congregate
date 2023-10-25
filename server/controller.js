require('dotenv').config()

const fs = require('fs')
const seedQuery = fs.readFileSync(__dirname + '/seed.sql').toString().trim()

const Sequelize = require('sequelize')
const seq = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres'
})

module.exports = {
    seed: (req, res) => {
        seq.query(seedQuery).then(() => res.sendStatus(200))
    },
    getCards: (req, res) => {
        seq.query(`
            SELECT * FROM cards
            ORDER BY bank_name ASC;
        `).then(dbRes => res.status(200).send(dbRes[0]))
    },
    getCardInfo: (req, res) => {
        seq.query(`
            SELECT * FROM cards
            WHERE cards.card_id = ${+req.params.id};

            SELECT * FROM categories
            WHERE categories.card_id = ${+req.params.id};
        `).then(dbRes => res.status(200).send(dbRes[0]))
    }
}