/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi1 = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.559878617178128, 30.401888378694576],
          [-9.559878617178128, 30.282777713661957],
          [-9.390963822256253, 30.282777713661957],
          [-9.390963822256253, 30.401888378694576]]], null, false),
    roi2 = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-8.473483655766927, 30.74852518671094],
          [-8.473483655766927, 30.642245664953734],
          [-8.333407972173177, 30.642245664953734],
          [-8.333407972173177, 30.74852518671094]]], null, false),
    roi3 = 
    /* color: #ffc82d */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.786994944651724, 29.73931275293427],
          [-9.786994944651724, 29.64984164940491],
          [-9.655159007151724, 29.64984164940491],
          [-9.655159007151724, 29.73931275293427]]], null, false),
    roi4 = 
    /* color: #bf04c2 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.069959223449814, 30.530966472820765],
          [-9.069959223449814, 30.427408436354668],
          [-8.922330439270127, 30.427408436354668],
          [-8.922330439270127, 30.530966472820765]]], null, false),
    roi5 = 
    /* color: #ff0000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.584943354309189, 31.596129409591914],
          [-9.584943354309189, 31.524749321293502],
          [-9.479199946106064, 31.524749321293502],
          [-9.479199946106064, 31.596129409591914]]], null, false),
    roi6 = 
    /* color: #00ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.602916204514031, 31.37169911189948],
          [-9.602916204514031, 31.298387617305586],
          [-9.492366277756219, 31.298387617305586],
          [-9.492366277756219, 31.37169911189948]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// define the period
var years = ee.List.sequence(1984,2018,1);


// import collections
//var l4 = ee.ImageCollection("LANDSAT/LT04/C01/T1_SR");
var l5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR")
                      .filter(ee.Filter.calendarRange(4,9,'month'));
//var l7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR");
var l8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
                      .filter(ee.Filter.calendarRange(4,9,'month'));

// set bandnames for rgb
//var l4names = ee.List(["B1","B2","B3"]);
var l5names = ee.List(["B2","B3","B4"]);
//var l7names = ee.List(["B2","B3","B4"]);
var l8names = ee.List(["B3","B4","B5"]);

// bands
var bands = ee.List(['blue','green','red']);

// Filter based on location
//var l4images  = l4.filterBounds(geometry).filter(ee.Filter.lt("CLOUD_COVER",5));
var l5images  = l5.filterBounds(roi3).filter(ee.Filter.lt("CLOUD_COVER",5));
//var l7images  = l7.filterBounds(roi).filter(ee.Filter.lt("CLOUD_COVER",5));
var l8images  = l8.filterBounds(roi3).filter(ee.Filter.lt("CLOUD_COVER",5));

function scale(image){
  // get QA band
  //var QA = image.select("pixel_qa");
  //var	shadow = QA.bitwiseAnd(8).neq(0);
  //var cloud =  QA.bitwiseAnd(32).neq(0);
  //return image.updateMask(shadow.not()).updateMask(cloud.not()).multiply(0.0001);
  return image.multiply(0.0001).set("system:time_start",image.get("system:time_start"));
}
  

// Change the bandnames
//l4images = l4images.map(scale).select(l4names,bands);
l5images = l5images.map(scale).select(l5names,bands);
//l7images = l7images.map(scale).select(l7names,bands);
l8images = l8images.map(scale).select(l8names,bands);

var collection = l5images.merge(l8images).sort("system:time_start");

print(collection);

// we need an 8-bit format
var coll4Video = collection
  .map(function(image) {
    return image.multiply(512).uint8();   // need to make it 8-bit
  });
  
// export the video to the drive
Export.video.toDrive({
    collection: coll4Video.select(['red','green','blue']),
    description: "Landsat_Argan_ALL_ROI3_D" , 
    scale: 30,
    framesPerSecond: 4,
    region: roi3.bounds()
});


// create feature collection for NorthernShp; CentralShp; SouthernShp
var videoShp = ee.FeatureCollection([
  roi1,
  roi2,
  roi3,
  roi4, 
  roi5,
  roi6
]);

// Export the FeatureCollection to a SHP file.
Export.table.toDrive({
  collection: videoShp,
  description:'videoShp',
  fileFormat: 'SHP'
});