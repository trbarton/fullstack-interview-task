const R = require('ramda');
const config = require("config");
// Not happy with this workaround but the alternative is to completely re-write with ES6 imports
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const fetchInvestmentData = async () => {
    // This feels like an anti-pattern, I would appreciate feedback and an alternative solution
    let investments = await (await fetch(`${config.investmentsServiceUrl}/investments`)).json();
    let financialCompanies = await (await fetch(`${config.financialCompaniesServiceUrl}/companies`)).json();
    
    await Promise.all([investments,financialCompanies]);
    return makeCSV(investments, financialCompanies);
}

// Argument names containing type would be unecessary in TypeScript
// I could have put each row straight into the string but think the array provides a better debugging opportunity
const makeCSV = (investmentsArr, financialCompaniesArr) => {
    let csvArr = [];
    investmentsArr.forEach(investment => {
        investment.holdings.forEach(holding => {
            let holdingCompany = R.find(R.propEq('id', holding.id))(financialCompaniesArr);
            csvArr.push([
                investment.userId,
                investment.firstName,
                investment.lastName,
                investment.date,
                holdingCompany.name,
                investment.investmentTotal * holding.investmentPercentage
            ]);
        });
    });
    
    let csvText = "";
    csvArr.forEach(row => {
        csvText += `${row.toString()}\n`;
    });
    return csvText;
}

module.exports.fetchInvestmentData = fetchInvestmentData;