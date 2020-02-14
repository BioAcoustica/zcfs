//Library class
class ZCJS {
  constructor(target) {
    this._target = document.getElementById(target);
    this._plotMethod = "plotly";
  }

  setURL(newfile) {
    this._url= newfile;
    this._source = "url";
    this.process_url();
  }

  setData(time, freq) {
    this._time = time;
    this._freq = freq;
    this.plotZC();
  }

  process_url() {
    var instance = this;
    var req = new XMLHttpRequest();
    req.open("GET", this._url, true);
    req.responseType = "arraybuffer";
    req.onload = function (event) {
      var arrayBuffer = req.response;
      if (arrayBuffer) {
        var rawData = new Uint8Array(arrayBuffer);
        instance._fileRawData = rawData;
        instance.identifyFile();
        if (instance._fileVendor == "Anabat") {
          var data = instance.readAnabat();
          data.timeData = data.timeData.map(function(element){return element/1000000;});
          instance.setData(data.timeData, data.frequencyData);
        }
      }
    }
    req.send();
  }

  plotZC() {
    if (this._plotMethod == "plotly") {this.plotPlotly();}
  }

  plotPlotly() {
    var zcplot = this._target;
    var plot_width = zcplot.clientWidth;
    var x_range_max = 900  / plot_width;
    var y_range_min = Math.min.apply(null, this._freq.filter(Boolean));
    var y_range_max = Math.max.apply(Math, this._freq);
    Plotly.plot( zcplot,
        [{
           x: this._time,
           y: this._freq,
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

  identifyFile() {
    var check_anabat = this._fileRawData[3];
    var anabats = [129, 130, 131, 132];
    if (anabats.includes(check_anabat)) {
      this._fileVendor = "Anabat";
      this._fileVendorVersion = check_anabat;
    }
  }

  readAnabat() {
    var parameterPoint = this._fileRawData[0] + 256 * this._fileRawData[1];
    var params = ZCJS.getParams(parameterPoint, this._fileRawData);
    var dataPoint  = this._fileRawData[parameterPoint] + 256 * this._fileRawData[parameterPoint + 1] - 1;
    var timeResult = null;
    if (this._fileVendorVersion == 129) {
      timeResult = ZCJS.getData129(dataPoint, params, rawData);
    } else {
      timeResult = ZCJS.getData130(dataPoint, params, this._fileVendorVersion, this._fileRawData);
    }

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
  
  static getParams(parameterPoint, rawData) {
    var RES1 = rawData[parameterPoint + 2] + 256 * rawData[parameterPoint + 3];
    var timeFactor = 1;
    if (RES1 != 25000) {
      timeFactor = 25000/RES1;
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
  
  
  static getData129(dataPoint, params, rawData) {
  
  }
  
  static getData130(dataPoint, params, fileType, rawData) {
    var p = dataPoint;
    var time = 0;
    var dif = 0;
    var lastdiff = 0;
    var t = 1;
    var s = 0;
    var timeData = [];
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
    };
    return(ret);
  }
  
  static bitFlip(v, digits) {        return ~v & (Math.pow(2, digits) - 1);    }
  
  static calcfreq(params, timeData, N) {
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
