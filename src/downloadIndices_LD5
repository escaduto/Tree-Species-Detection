/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var boundary = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    roi = 
    /* color: #0b4a8b */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-12.356768580970765, 33.3290847095142],
          [-12.356768580970765, 28.31253203815623],
          [-7.5447568622207655, 28.31253203815623],
          [-7.5447568622207655, 33.3290847095142]]], null, false),
    geometry = 
    /* color: #ffc82d */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-12.224932643470765, 33.273990961323484],
          [-12.224932643470765, 28.138292407933232],
          [-7.5667295184707655, 28.138292407933232],
          [-7.5667295184707655, 33.273990961323484]]], null, false),
    argan = ee.FeatureCollection("users/escaduto/Arganier");
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


var i;

for (i = 1985; i < 2012; i++) { 
  
  print(String(i));


  // TOA collection 
  var image = ee.Image(ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                     .filter(ee.Filter.calendarRange(i, i+3,'year'))
                     .filter(ee.Filter.calendarRange(6,9,'month'))
                     .filterBounds(roi)
                     .map(cloudMaskL457)
                     //.sort("CLOUD_COVERAGE_ASSESSMENT")
                     .mean());
                     
  var image = image.select(
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'], // old names
    ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']  // new names
  );

  //var mosaic = image.mosaic()
  var clip = image.clip(boundary);
  
  var visParams = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000,
  gamma: 1.4,
  }; 
  
  var truecolor = clip.select('B4', 'B3', 'B2')
  Map.setCenter(-9.10494420200348,30.381270007865055, 6);
  Map.addLayer(truecolor, visParams, String(i))
  Map.addLayer(argan)

  
  // ADVANCED VEGETATION INDEX (AVI) 
  var AVI = clip.expression(
      'cbrt((BAND_4 + 1) * (256 - BAND_3) * (BAND_4 - BAND_3))', {
        'BAND_3': clip.select('B4'),
        'BAND_4': clip.select('B5')
  }).rename('AVI');
  Map.addLayer(AVI);
  
  // BARE SOIL INDEX (BSI) 
  var BSI = clip.expression(
      '(((BAND_4 + BAND_2) - BAND_3) / ((BAND_4 + BAND_2) + BAND_3)) * 2', {
        'BAND_2': clip.select('B3'),
        'BAND_3': clip.select('B4'),
        'BAND_4': clip.select('B5')
  }).rename('BSI');
 // Map.addLayer(BSI);
  
  // SHADOW (SI) 
  var SI = clip.expression(
      'sqrt((256 - BAND_2) * (256 - BAND_3))', {
        'BAND_2': clip.select('B3'),
        'BAND_3': clip.select('B4')
  }).rename('SI');
 // Map.addLayer(SI);

  Export.image.toDrive({
    image: SI.unmask(-9999),
    description: 'LD5_SI_'+ String(i),
    scale: 100,
    region: roi,
    fileFormat: 'GeoTIFF',
    folder: 'ArganProject/VegetationIndices',
    crs : 'EPSG:4326',
    formatOptions: {
      cloudOptimized: true
    }
  });
  
  Export.image.toDrive({
    image: BSI.unmask(-9999),
    description: 'LD5_BSI_'+ String(i),
    scale: 100,
    region: roi,
    fileFormat: 'GeoTIFF',
    folder: 'ArganProject/VegetationIndices',
    crs : 'EPSG:4326',
    formatOptions: {
      cloudOptimized: true
    }
  });
 
  Export.image.toDrive({
    image: AVI.unmask(-9999),
    description: 'LD5_AVI_'+ String(i),
    scale: 100,
    region: roi,
    fileFormat: 'GeoTIFF',
    folder: 'ArganProject/VegetationIndices',
    crs : 'EPSG:4326',
    formatOptions: {
      cloudOptimized: true
    }
  });
  
  
}
