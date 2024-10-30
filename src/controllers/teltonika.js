const { teltonikaSchema } = require("../models");

module.exports = () => {
      let data = new teltonikaSchema({
        deviceImei: deviceImei,
        lat: lat,
        lng: lng,
        transferDate: transferDate,
        movement: movement,
        speed: speed,
        fuel: fuel,
        battery: battery,
        signal: signal,
        address: address
      });

  const createTeltonika = async (req, res) => {
    try {
      const { deviceImei, lat, lng, movement, speed, fuel, battery, signal, address, transferDate } = req.body
      await data.save(function (err, savedDocument) {

      });      
    } catch (err) {
      console.log(err)
      res.status(401).json({ message: "Something went wrong", err })
    }
  }
  return { createTeltonika }
};
