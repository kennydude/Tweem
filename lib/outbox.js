var async = require("async");

function sendOutbox(){
	var outbox = JSON.parse(localStorage['outbox']);
	var l = outbox.length;

	var twitter = require('twitter');
	async.filterSeries(outbox, function(tweet, next){
		$("#outbox").html(outbox.length);
		console.log(tweet);

		var twit = new twitter({
			consumer_key: tweet.account.consumer_key,
			consumer_secret: tweet.account.consumer_secret,
			access_token_key: tweet.account.access_token,
			access_token_secret: tweet.account.access_secret
		});

		twit.post("/statuses/update.json", {
			"status" : tweet.text,
			"in_reply_to_status_id" : tweet['in_reply_to_status_id']
		}, function(r){
			if(r instanceof Error || r['statusCode']){
				console.log("ERROR");
				return next(true); // Seems crazy but this is what we want
			}
			next(false);
		});
	}, function(remaining_tasks){
		$("#outbox").html(remaining_tasks.length);
		console.log(remaining_tasks.length + " messages failed to send :(");
		outboxIgnoreLS = true; // Ignore update
		localStorage['outbox'] = JSON.stringify(remaining_tasks);
	});
}
sendOutbox();

/* outbox updates */
var outboxIgnoreLS = false; // For internal updates
window.addEventListener("storage", function(e){
	if(outboxIgnoreLS){
		outboxIgnoreLS = false;
		return;
	}
	if(event.key == "outbox"){
		// Update outbox :)
		sendOutbox();
	}
});
