const mongoose = require("mongoose");

const ConnectDatabase = async (mongoUrl) => {
    try {
        const connectOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };
        await mongoose.connect(mongoUrl, connectOptions)
            .then(async () => {
                console.log(`MongoDB connected (` + mongoUrl + `)`);    
            })

    } catch (err) {
        console.log(err);
        ConnectDatabase(mongoUrl);
    }
};

module.exports = ConnectDatabase;
