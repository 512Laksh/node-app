const restify = require("restify");
require("dotenv").config();
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

server.post("/mongo/create", async (req, res) => {
  const collection = await main();
  var myobj = {
    name: req.body.name,
    gender: req.body.gender,
    id: uuidv4(),
  };
  try {
    await collection.insertOne(myobj, function (err, res) {
      if (err) throw err;
    });
  } catch (err) {
    console.log("Error inserting document :" + err);
  }
  res.send("1 document inserted");
});

server.put("/mongo/update/:id", async (req, res) => {
  const id = req.params.id;
  const collection = await main();
  const data = req.body;
  try {
    const result = await collection.updateOne({ id }, { $set: data });
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

server.del("/mongo/delete/:id", async (req, res) => {
  const id = req.params.id;
  const collection = await main();
  try {
    const result = await collection.deleteOne({ id: id });
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

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
data={}
server.get('/mongo/report',async (req, res)=>{
  const collection = await main();
  const result1= await collection.countDocuments({})
  data.totalUsers=result1;
  const result2= await collection.aggregate([
    {
      $group: {
        _id: "$department",
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: [ { $eq: ["$status", "active"] }, 1, 0 ] } },
        inactiveUsers: { $sum: { $cond: [ { $eq: ["$status", "inactive"] }, 1, 0 ] } }
      }
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        totalUsers: 1,
        activeUsers: 1,
        inactiveUsers: 1
      }
    }
  ]).toArray()
  data.departments=result2;
  res.send(data)
  console.log(data.departments);
})





async function bulkinsert(){
  const collection = await main();
  let bulkData = []; 
  for (let i = 0; i < 500000; i++) { 
    const id = faker.string.uuid();
    const department = faker.helpers.arrayElement(['sales','collection','marketing','support','hr']);
    const name = faker.person.firstName(); 
    const email = faker.internet.email(); 
    const birthdate = faker.date.birthdate();
    const status= faker.helpers.arrayElement(['active', 'inactive']);
    const createdAt= Date.now();
    bulkData.push({id:id, name:name, email:email, birthdate:birthdate, department:department, createdAt:createdAt, status:status});
  }
  try{
    const result = await collection.insertMany(bulkData);
    console.log("data inserted")
  }catch(err){
    console.log(err);
  }
}
// setTimeout(() => {
//   bulkinsert()
// }, 3000);

server.listen(port, function () {
  console.log("%s listening at %s", server.name, server.url);
});
