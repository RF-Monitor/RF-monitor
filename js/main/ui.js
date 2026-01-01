async function timeUpdate(){
    setInterval("show()",1000)
}
function login_cancel(){
  document.getElementById("login").style.display = "none";
}

/*
function CanvasStaListUpdate(canvaNum){
  //更新測站列表
    let StaList = "";
    for(let key in RF_stations){
        let id = key;
        let name = RF_stations[key]["name"]
        let cname = RF_stations[key]["cname"]
        StaList = StaList + "<option value='"+id+"'>"+cname+"("+name+")</option>"
    }
    document.getElementById("Canvas"+canvaNum.toString()+"Sta").innerHTML = StaList;
}
function CanvasChange(canvaNum){
    let id = document.getElementById("Canvas"+canvaNum.toString()+"Sta").value;
    wave_list[canvaNum-1]["id"] = id;
    wave_list[canvaNum-1]["wave"] = []
    storage.setItem("Canvas"+canvaNum.toString()+"Sta",id)
}
function changeWaveSelectedSta() {
    var selectElement = document.getElementById("Canvas1Sta");
    var optionValueToSelect = wave_list[0]["id"]; // 要選取的選項值
  
    // 搜尋選項，找到具有指定值的選項
    for (var i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].value === optionValueToSelect) {
        selectElement.selectedIndex = i; // 設置索引為選中的選項索引
        break;
      }
    }
    var selectElement = document.getElementById("Canvas2Sta");
    var optionValueToSelect = wave_list[1]["id"]; // 要選取的選項值
  
    // 搜尋選項，找到具有指定值的選項
    for (var i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].value === optionValueToSelect) {
        selectElement.selectedIndex = i; // 設置索引為選中的選項索引
        break;
      }
    }
    var selectElement = document.getElementById("Canvas3Sta");
    var optionValueToSelect = wave_list[2]["id"]; // 要選取的選項值
  
    // 搜尋選項，找到具有指定值的選項
    for (var i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].value === optionValueToSelect) {
        selectElement.selectedIndex = i; // 設置索引為選中的選項索引
        break;
      }
    }
    var selectElement = document.getElementById("Canvas4Sta");
    var optionValueToSelect = wave_list[3]["id"]; // 要選取的選項值
  
    // 搜尋選項，找到具有指定值的選項
    for (var i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].value === optionValueToSelect) {
        selectElement.selectedIndex = i; // 設置索引為選中的選項索引
        break;
      }
    }
}
    */
function showLogin(){
  document.getElementById("login").style.display = "block"
}
function hideLogin(){
  document.getElementById("login").style.display = "none"
}

