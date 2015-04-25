// popup.js

var Q = [];  // a global queue of intercepted mp3 urls

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("got msg: %o", message);
    if(message.msg == "newurl") {
        console.log("new mp3 url: %o", message.url);
        Q.push(message.url);
        jQuery("#title").html(Q.length + "tracks");
        createQhtml();
        sendResponse(Q);
        return true;
    }
    sendResponse(null);
    return true;
    
});


function createQhtml() {
    var e = jQuery("#list").empty();
    for(var i=0; i<Q.length;i++) {
        jQuery("<li><a href='"+Q[i]+"'>"+i+"</a><button>play</button><button>get</button></li>")
            .appendTo(e);
    }
    
}
