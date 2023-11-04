require('dotenv').config()
const Sequelize = require('sequelize')
const seq = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres'
})

const reg = /[;{}|[\]\\]/g
let trig = false;

function splitter(word){
    console.log(word)
    if(word.match(reg)){
        trig = true
    }
    return word.split("'").join("''")
}

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
        const {cardID, userID} = req.body
        seq.query(`
            INSERT INTO user_cards (user_id, card_id, apr, cl, nickname, uses, cust_img)
            VALUES (${userID}, ${cardID}, NULL, NULL, '', '', '');
        `).then(() => res.sendStatus(200))
    },
    addWanted: (req, res) => {
        const {cardID, userID} = req.body
        seq.query(`
            INSERT INTO user_wants (user_id, card_id, notes)
            VALUES (${userID}, ${cardID}, '');
        `).then(() => res.sendStatus(200))
    },
    editProfileInfo: (req, res) => {
        let {id} = req.params;
        let {newText} = req.body;
        
        for(prop in newText){
            newText[prop] = splitter(newText[prop])
        }
        let {firstName, lastName, username, email, bio} = newText

        if(trig){
            res.status(406).send(['{, }, |, \\, \\\\, or ;'])
        } else {
            seq.query(`
                UPDATE users SET
                first_name = '${firstName}',
                last_name = '${lastName}',
                username = '${username}',
                email = '${email}',
                bio = '${bio}'
                WHERE user_id = ${id};
            `).then(() => res.sendStatus(200))
            .catch(() => res.status(400).send('One of your input fields has too many characters!'))
        }
    },
    editPicture: (req, res) => {
        let {id} = req.params;
        let {pic} = req.body;

        pic = splitter(pic)

        if(trig){
            res.status(406).send(['{, }, |, \\, \\\\, or ;'])
        } else {
            seq.query(`
                UPDATE users SET
                profile_pic = '${pic}'
                WHERE user_id = ${id};
            `).then(() => res.sendStatus(200))
        }
    },
    editAquiredInfo: (req, res) => {
        let {id} = req.params;
        let {itemID, newText} = req.body;
        
        for(prop in newText){
            newText[prop] = splitter(newText[prop])
        }
        let {img, nickname, apr, limit, uses} = newText

        if(trig){
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
        newText = splitter(newText)

        if(trig){
            res.status(406).send(newText.match(reg))
        } else {
            seq.query(`
                UPDATE user_wants
                SET notes = '${newText}'
                WHERE want_id = ${itemID} AND user_id = ${id};
            `).then(() => res.sendStatus(200))
            .catch(() => res.status(406).send('Your notes must be 62 characters or less.'))
        }
    },
    deleteCards: (req, res) => {
        let id = req.params.id.split(',');
        seq.query(`
            DELETE FROM user_${id[0]}
            WHERE ${id[1]}_id = ${id[2]};
        `).then(() => res.sendStatus(200))
    }
}