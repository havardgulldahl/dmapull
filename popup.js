// popup.js
/*jslint browser: true, devel: true, nomen: true, sloppy: true, stupid: true, white: true */

var Q, playerstate;

function createQhtml() {
    var e = jQuery("#list").empty();
    for(var i=0; i<Q.length;i++) { 
        var t = Q[i].metadata.title || "Song #"+i;
        jQuery("<li data-id="+i+">"+t+"<button data-cmd=play>play</button><button data-cmd=download>get</button></li>")
            .appendTo(e);
    }
    e.on("click", function(ev) {
        //console.log("click: %o", ev);
        var btn = jQuery(ev.target);
        var _id = btn.parent().data("id");
        console.log("id: %o", _id);
        switch(btn.data("cmd")) {

            case "play": 
                chrome.runtime.sendMessage({"msg":"play", "item":Q[_id].url}); break;
            case "pause": 
                chrome.runtime.sendMessage({"msg":"pause", "item":Q[_id].url}); break;
            case "download": 
                chrome.runtime.sendMessage({"msg":"download", "item":Q[_id].url}); break;
        }
    });
    
}

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      switch(request.msg) {
        case "playerstate":
            playerstate = request.item;
            break;
      }
    }
);

// get current queue on popup
jQuery(document).ready(function() {
    console.log("popup");
    chrome.runtime.sendMessage({msg:"Q"}, function(response) {
        console.log("got Q %o", response);
        Q = response;
        createQhtml();
    });
});
