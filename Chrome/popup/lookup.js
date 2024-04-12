//
// Written by Volker Wiegand <volker@railduino.de>
//
// See https://github.com/railduino/zeroconf-lookup
//

document.getElementById("header").textContent = chrome.i18n.getMessage("htmlHeader");
document.getElementById("waiting").textContent = chrome.i18n.getMessage("htmlWaiting");

var cancel = document.getElementById("cancel");
cancel.textContent = chrome.i18n.getMessage("htmlCancel");
cancel.onclick = function() { window.close(); };

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

    if (response.result.length > 0) {
      table = document.createElement('table');

      server_list.appendChild(table);

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

