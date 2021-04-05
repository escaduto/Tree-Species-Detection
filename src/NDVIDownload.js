/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    roi = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-11.785436603126527, 32.63810068188672],
          [-11.785436603126527, 28.303048449435035],
          [-7.303014728126527, 28.303048449435035],
          [-7.303014728126527, 32.63810068188672]]], null, false),
    CA_ROI = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-125.03382411129985, 42.297032731481615],
          [-125.03382411129985, 32.29109671292249],
          [-113.95960536129985, 32.29109671292249],
          [-113.95960536129985, 42.297032731481615]]], null, false),
    CA = ee.FeatureCollection("users/escaduto/California");
/***** End of imports. If edited, may not auto-convert in the playground. *****/

// Landsat8 
var i;
var m;
for (i = 2012; i < 2020; i++) { 
  //for (m = 1; m < 13; m++) { 
    print(String(i));
    
    var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1_8DAY_NDVI')
                       .filter(ee.Filter.calendarRange(i, i,'year'))
                       .filter(ee.Filter.calendarRange(1,4,'month'))
                       .select('NDVI')
                       .max()); 
                       
                       
    var clip = image.clip(CA);
    
    Map.setCenter(-120.46, 37.46, 6);
    Map.addLayer(clip);
    
    Export.image.toDrive({
      image: clip.unmask(-9999),
      description: 'NDVI_L8_' + String(i),
      scale: 100,
      maxPixels: 3784216672400,
      region: CA_ROI,
      fileFormat: 'GeoTIFF',
      folder: 'NDVI_MAX_100m',
      crs : 'EPSG:4326'
    });
}



/*
// Landsat7 
var n;

for (n = 1999; n < 2019; n++) { 
  print(String(n));
  
  var image = ee.Image(ee.ImageCollection('LANDSAT/LE07/C01/T1_8DAY_NDVI')
                     .filter(ee.Filter.calendarRange(n, n,'year'))
                     .filter(ee.Filter.calendarRange(7,9,'month'))
                     .select('NDVI')
                     .max()); 
                     
                     
  var clip = image.clip(arganRegion);
  
  Map.setCenter(-9.10494420200348,30.381270007865055, 6);
  Map.addLayer(clip);
  
  Export.image.toDrive({
    image: clip.unmask(-9999),
    description: 'NDVI_L7_' + String(n),
    scale: 30,
    region: roi,
    fileFormat: 'GeoTIFF',
    folder: 'NDVI',
    crs : 'EPSG:4326'
  });
  
}
*/


/*
// Landsat5 
// download NDVI from GEE from 1984 to 2013 
var p;

for (p = 1994; p < 1995; p++) { 
  print(String(p));
  
  var image = ee.Image(ee.ImageCollection('LANDSAT/LT05/C01/T1_8DAY_NDVI')
                     .filter(ee.Filter.calendarRange(p, p + 10,'year'))
                     .filter(ee.Filter.calendarRange(7,9,'month'))
                     .select('NDVI')
                     .mean()); 
                     
                     
  var clip = image.clip(arganRegion);
  
  Map.setCenter(-9.10494420200348,30.381270007865055, 6);
  Map.addLayer(clip);
  
  Export.image.toDrive({
    image: clip.unmask(-9999),
    description: 'NDVI_L5_' + String(p),
    scale: 30,
    maxPixels: 3784216672400,
    region: roi,
    fileFormat: 'GeoTIFF',
    folder: 'NDVI',
    crs : 'EPSG:4326'
  });
  
}

*/