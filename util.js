const { faker } = require('@faker-js/faker');
require("dotenv").config();
//ELASTIC
const { Client } = require("@elastic/elasticsearch");
const eclient = new Client({ node: process.env.ELASTIC_URL });
//MOGO
const { MongoClient } = require("mongodb");
const url = process.env.MONGO_URL;
const client = new MongoClient(url);
const dbName = "laksh";
async function main() {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(process.env.MONGO_COLLECTION);
  console.log("Connected successfully to server");
  return collection;
}
const collection = main();


//SQL
const mysql = require("mysql");
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

// //ELASTIC
// const { Client } = require("@elastic/elasticsearch");
// const eclient = new Client({ node: process.env.ELASTIC_URL });


let bulkData = []; 
let mongoData=[]
let elasticData=[]
function getRandomTimeOfDay() {
  const startOfDay = new Date();
  startOfDay.setHours(9, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(18, 0, 0, 0);
  const randomTimestamp = new Date(startOfDay.getTime() + Math.random() * (endOfDay.getTime() - startOfDay.getTime()));
  return randomTimestamp;
}

async function bulkinsert(){
    for (let i = 0; i < 100000; i++) { 
        let id= faker.string.uuid()
        var date_time= getRandomTimeOfDay()
        let type = faker.helpers.arrayElement(['disposed', 'missed', 'autoFail', 'autoDrop']);
        // console.log(calltype)
        let dispose_name;

        let dispose_type='';
            
        if (type == 'missed') {
          dispose_name = 'agent not found';
        } else if (type == "autoFail" || type == "autoDrop") {
          dispose_name = faker.helpers.arrayElement(["busy", "decline", "does not exist", "not acceptable"]);
        } else {
          dispose_name = faker.helpers.arrayElement(['follow up', 'do not call', 'external transfer']);
          if (dispose_name == 'follow up') {
            dispose_type = 'callback';
          } else if (dispose_name == 'do not call') {
            dispose_type = 'dnc';
          } else {
            dispose_type = 'etx';
          }
        }
        
        var agent_name=faker.helpers.arrayElement(['pradeep','panda', 'atul', 'sahil', 'rohit', 'akash', 'anupam', 'ajay', 'ayush',])
        var campaign_name=faker.helpers.arrayElement(['Insuarance', 'sales', 'marketing', 'finance'])
        var process_name= faker.helpers.arrayElement(['process1', 'process2', 'process3', 'process4', 'process5'])
        var leadset= Math.floor(Math.random() * 10)+1;
        var reference_uuid= faker.string.uuid();
        var customer_uuid= faker.string.uuid();
        let duration= 0;
        let ringing = 0;
        let transfer = 0;
        let call_time = 0;
        let mute = 0;
        let conference = 0;
        let hold = 0;
        let dispose_time=0;
        
        if (type == 'missed' || type == 'autoFail' || type == 'autoDrop' ) {
          ringing = faker.number.int({ min: 1, max: 10 });
          duration = ringing+transfer+call_time+mute+conference+hold+dispose_time;
        } else if (type == 'disposed') {
          const variables = ['transfer', 'mute', 'conference', 'hold'];
          const selectedVariables = faker.helpers.arrayElements(variables, { min: 2, max: 3 });
          ringing = faker.number.int({ min: 1, max: 10 });
          selectedVariables.forEach(variable => {
            dispose_time=Math.floor(Math.random() * 10)+1;
            call_time = faker.number.int({ min: 1, max: 300 });
            switch (variable) {
              case 'transfer':
                transfer = faker.number.int({ min: 50, max: 300 });
                break;
                case 'mute':
                  mute = faker.number.int({ min: 50, max: 300 });
                  break;
                  case 'conference':
                    conference = faker.number.int({ min: 50, max: 300 });
                    break;
                    case 'hold':
                      hold = faker.number.int({ min: 50, max: 300 });
                      break;
                    }
          });
            duration = ringing+transfer+call_time+mute+conference+hold+dispose_time;
    }
    bulkData.push([date_time,type, dispose_type, dispose_name, duration, agent_name, campaign_name, process_name, leadset, reference_uuid, customer_uuid, hold, mute, ringing, transfer, conference, call_time, dispose_time]);
    mongoData.push({
      id:id, 
      date_time:date_time, 
      type:type, 
      dispose_type:dispose_type,
      dispose_name:dispose_name,
      duration:duration,
      agent_name:agent_name,
      campaign_name: campaign_name,
      process_name: process_name,
      leadset: leadset,
      reference_uuid: reference_uuid,
      customer_uuid: customer_uuid,
      hold: hold,
      mute: mute,
      ringing: ringing,
      trasnfer: transfer,
      conference: conference,
      call_time: call_time,
      dispose_time: dispose_time
    })
    elasticData.push({ index: { _index:'laksh'} })
    elasticData.push({date_time,type, dispose_type, dispose_name, duration, agent_name, campaign_name, process_name, leadset, reference_uuid, customer_uuid, hold, mute, ringing, transfer, conference, call_time, dispose_time})
}
}

bulkinsert()
// console.log(bulkData)
async function insertDB(){
  const collection = await main();
    try{
      const result = await collection.insertMany(mongoData);
      console.log("data inserted to mongoDB")
    }catch(err){
      console.log(err);
    }
  
    try{
      let sql=`INSERT INTO logger_report (date_time, type, dispose_type, dispose_name, duration, agent_name, campaign_name, process_name, leadset, reference_uuid, customer_uuid, hold, mute, ringing, transfer, conference, call_time, dispose_time) VALUES ? `;
      const response = await con.query(sql, [bulkData]);
      console.log("data inserted Mysql") 
    }catch(err){
      console.log(err);
    } 

    try{
      const response = await eclient.bulk({ 
        index: 'laksh' ,
        body: elasticData });
      console.log("data inserted Elastic") 
     }catch(err){
      console.log(err)
     }

    //  console.log("abcd");
}
// console.log(elasticData)
module.exports={insertDB};
// module.exports=bulkData;
// module.exports=mongoData;