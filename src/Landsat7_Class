/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var arganBoundary = ee.FeatureCollection("users/escaduto/Arganier"),
    roi = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-10.736999849576364, 31.684392767098824],
          [-10.736999849576364, 29.145603816655566],
          [-8.451843599576364, 29.145603816655566],
          [-8.451843599576364, 31.684392767098824]]], null, false),
    geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-11.33516881137848, 32.790674538818266],
          [-11.33516881137848, 28.201490913517784],
          [-7.43502232700348, 28.201490913517784],
          [-7.43502232700348, 32.790674538818266]]], null, false),
    arganSample = ee.FeatureCollection("users/escaduto/ArganSampled_Poly30"),
    boundary = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS");
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

for (i = 1999; i < 2019; i++) { 
  print(String(i));
  
  // TOA collection 
  var image = ee.Image(ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
                     .filter(ee.Filter.calendarRange(i, i+3,'year'))
                     .filter(ee.Filter.calendarRange(6,9,'month'))
                     .filterBounds(roi)
                     .map(cloudMaskL457)
                     .sort("CLOUD_COVERAGE_ASSESSMENT")
                     .median()); 
                     
  var image = image.select(
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B7'], // old names
      ['B2', 'B3', 'B4', 'B5', 'B6', 'B7']  // new names
  );
  
  //var mosaic = image.mosaic()
  var clip = image.clip(boundary);
  
  // Select only true color RGB bands from new Image 
  var truecolor = clip.select('B4', 'B3', 'B2')
  
  var visParams = {
    bands: ['B4', 'B3', 'B2'],
    min: 0,
    max: 3000,
    gamma: 1.4,
  };
  
  Map.setCenter(-9.10494420200348,30.381270007865055, 8);
  Map.addLayer(truecolor, visParams)
  //Map.addLayer(newNDVI, ndviParams, 'NDVI image');
  
  var bands = ['B2', 'B3', 'B4', 'B5', 'B6'];
  //'B5', 'B6', 'B7', 'NDVI'
  
  var classProperty = 'landType'
  // Select new image with only applicable bands 
  // Get the values for all pixels in each polygon in the training.
  var training = clip.select(bands).sampleRegions({
    // Get the sample from the polygons FeatureCollection.
    collection: arganSample,
    // Keep this list of properties from the polygons.
    properties: [classProperty],
    // Set the scale to get Landsat pixels in the polygons.
    scale: 30
  });
  
  // Make a Random Forest classifier and train it.
  var classifier = ee.Classifier.randomForest(60).train({
    features: training,
    classProperty: classProperty,
    inputProperties: bands
  });
  
  var classified = clip.select(bands).classify(classifier);

  //Map.addLayer(visualization);
  
  //var bandNames = classified.bandNames();
  //print('Band names: ', bandNames); // ee.List of band names
  
  Export.image.toDrive({
    image: classified.unmask(-9999),
    description: 'RFClass_LD7_' + String(i),
    scale: 100,
    region: geometry,
    folder: 'RF_Classification',
    fileFormat: 'GeoTIFF',
    crs : 'EPSG:4326',
    formatOptions: {
      cloudOptimized: true
    }
  });
 
}