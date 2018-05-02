var IMAGE_URL = 'http://13.250.226.195:8888/dbImage/';
//var WS_URL = "ws://127.0.0.1:8080/ws";
var WS_URL = "ws://13.250.226.195:8080/ws";
var isClient = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
var listNum = 0;
var chatConnect = 0;
var CHOICED_ID;
var stompClient = null;
$(function() {
	doPost('version');
	getimageList();
	connect();
	//	bindResize(document.getElementById('div1'));
	//	doPost("register",{"username":"333","password":"22","mail":"406644209@qq.com"});
	//	doPost('login',{"username":"111","password":"123"});
})

function getimageList() {
	category.$data.status = "loading";
	doPost("getList", {
		"pageIndex": String(listNum),
		"pageSize": "10",
		"type": "0"
	});
	listNum++;
}

$(window).scroll(function() {
	var sTop = $(this).scrollTop();
	var sHeight = $(document).height();
	var windowHeight = $(this).height();
	if(sTop + windowHeight >= sHeight && category.status === 'loaded') {
		getimageList();
	}
});

window.onbeforeunload = function() {
	//刷新后页面自动回到顶部
	document.documentElement.scrollTop = 0; //ie下
	document.body.scrollTop = 0; //非ie
}

var category = new Vue({
	el: '#category',
	data: {
		chatstyle: 'none',
		signin: false,
		signup: false,
		chat: '',
		signinForm: {
			username: '',
			password: ''
		},
		signupForm: {
			signusername: '',
			signpassword: '',
			mail: ''
		},
		ruleInline: {
			username: [{
				required: true,
				message: 'Please fill in the user name',
				trigger: 'blur'
			}],
			password: [{
					required: true,
					message: 'Please fill in the password.',
					trigger: 'blur'
				},
				{
					type: 'string',
					min: 3,
					message: 'The password length cannot be less than 3 bits',
					trigger: 'blur'
				}
			]
		},
		ruleInSignup: {
			signusername: [{
				required: true,
				message: 'Please fill in the user name',
				trigger: 'blur'
			}],
			signpassword: [{
					required: true,
					message: 'Please fill in the password.',
					trigger: 'blur'
				},
				{
					type: 'string',
					min: 3,
					message: 'The password length cannot be less than 3 bits',
					trigger: 'blur'
				}
			],
			mail: [{
				required: true,
				message: 'Please fill in the mail.',
				trigger: 'blur'
			}]
		},
		onlineCount: "", //banner
		dbCount: "",
		selfCount: "",
		self_count: false,
		login: false,
		login_user: '欢迎',
		chatCount: '',
		menu: true,
		totalWidth: isClient ? '100%' : '70%', //image_list
		totalLeft: isClient ? 0 : '15%',
		pic: [],
		status: 'loaded',
		lists: [], //image_detile
		detile: false
	},
	methods: {
		signin_click: function(name) {
			if(this.$data.signup) {
				this.$data.signup = false;
			} else {
				this.$refs[name].validate(function(valid) {
					if(valid) {
						doPost('login', category.$data.signinForm);
						this.$Message.success('Success!');
					}
				})
			}
		},
		signup_click: function(name) {
			if(!this.$data.signup) {
				this.$data.signup = true;
			} else {
				this.$refs[name].validate(function(valid) {
					if(valid) {
						doPost('register', category.$data.signupForm);
					}
				})
			}
		},
		load: function() {
			if(this.$data.status === 'loaded') {
				getimageList();
			}
		},
		login_click: function() {
			this.signin = true;
		},
		imageclick: function(index) {
			showDetail(index);
		},
		iconClick: function(e, index) {
			e.stopPropagation(); //阻止冒泡，防止触发父级div的click事件
			if(this.$data.pic[index].icon) {
				this.$data.pic[index].icon = false;
			} else {
				this.$data.pic[index].icon = true;
			}
		},
		back: function() {
			showDetailModel(false, false)
		},
		menu_show: function() {
			this.$data.menu = !this.$data.menu;
		},
		ok: function() {
			send();
		},
		sendMess: function(ev){
			if(ev.keyCode==13 && ev.ctrlKey){
				send();
			}
		},
		chatroom: function() {
			if(this.$data.login) {
				chatroom();
				var as = document.getElementById('drag');
				as.style.display = "block";
				this.$data.chatstyle = 'block';
				this.$data.chatCount = "";
			} else {
				this.$Message.warning('pleaase login');
			}
		}
	}
})

//						<a  :title="index.chatname">
//						</a>
//<p class="chat-time">{{ index.time }}</p>
var dragcc = new Vue({
	el: '#drag_content',
	template: `<div id="drag_content" class="content">
					<ul class="chat-thread">
							<li v-for="index in chatContent" :class="index.showli">{{ index.content }}
							</li>
					</ul>
				</div>`,
	data: {
		chatContent:[]
	},
	updated: function(){
		var content = document.getElementById('drag_content');
		content.scrollTop = content.scrollHeight;
//		alert(1);
	}
})

function send(){
	if(category.chatstyle == 'block') {
		if(category.$data.chat){
			var content = category.$data.chat;
			var name = category.$data.login_user;
			stompClient.send("/ws/chat", {}, JSON.stringify({
				'name': name,
				'content': content
			}));
			category.$data.chat = "";					
		}else{
			category.$Message.warning("can not send empty");
		}
	}
}

function showDetail(index) {
	if(index != CHOICED_ID) {
		CHOICED_ID = index;
		showDetailModel(true, true);
	} else {
		showDetailModel(true, false);
	}
}

