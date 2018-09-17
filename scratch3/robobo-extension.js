var RoboboExtension = function () {

};


//var rem = undefined; //remote connection to the robot
/**
 * @return {object} This extension's metadata.
 */
RoboboExtension.prototype.getInfo = function () {
    return {
        // Required: the machine-readable name of this extension.
        // Will be used as the extension's namespace. Must not contain a '.' character.
        id: 'robobo',

        // Optional: the human-readable name of this extension as string.
        // This and any other string to be displayed in the Scratch UI may either be
        // a string or a call to `intlDefineMessage`; a plain string will not be
        // translated whereas a call to `intlDefineMessage` will connect the string
        // to the translation map (see below). The `intlDefineMessage` call is
        // similar to `defineMessages` from `react-intl` in form, but will actually
        // call some extension support code to do its magic. For example, we will
        // internally namespace the messages such that two extensions could have
        // messages with the same ID without colliding.
        // See also: https://github.com/yahoo/react-intl/wiki/API#definemessages
        name: 'Robobo Extension',

        // Optional: URI for an icon for this extension. Data URI OK.
        // If not present, use a generic icon.
        // TODO: what file types are OK? All web images? Just PNG?
        iconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAYAAADnRuK4AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAKYQAACmEB/MxKJQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAABP1SURBVHic7Z15cBvXfce/ewFYAARAErxBkRR1i7ZkSlESq60mcZ3GcZxxxh47tZuOnKZTt5OxJ03s1NPWSZuZOp3GdmwndqZ1ZuI2duzGraM49dHxbTc+JVuSdYuHeAsASQDEscBe/QOChMUhYhcEdkm+zwyG4GJ338O+L97xe7/3ewCBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQiqAsfj9CbVCX6kZLVeBUifdETNZCLfhb+N4QbJXX54uF8j0y3c00+L9OUcxVFEX1qEBzlfcnLAEUMKuq6qiqys/LkdCjkW90TmCJhFRNLXFBPDt2MP7bfve34GzfAeCo4p6E2pOClPlB+IHL78H+/TJK10wVY1RAuetobN3K+O86+O+gmRsN3otgBor8y/A92/biyBEZgHLuqG4RGRHQBfEAtP/nqb+DzXG3gfsQzCYjfDe8l78HWQEZEhFtMGkKAO295/1u2Bx3GLwHwWxsjrs89+zvQVYHhlojvQKizr1oADTbtvkvAPBGEiZYAgfXtvFrOFeeuFC+FWOkBsolwlCc/UoD1xMsBGWzfw4AgzrUQPkJ0AAY0EyfkUQJFiJbhgy0zVjFYqqqCQNFeXVeT7AcVCNMasIMd7wIliK/LHWXp9EaKJcoYWWQL6Ca10AwkhDB0hguz2qaMMLKoi5NWGGChJWB4bIk/RhCVRABEaqiWn+gFYsqS1BlGSpU0AwLimYAirTahaxeAamAnE5CTMYgZ1KQhRTkdAqKlIaqKKWvoSjQrA2MnQdj48E4eLAONzhnw6oV16oSkCpLSEfDEBMRiPEoFEnUeQMVipiGIqYhInL+MEUz4JwecG4vbF4/GNvq8alb+QJSVWQW5iDMByHG58vXLtUkocjIxOeRic8jcXYUHO+BvbEVdp8fFL2yH/GK/XaqoiAdCSIZHIcipuuYMCAmYxCTMSSmR+BoagPv7wLN2euXhzqy4gSkqgqE8BRS4cmKmigfz2Fjmxs9jU50+xzo8jngcbBwcgwcHAOGpiCIMhbSEgRRwXRMwNi8gLFICkOhOCYiQvm8KDJS4SkIczOw+9rgbO0GzdmW8uuazooSUCY+j8TkMORMquw5DE1h5xofPtnjw2DAi7XNrgr6v9z5d9u6PJpPgvE09o9H8cFYBG8NzyGZkYuuVhUFwtw00tEQnG1rwDd1rJhOt55vkZtAZQHYADj8T6jBmuRKJ4okIjE1hHQ0XPacfr8LX9jSgj/c0IImV21qAUFS8MbpWbx4PIj3xyJQy3gXs7wb7q51YHl3TfKhl/BNVCsAAUAGgISsf3RFvtHLXkBiIoqF8RNQxEzJzy/p9ODmnV24vLeprj/6kdkkHt8/iZdOhCArxWVB0TSc7b3gmzvrl6kyrE4BqUAyPI7k2TGU+qmvb3Hhtj192N5lrs/bZFTAw2+N4o3TsyU/t3v9cAfWZw2VJrH6BKSqiE+ehjB/tugjB8dg764AvjLYBYa2Tj/jwHgE9706jDPzxf0zxuGEt3fAtA52NQJadnNhqqIgduZoSfEMdHjwi69ehpt3BiwlHgAY7PbhZzdtxzUD7UWfyUIS0eFDkDPlR3RWZVkJSFVkxEY+RmZhXnOcooCbdgTw4+sH0NZgXXuLnaVx5xX9uPvzG+C0aZssOSMgOnQQspA0KXfGWD4CUlUsnDkOMRnTHOYYGt+7aiP+8vd6LFfrlOPKjS346Q2XosWtFbsiiYiOHqmv4bNKloeAVGBh8hQycW3N4+AY/OCaTfjser9JGTNOX7MT/3rjpVjrd2mOK2Ia0ZEjUGXJpJzpY1kIKBk8g/S8tr/usjF48LoB7OppNClX1eN32/DgdQPoLxCRnE4iduZYydGl1bC8gMREFMnQhOYYR1P4/tWbsLnNPENcSpSRSFdfS3gdLO69dgs6PNoZfDERRTI4XvX9a42lpzIUKYOFseOaXyJNAXdftQGfWOOrWz6C8TTeHJrFhxMxDIUTmI6lzxsHKQpoc9vR1+zEti4Pdq9tQm+TU9f9m1023HvtFvzVrw4jkrowf5cMjoFzecC56/dd9WJpO1Bs9EjRiGvvJ9fgzz7VXctkz3NgPILH90/ig7EIShiTy7K5rQE37ezEH/T7oadfv388gr9+5ogmLZqzoXHDYE3dQlakHSgdDReJZ3uXF7fsCtQ87ZmYgDv3HcXt/30E753RJx4AOHZ2AX//Pydw61OHcDIUr/i6Hd0+/Oku7Y9DETNIzozpy0AdsaSAVEVGYnpEc8zLc/jeVRtA13io/vrpWex94iDeHp1f/ORFOHZ2Abc+eQi/+miq4mtu2dWNbZ3aGf/U3DSkVOVCrCeW7AMlQ8VOYLfu7kFzjWbRczz90RQeemOk4hqHZVn0BjrR2tIMh92OTEZEeG4eI+MTSKezk7uiouLB10cwGUnj9j19i07o0jSFb1/Rj689/hHEXEZUFYmpYXj7L63i29UGy9VAqixBCE9rjm1ua8AXtrTVNN19h2fwwOuVi4fnHbh8x3b0965Bg8sFjmXhcvLoCXRi985BeD0NmvP/6+AU7n9tuKJ79zY5ccNgl+aYmIxBjEfKXGEelhNQKjwFVbnglEVRwB2fXaurM6qXAxNR3Fdh4WbzROGyrZvB86Wd5zmOxWUDm8Gy2gr+mUPTePbjmYrS2LsrAL9bW+NacVhvKQGpiozUrLa/sLuvCetba2fviaclfP/Fk1B09JRbmpvQ4HZd9By7zYZAR3Gt+cDrIxgvMSNfiINj8MeDWl8hMRGFmIiVucIcLCWgdCRUZMK/eWdXmbOXhkffHkc4XtoZrRxNvsp8jJoai89LSwp+9PpIibOL+dJAO3w8pzkmzE2XOdscLCYgrVnpsoAXAx2eMmdXTyiexm8O6y8Qhq7ssbFlnMTeOzOPg5OL1yQOjsF127TuH5nYrKaJNxvLCEjOCEUz7Vdvaa1pms8cmrkw0tFBUqjMbyeRLN9UPfVhZUP7q7e2a/p/qqIgHSvv+11vLCOgdCSksX3yHIM962q31YaqAi8eCxm6diYYhlLBROd0sPz93xmZQ6yCubQWt63ILTc9byzftcAyAiocou5Z1wwHVzs/4eHZBIJxY343KUHA6ZEzFz1nYvos5iLRsp+Lior9Y5UNy/9oc4vmfykRq8kKWyNYQkCqokBKLWiOfaq3tm4ah6eqG82MjE3g2KlhSLK2P6KoKkbGJnD05OlF73FwcmHRcwDgUwUrSlRVgZS0xmjMEpZoKan9RVFUtgNdS0bnqvc/HpucwtTZIJobfVlLtJjB7HwEmUxlQRvG5itzX21ycuhtcmJk9sL5YiJqiVl6Swio0LbR1+xCk5Mrc/bSEE7qG7qXQ5IknA0Z69SGdJgPBgO+AgFZowayRBMmZ7S/xK3tDWXOXDoE0fyhcKll0OXY2qE1psppazjfW0NAgna429NY+/g6rAXWpnNM5XlY06jd00aRREv4TZsvIBVF66HWNNV+AyC3w/zWu8FeeR56GvmimXw5vfiUSK0xXUCKLBZZVrt8tRdQwGv++rFAY+Xf08ExRe4scsb85T+mC6iUWd6r45dplFpO0FbKhlZ9vtOegueiKqQJKymgwlWbtWB7p8f0hYiDAX3D8MLnYoU5MfMFVGCIY2gKHFP7bLnsLHbVcWVHIV1eBza06KsFiYBKoWpN8lwda4VrBmrr5XgxvjjQpjteEVfoBWCBhYemC4hitL+qtKzoXgVhlN1rm7G2WV8/ZCnw2Fl8+dIO3dclC2xXZsYUymG+gAoegqrWz8hHU8A3P7O27uEK//zyNXAZ6OcVGh6JgFD6ISR0WGirZXuXF1/cWhyzp1YMBrz4UokYQZVQVAMxRECgGK5ofaxRNwuj3L6nD5vqMKxvddtx9+eNrW1TVCC0oH0uFFPb+cJKMF9ANA2a1Rr1xipwOl9K7CyNf7l2C3p0rmnXg4/ncO+Xtxhe2xaMpyFI2gEHY6+9wXUxTBcQUPwgKlm1sNT4eA4/uX4AAx1LP5Eb8DnwyA2X6A66kM/YXMEzoSgwFoh+b0kBDYXNmWn28hwevP4S3DjYtWRLqK/Y0IJHv7INgSqnZ0ZmE5r/GTtviWDl5s8oAmAd2jVWB6diUBS15uvgS8HRFL7x+724cqMfD785igMT5d1SL8b6Fhdu3d2zZAGwDkxo/X8Kn5lZWEJAnFvrfZhISzgRSpgaQGpjqxsPXDeAozMLeO5oEG8OzWIueXFPQ5edxad7G3HV5hZ8Yk3jklUQsqLi4KRWyJzL3PjXOSwhIMbGg+bsmoAK+8cjpgoox5b2Bmxpb8C3PtOP0bkkhmeTmIoK500NDpZGuycbYGq931WTWvN4MF5k2rCCOytgEQEB2VooPw7iK6dm8Sc7ax8LqFIoKhsYs88Ey/UrJ7Uus7TNbplN7SzRiQYAu0e7BuxUMI7hcKLM2asHWVHxUoGACp+VmVhGQLaGJtCs1jD2wjHrrMA0i/fHI5hLaJ3v7b7artjVg2UEBIqCzauN9/zc0RmkLOD8biZPf6Rdu8/YnZbZJgqwkoAAOBq17hVRQcK+w5XF01mJnAjG8W5BqD1Hk3VqH8BiAmJ5d9Hw9JcHppCWrLGMt9489p42PjbFsHA01W/itxIsJSAAcLZqo5TOJTK6glSuFA5PxfDWsHaPMb65w3K7QFtOQJzbB86pjQn02LvjmI4tv62QjKIoKu5/bVjjcEjRDBwW2N2wEMsJCACc7T0aFw9BUvDgG6Om5afePH1wGqdCWhMG3xIoGqVaAUsKiHN5i4aqbw3N4vljxZvMrTRGZpP4t99pQ8cwNgf4ltqG+jOKJQUEAK72PlCMtr3/4cvDGFrBxkVBlHH3cyeK/H5cnf2gKGsWlTVzBYBmObja+zTHMrKCf3jhpK6gBMuJe18dxuic1pXF7muFrcG6W1pZVkAA4Ghqg71R25SNzCZx17PHIMora2j/s3fG8MIxbZBRxsbD3dVvUo4qw9ICAgB3Zz8Yh3YC88BEFN99Xl9sZyvz60Mz+Pm72iDiFEWjoWeTJVZeXAzLC4iiGXi6NxXZP94cmsU/vXQakry8RbTv8Azuf21Ie5AC3IF1lnEauxiWFxBwbl/1tVtBFazMfPFYEHf85uiy7RM9/sEEfvjKUNFCSld7r6UmTC/GshAQALB8Axq6Nxb5AX8wlt2kLVTnpUDVkJEV/PPLQ/jp/xVHeuX9XeD91vGDWoxlIyAAsHma0RAoFtGRmQXc8sRBvHOm+j2+as34fAq3PnUIvy2x6Qrv7ywaeVqdZSUgALD7/PD2bi3qXEZTIu7cdxQPvTFqifiHhagq8NuPZ/D1Jw8WWZlBZZstV8dafZuQWgBL75l6MaRUHLEzR6GIxZFOW9123Lanr6aR7vVwKpTAfa8O4ePp4rjQFE3D1dUPh8+8SCHV7Jm6bAUEZANNLoyfKLsR22C3D3t3BWoec7ocE5EU/uP9SbxwPFjS5MDYHGhYs8l0B7FqBGQt3wCd0CwHb98AksFxJINjRfFyDoxHcGA8gks6PbhpRxc+3dtYl6hkx87G8Z8fTuGVU+Gytiq71w9317qi6ZrlxrKugfKRhATik6chJctvH9Do5HDFhhZ8blMLNra6l3QXxOmYgJdOhPDi8TDOzJVfWUtzdrg6+mAvcN81k1XbhBWhAkLkLJIzo1Ckiy8C9PIcLuvyYke3B5vbG9Dt4yuOzSgqKiYjKZwKJfDhRAwHxiOYjC7ir0RR4Ju74Gzrtpx1mQioAFWRIcxNIxWaXFRI+bS4bej08vA4WPAcA6eNBkNRSGYUCJKMqCAhuCBgOpaGXOE0CkXRsDe1wekPgLaZHwyhFKu2D1QOimbA+wNwNHUiPX8WwtwMJGFxN5BQPKNr/4qLQbM22BtbwTd3guZqu125maxIAeWgaBqO5g44mjsgCQmk54NIR0Mlh/5Lkx4Dm6cp64Lh9lkiekatWdECyod1uMB29MHV0QdZSCKTiEBMRCElFwwLiqIZsE43OJcPnNsLjm9YFaLJZ9UIKB/G4QTvcII/56SuKhLkdAqykIIiZaDIElRFPhfDWgVFM6AYFhTNgGY5MHYejJ0Hza7cpqlSVqWACqFoFizfAJav/TZTK41lNxdGsBZEQISqIAIiVAUREKEqiIAIVUEERKgKIiBCVRABEaqiWgEt70VZBKDKMqxOQIpiLIw7wTKoqlLVUpZqBKRCFseqSZxgPpQkjqGKWsiIgNRcgkpi7hWjCROsgbIQzpXh+XLVg9EaSAWgCm899guoav33ZiIsDaoqCG8/+SQMigfQLyA176Ukn7hrWgmPPmIkYYL5yKHRh5KPf3sSF1xYdQupmiZMASDPfWfLQ+pC+FkD9yGYiBoL75v/my0PA5ChFZAujNZAyrmXDEEQZ28LfFOZPvUjqMryiXCwWlEUQZo+ed/s7YFvQRBEXBCQIRHpXV9C5f3NvWjIMlL/+9B+JRl7lmlbl6RYOw+KtlE0bY0tZVY5qixFkEmeVsKjTyd//Y93xX/y1ZchyxkA4rmXhAtCAnSISK8D7wXRZMXHnXvZ896z5z7LFxnBPPL7NjKyYskJJ5333lBTptelNXdjBVlhSAWfKecywiArMiIg89H0WZEtMwnZNWC52sdwE2bUJzqXocJjuQzmaqBcH4uIyBzyf/C58skXUX7TZWgYb0RAKrKCUAqO5RRO571IDWQuat5fBfmDH23nWXffJ0c1hZvfoabz/uYLhwjIfNSCV35zlV/zGKqBqi3cwlFZ/nuq4ByCOeQLRC3xf/45ulmqwqVKvCfCsRalxFK1O85SFzIRzfKA+HERCAQCgUAgEAgEAoGw+vh/c2BFeWCn44oAAAAASUVORK5CYII=',

        // Optional: Link to documentation content for this extension.
        // If not present, offer no link.
        docsURI: 'https://....',

        // Required: the list of blocks implemented by this extension,
        // in the order intended for display.
        blocks: [
            {
                opcode: 'connect',
                func:'connectToRobobo',
                text: 'Connect at ip [IP]',
                blockType: Scratch.BlockType.COMMAND,
                arguments: {
                    IP: {
                        type: Scratch.ArgumentType.STRING,
                        
                        defaultValue: '192.168.0.5'
                    }
                    
                }
            }
                
        ],

        // Optional: define extension-specific menus here.
        

        // Optional: translations
        

        // Optional: list new target type(s) provided by this extension.
        
    };
};



RoboboExtension.prototype.noop = function () {
};

RoboboExtension.prototype.connectToRobobo = function (args) {
    var ip = args.IP.trim();
    var port = 40404
    var WebSocketClient = require('websocket').client
    console.log("before");
   //var ws = new WebSocket('ws://'+ip+':'+port);
    console.log("after");

};

RoboboExtension.prototype.returnTrue = function () {
    return true;
};

RoboboExtension.prototype.returnFalse = function () {
    return false;
};

Scratch.extensions.register(new RoboboExtension());
