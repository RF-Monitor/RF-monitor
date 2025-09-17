            max_shindo = "0";//最大震度
            max_shindo_local = "0";//本地模式最大震度
            max_Shindo_before = "0";//上一次最大震度
            max_shindo_local_before = "";//本地模式 上一次最大震度
            RF_stations = {}//測站列表
            RF_alert_area_flash_controller = true;//警報範圍閃爍
            RF_alert_list = [];//觸發測站列表
            RF_shindo_sokuho_list = [];//震度速報列表

            const Flasher = {
                state: false,
                interval: 500, // 閃爍頻率 (ms)

                start() {
                    this.timer = setInterval(() => {
                    this.state = !this.state;
                    }, this.interval);
                },

                stop() {
                    clearInterval(this.timer);
                    this.state = false;
                },

                isOn() {
                    return this.state;
                }
            };
            Flasher.start();

            // 用 Map 來儲存所有測站資料
            let stationMap = new Map();

            // ---------- 工具函式 ---------- //

            // 依據 PGA / 震度 / 狀態，回傳 icon URL
            function getStationIcon(pga, shindo, shakealert, isOnline, size = 10) {
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

            // 新增測站
            function addStation(stationData, shakealert) {
                const { id, name, lat, lon, pga, shindo, pga_origin, cname, isOnline } = stationData;

                let cusicon = getStationIcon(pga, shindo, shakealert, isOnline)
				let opacity = 1;
				if(!isOnline){opacity = 0.5}
				
                // 建立 marker
                let marker = L.marker([lat, lon], {
                    title: name,
                    icon: cusicon
                }).bindTooltip(
                    `<div>${name}</div>
                    <div>${cname}</div>
                    <div>PGA(原始): ${pga_origin}</div>
                    <div>PGA(濾波): ${pga}</div>
                    <div>震度: ${shindo}</div>`
                ).addTo(map).setOpacity(opacity);

                // 建立 circle
                let circle = L.circle([lat, lon], {
                    radius: 0,
                    color: shindo_color[shindo],
                    fillOpacity: 1
                }).addTo(map);

                // 存入 Map
                stationMap.set(id, { marker, circle, data: stationData });
            }

            // 更新測站
            function updateStation(stationData, shakealert) {
                const { id, name, lat, lon, pga, shindo, pga_origin, cname, isOnline  } = stationData;
                let station = stationMap.get(id);

                let cusicon = getStationIcon(pga, shindo, shakealert, isOnline)
				let opacity = 1;
				if(!isOnline){opacity = 0.5}
                if (station) {
                    // 已存在 → 更新 marker/circle
                    station.marker.setIcon(cusicon);
                    station.marker.setLatLng([lat, lon]);
                    station.marker.setTooltipContent(
                        `<div>${name}</div>
                        <div>${cname}</div>
                        <div>PGA(原始): ${pga_origin}</div>
                        <div>PGA(濾波): ${pga}</div>
                        <div>震度: ${shindo}</div>`
                    );
                    if(shakealert && shindo_15 != '0' && enable_warningArea !='false' && Flasher.isOn()){
						circleRadius = 20000;
					}else{
                        circleRadius = 0;
                    }
					station.marker.setOpacity(opacity);

                    station.circle.setLatLng([lat, lon]);
                    station.circle.setRadius(circleRadius);
                    station.circle.setStyle({ color: shindo_color[shindo] });
                    
                    // 更新儲存的資料
                    station.data = stationData;
                } else {
                    // 不存在 → 新增
                    addStation(stationData, shakealert);
                }
            }

            // 移除測站
            function removeStation(id) {
                let station = stationMap.get(id);
                if (station) {
                    map.removeLayer(station.marker);
                    map.removeLayer(station.circle);
                    stationMap.delete(id);
                }
            }

            async function pgaupdate_async_ws(data){
				if(1){
					document.querySelector('.disconnected').style.display = "none";
					if(enable_shindo != "false"){//only for app///////////////////////////////////////////

						var station_count = 0;//上線測站計數
						let stations_displayed = []//清空更新完成測站列表
						let RF_alert_list = [];//清空觸發測站列表
						let pga_list = data;//全部測站
						//console.log(pga_list)
						let shakealert = false;
						pga_list = JSON.parse(pga_list)
						/*----------警報判定----------*/
						if(pga_list["shake_alert"]){
							shakealert = true;
							replay_mode = false;//強制結束回放模式
						}
                        pga_list = pga_list.data
						/*----------警報範圍閃爍控制----------*/
						if(RF_alert_area_flash_controller){
							RF_alert_area_flash_controller = false;
						}else{
							RF_alert_area_flash_controller = true;
						}

                        let seenIds = new Set();

						/*----------檢查每個測站----------*/
                        for (let s of pga_list) {
                            let local = false;
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
                            if (Math.abs((Date.now() + ntpoffset_) - stationData.timestamp) >= 5000) {
                                stationData.pga = 0;
                                stationData.shindo = "0";
                                stationData.isOnline = false;
                            } else {
                                station_count++;
                            }

                            updateStation(stationData, shakealert);
                            seenIds.add(stationData.id);

                            // 檢查是否被選取
							if(stationData.name == selected_station){
								document.getElementById("selected_pgao").innerHTML = stationData.pga_origin;
								document.getElementById("selected_pga").innerHTML = stationData.pga;
								document.getElementById("selected_shindo").innerHTML = "<img src='shindo_icon/selected/"+stationData.shindo.toString()+".png' style='width:50px'>"
							}
                            // 檢查是否為鄰近本地測站
                            
							if(Math.sqrt(Math.pow(Math.abs(parseFloat(userlat) + (lat * -1)) * 111, 2) + Math.pow(Math.abs(parseFloat(userlon) + (lon * -1)) * 101, 2)) <= 20){
								local = true;
							}
                            // 檢查是否是最大震度
							if (shindo2float(stationData.shindo) > shindo2float(max_shindo)){
								max_shindo = stationData.shindo;
							}
							// 檢查是否是本地最大震度
							if ((shindo2float(stationData.shindo) > shindo2float(max_shindo_local)) && local){
								max_shindo_local = stationData.shindo;
							}
                            // 加入警報列表
							if(shakealert && stationData.shindo != '0' ){
								RF_alert_list.push([stationData.cname,stationData.shindo]);
							}

                            // 加入震度速報列表
							let in_sokuho_list = 0
							let sokuho_key = -1
							//尋找是否在列表內
							for(let j = 0;j < RF_shindo_sokuho_list.length ; j++){
								if(RF_shindo_sokuho_list[j]["id"] == id){
									in_sokuho_list = 1;
									sokuho_key = j
								}
							}
							//已在列表內
							if(in_sokuho_list){
								//判斷震度是否增加
								if(shindo2float(stationData.shindo) > shindo2float(RF_shindo_sokuho_list[sokuho_key]["shindo"])){
									RF_shindo_sokuho_list[sokuho_key]["shindo"] = stationData.shindo;
								}
							//不在列表內
							}else{
								if(shakealert && stationData.shindo != '0' ){
									RF_shindo_sokuho_list.push({"id":stationData.id,"name":stationData.name,"cname":stationData.cname,"shindo":stationData.shindo});
								}
							}
                        }

                        //----------移除未出現在本次資料的測站----------//
                        for (let id of stationMap.keys()) {
                            if (!seenIds.has(id)) {
                                removeStation(id);
                            }
                        }
						
							//----------顯示最大震度----------//
							if(local_only != "false"){//本地模式
								document.getElementById("max_shindo_img").innerHTML = "<img src='shindo_icon/selected/"+max_shindo_local+".png' style='width: 90px;height: 90px;'>"	
							}else{//全域模式
								document.getElementById("max_shindo_img").innerHTML = "<img src='shindo_icon/selected/"+max_shindo+".png' style='width: 90px;height: 90px;'>"	
							}
							//----------顯示區域警報----------//
							//RF_alert_list = [["1","5+"],["2","5-"],["3","7"],["4","6+"],["5","4"],["6","1"],["7","2"]]
							if(shakealert){
								//篩選6個最大震度
								let RF_alert_list_display = [];
								let RF_alert_list_length = RF_alert_list.length;
								for(let j = 0;j < RF_alert_list_length;j++){
									let max_i = 0;//最大值索引值
									let max_v = 0;//最大值
									for(let k = 0;k < RF_alert_list.length;k++){
										if(shindo2float(RF_alert_list[k][1]) > max_v){
											max_i = k;
											max_v = shindo2float(RF_alert_list[k][1]);
										}
									}
									RF_alert_list_display.push(RF_alert_list[max_i])
									RF_alert_list.splice(max_i,1);
									if(j == 5){
										break;
									}
								}
								console.log(RF_alert_list_display);
								console.log("RF警報");
								//變更顏色
								if(shindo2float(max_shindo) >= 4){
									document.querySelector(".RF_list").style.backgroundColor = "red";
								}else{
									document.querySelector(".RF_list").style.backgroundColor = "#E96D07";
								}
								//變更狀態
								document.getElementById("RF_status").innerHTML = "搖晃檢知";
								//變更padding
								document.querySelector(".RF_list").style.paddingBottom = "5px";
								document.querySelector(".RF_lists").style.padding = "5px";
								for(let j = 0;j < RF_alert_list_display.length;j++){
									document.getElementById("RF_item_" + (j+1).toString()).innerHTML = "<img src='shindo_icon/selected/"+RF_alert_list_display[j][1]+".png' height='30px'><h5 style='color: white;'>"+RF_alert_list_display[j][0]+"</h5>"
									if(j == 5){
										break;
									}
								}
							}else{
								document.querySelector(".RF_list").style.backgroundColor = "#3c3c3c";
								document.getElementById("RF_status").innerHTML = "目前沒有地震速報";
								document.querySelector(".RF_list").style.paddingBottom = "0px";
								document.querySelector(".RF_lists").style.padding = "0px";
								for(let j = 0;j < 6;j++){
									document.getElementById("RF_item_" + (j+1).toString()).innerHTML = "";
								}
							}			
							//----------音效----------//
							if(local_only != "false"){//本地模式
								if((shindo2float(max_shindo_local) > shindo2float(max_shindo_local_before)) && shakealert){
									
									if(max_shindo_local == "1" && enable_shindo_sounds_1 != "false"){//only for app/////////////////////////////////////////////////
										aud1.play();
									}else if(max_shindo_local == "2" && enable_shindo_sounds_2 != "false"){//only for app/////////////////////////////////////////////////
										aud2.play();
									}else if(max_shindo_local == "3" && enable_shindo_sounds_3 != "false"){//only for app/////////////////////////////////////////////////
										aud3.play();
									}else if(max_shindo_local == "4" && enable_shindo_sounds_4 != "false"){//only for app/////////////////////////////////////////////////
										aud4.play();
									}else if(max_shindo_local == "5-" && enable_shindo_sounds_5j != "false"){//only for app/////////////////////////////////////////////////
										aud5j.play();
									}else if(max_shindo_local == "5+" && enable_shindo_sounds_5k != "false"){//only for app/////////////////////////////////////////////////
										aud5k.play();
									}else if(max_shindo_local == "6-" && enable_shindo_sounds_6j != "false"){//only for app/////////////////////////////////////////////////
										aud6j.play();
									}else if(max_shindo_local == "6+" && enable_shindo_sounds_6k != "false"){//only for app/////////////////////////////////////////////////
										aud6k.play();
									}else if(max_shindo_local == "7" && enable_shindo_sounds_7 != "false"){//only for app/////////////////////////////////////////////////
										aud7.play();
									}
									max_shindo_local_before = max_shindo_local;
								}
							}else{//全域模式
								if((shindo2float(max_shindo) > shindo2float(max_Shindo_before)) && shakealert){
									
									if(max_shindo == "1" && enable_shindo_sounds_1 != "false"){//only for app/////////////////////////////////////////////////
										aud1.play();
									}else if(max_shindo == "2" && enable_shindo_sounds_2 != "false"){//only for app/////////////////////////////////////////////////
										aud2.play();
									}else if(max_shindo == "3" && enable_shindo_sounds_3 != "false"){//only for app/////////////////////////////////////////////////
										aud3.play();
									}else if(max_shindo == "4" && enable_shindo_sounds_4 != "false"){//only for app/////////////////////////////////////////////////
										aud4.play();
									}else if(max_shindo == "5-" && enable_shindo_sounds_5j != "false"){//only for app/////////////////////////////////////////////////
										aud5j.play();
									}else if(max_shindo == "5+" && enable_shindo_sounds_5k != "false"){//only for app/////////////////////////////////////////////////
										aud5k.play();
									}else if(max_shindo == "6-" && enable_shindo_sounds_6j != "false"){//only for app/////////////////////////////////////////////////
										aud6j.play();
									}else if(max_shindo == "6+" && enable_shindo_sounds_6k != "false"){//only for app/////////////////////////////////////////////////
										aud6k.play();
									}else if(max_shindo == "7" && enable_shindo_sounds_7 != "false"){//only for app/////////////////////////////////////////////////
										aud7.play();
									}
									max_Shindo_before = max_shindo;
								}
							}
							//----------震度速報----------//
							/*RF_shindo_sokuho_list = [
								{"cname":"宜蘭縣 蘇澳鎮","shindo":"2"},
								{"cname":"宜蘭縣 蘇澳鎮", "shindo":"2"},
								{"cname":"宜蘭縣 蘇澳鎮", "shindo":"1"},
								{"cname":"宜蘭縣 蘇澳鎮", "shindo":"1"},
								{"cname":"宜蘭縣 宜蘭市", "shindo":"1"},
								{"cname":"基隆市 七堵區", "shindo":"1"},
								{"cname":"臺北市 內湖區", "shindo":"1"}
							]*/
							if(!shakealert && RF_shindo_sokuho_list.length != 0){
								//統整震度速報
								let A7 = [];
								let A6K = [];
								let A6J = [];
								let A5K = [];
								let A5J = [];
								let A4 = [];
								let A3 = [];
								let A2 = [];
								let A1 = [];

								for(let j = 0; j<RF_shindo_sokuho_list.length ;j++){
									if(RF_shindo_sokuho_list[j]["shindo"] == "7"){A7.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "6+"){A6K.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "6-"){A6J.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "5+"){A5K.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "5-"){A5J.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "4"){A4.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "3"){A3.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "2"){A2.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "1"){A1.push(RF_shindo_sokuho_list[j]["cname"])}
								}
								//構建震度速報訊息文字
								let text = ">>> # " + webhook_header_shindo_sokuho + "\n";
								if(A7.length){text = text + "**7級**\n"; for(let j = 0; j<A7.length; j++){text = text + A7[j] + "\n"}}
								if(A6K.length){text = text + "**6強**\n"; for(let j = 0; j<A6K.length; j++){text = text + A6K[j] + "\n"}}
								if(A6J.length){text = text + "**6弱**\n"; for(let j = 0; j<A6J.length; j++){text = text + A6J[j] + "\n"}}
								if(A5K.length){text = text + "**5強**\n"; for(let j = 0; j<A5K.length; j++){text = text + A5K[j] + "\n"}}
								if(A5J.length){text = text + "**5弱**\n"; for(let j = 0; j<A5J.length; j++){text = text + A5J[j] + "\n"}}
								if(A4.length){text = text + "**4級**\n"; for(let j = 0; j<A4.length; j++){text = text + A4[j] + "\n"}}
								if(A3.length){text = text + "**3級**\n"; for(let j = 0; j<A3.length; j++){text = text + A3[j] + "\n"}}
								if(A2.length){text = text + "**2級**\n"; for(let j = 0; j<A2.length; j++){text = text + A2[j] + "\n"}}
								if(A1.length){text = text + "**1級**\n"; for(let j = 0; j<A1.length; j++){text = text + A1[j] + "\n"}}
								/*
								for(j = 0;j<RF_shindo_sokuho_list.length;j++){
									text = text + RF_shindo_sokuho_list[j]["cname"] + " " + RF_shindo_sokuho_list[j]["shindo"] + "\n"
								}
								*/ 
								//發布震度速報
								send_webhook(webhook_url_shindo_sokuho,text);
								RF_shindo_sokuho_list = []
							}

							if(max_shindo == "0"){
								max_Shindo_before = "0";
							}
							if(max_shindo_local == "0"){
								max_Shindo_local_before = "0";
							}
							max_shindo = "0";
							max_shindo_local = "0";

							if(max_Shindo_before != "0"){
								console.log("max_shindo:"+max_Shindo_before);
							}
						}

						/*----------顯示目前測站數----------*/
						if(typeof(station_count) != "undefined"){
							//let htmlText = "<p style='color:white'>目前共有" + station_count + "個測站上線</p>";
							//document.getElementById('stations_count').innerHTML = htmlText.toString();
							document.getElementById('stations_count_online').innerHTML = station_count.toString();
						}

						let delaytime = 500 - (Date.now() - timer);//計算經過時間
						if (delaytime < 0){//delaytime不可小於0
							delaytime = 0;
						}
					}else{
						let htmlText = "<p style='color:white'>即時測站停用中</p>";
						document.getElementById('stations_count').innerHTML = htmlText;
					}
				
		        }