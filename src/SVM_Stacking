/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi2 = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.79707214504242, 30.605264879507214],
          [-9.79707214504242, 30.321173826078958],
          [-9.46748230129242, 30.321173826078958],
          [-9.46748230129242, 30.605264879507214]]], null, false),
    roi = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-10.173321696815492, 31.420514669358397],
          [-10.173321696815492, 29.287652473965025],
          [-8.591290446815492, 29.287652473965025],
          [-8.591290446815492, 31.420514669358397]]], null, false),
    boundary = ee.FeatureCollection("users/escaduto/Study_Region_DIS"),
    arganSample2 = ee.FeatureCollection("users/escaduto/ArganSampled_Poly30"),
    arganSample = ee.FeatureCollection("users/escaduto/ArganSampled_Poly");
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

/*
// Obtain one single image representing 2016-2019 study area 
// do something about the clouds: use cloud masking band to 
// get rid of cloudy days
var image = ee.Image(ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
                   .filterDate('2016', '2019')
                   .filterBounds(roi)
                   .map(maskL8sr)
                   .mean());

*/

// TOA collection 
var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                   .filterDate('2018', '2019')
                   .filterBounds(roi)
                   .map(maskL8sr)
                   .sort("CLOUD_COVERAGE_ASSESSMENT")
                   .mean());   

//var mosaic = image.mosaic()
var clip = image.clip(boundary);

// Use image to calculate NDVI 
// Compute the Normalized Difference Vegetation Index (NDVI).
var nir = clip.select('B5');
var red = clip.select('B4');
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');

// stack NDVI layer as a band in the original image 
var image2 = clip.normalizedDifference(['B5', 'B4']).rename('NDVI');
var ndvi = image2.select('NDVI');

var trueColor432Vis = {
  min: 0.0,
  max: 0.4,
};

// Add bands to an image.
var newImage = clip.addBands(ndvi);

// Select only NDVI band from new Image 
var newNDVI = newImage.select('NDVI')

// Select only true color RGB bands from new Image 
var truecolor = newImage.select('B4', 'B3', 'B2')

// define color and display parameters 
var ndviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};


Map.setCenter(-9.10494420200348,30.381270007865055, 7);
Map.addLayer(truecolor, trueColor432Vis)
Map.addLayer(newNDVI, ndviParams, 'NDVI image');

var bands = ['B2', 'B3', 'B4', 'B5', 'B6'];
//'B5', 'B6', 'B7', 'NDVI'

var classProperty = 'landType'
// Select new image with only applicable bands 
// Get the values for all pixels in each polygon in the training.
var training = newImage.select(bands).sampleRegions({
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


var classifier = ee.Classifier.cart().train({
  features: training, 
  classProperty: classProperty, 
  inputProperties: bands
});

print('CART, explained', classifier.explain());
var classified = newImage.select(bands).classify(classifier);

/*
// Train the classifier.
var trained = classifier.train(training, 'landType', bands);

// Classify the image.
var classified = newImage.classify(trained);
*/

// Create a palette to display the classes.
var palette =['99B898', 'white'];

Map.addLayer(classified, {min: 0, max: 1, palette:palette},
  'classification');
Map.addLayer(arganSample);


Export.image.toDrive({
  image: classified,
  description: 'imageToDriveExample',
  scale: 30,
  maxPixels: 3e9
});


/*
// split training dataset by 80 20 or 60 40 
var withRandom =training.randomColumn('random');

// We want to reserve some of the data for testing, to avoid overfitting the model.
var split = 0.7;  // Roughly 70% training, 30% testing.
var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
var testingPartition = withRandom.filter(ee.Filter.gte('random', split));

// Trained with 70% of our data.
var trainedClassifier = ee.Classifier.randomForest().train({
  features: trainingPartition,
 classProperty: 'landType',
  inputProperties: bands
});

// Classify the test FeatureCollection.
var test = testingPartition.classify(trainedClassifier);
print(test);
// Print the confusion matrix.
var confusionMatrix = test.errorMatrix(classProperty, 'classification');

print('Confusion Matrix', confusionMatrix);
//print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', confusionMatrix.accuracy());

*/