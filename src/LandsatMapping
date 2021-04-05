/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var arganSample = ee.FeatureCollection("users/escaduto/ArganSample");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// This example demonstrates the use of the Landsat 8 QA band to mask clouds.

// Function to mask clouds using the quality band of Landsat 8.
var maskL8 = function(image) {
  var qa = image.select('BQA');
  /// Check that the cloud bit is off.
  // See https://landsat.usgs.gov/collectionqualityband
  var mask = qa.bitwiseAnd(1 << 4).eq(0);
  return image.updateMask(mask);
}

var bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7'];


// Map the function over one year of Landsat 8 TOA data and take the median.
var composite = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
    .filterDate('2016-06-20', '2019-06-20')
    .map(maskL8)
    .select(bands)
    .mean();

/*
Export.image.toDrive({
  image: composite,
  description: 'imageToDriveExample',
  scale: 30,
  region: table.geometry().bounds(),
});

*/

var yearly = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
              .filterDate('2016-06-20', '2019-06-20')
              .select(bands);

/*  
// function to map over the FeatureCollection
var mapfunc = function(feat) {
  // get feature geometry
  var geom = feat.geometry()
  // function to iterate over the yearly ImageCollection
  // the initial object for the iteration is the feature
  var addProp = function(img, f) {
    // cast Feature
    var newf = ee.Feature(f)
    // get date as string
    var date = img.date().format()
    // extract the value (first) of 'waterClass' in the feature
    var value = img.reduceRegion(ee.Reducer.mean(), geom, 30).get('B7')
    // if the value is not null, set the values as a property of the feature. The name of the property will be the date
    return ee.Feature(ee.Algorithms.If(value,
                                       newf.set(date, ee.String(value)),
                                       newf.set(date, ee.String('No data'))))
  }
  var newfeat = ee.Feature(yearly.iterate(addProp, feat))
  return newfeat
};

//var newft = ee.FeatureCollection(arganSample.map(mapfunc));
var newft = arganSample.map(mapfunc).flatten();

// Export
Export.table.toDrive(newft,
"export_Points",
"export_Points",
"export_Points");
*/


    
var sampledData = composite.sampleRegions({
  collection:arganSample,
  scale:30
});

Export.table.toDrive({
  collection: sampledData,
  description: "arganSample",
  folder: "GEE",
  fileNamePrefix: "Table",
  fileFormat: "CSV",
  selectors: ["B2", "B3", "B4", "B5", "B6", "B7"]
});

