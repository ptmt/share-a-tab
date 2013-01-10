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
      //notify("message recieved", JSON.stringify(request));
      if (request.action == "complete") {
         $('#loaderImage').toggle();
         $('#mainPopup').toggleClass('disabled');        
      }
    });

 $().ready(function () {
    
    chrome.storage.sync.get('share_with', function(data) {              
          $('input[name=reciever-email]').val(data.share_with);
    });
    
    $(".logout-btn").on("click", function () {
       chrome.storage.sync.remove("email");
    })

    $(".share-btn").on('click', function (e) {         

            
       var share_with = $('input[name=reciever-email]').val();
       chrome.storage.sync.set({'share_with': share_with}, function() {          
            console.log ('saved to cloud storage');
       });

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
 }); // <- in love with javascript callbacks