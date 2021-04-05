
// TASSELLED CAP GREENNESS
var tas_capG = image.expression(
    '(BAND_2 * -0.2941) + (BAND_3 * -0.243) + (BAND_4 * -0.5424) + (BAND_5 * 0.7276) + (BAND_6 * 0.0713) + (BAND_7 * 0.1608)', {
      'BAND_2': clip.select('B2'),
      'BAND_3': clip.select('B3'),
      'BAND_4': clip.select('B4'),
      'BAND_5': clip.select('B5'),
      'BAND_6': clip.select('B6') ,
      'BAND_7': clip.select('B7')
}).rename('greenness');

// TASSELLED CAP BRIGHTNESS
var tas_capB = image.expression(
    '(BAND_2 * 0.3029) + (BAND_3 * 0.2786) + (BAND_4 * 0.4733) + (BAND_5 * 0.5599) + (BAND_6 * 0.508) + (BAND_7 * 0.1872)', {
      'BAND_2': clip.select('B2'),
      'BAND_3': clip.select('B3'),
      'BAND_4': clip.select('B4'),
      'BAND_5': clip.select('B5'),
      'BAND_6': clip.select('B6') ,
      'BAND_7': clip.select('B7')
}).rename('brightness');

// TASSELLED CAP WETNESS
var tas_capW = image.expression(
    '(BAND_2 * 0.1511) + (BAND_3 * 0.1973) + (BAND_4 * 0.3282) + (BAND_5 * 0.3407) + (BAND_6 * -0.7117) + (BAND_7 * -0.4559)', {
      'BAND_2': clip.select('B2'),
      'BAND_3': clip.select('B3'),
      'BAND_4': clip.select('B4'),
      'BAND_5': clip.select('B5'),
      'BAND_6': clip.select('B6') ,
      'BAND_7': clip.select('B7')
}).rename('wetness');


// ADVANCED VEGETATION INDEX (AVI) 
var AVI = image.expression(
    '(BAND_4 + 1) * (256 - BAND_3) * (BAND_4 - BAND_3)', {
      'BAND_3': clip.select('B3'),
      'BAND_4': clip.select('B4')
}).rename('AVI');

// BARE SOIL INDEX (BSI) 
var BSI = image.expression(
    '(((BAND_4 + BAND_2) - BAND_3) / ((BAND_4 + BAND_2) + BAND_3)) * 2', {
      'BAND_2': clip.select('B2'),
      'BAND_3': clip.select('B3'),
      'BAND_4': clip.select('B4')
}).rename('BSI');


// SHADOW (SI) 
var SI = image.expression(
    'sqrt((256 - BAND_2) * (256 - BAND_3))', {
      'BAND_2': clip.select('B2'),
      'BAND_3': clip.select('B3')
}).rename('SI');


// NDVI
var ndvi = clip.expression(
    '((BAND_5 + BAND_4) / (BAND_5 - BAND_4))', {
      'BAND_4': clip.select('B4'),
      'BAND_5': clip.select('B5')
}).rename('NDVI');


// Landsat 8 
// ADVANCED VEGETATION INDEX (AVI) 

var AVI = clip.expression(
    'cbrt((BAND_5 * (1 - BAND_4) * (BAND_5 - BAND_4))', {
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

// Landsat 5 
// ADVANCED VEGETATION INDEX (AVI) 
var AVI = clip.expression(
    'cbrt((BAND_4 * (1 - BAND_3) * (BAND_4 - BAND_3))', {
      'BAND_3': clip.select('B3'),
      'BAND_4': clip.select('B4')
}).rename('AVI');

// BARE SOIL INDEX (BSI) 
var BSI = clip.expression(
    '(((BAND_5 + BAND_3) - (BAND_4 + BAND_1)) / ((BAND_5 + BAND_3) + (BAND_4 + BAND_1)))', {
      'BAND_1': clip.select('B1'),
      'BAND_3': clip.select('B3'),
      'BAND_4': clip.select('B4'),
      'BAND_5': clip.select('B5')
}).rename('BSI');

// SHADOW (SI) 
var SI = clip.expression(
    'cbrt((1 - BAND_1) * (1 - BAND_2) * (1 - BAND_3))', {
      'BAND_2': clip.select('B2'),
      'BAND_3': clip.select('B3'),
      'BAND_4': clip.select('B4')
}).rename('SI');

// Sentinel 2 
// ADVANCED VEGETATION INDEX (AVI) 
var AVI = clip.expression(
    'cbrt((BAND_8 * (1 - BAND_4) * (BAND_8 - BAND_4))', {
      'BAND_4': clip.select('B4'),
      'BAND_8': clip.select('B8')
}).rename('AVI');

// BARE SOIL INDEX (BSI) 
var BSI = clip.expression(
    '(((BAND_11 + BAND_4) - (BAND_8 + BAND_2)) / ((BAND_11 + BAND_4) + (BAND_8 + BAND_2)))', {
      'BAND_2': clip.select('B2'),
      'BAND_4': clip.select('B4'),
      'BAND_8': clip.select('B8'),
      'BAND_11': clip.select('B11')
}).rename('BSI');


// SHADOW (SI) 
var SI = clip.expression(
    'cbrt((1 - Band_2) * (1 - BAND_3) * (1 - BAND_4))', {
      'BAND_2': clip.select('B2'),
      'BAND_3': clip.select('B3'),
      'BAND_4': clip.select('B4')
}).rename('SI');





