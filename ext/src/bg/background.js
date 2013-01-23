// GLOBAL locks. I am sad about this:(

var refreshInterval;
var lockTabUpdating;
var lockSending;
var lockDownloading; 

var lastSent;

var openTab = function (url) {
    var matchUrl = url.split('#')[0] + "*";
	chrome.tabs.query({'url': matchUrl, 'windowId' : chrome.windows.WINDOW_ID_CURRENT }, function (result) {
		console.log ("match query " + matchUrl, " with result: " + JSON.stringify(result));
		if (result.length == 0) {
			chrome.tabs.create(	{ 'url' :  url });			
		}
		else {			
			chrome.tabs.update( result[0].id, {'active': true, 'url': url})
		}
	});
}
chrome.storage.sync.get('email', function(data) { 
    if (data && data.email) {         	
    	prepare(data.email);
    }
    else {
    	console.log("step 1: try to authorize", JSON.stringify(data));

    	openTab('https://share-a-tab.phinitive.com/');

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			if (tab.url && tab.url == "https://share-a-tab.phinitive.com/" && changeInfo.status == "complete" && !lockTabUpdating) {
				lockTabUpdating = true;
				chrome.storage.sync.set({'email': tab.title}, function() {
				    // Notify that we saved.				 
				  	prepare(tab.title); 
				  	console.log('step 2: email has been saved', tab.title);	
				  	chrome.tabs.remove(tab.id); 
				  	lockTabUpdating = false;
				  });				
			}
		});
    }
  });

var prepare = function (useremail) {
	try {
		var options = { rememberTransport: true, 
                        tryTransportsOnConnectTimeout: true }; 
		var socket = io.connect('http://share-a-tab.phinitive.com/', options); 
	}
	catch (err) {
		notify("SSL certificate connection issue", "Please, accept certificate and refresh background.html");
		openTab('https://share-a-tab.phinitive.com/');		
	}

	
	var trace = function (str) {	  
	  console.log(str, useremail);
	}


	var checkAvaibility = function () {
		trace('step 3: checkAvaibility');		
		socket.emit("set userid", useremail);		
	}

  	

	//example of using a message handler from the inject scripts
	chrome.extension.onMessage.addListener(
	  function(request, sender, sendResponse) {
	  	trace("internal chrome message recieved " + JSON.stringify(request));
		if (request.action == "send") {
			if (!lockSending) {
				lockSending = true;
				request.from = useremail;
				socket.emit('upload_syncdata', request);  
				trace('step 7: syncdata uploading to node.js..');
				socket.on('trying_to_notify', function () {            
					trace('step 8: node.js just has been recieved your link, now we are trying to notify ' + request.to);
					lockSending = false;
				});
			}
		}
		if (request.action == "get_list") {
			checkAvaibility();
		}
	  });
  
  //$().ready(function () {   

  	if (!refreshInterval) {
  		console.log ('set interval');
    	refreshInterval = window.setInterval (function () { checkAvaibility(); } , 100000);
    }
        
    socket.on('connect', function () {  
        trace('step 4: websocket is open');    
    });
    
    socket.on('download_syncdata', function (syncdata) {   
       if (lastSent != syncdata.href) {        	   
	       trace('step 9: syncdata downloaded from node.js server ' + syncdata.href);           
	       openTab(	syncdata.href );
	       lastSent = syncdata.href;
	       to = syncdata.to == "" ? "/all" : syncdata.to;
	       notify(syncdata.from, "Shared with " + to);
	   }
	   socket.emit('download_complete', syncdata.from);            	       	       
    });
    socket.on('finish_sync', function () {
       trace('FINAL operation complete \n=================\n\n');
       chrome.extension.sendMessage({action:"complete"}, function(response) {
          trace(response);
       });
    });

    socket.on('ready', function (rooms) {                    			  		
		var s = _.map(_.filter(_.keys(rooms), function (f) { return (f != "/" + useremail)}), function (x) { return "<li data-room-id='" + x + "'>" + ((x == "") ? "/all" : x) + "</li>"; }); 
		chrome.storage.sync.get('rooms', function(data) {  	        
          if (data.rooms != rooms) {
          	chrome.storage.sync.set({'rooms': s}, function() {          
		        trace ('step 5: room list refreshed');
		    });		
          }		        
	    });
		
   		trace('step 5a: available rooms: ' + JSON.stringify(s));
   		chrome.extension.sendMessage({action:"userlist", 'rooms': s}, function(response) {
          //trace('step 6: sending response to browser action');
        });
	});	 

    // Add a disconnect listener
	socket.on('disconnect',function() {
	  console.log('The client has disconnected');
	});
 
}



var notify = function (title, body) {
	var notification = webkitNotifications.createNotification(
	  '48.png',  // icon url - can be relative
	  title,  // notification title
	  body  // notification body text
	);
	notification.show();
	setTimeout(function() {notification.cancel();}, 5000);
}
