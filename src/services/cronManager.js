const cron = require('node-cron');
const vehicles = require('../controllers/vehicles');
const { updateSatus } = vehicles();
const jobMap = new Map();

module.exports = () => {

    const deviceStatusUpdateJob = cron.schedule('*/3 * * * *', async () => {
        console.log("======================cron job========================")
        await updateSatus();
    }, { scheduled: false }).start();

    jobMap.set('deviceStatusUpdateJob', deviceStatusUpdateJob);
};