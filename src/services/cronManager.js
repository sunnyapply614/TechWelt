

module.exports = () => {
    const deviceStatusUpdateJob = cron.schedule('*/3 * * * *', async () => {
        console.log("======================cron job========================")
        await updateSatus();
    }, { scheduled: false }).start();

    jobMap.set('deviceStatusUpdateJob', deviceStatusUpdateJob);
};
