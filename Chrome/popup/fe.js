var editor;

var jsbOpts = {
  indent_size : 2
};

window.onload = function () {

    document.getElementById("post_config_flash").addEventListener("click", post_config_flash);
    document.getElementById("get_config_flash").addEventListener("click", get_config_flash);
    document.getElementById("get_config_ram").addEventListener("click", get_config_ram);
    document.getElementById("cmd_get").addEventListener("click", cmd_get);
    document.getElementById("cmd_save").addEventListener("click", cmd_save);
    document.getElementById("cmd_load").addEventListener("click", cmd_load);
    document.getElementById("cmd_clear").addEventListener("click", cmd_clear);
    document.getElementById("cmd_reboot").addEventListener("click", cmd_reboot);
    //document.getElementById("cmd_get_on").addEventListener("click", cmd_get_on);
    //document.getElementById("cmd_save_on").addEventListener("click", cmd_save_on);   
    //document.getElementById("cmd_get_off").addEventListener("click", cmd_get_off);
    //document.getElementById("cmd_save_off").addEventListener("click", cmd_save_off);
    document.getElementById("exec").addEventListener("click", exec);
    document.getElementById("item").addEventListener("change", get_status);

    // Переключатель "Конфиг с портала"
    document.getElementById('portal_config_switch').addEventListener('change', function() {
      if (this.checked) {
        cmd_get_on();
      } else {
        cmd_get_off();
      }
    });

    // Переключатель "Автосохранение конфига"
    document.getElementById('autosave_switch').addEventListener('change', function() {
      if (this.checked) {
        cmd_save_on();
      } else {
        cmd_save_off();
      }
    });
    
}

$(document).ready(function(){  
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  const mac = params.get('mac');
  let url = params.get('url');

  if (name) {
    document.getElementById('devname').textContent = name;
  }
  if (mac) {
    document.getElementById('mac').textContent = mac;
    document.getElementById('mac').style.display = '';
  }
  if (url) {
    if (!url.endsWith('/')) {
      url += '/';
    }
    document.getElementById('url').value = url;
  }

  editor = ace.edit("editor");
  //editor.setWrapBehavioursEnabled(true);
  //ace.config.set("basePath", "ace/");
  //editor.setTheme("ace/theme/twilight");
  editor.session.setMode("ace/mode/json");
  editor.getSession().setTabSize(2);
  editor.getSession().setUseWrapMode(true);

  if (document.getElementById('url').value) {
    get_config("config.json");
  }
});


function get_config_flash() { get_config('config.json') }
function post_config_flash() { post_config('config.json') }
function get_config_ram() { get_config('ram/') }
function cmd_get() { post_cmd('command/get',"") }
function cmd_save() { post_cmd('command/save',"") }
function cmd_clear() { post_cmd('command/clear',"") }
function cmd_reboot() { post_cmd('command/reboot',"") }
function cmd_load() { post_cmd('command/load',"") }
function cmd_save_on() { post_cmd('command/save',"ON") }
function cmd_save_off() { post_cmd('command/save',"OFF") }
function cmd_get_on() { post_cmd('command/get',"ON") }
function cmd_get_off() { post_cmd('command/get',"OFF") }

function exec() {
    post_cmd("item/"+$("select#item").val()+$("input#subitem").val()+$("select#suffix").val(),$("input#command").val())
}
function get_status() {
    get_cmd("item/"+$("select#item").val())
}

function get_config(endpoint) {
	var username = $("input#login").val();
	var password = $("input#password").val();
  var surl = $("input#url").val();
  document.getElementById("resp").innerHTML = "Getting..."; 
  var settings = {
        "url": surl+endpoint,
        "method": "GET",
         beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
            xhr.setRequestHeader ("Pragma", "no-cache");
            //xhr.withCredentials = true;
          },
    "timeout": 20000
  };


  $.ajax(settings)
    .done(function (response) {
    editor.setValue(  js_beautify( JSON.stringify( response ), jsbOpts));
    document.getElementById("resp").innerHTML = "Loaded "+endpoint;
    var txt = "";
    myObj = JSON.parse(JSON.stringify( response ));
     //   txt += "<select>"
        for (var key in myObj.items) {
             txt += "<option>" + key + "</option>";
        }
       // txt += "</select>" 
        document.getElementById("item").innerHTML = txt;

  fetchAndShowSysInfo();
    
  })
    .fail(function (jqXHR, exception) {
        // Our error logic here
        var msg = '';
        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else if (jqXHR.status == 401) {
            msg = 'Invalid login/password.';     
        } else if (jqXHR.status == 304) {
            msg = 'Not Modified.';              
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        document.getElementById("resp").innerHTML = "Error "+jqXHR.status+" "+msg;
    });  
};

function post_config(endpoint) {
	var username = $("input#login").val();
	var password = $("input#password").val();
  var surl = $("input#url").val();
  document.getElementById("resp").innerHTML = "Post..."; 
  var settings = {
        "url": surl+endpoint,
        "method": "POST",
         beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
            xhr.setRequestHeader ("Pragma", "no-cache");
            //xhr.withCredentials = true;
          },
    "timeout": 20000,
    "data": editor.getValue(),
  };

  $.ajax(settings)
    .done(function (response) {
      document.getElementById("resp").innerHTML = "Saved "+ endpoint;
  })
    .fail(function (jqXHR, exception) {
        // Our error logic here
        var msg = '';
        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else if (jqXHR.status == 304) {
            msg = 'Not Modified.';        
        } else if (jqXHR.status == 401) {            
            msg = 'Invalid login/password.';      
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        document.getElementById("resp").innerHTML = "Error "+jqXHR.status+" "+msg;
    });

};


function get_cmd(endpoint) {
	var username = $("input#login").val();
	var password = $("input#password").val();
  var surl = $("input#url").val();
  document.getElementById("resp").innerHTML = "Get..."; 
  var settings = {
        "url": surl+endpoint,
        "method": "GET",
        beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
      xhr.setRequestHeader ("Pragma", "no-cache");
      //xhr.withCredentials = true;
  },
    "timeout": 20000

  };

  $.ajax(settings)
    .done(function (response) {
     document.getElementById("resp").innerHTML = "Done "+ response;  
  })
    .fail(function (jqXHR, exception) {
        // Our error logic here
        var msg = '';
        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else if (jqXHR.status == 401) {
            msg = 'Invalid login/password.';       
        } else if (jqXHR.status == 304) {
            msg = 'Not Modified.';    
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        document.getElementById("resp").innerHTML = "Error "+" "+jqXHR.status+msg;
    });
}

function post_cmd(endpoint, param) {
	var username = $("input#login").val();
	var password = $("input#password").val();
  var surl = $("input#url").val();
  document.getElementById("resp").innerHTML = "Post..."; 
  var settings = {
        "url": surl+endpoint,
        "method": "POST",
        beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
      xhr.setRequestHeader ("Pragma", "no-cache");
      //xhr.withCredentials = true;
  },
    "timeout": 20000,
    "headers": {
      "Content-Type": "text/plain"
    },
    "data": param+"\n",
  };

  $.ajax(settings)
    .done(function (response) {
     document.getElementById("resp").innerHTML = "Done "+ response;  
  })
    .fail(function (jqXHR, exception) {
        // Our error logic here
        var msg = '';
        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else if (jqXHR.status == 401) {
            msg = 'Invalid login/password.'; 
        } else if (jqXHR.status == 304) {
            msg = 'Not Modified.';              
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        document.getElementById("resp").innerHTML = "Error "+" "+jqXHR.status+" "+msg;
    });
}