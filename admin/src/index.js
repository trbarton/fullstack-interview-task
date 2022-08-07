const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
// Not happy with this workaround but the alternative is to completely re-write with ES6 imports
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const helpers = require("./helpers");

const app = express();

app.use(bodyParser.json({ limit: "10mb" }));

app.get("/investments/:id", (req, res) => {
  const { id } = req.params;
  fetch(`${config.investmentsServiceUrl}/investments/${id}`)
    .then((response) => response.json())
    .then((body) => {
      res.send(body);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

app.get("/generate-report", (req, res) => {
  // Fetching of data split into new module to keep index.js API endpoints readable
  helpers
    .fetchInvestmentData()
    .then((csv) => {
      // CSV is wrapped in a JSON object as investments service only parses JSON bodies
      // Modifying Investments service is out of scope of this task and in real world could be responsibility of another team
      fetch(`${config.investmentsServiceUrl}/investments/export`, {
        method: "post",
        body: JSON.stringify({ report: csv }),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          if (response.status !== 204)
            throw "/investments/export didn't return 204";
          res.sendStatus(200);
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err);
    process.exit(1);
  }
  console.log(`Server running on port ${config.port}`);
});
