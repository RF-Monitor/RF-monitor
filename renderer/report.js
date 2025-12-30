export function InfoUpdate_full_ws(earthquakeInfo) {
    console.log("running infoUpdate")
    //earthquakeInfo = JSON.parse(earthquakeInfo);

    let htmlText = '';
    let color = '';

    for (let i = 0; i < earthquakeInfo.length; i++) {
        const info = earthquakeInfo[i];
        const id = info.id;

        if (info.max_shindo == '1') {
            color = 'gray';
        } else if (info.max_shindo == '2') {
            color = '#0066CC';
        } else if (info.max_shindo == '3') {
            color = 'green';
        } else if (info.max_shindo == '4') {
            color = '#BAC000';
        } else if (info.max_shindo == '5-') {
            color = '#FF7F27';
        } else if (info.max_shindo == '5+') {
            color = '#ED1C24';
        } else if (info.max_shindo == '6-') {
            color = 'red';
        } else if (info.max_shindo == '6+') {
            color = '#A50021';
        } else if (info.max_shindo == '7') {
            color = 'purple';
        } else {
            color = '#63AA8B';
        }

        htmlText +=
            "<table id='" + id + "' border=0 cellpadding='0px' " +
            "style='background-color:" + color + "' class='earthquake_report'>" +
                "<tr>" +
                    "<td rowspan=3>" +
                        "<p style='color:white;font-size:60px' align='left'>" +
                            info.max_shindo +
                        "</p>" +
                    "</td>" +
                    "<td colspan=2>" +
                        "<strong><h4 style='color:white' align='left'>" +
                            info.epicenter +
                        "</h4></strong>" +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td colspan=2>" +
                        "<h6 style='color:white' align='left'>" +
                            info.datetime +
                        "</h6>" +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>" +
                        "<h4 style='color:white' align='left'><strong>" +
                            info.magnitude +
                        "</strong></h4>" +
                    "</td>" +
                    "<td>" +
                        "<h4 style='color:white' align='right'>" +
                            info.depth +
                        "</h4>" +
                    "</td>" +
                "</tr>" +
            "</table>";
    }

    if (htmlText !== '') {
        document.getElementById("earthquakeInfo").innerHTML = htmlText;
    }

    for (let i = 0; i < earthquakeInfo.length; i++) {
        const id = earthquakeInfo[i].id;
        document.getElementById(id).onclick = function () {
            //infoDistributed(id);
        };
    }
}
