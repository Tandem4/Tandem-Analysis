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

  ![Screenshots](https://raw.githubusercontent.com/NCSkoglund/Tandem-Analysis/upstream/images/tandem_screenshots.png)

## Site Architecture

  ![Site Architecture](https://raw.githubusercontent.com/NCSkoglund/Tandem-Analysis/a80f9271e9ed9ac5420a1f65d5b2864537a2e497/images/Tandem_Architecture.png)
  
## Sequence Diagram 
 
   ![Sequence Diagram](https://raw.githubusercontent.com/NCSkoglund/Tandem-Analysis/merge-harmony/images/sequence_diagram.png) 

## Schema Diagram

  ![Schema Diagram](https://raw.githubusercontent.com/Tandem4/Tandem-Analysis/master/images/DB_schema.png)

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
