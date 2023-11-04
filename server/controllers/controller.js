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
        let sql;
        let filter = req.query.filter.split(',')
        let order = req.query.order.split(',')
        filter[3] = filter[3].split("'").join("''")
        if(filter[1] === 'tags'){
            sql = `
            SELECT * FROM (
                SELECT card_id, tag 
                FROM ${filter[0]}, UNNEST(${filter[1]}) AS tag
                WHERE tag ${filter[2]} '%${filter[3]}%'
                ) AS c
            JOIN cards
            ON c.card_id = cards.card_id
            ORDER BY ${order[0]} ${order[1]};`
        } else if(filter[2] === 'LIKE'){
            filter[3] = `%${filter[3]}%`
            sql = `
                SELECT * FROM ${filter[0]}
                WHERE LOWER(${filter[1]}) ${filter[2]} LOWER('${filter[3]}')
                ORDER BY ${order[0]} ${order[1]};
            `
        } else {
            sql = `
                SELECT * FROM (
                    SELECT card_id FROM ${filter[0]} 
                    WHERE ${filter[1]} ${filter[2]} '${filter[3]}'
                    ) AS c
                JOIN cards
                ON c.card_id = cards.card_id
                GROUP BY c.card_id, cards.card_id
                ORDER BY ${order[0]} ${order[1]};
            `
        }
        seq.query(sql).then(dbRes => res.status(200).send(dbRes[0]))
    }
}