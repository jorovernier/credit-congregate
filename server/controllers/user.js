require('dotenv').config()
const Sequelize = require('sequelize')
const seq = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres'
})

module.exports = {
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
            WHERE user_id = ${id}
            ORDER BY c.bank_name ASC;
        `).then(dbRes => res.status(200).send(dbRes[0]))
    },
    getWantedCards: (req, res) => {
        let {id} = req.params;
        seq.query(`
            SELECT u.want_id, u.notes, c.card_name, c.bank_name, c.card_img
            FROM user_wants AS u
            JOIN cards AS c
            ON u.card_id = c.card_id
            WHERE user_id = ${id}
            ORDER BY c.bank_name ASC;
        `).then(dbRes => res.status(200).send(dbRes[0]))
    },
    addAquired: (req, res) => {

    },
    addWanted: (req, res) => {

    },
    editAquiredInfo: (req, res) => {
        let {id} = req.params;
        let {itemID} = req.body;
        let {img, nickname, apr, limit, uses} = req.body.newText
        let reg = /[;{}|[\]\\]/g

        img = img.split("'").join("''")
        nickname = nickname.split("'").join("''")
        apr = apr.split("'").join("''")
        limit = limit.split("'").join("''")
        uses = uses.split("'").join("''")
        
        if(img.match(reg) || nickname.match(reg) || apr.match(reg) || limit.match(reg) || uses.match(reg)){
            res.status(406).send(['{, }, |, \\, \\\\, or ;'])
        } else {
            seq.query(`
                UPDATE user_cards SET
                apr = ${+apr.replace('%', '')},
                cl = ${+limit.replace('$', '')},
                nickname = '${nickname}',
                uses = '${uses}',
                cust_img = '${img}'
                WHERE uc_id = ${itemID} AND user_id = ${id};
            `).then(() => res.sendStatus(200))
            .catch(() => res.status(406).send('Your nickname must be 20 or less characters and your uses must be 62 or less characters.'))
        }
    },
    editWantedNotes: (req, res) => {
        let {id} = req.params;
        let {newText, itemID} = req.body;
        if(newText.includes("'")){
            newText = newText.split("'").join("''")
        }
        if(newText.match(/[;{}()|[\]\\]/g)){
            res.status(406).send(newText.match(/[;{}()|[\]\\]/g))
        } else {
            seq.query(`
                UPDATE user_wants
                SET notes = '${newText}'
                WHERE want_id = ${itemID} AND user_id = ${id};
            `).then(() => res.sendStatus(200))
            .catch((err) => res.status(406).send('Your notes must be 62 characters or less.'))
        }
    }
}