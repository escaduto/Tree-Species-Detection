/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var country = ee.FeatureCollection("users/escaduto/gadm36_MAR_0"),
    AOI = ee.FeatureCollection("users/escaduto/Argan_Region_10km"),
    arganSample2 = ee.FeatureCollection("users/escaduto/New_ArganSample"),
    roi = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-10.57711217075348, 32.053580474868795],
          [-10.57711217075348, 29.352357229926206],
          [-8.64351842075348, 29.352357229926206],
          [-8.64351842075348, 32.053580474868795]]], null, false),
    geometry = /* color: #98ff00 */ee.Geometry.Point([-9.10494420200348, 30.381270007865055]),
    geometry2 = /* color: #0b4a8b */ee.Geometry.Point([-9.67623326450348, 30.362312819742524]),
    geometry4 = /* color: #98ff00 */ee.Geometry.Point([-9.261767492240551, 31.63228896842812]),
    arganSample = ee.FeatureCollection("users/escaduto/ArganSample_Buffer");
/***** End of imports. If edited, may not auto-convert in the playground. *****/



// Use these bands for prediction.
var bands = ['B2', 'B3', 'B4','B5', 'B6', 'B7'];

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

/*
// Map the function over one year of data and take the median.
// Load Sentinel-2 TOA reflectance data.
var dataset = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate('2018-01-01', '2018-06-30')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                  .map(maskS2clouds);
*/                 
                  
/*    
var image = ee.Image(ee.ImageCollection('LANDSAT/LC8_L1T_TOA')
                  .filterDate('2018-04-01', '2019-04-01')
                  //.map(maskL8sr)
                  .select(bands)
                  .sort('CLOUD_COVER')    
                  .first())
                  .filterBounds(roi)
                  .mean());
*/ 
              
// Load Landsat 5 input imagery.
// Make sure the Landsat imagery is the latest 3 years (2019-2016) 
// Composite, Mosaic, Mask, Mean, Create one final image 
var image = ee.Image(ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA") //LANDSAT/LC8_L1T_TOA
  // Filter to get only one year of images.
  .filterDate('2016-01-01', '2016-12-31')
  // Filter to get only images under the region of interest.
  .filterBounds(geometry2)
  // Sort by scene cloudiness, ascending.
  .sort('CLOUD_COVER')
  // Get the first (least cloudy) scene.
  .first());
  
  
// Cut img1 according to "dbsh_shape" shapefile
//var img2 = dataset.map(function(image) {return image.clip(AOI);});

// Mosaic img2
//var image = dataset.mosaic();

// Load training polygons from a Fusion Table.
// The 'class' property stores known class labels.

// Get the values for all pixels in each polygon in the training.
var training = image.sampleRegions({
  // Get the sample from the polygons FeatureCollection.
  collection: arganSample,
  // Keep this list of properties from the polygons.
  properties: ['landType'],
  // Set the scale to get Landsat pixels in the polygons.
  scale: 30
});

// Create an SVM classifier with custom parameters.
var classifier = ee.Classifier.svm({
  kernelType: 'RBF',
  gamma: 0.1,
  cost: 10
});

// Train the classifier.
var trained = classifier.train(training, 'landType', bands);

// Classify the image.
var classified = image.classify(trained);

// Create a palette to display the classes.
var palette =['00FF00', 'DD0000'];


var visParams = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};

// 'de356a', '540e33','ed3833' ,'00FF00', 'DD0000'
// Display the classification result and the input image.
//Map.addLayer(image, {bands: ['VV', 'VH'], max: 0.5, gamma: 2});
//Map.addLayer(classified, {min: 0, max: 10, palette: palette}, 'Isrice');
Map.setCenter(-9.10494420200348,30.381270007865055, 8);
//Map.centerObject(image, 10);
//Map.addLayer(image, visParams);
Map.addLayer(classified, {min: 0, max: 1, palette: ['6e9086', 'fdc8b7']},
  'classification');
Map.addLayer(arganSample);
//Map.addLayer(arganSample);

/*
var rgbVis = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

Map.addLayer(image, rgbVis, 'RGB');
*/