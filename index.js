var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');
var geocoder = require('geocoder');
var GeoJSON = require('geojson');
var iconv = require('iconv-lite');
var request = require('request');
var _ = require('underscore');
iconv.extendNodeEncodings();

var pts = []; // results array

// receive table row, extract address parts & call geocoder
function geocode(item, callback) {
	var $ = cheerio.load(item);

	var addressString = $(item).children('td.building').text() + ", " +
		$(item).children('td.street').text() + ", " +
		$(item).children('td.city').text();

	geocoder.geocode(addressString, function ( err, data ) {
		_.delay(function(){ callback() }, 600); // wait 600ms after call
		if(err) return console.error(err);
		if(data.results.length > 0) {
			var location = data.results[0].geometry.location;
				console.log('\033[36m'+ addressString +'\033[0m -> \033[32m'+ location.lat, location.lng +'\033[0m');

				var wifi = { 
					address: addressString, 
					latitude: Math.round(location.lat * 10000)/10000, 
					longitude: Math.round(location.lng * 10000)/10000
				};
				pts.push(wifi);
		} else {
			return console.warn("No location info for "+addressString);
		}
	}, { language:"de" });
}

// extract table data, call async geocode() for each table row
// finally write "WWU WLANs.geojson" with results
function parseHTML(err, resp, html){
	if(err) return console.error(err);
	var $ = cheerio.load(html);
	var rows = $('table#funkzellenliste').children('tr').filter(function(i, el){
		return $(el).children('td.building').length > 0;
	});
	console.log('\033[36mTotal: \033[0m' + rows.length + ' addresses');

	// allow 5 calls at a time, with a delay of 600ms after each call (see above in geocode())
	// to prevent Google from rate limiting you
	// this limit can probably be set higher, it worked fine for 200 addresses
	async.eachLimit(rows, 5, 
		function(item, callback){
			geocode(item, callback);
		},
		function(item, callback){
			var geojsonOutput = GeoJSON.parse(pts, { Point: ['latitude', 'longitude'] });
			fs.writeFile(
				'WWU_WLANs.geojson', 
				JSON.stringify(geojsonOutput),
				function(err) {
					if(err) return console.error("Error writing file");
					console.log("All done! " + pts.length + " of "+ rows.length +" locations geocoded.");
				}
			);		
		}
	);
}

var nic_online = "https://www.nic.uni-muenster.de/Funkzellenuebersicht.asp?suchString=&anz=Suchen&modus=such";
request({ url: nic_online, encoding: 'iso-8859-15' }, parseHTML);