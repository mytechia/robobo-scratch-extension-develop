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

//Javascript remote control library for the Robobo educational robot - Version 0.9.1-dev

//Constructor of the remote control object 
function Remote(ip,passwd){
  this.ip = ip.trim();
  this.port = 40404;

  //WebSocket to stablish the connection
  this.ws = undefined;

  //Unique command id sent to the server
  this.commandid = 0;

  //Map of statuses
  this.statusmap = new Map();

  //Map of last relevant statuses, for comparations
  this.laststatusmap = new Map();

  //Map of callbacks registered by the extension
  this.callbackmap = new Map();

  //Map of blocking callbacks
  //this.blockingcallbackmap = new Map();

  //First execution mark
  this.firstime = true;

  //Connection state
  this.connectionState = Remote.ConnectionStateEnum.DISCONNECTED;

  //Connection password
  this.password = passwd;

  //Last block id
  this.lastblock = 0;

  //Wheel stop callback
  this.wheelsCallback = undefined;

  //Tilt stop callback
  this.tiltCallback = undefined;

  //Pan stop callback
  this.panCallback = undefined;

  //Speech synthesis callback
  this.talkCallback = undefined;

  //defaults and limits
  this.panSpeedLimit = 40;
  this.tiltSpeedLimit = 10;
  
  this.wheelsSpeedLimit = 250;
  
  this.panInferiorLimit = 26;
  this.panSuperiorLimit = 339;

  this.tiltInferiorLimit = 26;
  this.tiltSuperiorLimit = 109;

//END OF REMOTE OBJECT
};

//State enumarion fo the connection with the remote robot
Remote.ConnectionStateEnum = {
  CONNECTING: 0,
  CONNECTED: 1,
  RECONNECTING: 2,
  DISCONNECTED: 3
}

