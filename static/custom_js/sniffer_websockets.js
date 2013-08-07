function snifferInterfaceInit() {
    sendmessage(ws_sniffer, {'cmd': 'sniffstatus', 'session_name': $('#session_name').text()});
    console.log("sniffstatus");

    ws_sniffer.onmessage = function(msg) {
        data = $.parseJSON(msg.data);
        console.log(data);
        
        if (data.msg.status == 'inactive') {
            $('#startsniff').removeAttr('disabled');
            $('#stopsniff').attr('disabled','true');
        }
        else {
            $('#startsniff').attr('disabled','true');
            $('#stopsniff').removeAttr('disabled');
        }

        sendmessage(ws_sniffer, {'cmd': 'sessionlist'});
        console.log("sessionlist");

        ws_sniffer.onmessage = function(msg) {
            data = $.parseJSON(msg.data);
            console.log(data);

            for (var i in data.msg.session_list) {
                ul = $('#sessions');
                session_links = $('<a href='+url_static_prefix+'"/sniffer/'+data.msg.session_list[i]+'">'+data.msg.session_list[i]+'</a>');
                li = $('<li></li>');
                li.append(session_links);
                ul.append(li);
            }

            sendmessage(ws_sniffer, {'cmd': 'sniffupdate', 'session_name': $('#session_name').text()});
            console.log("sniffupdate");

            ws_sniffer.onmessage = function(msg) {
                data = $.parseJSON(msg.data);
                console.log(data);
                push_nodes(data.nodes);
                push_links(data.edges);
                start();
            };

        }      
    };
}

function getSessionList() {
    $.ajax({
    type: 'get',
    url: '/sniffer/sessionlist/',
    success: function(data) {
        data = $.parseJSON(data);
        console.log(data);

        table = $('#sessions');

        for (var i in data.session_list) {    
            
            tr = $('<tr></tr>');
            session_links = $('<a />').attr("href", url_static_prefix+'/sniffer/'+data.session_list[i]['name']).text(data.session_list[i]['name']);
            tr.append($("<td />").append(session_links))
            tr.append($("<td />").text(data.session_list[i]['packets']));
            tr.append($("<td />").text(data.session_list[i]['nodes']));
            tr.append($("<td />").text(data.session_list[i]['edges']));
            table.append(tr);
        }
    }
  });
}


// function getSessionList() {
//     sendmessage(ws_sniffer, {'cmd': 'sessionlist'});
//         console.log("sessionlist");

//         ws_sniffer.onmessage = function(msg) {
//             data = $.parseJSON(msg.data);
//             console.log(data);

//             table = $('#sessions');
//             for (var i in data.msg.session_list) {    
//                 session_links = $('<a href='+url_static_prefix+'"/sniffer/'+data.msg.session_list[i]+'">'+data.msg.session_list[i]+'</a>');
//                 tr = $('<tr></tr>');
//                 tr.append($("<td />").append(session_links));
//                 table.append(tr);
//             }
//         }
// }

function initSnifferWebSocket() {
    if ("WebSocket" in window) {
        ws_sniffer = new WebSocket(url_websocket_prefix+"api/sniffer");
    } else {
        console.log("WebSocket not supported");
    }
}

function startsniff(){
    session_name = $('#session_name').text()
    if ( session_name != '') {
        sendmessage(ws_sniffer, {'cmd': 'sniffstart', 'session_name': session_name})
        ws_sniffer.onmessage = function (msg) {
            data = $.parseJSON(msg.data)
            console.log(data)
            $('#startsniff').attr('disabled','true')
            $('#stopsniff').removeAttr('disabled')

            ws_sniffer.onmessage = function (msg) {
                data  = $.parseJSON(msg.data)
                console.log(data)
                push_nodes(data.nodes);
                push_links(data.edges);
                start();
            };
        }
    }
    else {
        alert('Please enter a session name to continue')
    }
}

function stopsniff() {
    session_name = $('#session_name').text()
    sendmessage(ws_sniffer, {'cmd': 'sniffstop', 'session_name': session_name})

    ws_sniffer.onmessage = function (msg) {
        data = $.parseJSON(msg.data)
        console.log(data)
        $('#startsniff').removeAttr('disabled')
        $('#stopsniff').attr('disabled','true')
    }
}

