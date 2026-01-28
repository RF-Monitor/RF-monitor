export function switchPage(pageid, map, map2, map3){
    let page2nav = {"page1":"nav_eew","page2":"nav_report","page3":"nav_weather"}
    document.getElementById('page1').style.display = "none";
    document.getElementById(page2nav['page1']).style.borderBottomColor = "#3C3C3C";
    document.getElementById('page2').style.display = "none";
    document.getElementById(page2nav['page2']).style.borderBottomColor = "#3C3C3C";
    document.getElementById('page3').style.display = "none";
    document.getElementById(page2nav['page3']).style.borderBottomColor = "#3C3C3C";
    document.getElementById(pageid).style.display = "flex";
    document.getElementById(page2nav[pageid]).style.borderBottomColor = "#00FFFF";
    map.panTo([23.7, 120.924610]);
    map.invalidateSize(true);
    map2.panTo([23.7, 120.924610]);
    map2.invalidateSize(true);
    map3.panTo([23.7, 120.924610])
    map3.invalidateSize(true);   
}

export function setUIopacity(opacity){
    document.getElementById("navbar").style.opacity = opacity;
    document.getElementById("left").style.opacity = opacity;
    document.getElementById("max_shindo").style.opacity = opacity;
    document.getElementById("selected").style.opacity = opacity;
    document.getElementById("sta_count").style.opacity = opacity;
    document.getElementById("time_now").style.opacity = opacity;

}