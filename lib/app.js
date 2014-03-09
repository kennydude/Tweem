var twitter = require('twitter');

if(!localStorage['setup']){
	document.location.href = "lib/setup.html";
}

var accounts = getAccounts();
var twit = undefined, postTwit = undefined;

function switchAccount(acc){
	twit = new twitter({
		consumer_key: acc.default.consumer_key,
		consumer_secret: acc.default.consumer_secret,
		access_token_key: acc.default.access_token,
		access_token_secret: acc.default.access_secret
	});

	$("#meImg").attr("src", acc.user.profile_image_url);

	twit.get("/statuses/home_timeline.json", function(data){
		for(var i in data){
			var tweet = data[i];
			var el = document.createElement("tweem-tweet");
			el.tweet = tweet;
			$(el).appendTo("#pageHome");
		}
	});

	twit.get("/activity/about_me.json", function(data){
		for(var i in data){
			var interaction = data[i];
			if(interaction.action == "reply"){
				var el = document.createElement("tweem-tweet");
				el.tweet = interaction.targets[0];
				$(el).appendTo("#pageInteractions");
			}
		}
	});
}
switchAccount(accounts[0]);

var gui = require('nw.gui');

// Create an empty menu
var cogMenu = new gui.Menu();

// Add some items
cogMenu.append(new gui.MenuItem({
	label: 'Show Web Inspector',
	click : function(){
		gui.Window.get().showDevTools();
	}
}));
cogMenu.append(new gui.MenuItem({
	label: 'Refresh the page (DEBUG)',
	click : function(){
		document.location.href = "app.html";
	}
}));


$("#cog").on("click", function(){
	var l = $(this).offset();
	cogMenu.popup(l.left+$(this).width(), l.top);
});
$("#new").on("click", function(){
	window.open("lib/tweet.html", "_blank", "width=400,height=200");
});

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event){
	console.log(event);
}

function showPage(pageId){
	$(".tweets.active").css("z-index", "1").removeClass("slideInLeft animated active");
	$("#page" + pageId).css("z-index", "2").addClass("slideInLeft animated active");
	$(".toolbox .button").removeClass("active");
	$("#" + pageId).addClass("active");
}
showPage("Home");

$("#Interactions").click(function(){ showPage("Interactions"); });
$("#Home").click(function(){ showPage("Home"); });