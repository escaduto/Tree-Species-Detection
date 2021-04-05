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

for (i = 1984; i < 2012; i++) { 
  print(String(i));
    
  // TOA collection 
  var image = ee.Image(ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                     .filter(ee.Filter.calendarRange(i, i+3,'year'))
                     .filter(ee.Filter.calendarRange(6,9,'month'))
                     .filterBounds(geometry)
                     .map(cloudMaskL457)
                     .sort("CLOUD_COVERAGE_ASSESSMENT")
                     .select(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'], 
                     ['B2', 'B3', 'B4', 'B5', 'B6', 'B10', 'B7'])
                     .median()); 
                       
  //var mosaic = image.mosaic()
  var clip = image.clip(arganRegion);
  
  var thermal = clip.select('B10');
  
  var palette =['99B898', 'white'];
  
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
  
  var fullImage = AVI.addBands(BSI);
  
  //Map.addLayer(fullImage);
  
    
  // Set some information about the input to be used later.
  var scale = 30;
  var bandNames = fullImage.bandNames();
  //print(bandNames.getInfo())
    
  var region = arganRegion.geometry();
  // Mean center the data to enable a faster covariance reducer
  // and an SD stretch of the principal components.
  var meanDict = fullImage.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: scale,
      maxPixels: 1e9
  });
  
  var means = ee.Image.constant(meanDict.values(bandNames));
  var centered = fullImage.subtract(means);
  
  // Get the PCs at the specified scale and in the specified region
  var pcImage = getPrincipalComponents(centered, scale, region);
  //print(pcImage.bandNames().getInfo())
  //Map.addLayer(pcImage, {min: -2, max: 2}, 'pc') 
  //Map.addLayer(pcImage.select("pc1"), {min: -2, max: 2}, 'pc1') 
  //Map.addLayer(pcImage.select("pc2"), {min: -2, max: 2}, 'pc2') 
  /*
  var minMax = SI.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: geometry,
  scale: 30,
  maxPixels: 10e9,
  // tileScale: 16
  }); 
  */
  // use unit scale to normalize the pixel values
  //var SSI = ee.ImageCollection.fromImages(
    //SI.bandNames().map(unitScale)).toBands().rename(SI.bandNames());
    
  var FCDImage = pcImage.addBands(SI);
  //print(FCDImage.bandNames().getInfo())
  
  // Forest Canopy Density (FCD) 
  var FCD = FCDImage.expression(
        '(sqrt(BAND_VD * BAND_SI + 1) -1 )', {
          'BAND_VD': FCDImage.select('pc1'),
          'BAND_SI': FCDImage.select('SI')
    }).rename('FCD');
    
  //Map.addLayer(FCD,  {min: 0, max: 100, palette:palette}, String(i)) 
  
  Export.image.toDrive({
        image: pcImage.select('pc1').unmask(-9999),
        description: 'VD_L5_' + String(i),
        scale: 100,
        region: geometry,
        fileFormat: 'GeoTIFF',
        folder: 'Argan_ForestDensity',
        crs : 'EPSG:4326',
        formatOptions: {
          cloudOptimized: true
        }
      });
}

