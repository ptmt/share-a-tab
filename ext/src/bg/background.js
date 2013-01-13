 chrome.storage.sync.get('email', function(data) { 
   
    if (data && data.email) {         	
    	prepare(data.email);
    }
    else {
    	notify("not authorized", JSON.stringify(data));

    	chrome.tabs.create(	{ 'url' : 'https://share-a-tab.phinitive.com/' });

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			if (tab.url && tab.url == "https://share-a-tab.phinitive.com/" && changeInfo.status == "complete") {
			
				chrome.storage.sync.set({'email': tab.title}, function() {
				    // Notify that we saved.
				    notify('email saved', tab.title);
				    prepare(tab.title);
				  });
				
			}
		});
    }
  });


var prepare = function (useremail) {

	window.setInterval (function () { checkAvaibility(); } , 10000);

	var trace = function (str) {	  
	  console.log(str);
	}

	var checkAvaibility = function () {
		socket.emit("set userid", useremail)
			socket.on('ready', function (rooms) {                    	
			    chrome.storage.sync.set({'rooms': rooms}, function() {          
			        console.log ('room list refreshed');
			    });				
				var s = _.map(_.filter(_.keys(rooms), function (f) { return (f != "/" + useremail)}), function (x) { return "<li data-room-id='" + x + "'>" + ((x == "") ? "/all" : x) + "</li>"; }); 
           		trace('available rooms: ' + JSON.stringify(s));
           		chrome.extension.sendMessage({action:"userlist", rooms: s}, function(response) {
	              trace(response);
	            });
        	});	 	
	}

  	var socket = io.connect('https://share-a-tab.phinitive.com/'); 

	chrome.extension.onMessage.addListener(
	  function(request, sender, sendResponse) {
	  	trace("message recieved " + JSON.stringify(request));
		if (request.action == "send") {
			socket.emit('upload_syncdata', request);  
			trace('syncdata sending..');
			socket.on('trying_to_notify', function () {            
				trace('trying_to_notify');
			});
		}
		if (request.action == "get_list") {
			checkAvaibility();
		}
	  });
 

    trace('set userid = ' + useremail);
    
    socket.on('connect', function () {  
        trace('websocket is open');
        socket.on('download_syncdata', function (syncdata) {           
           trace('syncdata downloaded.. ' + syncdata.href);           
           chrome.tabs.create(	{ 'url' : syncdata.href });
           socket.emit('download_complete', syncdata.from);            
        });
        socket.on('finish_sync', function () {
           trace('operation complete \n=================\n\n');
           chrome.extension.sendMessage({action:"complete"}, function(response) {
              trace(response);
           });
        });
      });
	
}

var notify = function (title, body) {
	var notification = webkitNotifications.createNotification(
	  '/icons/icon48.png',  // icon url - can be relative
	  title,  // notification title
	  body  // notification body text
	);
	notification.show();
}
