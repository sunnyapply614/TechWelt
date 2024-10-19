const cron = require('node-cron');
const vehicles = require('../controllers/vehicles');
const { updateSatus } = vehicles();
const jobMap = new Map();


