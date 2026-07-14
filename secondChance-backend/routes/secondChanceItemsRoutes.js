const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


router.get('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);
    } catch (e) {
        next(e);
    }
});





router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        let secondChanceItem = req.body;

        
        const lastItemQuery = await collection.find().sort({ 'id': -1 }).limit(1);
        await lastItemQuery.forEach(item => {
            secondChanceItem.id = (parseInt(item.id) + 1).toString();
        });

        
        const date_added = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.date_added = date_added;

        
        const result = await collection.insertOne(secondChanceItem);

        res.status(201).json(result.ops ? result.ops[0] : secondChanceItem);
    } catch (e) {
        next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        // Task 1: Retrieve the database connection from db.js and store it in db
        const db = await connectToDatabase();

        // Task 2: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");

        // Task 3: Check if the secondChanceItem exists and send an appropriate message if it doesn't exist
        const secondChanceItem = await collection.findOne({ id });

        if (!secondChanceItem) {
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // Task 4: Update the item's specific attributes
        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days / 365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        const updatepreloveItem = await collection.findOneAndUpdate(
            { id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );

        // Task 5: Send confirmation
        if (updatepreloveItem) {
            res.json({ "uploaded": "success" });
        } else {
            res.json({ "uploaded": "failed" });
        }
    } catch (e) {
        next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        // Task 1: Retrieve the database connection from db.js and store it in db
        const db = await connectToDatabase();

        // Task 2: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");

        // Task 3: Find a specific secondChanceItem by ID and check if it exists
        const secondChanceItem = await collection.findOne({ id });

        if (!secondChanceItem) {
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // Task 4: Delete the object and send an appropriate message
        await collection.deleteOne({ id });
        res.json({ "deleted": "success" });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
