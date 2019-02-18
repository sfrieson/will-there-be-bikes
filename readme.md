# Will there be bikes?

## Goal

It is my goal to be able to predict the availability of a Citi Bike at a given station at a given time in the next few days.


## Design

The application will consist of three or four different applications.

1. Data Harvester
1. Forecast Trainer
1. Application Server (optionally broken into web server and API server)

### Data Harvester

The Data Harvester collects data from Citi Bike as well as Open Weather Map. The Citi Bike station status information which includes how many bikes are available at each station, is collected every 10 seconds as hinted by the TTL in the response object. Weather information is requested every second as limited by the free tier of the API. The locations requested for weather readings is provided by the Citi Bike station information endpoint which provides geocoordinates. Each call requests weather for a different station until the list is exhausted, at which time, a new list is requested, in the chance that the list has changed since the last fetch.

The data is written to Amazon S3 to be consumed by the Forecast Trainer.

### Forecast Trainer

The Forecast Trainer has a one off script that retreives the data from the S3 bucket to do a data preparation step and resaves it in the desired format.

Of course, the Data Trainer also has the PyTorch model trainer that trains the model on the data available to it. When it is done the model is able to be exported for use in the Application Server.

### Application Server

The Application server has the single page app for the front end and the API on the backend. The main API request of interest is the forecast call which accepts the station the user is interested in along with the time and day they'd like a bike. The forecaster requests weather information for this time to make an inference using the PyTorch model.