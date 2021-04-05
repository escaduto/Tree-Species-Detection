/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var Extent = ee.FeatureCollection("users/escaduto/Arganier"),
    ArganSample = ee.FeatureCollection("users/escaduto/ArganSample2"),
    Country_Bounds = ee.FeatureCollection("users/escaduto/gadm36_MAR_0");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// This example uses the Sentinel-2 QA band to cloud mask
// the collection.  The Sentinel-2 cloud flags are less
// selective, so the collection is also pre-filtered by the
// CLOUDY_PIXEL_PERCENTAGE flag, to use only relatively
// cloud-free granule.

// Function to mask clouds using the Sentinel-2 QA band.
function maskS2clouds(image) {
  var qa = image.select('QA60')

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
             qa.bitwiseAnd(cirrusBitMask).eq(0))

  // Return the masked and scaled data, without the QA bands.
  return image.updateMask(mask).divide(10000)
      .select("B.*")
      .copyProperties(image, ["system:time_start"])
}

// Map the function over one year of data and take the median.
// Load Sentinel-2 TOA reflectance data.
var collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2016-01-01', '2018-12-31')
    // Pre-filter to get less cloudy granules.
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .map(maskS2clouds)

var composite = collection.median()

// Display the results.
Map.setCenter(-8.863896279417304,30.676092031297642, 18);
Map.addLayer(composite, {bands: ['B8', 'B4', 'B3'], min: 0, max: 0.3}, 'RGB')
Map.addLayer(ArganSample);