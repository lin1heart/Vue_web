var banner = new Vue({
	el: '#banner_full',
	data:{
		onlineCount: "",
		dbCount: "",
		selfCount: ""
	}
})

var isClient = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);

$(function(){
	doPost('version');
	doPost("getList",{"pageIndex": "0","pageSize":"10","type":"0"});
//	doPost("register",{"username":"333","password":"22","mail":"406644209@qq.com"});
//	doPost('login',{"username":"111","password":"123"});
})
var image_lsit = new Vue({
	el: '#image_container',
	data: {
		totalWidth: isClient ? '100%' : '70%',
		totalLeft: isClient ? 0 : '15%',
		pic:[]
	}
})

alert(image_lsit.totalWidth + image_lsit.totalLeft + isClient);
/*******************version请求*******************************/
function versionRequest(request,form){
	request.head.bid = "user";
	request.head.fid = "version";
	request.head.typ = "GET";
	request.body = {}
}

function versionResponse(response){
	if(response.code =="200"){
		var data = response.data;
		banner.dbCount = data.dbCount;
		banner.onlineCount = data.onlineCount;
		banner.selfCount = data.selfCount;
	}else{
		console.log("version Response:"+getMessage(response));
	}
}

function versionException(exception, code, status){
	console.log("version 请求发送失败:"+exception, code, status);
}

/*******************登录请求*******************************/
function loginRequest(request,form){
	request.head.bid = "user";
	request.head.fid = "login";
	request.head.typ = "POST";
	request.body = {
		username: form.username,
		password: form.password
	}
}

function loginResponse(response){
	if(response.code =="200"){
		console.log("login:"+response);
		
	}else{
		console.log("login Response" + getMessage(response));
	}
}

function loginException(exception, code, status){
	console.log("login 请求发送失败:"+exception, code, status);
}

/*******************注册请求*******************************/
function registerRequest(request,form){
	request.head.bid = "user";
	request.head.fid = "register";
	request.head.typ = "POST";
	request.body = {
		username: form.username,
		password: form.password,
		mail: form.mail
	}
}

function registerResponse(response){
	if(response.code =="200"){
		console.log("register:"+response);
		
	}else{
		console.log("register Response" + getMessage(response));
	}
}

function registerException(exception, code, status){
	console.log("register 请求发送失败:"+exception, code, status);
}

/*******************imageList请求*******************************/
function getListRequest(request,form){
	request.head.bid = "image";
	request.head.fid = "getList";
	request.head.typ = "GET";
	request.body = {
		pageIndex: form.pageIndex,
		pageSize: form.pageSize,
		type: form.type
	}
}

var IMAGE_URL = 'http://13.250.226.195:8888/dbImage/';

function getListResponse(response){
	if(response.code =="200"){
		var imageList = [];
		for(var i = 0; i< response.data.length; i++){
			var aspectRatio = response.data[i].width/response.data[i].height;
			image_lsit.$data.pic.push({
				aspectRatioWidth: aspectRatio*200 + 'px',
				aspectRatioFlex: aspectRatio*200,
				ipadding: 1/aspectRatio * 100 + '%',
				imgurl: IMAGE_URL + response.data[i].headImage,
				title: response.data[i].title
			})
		}
	}else{
		console.log("getList Response" + getMessage(response));
	}
}

function getListException(exception, code, status){
	console.log("getList 请求发送失败:"+exception, code, status);
}