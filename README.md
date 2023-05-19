![SSS Logo](img/dont-panic.avif)
Rand Al'Thor (Wheel of Time)

# Server Side Slinger

![SSS Architecture](img/architecture.png)

Introducing Server Side Slinger: Empowering Effortless Web Scraping and Dynamic Content Presentation on DashMobile

Server Side Slinger is a cutting-edge service that revolutionizes web scraping and dynamic content display. With its robust capabilities, users can effortlessly extract valuable information from a multitude of web pages and present it seamlessly on DashMobile.

Driven by a personal need to stay informed about local music events while minimizing manual effort, I meticulously designed this service to cater to individuals like myself who crave convenience. Now, you can effortlessly stay up to date with your favorite local sites, ensuring that no local show slips through the cracks!

One of the remarkable features of Server Side Slinger lies in its unparalleled optimization for asynchronous execution. Through meticulous fine-tuning, I achieved an impressive 10x boost in performance since starting the, ensuring lightning-fast results and exceptional user experience.

Server Side Slinger is not merely a tool; it is an impressive testament to innovation and efficiency in the realm of web scraping. Embrace its power and elevate your web scraping endeavors to new heights.

[Backend](https://github.com/jessekoconnor/server-side-slinger): AWS lambda functions, API gateway, Dynamo database
[Frontend](https://github.com/jessekoconnor/WebSurfer): App store, Reach native, Expo
    * [App store link](https://testflight.apple.com/join/br5KTP6i)

## Most interesting problems solved

### Fitting a Browser Binary into a Lambda Function: A Cosmic Conundrum

Imagine the perplexing challenge of running webpages within the confined universe of a lambda function. Mere URL requests fell short as these pages possessed intricate JavaScript intricacies, summoning additional requests and revealing captivating content like local business showtimes and live event updates. Alas, the function size limit threatened to overshadow our cosmic aspirations.

Yet fear not! With a stroke of cosmic ingenuity, I discovered a stripped-down version of Chromium that snugly fit within the Lambdas. Leveraging Puppeteer, my trusty guide, I summoned headless browsers from the depths of AWS Lambda, enabling an extraordinary convergence of web page wonder within our cosmic boundaries.

### Parsing Dates from Strings: A Journey through the Galactic Time Vortex

Ah, the enigmatic realm of date formatting, where an infinite variety of website configurations awaited deciphering. Overcoming this challenge required a combination of resilience and systematic exploration, much like an intrepid hitchhiker seeking to unravel the mysteries of the universe.

To navigate this celestial labyrinth, I adopted an approach of failing early and logging each mischievous date that defied comprehension. Armed with comprehensive unit tests, I transformed these observed failures into guiding stars, illuminating new paths to success.

Embracing the diversity of strategies, I ventured forth, applying distinct methods to individual strings and stacking them together like cosmic building blocks. At the heart of this celestial dance, native dates guided me toward the goldilocks zone, leading me to a workable format: "{day} {month} {year} {timezone}". With this harmonious blend of cosmic codes, I unlocked the secrets of parsing and harnessed the power of temporal understanding.

### Recursively Querying Web Page Elements: A Cosmic Configuration Conquest

As I delved deeper into the cosmic depths of web page analysis, a perplexing puzzle awaited—a web of configurations yearning to be comprehended. How does one traverse the celestial realms of lists and calendars, connecting sub-elements to their cosmic parents with grace and precision?

Like a cosmic voyager armed with recursive prowess, I embarked on a journey of discovery, empowering my algorithms to support any configuration of web page queries. With each iteration, I honed my skills, transcending the boundaries of the known universe and embracing the vast possibilities that cosmic configurations presented.

This achievement stands as a testament to my dedication and growth as a programmer, empowering me to navigate the intricacies of web page elements with cosmic finesse.

Within these remarkable experiences, I aim to convey both the spirit of your own unique voice and a sprinkle of Douglas Adams' cosmic charm. Like Arthur Dent, charting a course through the galaxy with a sense of wonder and a determined spirit, I have ventured into the realm of problem-solving, embracing the extraordinary possibilities that await in every cosmic challenge.

## Example usage of the service

### Simple example:

This scrapes a website that has a list of live events in my city. It is scraping a page that is essentially a list of live performances.

```javascript
let core = new Widget({
    key = 'pressRoom',
    title = 'Press Room',
    subtitle = 'NYC',
    config: {
        url: 'https://pressroomnh.com/live-music-portsmouth-nh-events/',
        query: {
            val: 'div.wpb_wrapper > div.wpb_row',
            query: [
                // Contains title
                'h2',
                // Date
                'h6',
            ],
        },
        postProcessing: event => {
            if(!event[0] || !event[1]) return;
            // Format service takes title, date
            return FormatService.formatEvent(event[0], event[1])
        },
    },
}).run();
```

`config`: This is the main config here. It uses recursion until its at the leaf element and then it grabs innerHTLM or attributes. 

`postProcessing`: This function is called for each scraped leaf node.

Its a service that allow the usage of jquery selectors to automate scraping in an extremely precise way.

Its true that websites change, so these configs break. Luckily it doesnt happen too often that a local business gets a website revamp, and also luckily its easy to fix a config!

It will end up returning a response like so:

```json
{
    "header": {
        "title": "Press Room",
        "subTitle": "Portsmouth",
        "imageFile": "https://s3.amazonaws.com/server-side-slinger-public/img/avatar/pressRoom.png",
        "avatar32x32url": "https://s3.amazonaws.com/server-side-slinger-public/img/favicon/pressRoom.png"
    },
    "events": [
        {
            "startDate": "2023-05-19T00:00:00.000Z",
            "title": "ALEXIA BOMTEMPO",
            "humanReadable": {
                "start": "Thursday, May 18, 2023, 8:00 PM EDT"
            }
        },
        ...
        {
            "startDate": "2023-05-20T01:30:00.000Z",
            "title": "KING KYOTE",
            "humanReadable": {
                "start": "Friday, May 19, 2023, 9:30 PM EDT"
            }
        },
    ],
    "eventCount": 58,
    "timeTaken": 5663
}
```

### Complex Example

This one is more complex because its actaully scraping a calendar style web page.

```javascript
new Widget(
    {
        key,
        title,
        subtitle,
        config: {
            url: 'https://www.themusichall.org/calendar/?exclude=&month={{year}}-{{month}}',
            pages: 2,
            nextPage: ({ month }) => ({ month: month + 1 }),
            query: {
                val: 'div.day--has-events',
                query: [
                    // month
                    'span.day__month',
                    // day
                    'span.day__number',
                    {
                        val: 'li.xdgp_genre-music',
                        query: [
                            // title
                            'p.event__title',
                            // time
                            'section.action__time'
                        ]
                    },
                ],
            },
            postProcessing: event => {
                const [ month, day, title, _time ] = event;
                if (!month || !day || !title || !_time) return;

                return FormatService.formatEvent(title, `${month} ${day} ${time}`);
            },
        },
    }
);
```

`url: 'https://www.themusichall.org/calendar/?exclude=&month={{year}}-{{month}}`: This indicates to the scraper to replace `month` and `year` w/ current mo/yr

`pages: 2,`: this indicates that the lambda can parse two pages to process in parallel (after the browser is started of course)

`nextPage: ({ month }) => ({ month: month + 1 })`: Tells the scraper how to generate the next page's url

Notice how in this example there are 3 levels to the config object, and this 3 levels of recursion. This pattern supports heavy recursion with minimal risk of a stack overflow due to how the variables are stored in memory versus as function args on the call stack. Check out the recursive function [here: getSelection](src/services/ScraperSSR.js#getSelection)

A response will look like this:

```json
{
    "header": {
        "title": "The Music Hall",
        "subTitle": "Portsmouth",
        "imageFile": "https://s3.amazonaws.com/server-side-slinger-public/img/avatar/TheMusicHall.png",
        "avatar32x32url": "https://s3.amazonaws.com/server-side-slinger-public/img/favicon/TheMusicHall.png"
    },
    "events": [
        {
            "startDate": "2023-05-04T23:30:00.000Z",
            "title": "Martyn Joseph",
            "humanReadable": {
                "start": "Thursday, May 4, 2023, 7:30 PM EDT"
            }
        },
        ...
        {
            "startDate": "2023-05-07T00:00:00.000Z",
            "title": "Peter Cincotti",
            "humanReadable": {
                "start": "Saturday, May 6, 2023, 8:00 PM EDT"
            }
        }
    ],
    "eventCount": 21,
    "timeTaken": 9071
}
```

## File structure

File structure is described below:

```bash
.
├── README.md                   <-- This file
├── .travis.yml                 <-- Travis job: runs tests && deploys to lambda (master)
├── .package.json               <-- Contains all ci scripts
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
Prerequisites: Install aws cli and sam cli

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
