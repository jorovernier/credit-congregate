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
    },
    getUserInfo: (req, res) => {
        let {id} = req.params;
        seq.query(`
            SELECT * FROM users
            WHERE user_id = ${id};
        `).then(dbRes => res.status(200).send(dbRes[0]))
    },
    getUserCards: (req, res) => {
        let {id} = req.params;
        seq.query(`
            SELECT u.uc_id, u.apr, u.cl, u.cust_img, u.nickname, u.uses, c.card_name, c.bank_name, c.card_img, c.af
            FROM user_cards AS u
            JOIN cards AS c
            ON u.card_id = c.card_id
            WHERE user_id = ${id};
        `).then(dbRes => res.status(200).send(dbRes[0]))
    },
    getWantedCards: (req, res) => {
        let {id} = req.params;
        seq.query(`
            SELECT u.want_id, u.notes, c.card_name, c.bank_name, c.card_img
            FROM user_wants AS u
            JOIN cards AS c
            ON u.card_id = c.card_id
            WHERE user_id = ${id};
        `).then(dbRes => res.status(200).send(dbRes[0]))
    },
    editWantedNotes: (req, res) => {
        let {id} = req.params;
        let {newText, wantID} = req.body;
        if(newText.includes("'")){
            newText = newText.split("'").join("''")
        }
        if(newText.match(/[;{}()|[\]\\]/g)){
            res.status(400).send(newText.match(/[;{}()|[\]\\]/g))
        } else {
            seq.query(`
                UPDATE user_wants
                SET notes = '${newText}'
                WHERE want_id = ${wantID} AND user_id = ${id};
            `).then(() => res.status(200).send('gucci'))
            .catch((err) => res.status(405).send(err))
        }
    }
}