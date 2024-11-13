require('dotenv').config();
const twilio = require('twilio');
const client = new twilio(process.env.TWILIOSID, process.env.TWILIOTOKEN)



const message = async (to, from, body) => {
    try {
        const sid = await client.messages.create({body, to, from})
        return sid
    } catch(err) {
        console.log(err)
    }
}

module.exports = { message }
