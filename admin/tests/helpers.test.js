jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock = require("node-fetch");
const investmentsData = require("./MockData/investments.json");
const companiesData = require("./MockData/companies.json");
const config = require("config");
const { makeCSV, fetchInvestmentData } = require("../src/helpers");

const expectedCSVString = `1,Billy,Bob,2020-01-01,The Small Investment Company,1400
2,Sheila,Aussie,2020-01-01,The Big Investment Company,10000
2,Sheila,Aussie,2020-01-01,The Small Investment Company,10000\n`;

describe("CSV Helpers test suite", () => {
    it("makeCSV gives expected output given known input", () => {
        let csv = makeCSV(investmentsData, companiesData);
        expect(expect.stringMatching(csv)).toEqual(expect.stringMatching(expectedCSVString));
    });

    it("fetchInvestmentData gives expected csv given mock APIs", async () => {
        fetchMock.mock(
            `${config.investmentsServiceUrl}/investments`,
            investmentsData
          );
          fetchMock.mock(
            `${config.financialCompaniesServiceUrl}/companies`,
            companiesData
          );

          fetchInvestmentData().then(csv => {
            expect(expect.stringMatching(csv)).toEqual(expect.stringMatching(expectedCSVString));
          });
    })


});