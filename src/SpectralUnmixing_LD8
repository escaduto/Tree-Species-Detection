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
    arganRegion = ee.FeatureCollection("users/escaduto/NEW_Study_Region_DIS"),
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

/* Define spectral endmembers. Each number corresponds to the DN values (from 0–127) of the
seven Landsat image bands. You can obtain values of endmembers by going to the Inspector tab
and clicking on “pure” pixels of a selected land cover type. More endmembers can also be found
in the USGS or NASA JPL spectral libraries. */
var urban = [1407, 2117, 2699, 3170.5, 3426.5, 3057.5, 2970.5];
var ag = [347, 769, 684, 3664, 1889, 3016, 1035];
var veg = [609, 844, 885, 2135, 1841, 3080 , 1204]
var agSmooth = [2585, 3356, 3941, 4655, 4360, 3053, 3301];
var soil= [1165, 1886, 2857, 3803,4838, 3122, 4038]
var water = [484, 422, 346, 299, 183, 2929, 146];
var argan = [941, 1553.5, 2058.5, 3232.5, 4049, 3106, 3019.5]

var i;

for (i = 2013; i < 2020; i++) { 
  print(String(i));
    
  // TOA collection 
  var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                     .filter(ee.Filter.calendarRange(i, i+2,'year'))
                     .filter(ee.Filter.calendarRange(6,9,'month'))
                     .filterBounds(geometry)
                     .map(maskL8sr)
                     .sort("CLOUD_COVERAGE_ASSESSMENT")
                     .select(['B2', 'B3', 'B4', 'B5', 'B6','B10','B7'],
                     ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'])
                     .median()); 
                     
  var clip = image.clip(geometry2);
  // Unmix the input image based on the provided spectral endmembers.
  var fractions = clip.unmix([ag, soil, urban, veg, argan, agSmooth, water]);
  var new_bands = ['Ag', 'Soil', 'Urban', 'Veg', 'Argan', 'CovAg', 'Water'];
  var bandNames = fractions.bandNames();
  fractions = fractions.select(bandNames, new_bands);
  
  Export.image.toDrive({
      image: fractions,
      description: 'LSU_LD8_' + String(i),
      scale: 30,
      region: geometry2,
      fileFormat: 'GeoTIFF',
      folder: 'Argan_LSU',
      crs : 'EPSG:4326',
      maxPixels: 1e12
    });
    
  Map.setCenter(-9.346154212478863,30.202071069757274, 8);
  Map.addLayer(fractions, {}, 'LSU_LD8_' + String(i));
  
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
Map.addLayer(fractions, {}, 'unmixed');*/
