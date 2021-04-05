/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi1 = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.498767166982816, 30.31004965775773],
          [-9.498767166982816, 30.242448777968953],
          [-9.412249832998441, 30.242448777968953],
          [-9.412249832998441, 30.31004965775773]]], null, false),
    roi2 = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.147769544438802, 31.16189378881545],
          [-9.147769544438802, 30.91715049670869],
          [-8.796207044438802, 30.91715049670869],
          [-8.796207044438802, 31.16189378881545]]], null, false),
    roi3 = 
    /* color: #ffc82d */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.768455515940786, 29.72261752962301],
          [-9.768455515940786, 29.670128748057238],
          [-9.686058055003286, 29.670128748057238],
          [-9.686058055003286, 29.72261752962301]]], null, false),
    roi4 = 
    /* color: #bf04c2 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-8.835126459777939, 30.655681224026946],
          [-8.835126459777939, 30.4001691918779],
          [-8.461591303527939, 30.4001691918779],
          [-8.461591303527939, 30.655681224026946]]], null, false),
    roi5 = 
    /* color: #ff0000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-9.611722529113877, 31.364530947942853],
          [-9.611722529113877, 31.287986604670177],
          [-9.50426250714122, 31.287986604670177],
          [-9.50426250714122, 31.364530947942853]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/

var utils = require('users/gena/packages:utils')
var text = require('users/gena/packages:text')

// define the period
var years = ee.List.sequence(1985,2018,1);

// import collections
//var l4 = ee.ImageCollection("LANDSAT/LT04/C01/T1_SR");
var l5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR");
//var l7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR");
var l8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR");

// set bandnames for rgb
//var l4names = ee.List(["B1","B2","B3"]);
var l5names = ee.List(["B2","B3","B4"]);
//var l7names = ee.List(["B2","B3","B4"]);
var l8names = ee.List(["B3","B4","B5"]);

// bands
var bands = ee.List(['blue','green','red']);

// Filter based on location
//var l4images  = l4.filterBounds(geometry).filter(ee.Filter.lt("CLOUD_COVER",5));
var l5images  = l5.filterBounds(roi1).filter(ee.Filter.lt("CLOUD_COVER",2));
//var l7images  = l7.filterBounds(roi).filter(ee.Filter.lt("CLOUD_COVER",5));
var l8images  = l8.filterBounds(roi1).filter(ee.Filter.lt("CLOUD_COVER",2));

function scale(image){
  // get QA band
  //var QA = image.select("pixel_qa");
  //var	shadow = QA.bitwiseAnd(8).neq(0);
  //var cloud =  QA.bitwiseAnd(32).neq(0);
  //return image.updateMask(shadow.not()).updateMask(cloud.not()).multiply(0.0001).set("system:time_start",image.get("system:time_start"));
  return image.multiply(0.0001).set("system:time_start",image.get("system:time_start"));
}

// Change the bandnames
//l4images = l4images.map(scale).select(l4names,bands);
l5images = l5images.map(scale).select(l5names,bands);
//l7images = l7images.map(scale).select(l7names,bands);
l8images = l8images.map(scale).select(l8names,bands);

var collection = l5images.merge(l8images).sort("system:time_start");
print(collection);

//var first = collection.first()
//var date = ee.Date(first.get('system:time_start')).format('YYYY-MM-dd');
//date = ee.String(date);
//print('Date range: ', date);

var coll4Video = collection
  .map(function(image) {
    var date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd') //.getInfo()
    date = ee.String(date)
    return image.select(['red','green','blue'])
                .multiply(512).uint8()
                .set({label: date});   // need to make it 8-bit
  });

  
// annotate
var annotations = [
  {
    position: 'left', offset: '1%', margin: '1%', property: 'label', scale: Map.getScale() * 1.5
  }
]

var coll4Video = coll4Video.map(function(image) {
  return text.annotateImage(image, {}, roi1, annotations)
});

// export the video to the drive
Export.video.toDrive({
    collection: coll4Video, //.select(['red','blue','green']),
    description: "Landsat_Argan_ALL_ROI1" , 
    scale: 30,
    framesPerSecond: 3,
    region: roi1.bounds()
});
