/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-11.271944640065707, 32.46864070286684],
          [-11.271944640065707, 28.329165195906647],
          [-7.8112512806907075, 28.329165195906647],
          [-7.8112512806907075, 32.46864070286684]]], null, false),
    geometry2 = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-9.79707214504242, 30.605264879507214],
          [-9.79707214504242, 30.321173826078958],
          [-9.46748230129242, 30.321173826078958],
          [-9.46748230129242, 30.605264879507214]]], null, false),
    geometry3 = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-10.173321696815492, 31.420514669358397],
          [-10.173321696815492, 29.287652473965025],
          [-8.591290446815492, 29.287652473965025],
          [-8.591290446815492, 31.420514669358397]]], null, false),
    roi2 = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-9.79707214504242, 30.605264879507214],
          [-9.79707214504242, 30.321173826078958],
          [-9.46748230129242, 30.321173826078958],
          [-9.46748230129242, 30.605264879507214]]], null, false),
    roi = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-10.173321696815492, 31.420514669358397],
          [-10.173321696815492, 29.287652473965025],
          [-8.591290446815492, 29.287652473965025],
          [-8.591290446815492, 31.420514669358397]]], null, false),
    geometry4 = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-11.271944640065707, 32.46864070286684],
          [-11.271944640065707, 28.329165195906647],
          [-7.8112512806907075, 28.329165195906647],
          [-7.8112512806907075, 32.46864070286684]]], null, false),
    arganier = ee.FeatureCollection("users/escaduto/Arganier"),
    arganSample = ee.FeatureCollection("users/escaduto/ArganSampled_Poly30"),
    boundary = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var geometry = geometry4;
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
    geometry: region,
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

var i;

for (i = 1999; i < 2020; i++) { 
  print(String(i));
    
  // TOA collection 
  var image = ee.Image(ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
                     .filter(ee.Filter.calendarRange(i, i+3,'year'))
                     .filter(ee.Filter.calendarRange(6,9,'month'))
                     .filterBounds(geometry)
                     .map(cloudMaskL457)
                     .sort("CLOUD_COVERAGE_ASSESSMENT")
                     .select(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'], 
                     ['B2', 'B3', 'B4', 'B5', 'B6', 'B11', 'B7'])
                     .median()); 
                     
  var NDVI = ee.ImageCollection('LANDSAT/LE07/C01/T1_8DAY_NDVI')
                    .filter(ee.Filter.calendarRange(i, i+3,'year'))
                    .filter(ee.Filter.calendarRange(6,9,'month'))
                    .filterBounds(geometry)
                    .select('NDVI')
                    .max();
                    
  //var mosaic = image.mosaic()
  var clip = image.clip(arganRegion);
  var NDVI = NDVI.clip(arganRegion);
  
  // Landsat 8 
  // ADVANCED VEGETATION INDEX (AVI) 
  
  var AVI = clip.expression(
      'cbrt((BAND_5 * (1 - BAND_4) * (BAND_5 - BAND_4)))', {
        'BAND_4': clip.select('B4'),
        'BAND_5': clip.select('B5')
  }).rename('AVI');
  
  // BARE SOIL INDEX (BSI) 
  var BSI = clip.expression(
      '(((BAND_6 + BAND_4) - (BAND_5 + BAND_2)) / ((BAND_6 + BAND_4) + (BAND_5 + BAND_2)))', {
        'BAND_2': clip.select('B2'),
        'BAND_4': clip.select('B4'),
        'BAND_5': clip.select('B5'),
        'BAND_6': clip.select('B6')
  }).rename('BSI');
  
  
  // SHADOW (SI) 
  var SI = clip.expression(
      'cbrt((1 - BAND_2) * (1 - BAND_3) * (1 - BAND_4))', {
        'BAND_2': clip.select('B2'),
        'BAND_3': clip.select('B3'),
        'BAND_4': clip.select('B4')
  }).rename('SI');
  
  // Set some information about the input to be used later.
  var scale = 1000;
  var bandNames = clip.bandNames();
  //print(bandNames.getInfo())
  
  var region = arganRegion.geometry();
  // Mean center the data to enable a faster covariance reducer
  // and an SD stretch of the principal components.
  var meanDict = clip.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: scale,
      maxPixels: 1e9
  });
  var means = ee.Image.constant(meanDict.values(bandNames));
  var centered = clip.subtract(means);
  
  // Get the PCs at the specified scale and in the specified region
  var pcImage = getPrincipalComponents(centered, scale, region);
  
  /*
  // Plot each PC as a new layer
  for (var n = 0; n < n; i++) {
    var band = pcImage.bandNames().get(n).getInfo();
    Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band);
  }
  */
  
  var bands = ['pc1', 'pc2', 'pc3', 'pc4', 'pc5', 'NDVI', 'AVI', 'BSI', 'SI', 'B11'];
  var fullImage = pcImage.addBands(NDVI);
  fullImage = fullImage.addBands(clip);
  fullImage = fullImage.addBands(AVI);
  fullImage = fullImage.addBands(BSI);
  fullImage = fullImage.addBands(SI);
  fullImage = fullImage.select(bands)
  
  var classProperty = 'landType'
  
  // Get the values for all pixels in each polygon in the training.
  var training = fullImage.select(bands).sampleRegions({
    // Get the sample from the polygons FeatureCollection.
    collection: arganSample,
    // Keep this list of properties from the polygons.
    properties: [classProperty],
    // Set the scale to get Landsat pixels in the polygons.
    scale: 30
  });
  
  // Make a Random Forest classifier and train it.
  var classifierRF = ee.Classifier.randomForest(100).train({
    features: training,
    classProperty: classProperty,
    inputProperties: bands
  });
  
  var classifiedRF = fullImage.select(bands).classify(classifierRF);
  
  // Create a palette to display the classes.
  var palette =['99B898', 'white'];
  
  var vis = {min: 0, max: 1, palette: palette};
  
  Map.addLayer(classifiedRF, {min: 0, max: 1, palette:palette},String(i));
  //Map.addLayer(arganier)
  
  Export.image.toDrive({
      image: classifiedRF.unmask(-9999),
      description: 'RFClass_LD7_' + String(i),
      scale: 100,
      region: geometry,
      fileFormat: 'GeoTIFF',
      folder: 'Argan_NewClassification',
      crs : 'EPSG:4326',
      formatOptions: {
        cloudOptimized: true
      }
    });
    
}