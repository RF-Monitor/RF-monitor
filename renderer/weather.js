export class WeatherManager{
    constructor(geojson_list, locations, map, L){
        this.geojson_list = geojson_list;
        this.locations = locations;
        this.map = map;
        this.L = L;
        this.mapRenderer = new WeatherMapRenderer(this.geojson_list, this.locations, this.map, this.L)
    }
    updateWeather(data){
        this.mapRenderer.updateWeather(data)
    }
    updateTyphoon(data){

    }
}

class WeatherMapRenderer{
    constructor(geojson_list, locations, map, L){
        this.geojson_list = geojson_list;
        this.locations = locations;
        this.map = map;
        this.L = L;
        this.layer = this.L.layerGroup().addTo(map);
    }
    updateWeather(data){
        this.layer.clearLayers();
		let warnings = data
		for(let i = 0;i < warnings.length;i++){
			let name = warnings[i]["name"];
			let lat = this.locations["country"][name]["lat"];
			let lon = this.locations["country"][name]["lon"];
			let rain = warnings[i]["rain"];
			let heavy_rain = warnings[i]["heavy_rain"];
			let super_heavy_rain = warnings[i]["super_heavy_rain"];
			let extreme_heavy_rain = warnings[i]["extreme_heavy_rain"];
			let foggy = warnings[i]["foggy"];
			let wind = warnings[i]["wind"];
			if(!(rain == 0 && heavy_rain == 0 && super_heavy_rain == 0 && extreme_heavy_rain == 0 && foggy == 0 && wind == 0)){
				let popupContent = "<p>"+name + "</p>";
				if(rain != 0){
					popupContent = popupContent + "<p>大雨特報</p>";
				}
				if(heavy_rain != 0){
					popupContent = popupContent + "<p>豪雨特報</p>";
				}
				if(super_heavy_rain != 0){
					popupContent = popupContent + "<p>大豪雨特報</p>";
				}
				if(extreme_heavy_rain != 0){
					popupContent = popupContent + "<p>超大豪雨特報</p>";
				}
				if(foggy != 0){
					popupContent = popupContent + "<p>濃霧特報</p>";
				}
				if(wind != 0){
					popupContent = popupContent + "<p>陸上強風特報</p>";
				}								
  				this.layer.addLayer(this.L.geoJSON(this.geojson_list[name], { color: "yellow",width:2,fillOpacity: 0.5 ,pane:"weather_warning_layers"}).bindPopup(popupContent));
			}
		}
    }
    updateTyphoon(){

    }
}