import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from 'dotenv';

dotenv.config();

var __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Correct directory for EJS views
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

pool.connect((err) => {
  if (err) {
    console.error("Connection error:", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    const items = result.rows;
    res.render("index", { // Do not include .ejs extension here
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send('Error fetching items');
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await pool.query('INSERT INTO items (title) VALUES($1)', [item]);
    res.redirect("/");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send('Error inserting data');
  }
});

app.post("/edit", async (req, res) => {
  try {
    await pool.query("UPDATE items SET title = $1 WHERE id = $2", [
      req.body.updatedItemTitle,
      parseInt(req.body.updatedItemId, 10),
    ]);
    res.redirect("/");
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).send('Error updating item');
  }
});

app.post("/delete", async (req, res) => {
  try {
    await pool.query("DELETE FROM items WHERE id = $1", [
      parseInt(req.body.deleteItemId, 10),
    ]);
    res.redirect('/');
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send('Error deleting item');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
