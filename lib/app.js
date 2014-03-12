var twitter = require('twitter');

if(!localStorage['setup']){
	document.location.href = "lib/setup.html";
}

// Native
var os = require("os");
if(os.platform() == "darwin"){
	var native = require("./lib/native/osx.js");
} else{
	var native = require("./native/stub");
}

var util = require("util");
var accounts = getAccounts();
var twit = undefined, postTwit = undefined, me = undefined;

function openUser(id){
	showPage("User");
	twit.get("/statuses/user_timeline.json", {"user_id" : id}, function(data){
		var uh = document.getElementById("userHeader");
		uh.user = data[0].user;
		uh.tweets = data;
	});
}

$("#meImg").click(function(){
	openUser( me.id_str );
});

function doTweet(el){
	el.addEventListener("openUser", function(e){
		e.preventDefault();
		openUser(e.detail);
	});
}

var pageInteractions = document.getElementById("pageInteractions");

function switchAccount(acc){
	twit = new twitter({
		consumer_key: acc.default.consumer_key,
		consumer_secret: acc.default.consumer_secret,
		access_token_key: acc.default.access_token,
		access_token_secret: acc.default.access_secret
	});

	$("#meImg").attr("src", acc.user.profile_image_url);
	me = acc.user.id_str;

	twit.get("/statuses/home_timeline.json", function(data){
		for(var i in data){
			var tweet = data[i];
			var el = document.createElement("tweem-tweet");
			el.tweet = tweet;
			doTweet(el);
			$(el).appendTo("#pageHome");
		}
	});

	twit.get("/activity/about_me.json", function(data){
		for(var i in data){
			var interaction = data[i];
			if(interaction.action == "reply"){
				var el = document.createElement("tweem-tweet");
				el.tweet = interaction.targets[0];
				doTweet(el);
				pageInteractions.appendChild(el);
			} else if(interaction.action == "mention"){
				var el = document.createElement("tweem-tweet");
				el.tweet = interaction.target_objects[0];
				doTweet(el);
				pageInteractions.appendChild(el);
			} else{
				console.log("unsupported interaction", interaction);
			}
		}
	});

	twit.stream('user', {}, function(stream) {
		stream.on('data', function(data) {
			if( data['text'] == undefined ){
				// TODO
				console.log("unknown stream element", data);
			} else{
				var el = document.createElement("tweem-tweet");
				el.tweet = data;
				doTweet(el);
				$(el).prependTo("#pageHome");

				// Now let's check for @me
				for(var i in data.entities.user_mentions ){
					var link = data.entities.user_mentions [i];
					if(link.id_str == me){
						$(el).prependTo("#pageInteractions");
						native.notify(
							"Mention by @" + data.user.screen_name,
							data.text,
							data.user.profile_image_url
						);
					}
				}
			}
		});
		stream.on('error', function(err){
			console.log(util.inspect(err));
		});
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
cogMenu.append(new gui.MenuItem({
	label: 'Preferences',
	click : function(){
		alert('todo');
	}
}));


$("#cog").on("click", function(){
	var l = $(this).offset();
	cogMenu.popup(l.left+$(this).width(), l.top);
});
$("#new").on("click", function(){
	window.open("lib/tweet.html", "_blank", "width=400,height=200").focus();
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