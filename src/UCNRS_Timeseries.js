/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var boundary = ee.FeatureCollection("users/escaduto/2008_FirePerimeter_Full_LH"),
    roi = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-122.14433352986697, 36.82331274811072],
          [-122.14433352986697, 35.70276393768996],
          [-120.55131595174197, 35.70276393768996],
          [-120.55131595174197, 36.82331274811072]]], null, false),
    kirk = ee.FeatureCollection("users/escaduto/1999_KirkFire_Perimeter"),
    basin = ee.FeatureCollection("users/escaduto/2008_BasinFire_Perimeter"),
    chalk = ee.FeatureCollection("users/escaduto/2008_ChalkFire_Perimeter"),
    basin_sample = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-121.61741545114614, 36.17520538454093],
          [-121.61741545114614, 36.16550503965363],
          [-121.60488417062857, 36.16550503965363],
          [-121.60488417062857, 36.17520538454093]]], null, false),
    kirk_sample = 
    /* color: #ffc82d */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-121.53278639230825, 36.09548841386],
          [-121.53278639230825, 36.08480712436648],
          [-121.51939680490591, 36.08480712436648],
          [-121.51939680490591, 36.09548841386]]], null, false),
    chalk_sample = 
    /* color: #00ffff */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-121.48300459299185, 36.02763063411097],
          [-121.48300459299185, 36.01569049595886],
          [-121.46892836008169, 36.01569049595886],
          [-121.46892836008169, 36.02763063411097]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/

var cloudMaskL457 = function(image) {
  var qa = image.select('pixel_qa');
  // If the cloud bit (5) is set and the cloud confidence (7) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
  // Remove edge pixels that don't occur in all bands
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image.updateMask(cloud.not()).updateMask(mask2);
};

  // TOA collection 
var NDVI = ee.ImageCollection('LANDSAT/LE07/C01/T1_ANNUAL_NDVI')
                     .filterDate('1999-01-01', '2018-12-30')
                     .select('NDVI');


// timeseries 
// Set chart labels, type, etc. 
var PDSIoptions = {
  title: 'TimeSeries',
  hAxis: {title: 'Time'},
  vAxis: {title: 'unit'},
  lineWidth: 1
};

// Call timeseries plot function, add .setOptions() 
var NDVIChart = ui.Chart.image.series(NDVI, kirk, ee.Reducer.mean(), 1000)
                .setOptions(PDSIoptions);
print(NDVIChart);


// Analysis by Region 
var regions = ee.FeatureCollection([
  ee.Feature(    // North.
    kirk_sample, {label: 'Kirk'}),
  ee.Feature(  // Central.
    basin_sample, {label: 'Basin Complex'}),
  ee.Feature(  // South.
    chalk_sample, {label: 'Chalk'})
]);


var RAW_NDVI = ee.ImageCollection("LANDSAT/LE07/C01/T1_ANNUAL_NDVI")
                  .filterDate('1999-01-01', '2018-12-31')
                  .select('NDVI');
                  

// Call seriesByRegion plot function, set chart type, and add .setOptions() 
var NDVITimeSeries = ui.Chart.image.seriesByRegion(
    RAW_NDVI, regions, ee.Reducer.mean(), 'NDVI', 1000,'system:time_start', 'label')
        .setChartType('ScatterChart')
        .setOptions({
          title: 'NDVI Regional Timeseries',
          vAxis: {title: 'NDVI'},
          lineWidth: 1,
          pointSize: 4,
          series: {
            0: {color: 'FF0000'}, // north
            1: {color: '00FF00'}, // central
            2: {color: '0000FF'}  // south
}});

var RAW_NBRT = ee.ImageCollection('LANDSAT/LE07/C01/T1_ANNUAL_NBRT')
                  .filterDate('1999-01-01', '2018-12-31')
                  .select('NBRT');
                  
                  
// Call seriesByRegion plot function, set chart type, and add .setOptions() 
var NBRTTimeSeries = ui.Chart.image.seriesByRegion(
    RAW_NBRT, regions, ee.Reducer.mean(), 'NBRT', 1000,'system:time_start', 'label')
        .setChartType('ScatterChart')
        .setOptions({
          title: 'NBRT Regional Timeseries',
          vAxis: {title: 'NBRT'},
          lineWidth: 1,
          pointSize: 4,
          series: {
            0: {color: 'FF0000'}, // north
            1: {color: '00FF00'}, // central
            2: {color: '0000FF'}  // south
}});


var RAW_NDWI = ee.ImageCollection('LANDSAT/LE07/C01/T1_ANNUAL_NDWI')
                  .filterDate('1999-01-01', '2018-12-31')
                  .select('NDWI');
                  
                  
// Call seriesByRegion plot function, set chart type, and add .setOptions() 
var NDWITimeSeries = ui.Chart.image.seriesByRegion(
    RAW_NDWI, regions, ee.Reducer.mean(), 'NDWI', 1000,'system:time_start', 'label')
        .setChartType('ScatterChart')
        .setOptions({
          title: 'NDWI Regional Timeseries',
          vAxis: {title: 'NDWI'},
          lineWidth: 1,
          pointSize: 4,
          series: {
            0: {color: 'FF0000'}, // north
            1: {color: '00FF00'}, // central
            2: {color: '0000FF'}  // south
}});

Map.addLayer(kirk);
Map.addLayer(chalk);
Map.addLayer(basin);
// Display NDWI Time Series
print(NDVITimeSeries);
print(NBRTTimeSeries);
print(NDWITimeSeries);