function showDetailModel(flag, reload) {
	if(flag) {
//		$('#category').css("display", "none");
		$('#imageDetailModel').css("display", "block");
		category.$data.detile = true;
		if(reload) {
			$('#image_detile_frame').attr('src','imageDetile.html')
			category.$data.lists = [];
			doPost("getDetile", {"id": CHOICED_ID});
		}
	} else {
//		$('#category').css("display", "block");
		$('#imageDetailModel').css("display", "none");
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
		versionData(data, 1);
	} else {
		console.log("version Response:" + getMessage(response));
	}
}

function versionData(data, flag) {
	category.dbCount = data.dbCount;
	category.onlineCount = data.onlineCount;
	if(flag) {
		category.selfCount = data.selfCount;
		if(data.name != "guest") {
			category.$Message.success("欢迎回来" + data.name);
			category.$data.self_count = true;
			category.$data.login = true;
			category.$data.login_user = data.name;
		}
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
		category.$data.login = true;
		category.$data.signin = false;
		category.$data.self_count = true;
		chatroom();
		doPost('version');
	} else {
		category.$Message.error(getMessage(response));
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
		username: form.signusername,
		password: form.signpassword,
		mail: form.mail
	}
}

function registerResponse(response) {
	if(response.code == "200") {
		console.log("register:" + response);
		category.$Message.success(getMessage(response));
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
		if(response.data) {
			for(var i = 0; i < response.data.length; i++) {
				var aspectRatio = response.data[i].width / response.data[i].height;
				var imageurl = IMAGE_URL + response.data[i].headImage;
				var title = response.data[i].title;
				var id = response.data[i].id;
				pushImageList(aspectRatio, imageurl, title, id);
			}
			category.status = "loaded";
		} else {
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

function getDetileRequest(request, form) {
	request.head.bid = "image";
	request.head.fid = "getDetail";
	request.head.typ = "GET";
	request.body = {
		id: form.id
	}
}

function getDetileResponse(response) {
	if(response.code == "200") {
		if(response.data) {
			for(var i = 0; i < response.data.length; i++) {
				category.$data.lists.push({
					imgurl: IMAGE_URL + response.data[i].url,
					id: response.data[i].imageListId
				})
			}
		}

	}
}

//socket连接 默认订阅/topic/getResponse 来获取version的更新
function connect() {
	stompClient = Stomp.client(WS_URL); //1连接SockJS的endpoint
	stompClient.connect({}, function(frame) { //3连接webSocket的服务端。
		console.log('开始进行连接Connected: ' + frame);
		//通过stompClient.subscribe（）订阅服务器的目标是'/topic/getResponse'发送过来的地址，与@SendTo中的地址对应。
		stompClient.subscribe('/topic/version', function(respnose) {
			var da = JSON.parse(respnose.body);
			if(da.type == "version") {
				versionData(da.data, 0);
			} else {
				console.log(da);
			}
		});
		chatroom();
	});
}

//聊天室订阅
function chatroom() {
	if(!chatConnect && category.$data.login) {
		stompClient.subscribe('/topic/chatRoom', function(respnose) {
			if(category.$data.chatstyle == 'none') {
				if(!category.$data.chatCount) {
					category.$data.chatCount = 1;
				} else {
					category.$data.chatCount += 1;
				}
			}
			showResponse(JSON.parse(respnose.body));
		});
		chatConnect++;
	}
}

function showResponse(res) {
	if(res.type == "chat") {
		var name = res.data.name;
		var cont = res.data.content;
		var time = getDate(res.data.timestamp);
		time = timeStamp2String(time, "yyyy-MM-dd hh:mm:ss");
		var content = document.getElementById('drag_content');
		if(name == category.$data.login_user) {
			dragcc.$data.chatContent.push({
				showli: 'myself',
				content: cont,
//				chatname: name,
				time: time
			})
//			content.innerHTML = '<h2>' + name + '</h2>' + '&nbsp' + time + "\n" + cont + "\n";
//			category.$data.room += '<h4>' + name + '</h4>' + '&nbsp' + time + "\n" + cont + "\n";
		} else {
			dragcc.$data.chatContent.push({
				content: cont,
				showli: 'others',
//				chatname: name,
				time: time
			})
		}
	}
}

/**
 * 字符串日期转日期
 * @param {Object} strDate
 */
function getDate(strDate) {
	if(strDate != null && strDate != undefined && strDate != "") {
		var date = eval('new Date(' + strDate.replace(/\d+(?=-[^-]+$)/,
			function(a) {
				return parseInt(a, 10) - 1;
			}).match(/\d+/g) + ')');
		return date;
	}
	return "";
}

/**
 *  时间转换函数
 * @param time 输入日期
 * @param formatStr 转换日期的格式 "yyyy-MM-dd hh:mm:ss.S"
 */
function timeStamp2String(time, formatStr) {
	if(time != null && time != undefined && time != 0) {
		var datetime = new Date(time);
		return datetime.Format(formatStr);
	}
	return "";
}

Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

//私聊 订阅自己 登录时
function connectUser(username) {
	//通过stompClient.subscribe（）订阅服务器的目标是'/user/' + userId + '/msg'接收一对一的推送消息,其中userId由服务端传递过来,用于表示唯一的用户,通过此值将消息精确推送给一个用户
	stompClient.subscribe('/user/' + username + '/msg', function(respnose) {
		console.log(respnose);
	});
}