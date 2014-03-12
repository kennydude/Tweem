var spawn = require('child_process').spawn,
	fs = require("fs");

// Find this bundle id
var plistFile = process.execPath.substr(0, process.execPath.indexOf(".app")) + ".app/Contents/Info.plist";
plistFile = fs.readFileSync(plistFile).toString();

var i = plistFile.indexOf("<key>CFBundleIdentifier</key>");
var id = plistFile.substring(
	plistFile.indexOf("<string>", i)+"<string>".length,
	plistFile.indexOf("</string>", i)
);
// done :)

module.exports = {
	notify : function(title, text, icon){
		console.log("OSX: Notification");
		spawn('terminal-notifier', [
			"-title",
			title,
			"-message",
			text,
			"-group",
			"tweem",
			"-appIcon",
			icon,
			"-sender",
			id,
			"-active",
			id
		]);
	}
}