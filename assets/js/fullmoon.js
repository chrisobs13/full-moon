
// Julian Date
Date.prototype.getJulian = function() {
    return ((this / 86400000) - (this.getTimezoneOffset() / 1440) + 2440587.5);
};

// http://www.ben-daglish.net/moon.shtml
function moon_day(today) {
    var GetFrac = function(fr) {
        return (fr - Math.floor(fr));
    };
    var thisJD = today.getJulian();
    var year = today.getFullYear();
    var degToRad = 3.14159265 / 180;
    var K0, T, T2, T3, J0, F0, M0, M1, B1, oldJ;
    K0 = Math.floor((year - 1900) * 12.3685);
    T = (year - 1899.5) / 100;
    T2 = T * T;
    T3 = T * T * T;
    J0 = 2415020 + 29 * K0;
    F0 = 0.0001178 * T2 - 0.000000155 * T3 + (0.75933 + 0.53058868 * K0) - (0.000837 * T + 0.000335 * T2);
    M0 = 360 * (GetFrac(K0 * 0.08084821133)) + 359.2242 - 0.0000333 * T2 - 0.00000347 * T3;
    M1 = 360 * (GetFrac(K0 * 0.07171366128)) + 306.0253 + 0.0107306 * T2 + 0.00001236 * T3;
    B1 = 360 * (GetFrac(K0 * 0.08519585128)) + 21.2964 - (0.0016528 * T2) - (0.00000239 * T3);
    var phase = 0;
    var jday = 0;
    while (jday < thisJD) {
        var F = F0 + 1.530588 * phase;
        var M5 = (M0 + phase * 29.10535608) * degToRad;
        var M6 = (M1 + phase * 385.81691806) * degToRad;
        var B6 = (B1 + phase * 390.67050646) * degToRad;
        F -= 0.4068 * Math.sin(M6) + (0.1734 - 0.000393 * T) * Math.sin(M5);
        F += 0.0161 * Math.sin(2 * M6) + 0.0104 * Math.sin(2 * B6);
        F -= 0.0074 * Math.sin(M5 - M6) - 0.0051 * Math.sin(M5 + M6);
        F += 0.0021 * Math.sin(2 * M5) + 0.0010 * Math.sin(2 * B6 - M6);
        F += 0.5 / 1440;
        oldJ = jday;
        jday = J0 + 28 * phase + Math.floor(F);
        phase++;
    }

    // 29.53059 days per lunar month
    return (((thisJD - oldJ) / 29.53059));
}

function get_phase(phase) {
    var full_moon;
    var phase_moon_name;
    if (phase <= 0.0625 || phase > 0.9375) {
        full_moon = "Nope";
        phase_moon_name = "dark moon";
    } else if (phase <= 0.1875) {
        full_moon = "Nope";
        phase_moon_name = "waning crescent moon";
    } else if (phase <= 0.3125) {
        full_moon = "Nope";
        phase_moon_name = "last quarter moon";
    } else if (phase <= 0.4375) {
        full_moon = "Nope";
        phase_moon_name = "waning gibbous moon";
    } else if (phase <= 0.5625) {
        full_moon = "Yep";
        phase_moon_name = "full moon";
    } else if (phase <= 0.6875) {
        full_moon = "Nope";
        phase_moon_name = "waxing gibbous moon";
    } else if (phase <= 0.8125) {
        full_moon = "Nope";
        phase_moon_name = "first quarter moon";
    } else if (phase <= 0.9375) {
        full_moon = "Nope";
        phase_moon_name = "new moon";
    }

    return {
        fullmoon: full_moon,
        phasename: phase_moon_name
    };
}

function get_next_fullmoon() {
    var count = 1;
    var date = new Date();
    date = new Date(date.getTime() + (24 * 60 * 60 * 1000 * count));
    while( get_phase( moon_day( date ) ).fullmoon == "Nope" ) {
        date = new Date(date.getTime() + (24 * 60 * 60 * 1000 * count));
        count++;
    }
    return date;
}

