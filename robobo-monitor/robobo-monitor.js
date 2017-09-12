
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

/** Returns SVG element corresponding to the IR sensor number 'irNumber' */
function getIr(irNumber) {
    return document.getElementById("robobo-ir"+irNumber);
}

/** Hides the specified IR sensor from the Robobo views */
function hideIr(irNumber) {
    ir = getIr(irNumber);
    setElementVisibility(ir, 0);
    if (irNumber == 3) {
    hideIr(33);
    }
    else if (irNumber == 7) {
    hideIr(77);
    }
}

/** Hide all IR sensor from the Robobo views */
function hideAllIrs() {
    for(i=1; i<=8; i++) {
    hideIr(i);
    }
}

/** Notifies (visually) the presence of an obstacle in a particular IR */
function setIrObstacle(irNumber) {
    ir = getIr(irNumber);
    setElementVisibility(ir, 1);
    ir.setAttribute("fill", "#ffbb00");
    if (irNumber == 3) {
    setIrObstacle(33);
    }
    else if (irNumber == 7) {
    setIrObstacle(77);
    }
}

/** Notifies (visually) the presence of a fall in a particular IR */
function setIrFall(irNumber) {
    ir = getIr(irNumber);
    setElementVisibility(ir, 1);
    ir.setAttribute("fill","#dd0000");
    if (irNumber == 3) {
    setIrFall(33);
    }
    else if (irNumber == 7) {
    setIrFall(77);
    }
}


/** Modifies the pan angle in the Robobo top-view */
function setPanAngle(angle) {
    if (angle != null) {
        pan = document.getElementById('robobo-pantilt');
        bb = pan.getBBox();
        xc = bb.x + (bb.width/2);
        yc = bb.y + (bb.height/2);
        rotate = "rotate("+angle+" "+xc+" "+yc+")";
        pan.setAttribute("transform", rotate);
    }
}

/** Modifies the tilt angle in the Robobo-side view */
function setTiltAngle(angle) {
    if (angle != null) {
        angle = angle-90;
        tilt = document.getElementById('robobo-tilt');
        bb = tilt.getBBox();
        xc = bb.x + (bb.width/2);
        yc = bb.y + bb.height;
        rotate = "rotate("+angle+" "+xc+" "+yc+")";
        tilt.setAttribute("transform", rotate);
    }
}

/** Sets the color of the specified LED in the Robobo- top-view widget*/
function setLEDColor(ledNumber, color) {
    ledId = "robobo-led" + ledNumber;
    roboboLed = document.getElementById(ledId);
    roboboLed.setAttribute("fill", color);
}

/** Sets the HTML content of the specified element */
function setElementHTML(element, html) {
    document.getElementById(element).innerHTML = html;
}

/** Starts the rotation animation of the Robobo wheel
    at the indicated speed. */
function rotateWheel(speed) {
    addRotateTransform("robobo-wheel", 10, speed);
}

/** Adds a rotation transform animation to a SVG element. */
function addRotateTransform(target_id, dur, dir) {
    var my_element = document.getElementById(target_id);
    var a = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");

    var bb = my_element.getBBox();
    var cx = bb.x + bb.width/2;
    var cy = bb.y + bb.height/2;

    a.setAttributeNS(null, "attributeName", "transform");
    a.setAttributeNS(null, "attributeType", "XML");
    a.setAttributeNS(null, "type", "rotate");
    a.setAttributeNS(null, "dur", dur + "s");
    a.setAttributeNS(null, "repeatCount", "indefinite");
    a.setAttributeNS(null, "from", "0 "+cx+" "+cy);
    a.setAttributeNS(null, "to", 360*dir+" "+cx+" "+cy);

    my_element.appendChild(a);
    a.beginElement();
}


/** Sets the position of the TAP sensor in the Robobo view widget.
    It also makes the TAP sensor visible. */
