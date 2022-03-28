# zcjs: Zero-crossing visualisation in Javascript

## Basic Usage
The library can be included from the audioBLAST content delivery network (CDN):

```html
<script type="text/javascript" src="https://cdn.audioblast.org/zcjs/zcjs.js"></script>
```
A HTML element for the plot should be created in the desired position on the page:

```html
<div id="plot-here" width="100%"></div>
```
Plotting a zero-crossing file from a url:

```html
<script type="text/javascript">
  p = new ZCJS("plot-here");
  p.setURL("demo.ZC");
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

## Plotting Options
The default plot values are meant to provide acceptable output in the majority of cases, however they may need to be tweaked. These options are designed to be independant of the library used for plotting.

To use the plotting functionality you will need to include a plotting library alongside this library:

```html
<script type="text/javascript" src="https://cdn.audioblast.org/zcjs/zcjs.js"></script>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
```

### x-axis
The default setting for `x_range` is `"ms"` giving an expanded view of a zero-crossing file suitable for bats. A value of `"auto"` will fit the dataset to the available screen width. An array may be used to specify the initial range to display.

```javascript
p.x_range = "ms";
```

![x_range = ms](https://github.com/BioAcoustica/zcjs/blob/master/imgs/x_range-ms.png?raw=true "x_range = ms")

```javascript
p.x_range = "auto";
```

![x_range = auto](https://github.com/BioAcoustica/zcjs/blob/master/imgs/x_range-auto.png?raw=true "x_range = auto")

```javascript
p.x_range = [0,0.2];
```

![x_range = array](https://github.com/BioAcoustica/zcjs/blob/master/imgs/x_range-array.png?raw=true "x_range = array")

### y-axis
The default setting for `y_range` is `"nonzero"` which fits the axis to the available screen height ignoring any zero values. A value of `"auto"` will fit all data into the plot. An array may be used to specify the initial range to display.

```javascript
p.y_range = "nonzero";
```
![y_range = nonzero](https://github.com/BioAcoustica/zcjs/blob/master/imgs/y_range-nonzero.png?raw=true "y_range = nonzero")

```javascript
p.y_range = "auto";
```
![y_range = auto](https://github.com/BioAcoustica/zcjs/blob/master/imgs/y_range-auto.png?raw=true "y_range = auto")

```javascript
p.y_range = [10000,120000];
```
![y_range = array](https://github.com/BioAcoustica/zcjs/blob/master/imgs/y_range-array.png?raw=true "y_range = array")

By default zooming of the y axis is prevented, so the zoom functionality of the plots only zooms the time (x) axis. This may be changed as follows:

```javascript
p.y_fixed = false;
```

### Time compression
Time compression removes periods where there is no acoustic activity. This is identified by a frequency value less than the lowest displayed when y_range is specified as an array, or otherwise below 0.001.

```javascript
p.x_compress = false;
```
![x_compress = false](https://github.com/BioAcoustica/zcjs/blob/master/imgs/x_compress-false.png?raw=true "x_compress = false")

```javascript
p.x_compress = true;
```
![x_compress = true](https://github.com/BioAcoustica/zcjs/blob/master/imgs/x_compress-true.png?raw=true "x_compress = true")

This process skews the time axis, so that values on that axis no longer relate to positions within the original file. For annotation purposes it is possible to use the properties `_c_time` and `_c_time_orig` to map to the original time.

## Reading Anabat header information
The example below just extracts the Anabat header data without plotting the file:

```javascript
p = new ZCJS();
p.setURL("demo.ZC");
var anabatHeaders = p.anabatHeader();
```

## Background
This library follows the R code [AnabatTools](http://peterwilson.id.au/Rcode/AnabatTools.R) by Peter Wilson to read Anabat data. This work itself was made possible by Chris Corben's documention of the [Anabat File Format](http://users.lmi.net/corben/fileform.htm#Anabat%20File%20Formats). This library was originally designed for visualising zero-crossing files for the [BioAcoustica](http://bio.acousti.ca) project. Hosting is provided by [audioBLAST](https://audioblast.org).

## Licence
This work is licenced under the GNU Public License version 3.

## Contributing
Contributions and questions are welcomed. Please eithe [raise an issue](https://github.com/BioAcoustica/zcjs/issues) on GitHub or email edwbaker@gmail.com. Everyone is expected to follow the [Code of Conduct](https://github.com/BioAcoustica/zcjs/blob/master/CODE_OF_CONDUCT.md).

The author is interested in receiving examples of the library in use, please feel free to email!