function get_last_fullmoon() {
    var count = 1;
    var date = new Date();
    date = new Date(date.getTime() - (24 * 60 * 60 * 1000 * count));
    while( get_phase( moon_day( date ) ).fullmoon == "Nope" ) {
        date = new Date(date.getTime() - (24 * 60 * 60 * 1000 * count));
        count++;
    }
    return date;
}

function phase_junk(phase) {
    var sweep = [];
    var mag;
    // the "sweep-flag" and the direction of movement change every quarter moon
    // zero and one are both new moon; 0.50 is full moon
    if (phase <= 0.25) {
        sweep = [ 1, 0 ];
        mag = 20 - 20 * phase * 4
    } else if (phase <= 0.50) { 
        sweep = [ 0, 0 ];
        mag = 20 * (phase - 0.25) * 4
    } else if (phase <= 0.75) {
        sweep = [ 1, 1 ];
        mag = 20 - 20 * (phase - 0.50) * 4
    } else if (phase <= 1) {
        sweep = [ 0, 1 ];
        mag = 20 * (phase - 0.75) * 4
    } else { 
        exit; 
    }

    var current_phase = get_phase(phase);

    var full_moon_tag = document.getElementById("full_moon");
    full_moon_tag.innerText = current_phase.fullmoon;

    var phase_moon_name_tag = document.getElementById("moon_phase_name");
    phase_moon_name_tag.innerText = current_phase.phasename;

    var last_full_moon = document.getElementById("last-full-moon");
    last_full_moon.innerText = moment(get_last_fullmoon()).format("dddd, MMMM D");

    var next_full_moon = document.getElementById("next-full-moon");
    next_full_moon.innerText = moment(get_next_fullmoon()).format("dddd, MMMM D");

    var svg = document.getElementById("moon");
    // http://stackoverflow.com/questions/654112/how-do-you-detect-support-for-vml-or-svg-in-a-browser/5493614#5493614
    // https://github.com/Modernizr/Modernizr/blob/master/modernizr.js
    function supportsSVG() {
      return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
    }
    function supportsVML() {
        if (typeof supportsVml.supported == "undefined") {
            var a = document.body.appendChild(document.createElement('div'));
            a.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
            var b = a.firstChild;
            b.style.behavior = "url(#default#VML)";
            supportsVml.supported = b ? typeof b.adj == "object": true;
            a.parentNode.removeChild(a);
        }
        return supportsVml.supported;
    }
    if (supportsSVG()) {  
      // http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
      var d = "m100,0 ";
      d = d + "a" + mag + ",20 0 1," + sweep[0] + " 0,150 ";
      d = d + "a20,20 0 1," + sweep[1] + " 0,-150";
      // http://www.i-programmer.info/programming/graphics-and-imaging/3254-svg-javascript-and-the-dom.html
      var xmlns = "http://www.w3.org/2000/svg";
      var path = document.createElementNS(xmlns, 'path');
      var back = document.createElementNS(xmlns, 'path');
      back.setAttribute('class', 'moonback');
      back.setAttribute('d', "m100,0 a20,20 0 1,1 0,150 a20,20 0 1,1 0,-150");
      path.setAttribute('class', 'moonfront');
      path.setAttribute('d', d);
      svg.setAttribute('height', window.screen.availHeight * 0.8);
      svg.setAttribute('width', window.screen.availWidth * 0.8);
      svg.appendChild(back);
      svg.appendChild(path);
    } else if (supportsVML()) {
      // http://vectorconverter.svn.sourceforge.net/viewvc/vectorconverter/trunk/svg2vml.xsl?revision=2&view=markup
      // http://stackoverflow.com/questions/7677145/calling-xslt-from-javascript
      // this will be IE almost always anyways, so could use IE specific xslt
    }
}


phase_junk(moon_day(new Date()));

