const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
// Using v2 of node-fetch, given time would like to convert to ES6 imports and v3
const fetch = require("node-fetch")
const helpers = require("./helpers")

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  fetch(`${config.investmentsServiceUrl}/investments/${id}`)
    .then((response) => response.json())
    .then((body) => {
      res.send(body)
    })
    .catch((err) => {
      console.error(err)
      res.sendStatus(500)
    })
})

app.post("/generate-report", (req, res) => {
  // Fetching of data split into new module to keep index.js API endpoints readable
  helpers
    .fetchInvestmentData()
    .then((csv) => {
      // CSV is wrapped in a JSON object as investments service only parses JSON bodies
      // Modifying Investments service is out of scope of this task and in real world could be responsibility of another team
      fetch(`${config.investmentsServiceUrl}/investments/export`, {
        method: "post",
        body: JSON.stringify({report: csv}),
        headers: {"Content-Type": "application/json"},
      })
        .then((response) => {
          if (response.status !== 204)
            throw new Error("/investments/export didn't return 204")
          res.sendStatus(200)
        })
        .catch((err) => {
          console.error(err)
          res.sendStatus(500)
        })
    })
    .catch((err) => {
      console.error(err)
      res.sendStatus(500)
    })
})

module.exports.app = app
