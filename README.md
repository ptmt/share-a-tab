#Instant tab sharing

Share-a-Tab is a Chrome plugin built with lightweight Node.js app as a backend. #Socket.io #Express #Azure 

Recommend to use your own node.js server for privacy at this moment. 

Also Available at [Google Chrome Store] (https://chrome.google.com/webstore/detail/share-a-tab/hbkcjcepcamiepahcheeoggfifmljdna)

##How it works

At first start, `background.html` try to authorize you with your Google Account and open new tab. 

After authentification, tab should be close, socket connection with node.js server initialize (transport may be diffirent, xhr polling for example), `browser_action.html` refresh room list, save it to Cloud Google Chrome Storage and subscribe you to all public rooms.

When you decide to share a tab and click on room name, `browser_action.html` send internal chrome message to `background.html` where socket is already open. Server recieve synchronization data (fields like to, href, etc.) and sent it to choosen room. Other Chrome instance make query to all opened tabs, if query returning nothing, Chrome creating new tab, update one otherwise.

##TODO:

Sending `document.cookie`, `window.console`, manipulating black list.

##License

MIT License.


