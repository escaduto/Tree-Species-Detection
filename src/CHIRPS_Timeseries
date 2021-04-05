/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var boundary = ee.FeatureCollection("users/escaduto/Arganier"),
    roi = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-12.392366439299167, 32.581402895790205],
          [-12.392366439299167, 28.205049992053823],
          [-7.031038314299167, 28.205049992053823],
          [-7.031038314299167, 32.581402895790205]]], null, false),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    central = ee.FeatureCollection("users/escaduto/NEW_CentRegion"),
    northern = ee.FeatureCollection("users/escaduto/NEW_NorthRegion"),
    southern = ee.FeatureCollection("users/escaduto/NEW_SouthRegion");
/***** End of imports. If edited, may not auto-convert in the playground. *****/


var arr = [];

var i;
var m;
for (i = 1984; i < 2020; i++) { 
  //for (m = 1; m < 13; m++) { 
    
    var startyr = String(i - 1)
    
    // wet season 
    var wet_season = ee.Image(ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
                       .filterDate(startyr + '-10-01', String(i) + '-07-01')
                       .select('precipitation')
                       .sum()).clip(boundary).clip(southern)
                       
                       
    var annual = ee.Image(ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
                       .filter(ee.Filter.calendarRange(i, i,'year'))
                       .select('precipitation')
                       .sum()).clip(boundary).clip(southern)
    
    
    var bounds = ee.Feature(boundary.geometry())
    var south = ee.Feature(southern.geometry())
    var north = ee.Feature(northern.geometry())
    var center = ee.Feature(central.geometry())
    
    
    print(bounds.intersection(south).geometry().area())
    print(bounds.intersection(center).geometry().area())
    print(bounds.intersection(north).geometry().area())
    print(bounds.geometry().area())


    var precip_dryseason = annual.select('precipitation').subtract(wet_season.select('precipitation'))
    // Map.setCenter(-9.10494420200348,30.381270007865055, 8);
    // Map.addLayer(precip_dryseason, '', 'Precipitation');
  
    // Sum the values 
    var stats = precip_dryseason.select(['precipitation']).reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: boundary,
      scale: 4000
    });

    arr.push(i, stats.get('precipitation'));
    

}

console.log(arr);
print(arr)


// // create timeseries plot 
// var image = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
//                     .filter(ee.Filter.calendarRange(1984, 2019,'year'))
//                     .filter(ee.Filter.calendarRange(1,12,'month'))
//                     .select('precipitation');

// // Set chart labels, type, etc. 
// var plotOptions = {
//   title: 'Precipitation Timeseries Source: CHIRPS',
//   hAxis: {title: 'Time'},
//   vAxis: {title: 'Total Precipitation (mm/mm/pentad)'},
//   lineWidth: 1
// };

// // clips to region 
// var precipitation = image.map(
//     function(img) {
//         return img.clip(boundary)
//                   .copyProperties(img, ['system:time_start']);
//     });

// Map.setCenter(-9.10494420200348,30.381270007865055, 8);
// //Map.addLayer(precipitation, precipitationVis, 'Precipitation');

// // Call timeseries plot function, add .setOptions() 
// var precipChart = ui.Chart.image.series(precipitation, boundary, ee.Reducer.sum(), 1000)
//                   .setOptions(plotOptions);
// print(precipChart)



// // clips to region 
// var northern_precip = image.map(
//     function(img) {
//         return img.clip(northern)
//                   .copyProperties(img, ['system:time_start']);
//     });

// // clips to region 
// var central_precip = image.map(
//     function(img) {
//         return img.clip(central)
//                   .copyProperties(img, ['system:time_start']);
//     });
    
// // clips to region 
// var southern_precip = image.map(
//     function(img) {
//         return img.clip(southern)
//                   .copyProperties(img, ['system:time_start']);
//     });


// var n_precipChart = ui.Chart.image.series(northern_precip, boundary, ee.Reducer.sum(), 1000)
//                   .setOptions(plotOptions);
// print(n_precipChart)

// var c_precipChart = ui.Chart.image.series(central_precip, boundary, ee.Reducer.sum(), 1000)
//                   .setOptions(plotOptions);
// print(c_precipChart)

// var s_precipChart = ui.Chart.image.series(southern_precip, boundary, ee.Reducer.sum(), 1000)
//                   .setOptions(plotOptions);
// print(s_precipChart)

// /*
// // export annual averaged precipitation data from CHIRPS
// var i;

// for (i = 1984; i < 2019; i++) { 
//   print(String(i));
  
//   // TOA collection 
//   var image = ee.Image(ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
//                     .filter(ee.Filter.calendarRange(i, i,'year'))
//                     .filter(ee.Filter.calendarRange(1,12,'month'))
//                     .select('precipitation')
//                     .median()); 
                     
                     
                     
//   var clip = image.clip(arganRegion);
  
//   Map.setCenter(-9.10494420200348,30.381270007865055, 6);
//   Map.addLayer(clip);
  
//   Export.image.toDrive({
//     image: clip.unmask(-9999),
//     description: 'CHIRPS_Precip_' + String(i),
//     scale: 100,
//     region: roi,
//     fileFormat: 'GeoTIFF',
//     folder: 'CHIRPS',
//     crs : 'EPSG:4326'
//   });
// }
  
// */