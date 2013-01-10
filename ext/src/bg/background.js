 chrome.storage.sync.get('email', function(data) { 
     console.log (data, data.email, data && data.email);

    if (data && data.email) {         	
    	prepare(data.email);
    }
    else {
    	notify("not authorized", JSON.stringify(data));

    	chrome.tabs.create(	{ 'url' : 'https://share-a-tab.phinitive.com/' });

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			if (tab.url && tab.url == "https://share-a-tab.phinitive.com/" && changeInfo.status == "complete") {
				//alert (JSON.stringify(changeInfo));
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

	var trace = function (str) {
	  $('.debug').append('[' + socket.socket.sessionid +']: ' + str + '\n');
	  console.log(str);
	}

  	var socket = io.connect('https://share-a-tab.phinitive.com/'); 

	//example of using a message handler from the inject scripts
	chrome.extension.onMessage.addListener(
	  function(request, sender, sendResponse) {
	  	//notify("message recieved", JSON.stringify(request));
		if (request.action == "send") {
			socket.emit('upload_syncdata', request);  
			trace('syncdata sending..');
			socket.on('trying_to_notify', function () {            
				trace('trying_to_notify');
			});
		}
	  });
  
  //$().ready(function () {
    trace('try to connect, using ' + useremail);
    socket.emit("set userid", useremail)
    socket.on('connect', function () {  
        trace('websocket is open');
        
        socket.on('ready', function (rooms) {            
        	//notify('connection successfull', "waiting for incoming request");
            trace('waiting for incoming sync request.. ' + JSON.stringify(rooms));
        });
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