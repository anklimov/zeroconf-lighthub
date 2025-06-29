//
// Written by Volker Wiegand <volker@railduino.de>
//
// See https://github.com/railduino/zeroconf-lookup
//

document.getElementById("header").textContent = chrome.i18n.getMessage("htmlHeader");
document.getElementById("waiting").textContent = chrome.i18n.getMessage("htmlWaiting");

var cancel = document.getElementById("cancel");
//cancel.textContent = chrome.i18n.getMessage("htmlCancel");
document.getElementById('cancel').onclick = function() { window.close(); };

document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendNativeMessage('com.railduino.zeroconf_lookup', { cmd: "Lookup" }, function(response) {
    if (typeof response !== 'object') {
      document.getElementById("waiting").textContent = chrome.i18n.getMessage("htmlError");
      document.getElementById("message").textContent = chrome.i18n.getMessage("htmlNoServer");
      document.getElementById("spinner").style.display = "none";
    }

    var str = JSON.stringify(response, null, 2);
    var i, server, a, div, hr, br, span;

    document.getElementById("source").textContent = chrome.i18n.getMessage("htmlSource") + response.source;

    var server_list = document.getElementById("server_list");
    server_list.textContent = "";

    if ((response.result.length > 0) || 1 || chrome.get({manualServers:[]}).length) {
      table = document.createElement('table');

      server_list.appendChild(table);

      // Сначала отрисуем ручные сервера
      renderManualServers(table);
 
      for (i in response.result) {
        server = response.result[i];
        raw=table.insertRow(0)


        col1 = document.createElement("td");
        raw.appendChild(col1);
        col2 = document.createElement("td");
        raw.appendChild(col2);
        col3 = document.createElement("td");
        raw.appendChild(col3);

        a = document.createElement('a');
        a.textContent = server.name ;
   //     a.href = server.url;
   //     a.classList.add("server", "button");
        a.classList.add("h3");
        col1.appendChild(a);

        br = document.createElement('br');
        col1.appendChild(br);

        a = document.createElement('a');
        a.textContent = server.url ;
        a.href = server.url;
        a.classList.add("server", "button");
        col1.appendChild(a);

        br = document.createElement('br');
        col1.appendChild(br);

        a = document.createElement('a');
        a.textContent = server.target;
        a.href = server.url;
        a.classList.add("server", "button");     
        
        col1.appendChild(a);
        
        a = document.createElement('a');
        //a.textContent = "Edit";
        if (server.name.substring(0,8) =="LightHub")
        {
        //a.href = "config.html?url="+server.url+"&txt="+server.txt+"&name="+server.target;
        if (Array.isArray(server.txt)) 
        a.href = "config.html?url="+server.url+"&name="+server.target+"&"+server.txt.join("&");
        else 
        a.href = "config.html?url="+server.url+"&name="+server.target+"&"+server.txt;
        a.classList.add("server","button");
        a.classList.add("edit");
        }
        else a.classList.add("noedit");
        //aspan=document.createElement('span');
        //aspan.classList.add("icon");  
        //a.appendChild(aspan);
        col3.appendChild(a);
        
        
        

        if (Array.isArray(server.txt)) {
          server.txt.forEach(function(item) {
            line = document.createElement('span');
            line.textContent = item;
            col2.appendChild(line);
            br = document.createElement('br');
            col2.appendChild(br);
          });
        } else if (server.txt != null) {
          line = document.createElement('span');
          line.textContent = server.txt;
          col2.appendChild(line);
          br = document.createElement('br');
          col2.appendChild(br);
        }
      }
    } else {
      div = document.createElement('div');
      div.textContent = chrome.i18n.getMessage("htmlNoServer");
      server_list.appendChild(div);
      hr = document.createElement('hr');
      server_list.appendChild(hr);
    }

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("server")) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.update(tabs[0].id, {
            active: true,
            url: e.target.href
          });
          window.close();
        });
      }
      e.preventDefault();
    }, false);
  });
});

// Функции для работы с ручными серверами
function loadManualServers(callback) {
  chrome.storage.local.get({manualServers: []}, function(result) {
    callback(result.manualServers);
  });
}

function saveManualServers(servers, callback) {
  chrome.storage.local.set({manualServers: servers}, callback);
}

function renderManualServers(table) {
  loadManualServers(function(manualServers) {
    manualServers.forEach(function(server, idx) {
      let row = table.insertRow(0);
      let col1 = document.createElement("td");
      let col2 = document.createElement("td");
      let col3 = document.createElement("td");
      row.appendChild(col1);
      row.appendChild(col2);
      row.appendChild(col3);

      // Имя
      let a = document.createElement('a');
      a.textContent = server.name;
      a.classList.add("h3");
      col1.appendChild(a);

      col1.appendChild(document.createElement('br'));

      // IP
      let a2 = document.createElement('a');
      a2.textContent = server.url;
      a2.href = server.url;
      a2.classList.add("server", "button");
      col1.appendChild(a2);

      col1.appendChild(document.createElement('br'));

      // Кнопка редактирования
      let a3 = document.createElement('button');
      a3.className = "fa-btn";
      //a3.href = "config.html?url="+server.url+"&name="+server.name;
      //a3.classList.add("server", "button", "edit");
      a3.title = "Редактировать сервер";
      a3.innerHTML = '<i class="fa fa-pencil"></i>';

      a3.onclick = function(e) {
        e.stopPropagation();
        ///document.location.href = "config.html?url="+server.url+"&name="+server.name;  
        window.open("config.html?url="+server.url+"&name="+server.name, server.name);   
      };

      col3.appendChild(a3);


      // Кнопка удаления
      let delBtn = document.createElement('button');
      delBtn.className = "fa-btn";
      delBtn.title = "Удалить сервер";
      delBtn.innerHTML = '<i class="fa fa-trash"></i>';
      delBtn.onclick = function(e) {
        e.stopPropagation();
        manualServers.splice(idx, 1);
        saveManualServers(manualServers, function() {
          row.remove();
        });
      };
      col3.appendChild(delBtn);
    });
  });
}

// Добавление нового ручного сервера
document.getElementById('manual_add_btn').onclick = function() {
  let name = document.getElementById('manual_name').value.trim();
  let ip = document.getElementById('manual_ip').value.trim();
  if (!name || !ip) return;

  let url = ip.startsWith('http') ? ip : 'http://' + ip;

  loadManualServers(function(manualServers) {
    manualServers.push({name: name, url: url});
    saveManualServers(manualServers, function() {
      location.reload();
    });
  });
};

