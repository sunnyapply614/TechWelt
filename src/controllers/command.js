const { commandSchema, vehicleSchema } = require('../models')
const enums = require('../utile/enums')
const { cmdStatus, cmdType } = enums()

module.exports = () => {

    const saveToDB = async (devImei, type, cmd) => {
        try {
            const cmd1 = await commandSchema.findOne({deviceImei: devImei, cmdType: type})
            if (cmd1) {
                await commandSchema.updateOne({deviceImei: devImei, cmdType: type},{$set: {command: cmd}})
                return true;
            } else {
                let newCmd = new commandSchema({
                    deviceImei: devImei,
                    cmdType: type,
                    command: cmd,
                    status: cmdStatus.Queued
                });
                
                await newCmd.save();
                return true;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    const sendCmd = async (req, res) => {
        const { type, params, devImei } = req.body;
        let cmd = "";
        try {
            const vehi = await vehicleSchema.findOne({deviceImei: devImei});
            if( vehi ) {
                let tmp = '';
                switch (type) {
                    case cmdType.EngineOn:
                        cmd = "setdigout " + params.on + "??"; 
                        break;
                    case cmdType.DigitalOutput:
                        cmd = "setdigout " + params.out1 + params.out2 + params.out3; 
                        break;
                    case cmdType.DigitalInput:
                        cmd = "setparam ";
                        if(params.din == "din1") tmp = '17'
                        else if(params.din == "din2") tmp = '27'
                        else tmp = '37'
                        cmd += "50" + tmp + "0:" + params.priority;
                        cmd += ";50" + tmp + "1:" + params.operand;
                        cmd += ";50" + tmp + "2:" + params.highLevel;
                        cmd += ";50" + tmp + "3:" + params.lowLevel;
                        cmd += ";50" + tmp + "4:" + params.eventOnly;
                        cmd += ";50" + tmp + "5:" + params.average;
                        cmd += ";70" + tmp + ":" + params.phoneNo;
                        cmd += ";80" + tmp + ":" + params.sms;
                        break;
                    case cmdType.BatteryLevel:
                        cmd = "setparam ";
                        cmd += '50690:' + params.priority;
                        cmd += ';50691:' + params.operand;
                        cmd += ";50692:" + params.highLevel;
                        cmd += ";50693:" + params.lowLevel;
                        cmd += ';50694:' + params.eventOnly;
                        cmd += ';50695:' + params.average;
                        cmd += ";7243:" + params.phoneNo;
                        cmd += ';8243:' + params.sms;
                        break;
                    case cmdType.BatteryVoltage:
                        cmd = "setparam ";
                        cmd += '50120:' + params.priority;
                        cmd += ';50121:' + params.operand;
                        cmd += ";50122:" + params.highLevel;
                        cmd += ";50123:" + params.lowLevel;
                        cmd += ';50124:' + params.eventOnly;
                        cmd += ';50125:' + params.average;
                        cmd += ";7012:" + params.phoneNo;
                        cmd += ';8012:' + params.sms;
                        break;
                    case cmdType.AnalogueInput:
                        cmd = "setparam ";
                        if(params.pin == 'pin1') tmp = '18';
                        else tmp = '29';
                        cmd += '50' + tmp + '0:' + params.priority;
                        cmd += ';50' + tmp + '1:' + params.operand;
                        cmd += ';50' + tmp + '2:' + params.highLevel;
                        cmd += ';50' + tmp + '3:' + params.lowLevel;
                        cmd += ';50' + tmp + '4:' + params.eventOnly;
                        cmd += ';50' + tmp + '5:' + params.average;
                        cmd += ';70' + tmp + ':' + params.phoneNo;
                        cmd += ';80' + tmp + ':' + params.sms;
                        break;
                    case cmdType.AxisX:
                        cmd = "setparam ";
                        cmd += '50220:' + params.priority;
                        cmd += ';50221:' + params.operand;
                        cmd += ";50222:" + params.highLevel;
                        cmd += ";50223:" + params.lowLevel;
                        cmd += ';50224:' + params.eventOnly;
                        cmd += ';50225:' + params.average;
                        cmd += ";7022:" + params.phoneNo;
                        cmd += ';8022:' + params.sms;
                        break;
                    case cmdType.AxisY:
                        cmd = "setparam ";
                        cmd += '50230:' + params.priority;
                        cmd += ';50231:' + params.operand;
                        cmd += ";50232:" + params.highLevel;
                        cmd += ";50233:" + params.lowLevel;
                        cmd += ';50234:' + params.eventOnly;
                        cmd += ';50235:' + params.average;
                        cmd += ";7023:" + params.phoneNo;
                        cmd += ';8023:' + params.sms;
                        break;
                    case cmdType.AxisZ:
                        cmd = "setparam ";
                        cmd += '50240:' + params.priority;
                        cmd += ';50241:' + params.operand;
                        cmd += ";50242:" + params.highLevel;
                        cmd += ";50243:" + params.lowLevel;
                        cmd += ';50244:' + params.eventOnly;
                        cmd += ';50245:' + params.average;
                        cmd += ";7024:" + params.phoneNo;
                        cmd += ';8024:' + params.sms;
                        break;
                    case cmdType.ExternalVoltage:
                        cmd = "setparam ";
                        cmd += '50800:' + params.priority;
                        cmd += ';50081:' + params.operand;
                        cmd += ";50082:" + params.highLevel;
                        cmd += ";50083:" + params.lowLevel;
                        cmd += ';50084:' + params.eventOnly;
                        cmd += ';50085:' + params.average;
                        cmd += ";7008:" + params.phoneNo;
                        cmd += ';8008:' + params.sms;
                        break;
                    case cmdType.MotionDetection:
                        cmd += 'setparam 138:' + params.opt;
                        break;
                    case cmdType.NetworkTimeProtocalServer:
                        cmd += 'setparam 901:' + params.period;
                        cmd += ';902:' + params.server1;
                        cmd += ';903:' + params.server2;
                        break;
                    case cmdType.SleepMode:
                        cmd += 'setparam 102:' + params.mode;
                        break;
                    case cmdType.StaticNavigation:
                        cmd += 'setparam 106:' + params.on;
                        cmd += ';112:' + params.src;
                        break;
                    case cmdType.GnssSource:
                        cmd += 'setparam 109:' + params.opt;
                        break;
                    case cmdType.LedIndication:
                        cmd += 'setparam 108:' + params.on;
                        break;
                    case cmdType.BatteryChargeMode:
                        cmd += 'setparam 110:' + params.mode;
                        break;
                    case cmdType.IgnitionDetectionSource:
                        cmd += 'setparam 101:' + params.src;
                        break;
                    case cmdType.AccelerometerCalibrationAndGravityFilter:
                        cmd += 'setparam 169:' + params.mode;
                        cmd += ';170:' + params.filter;
                        break;
                    case cmdType.DataCodecToUseForDataTransmission:
                        cmd += 'setparam 113:' + params.codec;
                        break;
                    case cmdType.GetverCommandResponse:
                        cmd += 'getver';
                        break;
                    case cmdType.RecordsParameters:
                        cmd += 'setparam 1000:' + params.linkTimeOut;
                        cmd += ';1001:' + params.resTimeOut;
                        cmd += ';1002:' + params.order;
                        break;
                    case cmdType.EnableConnectionOverTLS:
                        cmd += 'setparam 20200:' + params.tls;
                        break;
                    case cmdType.FirmwareOverTheAirWebService:
                        cmd += 'setparam 13003:' + params.tls;
                        cmd += ';13000:' + params.host;
                        cmd += ';13001:' + params.port;
                        cmd += ';13002:' + params.period;
                        break;
                    case cmdType.NetworkPing:
                        cmd += 'setparam 1003:' + params.tout;
                        break;
                    case cmdType.GprsServerSetup:
                        cmd += 'setparam 2004:' + params.host;
                        cmd += ';2005:' + params.port;
                        cmd += ';2006:' + params.protocol;
                        break;
                    case cmdType.GprsSetup:
                        cmd += 'setparam 2000:' + params.enable;
                        cmd += ';2001:' + params.apnName;
                        cmd += ';2002:' + params.apnUName;
                        cmd += ';2003:' + params.apnPwd;
                        break;
                    case cmdType.SecondaryGprsServerSetup:
                        cmd += 'setparam 2007:' + params.host;
                        cmd += ';2008:' + params.port;
                        cmd += ';2009:' + params.protocol;
                        cmd += ';2010:' + params.mode;                        
                        break;
                    case cmdType.SmsReportSendingParams:
                        cmd = 'setparam 3000:' + params.allow;
                        cmd += ';3001:' + params.phoneNo; 
                        break;
                    case cmdType.IncomingCallAction:
                        cmd = 'setparam 3005:' + params.action;
                        break;
                    case cmdType.PhoneNumbers:
                        cmd = 'setparam '
                        break;
                    case cmdType.SmsEventTimeZone:
                        cmd = 'setparam 3006:' + params.zone;
                        break;
                    case cmdType.HomeGsmNetwork:
                        cmd = 'setparam 10000:' + params.recTout;
                        cmd += ';10004:' + params.saveRec;
                        cmd += ';10005:' + params.sendPeriod;
                        cmd += ';10050:' + params.tout;
                        cmd += ';10051:' + params.distance;
                        cmd += ';10052:' + params.angChg;
                        cmd += ';10053:' + params.speedChg;
                        cmd += ';10054:' + params.msavRec;
                        cmd += ';10055:' + params.msendPeriod;
                        break;
                    case cmdType.RoamingGsmNetworkSettings:
                        cmd = 'setparam 10100:' + params.recTout;
                        cmd += ';10104:' + params.saveRec;
                        cmd += ';10105:' + params.sendPeriod;
                        cmd += ';10150:' + params.tout;
                        cmd += ';10151:' + params.distance;
                        cmd += ';10152:' + params.angChg;
                        cmd += ';10153:' + params.speedChg;
                        cmd += ';10154:' + params.msavRec;
                        cmd += ';10155:' + params.msendPeriod;
                        break;
                    case cmdType.UnknownGsmNetwork:
                        cmd = 'setparam 10200:' + params.recTout;
                        cmd += ';10204:' + params.saveRec;
                        cmd += ';10205:' + params.sendPeriod;
                        cmd += ';10250:' + params.tout;
                        cmd += ';10251:' + params.distance;
                        cmd += ';10252:' + params.angChg;
                        cmd += ';10253:' + params.speedChg;
                        cmd += ';10254:' + params.msavRec;
                        cmd += ';10255:' + params.msendPeriod;
                        break;
                    case cmdType.TripScenarioParam:
                        cmd = 'setparam 11800:' + params.priority;
                        cmd += ';11801:' + params.evRec;
                        cmd += ';11802:' + params.mode;
                        cmd += ';11803:' + params.startSp;
                        cmd += ';11804:' + params.tout;
                        cmd += ';7031:' + params.phoneNo;
                        cmd += ';8031:' + params.sms;
                        cmd += ';700:' + params.eco;
                        cmd += ';11805:' + params.remember;
                        break;
                    case cmdType.Odometer:
                        cmd = 'setparam 11806:' + params.calSrc;
                        cmd += ';11807:' + params.iov;
                        break;
                    case cmdType.TrackingOnDemandMode:
                        cmd = 'on_demand_tracking' + params.on;
                        break;
                    case cmdType.TrackingOnDemandTiming:                    
                        cmd = 'setparam 10990:' + params.period;
                        cmd += ';10991:' + params.duration;
                        break;
                    case cmdType.GreenDriving:
                        cmd = 'setparam 11000:' + params.priority;
                        cmd += ';11004:' + params.mxAcc;
                        cmd += ';11005:' + params.mxBrak;
                        cmd += ';11006:' + params.mxAng;
                        cmd += ';11007:' + params.src;
                        cmd += ';11008:' + params.duration;
                        cmd += ';11003:' + params.p1;
                        cmd += ';11001:' + params.p2;
                        cmd += ';11002:' + params.p3;
                        cmd += ';7034:' + params.phoneNo;
                        cmd += ';8034:' + params.sms;
                        break;
                    case cmdType.OverSpeeding:
                        cmd = 'setparam 11100:' + params.priority;
                        cmd += ';11104:' + params.mxSpeed;
                        cmd += ';11103:' + params.duration;
                        cmd += ';11101:' + params.p1;
                        cmd += ';11102:' + params.p2;
                        cmd += ';7032:' + params.phoneNo;
                        cmd += ';8032:' + params.sms;
                        break;
                    case cmdType.DoutControlViaIgnition:
                        cmd = 'setparam 13401:' + params.dctl;
                        cmd += ';13402:' + params.deact;
                        cmd += ';13403:' + params.tout;
                        break;
                    case cmdType.IgnitionOnCounter:
                        cmd = 'setparam 13500:' + params.on;
                        cmd += ';13501:' + params.val;
                        break;
                    case cmdType.JammingWithTimeoutScenario:
                        cmd = 'setparam 11300:' + params.priority;
                        break;
                    case cmdType.UnplugDetection:
                        cmd = 'setparam 11500:' + params.priority;
                        cmd += ';11501:' + params.evOnly;
                        cmd += ';11502:' + params.mode;
                        cmd += ';7036:' + params.phoneNo;
                        cmd += ';8036:' + params.sms;
                        break;
                    case cmdType.CrashCounter:
                        cmd = 'setparam 11415:' + params.on;
                        cmd += ';11410:' + params.rate;
                        cmd += ';11407:' + params.duration;
                        cmd += ';11408:' + params.gnss;
                        break;
                    case cmdType.TowingDetection:
                        cmd = 'setparam 11600:' + params.priority;
                        cmd += ';11601:' + params.evRec;
                        cmd += ';11602:' + params.acTout;
                        cmd += ';11603:' + params.evTout;
                        cmd += ';11604:' + params.threshold;
                        cmd += ';11605:' + params.ang;
                        cmd += ';11606:' + params.duration;
                        cmd += ';11607:' + params.callOn;
                        cmd += ';7035:' + params.phoneNo;
                        cmd += ';8035:' + params.sms;
                        break;
                    case cmdType.CrashDetection:
                        cmd = 'setparam 11400:' + params.priority;
                        cmd += ';11401:' + params.duration;
                        cmd += ';11402:' + params.threshold;
                        cmd += ';11406:' + params.carTrace;
                        cmd += ';7037:' + params.phoneNo;
                        cmd += ';8037:' + params.sms;
                        break;
                    case cmdType.ExcessiveIdlingDetection:
                        cmd = 'setparam 11200:' + params.priority;
                        cmd += ';11203:' + params.evRec;
                        cmd += ';11205:' + params.stopTout;
                        cmd += ';11206:' + params.moveTout;
                        cmd += ';11204:' + params.outputCtl;
                        cmd += ';11201:' + params.p1;
                        cmd += ';11202:' + params.p2;
                        cmd += ';7033:' + params.phoneNo;
                        cmd += ';8033:' + params.sms;
                        break;
                    case cmdType.CanParam:
                        cmd = 'setparam 40100:' + params.p1;
                        cmd += ';40110:' + params.p2;
                        cmd += ';40120:' + params.p3;
                        cmd += ';40130:' + params.p4;
                        cmd += ';40140:' + params.p5;
                        cmd += ';40150:' + params.p6;
                        cmd += ';40160:' + params.p7;
                        cmd += ';40170:' + params.p8;
                        cmd += ';40180:' + params.p9;
                        cmd += ';40190:' + params.p10;
                        cmd += ';40200:' + params.p11;
                        cmd += ';40210:' + params.p12;
                        cmd += ';40220:' + params.p13;
                        cmd += ';40230:' + params.p14;
                        cmd += ';40240:' + params.p15;
                        cmd += ';40250:' + params.p16;
                        cmd += ';40260:' + params.p17;
                        cmd += ';40270:' + params.p18;
                        cmd += ';40280:' + params.p19;
                        cmd += ';40290:' + params.p20;
                        cmd += ';40300:' + params.p21;
                        cmd += ';40310:' + params.p22;
                        cmd += ';40320:' + params.p23;
                        cmd += ';40330:' + params.p24;
                        cmd += ';40340:' + params.p25;
                        cmd += ';40350:' + params.p26;
                        cmd += ';40360:' + params.p27;
                        cmd += ';40370:' + params.p28;
                        cmd += ';40380:' + params.p29;
                        cmd += ';40390:' + params.p30;
                        cmd += ';40400:' + params.p31;
                        break;
                    case cmdType.ToggleCanControlToOpenUnlockAllDoors:
                        cmd = 'Lvcanopenalldoors';
                        break;
                    case cmdType.ToggleCanControlToOpenUnlockTrunk:
                        cmd = 'Lvcanopentrunk';
                        break;
                    case cmdType.ToggleCanControlToBlockEngine:
                        cmd = 'Lvcanblockengine';
                        break;
                    case cmdType.LVCANSetup:
                        cmd = 'setparam 45000:' + params.p1;
                        cmd += ';45001:' + params.p2;
                        cmd += ';45002:' + params.p3;
                        break;
                    case cmdType.ToggleCanControlToCloselockAllDoors:
                        cmd = 'Lvcanclosealldoors';
                        break;
                    case cmdType.ToggleCanControlToFlashLights:
                        cmd = 'Lvcanturninglights';
                        break;
                    case cmdType.ToggleCanControlToUnblockEngine:
                        cmd = 'Lvcanunblockengine';
                        break;
                    case cmdType.BluetoothWorkMode:
                        cmd = 'setparam 800:' + params.setting;
                        cmd += ';801:' + params.lname;
                        cmd += ';802:' + params.pin;
                        cmd += ';083:' + params.mode;
                        break;
                    case cmdType.BLEcommonSetting:
                        cmd = 'setparam 800:' + params.p1;
                        cmd += ';801:' + params.p2;
                        cmd += ';802:' + params.p3;
                        cmd += ';803:' + params.p4;
                        break;
                    case cmdType.AutoConnectToExternalDevice:   
                        cmd = 'setparam 807:' + params.mode;
                        cmd += ';804:' + params.mac;
                        cmd += ';805:' + params.name;
                        cmd += ';806:' + params.pin;
                        break;
                    case cmdType.AuthorizedBeaconsList:
                        cmd = 'setparam 1600:' + params.p1;
                        cmd += ';1601:' + params.p2;
                        cmd += ';1602:' + params.p3;
                        cmd += ';1603:' + params.p4;
                        cmd += ';1604:' + params.p5;
                        cmd += ';1605:' + params.p6;
                        cmd += ';1606:' + params.p7;
                        cmd += ';1607:' + params.p8;
                        cmd += ';1608:' + params.p9;
                        cmd += ';1609:' + params.p10;
                        cmd += ';1610:' + params.p11;
                        cmd += ';1611:' + params.p12;
                        cmd += ';1612:' + params.p13;
                        cmd += ';1613:' + params.p14;
                        cmd += ';1614:' + params.p15;
                        cmd += ';1615:' + params.p16;
                        cmd += ';1616:' + params.p17;
                        cmd += ';1617:' + params.p18;
                        cmd += ';1618:' + params.p19;
                        cmd += ';1619:' + params.p20;
                        cmd += ';1620:' + params.p21;
                        cmd += ';1621:' + params.p22;
                        cmd += ';1622:' + params.p23;
                        cmd += ';1623:' + params.p24;
                        cmd += ';1624:' + params.p25;
                        break;
                    case cmdType.BeaconSettings:
                        cmd = 'setparam 134:' + params.detection;
                        cmd += ';136:' + params.record;
                        cmd += ';137:' + params.host;
                        cmd += ';139:' + params.port;
                        break;
                    case cmdType.ReqGPSDataTime:
                        cmd = '';
                        break;
                    case cmdType.FormatSDcard:
                        cmd = 'sdformat';
                        break;
                    case cmdType.RestartDev:
                        if(vehi.deviceType === "Teltonika") {
                            cmd = 'cpureset';
                        } else {
                            cmd = 'Reset';
                        }
                        break;
                    case cmdType.ConnectToFotaWeb:
                        cmd = 'web_connect';
                        break;
                    case cmdType.ForceDevToGenReport:
                        cmd = 'getrecord';
                        break;
                    case cmdType.GetimeiccidCmd:
                        cmd = '';
                        break;
                    case cmdType.NetworkMode:
                        cmd = 'setparam 2100:0';
                        break;
                    case cmdType.LoTNetworkMode:
                        cmd = 'setparam 2101:2';
                        break;
                    case cmdType.BandSelectionMode:
                        cmd = 'setparam 2102:0';
                        break;
                    default:
                        break;
                }

                let result = await saveToDB(devImei, type, cmd);
                if(result) {
                    res.status(200).send("Command Successfully Queued")
                } else {
                    res.status(401).send("Something went wrong")
                }
            } else {
                res.status(401).send("Params wrong!!!")
            }

        } catch (err) {
            res.status(401).send({msg: "Error occured.", err: err});
        }
    }

    const showCmd = async (req, res) => {
        const { devImei } = req.body;
        console.log(devImei)
        try {
            const cmds = await commandSchema.find({deviceImei: devImei})
            res.status(200).json({msg: "Success", result: cmds})
        } catch (err) {
            console.log(err)
            res.status(400).json({msg: "Error occured.", err: err})
        }
    }

    return {
        sendCmd,
        showCmd
    }
}