/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.573946783179963, 30.413398287206853],
          [-9.573946783179963, 30.265246161787825],
          [-9.361086675758088, 30.265246161787825],
          [-9.361086675758088, 30.413398287206853]]], null, false);
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

//Part 5A
// Load a Landsat 5 image collection.
var collection = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
  .filterBounds(roi)
  .filterDate('1985-01-01','2011-12-30')
  // Filter cloudy scenes.
  .filter(ee.Filter.lt('CLOUD_COVER', 10))
  //.map(cloudMaskL457)
  // Need to have 3-band imagery for the video.
  .select(['B4', 'B3', 'B2'])
  // Need to make the data 8-bit.
  .map(function(image) {
    return image.multiply(512).uint8();
  });

// Export (change dimensions or scale for higher quality).
Export.video.toDrive({
  collection: collection,
  description: 'Landsat_ArganL5',
  dimensions: 720,
  framesPerSecond: 1,
  region: roi
});



