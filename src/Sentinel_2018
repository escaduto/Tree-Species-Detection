/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var arganSample = ee.FeatureCollection("users/escaduto/ArganSampled_Poly30"),
    boundary = ee.FeatureCollection("users/escaduto/Study_Region_DIS"),
    roi = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-10.223404502153016, 32.225428858897025],
          [-10.223404502153016, 28.905846306266493],
          [-7.213150595903016, 28.905846306266493],
          [-7.213150595903016, 32.225428858897025]]], null, false),
    arganier = ee.FeatureCollection("users/escaduto/Arganier"),
    central = ee.FeatureCollection("users/escaduto/NEW_CentRegion"),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS");
/***** End of imports. If edited, may not auto-convert in the playground. *****/


function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

// TOA collection 
var image = ee.Image(ee.ImageCollection('COPERNICUS/S2')
                      .filter(ee.Filter.calendarRange(2019, 2019,'year'))
                      .filter(ee.Filter.calendarRange(6,9,'month'))
                      .filterBounds(roi)
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                      .map(maskS2clouds)
                      .median())
  
                   
var image = image.select(
    ['B2', 'B3', 'B4', 'B5', 'B8', 'B11', 'B12'], // old names
    ['BLUE', 'GREEN', 'RED', 'REDEDGE', 'NIR', 'SWIR1', 'SWIR2']  // new names
  );


//var mosaic = image.mosaic()
var clip = image.clip(arganRegion);


var rgbVis = {
  min: 0.0,
  max: 0.3,
  bands: ['RED', 'BLUE', 'GREEN'],
};

var ndvi = image.normalizedDifference(['NIR','RED']).rename('NDVI');
  // ADVANCED VEGETATION INDEX (AVI) 
var AVI = clip.expression(
    'cbrt((NIR + 1) * (256 - RED) * (NIR - RED))', {
      'RED': clip.select('RED'),
      'NIR': clip.select('NIR')
}).rename('AVI');

// BARE SOIL INDEX (BSI) 
// (SWIR + Red) / (SWIR + NIR)
var BSI = clip.expression(
    '(((SWIR + RED) - (NIR-GREEN) / ((SWIR + RED)  - (NIR-GREEN))) * 100 + 100)', {
      'GREEN': clip.select('GREEN'),
      'NIR': clip.select('NIR'),
      'RED': clip.select('RED'),
      'SWIR': clip.select('SWIR1')
}).rename('BSI');


// SHADOW (SI) 
var SI = clip.expression(
    'sqrt((256 - GREEN) * (256 - BLUE)* (256 - RED))', {
      'GREEN': clip.select('GREEN'),
      'BLUE': clip.select('BLUE'),
      'RED': clip.select('RED')
}).rename('SI');

// Map.addLayer(SI);

// Add bands to an image.
var newImage = clip.addBands(ndvi);
var newImage = newImage.addBands(SI);
var newImage = newImage.addBands(BSI);
var newImage = newImage.addBands(AVI);

var sample = BSI.addBands(AVI);

// Set some information about the input to be used later.
var scale = 30;
var bandNames = newImage.bandNames();

// Mean center the data to enable a faster covariance reducer
// and an SD stretch of the principal components.
var meanDict = newImage.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: arganRegion,
    scale: scale,
    maxPixels: 1e9
});
var means = ee.Image.constant(meanDict.values(bandNames));
var centered = newImage.subtract(means);

// This helper function returns a list of new band names.
var getNewBandNames = function(prefix) {
  var seq = ee.List.sequence(1, bandNames.length());
  return seq.map(function(b) {
    return ee.String(prefix).cat(ee.Number(b).int());
  });
};

