import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';
const app = express();
const port = process.env.PORT;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
import pg from "pg";
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})


pool.connect((err) => {
  if (err) {
    console.error("Connection error:", err.stack);
  } else {
    console.log("Connected to the database");
  }
});


let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async(req, res) => { 
  var re = [];
  try{
    const result = await pool.query("SELECT * FROM items");
    const items = result.rows;

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  }catch(err){
    if(err) console.error(err);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  

  try {
    await pool.query('INSERT INTO items (title) VALUES($1)', [item]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting data');
  }
});



app.post("/edit", async(req,res)=>{
    try{
      await pool.query("UPDATE items SET title = $1 where id = $2",[req.body.updatedItemTitle,parseInt(req.body.updatedItemId,10)])
      res.redirect("/")
    }catch(err){
      console.error(err);
    }
});

app.post("/delete",async(req, res) => {
    try{
      await pool.query("DELETE FROM items WHERE id = $1",[parseInt(req.body.deleteItemId,10)])
      res.redirect('/')
    }catch(err){
      console.log(err);
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
