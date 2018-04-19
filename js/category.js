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
	category.$data.status = "loading";
	doPost("getList", {
		"pageIndex": String(listNum),
		"pageSize": "10",
		"type": "0"
	});
	listNum++;
}

$(window).scroll(function() {
	var scrollTop = $(this).scrollTop();
	var scrollHeight = $(document).height();
	var windowHeight = $(this).height();
	if(scrollTop + windowHeight >= scrollHeight &&category.status === 'loaded') {
		getimageList();
	}
});

window.onbeforeunload = function(){
      //刷新后页面自动回到顶部
    document.documentElement.scrollTop = 0;  //ie下
    document.body.scrollTop = 0;  //非ie
 }

var category = new Vue({
	el: '#category',
	data: {
		onlineCount: "", //banner
		dbCount: "",
		selfCount: "",
		totalWidth: isClient ? '100%' : '70%',//image_list
		totalLeft: isClient ? 0 : '15%',
		pic: [],
		status: 'loaded',
		lists:[],//image_detile
		detile: false
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
		},
		back: function(){
			showDetailModel(false,false)
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
		category.$data.detile = true;
		if(reload) {
			category.$data.lists = [];
			doPost("getDetile", {"id": CHOICED_ID});
		}
	} else {
		category.$data.detile = false;
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
		category.dbCount = data.dbCount;
		category.onlineCount = data.onlineCount;
		category.selfCount = data.selfCount;
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
			category.status = "loaded";
		}else{
			category.status = "nomore";
		}
	} else {
		console.log("getList Response" + getMessage(response));
		category.status = "loaded";
	}
}

function getListException(exception, code, status) {
	console.log("getList 请求发送失败:" + exception, code, status);
}

function pushImageList(aspectRatio, imageurl, title, id) {
	category.$data.pic.push({
		aspectRatioWidth: aspectRatio * 200 + 'px',
		aspectRatioFlex: aspectRatio * 200,
		ipadding: 1 / aspectRatio * 100 + '%',
		imgurl: imageurl,
		title: title,
		listId: id,
		icon: true
	})
}


/*******************imageDetile请求*******************************/

function getDetileRequest(request,form){
	request.head.bid = "image";
	request.head.fid = "getDetail";
	request.head.typ = "GET";
	request.body = {
		id: form.id
	}
}

function getDetileResponse(response){
	if(response.code == "200") {
		if(response.data){
			for(var i = 0; i < response.data.length; i++) {
				category.$data.lists.push({
					imgurl: IMAGE_URL + response.data[i].url,
					id: response.data[i].imageListId
				})
			}
		}
		
	}
}
