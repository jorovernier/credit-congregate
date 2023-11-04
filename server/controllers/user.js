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
    editUserInfo: (req, res) => {
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
    editPassword: (req, res) => {

    }
}