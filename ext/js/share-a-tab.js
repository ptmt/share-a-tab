var getCurrentTab = function (callback) {
    chrome.tabs.query({
      windowId: chrome.windows.WINDOW_ID_CURRENT,
      active: true
    }, function(tabs) {
      callback(tabs[0]);
    });
  };

var toggleLoader = function () {
       $('#mainPopup').toggleClass('disabled');
       $('#loaderImage').toggle();
}
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {      
      console.log("message recieved: " + JSON.stringify(request));
      if (request.action == "complete") {        
         $('.log').text('sent');
      }
      if (request.action == "userlist") {
         console.log(JSON.stringify(request.rooms));
         $('.online-rooms').html(request.rooms);
         connectEvents();        
   //      toggleLoader();
      }
    });

var refreshRooms = function () {
  chrome.extension.sendMessage({action:"get_list"}, function(response) {
    toggleLoader();
    setTimeout(function() {toggleLoader();}, 2000);       
    console.log("send get_list, response: " + response);
  });
}

var connectEvents = function () {
  $(".online-rooms li").on('click', function (e) {         
               
       var share_with = $(this).data('room-id').replace('/','');
       console.log (share_with);    
       toggleLoader();
       setTimeout(function() {toggleLoader();}, 3000);       
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
          console.log ('rooms ' + JSON.stringify(data.rooms));
          $('.online-rooms').html(data.rooms);                   
          connectEvents();
        }
        else {
          refreshRooms();
        }
    });

    $(".refresh-btn").on("click", function () { refreshRooms(); })
    
    $(".logout-btn").on("click", function () {
       chrome.storage.sync.remove("email");
    })

    
 }); // <- in love with javascript callbacks
