#Instant tab sharing

Share-a-Tab is a Chrome plugin built with lightweight Node.js app as a backend. #Socket.io #Express #Azure 

Recommend to use your own node.js server for privacy at this moment. 

Also Available at [Google Chrome Store] (https://chrome.google.com/webstore/detail/share-a-tab/hbkcjcepcamiepahcheeoggfifmljdna)

##How it works

First of all, `background.html` try to authorize you with your Google Account. 

After socket connection with node.js server is open (xhr polling for example) `browser_action.html` refresh room list and subscribe you to the personal room.

When you decide to share a tab, `browser_action.html` send internal chrome message to `background.html` where socket is already open. Server recieve synchronization data (fields like to, href, etc.) and sent it to specially room. Other Chrome instance make query to all opened tabs, if query returning nothing, Chrome creating new tab, update one otherwise.

##TODO:

Sending `document.cookie`, `window.console`, manipulating black list.

##License

MIT License.


