var getCurrentTab = function (callback) {
    chrome.tabs.query({
      windowId: chrome.windows.WINDOW_ID_CURRENT,
      active: true
    }, function(tabs) {
      callback(tabs[0]);
    });
  };

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {      
      console.log("message recieved: " + JSON.stringify(request));
      if (request.action == "complete") {
         $('#loaderImage').toggle();
         $('#mainPopup').toggleClass('disabled');        
      }
      if (request.action == "userlist") {
         console.log(JSON.stringify(request.rooms));
         $('.online-rooms').html(request.rooms);
         connectEvents();
         chrome.storage.sync.set({'rooms': request.rooms}, function() {          
            console.log ('room list refreshed');
         });
         $('#loaderImage').toggle();
         $('#mainPopup').toggleClass('disabled');   
      }
    });

var refreshRooms = function () {
  chrome.extension.sendMessage({action:"get_list"}, function(response) {
    $('#loaderImage').toggle();
    $('#mainPopup').toggleClass('disabled');        
    console.log("send get_list, response: " + response);
  });
}

var connectEvents = function () {
  $(".online-rooms li").on('click', function (e) {         
       console.log (e);
            
       var share_with = $(this).data('room-id');
      // chrome.storage.sync.set({'share_with': share_with}, function() {          
      //      console.log ('saved to cloud storage');
      // });

       $('#mainPopup').toggleClass('disabled');
       $('#loaderImage').toggle();
       chrome.storage.sync.get('email', function(data) { 
         getCurrentTab(function (tab) {
           var syncdata = {
                action: "send",
                href : tab.url,
                from: data.email,
                to: share_with,
                cookie: document.cookie
           }
           chrome.extension.sendMessage(syncdata, function(response) {
              console.log(response);
           });
         });
      });
    });
}

 $().ready(function () {
   

    chrome.storage.sync.get('rooms', function(data) {  
        if (data.rooms)   {
          $('.online-rooms').html(data.rooms);                   
          connectEvents();
        }
        else 
          refreshRooms();
    });

    $(".refresh-btn").on("click", function () { refreshRooms(); })
    
    $(".logout-btn").on("click", function () {
       chrome.storage.sync.remove("email");
    })

    
 }); // <- in love with javascript callbacks