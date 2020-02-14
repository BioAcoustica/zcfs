//Library class
class ZCJS {
constructor(target) {
  this.target = target;
}

plotZC(url, target) {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = "arraybuffer";
  req.onload = function (event) {
    var arrayBuffer = req.response;
    if (arrayBuffer) {
      var rawData = new Uint8Array(arrayBuffer);
      var data =ZCJS.readAnabat(url, rawData);
      data.timeData = data.timeData.map(function(element){return element/1000000;});
      var zcplot = document.getElementById(target);
      var plot_width = zcplot.clientWidth;
      var x_range_max = 900  / plot_width;
      var y_range_min = Math.min.apply(null, data.frequencyData.filter(Boolean));
      var y_range_max = Math.max.apply(Math, data.frequencyData);
      Plotly.plot( zcplot,
          [{
             x: data.timeData,
             y: data.frequencyData,
             type: 'scatter',
             mode: 'markers',
             marker: {size: 3}
          }], 
          {
            margin: { t: 0 },
            xaxis: {range: [0, x_range_max]},
            yaxis: {fixedrange: true, range: [y_range_min, y_range_max]}
          }
      );
    }
  }
  req.send();
}

static readAnabat = function(name, rawData) {
  var nBytes = rawData.length;
  var fileType = rawData[3];
  var parameterPoint = rawData[0] + 256 * rawData[1];
  var params = ZCJS.getParams(parameterPoint, rawData);
  var dataPoint  = rawData[parameterPoint] + 256 * rawData[parameterPoint + 1] - 1;
  if (fileType == 129) {
    var timeResult = ZCJS.getData129(dataPoint, params, rawData);
  } else {
    var timeResult = ZCJS.getData130(dataPoint, params, fileType, rawData);
  }
  var RES1 = 25000;
  var freqResult = ZCJS.calcfreq(params, timeResult.timeData, timeResult.last_t);
  var freq = freqResult.freq;
  var showDot = freqResult.showDot;

  //TODO: need badPts?

  var data = {
    frequencyData: freq,
    showDot: showDot,
    timeData: timeResult.timeData
  };
  return(data);
}

static getParams = function(parameterPoint, rawData) {
  var RES1 = rawData[parameterPoint + 2] + 256 * rawData[parameterPoint + 3];
  if (RES1 != 25000) {
    var timeFactor = 25000/RES1;
  } else {
    var timeFactor = 1;
  }
  var DIVRAT = rawData[parameterPoint + 4];
  var VRES = rawData[parameterPoint + 5];
  var params = {
    RES1: RES1,
    DIVRAT: DIVRAT,
    VRES: VRES,
    timeFactor: timeFactor
  };
  return(params);
}


static getData129 = function(dataPoint, params, rawData) {

}

static getData130 = function(dataPoint, params, fileType, rawData) {
  var p = dataPoint;
  var time = 0;
  var dif = 0;
  var lastdiff = 0;
  var t = 1;
  var s = 0;
  var timeData = new Array();
  var showDot = new Array(0,1);
  var nBytes = rawData.length;

  if ((params.RES1 > 60000) || (params.RES1 < 10000)) { return(null); }

  while ((p < nBytes) && (t <  16384)) {
    if (rawData[p] < 128) {
      dif = rawData[p];
      if (dif > 63) { dif = -1*(ZCJS.bitFlip(dif,6) + 1); }
      lastdiff = lastdiff + dif;
      time = time + Math.floor(params.timeFactor * lastdiff + 0.5);
      timeData.push(time);
      t++;
      p++;
    } else {
      if (rawData[p] >= 224) {
        if (fileType > 130) {
          if (p >= nBytes) {break;}
          var c = rawData[p] & 3;
          s = rawData[p+1];
          if ((t+s-1) > 16384) { s=16384 - t;}
          for (var i = t; i < t+s; i++) {
            showDot[i]=c;
          }
          p += 2;
        } else {
          //TODO: Filetype 130
        }
      } else {
        if ((128 <= rawData[p]) && (rawData[p] <= 159)) {
          if ((p+1) >= nBytes) {break; }
          dif = 256 * (rawData[p] & 31) + rawData[p+1];
          lastdiff = dif;
          time = time+ Math.floor(params.timeFactor*lastdiff + 0.5);
          timeData.push(time);
          t++;
          p += 2;
        } else {
          if ((160 <= rawData[p]) && (rawData[p] <= 191)) {
            if ((p+2) >= nBytes) {break; }
            dif = 256*256*(rawData[p] & 31) + 256*rawData[p+1] + rawData[p+2];
            lastdiff  = dif;
            time = time + Math.floor(params.timeFactor*lastdiff + 0.5);
            timeData.push(time);
            t++;
            p += 3;
          } else {
            if ((192 <= rawData[p]) && (rawData[p] <= 239)) {
              if ((p+3) >= nBytes) {break; }
              dif = 256*256*256*(rawData[p] & 31) + 256*256*rawData[p+1] + 256*rawData[p+2] + rawData[p+3];
              lastdiff = dif;
              time = time + Math.floor(params.timeFactor*lastdiff + 0.5);
              timeData.push(time);
              t++;
              p += 4;
            }
          }
        }
      }
    }
  }
  var ret = {
    timeData: timeData,
    last_t: t,
    showDot: showDot
  }
  return(ret);
}

static bitFlip = function(v, digits) {        return ~v & (Math.pow(2, digits) - 1);    }

static calcfreq= function(params, timeData, N) {
  var DIVRAT = params.DIVRAT;
  var freq = Array(0,0);
  var showDot = Array(0,1);
  var t = 2;

  var Tmin = Math.ceil(DIVRAT*4);
  var Tmax = Math.floor(DIVRAT*250);
  if (Tmin < 48) { Tmin = 48;}
  if (Tmax > 12589) { Tmax = 12589; }

  while (t <= N) {
    var td = timeData[t] - timeData[t-2];
    if ((td >= Tmin) && (td <= Tmax)) {
      freq.push(Math.trunc(DIVRAT*1000000/td));
      showDot.push(2);
    } else {
      freq.push(0);
      showDot.push(0);
    }
    t++;
  }
  var ret = {
    freq:freq,
    showDot:showDot
  };
  return(ret);
}
}
