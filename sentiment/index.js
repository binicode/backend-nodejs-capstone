/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');

// Task 1: Import the Natural library
const natural = require("natural");

// Task 2: Initialize the Express server
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Task 3: Create a POST /sentiment endpoint
app.post('/sentiment', async (req, res) => {

    // Task 4: Extract the sentence parameter from the request query parameters
    const { sentence } = req.query;

    if (!sentence) {
        pinoLogger.error('No sentence provided in the query parameters');
        return res.status(400).json({ error: 'No sentence provided' });
    }

    try {
        // Initialize the Sentiment Analyzer from Natural
        const Analyzer = natural.SentimentAnalyzer;
        const stemmer = natural.PorterStemmer;
        const analyzer = new Analyzer("English", stemmer, "afinn");

        // Tokenize the input sentence into words
        const tokenizer = new natural.WordTokenizer();
        const words = tokenizer.tokenize(sentence);

        // Analyze sentiment score
        const analysisResult = analyzer.getSentiment(words);

        // Task 5: Process the response from Natural by adding a sentiment label
        let sentiment = 'neutral'; // Default value

        if (analysisResult < 0) {
            sentiment = 'negative';
        } else if (analysisResult >= 0 && analysisResult <= 0.33) {
            sentiment = 'neutral';
        } else {
            sentiment = 'positive';
        }

        // Task 6: Implement success return state
        res.status(200).json({ sentimentScore: analysisResult, sentiment: sentiment });

    } catch (error) {
        pinoLogger.error(`Error performing sentiment analysis: ${error.message}`);
        
        // Task 7: Implement error return state
        res.status(500).json({ message: 'Error performing sentiment analysis' });
    }
});

app.listen(port, () => {
    pinoLogger.info(`Server running on port ${port}`);
});
