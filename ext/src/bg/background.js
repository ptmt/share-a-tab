var openTab = function (url) {
    chrome.tabs.query({'url': url}, function (result) {
		if (result.length == 0) {
			chrome.tabs.create(	{ 'url' :  url });			
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
			if (tab.url && tab.url == "https://share-a-tab.phinitive.com/" && changeInfo.status == "complete") {
				//alert (JSON.stringify(changeInfo));
				chrome.storage.sync.set({'email': tab.title}, function() {
				    // Notify that we saved.
				    console.log('step 2: email has been saved', tab.title);
				    prepare(tab.title);
				    chrome.tabs.remove(tab.id);
				  });
				
			}
		});
    }
  });


var prepare = function (useremail) {
	try {
		var socket = io.connect('https://share-a-tab.phinitive.com/'); 
	}
	catch (err) {
		notify("SSL certificate connection issue", "Please, accept a certificate and refresh background.html");
		openTab('https://share-a-tab.phinitive.com/');		
	}
	var trace = function (str) {	  
	  console.log(str, useremail);
	}


	var checkAvaibility = function () {
		socket.emit("set userid", useremail);
		socket.on('ready', function (rooms) {                    			  		
			var s = _.map(_.filter(_.keys(rooms), function (f) { return (f != "/" + useremail)}), function (x) { return "<li data-room-id='" + x + "'>" + ((x == "") ? "/all" : x) + "</li>"; }); 
			chrome.storage.sync.set({'rooms': s}, function() {          
		        trace ('step 5: room list refreshed');
		    });		
       		trace('step 5a: available rooms: ' + JSON.stringify(s));
       		chrome.extension.sendMessage({action:"userlist", 'rooms': s}, function(response) {
              //trace('step 6: sending response to browser action');
            });
    	});	 	
	}

  	

	//example of using a message handler from the inject scripts
	chrome.extension.onMessage.addListener(
	  function(request, sender, sendResponse) {
	  	trace("internal chrome message recieved " + JSON.stringify(request));
		if (request.action == "send") {
			socket.emit('upload_syncdata', request);  
			trace('step 7: syncdata sending to node.js..');
			socket.on('trying_to_notify', function () {            
				trace('step 8: node.js just has been recieved your link, now we are trying to notify ' + request.to);
			});
		}
		if (request.action == "get_list") {
			checkAvaibility();
		}
	  });
  
  //$().ready(function () {
    trace('step 3: prepare function call with useremail=' + useremail);

    checkAvaibility();
    
    socket.on('connect', function () {  
        trace('step 4: websocket is open');
        
      //  socket.on('ready', function (rooms) {            
      //  	//notify('connection successfull', "waiting for incoming request");
      //      trace('waiting for incoming sync request.. ' + JSON.stringify(rooms));
      //  });
        socket.on('download_syncdata', function (syncdata) {           
           trace('step 9: syncdata downloaded from node.js server ' + syncdata.href);           
           openTab(	syncdata.href );
           socket.emit('download_complete', syncdata.from);            
        });
        socket.on('finish_sync', function () {
           trace('FINAL operation complete \n=================\n\n');
           chrome.extension.sendMessage({action:"complete"}, function(response) {
              trace(response);
           });
        });
      });
    
    
 // });

	
}



var notify = function (title, body) {
	var notification = webkitNotifications.createNotification(
	  '48.png',  // icon url - can be relative
	  title,  // notification title
	  body  // notification body text
	);
	notification.show();
}
