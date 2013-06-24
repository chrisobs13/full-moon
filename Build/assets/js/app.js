(function() {
  var moon_day;

  Date.prototype.getJulian = function() {
    return (this / 86400000) - (this.getTimezoneOffset() / 1440) + 2440587.5;
  };

  moon_day = function(today) {
    var B1, B6, F, F0, GetFrac, J0, K0, M0, M1, M5, M6, T, T2, T3, degToRad, jday, oldJ, phase, thisJD, year;
    GetFrac = function(fr) {
      return fr - Math.floor(fr);
    };
    thisJD = today.getJulian();
    year = today.getFullYear();
    degToRad = 3.14159265 / 180;
    K0 = Math.floor((year - 1900) * 12.3685);
    T = (year - 1899.5) / 100;
    T2 = T * T;
    T3 = T * T * T;
    J0 = 2415020 + 29 * K0;
    F0 = 0.0001178 * T2 - 0.000000155 * T3 + (0.75933 + 0.53058868 * K0) - (0.000837 * T + 0.000335 * T2);
    M0 = 360 * (GetFrac(K0 * 0.08084821133)) + 359.2242 - 0.0000333 * T2 - 0.00000347 * T3;
    M1 = 360 * (GetFrac(K0 * 0.07171366128)) + 306.0253 + 0.0107306 * T2 + 0.00001236 * T3;
    B1 = 360 * (GetFrac(K0 * 0.08519585128)) + 21.2964 - (0.0016528 * T2) - (0.00000239 * T3);
    phase = 0;
    jday = 0;
    while (jday < thisJD) {
      F = F0 + 1.530588 * phase;
      M5 = (M0 + phase * 29.10535608) * degToRad;
      M6 = (M1 + phase * 385.81691806) * degToRad;
      B6 = (B1 + phase * 390.67050646) * degToRad;
      F -= 0.4068 * Math.sin(M6) + (0.1734 - 0.000393 * T) * Math.sin(M5);
      F += 0.0161 * Math.sin(2 * M6) + 0.0104 * Math.sin(2 * B6);
      F -= 0.0074 * Math.sin(M5 - M6) - 0.0051 * Math.sin(M5 + M6);
      F += 0.0021 * Math.sin(2 * M5) + 0.0010 * Math.sin(2 * B6 - M6);
      F += 0.5 / 1440;
      oldJ = jday;
      jday = J0 + 28 * phase + Math.floor(F);
      phase++;
    }
    return (thisJD - oldJ) / 29.53059;
  };

  $(function() {});

}).call(this);
