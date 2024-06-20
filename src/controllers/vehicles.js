const { vehicleSchema, teltonikaSchema, userSchema, ruptelaSchema } = require("../models");

const net = require('net');
const crypto = require('crypto');
require('dotenv').config();
const mongoose = require("mongoose");
const enums = require('../utile/enums')
const https = require("https");
const { cmdType } = enums()
const getTeltonikaModel = (collectionName) => {
  return (
    mongoose.model(collectionName, teltonikaSchema)
  );
};

function sendGprsCommand(ipAddress, portNumber, commandId, data) {
  // Create a new TCP socket connection
  const socket = net.createConnection(portNumber, ipAddress);

  // Generate the packet data
  const header = Buffer.from([0x01, 0x00, 0x00, 0x00]); // Header for FMB120 devices
  const length = Buffer.alloc(4); // Placeholder for data length
  const id = Buffer.from([commandId >> 8, commandId & 0xff]); // Convert command ID to 2-byte integer
  const payload = Buffer.from(data);
  const checksum = crypto
    .createHash('crc32')
    .update(header)
    .update(length)
    .update(id)
    .update(payload)
    .digest();
  const packet = Buffer.concat([header, length, id, payload, checksum]);

  // Set the correct data length in the packet
  packet.writeUInt32BE(packet.length - 8, 4);

  // Send the packet to the device
  socket.write(packet);

  // Wait for the device to acknowledge the packet
  socket.once('data', (ack) => {
    // Process the acknowledgement response as needed
    console.log(`Received acknowledgement: ${ack.toString('hex')}`);

    // Close the socket connection
    socket.end();
  });
}

