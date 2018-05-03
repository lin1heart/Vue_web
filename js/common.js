function doPost(event, data) {
	event = event || {};
	data = data || {};

	var request = {
		head: {},
		body: {}
	};

	invokeEventMethod(event, "Request", [request, data]);
	var head =  request.head || { bid: "", fid: "", typ: "GET"};
	var bid = "/" + head.bid;
	var fid = "/" + head.fid;
	var type = head.typ;
	var da = request.body;		
	if(da == "{}"){
		da = "";
	}
	$.ajax({
		url: POST_URL + bid + fid,
		type: type,
		async:true,
		contentType: 'application/x-www-form-urlencoded',
		data: da,
		xhrFields: {withCredentials: true},
		success: function(response, status, xhr) {
			invokeEventMethod(event, "Response", [response, data]);
		},
		error: function(xhr, status, exception) {
			invokeEventMethod(event, "Exception", [exception, xhr.status, status]);
		}
	});
}
//var POST_URL = "http://127.0.0.1:8080";
var POST_URL = "http://13.250.226.195";
//var POST_URL = "fe2o3.club";

function invokeEventMethod(event, method, arguments, otherwise) {
	if(window[event + method] instanceof Function) {
		return window[event + method].apply(this, arguments);
	} else {
		return otherwise === undefined ? true : otherwise;
	}
}

function getMessage(response) {
	var message = response.msg;
	if(message) {
		message = "（" + message + "）";
	}
	return message;
}