# Moneyhub Tech Test - Investments and Holdings

At Moneyhub we use microservices to partition and separate the concerns of the codebase. In this exercise we have given you an example `admin` service and some accompanying services to work with. In this case the admin service backs a front end admin tool allowing non-technical staff to interact with data.

A request for a new admin feature has been received

## Requirements

- An admin is able to generate a csv formatted report showing the values of all user holdings
    - The report should be sent to the `/export` route of the investments service
    - The investments service expects the report to be sent as csv text
    - The csv should contain a row for each holding matching the following headers
    |User|First Name|Last Name|Date|Holding|Value|
    - The holding should be the name of the holding account given by the financial-companies service
    - The holding value can be calculated by `investmentTotal * investmentPercentage`
- Ensure use of up to date packages and libraries (the service is known to use deprecated packages)
- Make effective use of git

We prefer:
- Functional code 
- Ramda.js (this is not a requirement but feel free to investigate)
- Unit testing

### Notes
All of you work should take place inside the `admin` microservice

For the purposes of this task we would assume there are sufficient security middleware, permissions access and PII safe protocols, you do not need to add additional security measures as part of this exercise.

You are free to use any packages that would help with this task

We're interested in how you break down the work and build your solution in a clean, reusable and testable manner rather than seeing a perfect example, try to only spend around *1-2 hours* working on it

## Deliverables
**Please make sure to update the readme with**:

- Your new routes
- How to run any additional scripts or tests you may have added
- Relating to the task please add answers to the following questions;
    1. How might you make this service more secure?
    2. How would you make this solution scale to millions of records?
    3. What else would you have liked to improve given more time?
  

On completion email a link to your repository to your contact at Moneyhub and ensure it is publicly accessible.

## Getting Started

Please clone this service and push it to your own github (or other) public repository

To develop against all the services each one will need to be started in each service run

```bash
npm start
or
npm run develop
```

The develop command will run nodemon allowing you to make changes without restarting

The services will try to use ports 8081, 8082 and 8083

Use Postman or any API tool of you choice to trigger your endpoints (this is how we will test your new route).

### Existing routes
We have provided a series of routes 

Investments - localhost:8081
- `/investments` get all investments
- `/investments/:id` get an investment record by id
- `/investments/export` expects a csv formatted text input as the body

Financial Companies - localhost:8082
- `/companies` get all companies details
- `/companies/:id` get company by id

Admin - localhost:8083
- `/investments/:id` get an investment record by id
- `/generate-report` (POST Method) creates a csv text of all users investments and POSTs it to the investments service

### Additional Scripts
Unit tests can be run from the admin directory using:
```bash
npm test
```

During development of a singular service the pm2 service can be used. pm2 runs and persists your node js app.
To install it: 
```bash
npm install pm2@latest -g
```
Then to start the dependent services:
```bash
cd investments 
pm2 start npm --name "investments-service" -- start

cd ../financial-companies
pm2 start npm --name "financial-companies-service" -- start
```

### Answers to Questions 
1. How might you make this service more secure?
    - The admin service should have some form of authentication middleware to prevent unauthorized persons from accessing its endpoints. Especially if there is a frontend UI pointing at it. Https is also a requirement for this
    - The other two services could be restricted to only allow access from the admin service providing a single point of entry. If hosted on docker or Kubernetes this can be done easily without ever exposing the investments or companies service to the outside world.
2. How would you make this solution scale to millions of records?

    There are multiple issues with the current implementation to allow scaling to millions of records. 
    - Firstly, the /generate-report endpoint waits for the csv to be generated before sending the response to the client. With millions of rows this would likely cause a request to time out. This could be solved in many different ways, such as: closing the request straight away with a 200 code and requiring the user to check back on progress through another API endpoint, or by using a websocket to provide a persistent connection with updates on progress.
    - Secondly, this could put significant load on the service while it processes the csv. It would be wise to employ load balancing and horizontal scaling to make sure other users can continue to use the service with no ill effects. 
    - Lastly, the investments service has a 10mb cap on data sent to it. Some form of streaming might need to be set up to allow the CSV to be sent to the investments service over time. An alternative to this would be to make the report smaller by offering the admin filters for things like the date range. 
3. What else would you have liked to improve given more time?
- Implement some more extensive unit tests
- Convert the project to ES6 import syntax to allow use of node-fetch v3 (v2 is still under support however)
- Make more use of the Ramda library (This is my first time using it and it won't be the last)
    - This includes replacing the nested for loops used to create the CSV  

### Additional notes
Please take my commenting style with a pinch of salt. It is not reflective of my real world usage, I wanted to use them to convey my thought process to the recruitment team around certain aspects of my code.

The way I brokedown this task should be clearly visible in the git history of this repo. If not there is a changelog with the rough order of events in the /admin directory.