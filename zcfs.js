function plotZC(url, target) {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = "arraybuffer";
  req.onload = function (event) {
    var arrayBuffer = req.response;
    if (arrayBuffer) {
      var rawData = new Uint8Array(arrayBuffer);
      document.getElementById(target).innerHTML= rawData;
      return(null);
    }
  }
}