const express = require('express');
const app = express();
const cors = require('cors')
const { Pool } = require('pg');

const port = 4000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fuzzy',
  password: 'postgres',
  port: 5432,
})

app.use(cors())

app.get('/actors/basic', async (req, res) => {
  const name = req.query.name;
  const queryName = `SELECT * from actors where name ilike '%${name}%' limit 10`
  const data = await pool.query(queryName)
  return res.send(data.rows);
})

// arbitrary decission to support only 2 words
app.get('/actors/mid', async (req, res) => {
  const name = req.query.name;
  const baseNameCond = name.split(' ').join('%');
  const reversedNameCond = name.split(' ').reverse().join('%')
  const query = `SELECT * from actors where name ilike '%${baseNameCond}%' or name ilike '%${reversedNameCond}%' limit 10`

  const data = await pool.query(query)
  return res.send(data.rows)
})

app.get('/actors/fuzzy', async (req, res) => {
  const name = req.query.name;
  const query = `SELECT * from actors where word_similarity(name, '${name}') > 0.2 order by word_similarity(name, '${name}') desc limit 10`
  const data = await pool.query(query)
  res.send(data.rows)
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})