const { vehicleSchema, teltonikaSchema, userSchema, ruptelaSchema, alertSchema } = require("../models");
require('dotenv').config();


module.exports = () => {
  const showAlertList = async (req, res) => {
    try {
      const userId = req.user.id;
      const fromDate = req.query.fromDate; // Get from date from query parameter
      const toDate = req.query.toDate; // Get to date from query parameter
      const alertType = req.query.alertType; // Get alert type from query parameter
      const plateNo = req.query.plateNo; // Get plate number from query parameter

      const admin = await userSchema.findOne({ _id: userId });
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
      if (fromDate && toDate) {
        alerts = alerts.filter(alert => alert.time >= fromDate && alert.time <= toDate);
      }
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
