const restify = require("restify");
require("dotenv").config();
const bulkData= require('./a')
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
    const result = await collection.insertMany(bulkData);
    console.log("data inserted")
  }catch(err){
    console.log(err);
  }
}
setTimeout(() => {
  bulkinsert()
}, 3000);












server.listen(port, function () {
  console.log("%s listening at %s", server.name, server.url);
});