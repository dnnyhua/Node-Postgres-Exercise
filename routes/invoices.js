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
    try{
        const {id} = req.params;
        const {amt, paid} = req.body;
        let paidDate = null;

        // logic to check if payment was made or not
        const paymentStatus = await db.query(`SELECT paid, paid_date FROM invoices WHERE id=$1`, [id]);

        if(paymentStatus.rows.length === 0){
            throw new ExpressError(`Cannot find find invoice number ${id}`, 404)
        }

        const currPaidDate = paymentStatus.rows[0].paid_date; // paid_date will be null if it has not been paid

        // logic to handle paid_date if payment was made or not made
        if(!currPaidDate && paid){
            paidDate = new Date()
        } else if(!paid){
            paidDate = null
        } else {
            paidDate = currPaidDate
        }
        console.log(paymentStatus)

    
        const result = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING amt, paid, paid_date,  id`, [amt, paid, paidDate, id]);
       
        return res.json({invoice: result.rows[0]})    
    } catch(e){
        return next(e)
    }
    
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

