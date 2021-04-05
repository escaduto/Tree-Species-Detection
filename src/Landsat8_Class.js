/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi2 = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-9.79707214504242, 30.605264879507214],
          [-9.79707214504242, 30.321173826078958],
          [-9.46748230129242, 30.321173826078958],
          [-9.46748230129242, 30.605264879507214]]], null, false),
    roi = /* color: #98ff00 */ee.Geometry.Polygon(
        [[[-10.173321696815492, 31.420514669358397],
          [-10.173321696815492, 29.287652473965025],
          [-8.591290446815492, 29.287652473965025],
          [-8.591290446815492, 31.420514669358397]]], null, false),
    geometry = /* color: #0b4a8b */ee.Geometry.Polygon(
        [[[-11.71419713169098, 32.76294505233978],
          [-11.71419713169098, 28.240193604265464],
          [-7.34163853794098, 28.240193604265464],
          [-7.34163853794098, 32.76294505233978]]], null, false),
    boundary = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    arganSample = ee.FeatureCollection("users/escaduto/ArganSampled_Poly30"),
    arganier = ee.FeatureCollection("users/escaduto/Arganier");
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
                   .filterDate('2018-01-01', '2018-12-31')
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
//var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');



// stack NDVI layer as a band in the original image 
var image2 = clip.normalizedDifference(['B5', 'B4']).rename('NDVI');
var ndvi = image2.select('NDVI');


// ADVANCED VEGETATION INDEX (AVI) 
// TASSELLED CAP WETNESS
var AVI = image.expression(
    '(BAND_4 + 1) * (256 - BAND_3) * (BAND_4 - BAND_3)', {
      'BAND_3': clip.select('B4'),
      'BAND_4': clip.select('B5')
}).rename('AVI');

// BARE SOIL INDEX (BSI) 
var BSI = image.expression(
    '(((BAND_4 + BAND_2) - BAND_3) / ((BAND_4 + BAND_2) + BAND_3)) * 2', {
      'BAND_2': clip.select('B3'),
      'BAND_3': clip.select('B4'),
      'BAND_4': clip.select('B5')
}).rename('BSI');


// SHADOW (SI) 
var SI = image.expression(
    'sqrt((256 - BAND_2) * (256 - BAND_3))', {
      'BAND_2': clip.select('B3'),
      'BAND_3': clip.select('B4')
}).rename('SI');



var visParams = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};

// Add bands to an image.
var newImage = clip.addBands(ndvi);
var newImage = newImage.addBands(BSI);
var newImage = newImage.addBands(AVI);
var newImage = newImage.addBands(SI);

// Select only NDVI band from new Image 
var newNDVI = newImage.select('NDVI')

// Select only true color RGB bands from new Image 
var truecolor = newImage.select('B4', 'B3', 'B2')

// define color and display parameters 
var ndviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};


Map.setCenter(-9.10494420200348,30.381270007865055, 6);
Map.addLayer(truecolor, visParams)
Map.addLayer(newNDVI, ndviParams, 'NDVI image');


// Set some information about the input to be used later.
var scale = 30;
var bandNames = newImage.bandNames();

// Mean center the data to enable a faster covariance reducer
// and an SD stretch of the principal components.
var meanDict = newImage.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: boundary,
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
    geometry: boundary,
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
var pcImage = getPrincipalComponents(centered, scale, boundary);

// Plot each PC as a new layer
for (var i = 0; i < bandNames.length().getInfo(); i++) {
  var band = pcImage.bandNames().get(i).getInfo();
  Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band);
}

var bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'BSI', 'AVI', 'SI'];
//'B5', 'B6', 'B7', 'NDVI'

var classProperty = 'landType'

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
// export the training dataset into assets as table 
Export.table.toAsset({
  collection: training, 
  description: '', 
  assetId: 'ArganTrainingData'
});
*/

/*
// Use training dataset to classify images below 

var image2016 = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                   .filterDate('2016-01-01', '2016-12-31')
                   .filterBounds(roi)
                   .map(maskL8sr)
                   .sort("CLOUD_COVERAGE_ASSESSMENT")
                   .mean()); 

//var mosaic = image.mosaic()
var clip2016 = image2016.clip(boundary);
*/

/*

// Create an SVM classifier with custom parameters.
var classifierSVM = ee.Classifier.svm({
  kernelType: 'RBF',
  gamma: 0.1,
  cost: 10
});

// Train the classifier.
var trainedSVM = classifierSVM.train(training, classProperty, bands);

// Classify the image.
var classifiedSVM = clip2016.classify(trainedSVM);

//CART 
var classifierCart = ee.Classifier.cart().train({
  features: training, 
  classProperty: classProperty, 
  inputProperties: bands
});

print('CART, explained', classifierCart.explain());
var classifiedCart = clip2016.select(bands).classify(classifierCart);
*/


// Make a Random Forest classifier and train it.
var classifierRF = ee.Classifier.randomForest(50).train({
  features: training,
  classProperty: classProperty,
  inputProperties: bands
});



var classifiedRF = newImage.select(bands).classify(classifierRF);

// Create a palette to display the classes.
var palette =['99B898', 'white'];

var vis = {min: 0, max: 1, palette: palette};

Map.addLayer(classifiedRF, {min: 0, max: 1, palette:palette},
  'classification');
Map.addLayer(arganier);
  
/*
Map.addLayer(classifiedCart, {min: 0, max: 1, palette:palette},
  'classification');
Map.addLayer(classifiedSVM, {min: 0, max: 1, palette:palette},
  'classification');
*/

Map.addLayer(arganSample);
Map.addLayer(arganRegion);


// Remap values.
var slopereclass = classifiedRF.add(100).ceil();

// Create a 3-band, 8-bit, color-IR composite to export.
var visualization = slopereclass.visualize({
  min: 100,
  max: 111
});

//Map.addLayer(visualization);

var bandNames = visualization.bandNames();
print('Band names: ', bandNames); // ee.List of band names

Export.image.toDrive({
  image: classifiedRF.unmask(-9999),
  description: 'RFClass_LD8_',
  scale: 100,
  region: geometry,
  fileFormat: 'GeoTIFF',
  folder: 'RF_Classification',
  crs : 'EPSG:4326',
  formatOptions: {
    cloudOptimized: true
  }
});


//print('RF error matrix: ', classifierRF.confusionMatrix());
//print('RF Training accuracy: ', classifierRF.confusionMatrix().accuracy());

/*
print('Cart error matrix: ', classifierCart.confusionMatrix());
print('Cart Training accuracy: ', classifierCart.confusionMatrix().accuracy());
print('SVM error matrix: ', classifierSVM.confusionMatrix());
print('SVM Training accuracy: ', classifierSVM.confusionMatrix().accuracy());
*/

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
// Print the confusion matrix.
var confusionMatrix = test.errorMatrix(classProperty, 'classification');

//print('Testing Confusion Matrix', confusionMatrix);
//print('Resubstitution error matrix: ', trainAccuracy);
//print('Testing accuracy: ', confusionMatrix.accuracy());// Export the FeatureCollection.
