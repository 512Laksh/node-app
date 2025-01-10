const restify = require("restify");
require("dotenv").config();
const server = restify.createServer();
const port = parseInt(process.env.PORT);
const mysql = require("mysql");
server.use(restify.plugins.bodyParser());
const { faker } = require('@faker-js/faker');
let data ={};


var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

server.get("/mysql/get", (req, res, next) => {
  con.query("SELECT * FROM `nodesql`", (err, result, fields) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

server.post("/mysql/create", (req, res, next) => {
  let name = req.body.name;
  let email = req.body.email;
  let pass = req.body.pass;
  insertData(name, email, pass);
  res.send("1 record inserted");
});

server.del("/mysql/delete", (req, res, next) => {
  let id = req.body.id;
  deleteData(id);
  res.send("1 row deleted");
});

server.put("/mysql/update/:id", (req, res, next) => {
  let id = req.params.id;
  updateData(req.body, id);
  res.send("1 row updated");
});



server.get("/mysql/report", (req, res, next) => {
  let query1 = "SELECT count(*) FROM `nodesql`";
  con.query(query1, (err, result, fields) => {
    if (err) throw err;
    data = { totalUserCount: result[0]['count(*)'] };
    // res.send(data);
    // console.log(data);
  });

  // let query2 = `SELECT department, count(*) AS users FROM nodesql GROUP BY department`;
  // con.query(query2, (err, result, fields) => {
  //     if (err) throw err;
  //     data.departmentCount= result;
  //     // res.send(result);
  //     console.log(data);
  //   });

    let query3 = `SELECT department,
    COUNT(*) totalUsers, 
    COUNT(CASE WHEN status = 'active' THEN 1 END) AS activeUsers, 
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) AS inactiveUsers FROM nodesql GROUP BY department`;
    con.query(query3, (err, result, fields) => {
        if (err) throw err;
        data.Deparments= result;
        // res.send(result);
        console.log(data);
      });

    //   let query4 = `SELECT department, count(*) as InactiveUsers FROM nodesql where status='inactive' GROUP BY department`;
    // con.query(query4, (err, result, fields) => {
    //     if (err) throw err;
    //     data.InctiveUserCount= result;
    //     // res.send(result);
    //     console.log(data);
    //   });
      
setTimeout(() => {
  res.send(data)
}, 2000);
});

async function bulkinsert(){
  let bulkData = []; 
  for (let i = 0; i < 450000; i++) { 
    const department = faker.helpers.arrayElement(['sales','collection','marketing','support','hr']);
    const name = faker.person.firstName(); 
    const email = faker.internet.email(); 
    const birthdate = faker.date.birthdate();
    const status= faker.helpers.arrayElement(['active', 'inactive']);
    const login= Date.now();
    const baselogout=login + (7 * 60 * 60 * 1000);
    const logout= baselogout +  Math.random() * (1 * 60 * 60 * 1000);
    bulkData.push([name, email, birthdate, department, login, logout, status]);
  }
    try{
      let sql=`INSERT INTO nodesql (name, email, birthdate, department, login, logout, status) VALUES ?`;
      const response = await con.query(sql, [bulkData], (err, res)=>{
        if (err) throw err;
      });
      // res.send("data inserted");
      console.log("data inserted") 
     }catch(err){
      // res.send(err);
      console.log(err);
     } 
}
// setTimeout(() => {
// bulkinsert();
// }, 3000);










function insertData(name, email, pass) {
  var sql =
    "INSERT INTO `nodesql` (`name`, `email`, `password`) VALUES ('"+name +"', '"+email +"', '" +pass +"')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    //   console.log("1 record inserted"+result);
  });
}

function deleteData(id) {
  var sql = "DELETE FROM `nodesql` WHERE `nodesql`.`id` = " + id + "";
  con.query(sql, function (err, result) {
    if (err) throw err;
  });
}

function updateData(body, id) {
  var sql = "UPDATE nodesql SET ? WHERE id = ?";
  con.query(sql, [body, id], function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
}

function getData() {
  var sql = "SELECT * FROM `nodesql`";
  let result = () =>
    con.query(sql, (err, result, fields) => {
      if (err) throw err;
      console.log(result);
      return result;
    });
  return result();
}

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
