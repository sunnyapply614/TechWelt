const { teltonikaSchema } = require("../models");


  const createTeltonika = async (req, res) => {
    
    try {
      const { deviceImei, lat, lng, movement, speed, fuel, battery, signal, address, transferDate } = req.body

      await data.save(function (err, savedDocument) {
        if (err) {
          console.error("save error:", err);
        }else{
          res.status(200).json({ message:'teltonika data added' })
        }
      });      
    } catch (err) {
      console.log(err)
      res.status(401).json({ message: "Something went wrong", err })
    }
  }
  return { createTeltonika }
};
