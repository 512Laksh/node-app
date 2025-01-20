const restify = require("restify");
require("dotenv").config();
// const bulkData= require('./util')
const {insertDB}= require('./util')
const { MongoClient } = require("mongodb");
const server = restify.createServer();
const port = parseInt(process.env.PORT);
server.use(restify.plugins.bodyParser());
const url = process.env.MONGO_URL;
const client = new MongoClient(url);
const dbName = "laksh";
const { v4: uuidv4 } = require("uuid");
const { faker } = require('@faker-js/faker');

async function main() {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(process.env.MONGO_COLLECTION);
  console.log("Connected successfully to server");
  return collection;
}
const collection = main();

async function bulkinsert(){
  const collection = await main();
  try{
    const result = await collection.insertMany(mongoData);
    console.log("data inserted")
  }catch(err){
    console.log(err);
  }
}
// setTimeout(() => {
//   bulkinsert()
// }, 3000);



// insertDB();

server.get('/mongo/report',async(req, res)=>{
  const collection = await main();
  const response= await collection.aggregate([
    {
      "$group": {
        "_id": {
          "hour": { "$hour": "$date_time" },
          // "type": "$type",
          // "campaign_name": "$campaign_name",
          // "process_name": "$process_name"
        },
        "call_count": { "$sum": 1 },
        "total_duration": { "$sum": "$duration" },
        "total_hold": { "$sum": "$hold" },
        "total_mute": { "$sum": "$mute" },
        "total_ringing": { "$sum": "$ringing" },
        "total_transfer": { "$sum": "$transfer" },
        "total_conference": { "$sum": "$conference" },
        "unique_calls": { "$addToSet": "$reference_uuid" }
      }
    },
    {
      "$project": {
        "hour": "$_id.hour",
        // "type": "$_id.type",
        // "campaign_name": "$_id.campaign_name",
        // "process_name": "$_id.process_name",
        "call_count": 1,
        "total_duration": 1,
        "total_hold": 1,
        "total_mute": 1,
        "total_ringing": 1,
        "total_transfer": 1,
        "total_conference": 1,
        "unique_calls": { "$size": "$unique_calls" }
      }
    },
    {
      "$sort": { 
        "hour": 1
      }
    }
  ]).toArray()
  res.send(response)
})

server.get("/mongo/get", async (req, res) => {
  const collection = await main();
  try {
    const result = await collection.find().toArray();
    res.send(result);
    console.log(result)
  } catch (err) {
    console.log(err);
  }
});


server.post('/filter',async(req,res)=>{
  const collection= await main();
  let condition=req.body;
  let result= await collection.find(condition).toArray();
  res.send(result);
})

server.listen(5001, () => {
  console.log(`Server running on http://localhost:${port}/`);
});