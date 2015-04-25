// dmapull.js

console.log("dmapull.js loaded")

var Q = []; // a global queue of intercepted mp3 urls
chrome.browserAction.disable();


function createQhtml() {
    var e = jQuery( document.createElement('div') );
    for(var i=0; i<Q.length;i++) {
        jQuery("<div><a href='"+Q[i]+"'>"+i+"</a><button>play</button><button>get</button></div>")
            .appendTo(e);
    }
    return e.html();
}

function popopQ(mp3item, tab_id) {
	Q.push(mp3item);
	chrome.browserAction.enable(tab_id);
	chrome.browserAction.setIcon({path: "favicon.ico", tabId: tab_id});
	chrome.browserAction.setBadgeText({text: Q.length.toString(), tabId:tab_id});
	chrome.browserAction.setTitle({title: Q.length.toString() + " tracks in queue", tabId:tab_id});
	chrome.browserAction.setPopup({popup: createQhtml(), tabId:tab_id});
} 

chrome.webRequest.onCompleted.addListener(
  function(info) {
    //console.log("dma intercepted: %o", info);
	if(info.url.indexOf("9876543210fedcba") != -1) {
		// prevent infinite loop
		return {};
	}
	jQuery.get(info.url + "?9876543210fedcba", function(data) {
		//console.log("got data: %o", data);
		var myRegexp = /(http.*\.mp3)/g	;
		var match;
		while ((match = myRegexp.exec(data)) != null) {
			// matched text: match[0]
			// match start: match.index
			// capturing group n: match[n]
			console.log("found %o", match[1]);
			popopQ(match[1], info.tabId);
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