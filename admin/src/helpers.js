const R = require("ramda")
const config = require("config")
const fetch = require("node-fetch")

// Argument names containing type would be unecessary in TypeScript
// I could have put each row straight into the string but think the array provides a better debugging opportunity
const makeCSV = (investmentsArr, financialCompaniesArr) => {
  const csvArr = []
  investmentsArr.forEach(investment => {
    investment.holdings.forEach(holding => {
      const holdingCompany = R.find(R.propEq("id", holding.id))(financialCompaniesArr)
      csvArr.push([
        investment.userId,
        investment.firstName,
        investment.lastName,
        investment.date,
        holdingCompany.name,
        investment.investmentTotal * holding.investmentPercentage,
      ])
    })
  })

  let csvText = ""
  csvArr.forEach(row => {
    csvText += `${row.toString()}\n`
  })
  return csvText
}

const fetchInvestmentData = async () => {
  // This feels like an anti-pattern, I would appreciate feedback and an alternative solution
  const investments = await (await fetch(`${config.investmentsServiceUrl}/investments`)).json()
  const financialCompanies = await (await fetch(`${config.financialCompaniesServiceUrl}/companies`)).json()

  await Promise.all([investments, financialCompanies])
  return makeCSV(investments, financialCompanies)
}

module.exports.fetchInvestmentData = fetchInvestmentData
module.exports.makeCSV = makeCSV
