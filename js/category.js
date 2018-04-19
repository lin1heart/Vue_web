var IMAGE_URL = 'http://13.250.226.195:8888/dbImage/';
var isClient = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
var listNum = 0;
var CHOICED_ID;
$(function() {
	//	doPost('version');
	getimageList();
	//	doPost("register",{"username":"333","password":"22","mail":"406644209@qq.com"});
	//	doPost('login',{"username":"111","password":"123"});
})
function getimageList(){
	image_lsit.$data.status = "loading";
	doPost("getList", {
		"pageIndex": String(listNum),
		"pageSize": "10",
		"type": "0"
	});
	listNum++;
}

$(window).scroll(
	function() {
		var scrollTop = $(this).scrollTop();
		var scrollHeight = $(document).height();
		var windowHeight = $(this).height();
		if(scrollTop + windowHeight >= scrollHeight &&image_lsit.status === 'loaded') {
			getimageList();
		}
	});

var affix = new Vue({
	el: '#affix'
})

var banner = new Vue({
	el: '#banner_full',
	data: {
		onlineCount: "",
		dbCount: "",
		selfCount: ""
	}
})

var image_lsit = new Vue({
	el: '#image_container',
	data: {
		totalWidth: isClient ? '100%' : '70%',
		totalLeft: isClient ? 0 : '15%',
		pic: [],
		status: 'loaded'
	},
	methods:{
		load: function(){
			if(this.$data.status === 'loaded'){
				getimageList();
			}
		},
		imageclick: function(index){
			showDetail(index);
		},
		iconClick: function(e,index){
			e.stopPropagation();//阻止冒泡，防止触发父级div的click事件
			if(this.$data.pic[index].icon){
				this.$data.pic[index].icon = false;
			}else{
				this.$data.pic[index].icon = true;
			}
		}
	}
})


function showDetail(index) {
	if(index!=CHOICED_ID){
		CHOICED_ID = index;
		showDetailModel(true, true);
	} else {
		showDetailModel(true, false);
	}
}
function showDetailModel(flag, reload) {
	if(flag) {
		$('#category').css("display", "none");
		$('#imageDetailModel').css("display", "block");
		if(reload) {
			$('#image_detile_frame').attr('src','imageDetile.html')
		}
	} else {
		$('#category').css("display", "block");
		$('#imageDetailModel').css("display", "none");
	}
}

//alert(image_lsit.totalWidth + image_lsit.totalLeft + isClient);
/*******************version请求*******************************/
function versionRequest(request, form) {
	request.head.bid = "user";
	request.head.fid = "version";
	request.head.typ = "GET";
	request.body = {}
}

function versionResponse(response) {
	if(response.code == "200") {
		var data = response.data;
		banner.dbCount = data.dbCount;
		banner.onlineCount = data.onlineCount;
		banner.selfCount = data.selfCount;
	} else {
		console.log("version Response:" + getMessage(response));
	}
}

function versionException(exception, code, status) {
	console.log("version 请求发送失败:" + exception, code, status);
}

/*******************登录请求*******************************/
function loginRequest(request, form) {
	request.head.bid = "user";
	request.head.fid = "login";
	request.head.typ = "POST";
	request.body = {
		username: form.username,
		password: form.password
	}
}

function loginResponse(response) {
	if(response.code == "200") {
		console.log("login:" + response);

	} else {
		console.log("login Response" + getMessage(response));
	}
}

function loginException(exception, code, status) {
	console.log("login 请求发送失败:" + exception, code, status);
}

/*******************注册请求*******************************/
function registerRequest(request, form) {
	request.head.bid = "user";
	request.head.fid = "register";
	request.head.typ = "POST";
	request.body = {
		username: form.username,
		password: form.password,
		mail: form.mail
	}
}

function registerResponse(response) {
	if(response.code == "200") {
		console.log("register:" + response);

	} else {
		console.log("register Response" + getMessage(response));
	}
}

function registerException(exception, code, status) {
	console.log("register 请求发送失败:" + exception, code, status);
}

/*******************imageList请求*******************************/
function getListRequest(request, form) {
	request.head.bid = "image";
	request.head.fid = "getList";
	request.head.typ = "GET";
	request.body = {
		pageIndex: form.pageIndex,
		pageSize: form.pageSize,
		type: form.type
	}
}


function getListResponse(response) {
	if(response.code == "200") {
		if(response.data){
			for(var i = 0; i < response.data.length; i++) {
				var aspectRatio = response.data[i].width / response.data[i].height;
				var imageurl = IMAGE_URL + response.data[i].headImage;
				var title = response.data[i].title;
				var id = response.data[i].id;
				pushImageList(aspectRatio, imageurl, title, id);
			}
			image_lsit.status = "loaded";
		}else{
			image_lsit.status = "nomore";
		}
	} else {
		console.log("getList Response" + getMessage(response));
		image_lsit.status = "loaded";
	}
}

function getListException(exception, code, status) {
	console.log("getList 请求发送失败:" + exception, code, status);
}

function pushImageList(aspectRatio, imageurl, title, id) {
	image_lsit.$data.pic.push({
		aspectRatioWidth: aspectRatio * 200 + 'px',
		aspectRatioFlex: aspectRatio * 200,
		ipadding: 1 / aspectRatio * 100 + '%',
		imgurl: imageurl,
		title: title,
		listId: id,
		icon: true
	})
}