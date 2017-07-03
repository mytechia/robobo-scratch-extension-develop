
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
//Remote library version 0.1.3-dev
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

  this.panSpeedLimit = 40;
  this.tiltSpeedLimit = 10;

  this.wheelsSpeedLimit = 250;

  this.panInferiorLimit = 26;
  this.panSuperiorLimit = 339;

  this.tiltInferiorLimit = 26;
  this.tiltSuperiorLimit = 109;

//END OF REMOTE OBJECT
};

Remote.ConnectionStateEnum = {
  CONNECTING: 0,
  CONNECTED: 1,
  RECONNECTING: 2,
  DISCONNECTED: 3
}

Remote.prototype = {


  registerCallback: function (name,callback) {
    this.callbackmap.set(name,callback);
    //END OF REGISTERCALLBACK FUNCTION
  },
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



    //END OF CONNECT FUNCTION
  },

  //Waits until the connection is established with the server


  waitForConnection : function() {

    var startTime = new Date().getTime();
    while(true) {
      var currentTime = new Date().getTime();
      if (startTime+1000 < currentTime) {

        break;
      }
    }

  },

  isConnected : function() {
    return this.connectionState == Remote.ConnectionStateEnum.CONNECTED;
  },

  closeConnection: function(reconnect) {
    if (reconnect) {
      this.connectionState = Remote.ConnectionStateEnum.RECONNECTING;
    }
    this.ws.close();
    //END OF CLOSECONNECTION METHOD
  },

  sendMessage: function(message) {
    this.commandid = this.commandid +1;
    this.ws.send(message);

    //END OF SENDMESSAGE FUNCTION
  },

  fireError: function (err) {
    console.log("ERROR "+ err);
    this.statusmap.set("error",err);

    (this.callbackmap.get("onError"))();
  },

  handleMessage: function(message) {

    var jsonmsg = JSON.parse(message)
    //console.log(typeof(jsonmsg.name) == 'string');
    if (typeof(jsonmsg.name) == 'string'){
      this.manageStatus(jsonmsg);
    }else if (typeof(jsonmsg.commandid) != "undefined") {
      this.manageResponse(jsonmsg);
    }

    //END OF HANDLEMESSAGE FUNCTION
  },


  //MOVEMENT

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
    //END OF MOVEDEGREE FUNCTION
  },

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
    //END OF MOVETIME FUNCTION
  },

  convertSpeedWheels: function (speed) {
    convertedSpeed = speed*2.5;
    if (Math.abs(speed)<10) {
      return 0;
    }else if (this.wheelsSpeedLimit > convertedSpeed) {
      return Math.round(convertedSpeed);
    }else{
      return this.wheelsSpeedLimit;
    }
  },

  convertSpeedPan: function (speed) {
    convertedSpeed = speed*1.4;

      if (convertedSpeed < this.panSpeedLimit){
        return Math.floor(convertedSpeed);
      }else{
        return this.panSpeedLimit;
      }

  },

  convertSpeedTilt: function (speed) {
    convertedSpeed = speed*0.9;

      if (convertedSpeed < this.tiltSpeedLimit){
        return Math.floor(convertedSpeed);
      }else{
        return this.tiltSpeedLimit;
      }

  },

  moveWheelsSeparated: function(lSpeed,rSpeed,time) {
    lS = ''+this.convertSpeedWheels(parseInt(lSpeed));
    rS = ''+this.convertSpeedWheels(parseInt(rSpeed));

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
    //END OF MOVETWOWHEELS FUNCTION
  },

  moveWheelsSeparatedWait: function(lSpeed,rSpeed,time,callback) {
    console.log("moveWheelsSeparatedWait "+lSpeed+" "+rSpeed+" "+time);
    lS = ''+this.convertSpeedWheels(parseInt(lSpeed));
    rS = ''+this.convertSpeedWheels(parseInt(rSpeed));

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
    console.log("Message: "+message)
    this.sendMessage(message);
    //END OF MOVETWOWHEELS FUNCTION
  },

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
    //END OF MOTORSON FUNCTION
  },



  turnInPlace: function(degrees) {
    var message = JSON.stringify({
        "name": "TURNINPLACE",
        "parameters": {
            degrees: degrees
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    //END OF TURNINPLACE FUNCTION
  },

  movePan: function(pos, vel) {
    s = ''+ this.convertSpeedPan(parseInt(vel));
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
    //END OF MOVEPAN FUNCTION
  },

  movePanWait: function(pos, vel, callback) {
    s = ''+ this.convertSpeedPan(parseInt(vel));
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
    //END OF MOVEPAN FUNCTION
  },

  getPan:function() {
    return this.statusmap.get("panPos")
  },

  getTilt:function() {
    return this.statusmap.get("tiltPos")
  },

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

  moveTilt: function (pos, vel) {
    s = ''+ this.convertSpeedTilt(parseInt(vel));

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
    //END OF MOVETILT FUNCTION
  },

  moveTiltWait: function (pos, vel, callback) {
    s = ''+ this.convertSpeedTilt(parseInt(vel));
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
    //END OF MOVETILT FUNCTION
  },

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
    //END OF MOVETILTBYDEGREES FUNCTION
  },

  //ENDMOVEMENT

  //HRI
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
    //END OF TALK FUNCTION
  },

  changeEmotion : function (emotion) {
    var message = JSON.stringify({
        "name": "CHANGEEMOTION",
        "parameters": {
            emotion: emotion
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    //END OF CHANGEEMOTION FUNCTION
  },

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

  playEmotionSound : function (sound) {
    var message = JSON.stringify({
        "name": "SOUND",
        "parameters": {
            sound:sound
        },
        "id": this.commandid
    });
    this.sendMessage(message);
    //END OF PLAYEMOTION FUNCTION
  },

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
    //END OF PLAYNOTE FUNCTION
  },

  //ENDHRI

  //SENSING
  getLightBrightness: function () {
    var message = JSON.stringify({
        "name": "GETBRIGHTNESS",
        "parameters": {},
        "id": this.commandid
    });
    this.sendMessage(message);
    //END OF GETLIGHTBRIGHTNESS FUNCTION
  },

  brightnessChanged: function (callback) {
    callback();

    //END OF BRIGHTNESSCHANGED FUNCTION
  },

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
    //END OF CHANGECOLOR FUNCTION
  },

  consultIR : function (irnumber) {
    console.log("ASDF");

    console.log(this.statusmap.get("IRSensorStatus"+irnumber).value);
    return this.statusmap.get("IRSensorStatus"+irnumber).value;
    //END OF GETLIGHTBRIGHTNESS FUNCTION
  },

  mirarIr : function (irnumber) {
    return this.statusmap.get("IRSensorStatus"+irnumber);
    //END OF MIRARIR FUNCTION
  },

  checkBatt : function () {
    return this.statusmap.get("batterylevel");
    //END OF CHECKBATT FUNCTION
  },

  checkOboBatt : function () {
    return this.statusmap.get("obobatterylevel");
    //END OF CHECKBATT FUNCTION
  },

  checkFall : function (fall) {
    return this.statusmap.get(fall);
    //END OF CHECKFALL FUNCTION
  },

  checkFlingAngle : function () {
    return this.statusmap.get("flingangle");
    //END OF CHECKFLING ANGLE
  },

  checkGap : function (gap) {
    return this.statusmap.get(gap);
    //END OF CHECKFALL FUNCTION
  },

  getBrightness : function () {
    return this.statusmap.get("brightness");
  },


  //ENDSENSING

  //VISION

  getColor : function () {
    return this.statusmap.get("color");
    //END OF GETCOLOR FUNCTION
  },

  getFaceCoord :function(axis) {
    if (axis=="x") {
      return this.statusmap.get("facex");

    }else{
      return this.statusmap.get("facey");
    }
    //END OF GETFACECOORD FUNCTION
  },

  getTapCoord :function(axis) {
    if (axis=="x") {
      return this.statusmap.get("tapx");

    }else{
      return this.statusmap.get("tapy");
    }
    //END OF GETFACECOORD FUNCTION
  },

  getOrientation :function(axis) {
    if (axis=="yaw") {
      return this.statusmap.get("yaw");

    }else if (axis=="pitch") {
      return this.statusmap.get("pitch");

    }else{
      return this.statusmap.get("roll");
    }
    //END OF GETORIENTATION FUNCTION
  },

  getAcceleration :function(axis) {
    if (axis=="x") {
      return this.statusmap.get("xaccel");

    }else if (axis=="y") {
      return this.statusmap.get("yaccel");

    }else{
      return this.statusmap.get("zaccel");
    }
    //END OF GETORIENTATION FUNCTION
  },

  checkMeasuredColor:function(channel) {

    if (channel=="red") {
      return this.statusmap.get("colorr");

    }else if (channel=="green") {
      return this.statusmap.get("colorg");

    }if (channel=="blue") {
      return this.statusmap.get("colorb");

    }
    //END OF GETMEASUREDCOLOR FUNCTION
  },

  getFaceDist : function () {
    return this.statusmap.get("facedist");
  },

  getObstacle : function (ir) {

    return this.statusmap.get(ir);
  },

  //ENDVISION

  getError : function () {
    return this.statusmap.get("error");
    //END OF GETCOLOR FUNCTION
  },

  getPanPosition : function () {
    return this.statusmap.get("panPos");
    //END OF GETCOLOR FUNCTION
  },

  getTiltPosition : function () {
    return this.statusmap.get("tiltPos");
    //END OF GETCOLOR FUNCTION
  },

  getBlobCoord : function(color, axis){
    return this.statusmap.get("blobPos"+axis+color);
  },

  getBlobSize : function(color){
    return this.statusmap.get("blobSize"+color);
  },
  getLastNote : function(){
    return this.statusmap.get("lastNote");
  },
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

      /*for (var key in msg.value) {
        //console.log(key);


          this.statusmap.set(key,parseInt(msg.value[key]));
          //console.log(this.statusmap);
          if (this.firstime){
            this.laststatusmap.set(key,parseInt(msg.value[key]));
          }else{
            var now = parseInt(msg.value[key]);
            if (parseInt(msg.value[key])>130) {
              this.statusmap.set("obstacle_"+parseInt(key.slice(-1)),true);

              this.callbackmap.get("onObstacle")();
            } else {
              this.statusmap.set("obstacle_"+parseInt(key.slice(-1)),false);

            }
            var then = this.laststatusmap.get(key);
            //console.log(key+" now: "+now);
            //console.log(key+" then: "+then);
            if (now>then){
              if (((now/then))>3){
                this.laststatusmap.set(key,now);
                this.callbackmap.get("onIrChanged")(parseInt(key.slice(-1)));
              }
            }else if (((then/now))>5){
              this.laststatusmap.set(key,now);
              this.callbackmap.get("onIrChanged")(parseInt(key.slice(-1)));
            }
          }


        //  console.log(msg.value[key]);

      }*/
      this.firstime = false;
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

      obstacle = false;

      for (var key in msg.value) {
        this.statusmap.set(key,msg.value[key]);
        if (msg.value[key]=="true"){
          obstacle = true;
        }
      }
      if (obstacle){
        this.callbackmap.get("onObstacle")();
      }
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


    //END MANAGESTATUS FUNCTION
  },

  manageResponse : function (msg) {
      console.log(JSON.stringify(msg));

    //END MANAGERESPONSE FUNCTION
  }

}
