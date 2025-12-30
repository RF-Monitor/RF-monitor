export class pgaManager{
    constructor(map, leaflet){
        this.map = map;
        this.L = leaflet;
        //this.mapRenderer = new pgaMapRenderer(this.map, this.L);
        this.ui = new pgaUI();
        this.stationList = new Map();
        this.shake_alert = false;
    }

    handle(pga, now){
        let station_count = 0;
        let seenIds = new Set();
        if(pga["shake_alert"]){
		    this.shakealert = true;
        }else{
            this.shakealert = false;
        }			

        for (let s of pga.data) {
            let stationData = {
                id: s["id"],
                name: s["name"],
                cname: s["cname"],
                lat: parseFloat(s["lat"]),
                lon: parseFloat(s["lon"]),
                pga: parseFloat(s["pga"]),
                shindo: s["shindo_15"],
                pga_origin: parseFloat(s["pga_origin"]),
                timestamp: s["timestamp"],
                isOnline: true
            };
            // 判斷是否離線
            if (Math.abs(now - stationData.timestamp) >= 5000) {
                stationData.pga = 0;
                stationData.shindo = "0";
                stationData.isOnline = false;
            } else {
                station_count++;
            }

            seenIds.add(stationData.id);

            // 判斷是否是新測站
            if (!this.stationList.get(stationData.id)) {
                this.stationList.set(
                    stationData.id,
                    {
                        id: stationData.id,
                        station: new Station(
                            this.map,
                            this.L,
                            stationData,
                            this.shakealert
                        )
                    }
                );
            }

            const station = this.stationList.get(stationData.id);
            station.station.update(stationData, this.shakealert);
        }

        //----------移除未出現在本次資料的測站----------//
        for (let id of this.stationList.keys()) {
            if (!seenIds.has(id)) {
                const station = this.stationList.get(id);
                station.remove();
                stationList.delete(id);
            }
        }

        this.ui.update(pga, "", now)
    }
}

class Station{
    constructor(map, L, stationData, shakealert){
        this.stationData = stationData;
        this.mapRenderer = new pgaMapRenderer(map,L);
        this.mapRenderer.create(stationData, shakealert);
    }
    
    update(stationData, shakealert){
        this.stationData = stationData;
        this.mapRenderer.update(stationData, shakealert);
    }

    remove(){
        this.mapRenderer.remove();
        this.mapRenderer = null;
    }
}
class pgaMapRenderer{
    constructor(map, leaflet){
        this.map = map;
        this.L = leaflet;
        this.marker = null;
        this.circle = null;
        this.shindo_color = {
            "0":"white",
            "1":"white",
            "2":"#0066CC",
            "3":"green",
            "4":"#BAC000",
            "5-":"#FF7F27",
            "5+":"#ED1C24",
            "6-":"red",
            "6+":"#A50021",
            "7":"purple"
        };
    }
    create(stationData, shakealert){
        const { id, name, lat, lon, pga, shindo, pga_origin, cname, isOnline } = stationData;
        let cusicon = this.getStationIcon(pga, shindo, shakealert, isOnline)
        let opacity = 1;
		let toolTip = `<div>${name}</div>
                    <div>${cname}</div>
                    <div>PGA(原始): ${pga_origin}</div>
                    <div>PGA(濾波): ${pga}</div>
                    <div>震度: ${shindo}</div>`
        // 建立 circle
        this.circle = L.circle([lat, lon], {
                    radius: 0,
                    color: this.shindo_color[shindo],
                    fillOpacity: opacity,
					opacity: opacity
        }).addTo(this.map);

		if(!isOnline){
			opacity = 0.3;
			toolTip = `<div>${name}</div>
            <div>${cname}</div>
            <div>已斷線</div>`
		}

        // 建立 marker
        this.marker = this.L.marker([lat, lon], {
            title: name,
            icon: cusicon
        }).bindTooltip(toolTip).addTo(this.map).setOpacity(opacity);
    }
    update(stationData, shakealert){
        const { id, name, lat, lon, pga, shindo, pga_origin, cname, isOnline } = stationData;
        let cusicon = this.getStationIcon(pga, shindo, shakealert, isOnline)
        let opacity = 1;
		let toolTip = `<div>${name}</div>
                    <div>${cname}</div>
                    <div>PGA(原始): ${pga_origin}</div>
                    <div>PGA(濾波): ${pga}</div>
                    <div>震度: ${shindo}</div>`
        

		if(!isOnline){
			opacity = 0.3;
			toolTip = `<div>${name}</div>
            <div>${cname}</div>
            <div>已斷線</div>`
		}

        this.marker.setIcon(cusicon);
        this.marker.setLatLng([lat, lon]);
        this.marker.setTooltipContent(toolTip);
        this.marker.setOpacity(opacity);

        let circleRadius = 0;
        this.circle.setLatLng([lat, lon]);
        this.circle.setRadius(circleRadius);
        this.circle.setStyle({ color: this.shindo_color[shindo] });
        this.circle.setStyle({opacity: opacity, fillOpacity: opacity});
    }

    remove(){
        map.removeLayer(this.marker);
        map.removeLayer(this.circle);
    }

    getStationIcon(pga, shindo, shakealert, isOnline, size = 10) {
        let iconUrl;

        if(!isOnline){
            iconUrl = 'shindo_icon/disconnected.png';
            size = 7;
        }else{
            if (shindo == '0' || !shakealert) {
                if (pga <= 1) iconUrl = 'shindo_icon/pga0.png';
                else if (pga <= 1.3) iconUrl = 'shindo_icon/pga1.png';
                else if (pga <= 1.4) iconUrl = 'shindo_icon/pga2.png';
                else iconUrl = 'shindo_icon/pga3.png';
            } else {
                iconUrl = 'shindo_icon/' + shindo + '.png';
                size = 20; // 震度 icon 比較大
            }
        }

        return L.icon({
            iconUrl,
            iconSize: [size, size]
        });
    }
}
class pgaUI{
    constructor(){
        this.selected = null;
        this.maxShindo = "0";
    }

    update(pga, selected, now){
        // 找最大震度
        let maxShindo = "0";
        let station_count = 0;
        for (let s of pga.data) {
            let stationData = {
                id: s["id"],
                name: s["name"],
                cname: s["cname"],
                lat: parseFloat(s["lat"]),
                lon: parseFloat(s["lon"]),
                pga: parseFloat(s["pga"]),
                shindo: s["shindo_15"],
                pga_origin: parseFloat(s["pga_origin"]),
                timestamp: s["timestamp"],
                isOnline: true
            };
            if (Math.abs(now - stationData.timestamp) >= 5000) {
                stationData.pga = 0;
                stationData.shindo = "0";
                stationData.isOnline = false;
            } else {
                station_count++;
            }

            // 本站震度大於當前最大震度
            if(this.shindo2float(maxShindo) < this.shindo2float(stationData.shindo)){
                maxShindo = stationData.shindo;
            }

        }

        // 顯示最大震度
        document.getElementById("max_shindo_img").innerHTML = `
        <img src='shindo_icon/selected/${maxShindo}.png' style='width: 90px;height: 90px;'>
        `
        // 顯示測站數
        document.getElementById('stations_count_online').innerHTML = station_count.toString();
        
    }

    shindo2float(shindo){
        if(shindo == "5-"){
            shindo = "5"
        }
        if(shindo == "5+"){
            shindo = "5.5"
        }
        if(shindo == "6-"){
            shindo = "6"
        }
        if(shindo == "6+"){
            shindo = "6.5"
        }
        return parseFloat(shindo);
    }
}