/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var arganSample = ee.FeatureCollection("users/escaduto/ArganSampled_Poly30"),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    boundary = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    roi = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-11.65480904426579, 32.14821021232132],
          [-11.65480904426579, 28.66218851356228],
          [-7.3042231067657895, 28.66218851356228],
          [-7.3042231067657895, 32.14821021232132]]], null, false);
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


// TOA collection 
var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                   .filter(ee.Filter.calendarRange(2015, 2015+3,'year'))
                   .filter(ee.Filter.calendarRange(6,9,'month'))
                   .filterBounds(roi)
                   .map(maskL8sr)
                   .sort("CLOUD_COVERAGE_ASSESSMENT")
                   .mean()); 

//var mosaic = image.mosaic()
var clip = image.clip(boundary);


var bands = ['B2', 'B3', 'B4', 'B5', 'B6'];
//'B5', 'B6', 'B7', 'NDVI'

var classProperty = 'landType'

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
var classifierRF = ee.Classifier.randomForest(60).train({
    features: training,
    classProperty: classProperty,
    inputProperties: bands
});
  
var classifiedRF = clip.select(bands).classify(classifierRF);

//print('RF error matrix: ', classifierRF.confusionMatrix());
//print('RF Training accuracy: ', classifierRF.confusionMatrix().accuracy());


// split training dataset by 80 20 or 60 40 
var withRandom =training.randomColumn('random');

// We want to reserve some of the data for testing, to avoid overfitting the model.
var split = 0.7;  // Roughly 70% training, 30% testing.
var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
var testingPartition = withRandom.filter(ee.Filter.gte('random', split));

// Trained with 70% of our data.
var trainedClassifier = ee.Classifier.randomForest(60).train({
  features: trainingPartition,
  classProperty: 'landType',
  inputProperties: bands
});


// Classify the validation data.
var classified = trainingPartition.classify(trainedClassifier);
// Get a confusion matrix representing expected accuracy.
var trainAccuracy = trainedClassifier.confusionMatrix();
//print('Validation error matrix: ', testAccuracy);
print('Training accuracy: ', trainAccuracy.accuracy());

// Classify the validation data.
var validated = testingPartition.classify(trainedClassifier);

// Get a confusion matrix representing expected accuracy.
var testAccuracy = validated.errorMatrix(classProperty, 'classification');

/*
var exportAccuracy = ee.Feature(null, {matrix: testAccuracy.array()})

// Export the FeatureCollection.
Export.table.toDrive({
  collection: ee.FeatureCollection(exportAccuracy),
  description: 'exportAccuracy',
  fileFormat: 'CSV'
});
*/

//print('Validation error matrix: ', exportAccuracy);
print('Testing accuracy: ', testAccuracy.accuracy());