//Remote control implementation
Remote.prototype = {


  registerCallback: function (name,callback) {
    this.callbackmap.set(name,callback);
    //END OF REGISTERCALLBACK FUNCTION
  },

  /** Establishes connection with the remote Robobo */
  connect :function() {
    if (this.ws != undefined){
      console.log("Closing previous connection");
      this.ws.close();
      (this.callbackmap.get("onConnectionChanges"))(1);
    }

    this.connectionState = Remote.ConnectionStateEnum.CONNECTING;

    this.ws = new WebSocket("ws://"+this.ip+":"+this.port);

    this.ws.onopen = function() {
      console.log("Connection Stablished");
      (this.callbackmap.get("onConnectionChanges"))(2);
      this.sendMessage("PASSWORD: "+this.password);
      this.connectionState = Remote.ConnectionStateEnum.CONNECTED;
    }.bind(this);

    //adds the listener to process incoming messages
    this.ws.addEventListener('message', function(evt) {
      var received_msg = evt.data;
      this.handleMessage(received_msg);
    }.bind(this));

    this.ws.onclose = function(event) {
      var error = false;
      if(this.connectionState != Remote.ConnectionStateEnum.RECONNECTING){
        var reason;

          // See http://tools.ietf.org/html/rfc6455#section-7.4.1
          if (event.code == 1000)
              reason = "";
          else if(event.code == 1001)
              reason = "";
          else if(event.code == 1002)
              reason = "Protocol Error";
          else if(event.code == 1003)
              reason = "Invalid data";
          else if(event.code == 1004)
              reason = "";
          else if(event.code == 1005)
              reason = "";
          else if(event.code == 1006){
             reason = "Lost connection";
             error = true;
           }
          else if(event.code == 1007)
              reason = "";
          else if(event.code == 1008)
              reason = "";
          else if(event.code == 1009)
             reason = "";
          else if(event.code == 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
              reason = "";
          else if(event.code == 1011)
              reason = "";
          else if(event.code == 1015)
              reason = "Failure to perform a TLS handshake";
          else
              reason = "Unknown reason";
          alert('Connection closed\n'+reason);
          console.log("Code: "+event.code );
      }
      if (error){
        (this.callbackmap.get("onConnectionChanges"))(0);
      }else{
        (this.callbackmap.get("onConnectionChanges"))(1);
      }
      this.reconnecting = false;
      console.log("Connection Closed");
      this.connectionState = Remote.ConnectionStateEnum.DISCONNECTED;
    }.bind(this);

    this.ws.onerror = function(error){
      this.connectionState = Remote.ConnectionStateEnum.DISCONNECTED;
      (this.callbackmap.get("onConnectionChanges"))(0);
      alert("Websocket Error");
    }.bind(this);

  }, //ENDOF connect

  /** Waits until the connection is established */
  waitForConnection : function() {

    var startTime = new Date().getTime();
    while(true) {
      var currentTime = new Date().getTime();
      if (startTime+1000 < currentTime) {
        break;
      }
    }

  }, //ENDOF waitForConnection 

  /** Checks whether the connection is established or not */
  isConnected : function() {
    return this.connectionState == Remote.ConnectionStateEnum.CONNECTED;
  },//ENDOF isConnected

  //closeConnection - Closes the connection with the remote Robobo
  closeConnection: function(reconnect) {
    if (reconnect) {
      this.connectionState = Remote.ConnectionStateEnum.RECONNECTING;
    }
    this.ws.close();    
  }, //ENDOF closeConnection

  /** Sends a message to the remote Robobo */
  sendMessage: function(message) {
    this.commandid = this.commandid +1;
    this.ws.send(message);

    //ENDOF sendMessage
  },

  /** Notifies an error */
  fireError: function (err) {
    console.log("ERROR "+ err);
    this.statusmap.set("error",err);

    (this.callbackmap.get("onError"))();
  },//ENDOF fireError

  /** Handles and processes an incoming message from the remote Robobo */
  handleMessage: function(message) {

    var jsonmsg = JSON.parse(message)
    //console.log(typeof(jsonmsg.name) == 'string');
    if (typeof(jsonmsg.name) == 'string'){
      this.manageStatus(jsonmsg);
    }else if (typeof(jsonmsg.commandid) != "undefined") {
      this.manageResponse(jsonmsg);
    }

  },//ENDOF handleMessage


  /*********************************/
  /* ROBOT BASE FUNCTIONS *
  /*********************************/

  /** Commands the robot to move the wheel by some angle */
  moveWheelsByDegree: function(wheel,degrees,speed) {
    var message = JSON.stringify({
        "name": "MOVEBYDEGREES",
        "parameters": {
            wheel: wheel,
            degrees: degrees,
            speed:speed
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    //ENDOF moveWheelsByDegree
  },


  /** Commands the robot to move during some time */
  moveWheelsByTime: function(wheel,time,speed) {
    var message = JSON.stringify({
        "name": "MOVEBYTIME",
        "parameters": {
            wheel: wheel,
            time: time,
            speed:speed
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    //ENDOF moveWheelsByTime
  },


  /** Commands the robot to move each wheel with an idepenent speed */
  moveWheelsSeparated: function(lSpeed,rSpeed,time) {
    lS = ''+lSpeed;
    rS = ''+rSpeed;

    var message = JSON.stringify({
        "name": "MOVETWOWHEELS",
        "parameters": {
            lspeed: lS,
            rspeed: rS,
            time:time
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    
  },//ENDOF moveWheelsSeparated


  /** Commands the robot to move each wheel with an idepenent speed and waits
   * until the roboot finishes the movement */
  moveWheelsSeparatedWait: function(lSpeed,rSpeed,time,callback) {
    console.log("moveWheelsSeparatedWait "+lSpeed+" "+rSpeed+" "+time);
    lS = ''+lSpeed;
    rS = ''+rSpeed;

    this.lastblock = this.lastblock+1;
    //this.blockingcallbackmap.set(this.lastblock+"",callback);
    if (this.wheelsCallback != undefined){
      this.wheelsCallback();
    }

    this.wheelsCallback = callback;
    var message = JSON.stringify({
        "name": "TWOWHEELSBLOCKING",
        "parameters": {
            lspeed: lS,
            rspeed: rS,
            time:time,
            blockid: this.lastblock
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    
  },//ENDOF moveWheelsSeparatedWait


  /** Commands the robot to turn on the wheels motors at the specified speed, indefinitely */
  motorsOn: function(lMotor,rMotor,speed) {
    var message = JSON.stringify({
        "name": "MOTORSON",
        "parameters": {
            lmotor: lMotor,
            rmotor: rMotor,
            speed:speed
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    
  },//ENDOF motorsOn


  /** Commands the robot to turn by some degrees */
  turnInPlace: function(degrees) {
    var message = JSON.stringify({
        "name": "TURNINPLACE",
        "parameters": {
            degrees: degrees
        },
        "id": this.commandid
    });
    this.sendMessage(message);

  },//ENDOF turnInPlace


  /** Commands the robot to move the PAN to the specified position */
  movePan: function(pos, vel) {
    s = ''+ vel;
    if (pos > this.panSuperiorLimit){
      pos = this.panSuperiorLimit;
    }

    if (pos < this.panInferiorLimit){
      pos = this.panInferiorLimit;
    }
    var message = JSON.stringify({
        "name": "MOVEPAN",
        "parameters": {
            pos: pos,
            speed:s
        },
        "id": this.commandid
    });
    //if (vel > 0){
    //  this.statusmap.set("panPos",pos);
    //}
    this.sendMessage(message);
    
  }, //ENDOF movePan


  /** Commands the robot to move the PAN to the specified position 
   * and waits until the movement finishes */
  movePanWait: function(pos, vel, callback) {
    s = ''+ vel;
    if (pos > this.panSuperiorLimit){
      pos = this.panSuperiorLimit;
    }

    if (pos < this.panInferiorLimit){
      pos = this.panInferiorLimit;
    }


    this.lastblock = this.lastblock+1;
    //this.blockingcallbackmap.set(this.lastblock+"",callback);
    if (this.panCallback != undefined){
      this.panCallback();
    }
    this.panCallback = callback;

    lb = this.lastblock

    var message = JSON.stringify({
        "name": "MOVEPANBLOCKING",
        "parameters": {
            pos: pos,
            speed:s,
            blockid:lb
        },
        "id": this.commandid
    });
    //if (vel > 0){
    //  this.statusmap.set("panPos",pos);
    //}
    this.sendMessage(message);
    
  },//ENDOF movePanWait

  /** Returns the current PAN position */
  getPan:function() {
    return this.statusmap.get("panPos")
  },//ENDOF getPan

  /** Returns the current TILT position */
  getTilt:function() {
    return this.statusmap.get("tiltPos")
  },//ENDOF getTilt

  /** Commands the  robot to move the PAN by some degrees */
  movePanByDegrees: function (degrees, speed) {

    console.log("movePanByDegrees");
    var actual = this.statusmap.get("panPos");
    if (actual==undefined){
      actual = 180;
    }
    var newpos = parseInt(actual) + parseInt(degrees)
    if (newpos > 339){
      newpos = 339;
    }
    if (newpos < 27){
      newpos = 27;
    }
    console.log(newpos);

    //this.statusmap.set("panPos",parseInt(newpos));
    this.movePan(newpos, speed);
    //END OF MOVEPANBYDEGREES FUNCTION
  },


  /** Commands the robot to move the TILT to an specified position */
  moveTilt: function (pos, vel) {
    s = ''+ vel;

    var message = JSON.stringify({
        "name": "MOVETILT",
        "parameters": {
            pos: pos,
            speed:s
        },
        "id": this.commandid
    });
    //if (vel > 0){
    //  this.statusmap.set("tiltPos",parseInt(pos));
    //}
    this.sendMessage(message);
    
  },//ENDOF moveTilt


  /** Commands the robot to move the TILT to an specified position 
   * and waits until the robot ends the movement */
  moveTiltWait: function (pos, vel, callback) {
    s = ''+ vel;
    if (pos > this.tiltSuperiorLimit){
      pos = this.tiltSuperiorLimit;
    }

    if (pos < this.tiltInferiorLimit){
      pos = this.tiltInferiorLimit;
    }

    this.lastblock = this.lastblock+1;
    //this.blockingcallbackmap.set(this.lastblock+"",callback);
    if (this.tiltCallback != undefined){
      this.tiltCallback();
    }
    this.tiltCallback = callback;
    var lb = this.lastblock;
    var message = JSON.stringify({
        "name": "MOVETILTBLOCKING",
        "parameters": {
            pos: pos,
            speed:s,
            blockid:lb
        },
        "id": this.commandid
    });
    //if (vel > 0){
    //  this.statusmap.set("tiltPos",parseInt(pos));
    //}
    this.sendMessage(message);
    
  },//ENDOF moveTiltWait


  /** Commands the  robot to move the TILT by some degrees */
  moveTiltByDegrees: function (degrees, speed) {
    console.log("moveTiltByDegrees");
    var actual = this.statusmap.get("tiltPos");
    if (actual==undefined){
      actual = 90;
    }
    var newpos = parseInt(actual) + parseInt(degrees)
    if (newpos > 109){
      newpos = 109;
    }
    if (newpos < 26){
      newpos = 26;
    }
    console.log(newpos);
    //this.statusmap.set("tiltPos",newpos);
    this.moveTilt(newpos, speed);

  },//ENDOF moveTiltByDegrees
  

  /** Returns the last value detected by the infrared senseor specified by 'irnumber' */
  getIRValue : function (irnumber) {
    return this.statusmap.get("IRSensorStatus"+irnumber);
  },//ENDOF getIRValue


  /** Returns the last value detected by the infrared senseor specified by 'irnumber' */
  getObstacle : function (ir) {
    return this.statusmap.get(ir);
  },


  /** Returns the last known value of Robobo's base battery level */
  checkBatt : function () {
    return this.statusmap.get("batterylevel");
  },//ENDOF checkBatt

  /** Returns the last known position of the specified wheel */
  getWheel : function(wheel, type){
    if (type == "speed"){
      if (wheel == "right"){
            this.statusmap.get("encoderSpeedR");
      }else{
              this.statusmap.get("encoderSpeedL");

      }
    }else{
      if (wheel == "right"){
        this.statusmap.get("encoderPosR");

      }else{
        this.statusmap.get("encoderPosL");

      }
    }
  },

  /** Returns the last know color of the specified led */
  getLedColor : function (led, channel){
      return this.statusmap.get(led+channel);

  },


  /***************************************/
  /* ENDOF ROBOT BASE FUNCTIONS *
  /***************************************/

  //---------------------------------------


  /***************************************/
  /* EMOTION INTERACTION FUNCTIONS   *
  /***************************************/

  /** Commands the robot to change its face/emotion */
  changeEmotion : function (emotion) {
    var message = JSON.stringify({
        "name": "CHANGEEMOTION",
        "parameters": {
            emotion: emotion
        },
        "id": this.commandid
    });
    this.sendMessage(message);

  }, //ENDOF changeEmotion


  /** Returns the last known Robobo emotion */
  getEmotion : function (){
    return this.statusmap.get("emotion");
  },  


  /** Commands the robot to play a prerecorded sound */
  playEmotionSound : function (sound) {
    var message = JSON.stringify({
        "name": "SOUND",
        "parameters": {
            sound:sound
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    
  },//ENDOF playEmotionSound

  /***************************************/
  /* ENDOF EMOTION BASE FUNCTIONS *
  /***************************************/

  //---------------------------------------

  /***************************************/
  /* SOUND-BASED INTERACTION FUNCTIONS   *
  /***************************************/

  /** Commands the robot to read text using Text-To-Speech */
  talk : function (speech, callback) {
    if (this.talkCallback != undefined){
      this.talkCallback();
    }

    this.talkCallback = callback;
    var message = JSON.stringify({
        "name": "TALK",
        "parameters": {
            text: speech
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    
  },//ENDOF talk


  setLedColor: function (led,color) {
    var message = JSON.stringify({
        "name": "LEDCOLOR",
        "parameters": {
            led:led,
            color:color
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    //END OF CHANGECOLOR FUNCTION
  },


  /** Commands the robot to play a musical note */
  playNote : function (index, time) {
    var message = JSON.stringify({
        "name": "PLAYNOTE",
        "parameters": {
            index:index,
            time:time
        },
        "id": this.commandid
    });
    this.sendMessage(message);

  },//ENDOF playNote


  /** Returns the last musical note detected by the robot */
  getLastNote : function(){
    return this.statusmap.get("lastNote");
  },//ENDOF getLastNote

  /*********************************************/
  /* ENDOF SOUND-BASED INTERACTION FUNCTIONS   *
  /*********************************************/

  //---------------------------------------

  /***************************************/
  /* SMARTPHONE SENSORS FUNCTIONS        *
  /***************************************/

  /** Returns the current orientation of each axis (yaw, pitch, roll) of the smartphone */
  getOrientation :function(axis) {
    if (axis=="yaw") {
      return this.statusmap.get("yaw");

    }else if (axis=="pitch") {
      return this.statusmap.get("pitch");

    }else{
      return this.statusmap.get("roll");
    }
    
  },//ENDOF getOrientation


  /** Returns the current accleration of each axis (x, y, z) of the smartphone */
  getAcceleration :function(axis) {
    if (axis=="x") {
      return this.statusmap.get("xaccel");

    }else if (axis=="y") {
      return this.statusmap.get("yaccel");

    }else{
      return this.statusmap.get("zaccel");
    }
    
  },//ENDOF getAcceleration

  /** Commands the robot to return the last known ambient light value */
  getLightBrightness: function () {
    var message = JSON.stringify({
        "name": "GETBRIGHTNESS",
        "parameters": {},
        "id": this.commandid
    });
    this.sendMessage(message);
  }, //ENDOF getLightBrightness

  /** Returns the last known ambient light value */
  getBrightness : function () {
    return this.statusmap.get("brightness");
  },

  /** Notifies that the ambient light value has changed */
  brightnessChanged: function (callback) {
    callback();
  }, //ENDOF brightnessChanged

  checkOboBatt : function () {
    return this.statusmap.get("obobatterylevel");
    //END OF CHECKBATT FUNCTION
  },

  
  /***************************************/
  /* ENDOF SMARTPHONE SENSORS FUNCTIONS  *
  /***************************************/

  //---------------------------------------

  /***************************************/
  /* VISION-BASED INTERACTION FUNCTIONS   *
  /***************************************/

  /** Activates/deactivates the detection of each of the 4 different color-blobs supported */
  configureBlobDetection: function (red, green, blue, custom) {
    var message = JSON.stringify({
        "name": "CONFIGUREBLOB",
        "parameters": {
            "red":red,
            "green":green,
            "blue":blue,
            "custom":custom
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    
  },//ENDOF configureBlobDetection

  //TODO --> Remove
  getColor : function () {
    return this.statusmap.get("color");
    //END OF GETCOLOR FUNCTION
  },


  /** Returns the coords (x or y axis) of the last defected face */
  getFaceCoord :function(axis) {
    if (axis=="x") {
      return this.statusmap.get("facex");

    }else{
      return this.statusmap.get("facey");
    }
    
  },//ENDOF getFaceCoord

  getBlobCoord : function(color, axis){
    return this.statusmap.get("blobPos"+axis+color);
  },

  getBlobSize : function(color){
    return this.statusmap.get("blobSize"+color);
  },


  /** Returns the estimated distance to last detected face */
  getFaceDist : function () {
    return this.statusmap.get("facedist");
  },//ENDOF getFaceDist


  /**********************************************/
  /* ENDOF VISION-BASED INTERACTION FUNCTIONS   *
  /**********************************************/



  //---------------------------------------------

  /**********************************************/
  /* TOUCH-BASED INTERACTION FUNCTIONS          *
  /**********************************************/

  /** Returns the coords (x or y axis) of the last TAP of the user in the screen */
  getTapCoord :function(axis) {
    if (axis=="x") {
      return this.statusmap.get("tapx");

    }else{
      return this.statusmap.get("tapy");
    }
    
  },//ENDOF getTapCoord

  /** Returns the last angle of a fling gesture in the smartphone screen */
  checkFlingAngle : function () {
    return this.statusmap.get("flingangle");
  },//ENDOF checkFlingAngle


  /**********************************************/
  /* ENDOF TOUCH-BASED INTERACTION FUNCTIONS    *
  /**********************************************/


  //---------------------------------------------

  /**********************************************/
  /* UTILITY FUNCTIONS                          *
  /**********************************************/


  getError : function () {
    return this.statusmap.get("error");
    //END OF GETCOLOR FUNCTION
  },

  /**********************************************/
  /* ENDOF UTILITY FUNCTIONS                    *
  /**********************************************/




  //TODO --> Move to base block or remove?
  getPanPosition : function () {
    return this.statusmap.get("panPos");
    //END OF GETCOLOR FUNCTION
  },

  //TODO --> Move to base block or remove?
  getTiltPosition : function () {
    return this.statusmap.get("tiltPos");
    //END OF GETCOLOR FUNCTION
  },


  /******************************/
  /* MESSAGE PROCESSING         *
  /******************************/
  
  /** Manages the processing of each different status message received from the remote robot */
  manageStatus : function (msg) {


    //console.log(msg.name);

    if (msg.name == "TapNumber"){
      console.log(msg.value);
    }
    if (msg.name == "NEWCOLOR"){
      (this.callbackmap.get("onNewColor"))();
      console.log("NEWCOLOR");
      //console.log(msg.value["color"]);
      this.statusmap.set("color",msg.value["color"]);
      console.log(this.statusmap.get("color"));
    }

    else if (msg.name == "IRSTATUS"){


      for (var key in msg.value) {
            this.statusmap.set(key,msg.value[key]);  
          }
      }
    

    else if (msg.name == "BATTLEV") {
      this.statusmap.set("batterylevel",parseInt(msg.value["level"]));
      if (parseInt(msg.value["level"])<20){
        this.callbackmap.get("onLowBatt")();
      }
    }

    else if (msg.name == "OBOBATTLEV") {
      this.statusmap.set("obobatterylevel",parseInt(msg.value["level"]));
      if (parseInt(msg.value["level"])<20){
        this.callbackmap.get("onLowOboBatt")();
      }
    }

    else if (msg.name == "NEWFACE") {
      this.statusmap.set("facex",parseInt(msg.value["coordx"]));
      this.statusmap.set("facey",parseInt(msg.value["coordy"]));

      if (parseInt(msg.value["distance"])>45){
        this.statusmap.set("facedist","close");
      }else if (parseInt(msg.value["distance"])<25){
        this.statusmap.set("facedist","far");
      } else {
        this.statusmap.set("facedist","mid");
      }


    }

    else if (msg.name == "FALLSTATUS"){
      //console.log(msg);
      for (var key in msg.value) {
        //console.log(key);
          this.statusmap.set(key,(msg.value[key] == "true"));
          if(this.statusmap.get(key)){
            //console.log("OnFall");
            (this.callbackmap.get("onFall"))(key);
          }
      }
    }

    else if (msg.name == "GAPSTATUS"){
      //console.log(msg);
      for (var key in msg.value) {
        //console.log(key+" "+msg.value[key]+" "+(msg.value[key] == "true"));
          this.statusmap.set(key,(msg.value[key] == "true"));
          if((this.statusmap.get(key))){
            //console.log("OnGap");
            (this.callbackmap.get("onGap"))(key);
          }

      }

    }

    else if (msg.name == "TAP") {
      //console.log(msg);
      this.statusmap.set("tapx",parseInt(msg.value["coordx"]));
      this.statusmap.set("tapy",parseInt(msg.value["coordy"]));
      (this.callbackmap.get("onNewTap"))();
    }

    else if (msg.name == "FLING") {

      this.statusmap.set("flingangle",parseInt(msg.value["angle"]));
      this.statusmap.set("flingtime",parseInt(msg.value["time"]));
      this.statusmap.set("flingdistance",parseInt(msg.value["distance"]));

      (this.callbackmap.get("onNewFling"))();
    }

    else if (msg.name == "CLAP") {
      //TODO --> add null calback check
      (this.callbackmap.get("onNewClap"))();
    }

    else if (msg.name == "BRIGHTNESS") {
      this.statusmap.set("brightness",parseInt(msg.value["level"]));

    }

    else if (msg.name == "BRIGHTNESSCHANGED") {

      (this.callbackmap.get("onBrightnessChanged"))();
    }

    else if (msg.name == "ORIENTATION") {

      this.statusmap.set("yaw",parseInt(msg.value["yaw"]));
      this.statusmap.set("pitch",parseInt(msg.value["pitch"]));
      this.statusmap.set("roll",parseInt(msg.value["roll"]));
    }

    else if (msg.name == "ACCELERATION") {
      //console.log(msg);
      this.statusmap.set("xaccel",parseInt(msg.value["xaccel"]));
      this.statusmap.set("yaccel",parseInt(msg.value["yaccel"]));
      this.statusmap.set("zaccel",parseInt(msg.value["zaccel"]));

    }

    else if (msg.name == "MEASUREDCOLOR") {
      //console.log(msg);
      this.statusmap.set("colorr",parseInt(msg.value["R"]));
      this.statusmap.set("colorg",parseInt(msg.value["G"]));
      this.statusmap.set("colorb",parseInt(msg.value["B"]));

    }

    else if (msg.name == "ACCELCHANGED") {

      (this.callbackmap.get("onAccelChanged"))();
    }

    else if (msg.name == "DIE") {
      console.log("Die message");
      this.closeConnection(false);
    }

    else if (msg.name == "FOUNDFACE") {
      //console.log("FOUNDFACE");
      (this.callbackmap.get("onNewFace"))();
    }

    else if (msg.name == "LOSTFACE") {
      //console.log("LOSTFACE");
      (this.callbackmap.get("onLostFace"))();
    }

    else if (msg.name == "ONERROR") {
      console.log("ERROR "+ msg.value['error']);
      this.statusmap.set("error",msg.value['error']);

      (this.callbackmap.get("onError"))();
    }
    else if (msg.name == "ONPHRASE") {
      console.log('ONPHRASE '+msg.value['text']);
      (this.callbackmap.get("onPhrase"))(msg.value['text']);
    }
    else if (msg.name == "UNLOCK") {
      console.log('UNLOCK '+msg.value['blockid']);
      //(this.blockingcallbackmap.get(""+msg.value['blockid']))();
      this.wheelsCallback();
      this.wheelsCallback = undefined;
    }
    else if (msg.name == "UNLOCKTILT") {
      console.log('UNLOCKTILT '+msg.value['blockid']);
      //(this.blockingcallbackmap.get(""+msg.value['blockid']))();
      this.tiltCallback();
      this.tiltCallback = undefined;
    }
    else if (msg.name == "UNLOCKPAN") {
      console.log('UNLOCK '+msg.value['blockid']);
      //(this.blockingcallbackmap.get(""+msg.value['blockid']))();
      this.panCallback();
      this.panCallback = undefined;
    }

    else if (msg.name == "PANSTATUS") {
      //console.log("PANSTATUS "+msg.value['panPos']);
      this.statusmap.set("panPos",msg.value['panPos']);
    }

    else if (msg.name == "TILTSTATUS") {
      //console.log("TILTSTATUS "+msg.value['tiltPos']);

      this.statusmap.set("tiltPos",msg.value['tiltPos']);
    }
    else if (msg.name == "COLORBLOB") {
      console.log(msg.value['color']+'  '+msg.value['posx']+'  '+msg.value['posy']+'  '+msg.value['size']);
      this.statusmap.set("blobPosx"+msg.value['color'],msg.value['posx']);
      this.statusmap.set("blobPosy"+msg.value['color'],msg.value['posy']);
      this.statusmap.set("blobSize"+msg.value['color'],msg.value['size']);


    }

    else if (msg.name == "NEWNOTE") {
      console.log(msg.value['name']+'  '+msg.value['index']+'  '+msg.value['octave']);
      this.statusmap.set("lastNote",msg.value['name']);

      (this.callbackmap.get("onNewNote"))();

    }
    else if (msg.name == "ENDOFSPEECH") {
      console.log("END OF SPEECH");
      this.talkCallback();
      this.talkCallback = undefined;
      
    }
    else if (msg.name == "WHEELSTATUS") {
      this.statusmap.set("encoderPosR",msg.value['encoderPosR']);
      this.statusmap.set("encoderPosL",msg.value['encoderPosL']);
      this.statusmap.set("encoderSpeedR",msg.value['encoderSpeedR']);
      this.statusmap.set("encoderSpeedL",msg.value['encoderSpeedL']);


      
    }
    else if (msg.name == "OBSTACLES") {

      /*obstacle = false;

      for (var key in msg.value) {
        this.statusmap.set(key,msg.value[key]);
        if (msg.value[key]=="true"){
          obstacle = true;
        }
      }
      if (obstacle){
        this.callbackmap.get("onObstacle")();
      }
      */
    }
    else if (msg.name == "LEDSTATUS") {
      this.statusmap.set(msg.value['id']+"R",msg.value['R']);
      this.statusmap.set(msg.value['id']+"G",msg.value['G']);
      this.statusmap.set(msg.value['id']+"B",msg.value['B']);
 
    }
    else if (msg.name == "EMOTIONSTATUS") {
      this.statusmap.set("emotion",msg.value['emotion']);

 
    }



    else {
      console.log('Lost status '+ msg.name);
    }


  }, //ENDOF manageStatus


  /** Manages the processing of each response message received from the remote robot */
  manageResponse : function (msg) {
      console.log(JSON.stringify(msg));

  } //ENDOF manageResponse

}
