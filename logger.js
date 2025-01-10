const bulkData= require('./a')
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



async function bulkinsert(){
//   let bulkData = []; 
//   for (let i = 0; i < 2; i++) { 
//       var datetime= Date.now()
//       var calltype= faker.helpers.arrayElement(['diposed', 'missed', 'autoFail', 'autoDrop'])
//       var disposeName='';
//       var disposeType;

//       if(calltype=='missed'){
//         disposeName='agent not found'
//         disposeType=''
//       }else if(calltype == "autoFail" || calltype == "autoDrop"){
//         disposeName= faker.helpers.arrayElement(["busy","decline","does not exist","not acceptable",]);
//       }else{
//         disposeName=faker.helpers.arrayElement(['follow up', 'do not call', 'external transfer']);
//         if(disposeName=='follow up'){
//             disposeType='callback'
//         }else if(disposeName=='do not call'){
//             disposeType='dnc'
//         }else{
//             disposeType='etx'
//         }
//       }
//     //   console.log(calltype)
//     //   console.log(disposeName)
//     //   console.log(disposeType)

//       var agents=faker.helpers.arrayElement(['pradeep','panda', 'atul', 'sahil', 'rohit', 'akash', 'anupam', 'ajay', 'ayush',])
//       var campaign=faker.helpers.arrayElement(['Insuarance', 'sales', 'marketing', 'finance'])
//       var process= faker.helpers.arrayElement(['process1', 'process2', 'process3', 'process4', 'process5'])
//       var leadid= Math.floor(Math.random() * 10)+1;
//       var referenceuuid= faker.string.uuid();
//       var customeruuid= faker.string.uuid();



//       var ringing = Math.floor(Math.random() * 5)+1;
//       var transfer = Math.floor(Math.random() * 4)+1;
//       var call = Math.floor(Math.random() * 30)+1;
//     //   const states = 
//         var mute = Math.floor(Math.random() * 10)+1;
//         var conference = Math.floor(Math.random() * 20)+1;
//         var hold = Math.floor(Math.random() * 10)+1;
//       var disposetime=Math.floor(Math.random() * 10)+1;
//       var duration = ringing+transfer+call+mute+conference+hold;
//     bulkData.push([datetime,calltype, disposeType, disposeName, duration, agents, campaign, process, leadid, referenceuuid, customeruuid, hold, mute, ringing, transfer, conference, call, disposetime]);
//   }
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
// bulkinsert();












server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
  



