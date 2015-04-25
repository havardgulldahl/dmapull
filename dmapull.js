// dmapull.js
/*jslint browser: true, devel: true, nomen: true, sloppy: true, stupid: true, white: true */

console.log("dmapull.js loaded");

//var Q = []; // a global queue of intercepted mp3 urls
chrome.browserAction.disable();



function popopQ(mp3item, tab_id) {
	//Q.push(mp3item);
    chrome.runtime.sendMessage({"msg":"newurl", "url":mp3item}, function(currentQ) {
        console.log("got reply: %o", currentQ);
        chrome.browserAction.enable(tab_id);
        chrome.browserAction.setPopup({popup: "popup.html", tabId:tab_id});
        chrome.browserAction.setIcon({path: "favicon.ico", tabId: tab_id});
        if(currentQ === undefined) { return; }
        chrome.browserAction.setBadgeText({text: currentQ.length.toString(), tabId:tab_id});
        chrome.browserAction.setTitle({title: currentQ.length.toString() + " tracks in queue", tabId:tab_id});
    });
} 
//chrome.webRequest.onCompleted.addListener(

chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    console.log("dma intercepted: %o", info);
    var cancel = {cancel: true};
	if(info.url.indexOf("9876543210fedcba") != -1) {
		// let this through
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
	return cancel;
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
  // opts
  [ "blocking" ]
  
);