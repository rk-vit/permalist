import express from "express";
import bodyParser from "body-parser";
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
import pg from "pg";
const db = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false,
  },
});


db.connect((err) => {
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
    const result = await db.query("SELECT * FROM items");
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
    await db.query('INSERT INTO items (title) VALUES($1)', [item]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting data');
  }
});



app.post("/edit", async(req,res)=>{
    try{
      await db.query("UPDATE items SET title = $1 where id = $2",[req.body.updatedItemTitle,parseInt(req.body.updatedItemId,10)])
      res.redirect("/")
    }catch(err){
      console.error(err);
    }
});

app.post("/delete",async(req, res) => {
    try{
      await db.query("DELETE FROM items WHERE id = $1",[parseInt(req.body.deleteItemId,10)])
      res.redirect('/')
    }catch(err){
      console.log(err);
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
