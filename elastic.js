const restify = require("restify");
require("dotenv").config();
const server = restify.createServer();
const port = parseInt(process.env.PORT);
server.use(restify.plugins.bodyParser());
const { faker } = require("@faker-js/faker");

const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: process.env.ELASTIC_URL });

server.post("/elastic/create", async (req, res) => {
  let result = await client.index({
    index: "user1",
    body: req.body,
  });
  res.send(result);
});

server.get("/elastic/report", async (req, res) => {
  let result = await client.search({
    index: "laksh",
    body: {
      size: 0,
      aggs: {
        group_by_hour: {
          date_histogram: {
            field: "date_time",
            calendar_interval: "hour",
          },
          aggs: {
            total_duration: {
              sum: {
                field: "duration",
              },
            },
            total_hold: {
              sum: {
                field: "hold",
              },
            },
            total_mute: {
              sum: {
                field: "mute",
              },
            },
            total_ringing: {
              sum: {
                field: "ringing",
              },
            },
            total_transfer: {
              sum: {
                field: "transfer",
              },
            },
            total_conference: {
              sum: {
                field: "conference",
              },
            },
            unique_calls: {
              value_count: {
                field: "reference_uuid.keyword",
              },
            },
          },
        },
      },
    },
  });
  console.log(result.aggregations);
  let temp = result.aggregations.group_by_hour.buckets;
  let data = [];
  temp.forEach((item, index) => {
    data.push({
      hour: new Date(item.key_as_string).getHours(),
      unique_calls: item.unique_calls.value,
      total_duration: item.total_duration.value,
      total_hold: item.total_hold.value,
      total_mute: item.total_mute.value,
      total_ringing: item.total_ringing.value,
      total_transfer: item.total_transfer.value,
      total_conference: item.total_conference.value,
    });
  });
  console.log(data);
  res.send(data);
});

server.get("/elastic/get", async (req, res) => {
  let result = await client.search({
    index: "laksh",
    body: {
      query: {
        match_all: {},
      },
      size: 10000,
    },
  });
  console.log(result.hits.hits);
  let data = result.hits.hits.map((item) => item._source);
  res.send(data);
});

server.post("/filter", async (req, res) => {
  let result = await client.search({
    index: "laksh",
    body: {
      query: {
        bool: {
          must: Object.keys(req.body).map((key) => (
            { match: { [key]: req.body[key] },}
        )),
        },
      },
      size: 10000,
    },
  });

  console.log(result.hits.hits);
  let data = result.hits.hits.map((item) => item._source);
  res.send(data);
});

server.put("/elastic/update", async (req, res) => {
  let { id, name, age, email } = req.body;
  let result = await client.update({
    index: "user1",
    id: id,
    doc: {
      name: name,
      age: age,
      email: email,
    },
  });
  res.send(result);
});

server.del("/elastic/delete/:id", async (req, res) => {
  let result = await client.delete({
    id: req.params.id,
    index: "user1",
  });
  res.send(result);
});

server.post("/elastic/disp", async (req, res) => {
  let bulkData = [];
  for (let i = 0; i < 500000; i++) {
    const gender = faker.person.sexType();
    const name = faker.person.firstName(gender);
    const email = faker.internet.email();
    const birthdate = faker.date.birthdate();
    const createdAt = Date.now();
    bulkData.push({ index: { _index: "laksh" } });
    bulkData.push({ name, email, birthdate, gender, createdAt });
  }
  try {
    const response = await client.bulk({ body: bulkData });
    res.send(response);
  } catch (err) {
    res.send(err);
  }
});

server.listen(5002, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
