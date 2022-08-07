/* eslint-disable no-undef */
jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox())
const fetchMock = require("node-fetch")
const request = require("supertest")
const {app} = require("../src/app")
const investmentsData = require("./MockData/investments.json")
const companiesData = require("./MockData/companies.json")
const config = require("config")

// Setup Mock (predicatable) responses from investments and financial-companies services

describe("Admin API test suite", () => {
  it("tests /investments/1 endpoint", async () => {
    fetchMock.mock(
      `${config.investmentsServiceUrl}/investments/1`,
      investmentsData[0],
    )
    request(app)
      .get("/investments/1")
      .then((response) => {
        expect(response.body).toEqual(investmentsData[0])
        expect(response.statusCode).toBe(200)
      })
  })

  it("tests /investments/2 endpoint when API fails", async () => {
    fetchMock.mock(`${config.investmentsServiceUrl}/investments/2`, 500)
    request(app)
      .get("/investments/2")
      .then((response) => {
        expect(response.statusCode).toBe(500)
      })
  })

  fetchMock.mock(
    `${config.investmentsServiceUrl}/investments`,
    investmentsData,
  )
  fetchMock.mock(
    `${config.financialCompaniesServiceUrl}/companies`,
    companiesData,
  )

  it("tests /generate-report endpoint returns successfully", async () => {
    fetchMock.mock(`${config.investmentsServiceUrl}/investments/export`, 204)

    request(app)
      .post("/generate-report")
      .then((response) => {
        expect(response.statusCode).toBe(200)
      })
  })

})
