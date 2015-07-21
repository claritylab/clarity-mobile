/*
 * Sirius Mobile Application
 * Developed with Apache Cordova and Apache Thrift
 * More info at http://sirius.clarity-lab.org/
 * Written by Tim Wurman
 */

// -------------- Query Functions -------------- //
//query functions for requesting from server
function query() {
    //getting sirius hostport from command center
    console.log("Getting HostPort from command center");    
    var addr = getAddress(getItem("ip"), getItem("port"), 'cc');
    var transport = new Thrift.TXHRTransport(addr);
    var protocol  = new Thrift.TJSONProtocol(transport);
    var client = new SchedulerServiceClient(protocol);
    var response = client.consultAddress("sirius");
    console.log("Host: " + response.ip + ", Port: " + response.port);

    if(response.ip == "" || response.ip == null || response.port == null) {
        console.log("Service not found");
        processResponse("I'm sorry, I can't process your request right now");
        return;
    }

    //sending query to sirius service
    console.log("Sending Query");
    addr = getAddress(response.ip, response.port, 'sirius');
    transport = new Thrift.TXHRTransport(addr);
    protocol = new Thrift.TJSONProtocol(transport);
    client = new IPAServiceClient(protocol);

    //set up query object
    var query = new QuerySpec();
    query.name = "Sirius Mobile Query";
    query.content = new Array();

    //set up data objects
    if(image) {
        query.content.push(queryDataHelper("image", encodedImageData));
    } if(audio) {
        query.content.push(queryDataHelper("audio", encodedAudioData));
    } if(!image && !audio) {
        var queryData = new QueryInput();
        queryData.type = "text";
        queryData.data = new Array();
        queryData.data.push(text);
        queryData.tags = new Array();
        query.content.push(queryData);
    }

    console.log(query);

    try{
        response = client.submitQuery(query);
        //response is in base64, so convert it with atob
        processResponse(window.atob(response));
        console.log(window.atob(response));
    } catch(err) {
        processResponse("I'm sorry, I can't process your request right now");
        console.log(err);
    }
}

function queryDataHelper(type, data) {
    //parse encoded data into format and data
    var substr = data.substr(0, data.indexOf(",") + 1);
    var format = substr.substr(substr.indexOf("/") + 1, substr.indexOf(";")  - substr.indexOf("/") - 1);
    data = data.replace(substr, "");

    var queryData = new QueryInput();
    queryData.type = type;
    queryData.data = new Array();
    queryData.data.push(data);
    queryData.tags = new Array();
    queryData.tags.push("base64");
    queryData.tags.push(format);
    return queryData;
}

function askServer() {
    if(audio || image || text) {
        updateResponseDiv("Sending...");
        query();
    } else {
        console.log("Nothing to send!");
        navigator.notification.alert('Nothing to send!', null, 'Oops!');
    }
}
document.getElementById("askSirius").addEventListener("click",askServer);

function processResponse(data) {
    if(data) {
        msg = data + "<br><button class='btn-sm' id='resend'>Resend</button>"
        updateResponseDiv(msg);
        document.getElementById("resend").addEventListener("click",askServer);
        TTS.speak({
            text: String(data),
            locale: 'en-GB',
            rate: 0.75
        }, function () {
            //do nothing
        }, function (reason) {
            navigator.notification.alert(reason, null, 'Uh oh!');
        });
    } else {
        updateResponseDiv("Response is empty");
    }
}

