
module.exports = (router) => {
  const vehicles = require("../controllers/vehicles")
  const cmds = require("../controllers/command")
  const {
    createVehicle,
    maps,
    showVehicleList,
    updateVehicle,
    removeVehicle,
    historyVehicle,
    sendIgnitionCommand,
    sendResetCommand,
    sendRestartCommand,
    saveGeofenseData,
    updategeofence,
    deleteVehiclePolygon,
    getStatus,
    getResFromDev,
    setTrackingMode,
    setLimitSpeed,
    setLimitFuel,
    setLimitTemp
  } = vehicles()

  const { sendCmd, showCmd } = cmds()

  router.post("/create", createVehicle)//add vehicle
  router.post("/maps", maps)    //get vehicle list to show on maps
  router.post("/show", showVehicleList)    //get vehicle list normal
  router.post("/update", updateVehicle)    //update vehicle
  router.post("/remove", removeVehicle) //remove vehicle
  router.post("/removePolygon", deleteVehiclePolygon) // remove vehicle Polygon Item
  router.post("/history", historyVehicle) //remove vehicle
  router.post("/status", getStatus) //get vehicle status


  router.post("/ignition", sendIgnitionCommand)
  router.post("/reset", sendResetCommand)
  router.post("/restart", sendRestartCommand)
  router.post("/savegeofence", saveGeofenseData)
  router.post("/updategeofence", updategeofence)
  
  router.post("/sendCommand", sendCmd)
  router.post("/showCommand", showCmd)
  router.post("/getResFromDev", getResFromDev)

  router.post("/trackingMode", setTrackingMode)
  router.post("/limitSpeed", setLimitSpeed) //set limitspeed vehicle
  router.post("/limitFuel", setLimitFuel) //set limitspeed vehicle
  router.post("/limitTemp", setLimitTemp) //set limitspeed vehicle

  return router
}