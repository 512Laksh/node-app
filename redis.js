const restify = require("restify");
require("dotenv").config();
const server = restify.createServer();
const port = parseInt(process.env.PORT);
server.use(restify.plugins.bodyParser());

const redis = require("ioredis");
const client = redis.createClient({
  url: process.env.REDIS_URL,
});

server.post("/redis/create", async (req, res) => {
  let result = await client.hset(req.body.name, req.body);
  console.log(result);
  res.send("data added succesfully");
});

server.get("/redis/get/:key", async (req, res) => {
  let result = await client.hgetall(req.params.key);
  console.log(result);
  res.send(result);
});

server.del("/redis/delete/:key", async (req, res) => {
  let result = await client.del(req.params.key);
  console.log(result);
  res.send("data deleted succesfully with key: " + req.params.key);
});

client.on("connect", function () {
  console.log("Connection Successful!!");
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
