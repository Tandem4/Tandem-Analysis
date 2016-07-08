# Tandem News
##### News In Perspective

#### Version 1.0.1

### Overview

  Tandem-Analysis Repo contains Sentiment, Trends and Ranking
  Microservices for the Tandem News Project.

## Getting Started

#### 1. Clone the latest version

  Start by cloning the latest version of Tandem-Views on your local machine by running:

  ```sh
  $ git clone https://github.com/Tandem4/Tandem-Analysis
  $ cd Tandem-Analysis
  ```

#### 2. Install Dependencies

  From within the root directory run the following command to install all dependencies:

  ```sh
  $ npm install
  ```

#### 3. Set Up Environment Variables

  ```
  // API keys for Watson analysis services
  process.env.TANDEM_API_KEY
  process.env.TANDEM_ALCHEMY_KEY

  // Query urls for Watson analyis services
  process.env.WATSON_SENTIMENT_URL
  process.env.WATSON_EMOTION_URL
  process.env.WATSON_ENTITY_URL
  process.env.WATSON_CONCEPT_URL

  // Mongo connection url
  process.env.TANDEM_MONGO_HOST

  // Required by dependency 'tandem-db'
  // MySQL connection url and password
  process.env.TANDEM_DB_HOST
  process.env.TANDEM_DB_PW
  ```

#### 4. Getting started

  To run the service pipeline, simply execute:

  ```sh
  $ npm start
  ```

## Screenshots

  ![Site Architecture](https://cloud.githubusercontent.com/assets/10008938/15844915/2478c052-2c23-11e6-8069-5ed2edce3c05.png)

## Site Architecture

  ![Site Architecture](https://i.imgsafe.org/e0297453a4.png)

## Schema Diagram

  ![Site Architecture](https://raw.githubusercontent.com/Tandem4/Tandem-Analysis/master/images/DB_schema.png)

## Folder Guide

```
  |- data/
  |   |- dummyData.js
  |   |- dummyData2.js
  |- services/
  |   |- rankingService.js
  |   |- sentimentService.js
  |   |- trendsService.js
  |- test/
  |   |- test.js
  |- workers/
  |   |- mongoFetch.js
  |- .gitignore
  |- .travis.yml
  |- LICENSE
  |- README.md
  |- index.js
  |- package.json

```

## Tandem Team

  - Product Owner      :  Asifuzzaman Ahmed
  - Scrum Master       :  Nicole Skoglund
  - Development Team   :  Asifuzzaman Ahmed, Nicole Skoglund
                          Brett Lensvelt, Kani Munidasa

# Contributing

See CONTRIBUTING.md for contribution guidelines.
