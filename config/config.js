const { Notification } = require('electron');
const storage = require('electron-localstorage');

/**
 * 讀取 boolean（兼容舊字串）
 */
function getBool(key, def) {
  const v = storage.getItem(key);
  if (v === null || v === "") return def;
  if (v === true || v === false) return v;
  return v !== "false";
}

/**
 * 讀取 number
 */
function getNumber(key, def) {
  const v = storage.getItem(key);
  if (v === null || v === "") return def;
  return Number(v);
}

/**
 * 讀取 string
 */
function getString(key, def = "") {
  const v = storage.getItem(key);
  return (v === null || v === "") ? def : v;
}
function getConfig(){
  const config = {
    server: {
      http: getString('server_url', 'http://RFEQSERVER.myqnapcloud.com'),
      ws: getString('ws_server_url', 'ws://RFEQSERVER.myqnapcloud.com')
    },

    system: {
      enableGPU: getBool('enable_gpu', true),
      autoLaunch: getBool('enable_autolaunch', true),
      minimizeToTray: getBool('minimize_to_tray', false),
      windowPopup: getBool('enable_window_popup', true),
      enableNotification: getBool('enable_notification',true),
      opacity: getNumber('opacity', 0.7)
    },

    user: {
      lat: getNumber('userlat', 25.033319),
      lon: getNumber('userlon', 121.564306),
      localOnly: getBool('local_only', false)
    },

    eew: {
      tw: getBool('enable_eew_tw', true),
      jp: getBool('enable_eew_jp', true),
      rfplus: getBool('enable_RFPLUS', false),
      rfplusType: getString('RFPLUS_type', 'RFPLUS2')
    },

    weather: {
      enabled: getBool('enable_weather', true),
      typhoon: {
        enabled: getBool('enable_typhoon', true),
        analysis: getBool('enable_ty_analysis', true),
      }
    },

    tsunami: {
      enabled: getBool('enable_tsunami', true)
    },

    shindo: {
      enabled: getBool('enable_shindo', true),
      trem: getBool('enable_shindo_TREM', true),
      pgaWarnOnly: getBool('PGA_warn_only', true),
      warningArea: getBool('enable_warningArea', true),
    },

    wave: {
      enabled: getBool('enable_wave', false),
    },

    sound: {
      twEEW: getBool('enable_tw_eew_sound', true),
      jpEEW: getBool('enable_jp_eew_sound', false),
      twRead: getBool('enable_eew_tw_read', true),
      shindo: {
        1: getBool('enable_shindo_sounds_1', true),
        2: getBool('enable_shindo_sounds_2', true),
        3: getBool('enable_shindo_sounds_3', true),
        4: getBool('enable_shindo_sounds_4', true),
        '5-': getBool('enable_shindo_sounds_5-', true),
        '5+': getBool('enable_shindo_sounds_5+', true),
        '6-': getBool('enable_shindo_sounds_6-', true),
        '6+': getBool('enable_shindo_sounds_6+', true),
        7: getBool('enable_shindo_sounds_7', true)
      }
    },

    webhook: {
      shindo: {
        url: getString('webhook_url_shindo_sokuho'),
        header: getString('webhook_header_shindo_sokuho', 'RF震度速報')
      },
      twEEW: {
        url: getString('webhook_url_TW_EEW'),
        text: getString(
          'webhook_text_TW_EEW',
          '%T發生有感地震 第%N報 規模:M%M 最大震度:%I'
        )
      }
    },

    stations: {
      selected: getString('selected_station', 'Zhubei_Rexi0026'),
      canvas: [
        getString('Canvas1Sta', '6050_0021'),
        getString('Canvas2Sta', '6050_0011'),
        getString('Canvas3Sta', '6050_0007'),
        getString('Canvas4Sta', '6050_0003')
      ]
    }
  };
  return config;
}

module.exports = { getConfig };