// This function accepts mean centered imagery, a scale and
// a region in which to perform the analysis.  It returns the
// Principal Components (PC) in the region as a new image.
var getPrincipalComponents = function(centered, scale, region) {
  // Collapse the bands of the image into a 1D array per pixel.
  var arrays = centered.toArray();

  // Compute the covariance of the bands within the region.
  var covar = arrays.reduceRegion({
    reducer: ee.Reducer.centeredCovariance(),
    geometry: arganRegion,
    scale: scale,
    maxPixels: 1e9
  });

  // Get the 'array' covariance result and cast to an array.
  // This represents the band-to-band covariance within the region.
  var covarArray = ee.Array(covar.get('array'));

  // Perform an eigen analysis and slice apart the values and vectors.
  var eigens = covarArray.eigen();

  // This is a P-length vector of Eigenvalues.
  var eigenValues = eigens.slice(1, 0, 1);
  // This is a PxP matrix with eigenvectors in rows.
  var eigenVectors = eigens.slice(1, 1);

  // Convert the array image to 2D arrays for matrix computations.
  var arrayImage = arrays.toArray(1);

  // Left multiply the image array by the matrix of eigenvectors.
  var principalComponents = ee.Image(eigenVectors).matrixMultiply(arrayImage);

  // Turn the square roots of the Eigenvalues into a P-band image.
  var sdImage = ee.Image(eigenValues.sqrt())
    .arrayProject([0]).arrayFlatten([getNewBandNames('sd')]);

  // Turn the PCs into a P-band image, normalized by SD.
  return principalComponents
    // Throw out an an unneeded dimension, [[]] -> [].
    .arrayProject([0])
    // Make the one band array image a multi-band image, [] -> image.
    .arrayFlatten([getNewBandNames('pc')])
    // Normalize the PCs by their SDs.
    .divide(sdImage);
};

// Get the PCs at the specified scale and in the specified region
var pcImage = getPrincipalComponents(centered, scale, arganRegion);

// Plot each PC as a new layer
for (var i = 0; i < bandNames.length().getInfo(); i++) {
  var band = pcImage.bandNames().get(i).getInfo();
  Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band);
}

/*
// Select only NDVI band from new Image 
var newNDVI = newImage.select('BSI')

// Select only true color RGB bands from new Image 
var truecolor = newImage.select('B4', 'B3', 'B2')

// define color and display parameters 
var ndviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};


Map.setCenter(-9.10494420200348,30.381270007865055, 7);
Map.addLayer(truecolor, rgbVis)
//Map.addLayer(newNDVI, ndviParams, 'NDVI image');

var bands = ['B2', 'B3', 'B4', 'B5', 'B7', 'B8', 'NDVI', 'SI', 'BSI', 'AVI'];
//
var classProperty = 'landType'
// Select new image with only applicable bands 
// Get the values for all pixels in each polygon in the training.
var training = newImage.select(bands).sampleRegions({
  // Get the sample from the polygons FeatureCollection.
  collection: arganSample,
  // Keep this list of properties from the polygons.
  properties: [classProperty],
  // Set the scale to get Landsat pixels in the polygons.
  scale: 10
});


// Make a Random Forest classifier and train it.
var classifier = ee.Classifier.randomForest(100).train({
  features: training,
  classProperty: classProperty,
  inputProperties: bands
});

var classified = newImage.select(bands).classify(classifier);

// Create a palette to display the classes.
var palette =['99B898', 'white'];

var clip_classi = classified.clip(arganRegion);
Map.addLayer(clip_classi, {min: 0, max: 1, palette:palette},
  'classification');
//Map.addLayer(arganSample);
//Map.addLayer(arganier);
/*
// Remap values.
var slopereclass = classified.add(10).ceil();


var bandNames = classified.bandNames();
print('Band names: ', bandNames); // ee.List of band names

Export.image.toDrive({
  image: classified.unmask(-9999),
  description: 'imageToDriveExample',
  scale: 10,
  region: roi,
  fileFormat: 'GeoTIFF',
  crs : 'EPSG:4326',
  formatOptions: {
    cloudOptimized: true
  }
});
*/

//print('RF error matrix: ', classifier.confusionMatrix());
//print('RF accuracy: ', classifier.confusionMatrix().accuracy());

/*
// split training dataset by 80 20 or 60 40 
var withRandom =training.randomColumn('random');

// We want to reserve some of the data for testing, to avoid overfitting the model.
var split = 0.7;  // Roughly 70% training, 30% testing.
var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
var testingPartition = withRandom.filter(ee.Filter.gte('random', split));

// Trained with 70% of our data.
var trainedClassifier = ee.Classifier.randomForest(10).train({
  features: trainingPartition,
 classProperty: 'landType',
  inputProperties: bands
});

// Classify the test FeatureCollection.
var test = testingPartition.classify(trainedClassifier);
// Print the confusion matrix.
var confusionMatrix = test.errorMatrix(classProperty, 'classification');

//print('Confusion Matrix', confusionMatrix);
//print('Resubstitution error matrix: ', trainAccuracy);
//print('Validation overall accuracy: ', confusionMatrix.accuracy());

*/