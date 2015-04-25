// dmapull.js

console.log("dmapull.js loaded")

chrome.webRequest.onCompleted.addListener(
  function(info) {
    //console.log("dma intercepted: %o", info);
    // Redirect the lolcal request to a random loldog URL.
	if(info.url.indexOf("9876543210fedcba") != -1) {
		// prevent infinite loop
		return {};
	}
	jQuery.get(info.url + "?9876543210fedcba", function(data) {
		console.log("got data: %o", data);
		var myRegexp = /(http.*\.mp3)/g;
		var match;
		while ((match = myRegexp.exec(data)) != null) {
			// matched text: match[0]
			// match start: match.index
			// capturing group n: match[n]
			console.log("get %o", match[1]);
		}

	}, "text");
	return {};
  },
  // filters
  {
    urls: [
      "http://dma/playerInformation.do*"
    ], 
	types: [
    // type modifier
	  "xmlhttprequest"
	]
  },
  []
  
);