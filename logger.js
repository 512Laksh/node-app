const bulkData= require('./util')
const restify = require("restify");
require("dotenv").config();
const server = restify.createServer();
const port = parseInt(process.env.PORT);
const mysql = require("mysql");
server.use(restify.plugins.bodyParser());
const { faker } = require('@faker-js/faker');

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



async function bulkinsert(){
  try{
    let sql=`INSERT INTO logger_report (date_time, type, dispose_type, dispose_name, duration, agent_name, campaign_name, process_name, leadset, reference_uuid, customer_uuid, hold, mute, ringing, trasnfer, conference, call_time, dispose_time) VALUES ? `;
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


server.get('/mysql/report',(req, res, next)=>{
  let query=`SELECT 
    DATE(date_time) AS Date,
    HOUR(date_time) AS hour, 
    COUNT(*) AS call_count,
    SUM(duration) AS total_duration,
    SUM(hold) AS total_hold,
    SUM(mute) AS total_mute,
    SUM(ringing) AS total_ringing,
    SUM(transfer) AS total_transfer,
    SUM(conference) AS total_conference,
    COUNT(DISTINCT reference_uuid) AS unique_calls
    FROM logger_report
    GROUP BY HOUR(date_time);`;
con.query(query,(err, result)=>{
  if(err) throw err;
  // let data={};
  // data.response=result;
  // console.log(result)
  res.send(result)
  // console.log(data)
})
})

server.get("/mysql/get", (req, res, next) => {
  con.query("SELECT * FROM logger_report", (err, result, fields) => {
    if (err) throw err;
    // console.log(result);
    res.send(result);
  });
});


server.post('/a',(req,res,next)=>{
  let obj=req.body
  console.log(obj)
    let query = `SELECT * FROM logger_report WHERE ${Object.keys(obj).map((key)=> `${key} = '${obj[key]}'`).join(' AND ')};`
    console.log(query)
  con.query(query,(err, result, fields) => {
    if (err) throw err;
    // console.log(result);
    res.send(result);
  });
  // res.send('jhgvsjldf')
})

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
  



