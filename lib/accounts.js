/*
Account Manager
*/
var twitter = require('twitter');

function addAccount(details, cb){
	var twit = new twitter({
		consumer_key: details['consumer_key'],
		consumer_secret: details['consumer_secret'],
		access_token_key: details['access_token'],
		access_token_secret: details['access_secret']
	});
	twit.get("/account/verify_credentials.json", function(data){
		if(!data.statusCode){
			// OK
			var accs = getAccounts();
			var acc = {
				"default" : details,
				"user" : data,
				"posting" : {},
				"use_posting" : false
			};
			accs.push(acc);
			setAccounts(accs);

			cb(true);
		} else{
			cb(false, data.statusCode);
		}
	});
}

function getAccounts(){
	return JSON.parse(localStorage['accounts'] || "[]");
}

function setAccounts( a ){
	localStorage['accounts'] = JSON.stringify( a );
}

window.accounts = getAccounts();
window.addEventListener("storage", function(e){
	if(e.key == "accounts"){
		window.accounts = getAccounts();
		$(window).trigger("accountsUpdated");
	}
});