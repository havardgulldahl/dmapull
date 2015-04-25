// popup.js
/*jslint browser: true, devel: true, nomen: true, sloppy: true, stupid: true, white: true */

var Q = {  // a global queue of intercepted mp3 urls
    pull : function() {
        Q._q = JSON.parse( localStorage.getItem("dmapullQ")) || [];
        return Q._q;
    },
    add : function(url) {
        Q._q.push(url);
        return Q.length();
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
    get : function(idx) {
        return Q._q[idx];
    }

};
Q.pull();

function play(id) {
    var url = Q.get(id);
    jQuery("#player").attr("src", url).trigger("play");
    
}

function download(id) {
    var u = Q.get(id);
    chrome.downloads.download({url:u});
    
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("got msg: %o", message);
    if(message.msg == "newurl") {
        console.log("new mp3 url: %o", message.url);
        Q.add(message.url);
        jQuery("#title").html(Q.length() + "tracks");
        createQhtml();
        sendResponse(Q.toArray());
        return true;
    }
    sendResponse(null);
    return true;
    
});


function createQhtml() {
    var e = jQuery("#list").empty();
    for(var i=0; i<Q.length();i++) {
        jQuery("<li data-id="+i+"><button data-cmd=play>play</button><button data-cmd=download>get</button></li>")
            .appendTo(e);
    }
    e.on("click", function(ev) {
        console.log("click: %o", ev);
        var btn = jQuery(ev.target);
        var _id = btn.parent().data("id");
        console.log("id: %o", _id);
        if(btn.data("cmd") == "play") { play(_id); }
        else { download(_id); }
    });
    
}
