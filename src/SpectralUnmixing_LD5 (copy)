/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi2 = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-9.599318238792414, 30.74699914204979],
          [-9.599318238792414, 30.463322918167606],
          [-9.302687379417414, 30.652532739213438],
          [-9.269728395042414, 30.74699914204979]]], null, false),
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
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
    sample = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.55463946713968, 30.737149338071383],
          [-9.55463946713968, 30.164161545963506],
          [-8.21430743588968, 30.164161545963506],
          [-8.21430743588968, 30.737149338071383]]], null, false),
    geometry2 = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.692212819580304, 30.887967548719764],
          [-9.692212819580304, 30.02380457454221],
          [-8.033277272705304, 30.02380457454221],
          [-8.033277272705304, 30.887967548719764]]], null, false);
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

/* Define spectral endmembers. Each number corresponds to the DN values (from 0–127) of the
seven Landsat image bands. You can obtain values of endmembers by going to the Inspector tab
and clicking on “pure” pixels of a selected land cover type. More endmembers can also be found
in the USGS or NASA JPL spectral libraries. */
var urban = [2587, 3626, 4157, 4272, 4560, 3180, 4170];
var ag = [721, 1117, 1309, 2678, 2194, 3119, 1454];
var veg = [609, 844, 885, 2135, 1841, 3080 , 1204]
var agSmooth = [2632.777777777778, 3440.3333333333335, 3847.4444444444443, 4403.888888888889, 
                    3821.1111111111113, 3027.4444444444443, 3049.3333333333335];
var soil= [1104.111111111111, 1693, 2363.6666666666665, 3094.4444444444443,4213.888888888889, 3116, 3403]
var water = [484, 422, 346, 299, 183, 2929, 146];
var argan = [1138.3333333333333, 1863.4444444444443, 2453, 3598.6666666666665, 3911.6666666666665, 
              3101.4444444444443, 2918.5555555555557]

var i;

for (i = 1984; i < 2012; i++) { 
  print(String(i));
    
  // TOA collection 
  var image = ee.Image(ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                     .filter(ee.Filter.calendarRange(i, i+2,'year'))
                     .filter(ee.Filter.calendarRange(6,9,'month'))
                     .filterBounds(geometry)
                     .map(cloudMaskL457)
                     .sort("CLOUD_COVERAGE_ASSESSMENT")
                     .select(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'])
                     .median()); 
                     
  var clip = image.clip(geometry2);
  // Unmix the input image based on the provided spectral endmembers.
  var fractions = clip.unmix([ag, soil, urban, veg, argan, agSmooth, water]);
  var new_bands = ['Ag', 'Soil', 'Urban', 'Veg', 'Argan', 'CovAg', 'Water'];
  var bandNames = fractions.bandNames();
  fractions = fractions.select(bandNames, new_bands);
   
  Export.image.toDrive({
      image: fractions,
      description: 'LSU_LD5_' + String(i),
      scale: 30,
      region: geometry2,
      fileFormat: 'GeoTIFF',
      folder: 'Argan_LSU',
      crs : 'EPSG:4326',
      maxPixels: 1e12
    });
  
  Map.setCenter(-9.346154212478863,30.202071069757274, 8);
  Map.addLayer(fractions, {}, 'LSU_LD5_' + String(i));
}


/*
var visParams = {
  bands: ['B3', 'B2', 'B1'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};
Map.setCenter(-9.346154212478863,30.202071069757274, 8);
Map.addLayer(image, visParams);
*/

/*Display unmixed image. In the unmixed image, the red band shows the proportion of urban
cover, green shows vegetation and blue shows water based on the spectral endmember you
provided earlier. When viewed as an RGB image, the color shows the proportion of each cover
types e.g. cyan pixels are a mixture of water and vegetation, magenta pixels are a mixture of
urban and vegetative cover. 

Map.addLayer(fractions, {}, 'unmixed');
  // Get a dictionary of means in the region.
  var means = fractions.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: arganRegion,
    scale: 30
  });
  
  // Make a feature without geometry and set the properties to the dictionary of means.
  var feature = ee.Feature(null, means);
  
  // Wrap the Feature in a FeatureCollection for export.
  var featureCollection = ee.FeatureCollection([feature]);
  
  // Export the FeatureCollection.
  Export.table.toDrive({
    collection: featureCollection,
    description: 'exportTableExample',
    fileFormat: 'CSV'
  });


*/

