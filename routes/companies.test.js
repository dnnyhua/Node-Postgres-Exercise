process.env.NODE_ENV = 'test';
const request = require("supertest");
const app = require("../app");
const db = require("../db");


let testCompany;
beforeEach(async ()=> {

    await db.query(`DELETE FROM companies`);
    await db.query('DELETE FROM invoices');
    await db.query("SELECT setval('invoices_id_seq', 1, false)"); // need to include this to assign ID to invoices inserted

    const result = await db.query(
        `INSERT INTO companies (code, name, description) 
        VALUES ('apple', 'Apple Computer', 'Maker of OSX.' ), 
               ('ibm', 'IBM', 'Big blue.'),
               ('google','Google', 'The dream job')`); 
    testCompany = result.rows[0]

    const invResult = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
           VALUES ('apple', 100, false, '2018-01-01', null),
                  ('apple', 200, true, '2018-02-01', '2018-02-02'), 
                  ('ibm', 300, false, '2018-03-01', null),
                  ('google', 500, false, '2018-03-01', null)
                   RETURNING id`);
})


afterEach(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query('DELETE FROM invoices')
})


// // need to include db.end() to stop connection to the database. If not the script will show that it is still running
afterAll(async () => {
    await db.end()
})

describe("GET /", () => {
    
    test("get list of company", async () => {
        const result = await request(app).get("/companies")
        expect( result.statusCode).toBe(200);
        expect(result.body).toEqual({
            "companies": [
                {code: "apple", name: "Apple Computer", description: "Maker of OSX."},
                {code: "ibm", name: "IBM", description: "Big blue."},
                {code: "google", name: "Google", description: "The dream job"}
            ]
        })
    })
})


describe("GET /ibm", function () {

    test("return company info", async function () {
      const result = await request(app).get("/companies/ibm");
      expect(result.body).toEqual(
          {
            "company": {
              code: "ibm",
              name: "IBM",
              description: "Big blue."
            },
              invoices: [3]
            }
            )
    });
     
    test("It should return 404 for no-such-company", async function () {
      const result = await request(app).get("/companies/blargh");
      expect(result.status).toEqual(404);
    })
  });
  