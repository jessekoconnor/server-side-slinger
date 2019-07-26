# Server Side Slinger

This is a sample template for sam-app - Below is a brief explanation of what we have generated for you:

```bash
.
├── README.md                   <-- This file
├── .travis..yml                <-- Travis job: runs tests && deploys to lambda (master)
├── src                         <-- Source code for the Server Side Slinger function
│   ├── package.json            <-- Scoped to src package.json
│   └── tests                   <-- Unit tests && Integration tests
│   │   └── unit
│   │   └── integration
│   └── dashboards              <-- Dashboards are logical groupings of widgets
│   │   └── Lifestyle           <-- Yoga classes, live music, and more
│   └── widgets                 <-- Widgets are configs about how to scrape a web-page
│   │   └── Press room          <-- local portsmouth bar scraping config
│   │   └── 3 bridges yoga      <-- local portsmouth yoga studio scraping config
│   │   └── Blaze yoga          <-- local portsmouth yoga studio scraping config
│   └── services                <-- Services that handle complex logic
│   │   └── Caching service     <-- Caches widget results in DynamoDB
│   │   └── Date service        <-- Parses vague date strings
│   │   └── Format service      <-- Formats the data for delivery to the front end
│   │   └── Scraper SSR         <-- Loads up chromium and parses using [Puppeteer](https://github.com/GoogleChrome/puppeteer)
│   │   └── Widget service      <-- Returns a lambda ready widget
└── template.yaml               <-- SAM template
```

## Local dev
To run locally, just clone the repo and run the following code:
```bash
npm run start-local
```
This utilizes AWS Sam local functionality to start up the local lambda functions using docker and a lambda image

## Deployment (CI/CD)
To deploy this code, create a PR to master. Upon successful test run in travis, I will merge the PR, and the code will get deployed from travis.


The deployment configuration is held in ```template.yml``` and is deplopyed with ```sam deploy``` 

## Testing
To write a PR that passes the tests, you will need to understand how to run the tests.
There are integration tests and unit tests.

Integration tests require that this service is running locally, and it proceeds to make network requests to the running lambdas locally, verifying their results.

Unit tests should be added for all new features. These must be passing for a PR to be approved. Poor quality code will be rejected.

## Adding a widget or a dashboard
After countless refactors, it is a piece of cake to add a widget or a dashboard. Use a working widget or dashboard as an model for new entities. 

## Images
Every widget needs an image and a favicon. Add images and favicons into ```./img```. Images are deployed from travis alongside the code. 

## Running locally with Dynamo (Under Development)
Got to run a local docker container for dynamo:
```cd src && npm run local-dynamo```
Also need to create the table too:
```
aws dynamodb create-table \
--endpoint-url http://localhost:8000 \
--table-name table3 \
--attribute-definitions AttributeName=id,AttributeType=S \
--key-schema AttributeName=id,KeyType=HASH \
--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

Scan a table using the following:
```
aws dynamodb scan --endpoint-url http://localhost:8000 --table-name table
```

List the tables:
```
aws dynamodb list-tables --endpoint-url http://localhost:8000
```