function setTapPosition(x,y) {
    if (x != null && y != null) {

        bbEmotion = document.getElementById("robobo-emotion").getBBox();
        xScale = bbEmotion.width / 100;
        yScale = bbEmotion.height / 100;
        var cx = xScale * x + bbEmotion.x;
        var cy = yScale * y + bbEmotion.y;

        touch = document.getElementById("robobo-touch");
        touch.setAttribute("cx", cx);
        touch.setAttribute("cy", cy);
        setElementVisibility(touch, 1);

    }
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

/** Sets the position of the FACE sensor in the Robobo view widget.
    It also makes the FACE sensor visible. */
function setFacePosition(dist,x,y) {
    if (faceLost==0 && dist != null && dist != "none" && x != null && y != null) {

        bbEmotion = document.getElementById("robobo-view").getBBox();
        xScale = bbEmotion.width / 100;
        yScale = bbEmotion.height / 100;
        var cx = xScale * x + bbEmotion.x;
        var cy = yScale * y + bbEmotion.y;

        face = document.getElementById("robobo-face");
        bbFace = face.getBBox();
        cx = cx - bbFace.width/2;
        cy = cy - bbFace.height/2;

        face.setAttribute("x", cx);
        face.setAttribute("y", cy);

        setElementVisibility(face, 1);

    }
}

/** Sets the position of the BLOB sensor in the Robobo view widget.
    It also makes the BLOB sensor visible. */
function setBlobPosition(color, size, x, y) {

    if (color != null && size != null && x != null && y != null) {

        ball = document.getElementById("robobo-ball");

        if (size == 0) {
            setElementVisibility(ball, 0);
        }
        else {

            bbEmotion = document.getElementById("robobo-view").getBBox();
            xScale = bbEmotion.width / 100;
            yScale = bbEmotion.height / 100;
            var cx = xScale * x + bbEmotion.x;
            var cy = yScale * y + bbEmotion.y;


            bbBall = ball.getBBox();
            cx = cx - bbBall.width/2;
            cy = cy - bbBall.height/2;

            ball.setAttribute("x", cx);
            ball.setAttribute("y", cy);

            setElementVisibility(ball, 1);
        }

    }
}

/** Hides al the sensors (IRs, obstacles, face, ball, etc.) shown in the
    Robobo status page */
function hideAllSensors() {

    hideAllIrs();

    touch = document.getElementById("robobo-touch");
    setElementVisibility(touch, 0);

    fling = document.getElementById("robobo-fling");
    setElementVisibility(fling, 0);

    face = document.getElementById("robobo-face");
    setElementVisibility(face, 0);

    ball = document.getElementById("robobo-ball");
    setElementVisibility(ball, 0);

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
        setElementVisibility(document.getElementById("robobo-face", 0));
    });

    rem.registerCallback("onFall",function() {});
    rem.registerCallback("onGap",function() {});
    rem.registerCallback("onLowBatt",function() {});
    rem.registerCallback("onLowOboBatt",function() {});
    rem.registerCallback("onNewClap",function() {});

    rem.registerCallback("onNewTap", function() {
        //update TAP position in robobo emotion face
        var tapX = rem.getTapCoord('x');
        var tapY = rem.getTapCoord('y')
        var tapSensor =  tapX + ' | ' + tapY;
        setElementHTML("tap-sensor-value", tapSensor);
        setTapPosition(tapX, tapY);
    });

    rem.registerCallback("onNewFling",function() {
        //update fling angle in robobo emotion face
        var flingAngle = rem.checkFlingAngle();
        setFlingAngle(flingAngle);
        setElementHTML("fling-sensor-value", rem.checkFlingAngle());
    });

    rem.registerCallback("onAccelChanged", function() {});

    rem.registerCallback("onObstacle", function() {
        //TODO
    });

    rem.registerCallback("onBrightnessChanged", function() {});

    rem.registerCallback("onError", function() {});
    rem.registerCallback("onConnectionChanges", function() {});

    rem.registerCallback("onNewNote", function() {});



}

/** This function updates sensing data by polling to the remote library.
    It is mean to be called periodically using JS setInverval() */
function updateSensors() {

    //update brightness sensor
    setElementHTML("brightness-sensor-value", rem.getBrightness());

    //update acceleration sensor
    var accelSensor = rem.getAcceleration('x') + ' | ' + rem.getAcceleration('y') + ' | ' + rem.getAcceleration('z');
    setElementHTML("accel-sensor-value", accelSensor);

    //update orientation sensor
    var orSensor = rem.getOrientation('yaw') + ' | ' + rem.getOrientation('pitch') + ' | ' + rem.getOrientation('roll');
    setElementHTML("orientation-sensor-value", orSensor);

    //update batteries
    var robBat = rem.checkBatt();
    setElementHTML("rob-batery-value", robBat);
    var oboBat = rem.checkOboBatt();
    setElementHTML("obo-batery-value", oboBat);
    updateBatteryChart(oboBat, robBat);

    //update pan-tilt position
    setElementHTML("pan-sensor-value", rem.getPan());
    setPanAngle(rem.getPan());
    setElementHTML("tilt-sensor-value", rem.getTilt());
    setTiltAngle(rem.getTilt());

    //update face position
    var faceX = rem.getFaceCoord('x');
    var faceY = rem.getFaceCoord('y');
    var faceDist = rem.getFaceDist();
    var faceSensor = faceX + ' | ' + faceY;
    setElementHTML("facepos-sensor-value", faceSensor);
    setFacePosition(faceDist, faceX, faceY);
    setElementHTML("facedist-sensor-value", rem.getFaceDist());

    //update BLOB position
    var blobX = rem.getBlobCoord("green","x");
    var blobY = rem.getBlobCoord("green","y");
    var blobSize = rem.getBlobSize("green");
    setBlobPosition("green", blobSize, blobX, blobY);

}