module.exports = () => {
  const createVehicle = async (req, res) => {

    try {
      const {
        vehicleType,
        vehicleNo,
        deviceImei,
        deviceType,
        deviceModel,
        camera,
        mobileNo,
        addClient } = req.body
      const userId = req.user.id
      try {
        const vehicle = await vehicleSchema.findOne({ deviceImei: deviceImei })
        const admin = await userSchema.findOne({ _id: userId })
        if (admin.role != "Admin" && admin.role != "Manager") {
          res.status(400).send({ message: "Access denied" })
          return;
        }
        if (vehicle) {
          res.status(400).send({ message: "Already same device exists!" });
        } else {
          let vehicle = new vehicleSchema({
            userId: userId,
            vehicleType: vehicleType,
            vehicleNo: vehicleNo,
            deviceImei: deviceImei,
            deviceType: deviceType,
            deviceModel: deviceModel,
            camera: camera,
            mobileNo: mobileNo,
            addClient: addClient,
          });
          await vehicle.save();
          res.status(200).send({ message: "Vehicle added successfully" })
        }
      }
      catch (err) {
        console.log("error", err);
      }


    } catch (err) {
      console.log(err)
      res.status(401).send({ message: "Something went wrong" })
    }
  }

  const maps_old = async (req, res) => {
    try {
      //const {userId} = req.body
      const userId = req.user.id
      console.log(userId)
      try {
        const connectOptions = {
          useNewUrlParser: true,
          useUnifiedTopology: true
        };
        const mongoUrl = process.env.DATABASE_TELTONIKA_URL
        var vehicles = await vehicleSchema.find({ userId: userId });

        const con = await mongoose.createConnection(mongoUrl, connectOptions)
        con.on('connected', async function () {
          console.log("connected")
          let tempBuffer = []

          for (let index = 0; index < vehicles.length; index++) {

            const modelA = con.model(vehicles[index].deviceImei, teltonikaSchema);
            const teltonicaObject = await modelA.find({})
            console.log(teltonicaObject)
            let tempObject = vehicles[index];
            tempObject = {
              vehicle: {
                _id: tempObject._id,
                teltonikas: teltonicaObject[0] ? teltonicaObject[0] : {},
                userId: tempObject.userId,
                vehicleName: tempObject.vehicleName,
                deviceType: tempObject.deviceType,
                title: tempObject.deviceType,
                deviceModel: tempObject.deviceModel,
                simNumber: tempObject.simNumber,
                expirateDate: tempObject.expirateDate,
                isVibration: tempObject.isVibration,
                isMovement: tempObject.isMovement,
                isStop: tempObject.isStop,
                isEnterZone: tempObject.isEnterZone,
                isSortZone: tempObject.isSortZone,
                isOverspeed: tempObject.isOverspeed,
                isDetachment: tempObject.isDetachment,
                createdAt: tempObject.createdAt,
                updatedAt: tempObject.updatedAt,
                polygonData: tempObject.polygonData
              }
            }
            tempBuffer.push(tempObject);
          }

          res.status(200).send(tempBuffer)
        })
      }
      catch (err) {
        console.log("error", err);
      }


    } catch (err) {
      console.log(err)
      res.status(401).send({ message: "Something went wrong" })
    }
  }
  const maps = async (req, res) => {
    try {
      const userId = req.user.id
      console.log(userId)

      try {
        const connectOptions = {
          useNewUrlParser: true,
          useUnifiedTopology: true
        };
        const teltonikaUrl = process.env.DATABASE_TELTONIKA_URL;
        const ruptelaUrl = process.env.DATABASE_RUPTELA_URL;
        const admin = await userSchema.findOne({ _id: userId });
        if (!admin) {
          res.status(401).send('token error!');
          return;
        }
        var vehicles = [];
        if (admin.role == "Admin" || admin.role == "Manager")
          vehicles = await vehicleSchema.find({});
        else
          vehicles = await vehicleSchema.find({ addClient: admin.lname });

        new Promise((resolve, reject) => {
          let cnt = 1;
          let tempBuffer = [];
          for (let index = 0; index < vehicles.length; index++) {
            let isTeltonika = (vehicles[index].deviceType === "Teltonika");
            let mongoUrl = teltonikaUrl;
            if (!isTeltonika) mongoUrl = ruptelaUrl;
            const con = mongoose.createConnection(mongoUrl, connectOptions)
            con.on('connected', async function () {
              console.log("connected to ", mongoUrl)
              const modelA = con.model(vehicles[index].deviceImei, isTeltonika ? teltonikaSchema : ruptelaSchema);
              const teltonicaObject = await modelA.findOne({}).sort({ transferDate: -1 });
              let tempObject = vehicles[index];
              let temperature = 0;
              let engineSate = "Off";
              let batteryVolt = 0;
              let simNumber = 0;
              let gpsFixed = 0;
              if (teltonicaObject) {
                let ioValue = teltonicaObject.IOvalue;
                for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                  let tmp = ioValue[i];
                  if (tmp.dataId == 916 && tmp.dataValue == 1) {
                    engineSate = "On"
                  }
                  if (tmp.dataId == 115) {
                    temperature = tmp.dataValue * 0.1;
                  }
                  if (tmp.dataId == 67) {
                    batteryVolt = tmp.dataValue * 0.001;
                  }
                  if (tmp.dataId == 11) {
                    simNumber = tmp.dataValue;
                  }
                  if (tmp.dataId == 69) {
                    gpsFixed = tmp.dataValue;
                  }
                }
              }
              tempObject = {
                vehicle: {
                  teltonikas: [teltonicaObject],
                  userId: tempObject.userId,
                  vehicleName: tempObject.vehicleNo,
                  deviceType: tempObject.deviceType,
                  deviceImei: tempObject.deviceImei,
                  temperature: temperature,
                  engineSate: engineSate,
                  batteryVolt: batteryVolt,
                  iccid: simNumber,
                  gpsFixed: gpsFixed,
                  mobileNo: tempObject.mobileNo,
                  title: tempObject.vehicleType,
                  deviceModel: tempObject.deviceModel,
                  isConnected: tempObject.isConnected,
                  createdAt: tempObject.createdAt,
                  updatedAt: tempObject.updatedAt,
                  vehicleName: tempObject.vehicleName,
                  deviceType: tempObject.deviceType,
                  simNumber: tempObject.simNumber,
                  expirateDate: tempObject.expirateDate,
                  isVibration: tempObject.isVibration,
                  isMovement: tempObject.isMovement,
                  isStop: tempObject.isStop,
                  isEnterZone: tempObject.isEnterZone,
                  isSortZone: tempObject.isSortZone,
                  isOverspeed: tempObject.isOverspeed,
                  isDetachment: tempObject.isDetachment,
                  polygonData: tempObject.polygonData
                }
              }
              tempBuffer.push(tempObject);
              if (cnt == vehicles.length) {
                resolve(tempBuffer);
                res.status(200).send(tempBuffer)
              }
              cnt++;
            })
          }
          if (vehicles.length === 0)
            res.status(200).send(tempBuffer)
        })
      }
      catch (err) {
        console.log("error", err);
        res.status(401).send({ message: "Something went wrong" })
      }


    } catch (err) {
      console.log(err)
      res.status(401).send({ message: "Something went wrong" })
    }
  }

  const showVehicleList = async (req, res) => {
    try {
      const userId = req.user.id

      try {
        const connectOptions = {
          useNewUrlParser: true,
          useUnifiedTopology: true
        };
        const teltonikaUrl = process.env.DATABASE_TELTONIKA_URL;
        const ruptelaUrl = process.env.DATABASE_RUPTELA_URL;
        const admin = await userSchema.findOne({ _id: userId });
        if (!admin) {
          res.status(401).send('token error!');
          return;
        }
        var vehicles = [];
        if (admin.role == "Admin" || admin.role == "Manager")
          vehicles = await vehicleSchema.find({});
        else
          vehicles = await vehicleSchema.find({ addClient: admin.lname });

        new Promise((resolve, reject) => {
          let cnt = 1;
          let tempBuffer = [];
          for (let index = 0; index < vehicles.length; index++) {
            let isTeltonika = (vehicles[index].deviceType === "Teltonika");
            let mongoUrl = teltonikaUrl;
            console.log(mongoUrl, "mogourl");
            if (!isTeltonika) mongoUrl = ruptelaUrl;
            const con = mongoose.createConnection(mongoUrl, connectOptions)
            con.on('connected', async function () {
              console.log("connected to ", mongoUrl)
              
              let tmpLat = 0, tmpLng = 0, address = "", stopTime = "", sendCommandDate = "", responseCommandDate = "";
              console.log(vehicles[index].deviceImei, isTeltonika ? teltonikaSchema : ruptelaSchema)
              const modelA = con.model(vehicles[index].deviceImei, isTeltonika ? teltonikaSchema : ruptelaSchema);
              console.log(modelA);
              const teltoObj1 = await modelA.find({lat:{$ne:-214.7483648}}).sort({ transferDate: -1 }).limit(1);
              console.log(teltoObj1, "teltoObj1")
              if(teltoObj1 && teltoObj1.length > 0) {
                tmpLat = teltoObj1[0].lat;
                tmpLng = teltoObj1[0].lng;
              }

              const teltoObj2 = await modelA.find({address:{$ne:""}}).sort({ transferDate: -1 }).limit(1);
              console.log(teltoObj2, "teltoObj2")
              
              if(teltoObj2 && teltoObj2.length > 0) {
                address = teltoObj2[0].address;
              }

              const lastIndex = await modelA.countDocuments({ movement: { $ne: 0 } }).sort({ transferDate: -1 });
              const teltoObj3 = await modelA.findOne().skip(lastIndex).limit(1);
              if(teltoObj3) {
                stopTime = teltoObj3.transferDate;
              }

              const teltoObj4 = await modelA.find().sort({ sendCommandDate: -1 }).limit(1);
              if(teltoObj4 && teltoObj4.length > 0) {
                sendCommandDate = teltoObj4[0]?.sendCommandDate;
              }


              const teltonicaObject = await modelA.find().sort({ transferDate: -1 }).limit(2);
              let tempObject = vehicles[index];
              let temperature = 0;
              let engineStatus = "Off";
              let ignitionStatus = "Off";
              let batteryVolt = 0;
              let simNumber = 0;
              let gpsFixed = 0;
              if (teltonicaObject.length > 0) {
                let ioValue = teltonicaObject[teltonicaObject.length - 1].IOvalue;
                for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                  let tmp = ioValue[i];
                  // if (tmp.dataId == 916 && tmp.dataValue == 1) {
                  if (tmp.dataId == 1 && tmp.dataValue == 1) {
                    engineStatus = "On"
                  }
                  if (tmp.dataId == 179 && tmp.dataValue == 1) {
                    ignitionStatus = "On"
                  }
                  if (tmp.dataId == 115) {
                    temperature = tmp.dataValue * 0.1;
                  }
                  if (tmp.dataId == 67) {
                    batteryVolt = tmp.dataValue * 0.001;
                  }
                  if (tmp.dataId == 11) {
                    simNumber = tmp.dataValue;
                  }
                  if (tmp.dataId == 69) {
                    gpsFixed = tmp.dataValue;
                  }
                }
              }
              tempObject = {
                vehicle: {
                  teltonikas: teltonicaObject,
                  userId: tempObject.userId,
                  vehicleName: tempObject.vehicleNo,
                  deviceType: tempObject.deviceType,
                  deviceImei: tempObject.deviceImei,
                  temperature: temperature,
                  engineStatus: engineStatus,
                  ignitionStatus: ignitionStatus,
                  batteryVolt: batteryVolt,
                  iccid: simNumber,
                  gpsFixed: gpsFixed,
                  mobileNo: tempObject.mobileNo,
                  title: tempObject.vehicleType,
                  deviceModel: tempObject.deviceModel,
                  isConnected: tempObject.isConnected,
                  createdAt: tempObject.createdAt,
                  updatedAt: tempObject.updatedAt,
                  camera:tempObject.camera,
                  polygonData: tempObject.polygonData,
                  lat:tmpLat,
                  lng:tmpLng,
                  address:address,
                  stopTime:stopTime,
                  limitSpeed:tempObject.limitSpeed,
                  limitFuel:tempObject.limitFuel,
                  limitLowTemp:tempObject.limitLowTemp,
                  limitHighTemp:tempObject.limitHighTemp,
                  onStop:tempObject.onStop,
                  onMove:tempObject.onMove,
                  sendCommandDate:sendCommandDate,
                  responseCommandDate:responseCommandDate
                }
              }
              tempBuffer.push(tempObject);
              if (cnt == vehicles.length) {
                resolve(tempBuffer);
                res.status(200).send(tempBuffer)
              }
              cnt++;
            })
          }
          if (vehicles.length === 0)
            res.status(200).send(tempBuffer)
        })
      }
      catch (err) {
        console.log("error", err);
        res.status(401).send({ message: "Something went wrong" })
      }


    } catch (err) {
      console.log(err)
      res.status(401).send({ message: "Something went wrong" })
    }
  }

  const updateVehicle = async (req, res) => {
    const userId = req.user.id
    try {
      const admin = await userSchema.findOne({ _id: userId })
      if (admin.role != "Admin" && admin.role != "Manager") {
        res.status(400).send({ message: "Access denied" })
        return;
      }
      const {
        vehicleType,
        vehicleNo,
        deviceImei,
        deviceType,
        deviceModel,
        camera,
        mobileNo,
        addClient } = req.body

      vehicleSchema.updateOne(
        { deviceImei: deviceImei },
        {
          $set: {
            vehicleType: vehicleType,
            vehicleNo: vehicleNo,
            deviceImei: deviceImei,
            deviceType: deviceType,
            deviceModel: deviceModel,
            camera: camera,
            mobileNo: mobileNo,
            addClient: addClient
          }
        },
        (err, result) => {
          if (err) {
            res.status(401).json({ message: "Something went wrong" })
          }
          else {
            res.status(200).json({ message: "Vehicle updated successfully", result })
          }
        }
      )
    } catch (err) {
      console.log("Update Fail:", err)
      res.status(400).send({ message: "Something went wrong" })
    }
  }

  const updateSatus = async () => {
    try {
      const connectOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
      };
      const mongoUrl = process.env.DATABASE_TELTONIKA_URL
      var vehicles = await vehicleSchema.find({});

      const con = await mongoose.createConnection(mongoUrl, connectOptions)
      con.on('connected', async function () {
        for (let index = 0; index < vehicles.length; index++) {

          const modelA = con.model(vehicles[index].deviceImei, teltonikaSchema);
          const teltonicaObject = await modelA.findOne({}).sort({ transferDate: -1 });
          if (teltonicaObject && teltonicaObject.transferDate) {
            let dev_date = new Date(teltonicaObject.transferDate);
            dev_date = new Date(dev_date.getTime() + 3 * 60000);
            let curTime = new Date();
            if (dev_date > curTime) {
              let tmps = await modelA.find().sort({ transferDate: -1 }).limit(2);
              if (tmps && tmps.length > 1 && (tmps[0].lat != tmps[1].lat || tmps[0].lng != tmps[1].lng)) {
                await vehicleSchema.updateOne({ deviceImei: vehicles[index].deviceImei }, { $set: { isConnected: "Connected" } })
              } else {
                await vehicleSchema.updateOne({ deviceImei: vehicles[index].deviceImei }, { $set: { isConnected: "Idle" } })
              }
            } else {
              await vehicleSchema.updateOne({ deviceImei: vehicles[index].deviceImei }, { $set: { isConnected: "Not Connected" } })
            }
          }
        }
      })
    }
    catch (err) {
      console.log("error", err);
    }
  }

  const removeVehicle = async (req, res) => {
    const { deviceImei } = req.body
    const userId = req.user.id
    if (!deviceImei || deviceImei == "") {
      res.status(401).json({ message: "Something went wrong" });
      return;
    }
    try {
      const admin = await userSchema.findOne({ _id: userId })
      if (admin.role != "Admin" && admin.role != "Manager") {
        res.status(400).send({ message: "Access denied" })
        return;
      }
      const vehicle = await vehicleSchema.findOne({ deviceImei: deviceImei })

      if (!vehicle) {
        res.status(200).json({ message: "Vehicle not exist" })
      }
      else {
        await vehicle.deleteOne()
        res.status(200).json({ message: "Vehicle deleted successfully" })
      }
    } catch (err) {
      console.log(err)
      res.status(401).json({ message: "Something went wrong" })
    }
  }

  const getStatus = async (req, res) => {
    try {
      const userId = req.user.id;
      const admin = await userSchema.findOne({ _id: userId });
      let vehicles = [];
      if (admin && admin.role === "Admin" || admin.role === "Manager") {
        vehicles = await vehicleSchema.find({}, { userId: 1, deviceImei: 1, isConnected: 1 });
      } else {
        vehicles = await vehicleSchema.find({ addClient: admin.lname }, { userId: 1, deviceImei: 1, isConnected: 1 });
      }
      if (vehicles)
        res.status(200).send(vehicles);
      else
        res.status(400).send("Some went wrong!!!");
    } catch (err) {
      console.log("error", err);
      res.status(500).send("Error Occured!!")
    }
  }

  const deleteVehiclePolygon = async (req, res) => {
    const { deviceImei, index } = req.body
    console.log("deviceImei", deviceImei)
    console.log("index", index)

    if (!deviceImei) {
      res.status(400).send("Parameter not set")
      return;
    }
    try {
      await vehicleSchema.findOne(
        { deviceImei: deviceImei }
      )
        .then(async (response1) => {
          const polygonData = response1.polygonData;
          let modifiedArray;
          if (index != 0)
            modifiedArray = [...polygonData.slice(0, index), ...polygonData.slice(index + 1)];
          else
            modifiedArray = polygonData.slice(1)
          await vehicleSchema.updateOne(
            { deviceImei: deviceImei },
            {
              $set: { polygonData: modifiedArray }
            }
          )
            .then(async (response2) => {
              console.log("response1:::", response1)
              console.log("response2:::", response2)
              console.log("Delete Success")
              res.status(200).send("AN POLYGONITEM DELETED")
            })
            .catch((error) => {
              console.log("Insert failed")
              res.status(400).send("AN ERROR OCCURED")
            })
        })
        .catch((error) => {
          console.log("Insert failed:::::::", error)
          res.status(400).send("AN ERROR OCCURED")
        })
    }
    catch (err) {
      console.log("error", err);
      res.status(500).send("error")
      return
    }
  }

  const sendIgnitionCommand = async (req, res) => {
    // const { ip, port, value } = req.body
    // try {
    //   if (value == 0)
    //     sendGprsCommand(ip, port, 0x8001, Buffer.from([0x01]));
    //   else
    //     sendGprsCommand(ip, port, 0x8001, Buffer.from([0x00]));

    //   res.status(200).json({ message: "Ignition command sent" })
    // } catch (err) {
    //   console.log(err)
    //   res.status(401).json({ message: "Something went wrong" })
    // }
    
    /* -------------- modified by angel ------------------- */
    const {token,deviceImei,command,param } = req.body
    console.log(">>>>>>>>",token,deviceImei,command,param )
    updateCommandTeltonika(deviceImei,command,param,res);

  }

  const updateCommandTeltonika = async (deviceImei,command,param,res) =>{
    try {
      const connectOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
      };

      console.log("updateCommandTeltonika func ",deviceImei,command,param);

      const mongoUrl1 = process.env.DATABASE_TELTONIKA_URL;
      const con = await mongoose.createConnection(mongoUrl1, connectOptions);
      con.on('connected', async function () {
        console.log("updateCommandTeltonika teltonika db connected")

        const modelA = con.model(deviceImei, teltonikaSchema);
        const teltonicaObject = await modelA.find().sort({ transferDate: 1 }).limit(1);
        let temp = '';
        if(param)
          temp = `${command} ${param}`;
        else
          temp = command;

        let updateStr;
        if(command =="setparam"){
          updateStr = {
            command : temp,  
            isChange : 1,
            trackMode:param,
            sendCommandDate:Date.now()
          }
        }else{
          updateStr = {
            command : temp,  
            isChange : 1,
            sendCommandDate:Date.now()
          }          
        }
        console.log(">>>>>>>>>>", teltonicaObject[0]);

        modelA.updateOne(
          { _id: teltonicaObject[0].id },
          {
            $set: updateStr
          },
          (err, result) => {
            if (err) {
              console.log("updateCommandTeltonika teltonika updata error",err)
              res.status(401).json({ message: "Something went wrong in Update" })
            }
            else {
              console.log("updateCommandTeltonika teltonika updata success")
              //sendGprsCommand("192.168.131.232","5500",0x8001, Buffer.from([0x01]))
              res.status(200).json({ message: "command sent" })
            }
            con.close();
          }
        )
      })      

      con.on('error', function (err) {
        // Handle the error here
        con.close();
        console.error('updateCommandTeltonika Database Connection error:', err);
        res.status(400).json({ message: err });
      });
      
    } catch (err) {
      console.log("updateCommandTeltonika func error",err)
      res.status(401).json({ message: "Something went wrong" })
    }
  }
  
  const sendRestartCommand = async (req, res) => {
    const { ip, port } = req.body
    try {
      sendGprsCommand(ip, port, 0x7001, Buffer.from([0x01]));

      res.status(200).json({ message: "Restart command sent" })
    } catch (err) {
      console.log(err)
      res.status(401).json({ message: "Something went wrong" })
    }
  }

  const sendResetCommand = async (req, res) => {
    const { ip, port } = req.body
    try {
      const RESET_COMMAND = 'AT^RESET\r\n';

      // Create a TCP socket connection
      const socket = new net.Socket();

      socket.connect(port, ip, () => {
        console.log(`Connected to ${ip}:${port}`);

        // Send reset command over the socket
        socket.write(RESET_COMMAND);
      });

      // Handle data received from the device
      socket.on('data', (data) => {
        console.log(`Received data: ${data}`);
      });

      res.status(200).json({ message: "Restart command sent" })
    } catch (err) {
      console.log(err)
      res.status(401).json({ message: "Something went wrong" })
    }
  }

  const historyVehicle = async (req, res) => {
    const { deviceImei, firstDate, secondDate } = req.body

    const connectOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    const mongoUrl = process.env.DATABASE_TELTONIKA_URL
    const con = await mongoose.createConnection(mongoUrl, connectOptions)

    try {
      const modelA = con.model(deviceImei, teltonikaSchema);
      modelA.find({
        transferDate: { $gte: firstDate, $lte: secondDate }
      }, { lat: 1, lng: 1, transferDate: 1, speed:1, address:1 })
        .sort({ transferDate: 1 })
        .exec((error, records) => {
          if (error) {
            res.status(400).send("An error occured");
          }
          console.log("history result", records);
          res.status(200).json(records);
        })
    }
    catch (error) {
      console.log("Catch error:", error)
      res.status(400).send("An error occured");
    }

  }

  const saveGeofenseData = async (req, res) => {

    const { deviceImei, polygonData, enter, sortie, title, content } = req.body;
    console.log("deviceImei::::", deviceImei)
    if (!deviceImei || !polygonData || !title || !content) {
      res.status(400).send("Parameter not set")
      return;
    }
    const newItem = {
      title: title,
      content: content,
      polygonData: polygonData,
      enter: enter,
      sortie: sortie
    }
    console.log(newItem);
    try {
      await vehicleSchema.updateOne(
        { deviceImei: deviceImei },
        { $push: { polygonData: newItem } }
      )
        .then(() => {
          console.log("Insert Success")
          res.status(200).send("NEW POLYGON ADDED")
        })
        .catch(() => {
          console.log("Insert failed")
          res.status(400).send("AN ERROR OCCURED")
        })
    }
    catch (err) {
      console.log("error", err);
      res.status(500).send("error")
      return
    }
  }

  const updategeofence = async (req, res) => {

    const { deviceImei, polygonData, enter, sortie, index, title, content } = req.body;
    console.log("deviceImei::::", deviceImei)
    if (!deviceImei || !polygonData || !title || !content) {
      res.status(400).send("Parameter not set")
      return;
    }
    const newItem = {
      title: title,
      content: content,
      polygonData: polygonData,
      enter: enter,
      sortie: sortie
    }
    console.log(newItem);
    try {
      await vehicleSchema.findOne(
        { deviceImei: deviceImei }
      )
        .then(async (response1) => {
          let polygonData = response1.polygonData;
          polygonData[index] = newItem;
          await vehicleSchema.updateOne(
            { deviceImei: deviceImei },
            {
              $set: { polygonData: polygonData }
            }
          )
            .then(async (response2) => {
              console.log("Update Success")
              res.status(200).send("POLYGONITEM UPDATED")
            })
            .catch((error) => {
              console.log("Update failed")
              res.status(400).send("AN ERROR OCCURED")
            })
        })
        .catch((error) => {
          console.log("Update failed:::::::", error)
          res.status(400).send("AN ERROR OCCURED")
        })
    }
    catch (err) {
      console.log("error", err);
      res.status(500).send("error")
      return
    }
  }

  const getResFromDev = async (req, res) => {
    const { deviceImei, type, din } = req.body;
    const connectOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    const teltonikaUrl = process.env.DATABASE_TELTONIKA_URL;
    try {
      if (!deviceImei || deviceImei == "") {
        res.status(400).send("Wrong Param.")
        return;
      }
      const con = mongoose.createConnection(teltonikaUrl, connectOptions)
      con.on('connected', async function () {
        const modelA = con.model(deviceImei, teltonikaSchema);
        const teltonicaObject = await modelA.findOne({}).sort({ transferDate: -1 });
        if (teltonicaObject) {
          let ioValue = teltonicaObject.IOvalue;
          let updatedAt = teltonicaObject.updatedAt;
          let result = "";
          switch (type) {
            case cmdType.DigitalOutput:
              let dout1 = "", dout2 = "", dout3 = "";
              for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                let tmp = ioValue[i];
                if (tmp.dataId == 179) {
                  dout1 = tmp.dataValue;
                }
                if (tmp.dataId == 180) {
                  dout2 = tmp.dataValue;
                }
                if (tmp.dataId == 380) {
                  dout3 = tmp.dataValue;
                }
              }
              res.status(200).json({ result: { dout1: dout1, dout2: dout2, dout3: dout3, updatedAt: updatedAt } })
              break;
            case cmdType.DigitalInput:
              for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                let tmp = ioValue[i];
                if (tmp.dataId == 1 && din == "din1") {
                  result = tmp.dataValue;
                }
                if (tmp.dataId == 2 && din == 'din2') {
                  result = tmp.dataValue;
                }
                if (tmp.dataId == 3 && din == 'din3') {
                  result = tmp.dataValue;
                }
              }
              res.status(200).json({ result: { result: result, updatedAt: updatedAt } })
              break;
            case cmdType.AxisX:
              for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                let tmp = ioValue[i];
                if (tmp.dataId == 17) {
                  result = tmp.dataValue;
                }
              }
              res.status(200).json({ result: { result: result, updatedAt: updatedAt } })
              break;
            case cmdType.AxisY:
              for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                let tmp = ioValue[i];
                if (tmp.dataId == 18) {
                  result = tmp.dataValue;
                }
              }
              res.status(200).json({ result: { result: result, updatedAt: updatedAt } })
              break;
            case cmdType.AxisZ:
              for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                let tmp = ioValue[i];
                if (tmp.dataId == 19) {
                  result = tmp.dataValue;
                }
              }
              res.status(200).json({ result: { result: result, updatedAt: updatedAt } })
              break;
            case cmdType.AnalogueInput:
              const { pin } = req.body;
              result = 0;
              for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                let tmp = ioValue[i];
                if (tmp.dataId == 9 && pin == "pin1") {
                  result = tmp.dataValue;
                }
                if (tmp.dataId == 6 && pin == 'pin2') {
                  result = tmp.dataValue;
                }
              }
              res.status(200).json({ result: { result: result, updatedAt: updatedAt } })
              break;
            case cmdType.BatteryLevel:

              res.status(200).json({ result: { updatedAt: updatedAt } })
              break;
            case cmdType.BatteryVoltage:
              let voltage = 0;
              for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                let tmp = ioValue[i];
                if (tmp.dataId == 67) {
                  voltage = tmp.dataValue;
                }

              }
              res.status(200).json({ result: { result: voltage, updatedAt: updatedAt } })
              break;
            case cmdType.ExternalVoltage:
              let extvoltage = 0;
              for (var i = 0; ioValue && ioValue.length && i < ioValue.length; i++) {
                let tmp = ioValue[i];
                if (tmp.dataId == 66) {
                  extvoltage = tmp.dataValue;
                }

              }
              res.status(200).json({ result: { result: extvoltage, updatedAt: updatedAt } })
              break;
            default:
              res.status(400).send("Something went wrong.")
              break;
          }
          return;
        } else {
          res.status(401).json({ msg: "Request Param Error" })
          return;
        }
      })
    } catch (err) {
      console.log(err)
      res.status(400).json({ msg: "Error Occured", err: err })
      return;
    }
  }

  const setTrackingMode = async (req, res) => {
    const {token, deviceImei, onStop, onMove } = req.body
    vehicleSchema.updateOne(
      { deviceImei: deviceImei },
      {
        $set: {
          onStop : onStop,
          onMove : onMove
        }
      },
      (err, result) => {
        if (err) {
          console.log("setTrackingMode func error ",err);
          res.status(401).json({ message: "Something went wrong" })
        }
        else {
          res.status(200).json({ message: "Vehicle updated successfully", result })
        }
      }
    )
  }
  
  const setLimitSpeed = async (req, res) => {
    const {token, deviceImei, speed } = req.body

    console.log("setLimitSpped func ",deviceImei, speed)
    vehicleSchema.updateOne(
      { deviceImei: deviceImei },
      {
        $set: {
          limitSpeed : speed
        }
      },
      (err, result) => {
        if (err) {
          console.log("setLimitSpped func error ",err);
          res.status(401).json({ message: "Something went wrong" })
        }
        else {
          res.status(200).json({ message: "Vehicle updated successfully", result })
        }
      }
    )
  }

  const setLimitFuel = async (req, res) => {
    const {token, deviceImei, fuel } = req.body

    vehicleSchema.updateOne(
      { deviceImei: deviceImei },
      {
        $set: {
          limitFuel : fuel
        }
      },
      (err, result) => {
        if (err) {
          console.log("setLimitFuel func error ",err);
          res.status(401).json({ message: "Something went wrong" })
        }
        else {
          res.status(200).json({ message: "Vehicle updated successfully", result })
        }
      }
    )
  }

  const setLimitTemp = async (req, res) => {
    const {token, deviceImei, highTemp, lowTemp } = req.body

    vehicleSchema.updateOne(
      { deviceImei: deviceImei },
      {
        $set: {
          limitLowTemp : lowTemp, limitHighTemp:highTemp
        }
      },
      (err, result) => {
        if (err) {
          console.log("setLimitTemp func error ",err);
          res.status(401).json({ message: "Something went wrong" })
        }
        else {
          res.status(200).json({ message: "Vehicle updated successfully", result })
        }
      }
    )
  }

  return {
    createVehicle,
    maps,
    showVehicleList,
    updateVehicle,
    removeVehicle,
    sendIgnitionCommand,
    sendResetCommand,
    historyVehicle,
    sendRestartCommand,
    saveGeofenseData,
    updategeofence,
    deleteVehiclePolygon,
    updateSatus,
    getStatus,
    getResFromDev,
    setTrackingMode,
    setLimitSpeed,
    setLimitFuel,
    setLimitTemp
  }
}