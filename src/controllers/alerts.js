const { vehicleSchema, teltonikaSchema, userSchema, ruptelaSchema, alertSchema } = require("../models");
require('dotenv').config();

module.exports = () => {
  const showAlertList = async (req, res) => {
    try {

      if (!admin) {
        res.status(401).send('token error!');
        return;
      }

      let vehicles = [];
      if (admin.role === "Admin" || admin.role === "Manager") {
        vehicles = await vehicleSchema.find({});
      } else {
        vehicles = await vehicleSchema.find({ addClient: admin.lname });
      }

      let alerts = [];
      if (admin.role === "Admin" || admin.role === "Manager") {
        alerts = await alertSchema.find({ userId });
      } else {
        alerts = await alertSchema.find({ userId, vehicle: { $in: vehicles.map(v => v._id) } });
      }

      // Apply filters

      if (alertType) {
        alerts = alerts.filter(alert => alert.alert === alertType);
      }
      if (plateNo) {
        alerts = alerts.filter(alert => vehicles.find(v => v._id === alert.vehicle).vehicleNo === plateNo);
      }

      let response = [];
      for (const vehicle of vehicles) {
        const filteredAlerts = alerts.filter(alert => alert.vehicle === vehicle._id);
        if(filteredAlerts.length > 0) {
          response.push({
            vehicleNo: vehicle.vehicleNo,
            alerts: filteredAlerts.map(alert => ({
              alertType: alert.alert, // Assuming 'alert' field holds the alert type
              time: alert.time
            }))
          });
        }
      }

      res.status(200).send(response);
    } catch (err) {
      console.log(err);
      res.status(401).send({ message: "Something went wrong" });
    }
  };
  return {
    showAlertList
  };
};
