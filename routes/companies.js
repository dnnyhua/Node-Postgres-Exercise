const express = require('express');
const router = express.Router();
const db = require("../db")
const ExpressError = require("../expressError")


router.get('/', async (req,res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        // console.log(results)
        return res.json({companies: results.rows})
    } catch(e){
        return next(e)
    }
    
})


router.get('/:code', async (req, res, next) => {
    try{
        const {code} = req.params
        const companyResult = await db.query(`SELECT * FROM companies WHERE code=$1`,[code])
        if(companyResult.rows.length === 0){
            throw new ExpressError(`Cannot find company code: ${code}`, 404)
        }
        const invoicesResult = await db.query(`SELECT id FROM invoices WHERE comp_code=$1`, [code])

        const company = companyResult.rows[0];
        const invoicesID = (invoicesResult.rows).map(invoice => invoice.id);
        // const invoicesID = invoices.map(i => i.id)    
        return res.json({company: company, invoices: invoicesID})
    } catch(e) {
        return next(e);
    }

    


})


// post request to add a company: {code, name, description}
// should return obj of new company added: {company: {code, name, description}}
router.post('/', async function (req, res, next) {
    try{
        const results = await db.query(
            'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [req.body.code, req.body.name, req.body.description])
        console.log(results)
        return res.json({company: results.rows[0]})
    } catch(e) {
        return next(e)
    }
})


router.patch('/:code', async (req, res, next) => {
    try{
        const {code} = req.params;
        const {name, description} = req.body;

        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code])

        if (results.rows.length === 0){
            throw new ExpressError(`Cannot find company code: ${code}`, 404)
        }

        return res.json({company: results.rows[0]})
    } catch(e) {
        return next(e);
    }
})


router.delete('/:code', async (req, res, next) =>{
    try {
        const results = await db.query('DELETE FROM companies WHERE code=$1 RETURNING code', [req.params.code])
        if(results.rows.length === 0) {
            throw new ExpressError(`Cannot find company code: ${req.params.code}`, 404)
        }
        return res.json({status: "deleted"})
    } catch(e){
        return next(e)
    }
})





module.exports = router;