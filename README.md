# Instant tab sharing

Share-a-Tab is a Chrome plugin built with lightweight Node.js app as a backend. #Socket.io #Express #Azure 

We use SSL, but  recommended to use your own node.js server cause privacy issues with transfering data at this moment. 

Also Available at [Google Chrome Store] (https://chrome.google.com/webstore/detail/share-a-tab/hbkcjcepcamiepahcheeoggfifmljdna)

## How it works

At first start, `background.html` open new tab and authorize you with your Google Account. 

After authentification, tab should be closing, socket connection is initializing (transport may be diffirent, xhr polling for example), `browser_action.html` refresh room list, save it to Cloud Google Chrome Storage and subscribe you to all public rooms.

When you decide to share a tab and click at room name, `browser_action.html` send internal Chrome message to `background.html` where socket is already open. Server recieve synchronization data (fields like to, href, etc.) and sent it to choosen room back. Other Chrome instance make query to all opened tabs, if query returning nothing, Chrome creating new tab, update the one otherwise.

## TODO

Plan to support full synchronization, including `document.cookie`, `window.console` and plugin should able to manipulate black list.

## License

MIT License.


