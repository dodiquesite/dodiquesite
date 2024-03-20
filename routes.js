/**
 * @typedef { {name: string} } CityData
 */

/** @type { Map<string, { name: string }> } */
var cities = new Map ();
cities.set('petropavl', { name: "Петропавловска" });
cities.set('outskirts', { name: "Пригорода" });
cities.set('omsk', { name: "Омска" });


/** @type {CityData} */
var city;
var queryParams = new URLSearchParams(window.location.search);
var cityParam = queryParams.get('city') ?? '';

city = cities.get(cityParam);
if (!city)
    city = cities.values().next().value;

var routesHeader = document.querySelector('.side-panel h1');
routesHeader.innerText = routesHeader.innerText.replace('$cityname', city.name);