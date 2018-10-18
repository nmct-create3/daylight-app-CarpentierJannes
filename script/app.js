// _ = helper functions
let _calculateTimeDistance = (startTime, endTime) => {
	// Bereken hoeveel tijd er tussen deze twee periodes is.
	// Tip: werk met minuten.
	let startHours = parseInt(startTime.substring(0, startTime.indexOf(':')));
	let startMinutes = parseInt(startTime.substring(startTime.indexOf(':') + 1, startTime.length));
	let endHours = parseInt(endTime.substring(0, endTime.indexOf(':')));
	let endMinutes = parseInt(endTime.substring(endTime.indexOf(':') + 1, endTime.length));
	return endMinutes - startMinutes + (endHours - startHours) * 60;
}

// Deze functie kan een am/pm tijd omzetten naar een 24u tijdsnotatie, deze krijg je dus al. Alsjeblieft, veel plezier ermee.
let _convertTime = (t) => {
	/* Convert 12 ( am / pm ) naar 24HR */
	let time = new Date('0001-01-01 ' + t);
	let formatted = time.getHours() + ':' + ('0' + time.getMinutes()).slice(-2);
	return formatted;
}

// 5 TODO: maak updateSun functie
let updateSun = (totalMinutes, sunrise) => {
	let currDate = new Date();
	let currTime = currDate.getHours() + ':' + ('0' + currDate.getMinutes()).slice(-2);
	let sunUpTime = _calculateTimeDistance(sunrise, currTime);
	let sunLeftTime = totalMinutes - sunUpTime;
	if (sunLeftTime >= 0 && sunLeftTime <= totalMinutes) {
		document.querySelector("html").classList.remove("is-night");
		document.querySelector(".js-time-left").innerText = totalMinutes - sunUpTime;
		let sun = document.querySelector(".js-sun");
		sun.setAttribute("data-time", currTime);
		let percentageSunGone = sunUpTime / totalMinutes;
		sun.style.left = Math.floor(percentageSunGone * 100) + "%";
		let x = percentageSunGone * totalMinutes;
		let bottomValue = -(x - 0) * (x - totalMinutes) / 1000;
		sun.style.bottom = bottomValue + "%";
	}
	else {
		document.querySelector(".js-time-left").innerText = "0";
		document.querySelector("html").classList.add("is-night");
		document.querySelector(".js-sun").setAttribute("data-time", "");
	}
	console.log("sun updated to " + currTime);
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = ( totalMinutes, sunrise ) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.

	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	// Bepaal het aantal minuten dat de zon al op is.


	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	// Vergeet niet om het resterende aantal minuten in te vullen.
	updateSun(totalMinutes, sunrise);
	document.querySelector("body").classList.add("is-loaded");

	// Nu maken we een functie die de zon elke minuut zal updaten
	// Bekijk of de zon niet nog onder of reeds onder is
	setInterval(function() {
		updateSun(totalMinutes, sunrise);
	}, 60000);

	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
}

// 3 Met de data van de API kunnen we de app opvullen
let showResult = ( json ) => {
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	let data = {
		"city": json.query.results.channel.location.city,
		"country": json.query.results.channel.location.country,
		"sunrise": json.query.results.channel.astronomy.sunrise,
		"sunset": json.query.results.channel.astronomy.sunset
	};

	document.querySelector(".js-sunrise").innerText = data.sunrise;
	document.querySelector(".js-sunset").innerText = data.sunset;
	document.querySelector(".js-location").innerText = `${data.city}, ${data.country}`;

	// Hier gaan we een functie oproepen die de zon een bepaalde postie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
 	let timediff = _calculateTimeDistance(_convertTime(data.sunrise), _convertTime(data.sunset));
	placeSunAndStartMoving(timediff, data.sunrise);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = ( lat, lon ) => {
	// Eerst bouwen we onze url op
	// en doen we een query met de Yahoo query language
	let url =
		`https://query.yahooapis.com/v1/public/yql?q=\
		select location,astronomy from weather.forecast \
		where woeid in (SELECT woeid FROM geo.places WHERE text="(` + lat + `, ` + lon + `)")\
		&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`;

	// Met de fetch API proberen we de data op te halen.
	// Als dat gelukt is, gaan we naar onze showResult functie.
	fetch(url)
	.then(function(response){
		return response.json();
	})
	.then(function(jsonResponse){
		showResult(jsonResponse);
	})
	.catch(function(error){
		console.error(error);
	});

}

document.addEventListener( 'DOMContentLoaded', function () {
	// 1 We will query the API with longitude and latitude.
	getAPI(50.8249103, 3.2503192999999997);
});
