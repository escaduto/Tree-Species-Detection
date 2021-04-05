/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi2 = 
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
    geometry = 
    /* color: #0b4a8b */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-11.71419713169098, 32.76294505233978],
          [-11.71419713169098, 28.240193604265464],
          [-7.34163853794098, 28.240193604265464],
          [-7.34163853794098, 32.76294505233978]]], null, false),
    arganier = ee.FeatureCollection("users/escaduto/Arganier"),
    arganSample = ee.FeatureCollection("users/escaduto/ArganSampled_Poly30"),
    boundary = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS");
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

 // This function accepts mean centered imagery, a scale and
  // a region in which to perform the analysis.  It returns the
  // Principal Components (PC) in the region as a new image.
var getPrincipalComponents = function(centered, scale, region) {
    // Collapse the bands of the image into a 1D array per pixel.
    var arrays = centered.toArray();
  
    // Compute the covariance of the bands within the region.
    var covar = arrays.reduceRegion({
      reducer: ee.Reducer.centeredCovariance(),
      geometry: roi2,
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
  
  // This helper function returns a list of new band names.
var getNewBandNames = function(prefix) {
    var seq = ee.List.sequence(1, bandNames.length());
    return seq.map(function(b) {
      return ee.String(prefix).cat(ee.Number(b).int());
    });
  };
  
  
var i;

for (i = 2018; i < 2019; i++) { 
  print(String(i));
  
  // TOA collection 
  var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                     .filter(ee.Filter.calendarRange(i, i+3,'year'))
                     .filter(ee.Filter.calendarRange(6,9,'month'))
                     .filterBounds(roi)
                     .map(maskL8sr)
                     .sort("CLOUD_COVERAGE_ASSESSMENT")
                     .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'B11'])
                     .first()); 
  
  //var mosaic = image.mosaic()
  var clip = image.clip(roi2);
  var region = clip.geometry() 
  print(clip.bandNames().getInfo())
  
    // NDVI
  var ndvi = clip.expression(
      '((BAND_5 + BAND_4) / (BAND_5 - BAND_4))', {
        'BAND_4': clip.select('B4'),
        'BAND_5': clip.select('B5')
  }).rename('NDVI');
  
  
  // ADVANCED VEGETATION INDEX (AVI) 
  // TASSELLED CAP WETNESS
  var AVI = clip.expression(
      '(BAND_4 + 1) * (256 - BAND_3) * (BAND_4 - BAND_3)', {
        'BAND_3': clip.select('B4'),
        'BAND_4': clip.select('B5')
  }).rename('AVI');
  
  // BARE SOIL INDEX (BSI) 
  var BSI = clip.expression(
      '(((BAND_4 + BAND_2) - BAND_3) / ((BAND_4 + BAND_2) + BAND_3)) * 2', {
        'BAND_2': clip.select('B3'),
        'BAND_3': clip.select('B4'),
        'BAND_4': clip.select('B5')
  }).rename('BSI');
  
  
  // SHADOW (SI) 
  var SI = clip.expression(
      'sqrt((256 - BAND_2) * (256 - BAND_3))', {
        'BAND_2': clip.select('B3'),
        'BAND_3': clip.select('B4')
  }).rename('SI');
  
  // Add bands to an image.
  var newImage = clip.addBands(ndvi);
  var newImage = newImage.addBands(BSI);
  var newImage = newImage.addBands(AVI);
  var newImage = newImage.addBands(SI);
  
  var BSIAVI = BSI.addBands(AVI); 
   // Set some information about the input to be used later.
  var scale = 30;
  var bandNames = clip.bandNames();
  
  // Mean center the data to enable a faster covariance reducer
  // and an SD stretch of the principal components.
  var meanDict = clip.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: scale,
      maxPixels: 1e9
  });
  var means = ee.Image.constant(meanDict.values(bandNames));
  var centered = image.subtract(means);
  // Get the PCs at the specified scale and in the specified region
  var pcImage = getPrincipalComponents(centered, scale, roi2);
  
  // Plot each PC as a new layer
  for (var i = 0; i < bandNames.length().getInfo(); i++) {
    var band = pcImage.bandNames().get(i).getInfo();
    Map.addLayer(pcImage.select([band]), {min: -2, max: 2}, band);
  }
    
  var newImage = newImage.addBands(pcImage.select(['pc1', 'pc2', 'pc3', 'pc4']));
  print(newImage.bandNames().getInfo())
/*
  var visParams = {
    bands: ['B4', 'B3', 'B2'],
    min: 0,
    max: 3000,
    gamma: 1.4,
  };

  // Select only true color RGB bands from new Image 
  //var truecolor = newImage.select('B4', 'B3', 'B2')

  //Map.setCenter(-9.10494420200348,30.381270007865055, 6);
  //Map.addLayer(truecolor, visParams)
  //Map.addLayer(newNDVI, ndviParams, 'NDVI image');
  
  var bands = ['pc1', 'pc2', 'pc3', 'pc4'];
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

  // Make a Random Forest classifier and train it.
  var classifierRF = ee.Classifier.randomForest(60).train({
    features: training,
    classProperty: classProperty,
    inputProperties: bands
  });
  
  var classifiedRF = newImage.select(bands).classify(classifierRF);
  
  // Create a palette to display the classes.
  var palette =['99B898', 'white'];
  
  var vis = {min: 0, max: 1, palette: palette};
  
  Map.addLayer(classifiedRF, {min: 0, max: 1, palette:palette},'classification');
  
  //var bandNames = visualization.bandNames();
  //print('Band names: ', bandNames); // ee.List of band names
  
  Export.image.toDrive({
    image: classifiedRF.unmask(-9999),
    description: 'RFClass_LD8_' + String(i),
    scale: 100,
    region: geometry,
    fileFormat: 'GeoTIFF',
    folder: 'RF_Classification',
    crs : 'EPSG:4326',
    formatOptions: {
      cloudOptimized: true
    }
  });
  
 */ 
}
