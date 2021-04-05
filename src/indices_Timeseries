/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-11.526348701832376, 33.82103446832902],
          [-11.526348701832376, 29.176990557654946],
          [-7.043926826832376, 29.176990557654946],
          [-7.043926826832376, 33.82103446832902]]], null, false),
    table = ee.FeatureCollection("users/escaduto/Arganier_DIS");
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

// filter by month and year June to Sept 
// TOA collection 
var image = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                     .filter(ee.Filter.calendarRange(1985, 2018,'year'))
                     .filter(ee.Filter.calendarRange(7,8,'month'))
                     .filterBounds(roi)
                     .map(cloudMaskL457);
                     //.sort("CLOUD_COVERAGE_ASSESSMENT");
                     
var image = image.select(
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'], // old names
    ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']  // new names
  );

var clip = image.map(function(img) {return img.clip(table)})

var AVI = clip.map(function(img) {
  return img.expression(
      'cbrt((BAND_4 + 1) * (256 - BAND_3) * (BAND_4 - BAND_3))', {
        'BAND_3': img.select('B4'),
        'BAND_4': img.select('B5') })
        .rename("AVI")
        .copyProperties(img, ['system:time_start'])
      });
      
  
var BSI = clip.map(function(img) {
  return img.expression(
      '(((BAND_4 + BAND_2) - BAND_3) / ((BAND_4 + BAND_2) + BAND_3)) * 2', {
        'BAND_2': img.select('B3'),
        'BAND_3': img.select('B4'),
        'BAND_4': img.select('B5') })
        .rename("BSI")
        .copyProperties(img, ['system:time_start'])
      });

var SI = clip.map(function(img) {
  return img.expression(
      'sqrt((256 - BAND_2) * (256 - BAND_3))', {
        'BAND_2': img.select('B3'),
        'BAND_3': img.select('B4') })
        .rename("SI")
        .copyProperties(img, ['system:time_start'])
      });

// Set chart labels, type, etc. 
var PDSIoptions = {
  title: 'TimeSeries',
  hAxis: {title: 'Time'},
  vAxis: {title: 'unit'},
  lineWidth: 1
};

// Call timeseries plot function, add .setOptions() 
var AVIChart = ui.Chart.image.series(AVI, table, ee.Reducer.mean(), 1000)
                .setOptions(PDSIoptions);
print(AVIChart);

var SIChart = ui.Chart.image.series(SI, table, ee.Reducer.mean(), 1000)
                .setOptions(PDSIoptions);
print(SIChart);


var BSIChart = ui.Chart.image.series(BSI, table, ee.Reducer.mean(), 1000)
                .setOptions(PDSIoptions);
print(BSIChart);