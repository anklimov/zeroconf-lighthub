// filepath: /workspaces/zeroconf-lighthub/Chrome/popup/config.html
// ...existing code...

// Получение devname
function getDevName() {
  return document.getElementById('devname').textContent.trim();
}

// Ключ для localStorage
function getStorageKey(field) {
  const dev = getDevName();
  return dev ? `lhub_${dev}_${field}` : null;
}

// Загрузка логина и пароля при смене devname
function loadAuthFields() {
  const loginKey = getStorageKey('login');
  const passKey = getStorageKey('password');
  if (loginKey) {
    const login = localStorage.getItem(loginKey);
    if (login !== null) document.getElementById('login').value = login;
  }
  if (passKey) {
    const pass = localStorage.getItem(passKey);
    if (pass !== null) document.getElementById('password').value = pass;
  }
 // fetchAndShowSysInfo();
}

// Сохранение логина и пароля при изменении
function saveAuthField(field) {
  const key = getStorageKey(field);
  if (key) {
    const val = document.getElementById(field).value;
    localStorage.setItem(key, val);
  }
}

document.getElementById('login').addEventListener('input', () => saveAuthField('login'));
document.getElementById('password').addEventListener('input', () => saveAuthField('password'));

// Если devname меняется динамически, вызовите loadAuthFields() после его изменения
// Например, если devname устанавливается через JS:
const devnameObserver = new MutationObserver(loadAuthFields);
devnameObserver.observe(document.getElementById('devname'), { childList: true });

// Вызвать при загрузке
window.addEventListener('DOMContentLoaded', loadAuthFields);

// Скрывать MAC если undefined
document.addEventListener('DOMContentLoaded', function() {
    var macDiv = document.getElementById('mac');
    if (!macDiv.textContent || macDiv.textContent.trim().toLowerCase() === 'undefined') {
      macDiv.style.display = 'none';
    } else {
      macDiv.style.display = '';
    }
  });


// Ключ для localStorage
function getEditorStorageKey() {
  const devname = document.getElementById('devname')?.textContent?.trim() || 'default';
  return `lhub_${devname}`;
}

// Сохранить editor в localStorage
document.getElementById('editor_save_local').onclick = function() {
  const key = getEditorStorageKey();
  localStorage.setItem(key, editor.getValue());
  document.getElementById("resp").innerHTML = "Сохранено в браузере";
};

// Восстановить editor из localStorage
document.getElementById('editor_load_local').onclick = function() {
  const key = getEditorStorageKey();
  const val = localStorage.getItem(key);
  if (val !== null) {
    editor.setValue(val, -1);
    document.getElementById("resp").innerHTML = "Загружено из браузера";
  } else {
    document.getElementById("resp").innerHTML = "Нет сохранённых данных";
  }
};

// Скачать editor как JSON
document.getElementById('editor_download').onclick = function() {
  const text = editor.getValue();
  const blob = new Blob([text], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getEditorStorageKey()+"_config.json";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

// Загрузить editor из файла
document.getElementById('editor_upload').onclick = function() {
  document.getElementById('editor_file_input').click();
};

document.getElementById('editor_file_input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    editor.setValue(evt.target.result, -1);
    document.getElementById("resp").innerHTML = "Загружено из файла";
  };
  reader.readAsText(file);
});

document.getElementById('sysinfo-header').onclick = function() {
  const content = document.getElementById('sysinfo-content');
  const toggle = document.getElementById('sysinfo-toggle');
  if (content.style.display === 'none') {
    content.style.display = '';
    toggle.textContent = '–';
  } else {
    content.style.display = 'none';
    toggle.textContent = '+';
  }
};

async function fetchAndShowSysInfo() {
  const url = document.getElementById('url').value.trim();
  if (!url) return;
  let endpoint = url;
  if (!endpoint.endsWith('/')) endpoint += '/';
  endpoint += 'config.bin';

  const sysinfoLoading = document.getElementById('sysinfo-loading');
  const sysinfoData = document.getElementById('sysinfo-data');
  sysinfoLoading.style.display = '';
  sysinfoData.textContent = '';

  try {
    const resp = await fetch(endpoint, { method: 'GET' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const buf = await resp.arrayBuffer();
    const view = new DataView(buf);

    // Парсинг структуры systemConfigData
    function readStr(offset, len) {
      let arr = [];
      for (let i = 0; i < len; ++i) {
        let code = view.getUint8(offset + i);
        if (code === 0) break;
        arr.push(String.fromCharCode(code));
      }
      return arr.join('');
    }
    function readMac(offset) {
      let arr = [];
      for (let i = 0; i < 6; ++i) arr.push(view.getUint8(offset + i).toString(16).padStart(2, '0'));
      return arr.join(':');
    }
    function readIp(offset) {
      return Array.from({length:4}, (_,i)=>view.getUint8(offset+i)).join('.');
    }

    let o = 0;
    const signature = readStr(o, 4); o += 4;
    const mac = readMac(o); o += 6;
    const spare = view.getUint16(o, true); o += 2;

    // systemConfigFlags
    const flags32 = view.getUint32(o, true);
    const serialDebugLevel = flags32 & 0xF;
    const udpDebugLevel = (flags32 >> 4) & 0xF;
    const notGetConfigFromHTTP = !!((flags32 >> 8) & 1);
    const notSaveSuccedConfig = !!((flags32 >> 9) & 1);
    const dhcpFallback = !!((flags32 >> 10) & 1);
    const sysConfigHash = (flags32 >> 16) & 0xFFFF;
    o += 4;

    const ip = readIp(o); o += 4;
    const dns = readIp(o); o += 4;
    const gw = readIp(o); o += 4;
    const mask = readIp(o); o += 4;

    const configURL = readStr(o, 32); o += 32;
    const MQTTpwd = readStr(o, 16); o += 16;
    const OTApwd = readStr(o, 16); o += 16;
    const ETAG = readStr(o, 32); o += 32;

    const sysinfo = {
      signature,
      mac,
      spare,
      flags: {
        serialDebugLevel,
        udpDebugLevel,
        notGetConfigFromHTTP,
        notSaveSuccedConfig,
        dhcpFallback,
        sysConfigHash
      },
      ip,
      dns,
      gw,
      mask,
      configURL,
      MQTTpwd,
      OTApwd,
      ETAG
    };

    sysinfoLoading.style.display = 'none';
    sysinfoData.textContent = JSON.stringify(sysinfo, null, 2);



    // После получения sysinfo:
    // sysinfo.notGetConfigFromHTTP, sysinfo.notSaveSuccedConfig

    // Установить состояние переключателей:
    document.getElementById('portal_config_switch').checked = !sysinfo.flags.notGetConfigFromHTTP;
    document.getElementById('autosave_switch').checked = !sysinfo.flags.notSaveSuccedConfig;
  } catch (e) {
    sysinfoLoading.textContent = 'Ошибка загрузки: ' + e;
    sysinfoData.textContent = '';
  }
}

// Загружать sysinfo при открытии раздела и при изменении URL
document.getElementById('sysinfo-header').addEventListener('click', function() {
  if (document.getElementById('sysinfo-content').style.display !== 'none') {
    fetchAndShowSysInfo();
  }
});
document.getElementById('url').addEventListener('change', function() {
  if (document.getElementById('sysinfo-content').style.display !== 'none') {
    fetchAndShowSysInfo();
  }
});
