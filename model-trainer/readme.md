# Model Trainer

This repo has a few responsibilities.
- It reads the JSON from the harvester and converts it to CSV for better ingestion by the model.
- It trains the machine learning model.
- It exports the model for use.

It was very difficult to find out how to go about doing some of this because no one seems to talk much about anything but image classification. [Francesco knows my pain](http://francescopochetti.com/pytorch-for-tabular-data-predicting-nyc-taxi-fares/). Sooner or later I found this [(premium) Medium article by Georgios Drakos](https://towardsdatascience.com/decoded-entity-embeddings-of-categorical-variables-in-neural-networks-1d2468311635).