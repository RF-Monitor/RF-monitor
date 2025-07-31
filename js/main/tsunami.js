        let tsunami_timer = null

        function tsunami(data){
            if(enable_tsunami != "false"){
                const tsunami_coastline = {
                    "北部沿海地區":"tsunami_N",
                    "東北沿海地區":"tsunami_EN",
                    "海峽沿海地區":"tsunami_W",
                    "東部沿海地區":"tsunami_E",
                    "東南沿海地區":"tsunami_ES",
                    "西南沿海地區":"tsunami_WS"
                }
                const tsunami_color = {
                    "綠色":"yellowgreen",
                    "黃色":"yellow",
                    "橙色":"orange",
                    "紅色":"red"
                }
                let created_at = new Date(data["created_at"]).getTime();
                // 警報有效期:一天
                if(timestampNow() - created_at < 86400000){
                    // 顯示
                    document.getElementById("tsunami").style.display = "block";
                    document.getElementById("tsunami_forecast").style.display = "block";

                    //海嘯基本資料
                    document.getElementById("tsunami_reportNum").innerHTML = data["report_no"];
                    document.getElementById("tsunami_epicenter").innerHTML = data["epicenter_location"].replace("　","<br>");
                    document.getElementById("tsunami_magnitude").innerHTML = data["magnitude"];

                    // 警報顏色
                    const tsunami_color_c = data["report_color"];
                    const tsunami_color_E = tsunami_color[tsunami_color_c];
                    document.getElementById("tsunami_color").style.backgroundColor = tsunami_color_E;

                    //字體顏色
                    if(tsunami_color_E == "yellow"){
                        document.getElementById("tsunami_type_color").style.color = "black";
                    }else{
                        document.getElementById("tsunami_type_color").style.color = "white";
                    }
                        
                    //海嘯警報/警訊/消息/解除
                    document.getElementById("tsunami_type").innerHTML = data["report_type"];

                    // 警報類型
                    if(data["report_type"] == "海嘯警報"){
                        // 預測波高
                        for(let i = 0 ;i < data["forecast"].length ;i++){
                            let area_c = data["forecast"][i]["area_name"]
                            let area = tsunami_coastline[area_c];
                            document.getElementById(area).innerHTML = data["forecast"][i]["wave_height"];

                            let color_c = data["forecast"][i]["area_color"];
                            let color = tsunami_color[color_c];
                            document.getElementById(area+"_color").style.borderColor = color;
                        }
                        if(data["forecast"].length == 0){
                            document.getElementById("tsunami_forecast").style.display = "none";
                        }
                        playAudio_eew(['./audio/tw/tsunami/tsunami_warning.mp3','./audio/tw/tsunami/tsunami_warning_released.mp3']);
                    }else if(data["report_type"] == "海嘯警訊"){
                        // 預測波高
                        for(let i = 0 ;i < data["forecast"].length ;i++){
                            
                            let area_c = data["forecast"][i]["area_name"]
                            let area = tsunami_coastline[area_c];
                            document.getElementById(area).innerHTML = data["forecast"][i]["wave_height"];

                            let color_c = data["forecast"][i]["area_color"];
                            let color = tsunami_color[color_c];
                            document.getElementById(area+"_color").style.borderColor = color;
                        }
                        if(data["forecast"].length == 0){
                            document.getElementById("tsunami_forecast").style.display = "none";
                        }
                        if(data["forecast"].length == 0){
                            document.getElementById("tsunami_forecast").style.display = "none";
                        }
                        playAudio_eew(['./audio/tw/tsunami/tsunami_warning.mp3','./audio/tw/tsunami/tsunami_released.mp3']);
                    }else if(data["report_type"] == "海嘯消息"){
                        // 預測波高
                        for(let i = 0 ;i < data["forecast"].length ;i++){
                            let area_c = data["forecast"][i]["area_name"]
                            let area = tsunami_coastline[area_c];
                            document.getElementById(area).innerHTML = data["forecast"][i]["wave_height"];

                            let color_c = data["forecast"][i]["area_color"];
                            let color = tsunami_color[color_c];
                            document.getElementById(area+"_color").style.borderColor = color;
                        }
                        if(data["forecast"].length == 0){
                            document.getElementById("tsunami_forecast").style.display = "none";
                        }
                        if(data["forecast"].length == 0){
                            document.getElementById("tsunami_forecast").style.display = "none";
                        }
                        playAudio_eew(['./audio/tw/tsunami/tsunami_info_released.mp3']);
                    }else if(data["report_type"] == "海嘯警報解除" || data["report_type"] == "海嘯報告"){
                        document.getElementById("tsunami_forecast").style.display = "none";

                        playAudio_eew(['./audio/tw/tsunami/tsunami_cleared.mp3']);
                    }

                    // 更多海嘯資訊
                    document.getElementById("tsunami_moreInfo").onclick = function () {
                        shell.openExternal(data["web_url"]);
                    };

                    // 警報定時消失
                    if(tsunami_timer != null){
                        clearTimeout(tsunami_timer);
                    }
                    tsunami_timer = setTimeout(tsunamiTimeout,86400000 - (timestampNow() - created_at));
                }else{
                    document.getElementById("tsunami").style.display = "none"
                }
            }
		}

		function tsunamiTimeout(){
			document.getElementById("tsunami").style.display = "none";
            tsunami_timer = null;
		}