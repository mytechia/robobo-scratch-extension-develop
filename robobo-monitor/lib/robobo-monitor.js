
/*******************************************************************************
 * Copyright 2017 Mytech Ingenieria Aplicada <http://www.mytechia.com>
 * Copyright 2017 Gervasio Varela <gervasio.varela@mytechia.com>
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

/**
 * Support functions to control the Robobo status page and Robobo dynamic views
 */


var faceLost = 0;
var faceNew = 0;

// IR Sensors number
var frontCIR = "Front-C",
    frontLIR = "Front-L",
    frontLLIR = "Front-LL",
    frontRIR = "Front-R",
    frontRRIR = "Front-RR",
    backCIR = "Back-C",
    backLIR = "Back-L",
    backRIR = "Back-R";


/** Format the value received as pameter to be shown in the page, converts undefined in '-'**/
function formatValue (value) {
  if (value == undefined) {
    return '-';
  }else {
    return value;
  }
}

/** Returns the GapKey string for the specified gap number */
function getGapKey(gapNumber) {
    return "Gap"+gapNumber;
}

/** Changes the visibility of a SVG element */
function setElementVisibility(element, visibility) {
    if(visibility) {
        element.setAttribute("visibility","visible");
    }
    else {
        element.setAttribute("visibility","hidden");
    }
}

/** Sets the HTML content of the specified element */
function setElementHTML(element, html) {
    document.getElementById(element).innerHTML = html;
}


/** Sets the position of the FLING sensor in the Robobo view widget.
    It also makes the FLING sensor visible. */
function setFlingAngle(angle) {
    if (angle != null) {

        angle += 90;
        angle = 360 - angle;

        fling = document.getElementById("robobo-fling");

        var bb = fling.getBBox();
        var cx = bb.x + bb.width/2;
        var cy = bb.y + bb.height/2;

        rotate = "rotate("+angle+" "+cx+" "+cy+")";
        fling.setAttribute("transform", rotate);

        setElementVisibility(fling, 1);

    }
}


/** Returns all the parameters of an URL */
function getAllUrlParams(url) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i=0; i<arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // in case params look like: list[]=thing1&list[]=thing2
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function(v) {
                paramNum = v.slice(1,-1);
                return '';
            });

            // set parameter value (use 'true' if empty)
            var paramValue = typeof(a[1])==='undefined' ? true : a[1];

            // (optional) keep case consistent
            paramName = paramName.toLowerCase();
            paramValue = paramValue.toLowerCase();

            // if parameter name already exists
            if (obj[paramName]) {
                // convert value to array (if still string)
                if (typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                }
                // if no array index number specified...
                if (typeof paramNum === 'undefined') {
                    // put the value on the end of the array
                    obj[paramName].push(paramValue);
                }
                // if array index number specified...
                else {
                    // put the value at that index number
                    obj[paramName][paramNum] = paramValue;
                }
            }
            // if param name doesn't exist yet, set it
            else {
                obj[paramName] = paramValue;
            }
        }
    }

    return obj;
};


    /** Registers all the callbacks supported by the remote library. */
function registerRemoteCallbacks(rem) {

    rem.registerCallback("onNewColor", function() {
        var colorSensor = rem.checkMeasuredColor('red') + ' | ' + rem.checkMeasuredColor('green') + ' | ' + rem.checkMeasuredColor('blue');
        setElementHTML("color-sensor-value", colorSensor);
    });

    rem.registerCallback("onIrChanged",function() {});
    rem.registerCallback("onNewFace",function() {
        faceNew = 1;
        faceLost = 0;
    });

    rem.registerCallback("onLostFace",function() {
        faceNew = 0;
        faceLost = 1;
//        setElementVisibility(document.getElementById("robobo-face", 0));
    });

    rem.registerCallback("onFall",function() {});
    rem.registerCallback("onGap",function() {});
    rem.registerCallback("onLowBatt",function() {});
    rem.registerCallback("onLowOboBatt",function() {});
    rem.registerCallback("onNewClap",function() {

      //setElementHTML("audio-sensor-claps", ());
    });

    rem.registerCallback("onNewTap", function() {
        var sensorValue = rem.getTapCoord('x') + "," + rem.getTapCoord('y')
        setElementHTML("tap-sensor-value", sensorValue);
    });

    rem.registerCallback("onNewFling",function() {
        //update fling angle in robobo emotion face
        var flingAngle = rem.checkFlingAngle();
        //setFlingAngle(flingAngle);
        setElementHTML("fling-sensor-value", rem.checkFlingAngle());
    });

    rem.registerCallback("onAccelChanged", function() {});

    rem.registerCallback("onObstacle", function() {

        setElementHTML("ir-sensor-distance-front-l", rem.getObstacle());
    });

    rem.registerCallback("onBrightnessChanged", function() {});

    rem.registerCallback("onError", function() {});
    rem.registerCallback("onConnectionChanges", function() {});

    rem.registerCallback("onNewNote", function() {
       setElementHTML("audio-sensor-music-note", rem.getLastNote());
    });



}

