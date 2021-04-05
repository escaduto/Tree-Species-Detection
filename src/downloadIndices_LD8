/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-12.466210640884697, 32.939708884196115],
          [-12.466210640884697, 28.425400225857008],
          [-7.829980172134697, 28.425400225857008],
          [-7.829980172134697, 32.939708884196115]]], null, false),
    boundary = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    roi = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-12.246484078384697, 32.77358965899664],
          [-12.246484078384697, 28.676308135774196],
          [-7.786034859634697, 28.676308135774196],
          [-7.786034859634697, 32.77358965899664]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/

function maskL8sr(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  // Get the pixel QA band.
  var qa = image.select('pixel_qa');
  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}


var i;

for (i = 2012; i < 2019; i++) { 
  
  print(String(i));


  // TOA collection 
  var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                     .filter(ee.Filter.calendarRange(i, i+3,'year'))
                     .filter(ee.Filter.calendarRange(6,9,'month'))
                     .filterBounds(roi)
                     .map(maskL8sr)
                     .sort("CLOUD_COVERAGE_ASSESSMENT")
                     .mean());
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

  
  // ADVANCED VEGETATION INDEX (AVI) 
  var AVI = clip.expression(
      'cbrt((BAND_4 + 1) * (256 - BAND_3) * (BAND_4 - BAND_3))', {
        'BAND_3': clip.select('B4'),
        'BAND_4': clip.select('B5')
  }).rename('AVI');
//  Map.addLayer(AVI);
  
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
    description: 'LD8_SI_'+ String(i),
    scale: 100,
    region: geometry,
    fileFormat: 'GeoTIFF',
    folder: 'ArganProject/VegetationIndices',
    crs : 'EPSG:4326',
    formatOptions: {
      cloudOptimized: true
    }
  });
  
  Export.image.toDrive({
    image: BSI.unmask(-9999),
    description: 'LD8_BSI_'+ String(i),
    scale: 100,
    region: geometry,
    fileFormat: 'GeoTIFF',
    folder: 'ArganProject/VegetationIndices',
    crs : 'EPSG:4326',
    formatOptions: {
      cloudOptimized: true
    }
  });

  Export.image.toDrive({
    image: AVI.unmask(-9999),
    description: 'LD8_AVI_'+ String(i),
    scale: 100,
    region: geometry,
    fileFormat: 'GeoTIFF',
    folder: 'ArganProject/VegetationIndices',
    crs : 'EPSG:4326',
    formatOptions: {
      cloudOptimized: true
    }
  });
  
  
}
