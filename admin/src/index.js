const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
// Not happy with this workaround but the alternative is to completely re-write with ES6 imports
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

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

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err);
    process.exit(1);
  }
  console.log(`Server running on port ${config.port}`);
});
