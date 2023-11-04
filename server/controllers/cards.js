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
        seq.query(`
            SELECT card_id, card_name, bank_name, card_img, notes, reward_type, flat_rate, sub, af, apr, score, secured, student, ff FROM (
                SELECT * FROM 
                (
                    SELECT card_id AS cc_id FROM cards
                ) AS const,
                (
                    SELECT card_id AS bn_id 
                    FROM cards
                    WHERE LOWER(bank_name) LIKE LOWER('%${filter[0]}%')
                ) AS bns,
                (
                    SELECT card_id AS t_id, tag 
                    FROM categories, UNNEST(tags) AS tag
                    WHERE tag LIKE LOWER('%${filter[1]}%')
                ) AS ts,
                (
                    SELECT card_id AS rr_id 
                    FROM categories 
                    WHERE reward_rate ${filter[2] === 'gt' ? '>':'<'} ${filter[3]}
                ) AS rrs,
                (
                    SELECT card_id AS rt_id 
                    FROM cards
                    WHERE reward_type LIKE '${filter[4]}'
                ) AS rts
                WHERE const.cc_id = ts.t_id 
                AND const.cc_id = bns.bn_id 
                AND const.cc_id = rrs.rr_id 
                AND const.cc_id = rts.rt_id
            ) AS g
            JOIN cards 
            ON g.cc_id = cards.card_id
            GROUP BY cards.card_id
            ORDER BY ${order[0]} ${order[1]};
        `).then(dbRes => res.status(200).send(dbRes[0]))
    }
}