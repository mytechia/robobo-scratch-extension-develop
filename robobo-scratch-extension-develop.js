/*******************************************************************************
 * Copyright 2016 Mytech Ingenieria Aplicada <http://www.mytechia.com>
 * Copyright 2016 Luis Llamas <luis.llamas@mytechia.com>
 * Copyright 2016 Gervasio Varela <gervasio.varela@mytechia.com>
 * <p>
 * This file is part of Robobo Scratch Extension.
 * <p>
 * Robobo Scratch Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * <p>
 * Robobo Scratch Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License
 * along with Robobo Scratch Extension.  If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/

//Scratch extension for the Robobo education robot - Version 0.9.1-dev
(function(ext) {

    var rem; //remote connection to the robot
    var monitorWindow;
    var roboboMonitorIp;

    var commandid = 0;

    //event toggles
    var newcolor = false;
    var newface = false;
    var lostface = false;
    var error = false;
    var voice = false;
    var newNote = false;

    //status of the remote connection
    var connectionStatus = 1;


    var lastIrChange = "";
    var lastFall = "";
    var lastGap = "";
    var lowbattery = false;
    var lowobobattery = false;
    var tap = false;
    var clap = false;
    var brightnessChange = false;
    var fling = false;
    var accelchange = false;
    var obstacle = false;
    var clapnumber = 0;
    var lastphrase = '';

    var blockCallback = undefined;

    //load required libraries
    $.getScript("https://mytechia.github.io/robobo-scratch-extension-develop/remote-library/remotelib-develop.js", function(){});
    $.getScript("https://mytechia.github.io/robobo-scratch-extension-develop/utilities.js", function(){});


    //Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    //Status depends con connetion to the robot
    ext._getStatus = function() {
      switch (connectionStatus) {
        case 0:
          return {status: 0, msg: 'Error'};
        case 1:
          return {status: 1, msg: 'Device not connected'};
        case 2:
          return {status: 2, msg: 'Device connected'};
      }
    }


    //CALLBACKS TO RECEIVE ROBOT STATUS

    //Callback for color
    ext.onNewColor = function () {
      newcolor = true;
    }
    //Callback for ir changes
    ext.onIrChanged = function (ir) {
      lastIrChange = ir;
    }
    //Callback for falls
    ext.onFall = function (fall) {
      lastFall = fall;
    }
    //Callback for gaps
    ext.onGap = function (gap) {
      lastGap = gap;
    }
    //Callback for faces
    ext.onNewFace = function () {
      newface = true;
    }
    //Callback for faces
    ext.onFaceLost = function () {
      lostface = true;
    }
    //Callback for low battery level on the rob
    ext.onLowBatt = function () {
      lowbattery = true;
    }
    //Callback for low battery level on the obo
    ext.onLowOboBatt = function () {
      lowobobattery = true;
    }
    //Callback for taps
    ext.onNewTap = function () {
      tap = true;
    }
    //Callback for flings
    ext.onNewFling = function () {
      fling = true;
    }
    //Callback for taps
    ext.onNewClap = function () {
      clap = true;
      clapnumber = clapnumber + 1;
    }
    //Callback for brightness
    ext.onBrightnessChanged = function () {
      brightnessChange = true;
    }

    //Callback for acceleration
    ext.onAccelChanged = function () {
      accelchange = true;
    }

    //Callback for acceleration
    ext.onObstacle = function () {
      obstacle = true;

    }

    //Callback for musical notes
    ext.onNewNote = function () {
      newNote= true;

    }

    //Callback for errors
    ext.onError = function () {
      error = true;
    }

    //Callback for connection status
    ext.onConnectionChanges = function (status) {
      connectionStatus = status;

      if (connectionStatus == 0) {//error
        //alert("Error connecting with Robobo!");
        disconnectMonitor();
      }else if (connectionStatus == 1) {//disconected
//        alert("Robobo has been disconected!");
        disconnectMonitor();
      }else {
        reconnectMonitor();
      }
      //else --> connection succesfull

    }



    //BLOCKs FUNCTIONS

    //CONNECTION BLOCKS
    //BLOCK - Connection to robot
    ext.connectToRobobo = function(ip) {
        if (rem != undefined){
          console.log("Closing previous connection");
          rem.closeConnection(true);

        }
        rem = new Remote(ip,'');
        this.started = false;

        rem.connect();
        rem.registerCallback("onNewColor",ext.onNewColor);
        rem.registerCallback("onIrChanged",ext.onIrChanged);
        rem.registerCallback("onNewFace",ext.onNewFace);
        rem.registerCallback("onLostFace",ext.onFaceLost);
        rem.registerCallback("onFall",ext.onFall);
        rem.registerCallback("onGap",ext.onGap);
        rem.registerCallback("onLowBatt",ext.onLowBatt);
        rem.registerCallback("onLowOboBatt",ext.onLowOboBatt);
        rem.registerCallback("onNewTap",ext.onNewTap);
        rem.registerCallback("onNewClap",ext.onNewClap);
        rem.registerCallback("onBrightnessChanged",ext.onBrightnessChanged);
        rem.registerCallback("onNewFling",ext.onNewFling);
        rem.registerCallback("onAccelChanged", ext.onAccelChanged);
        rem.registerCallback("onObstacle", ext.onObstacle);
        rem.registerCallback("onError", ext.onError);
        rem.registerCallback("onPhrase", ext.onVoice);
        rem.registerCallback("onConnectionChanges", ext.onConnectionChanges);
        rem.registerCallback("onNewNote", ext.onNewNote);


        rem.waitForConnection();

        roboboMonitorIp = ip;
        connectMonitor();

    };

    //BLOCK - Close connection
    ext.disconnect = function () {
      rem.closeConnection(false);
      closeMonitor();
    };


    //BASE ACTUATION BLOCKS

    //BLOCK - Stop --> Emergency stop
    ext.stopFun = function (what) {
        if (what == 'all'){
        rem.moveWheelsSeparated(10,10,0);
        ext.movePanRoboboT(180,0);
        ext.moveTiltRoboboT(90,0);
      }else if (what == 'wheels') {
        rem.moveWheelsSeparated(10,10,0);
      }else if (what == 'pan') {
        ext.movePanRoboboT(180,0);
      }else if (what == 'tilt') {
        ext.moveTiltRoboboT(90,0);
      }
    };

    //BLOCK - Move wheels at speed
    ext.newMovementT = function(rSpeed,lSpeed,quantity,mode,callback){
      if (mode == 'non-stop'){
        rem.moveWheelsSeparated(lSpeed,rSpeed,2147483647); //TODO -> use rem.motorsOn
        callback();
      }else if (mode=='seconds') {
        rem.moveWheelsSeparatedWait(lSpeed,rSpeed,quantity,callback);
      }else if (mode=='degrees') {
        callback();
      }else if (mode=='centimeters') {
        callback();
      }
    };


    //BLOCK - Move pan --> Pan movement function (absolute)
    ext.movePanRoboboNew = function(degrees, speed, block, callback){
      if (block=="blocking"){
        rem.movePanWait(degrees,speed,callback);

      }else{
        rem.movePan(degrees,speed);
        callback();
      }
    };


    //BLOCK - Move tilt --> Tilt movement function (absolute)
    ext.moveTiltRoboboNew = function(degrees,speed, block, callback){
      if (block=="blocking"){
        rem.moveTiltWait(degrees,speed,callback);
      }else{
        rem.moveTilt(degrees,speed);
        callback();
      }
    };


    //BLOCK - Set led color --> Function to change the led color
    ext.setLedColor = function(led,color){
      rem.setLedColor(led, color);
    };



    //BASE SENSING BLOCKS

    //BLOCK - Reset sensor
    ext.resetSensor = function(sensor) {
      //  sensors: [''obstacles','pan','orientation','tap','tilt'],
      if (sensor == 'all'){
        lastIrChange = "";
        lastFall = "";
        lastGap = "";
        lowbattery = false;
        lowobobattery = false;
        tap = false;
        clap = false;
        brightnessChange = false;
        fling = false;
        accelchange = false;
        obstacle = false;
        clapnumber = 0;
        lastphrase = '';
        ext.obstacle = false;

        rem.resetSensors();

      }else if (sensor == 'brightness') {
        brightnessChange = false;

      }else if (sensor == 'claps') {
        clapnumber = 0;

      }else if (sensor == 'face') {
        rem.resetFaceSensor();

      }else if (sensor == 'fling') {
        rem.resetFlingSensor();

      }else if (sensor == 'pan') {
      }else if (sensor == 'tilt') {

      }else if (sensor == 'orientation') {
        rem.resetOrientationSensor();

      }else if (sensor == 'tap') {
        rem.resetTapSensor();

      }else if (sensor == 'acceleration') {
        rem.resetAccelerationSensor();
      }else if (sensor == "IR"){
        rem.resetIRs();
      }else if (sensor == "blob") {
        rem.resetBlobSensor();
      }else if (sensor == "note") {
        rem.resetNoteSensor();
      }


    };

    //BLOCK - Read wheel
    ext.readWheel = function(wheel,type){
      return rem.getWheel(wheel,type);
    }

    //BLOCK - Read pan
    ext.readPan = function () {
      var value = 0;
      value = rem.getPan()
      return value;
    };

    //BLOCK - Read tilt
    ext.readTilt = function () {
      var value = 0;
      value = rem.getTilt();
      return value;
    };

    //BLOCK - raw value at sensor --> Reads IR value
    ext.readObstacle = function (ir) {
      var value = 0;
      value = rem.getObstacle(ir);
      return value;
    };

    //BLOCK - Base battery level --> Reporter function to get the ROB battery level
    ext.readBatteryLevel = function () {
      var value = 0;
      value = rem.checkBatt();
      return value;
    };




    //SMARTPHONE ACTUATION BLOCKS

    //BLOCK - Set emotion --> Function  to change the displayed emotion
    ext.changeEmotion = function(emotion){
      rem.changeEmotion(emotion);
    };

    //BLOCK - Say
    ext.talkRobobo = function(text, callback){
      rem.talk(text, callback);

    };

    //BLOCK - Play sound
    ext.playSound = function (sound) {
      rem.playEmotionSound(sound);
    };


    //BLOCK - Play note
    ext.playNote = function(note, time, callback){

      tt = Math.round(time*1000);

      if (tt >= 50 && tt <=5000) { //do not accept more than 5 seconds or less than 50ms

        rem.playNote(note, Math.round(time*1000))
        window.setTimeout(function() {
                  callback();
              }, Math.round((time*1000)-50));
      }
    }


    //SMARTPHONE SENSING BLOCKS

    //BLOCK - Smarpthone battery level --> Reporter function to get the OBO battery level
    ext.readOboBatteryLevel = function () {
      var value = 0;
      value = rem.checkOboBatt();
      return value;
    };

    //BLOCK - Face positoin at --> Reporter function to get the detected face coordinates
    ext.readFaceCoord = function (axis) {
      var value = 0;
      value = rem.getFaceCoord(axis);
      return value;
    };

    //BLOCK - Face distance --> Reporter function to get the detected face distance
    ext.readFaceDist= function () {
      var value = 0;
      value = rem.getFaceDist();
      return value;
    };

    //BLOCK - Brightness --> Reporter function to get the ROB battery level
    ext.readBrightnessLevel = function () {
      var value = 0;
      value = rem.getBrightness();
      return value;
    };

    //BLOCK - When face is detected --> Hat function that checks for new faces
    ext.newFaceFun = function() {
      if (newface){
        newface = false;
        return true;
      }else {
        return false;
      }
    };

    //BLOCK - When face is lost --> Hat function that checks for new facesd
    ext.lostFace = function() {
      if (lostface){
        lostface = false;
        return true;
      }else {
        return false;
      }
    };

    //BLOCK - Clap counter
    ext.readClap = function () {
      var value = 0;
      value = clapnumber;
      return value;
    };

    //BLOCK - When note detected
    ext.newNoteFun = function() {
      if (newNote){
        newNote = false;
        return true;
      }else {
        return false;
      }
    };

    //BLOCK - Last note
    ext.readLastNote = function(){
      return rem.getLastNote();
    }

    //BLOCK - Blob position at
    ext.readBlobCoord = function(color, axis){
      return rem.getBlobCoord(color,axis);
    }

    //BLOCK - Blob area
    ext.readBlobSize = function(color){
      return rem.getBlobSize(color);
    }

    //BLOCK - Active blob colors
    ext.configBlob = function(r,g,b,c){
      rem.configureBlobDetection(r,g,b,c);
    }

    //BLOCK - Fling angle
    ext.readFlingAngle = function () {
      return rem.checkFlingAngle();
    };

    //BLOCK - Tap position at...
    ext.readTapCoord = function (axis) {
      var value = 0;
      value = rem.getTapCoord(axis);
      return value;
    };

    //BLOCK - Tap zone
    ext.readTapZone = function () {
      var value = 0;
      value = coordsToZone(rem.getTapCoord("x"),rem.getTapCoord("y"));
      return value;
    };

    //BLOCK - Orientation at ...
    ext.readOrientation = function (axis) {
      var value = 0;
      value = rem.getOrientation(axis);
      return value;
    };

    //BLOCK - Acceleration at ...
    ext.readAcceleration = function (axis) {
      var value = 0;
      value = rem.getAcceleration(axis);
      return value;
    };



    //AUXILIARY FUNCTIONS

    //Pan movement function (absolute)
    ext.movePanRoboboT = function(degrees, speed){
      rem.movePan(degrees,speed);
    };

    //Pan movement function (relative)
    ext.movePanRoboboDegree =function (degrees,speed) {
      rem.movePanByDegrees(degrees,speed);
    };

    //Tilt movement function (absolute)
    ext.moveTiltRobobo = function(degrees,speed){
      rem.moveTilt(degrees,speed);
    };

    //Tilt movement function (relative)
    ext.moveTiltRoboboDegree =function (degrees,speed) {
      rem.moveTiltByDegrees(degrees,speed);
    };


    //Function to turn on and off the leds
    ext.changeLedStatus = function(led,status){
      rem.setLedColor(led,status);
    };

    //Movement function to rotate on the place
    ext.turnInPlace = function(degrees) {
      rem.turnInPlace(degrees);
    };

    //Hat function that checks for new colors
    ext.newCol = function() {
      if (newcolor){
        newcolor = false;
        return true;
      }else {
        return false;
      }
    };


    //Hat function that checks for ir changes
    ext.changedIr = function(irname) {
      irname = irSensorToIndex(irname);
      if (lastIrChange == irname){
        return true;
      }else {
        lastIrChange = "";
        return false;
      }
    };

    //Reporter function to get the ir values
    ext.readIrValue = function(ir) {
      var value = 0;
      value = rem.getIRValue(ir);
      return value;
    };


    //Hat function that checks ROB the battery
    ext.lowBatt = function() {
      if (lowbattery){
        return true;
      }else {
        return false;
      }
    };

    //Hat function that checks the OBO battery
    ext.lowOboBatt = function() {
      if (lowobobattery){
        return true;
      }else {
        return false;
      }
    };

    //Hat function that checks taps
    ext.newTap = function() {
      if (tap==true){
        tap = false
        return true;
      }else {
        return false;
      }
    };

    //Hat function that checks taps
    ext.newFling = function() {
      if (fling==true){
        fling = false
        return true;
      }else {
        return false;
      }
    };


    //Hat function that checks taps
    ext.newClap = function() {
      if (clap==true){
        clap = false
        return true;
      }else {
        return false;
      }
    };

    //Hat function that checks acceleration changes
    ext.newAcceleration = function() {
      if (accelchange==true){
        accelchange = false
        return true;
      }else {
        return false;
      }
    };


    //Hat function that tracks brightness changes
    ext.changedBrightness = function() {
      if (brightnessChange){
        brightnessChange = false;
        return true;
      }else {
        return false;
      }
    };

    //Hat function that tracks obstacles
    ext.detectedObstacle = function() {
      if (obstacle){
        obstacle = false;
        return true;
      }else {
        return false;
      }
    };


    ext.setMotorsOn = function (lmotor, rmotor, speed) {
      rem.motorsOn(lmotor,rmotor, speed);
    };


    ext.resetClap = function () {
      clapnumber = 0;
    };

    //Hat function that checks for errors
    ext.errorFun = function() {
      if (error){
        error = false;
        return true;
      }else {
        return false;
      }
    };

    ext.readErrorFun = function () {
      var value = 0;
      value = ext.getError();
      return value;
    };


    ext.blockFun = function(callback){
      ext.blockCallback = callback;

    };

    ext.unblockFun = function() {
      ext.blockCallback();

    };


    //Dummy function for section BLOCKs
    ext.dummyFun = function () {
      return false;
    };


    // MONITOR WINDOW BEHAVIOR



    function openMonitorWindow() {
      //opens the monitor window
      var height= window.outerHeight;
      var width = 300
      var left = window.outerWidth - width;
      var options = "location=0, width="+width+",height="+height+", top=0, left ="+left
      monitorWindow = window.open("http://firmware.theroboboproject.com/monitor/robobo-monitor.html?ip="+roboboMonitorIp, "_blank",options);
    }

    function disconnectMonitor() {
      if (monitorWindow!= undefined) {
        monitorWindow.location.replace("http://firmware.theroboboproject.com/monitor/robobo-monitor.html?ip="+roboboMonitorIp+"&state=disconnected");
        monitorWindow.location.reload();
      }

    }

    function reconnectMonitor() {
      if (monitorWindow!= undefined) {
        monitorWindow.location.replace("http://firmware.theroboboproject.com/monitor/robobo-monitor.html?ip="+roboboMonitorIp);
        monitorWindow.location.reload();
      }
    }

    function connectMonitor(ip) {
       if (monitorWindow == undefined) {
          openMonitorWindow(ip);
       }else {
         reconnectMonitor();
       }
    }

    function closeMonitor() {
       monitorWindow.close();
    }


    // BLOCK AND MENU DESCRIPTIONS
    var descriptor = {
        blocks: [

          //SECTION - CONNECTION BLOCKS
          ['h', 'CONNECTION BLOCKS','dummyFun'],

          [' ', 'connect to ROBOBO at %s ','connectToRobobo','192.168.0.110'],
          [' ', 'end connection','disconnect'],



          //SECTION - ROBOBO BASE ACTUATION BLOCKS
          ['h', 'BASE ACTUATION BLOCKS','dummyFun'],

          [' ', 'stop %m.stop motors','stopFun','all'],
          ['w', 'move wheels at speed R %s L %s for %s %m.mtype','newMovementT','30','30','1','seconds'],
          ['w', 'move pan to %s at speed %s %m.block','movePanRoboboNew','180','15','blocking'],
          ['w', 'move tilt to %s at speed %s %m.block','moveTiltRoboboNew','90','15','blocking'],

          [' ', 'set led %m.leds color to %m.colors','setLedColor','all','blue'],



          //SECTION - ROBOBO BASE SENSING BLOCKS
          ['h', 'BASE SENSING BLOCKS','dummyFun'],

          [' ', 'reset sensor %m.sensors','resetSensor','all'],

          ['r', '%m.individualwheel wheel %m.wheelmenu','readWheel','right','position'],

          ['r', 'pan position','readPan'],
          ['r', 'tilt position','readTilt'],

          //['r', 'distance at sensor %m.ir','readObstacle','Front-C'], --> not visible until calibration is ready
          ['r', 'raw value at sensor %m.ir','readObstacle','Front-C'],

          ['r', 'base battery level','readBatteryLevel'],



          //SECTION - SMARTPHONE ACTUATION BLOCKS
          ['h', 'SMARTPHONE ACTUATION BLOCKS','dummyFun'],

          [' ', 'set emotion to %m.emotions','changeEmotion','normal'],

          ['w', 'say %s','talkRobobo','hello world'],

          [' ', 'play %m.sounds sound','playSound', 'moan'],
          ['w', 'play note %d.note for %n seconds', 'playNote', 60, 0.5],



          //SECTION - SMARTPHONE SENSING BLOCKS SECTION
          ['h', 'SMARPTHONE SENSING BLOCKS','dummyFun'],

          ['r', 'face distance','readFaceDist'],
          ['r', 'face position at %m.axis axis','readFaceCoord','x'],
          ['h', 'when face is detected','newFaceFun'],
          ['h', 'when face is lost','lostFace'],

          ['r', 'clap counter','readClap'],

          ['h', 'when note detected','newNoteFun'],
          ['r', 'last note','readLastNote'],

          ['r', '%m.blobcolor blob position at %m.axis axis','readBlobCoord','green','x'],
          ['r', '%m.blobcolor blob area','readBlobSize','green'],
          [' ', 'active blob colors R:%m.boolean G:%m.boolean B:%m.boolean C:%m.boolean','configBlob','false','true','false','false'],

          ['r', 'fling angle','readFlingAngle'],

          ['r', 'tap position at %m.axis axis','readTapCoord','x'],
          ['r', 'tap zone','readTapZone'],

          ['r', 'orientation at %m.orientation axis','readOrientation','yaw'],
          ['r', 'acceleration at %m.axis3d axis','readAcceleration','x'],

          ['r', 'brightness','readBrightnessLevel'],

          ['r', 'smarpthone battery level','readOboBatteryLevel'],


          //deprecated blocks
          //['r', 'read error','readErrorFun'],//v
          //['h', 'on error','errorFun'],//v


        ],
        menus: {
          motorDirection: ['forward', 'backward'],
          motorDirectionBis: ['forward', 'backward','off'],
          wheels: ['right', 'left','both'],
          individualwheel: ['right', 'left'],
          mtype: ['non-stop','seconds'],
          orientation: ['yaw','pitch','roll'],
          emotions: ['happy','laughting','sad','angry','surprised','normal'],
          colors: ['off','white','red','blue','cyan','magenta','yellow','green','orange'],
          status: ['on','off'],
          leds: ['Front-C','Front-L','Front-LL','Front-R','Front-RR','Back-L','Back-R','all'],
          ir: ['Front-C','Front-L','Front-LL','Front-R','Front-RR','Back-C','Back-L','Back-R'],
          falls: ['Fall FL','Fall FR','Fall BL','Fall FL'],
          gaps: ['Gap FL','Gap FR','Gap BL','Gap BR'],
          axis: ['x','y'],
          axis3d: ['x','y','z'],
          sounds: ['moan','purr',"angry","approve","disapprove","discomfort","doubtful","laugh","likes","mumble","ouch","thinking","various"],
          colorchan: ['red','green','blue'],
          sensors: ['all','acceleration','blob','brighness','claps','face','fling','IR','note','pan','orientation','tap','tilt'],
          block: ['blocking','non-blocking'],
          range: ['between', 'out'],
          stop: ['all','wheels','pan','tilt'],
          blobcolor: ['red','green','blue','custom'],
          boolean: ['true','false'],
          wheelmenu: ['position','speed']
        },
    };

    // Register the extension
    ScratchExtensions.register('Robobo', descriptor, ext);
})({});
