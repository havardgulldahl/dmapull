// dmapull.js
/*jslint browser: true, devel: true, nomen: true, sloppy: true, stupid: true, white: true */

console.log("dmapull.js loaded");

function metadata(mp3url) { // get id3 data via id3.js
    var tok = mp3url + "_id3";
    var incache = localStorage.getItem(tok) || false;
    if(incache) {return incache; }
    return {}; // bypass until IIS Range bug is fixed
    
    ID3.loadTags(mp3url, function() {
        var tags = ID3.getAllTags(mp3url);
        console.log(tags);
        localStorage.setItem(tok, tags);
        return tags;
    });
    return {};
}    


var Q = {  // a global queue of intercepted mp3 urls
    init : function() {
        Q._q = JSON.parse( localStorage.getItem("dmapullQ")) || []; // array of url strings
        Q._niceq = []; // array of objects with id3 tags and url
        return Q._q;
    },
    add : function(url) {
        Q._q.push(url);
        var md = {"url":url, "metadata": metadata(url)};
        Q._niceq.push(md);
        chrome.runtime.sendMessage({"msg":"new", "item":md});
        return Q.length();
    },
    clear : function() {
        Q._q = [];
        Q._niceq = [];
        
    },
    save : function() {
        return localStorage.setItem("dmapullQ", JSON.stringify(Q._q));
    },
    length : function() {
        return Q._q.length;
    },
    toArray : function() {
        return Q._q;
    },
    toNiceArray : function() {
        return Q._niceq;
    },
    get : function(idx) {
        return Q._q[idx];
    }

};
Q.init(); // pull from persistant storage on startup

var player = {
    hardware: jQuery("<audio/>").attr({preload: "auto", autobuffer: true})
        .on("ended", function(ev) { player.next(); }),
    play : function(url) {
        console.log("hardware %o: ", url);
        if(url !== undefined) {
            player.hardware.attr({"src": url});
        }
        player.hardware.trigger("play");
        chrome.notifications.create("dmapullnotification", {type: "basic",
              title: "Playing song",
              message: "Currently "+url, // TODO: use id3 tags
              iconUrl: "wave.png",
              buttons: [ {title: "Next"}, {title: "Stop"} ]
        });
        chrome.notifications.onButtonClicked.addListener(function(clickid, buttonid) {
            if(buttonid === 0) { // next
                player.next();
            } else if(buttonid === 1) { // stop
                player.pause();
            }
        });
        chrome.runtime.sendMessage({"msg":"playerstate", "item":"playing"});
    },
    pause : function() {
        player.hardware.trigger("pause");
        chrome.runtime.sendMessage({"msg":"playerstate", "item":"paused"});
    },
    next : function() {
        var current = Q.toArray().indexOf(player.hardware.attr("src"));
        if(current > -1 && current+1 <= Q.toArray().length) {
            player.play(Q.get(current+1));
        }
    },
    status : function() {
        var status, a = player.hardware[0];
        if(a.paused) { status = "paused"; }
        else if(a.ended) { status = "stopped"; }
        else if(a.duration > 0 && !a.paused) { status = "playing"; }
        else  { status = "loading"; }
        chrome.runtime.sendMessage({"msg":"playerstate", "item":status});
        return status;
    }    
}


    
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      switch(request.msg) {
            case "rawQ":
                sendResponse(Q.toArray());
                break;
            case "Q":
                sendResponse(Q.toNiceArray());
                break;
            case "playerstate":
                sendResponse(player.status());
                break;
            case "clear":
                player.pause();
                Q.clear();
                sendResponse(Q.toNiceArray());
                break;

            case "metadata":
                sendResponse(metadata(request.item));
                break;
            case "play":
                player.play(request.item);
                break;
            case "pause":
                player.pause();
                break;
            case "next":
                player.next();
                break;
            case "download":
                chrome.downloads.download({url:request.item});
                break;
            case "downloadall":
                var rawQ = Q.toArray();
                for(var i=0;i<rawQ.length;i++) {
                    chrome.downloads.download({url:rawQ[i]});
                }
                break;

          
      }
});


function popopQ(mp3item, tab_id) {
	Q.add(mp3item);
    if(["paused", "stopped"].indexOf(player.status()) > -1) {  player.play(mp3item); } // start playing first song added, if currently silent
    chrome.pageAction.show(tab_id);
    chrome.pageAction.setPopup({popup: "popup.html", tabId:tab_id});
    chrome.pageAction.setIcon({path: "favicon.ico", tabId: tab_id});
    chrome.pageAction.setTitle({title: Q.length().toString() + " tracks in queue", tabId:tab_id});

} 
//chrome.webRequest.onCompleted.addListener(

chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    //console.log("dma intercepted: %o", info);
    var cancel = {cancel: true};
	if(info.url.indexOf("9876543210fedcba") != -1) {
		// let this through, it's our own call
		return {};
	}
	jQuery.get(info.url + "?9876543210fedcba", function(data) { // get the playlist, and add our own identifier
		//console.log("got data: %o", data);
		var myRegexp = /(http.*\.mp3)/g	;
		var match;
		while ((match = myRegexp.exec(data)) != null) {
			// matched text: match[0]
			// match start: match.index
			// capturing group n: match[n]
			//console.log("found %o", match[1]);
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