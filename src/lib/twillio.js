require('dotenv').config();
const twilio = require('twilio');
const client = new twilio(process.env.TWILIOSID, process.env.TWILIOTOKEN)

// const message = async (body, to) => {
//     try{
//         const sid = await client.messages.create({body, to, from : process.env.TWILIONUMBER });
//         return sid;
//     }catch(err){
//         throw err;
//     }
// }

const message = async (to, from, body) => {
    try {
        const sid = await client.messages.create({body, to, from})
        return sid
    } catch(err) {
        console.log(err)
    }
}

module.exports = { message }