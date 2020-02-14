# zcjs: Zero-crossing visualisation in Javascript

## Usage
The library can be included from the audioBLAST CDN:

```html
<script type="text/javascript" src="https://cdn.audioblast.org/zcjs/zcjs.js"><script>
```
A HTML element for the plot should be created in the desired position on the page:

```html
<div id="plot-here" width="100%"></div>
```
Plotting a zero-crossing file from a url:

```html
<script type="text/javascript">
  p = new ZCJS("plot-here");
  p.url("demo.ZC");
</script>
```

The chart is plotted as soon as the data has been downloaded and decoded.

### Alternative data sources
It is possible to directly plot data, both inputs should be numerical arrays of the same length:

```html
<script type="text/javascript">
  p = new ZCJS("plot-here");
  p.setData(time, freq);
</script>
```

## Background
This library follows the R code [AnabatTools](http://peterwilson.id.au/Rcode/AnabatTools.R) by Peter Wilson to read Anabat data. This work itself was made possible by Chris Corben's documention of the [Anabat File Format](http://users.lmi.net/corben/fileform.htm#Anabat%20File%20Formats). This library was originally designed for visualising zero-crossing files for the [BioAcoustica](http://bio.acousti.ca) project. Hosting is provided by [audioBLAST](https://audioblast.org).

## Licence
This work is licenced under the GNU Public License version 3.

## Stats and privacy
By default this library sends some usage data to the server at https://api.audioblast.org. These numbers help justify some of the effort spent on this library by the author to their employers. This data is rather basic. At present the only data sent are:
* Library version (e.g. 1.0)
* If you use the library to decode a file: what kind of file (e.g. Anabat 130)
* If you make a plot, what plotting library is used (e.g. Plotly)
This data is sent asynchonously only after the action it relates to has been performed so it should not interfere with the speed at which the library operates.

This functionality can easily be overriden as follows:
```html
<script type="text/javascript">
  var p = new ZCJS();
  p.noStats();
</script>
```

## Contributing
Contributions and questions are welcomed. Please eithe [raise an issue](https://github.com/BioAcoustica/zcjs/issues) on GitHub or email edwbaker@gmail.com. Everyone is expected to follow the [Code of Conduct](https://github.com/BioAcoustica/zcjs/blob/master/CODE_OF_CONDUCT.md).
