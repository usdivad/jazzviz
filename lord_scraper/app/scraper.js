//Tom Lord scraper by session date
function scrape() {
console.log("LORDE");

//Sample: http://www.lordisco.com.ezproxy.cul.columbia.edu/tjd/DateDetail?search=date&year=1961&month=1&day=11

//Make sure we're in the right place
/*if (window.location.href.match("hotels") == null) {
	getCity(sleepMs);
}*/
//

var frame = getEl(document.getElementsByTagName("frame"), 1);
var innerDoc = frame.contentDocument;
var body = getFirstEl(innerDoc.getElementsByTagName("body"));
//try to print as string
/*var tmp = document.createElement("div");
tmp.appendChild(body);
console.log(tmp.innerHTML);*/

var sessions = body.getElementsByClassName("session");
var today = getPageDate();
var dateObj = {"date": today, "sessions": []};
for (var i=0; i<sessions.length; i++) {
	var sessionObj = {};
	var session = sessions[i];
	
	//Session ID and leader
	sessionObj["id"] = getFirstEl(session.getElementsByClassName("sessionnum")).textContent;
	sessionObj["leader"] = getFirstEl(session.getElementsByClassName("leadername")).textContent;
	
	//Release title
	var title = getFirstEl(session.getElementsByClassName("title"));
	if (typeof title != "undefined") {
		sessionObj["title"] = title.textContent;
	}
	
	//Group name
	var grp = getFirstEl(session.getElementsByClassName("group"));
	if (typeof grp != "undefined") {
		sessionObj["group"] = grp.textContent;
	}
	
	//Personnel
	var musicians = getFirstEl(session.getElementsByClassName("musicians"));
	var musiciansArr = [];
	if (typeof musicians != "undefined") {
		musicians = musicians.getElementsByTagName("a");
		for (var m=0; m<musicians.length; m++) {
			//muso.match(/(\w+\s*\w*)*/)
			var muso = musicians[m].textContent;
			if (typeof muso != "undefined") {
				var musoName = getFirstEl(muso.match(/.*(?= \()/));
				var musoInstruments = getFirstEl(muso.match(/\(.*\)/));
				if (typeof musoInstruments != "undefined" && musoInstruments != null) {
					musoInstruments = musoInstruments.replace("(", "").replace(")", "")
										  			 .split(","); //typin
				}
										  
				musiciansArr.push({"name": musoName, "instruments": musoInstruments});
			}
		}
		sessionObj["musicians"] = musiciansArr;
	}
	
	//Location string (includes date too; not clean)
	var location = getFirstEl(session.getElementsByClassName("location"));
	if (typeof location != "undefined") {
		sessionObj["location_str"] = location.textContent;
	}
	
	//Tunes played
	var tunes = session.getElementsByClassName("tune outdent");
	var tunesArr = [];
	if (typeof tunes != "undefined") {
		for (var t=0; t<tunes.length; t++) {
			var tune = tunes[t];
			if (typeof tune != "undefined") {
				tunesArr.push(tune.textContent.replace("\n", ""));
			}
		}
		sessionObj["tunes"] = tunesArr;
	}
	
	//Releases from the session
	var releases = session.getElementsByClassName("release");
	var releasesArr = [];
	if (typeof releases != "undefined") {
		for (var r=0; r<releases.length; r++) {
			var release = releases[r];
			if (typeof release != "undefined" && releasesArr.indexOf(release) >= 0) {
				releasesArr.push(release.textContent);
			}
		}
		sessionObj["releases"] = releasesArr;
	}

	dateObj["sessions"].push(sessionObj);
}

//Final step
//console.log(dateObj);
//return dateObj;
var sendUrl = "http://usdivad.com/lord_scraper/collect.php";
var failUrl = "http://usdivad.com/lord_scraper/fail.php";
$.post(sendUrl, {"data": JSON.stringify(dateObj), "date_str": today}, function(resp) {
	//alert(resp);
	console.log(resp);
	var newUrl = getNextUrl(today);
	window.location.href = newUrl;
})
.fail(function() {
	console.log("FAIL");
	$.get(failUrl, function() {
		console.log("ok fail sent");
	})
	.fail(function() {console.log("... never mind. it's turtles");});
	var newUrl = getNextUrl(today);
	window.location.href = newUrl;
});

//Helpers
function getFirstEl(elArr) {
	if (typeof elArr != "undefined" && elArr != null) {
		return elArr[0];
	}
}

function getEl(elArr, n) {
	if (typeof elArr != "undefined" && elArr != null) {
		return elArr[n];
	}
}

function getPageDate() {
	var url = window.location.href;
	var year = getFirstEl(url.match(/year=\d+/));
	year = year.replace("year=", "");
	var month = getFirstEl(url.match(/month=\d+/));
	month = month.replace("month=", "");
	if (month.length < 2) {
		month = "0" + month;
	}
	var day = getFirstEl(url.match(/day=\d+/));
	day = day.replace("day=", "");
	if (day.length < 2) {
		day = "0" + day;
	}
	return year + "-" + month + "-" + day;
}

} //end scrape()




/*Global functions (see poops comment for just)*/
function sayHi(){
	console.log("hello");
}

//Calculate next date
function getNextUrl(dateStr) {
	var nextUrl = "http://usdivad.com/lord_scraper";
	var sessionDate = new Date(dateStr);
	//console.log(sessionDate);
	var currentDate = new Date();
	var nextSessionDate = new Date();
	//nextSessionDate.setDate(sessionDate.getDate() + 1);
	nextSessionDate.setTime(sessionDate.getTime() + 86400000 + 86400000); //added another day for time diff
	if (nextSessionDate <= currentDate) {
		nextUrl = toUrl(nextSessionDate);
	}

	return nextUrl;
}

function toUrl(date) {
	var urlBase = "http://www.lordisco.com.ezproxy.cul.columbia.edu/tjd/DateDetail?search=date";
	var url = urlBase
			+ "&year=" + date.getFullYear()
			+ "&month=" + (date.getMonth()+1)
			+ "&day=" + date.getDate();
	return url;
}

/*function clearReloader() {
	window.clearTimeout(reloader);
	console.log("Killed reloader");
}

//Get sleep from sleep_times.txt file
function getSleep() {
	var http = new XMLHttpRequest();
	var url = phpBase + "get_sleep.php";
	http.open("GET", url, true);
	http.onreadystatechange = function() {
		if (http.readyState == 4 && http.status == 200) {
			//console.log(http.responseText);
			var sleepTime = http.responseText;
			if (sleepTime != null) {
				if (!isNaN(parseInt(sleepTime))) {
					sleepMs = parseInt(sleepTime) + Math.random()*2000;
					console.log("reset sleep time from get_sleep");
					clearReloader();
					reloader = window.setTimeout(function() { //window.location.reload() triggers security!
						getCity(1000);
					}, sleepMs);
					console.log("From reloader: Now I sleep for " + sleepMs/1000 + " seconds cos I'm not a bot");
				}
				else {console.log("NaN error; keep the old time");}
			}

		}
	}
	http.send(null);
}

function sendSecurityAlert() {
	var now = new Date().toString();
	var http = new XMLHttpRequest();
	var url = phpBase + "security.php";
	var params = "data=" + "SECURITY CHECK encountered at " + encodeURIComponent(now);
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() {
	    if(http.readyState == 4 && http.status == 200) {
	        console.log("security check at " + now);
	    }
	}
	http.send(params);
}
*/

/*
 * GLOBAL POOPS
 * needed to plant execution in case window.onload fails
 * but this is all w/in the extension load anyways; not accessible by user
 */ 
/*var phpBase = "http://usdivad.com/geojazz/";
console.log("BEEF");

//w.r.t. sleepMs, if it's too low you'll end up making too many unsuccessful requests
var sleepMs = (5+(Math.random()*8))*1000; //backup method



var reloader = window.setTimeout(function() { //window.location.reload() triggers security!
	scrape(); //for google, as onload seems to give problems
	//getCity(1000);
}, sleepMs);
console.log("From reloader: Now I sleep for " + sleepMs/1000 + " seconds cos I'm not a bot");


//Security check
if (window.location.href.match("security") != null) {
	console.log("I died");
	alert("Scraper pause! (security check)");
	clearReloader();
	sendSecurityAlert();
}*/

//Global reload
window.setTimeout(function() {
	window.location.reload();
}, 3000 + Math.random()*2000);

window.onload = function() { //has to be thru extension
	sayHi();
	window.setTimeout(function() {
		scrape();
		console.log("scrape");
	}, 500 + Math.random()*1500);

}