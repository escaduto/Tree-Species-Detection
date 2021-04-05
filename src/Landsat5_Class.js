/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-11.773562772658693, 32.85612583973581],
          [-11.773562772658693, 28.086108240486308],
          [-7.390017850783693, 28.086108240486308],
          [-7.390017850783693, 32.85612583973581]]], null, false),
    geometry = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-11.41756627231598, 32.82553254428966],
          [-11.41756627231598, 28.18962965763676],
          [-7.30867955356598, 28.18962965763676],
          [-7.30867955356598, 32.82553254428966]]], null, false),
    arganSample = ee.FeatureCollection("users/escaduto/ArganSampled_Poly30"),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_CentRegion"),
    boundary = ee.FeatureCollection("users/escaduto/NEW_CentRegion"),
    arganBoundary = ee.FeatureCollection("users/escaduto/Arganier_DIS");
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

/*
var i;

for (i = 1984; i < 2012; i++) { 
  
  print(String(i));


  // TOA collection 
  var image = ee.Image(ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                     .filterDate(String(i) + '-06-01', String(i) + '-09-30')
                     .filterBounds(roi)
                     .map(cloudMaskL457)
                     //.sort("CLOUD_COVERAGE_ASSESSMENT")
                     .mean());
*/

// TOA collection 
var image = ee.Image(ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                   .filterDate('2000-06-01', '2000-10-30')
                   .filterBounds(roi)
                   .map(cloudMaskL457)
                   //.sort("CLOUD_COVERAGE_ASSESSMENT")
                   .median()); 
                   
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

Map.setCenter(-9.10494420200348,30.381270007865055, 9);
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


/*
// Create an SVM classifier with custom parameters.
var classifier = ee.Classifier.svm({
  kernelType: 'RBF',
  gamma: 0.1,
  cost: 10
});
*/


// Make a Random Forest classifier and train it.
var classifier = ee.Classifier.randomForest(50).train({
  features: training,
  classProperty: classProperty,
  inputProperties: bands
});

var classified = clip.select(bands).classify(classifier);

// Create a palette to display the classes.
var palette =['99B898', 'white'];

Map.addLayer(classified, {min: 0, max: 1, palette:palette},
  'classification');
//Map.addLayer(arganSample);


// Remap values.
var slopereclass = classified.add(10).ceil();

// Create a 3-band, 8-bit, color-IR composite to export.
var visualization = slopereclass.visualize({
  min: 10,
  max: 11
});

//Map.addLayer(visualization);
//Map.addLayer(arganBoundary);
//Map.addLayer(arganRegion);

var bandNames = classified.bandNames();
//print('Band names: ', bandNames); // ee.List of band names

Export.image.toDrive({
  image: classified.unmask(-9999),
  description: 'RFClass_LD5_',
  scale: 100,
  region: geometry,
  fileFormat: 'GeoTIFF',
  folder: 'RF_Classification',
  crs : 'EPSG:4326',
  formatOptions: {
    cloudOptimized: true
  }
});