/** This function updates sensing data by polling to the remote library.
    It is mean to be called periodically using JS setInverval() */
function updateSensors() {

    //update brightness sensor
    setElementHTML("brightness-sensor-value", rem.getBrightness());

    //update acceleration sensor
    //var accelSensor = rem.getAcceleration('x') + ' | ' + rem.getAcceleration('y') + ' | ' + rem.getAcceleration('z');
    setElementHTML("accel-sensor-x", rem.getAcceleration('x'));
    setElementHTML("accel-sensor-y", rem.getAcceleration('y'));
    setElementHTML("accel-sensor-z", rem.getAcceleration('z'));

    //update orientation sensor
    var orSensor = formatValue(rem.getOrientation('yaw')) + 'º, ' + formatValue(rem.getOrientation('pitch')) + 'º,' + formatValue(rem.getOrientation('roll'))+"º";
    setElementHTML("orientation-sensor-value", orSensor);

    //update pan-tilt position

    setElementHTML("pan-sensor-value", formatValue(rem.getPan()));
    setElementHTML("tilt-sensor-value", formatValue(rem.getTilt()));

    //update face position
    var faceX = formatValue(rem.getFaceCoord('x'));
    var faceY = formatValue(rem.getFaceCoord('y'));
    var faceDist = formatValue(rem.getFaceDist());
    setElementHTML("facepos-sensor-value-x", faceX);
    setElementHTML("facepos-sensor-value-y", faceY);
    //setFacePosition(faceDist, faceX, faceY);
    setElementHTML("facedist-sensor-value", rem.getFaceDist());

    // update blob sensor values

    setElementHTML("color-sensor-green-x", formatValue(rem.getBlobCoord("green","x")));
    setElementHTML("color-sensor-green-y", formatValue(rem.getBlobCoord("green","y")));
    setElementHTML("color-sensor-green-size", formatValue(rem.getBlobSize("green")));
    setElementHTML("color-sensor-blue-x", formatValue(rem.getBlobCoord("blue","x")));
    setElementHTML("color-sensor-blue-y", formatValue(rem.getBlobCoord("blue","y")));
    setElementHTML("color-sensor-blue-size", formatValue(rem.getBlobSize("blue")));
    setElementHTML("color-sensor-red-x", formatValue(rem.getBlobCoord("red","x")));
    setElementHTML("color-sensor-red-y", formatValue(rem.getBlobCoord("red","y")));
    setElementHTML("color-sensor-red-size", formatValue(rem.getBlobSize("red")));

    //Custom color --> TO DO
    // setElementHTML("color-sensor-custom-x", rem.getBlobCoord("custom","x"));
    // setElementHTML("color-sensor-custom-y", rem.getBlobCoord("custom","y"));
    // setElementHTML("color-sensor-custom-size, rem.getBlobSize("custom"));

    // update IR sensors raw value
    setElementHTML("ir-sensor-raw-front-c", formatValue(rem.getIRValue(frontCIR)));
    setElementHTML("ir-sensor-raw-front-l", formatValue(rem.getIRValue(frontLIR)));
    setElementHTML("ir-sensor-raw-front-ll", formatValue(rem.getIRValue(frontLLIR)));
    setElementHTML("ir-sensor-raw-front-r", formatValue(rem.getIRValue(frontRIR)));
    setElementHTML("ir-sensor-raw-front-rr", formatValue(rem.getIRValue(frontRRIR)));
    setElementHTML("ir-sensor-raw-back-c", formatValue(rem.getIRValue(backCIR)));
    setElementHTML("ir-sensor-raw-back-r", formatValue(rem.getIRValue(backRIR)));
    setElementHTML("ir-sensor-raw-back-l", formatValue(rem.getIRValue(backLIR)));

    //Battery level
    setElementHTML("obo-batery-value", formatValue(rem.checkBatt()));

    //Wheel level
    setElementHTML("wheel-right-position", formatValue(rem.getWheel("right","position")));
    setElementHTML("wheel-left-position", formatValue(rem.getWheel("left","position")));

    setElementHTML("wheel-right-speed", formatValue(rem.getWheel("right","speed")));
    setElementHTML("wheel-left-speed", formatValue(rem.getWheel("left","speed")));

}
