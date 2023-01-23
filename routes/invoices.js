const express = require('express');
const router = express.Router();
const db = require("../db")
const ExpressError = require("../expressError")


router.get('/', async (req,res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        // console.log(results)
        return res.json({invoices: results.rows})
    } catch(e){
        return next(e)
    }
    
})


router.get('/:id', async (req, res, next) => {
    try{
        let {id} = req.params;
        const result = await db.query(
            `SELECT i.id, i.amt, i.comp_code, i.paid, i.add_date, i.paid_date, c.name, c.description
            FROM invoices AS i
            INNER JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id=$1`, [id]);
        if(result.rows.length === 0) {
            throw new ExpressError(`Invoice not found for ID: ${id}`)
        }
        const data = result.rows[0]
        console.log(data)
        const invoice = {id: data.id, amt: data.amt, paid: data.paid, add_date: data.paid_date, paid_date: data.paid_date, company: {code: data.comp_code, name: data.name, description: data.description} }
        return res.json({invoice: invoice})
    } catch(e){
        return next(e);
    }
})


router.post('/', async (req, res, next) => {
    try{
        const {comp_code, amt} = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt])
        return res.json({invoice: result.rows})
    } catch(e) {
        return next(e)

    }
})


router.patch('/:id', async (req, res, next) => {
    const {id} = req.params;
    const {amt} = req.body;

    const result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [amt, id]);
    return res.json({invoice: result.rows[0]})

})


router.delete('/:id', async (req, res, next) =>{
    try {
        const {id} = req.params;
        const result = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [id])
        if(result.rows.length === 0) {
            throw new ExpressError(`Cannot find invoice ID: ${id}`, 404)
        }
        return res.json({status: "deleted"})
    } catch(e){
        return next(e)
    }
})

module.exports = router;

