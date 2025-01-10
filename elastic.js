const restify = require("restify");
require("dotenv").config();
const server = restify.createServer();
const port = parseInt(process.env.PORT);
server.use(restify.plugins.bodyParser());
const { faker } = require('@faker-js/faker');

const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: process.env.ELASTIC_URL });

server.post("/elastic/create", async (req, res) => {
  let result = await client.index(
    {
      index: "user1",
      body: req.body,
    }
  );
  res.send(result);
});

server.get("/elastic/get", async (req, res) => {
  let result = await client.search(
    {
      index: "laksh",
      body: {
        query: {
          match_all: {},
        },
      },
    }
  );
  console.log(result.hits)
  res.send(result);
});

server.put("/elastic/update", async (req, res) => {
  let { id, name, age, email } = req.body;
  let result = await client.update(
    {
      index: "user1",
      id: id,
      doc: {
        name: name,
        age: age,
        email: email,
      },
    }
  );
  res.send(result);
});

server.del("/elastic/delete/:id", async (req, res) => {
  let result = await client.delete(
    {
      id: req.params.id,
      index: "user1",
    }
  );
  res.send(result);
});



server.post("/elastic/disp", async (req, res) => { 
let bulkData = []; 
for (let i = 0; i < 500000; i++) { 
  const gender = faker.person.sexType();
  const name = faker.person.firstName(gender); 
  const email = faker.internet.email(); 
  const birthdate = faker.date.birthdate();
  const createdAt= Date.now();
  bulkData.push({ index: { _index: 'laksh' } }); 
  bulkData.push({ name, email, birthdate, gender, createdAt}); 
}
 try{
  const response = await client.bulk({ body: bulkData });
  res.send(response); 
 }catch(err){
  res.send(err);
 }  
})





server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
