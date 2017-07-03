
/*******************************************************************************
 * Copyright 2016 Mytech Ingenieria Aplicada <http://www.mytechia.com>
 * Copyright 2016 Luis Llamas <luis.llamas@mytechia.com>
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
//Scratch extension version 0.2.1-dev
(function(ext) {
    var rem;
    var commandid = 0;
    var newcolor = false;
    var newface = false;
    var lostface = false;
    var error = false;
    var voice = false;
    var newNote = false;

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

    $.getScript("https://mytechia.github.io/robobo-scratch-extension/remote-library/remotelib-develop.js", function(){});
    $.getScript("https://mytechia.github.io/robobo-scratch-extension/utilities.js", function(){});


    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    /*ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };*/

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
    ext.onNewNote = function () {
      newNote= true;

    }

    ext.onError = function () {
      error = true;
    }

    ext.onVoice = function (text) {
      console.log('onVoice');
      voice = true;
      lastphrase = text;
    }

    ext.onConnectionChanges = function (status) {
      connectionStatus = status;
    }
    //Connection Block
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

    };

    //Close connection
    ext.disconnect = function () {
      rem.closeConnection(false);

    };

    //Speech production function
    ext.talkRobobo = function(text, callback){
        rem.talk(text, callback);

    };


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

    //Movement function
    ext.moveRobobo = function(wheel,quantity,mtype,speed){

      if (mtype=='degrees'){
        console.log('moveRobobo by '+mtype);
        rem.moveWheelsByDegree(wheel,quantity,speed);
      }else if (mtype=='seconds') {
        console.log('moveRobobo by '+mtype);
        rem.moveWheelsByTime(wheel,quantity,speed);
      }else if (mtype=='centimeters'){
        //TODO RELLENAR ESTO
      }

    };



    //Two wheels movement function
    ext.moveRoboboWheels = function(lSpeed,rSpeed,time){
      rem.moveWheelsSeparated(lSpeed,rSpeed,time);
    };

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

    //Function  to change the displayed emotion
    ext.changeEmotion = function(emotion){
      rem.changeEmotion(emotion);
    };

    //Function to change the led color
    ext.setLedColor = function(led,color){
      rem.setLedColor(led, color);
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

    //Reporter function to get the last detected color
    ext.readCol = function() {
      var value = 0;
      value =rem.getColor();
      console.log("Value: "+value);
      return value;
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
      value = rem.mirarIr(ir);
      return value;
    };

    //Reporter function to get the ROB battery level
    ext.readBatteryLevel = function () {
      var value = 0;
      value = rem.checkBatt();
      return value;
    };

    //Reporter function to get the OBO battery level
    ext.readOboBatteryLevel = function () {
      var value = 0;
      value = rem.checkOboBatt();
      return value;
    };

    //Reporter function to get the detected face coordinates
    ext.readFaceCoord = function (axis) {
      var value = 0;
      value = rem.getFaceCoord(axis);
      return value;
    };

    //Reporter function to get the detected face distance
    ext.readFaceDist= function () {
      var value = 0;
      value = rem.getFaceDist();
      return value;
    };

    //Reporter function to get the ROB battery level
    ext.readBrightnessLevel = function () {
      var value = 0;
      value = rem.getBrightness();
      return value;
    };



    //Hat function that checks for new facesd
    ext.lostFace = function() {
      if (lostface){
        lostface = false;
        return true;
      }else {
        return false;
      }
    };


    //Hat function that checks falls
    ext.changedFalls= function(fallpos) {
      if (fallpos == lastFall){
        return true;
      }else {
        lastFall = "";
        return false;
      }
    };

    //Hat function that checks for new faces
    ext.newFaceFun = function() {
      if (newface){
        newface = false;
        return true;
      }else {
        return false;
      }
    };
    //Hat function that checks gaps
    ext.changedGaps= function(gappos) {
      if (gappos == lastGap){
        return true;
      }else {
        lastGap = "";
        return false;
      }
    };


    //Reporter function that checks falls
    ext.readFall = function (fall) {
      return rem.checkFall(fall);
    };

    //Reporter function that checks falls
    ext.readFlingAngle = function () {
      return rem.checkFlingAngle();
    };

    //Reporter function that checks gaps
    ext.readGap = function (gap) {
      return rem.checkFall(gap);
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


    //Reporter function to get the detected face coordinates
    ext.readTapCoord = function (axis) {
      var value = 0;
      value = rem.getTapCoord(axis);
      return value;
    };

    //Reporter function to get the detected face zone
    ext.readTapZone = function () {
      var value = 0;
      value = coordsToZone(rem.getTapCoord("x"),rem.getTapCoord("y"));
      return value;
    };

    //Reporter function to get the orientation in one axis
    ext.readOrientation = function (axis) {
      var value = 0;
      value = rem.getOrientation(axis);
      return value;
    };
    //Reporter function to get the orientation in one axis
    ext.readAcceleration = function (axis) {
      var value = 0;
      value = rem.getAcceleration(axis);
      return value;
    };



    //Reporter function to get the orientation in one axis
    ext.readObstacle = function (ir) {
      var value = 0;
      value = rem.getObstacle(ir);
      return value;
    };



    //Emergency stop
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

    ext.playSound = function (sound) {
      rem.playEmotionSound(sound);
    };


    ext.setMotorsOn = function (lmotor, rmotor, speed) {
      rem.motorsOn(lmotor,rmotor, speed);
    };


    ext.readClap = function () {
      var value = 0;
      value = clapnumber;
      return value;
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

    ext.readPhrase = function () {

      return lastphrase;
    };

    ext.resetPhrase = function () {

      lastphrase = '';
    };

    ext.detectedVoice = function() {
      if (voice){
        voice = false;
        return true;
      }else {
        return false;
      }
    };


    //Reporter function to get the orientation in one axis
    ext.measureColor = function (channel) {
      var value = 0;
      value = rem.checkMeasuredColor(channel);
      return value;
    };

    //Two wheels movement function
    ext.moveRoboboWheelsWait = function(lSpeed,rSpeed,time,callback){
      rem.moveWheelsSeparated(lSpeed,rSpeed,time);
      window.setTimeout(function() {
            callback();
        }, (time*1000)-100);
    };




    ext.blockFun = function(callback){
      ext.blockCallback = callback;

    };

    ext.unblockFun = function() {
      ext.blockCallback();

    };

    ext.readPan = function () {
      var value = 0;
      value = rem.getPan()
      return value;
    };

    ext.readTilt = function () {
      var value = 0;
      value = rem.getTilt();
      return value;
    };


    //Two wheels movement function
    ext.moveRoboboWheelsWaitNew = function(lSpeed,rSpeed,time,callback){
      console.log("moveRoboboWheelsWaitNew "+lSpeed+" "+rSpeed+" "+time);
      rem.moveWheelsSeparatedWait(lSpeed,rSpeed,time,callback);

    };

    ext.oldMovement = function(rSpeed,lSpeed,quantity,mode,callback){
      if (mode == 'non-stop'){
        rem.moveWheelsSeparated(rSpeed,lSpeed,2147483647)
        callback();
      }else if (mode=='seconds') {
        rem.moveWheelsSeparated(lSpeed,rSpeed,quantity);
        window.setTimeout(function() {
              callback();
          }, (quantity*1000)-100);
      }else if (mode=='degrees') {

      }else if (mode=='centimeters') {

      }
    };


    ext.newMovementT = function(rSpeed,lSpeed,quantity,mode,callback){
      if (mode == 'non-stop'){
        rem.moveWheelsSeparated(lSpeed,rSpeed,2147483647);
        callback();
      }else if (mode=='seconds') {
        rem.moveWheelsSeparatedWait(lSpeed,rSpeed,quantity,callback);
      }else if (mode=='degrees') {
        callback();
      }else if (mode=='centimeters') {
        callback();
      }
    };



    //Pan movement function (absolute)
    ext.movePanRoboboNew = function(degrees, speed, block, callback){
      if (block=="blocking"){
        rem.movePanWait(degrees,speed,callback);

      }else{
        rem.movePan(degrees,speed);
        callback();
      }
    };

    //Tilt movement function (absolute)
    ext.moveTiltRoboboNew = function(degrees,speed, block, callback){
      if (block=="blocking"){
        rem.moveTiltWait(degrees,speed,callback);
      }else{
        rem.moveTilt(degrees,speed);
        callback();
      }
    };

     //Hat function that checks for new faces
    ext.newNoteFun = function() {
      if (newNote){
        newNote = false;
        return true;
      }else {
        return false;
      }
    };



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
      rem.statusmap.set("facex",0);
      rem.statusmap.set("facey",0);
      rem.statusmap.set("facedist","far");
      rem.statusmap.set("flingangle",0);
      rem.statusmap.set('Gap1',false);
      rem.statusmap.set('Gap2',false);
      rem.statusmap.set('Gap3',false);
      rem.statusmap.set('Gap4',false);
      ext.obstacle = false;
      rem.statusmap.set("yaw",0);
      rem.statusmap.set("pitch",0);
      rem.statusmap.set("roll",0);
      rem.statusmap.set("tapx",0);
      rem.statusmap.set("tapy",0);
      rem.statusmap.set("xaccel",0);
      rem.statusmap.set("yaccel",0);
      rem.statusmap.set("zaccel",0);

    }else if (sensor == 'brightness') {
      brightnessChange = false;

    }else if (sensor == 'claps') {
      clapnumber = 0;

    }else if (sensor == 'face') {
      rem.statusmap.set("facex",0);
      rem.statusmap.set("facey",0);
      rem.statusmap.set("facedist","far");

    }else if (sensor == 'fling') {
      rem.statusmap.set("flingangle",0);

    }else if (sensor == 'gaps') {
      rem.statusmap.set('Gap1',false);
      rem.statusmap.set('Gap2',false);
      rem.statusmap.set('Gap3',false);
      rem.statusmap.set('Gap4',false);


    }else if (sensor == 'obstacles') {
      obstacle = false;

    }else if (sensor == 'pan') {
    }else if (sensor == 'tilt') {

    }else if (sensor == 'orientation') {
      rem.statusmap.set("yaw",0);
      rem.statusmap.set("pitch",0);
      rem.statusmap.set("roll",0);

    }else if (sensor == 'tap') {
      rem.statusmap.set("tapx",0);
      rem.statusmap.set("tapy",0);

    }else if (sensor == 'acceleration') {
      rem.statusmap.set("xaccel",0);
      rem.statusmap.set("yaccel",0);
      rem.statusmap.set("zaccel",0);
    }


  };

  ext.dummyFun = function () {
    return false;
  };
 

  ext.readBlobCoord = function(color, axis){
    return rem.getBlobCoord(color,axis);
  }

  ext.readBlobSize = function(color){
    return rem.getBlobSize(color);
  }

  ext.readLastNote = function(){
    return rem.getLastNote();
  }

  ext.playNote = function(note, time, callback){
    rem.playNote(note, time)
    window.setTimeout(function() {
              callback();
          }, (time)-50);
    console.log('Note: '+note+' time '+time);
  }




  ext.configBlob = function(r,g,b,c){
    rem.configureBlobDetection(r,g,b,c);
  }

  ext.readWheel = function(wheel,type){
    return rem.getWheel(wheel,type);
  }


    // Block and block menu descriptions
    var descriptor = {
        blocks: [
          ['h', 'CONNECTION BLOCKS','dummyFun'],

          [' ', 'connect to ROBOBO at %s ','connectToRobobo','192.168.0.110'],
          [' ', 'end connection','disconnect'],

          ['h', 'ROB ACTUATION BLOCKS','dummyFun'],
          [' ', 'stop %m.stop motors','stopFun','all'],
          ['w', 'move wheels at speed R %s L %s for %s %m.mtype','newMovementT','30','30','1','seconds'],
          ['w', 'move pan to %s at speed %s %m.block','movePanRoboboNew','180','5','blocking'],
          ['w', 'move tilt to %s at speed %s %m.block','moveTiltRoboboNew','90','5','blocking'],

          [' ', 'set led %m.leds color to %m.colors','setLedColor','all','blue'],
          ['w', 'play note %d.note for %n seconds', 'playNote', 60, 0.5],
          ['h', 'when note detected','newNoteFun'],
          ['r', 'read last note','readLastNote'],



          ['h', 'ROB SENSING BLOCKS','dummyFun'],
          [' ','reset sensor %m.sensors','resetSensor','all'],
          [' ','Configure blob detection R:%m.boolean G:%m.boolean B:%m.boolean C:%m.boolean','configBlob','false','true','false','false'],

          ['r', 'read %m.indvidualwheel wheel %m.wheelmenu','readWheel','right','position'],//v

        //  ['r', 'pan position','readPan'],//v
        //  ['r', 'tilt position','readTilt'],//v

          ['r', 'obstacle at sensor %m.ir','readObstacle'],//v
        //  ['h', 'when obstacle is detected','detectedObstacle'],//v

          ['r', 'gap at %m.gaps','readGap','Gap1'],//v
        //  ['h', 'when gap is detected at %m.gaps','changedGaps','Gap1'],//v

          ['r', 'ROB battery level','readBatteryLevel'],//v

          ['h', 'OBO ACTUATION BLOCKS','dummyFun'],
          [' ', 'set emotion to %m.emotions','changeEmotion','normal'],
          ['w', 'say %s','talkRobobo','hello world'],
          [' ', 'play %m.sounds sound','playSound', 'moan'],

          ['h', 'OBO SENSING BLOCKS','dummyFun'],

          ['r', 'face distance','readFaceDist'],//v
          ['r', 'face position at %m.axis axis','readFaceCoord','x'],//v
          ['h', 'when face is detected','newFaceFun'],//v
          ['h', 'when face is lost','lostFace'],//v

          ['r', 'color at %m.colorchan channel','measureColor'],//v
          ['r', 'read clap counter','readClap'],//v

          ['r', 'read %m.blobcolor blob position at %m.axis axis','readBlobCoord','green','x'],//v
          ['r', 'read %m.blobcolor area','readBlobSize','green'],//v


          ['r', 'orientation at %m.orientation axis','readOrientation','yaw'],//v

          ['r', 'fling angle','readFlingAngle'],//v
          ['r', 'tap position at %m.axis axis','readTapCoord','x'],//v
          ['r', 'tap zone','readTapZone'],//v


          ['r', 'acceleration at %m.axis3d axis','readAcceleration','x'],//v

          ['r', 'brightness','readBrightnessLevel'],//v
          ['r', 'OBO battery level','readOboBatteryLevel'],//v



          //BLOCKS-TO-BE-REMOVED
  //        ['h', 'when OBO battery level is low','lowBatt'],//v
          //END BLOCKS-TO-BE-REMOVED



          //BLOCKS-TO-BE-REMOVED
//          ['h', 'when ROB battery level is low','lowBatt'],//v
          //END BLOCKS-TO-BE-REMOVED

          //BLOCKS-TO-BE-REMOVED
//          ['r', 'read error','readErrorFun'],//v
//          ['h', 'on error','errorFun'],//v



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
          sensors: ['all','acceleration','brighness','claps','face','fling','gaps','obstacles','pan','orientation','tap','tilt'],
          block: ['blocking','non-blocking'],
          range: ['between', 'out'],
          stop: ['all','wheels','pan','tilt'],
          blobcolor: ['red','green','blue','custom'],
          boolean: ['true','false'],
          wheelmenu: ['position','speed']
        },
    };


    // Register the extension
    ScratchExtensions.register('Robobo Extension v0.2.1 Lite', descriptor, ext);
})({});
