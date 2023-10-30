require('dotenv').config()
const Sequelize = require('sequelize')
const seq = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres'
})

module.exports = {
    getCards: (req, res) => {
        const {sort, order} = req.query
        seq.query(`
            SELECT * FROM cards
            ORDER BY ${sort} ${order};
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
    filter: (req, res) => {
        let filter = req.query.filter.split(',')
        let order = req.query.order.split(',')

        filter[3] = filter[3].split("'").join("''")

        if(filter[2] === 'LIKE'){
            filter[3] = `%${filter[3]}%`
        }
        seq.query(`
            SELECT * FROM ${filter[0]}
            WHERE ${filter[1]} ${filter[2]} '${filter[3]}'
            ORDER BY ${order[0]} ${order[1]};
        `).then(dbRes => res.status(200).send(dbRes[0]))
    },
    filterDeluxe: (req, res) => {
        let filter = req.query.filter.split(',')
        filter[3] = filter[3].split("'").join("''")
        let sql;
        if(filter[1] === 'tags'){
            sql = `SELECT card_id, UNNEST(${filter[1]}) FROM ${filter[0]}
            WHERE '${filter[3]}' ${filter[2]} ANY(${filter[1]});`
        } else {
            sql = `SELECT card_id FROM ${filter[0]}
            WHERE ${filter[1]} ${filter[2]} ${filter[3]};`
        }
    
        seq.query(sql).then(dbRes => {
            if(dbRes[0].length > 0){
                let toSend = []
                let cards = new Set([])

                const test = (timer) => {
                    if(toSend.length === timer){
                        res.status(200).send(toSend)
                    }
                }

                for(let i = 0; i < dbRes[0].length; i++){
                    cards.add(dbRes[0][i].card_id)
                }
                cards = [...cards]
                for(let i = 0; i < cards.length; i++){
                    seq.query(`
                        SELECT * FROM cards
                        WHERE card_id = ${cards[i]};
                    `).then(dbRes2 => {
                        toSend.push(dbRes2[0][0])
                        test(cards.length)
                    })
                }
            } else {
                res.status(200).send([])
            }
        })
        
    }
}