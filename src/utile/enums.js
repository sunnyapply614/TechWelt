module.exports = () => {

    const cmdStatus = {
        Queued: 'Queued',
        Sent: 'Sent',
        Faild: 'Faild'
    }

    const cmdType = {
        EngineOn: "EngineOn",
        DigitalOutput: "Digital Output",
        DigitalInput: "Digital Input", 
        BatteryLevel: "Battery Level",
        BatteryVoltage: "Battery Voltage",
        ExternalVoltage: "External Voltage",
        AnalogueInput: "Analogue Input",
        AxisX: "Axis X",
        AxisY: "Axis Y",
        AxisZ: "Axis Z",

        MotionDetection: "Motion Detection",
        SleepMode: "Sleep Mode",
        NetworkTimeProtocalServer: "Network Time Protocal Server",
        StaticNavigation: "Static Navigation",
        GnssSource: "GNSS Source",
        LedIndication: "LED Indication",
        BatteryChargeMode: "Battery charge mode",
        IgnitionDetectionSource: "Ignition Detection Source",
        AccelerometerCalibrationAndGravityFilter: "Accelerometer calibration and gravity filter",
        DataCodecToUseForDataTransmission: "Data codec to use for data transmission",
        GetverCommandResponse: "getver command response",

        RecordsParameters: "Records Parameters",
        EnableConnectionOverTLS: "Enable connection over TLS",
        FirmwareOverTheAirWebService: "Firmware Over The Air web service",
        NetworkPing: "Network Ping",
        GprsServerSetup: "GPRS Server Setup",
        GprsSetup: "GPRS Setup",
        SecondaryGprsServerSetup: "Secondary GPRS Server Setup",

        SmsReportSendingParams: "SMS report sending parameters",
        IncomingCallAction: "Incoming call action",
        PhoneNumbers: "Phone Numbers",
        SmsEventTimeZone: "SMS event Time Zone",

        HomeGsmNetwork: "Home GSM Network",
        RoamingGsmNetworkSettings: "Roaming GSM Network Setting",
        UnknownGsmNetwork: "Unknown GSM Network",
        TripScenarioParam: "Trip Scenario Parameter",
        Odometer: "Odometer",
        TrackingOnDemandMode: "Tracking on Demand Mode",
        TrackingOnDemandTiming: "Tracking on Demand Timing",

        GreenDriving: "Green Driving",
        OverSpeeding: "OverSpeeding",
        DoutControlViaIgnition: "Dout Control Via Ignition",
        IgnitionOnCounter: "Ignition ON Counter",
        JammingWithTimeoutScenario: "Jamming with timeout scenario",

        UnplugDetection: "Unplug Detection",
        CrashCounter: "Crash Counter",
        TowingDetection: "Towing Detection",
        CrashDetection: "Crash Detection",
        ExcessiveIdlingDetection: "Excessive Idling Detection",

        CanParam: "CAN Parameters",
        ToggleCanControlToOpenUnlockAllDoors: "Tolggle CAN-CONTROL to open unlock all doors",
        ToggleCanControlToOpenUnlockTrunk: "Tolggle CAN-CONTROL to open unlock trunk",
        ToggleCanControlToBlockEngine: "Toggle CAN-CONTROL to block engine",
        LVCANSetup: "LVCAN setup",
        ToggleCanControlToCloselockAllDoors: "Tolggle CAN-CONTROL to close lock all doors",
        ToggleCanControlToFlashLights: "Tolggle CAN-CONTROL to flash lights",
        ToggleCanControlToUnblockEngine: "Toggle CAN-CONTROL to unblock engine",

        BluetoothWorkMode: "Bluetooth work mode",
        BLEcommonSetting: "BLE Common Settings",
        AutoConnectToExternalDevice: "Auto Connect to external device",
        AuthorizedBeaconsList: "Authorized beacons list",
        BeaconSettings: "Beacon Settings",

        ReqGPSDataTime: "Request current GPS Date and Time",
        FormatSDcard: "Format SD card",
        RestartDev: "Restart the device",
        ConnectToFotaWeb: "Connect to Fota Web immediately",
        ForceDevToGenReport: "Force device to Generate a report",
        GetimeiccidCmd: "Send getimeiccid command",

        NetworkMode: "Network mode",
        LoTNetworkMode: "loT Network Mode",
        BandSelectionMode: "Band Seletion Mode"

    }

    return {
        cmdStatus,
        cmdType
    }
}