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
	var scrollTop = $(this).scrollTop();
	var scrollHeight = $(document).height();
	var windowHeight = $(this).height();
	if(scrollTop + windowHeight >= scrollHeight && category.status === 'loaded') {
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
		//		chatRoom: false,
		signin: false,
		signup: false,
		room: '',
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
			if(this.chatstyle == 'block') {
				var content = this.$data.chat;
				var name = this.$data.login_user;
				stompClient.send("/ws/chat", {}, JSON.stringify({
					'name': name,
					'content': content
				}));
				this.$data.chat = "";
			}
		},
		close: function() {
			this.chatstyle = 'none';
		},
		chatroom: function() {
			if(this.$data.login) {
				chatroom();
				this.chatstyle = 'block';
				this.chatCount = "";
			} else {
				this.$Message.warning('pleaase login');
			}
		}
	}
})

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
		category.$data.detile = true;
		if(reload) {
			category.$data.lists = [];
			doPost("getDetile", {
				"id": CHOICED_ID
			});
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
		var content = document.getElementById('content');
		if(name == category.$data.login_user) {
			content.innerHTML = '<h2>' + name + '</h2>' + '&nbsp' + time + "\n" + cont + "\n";
//			category.$data.room += '<h4>' + name + '</h4>' + '&nbsp' + time + "\n" + cont + "\n";
		} else {
			content.innerHTML = '<h2>' + name + '</h2>' + '&nbsp' + time + "\n" + cont + "\n";
//			category.$data.room += '<h4>' + name + '</h4>' + '&nbsp' + time + "\n" + cont + "\n";
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

window.onload = function() {
	var div2 = document.getElementById("chatroom_header");
	div2.onmousedown = function(ev) {
		var oevent = ev || event;
		var distanceX = oevent.clientX - div1.offsetLeft;　　　　
		var distanceY = oevent.clientY - div1.offsetTop;
		document.onmousemove = function(ev) {　　　　　　
			var oevent = ev || event;　　　　　　
			div1.style.left = oevent.clientX - distanceX + 'px';　　　　　　
			div1.style.top = oevent.clientY - distanceY + 'px';　
			ev.stopPropagation();　　　
		}　　　　
		document.onmouseup = function() {
			document.onmousemove = null;　　　　　　
			document.onmouseup = null;　　　　
		}
		ev.stopPropagation();
	}
	var oBox = document.getElementById('div1');
	var b = ''; //声明两个空变量a，b；  
	var a = '';
	oBox.onmouseover = function(ev){
		var iEvent = ev || event;
		var dx = iEvent.clientX; //当你第一次单击的时候，存储x轴的坐标。  
		var dy = iEvent.clientY; //当你第一次单击的时候，储存Y轴的坐标。  
		var dw = oBox.offsetWidth; //存储默认的div的宽度。  
		var dh = oBox.offsetHeight; //存储默认的div的高度。  
		var disright = oBox.offsetLeft + oBox.offsetWidth; //存储默认div右边距离屏幕左边的距离。  
		var distop = oBox.offsetHeight + oBox.offsetTop; //存储默认div上边距离屏幕左边的距离。  
		if(iEvent.clientX > disright - 20 && disright + 20 >iEvent.clientX) { //右
			console.log(iEvent.clientX + "|" + (disright - 20));
			this.style.cursor = "w-resize";
		}else if((iEvent.clientX < oBox.offsetLeft + 20 && oBox.offsetLeft - 20 < iEvent.clientX && iEvent.clientY < oBox.offsetTop + 20 && iEvent.clientY > oBox.offsetTop - 20)||(iEvent.clientY > distop - 20 && distop +20 > iEvent.clientY && iEvent.clientX > disright - 20 && disright + 20 >iEvent.clientX)){
			this.style.cursor = "se-resize";
		}else if(iEvent.clientX < oBox.offsetLeft + 20 && oBox.offsetLeft - 20 < iEvent.clientX) { //左
			this.style.cursor = "w-resize";
		}else if(iEvent.clientY < oBox.offsetTop + 20 && iEvent.clientY > oBox.offsetTop - 20) {//上
			this.style.cursor = "s-resize";
		}else if(iEvent.clientY > distop - 20 && distop +20 > iEvent.clientY) {//下
			this.style.cursor = "s-resize";
		}else if((iEvent.clientX > disright - 20 && disright + 20 >iEvent.clientX && iEvent.clientY < oBox.offsetTop + 20 && iEvent.clientY > oBox.offsetTop - 20)||(iEvent.clientX < oBox.offsetLeft + 20 && oBox.offsetLeft - 20 < iEvent.clientX && iEvent.clientY > distop - 20 && distop +20 > iEvent.clientY)){
			this.style.cursor = "ne-resize";
		}else{
			this.style.cursor = "default";
		}
		
	}
	oBox.onmousedown = function(ev) {
		var iEvent = ev || event;
		var dx = iEvent.clientX; //当你第一次单击的时候，存储x轴的坐标。  
		var dy = iEvent.clientY; //当你第一次单击的时候，储存Y轴的坐标。  
		var dw = oBox.offsetWidth; //存储默认的div的宽度。  
		var dh = oBox.offsetHeight; //存储默认的div的高度。  
		var disright = oBox.offsetLeft + oBox.offsetWidth; //存储默认div右边距离屏幕左边的距离。  
		var distop = oBox.offsetHeight + oBox.offsetTop; //存储默认div上边距离屏幕左边的距离。  
		if(iEvent.clientX > disright - 10 && disright + 10 >iEvent.clientX) { //判断鼠标是否点在右边还是左边
			b = 'right';
		}else if(iEvent.clientX < oBox.offsetLeft + 10 && oBox.offsetLeft - 10 < iEvent.clientX) { //同理  
			b = 'left';
		}else{
			b = '';
		}
		if(iEvent.clientY < oBox.offsetTop + 10 && iEvent.clientY > oBox.offsetTop - 10) {
			a = 'top';
		}else if(iEvent.clientY > distop - 10 && distop +10 > iEvent.clientY) {
			a = 'bottom';
		}else{
			a = '';
		}
		document.onmousemove = function(ev) {
			var iEvent = ev || event;
			if(b == 'right') {
				oBox.style.width = dw + (iEvent.clientX - dx) + 'px';
				//此时的iEvent.clientX的为你拖动时一直改变的鼠标的X坐标  
				if(oBox.offsetWidth <= 10) { //当盒子缩小到一定范围内的时候，让他保持一个固定值，不再继续改变  
					oBox.style.width = '10px';
				}
			}
			if(b == 'left') {
				oBox.style.width = dw - (iEvent.clientX - dx) + 'px'; //iEvent.clientX-dx表示第二次鼠标的X坐标减去第一次鼠标的X坐标，得到绿色移动的距离（为负数），再加上原本的div宽度，就得到新的宽度。 图3  
				oBox.style.left = disright - oBox.offsetWidth + 'px'; //disright表示盒子右边框距离左边的距离，disright-当前的盒子宽度，就是当前盒子距离左边的距离  
				if(oBox.offsetWidth <= 10) {
					oBox.style.width = '10px';
					oBox.style.left = disright - oBox.offsetWidth + 'px'; //防止抖动  
				}
			}
			if(a == 'bottom') {
				oBox.style.height = iEvent.clientY - dy + dh + 'px';
				if(oBox.offsetHeight <= 10) {
					oBox.style.height = '10px';
				}
			}
			if(a == 'top') {
				oBox.style.height = dh - (iEvent.clientY - dy) + 'px'
				oBox.style.top = distop - oBox.offsetHeight + 'px';
				if(oBox.offsetHeight <= 10) {
					oBox.style.height = '10px';
					oBox.style.top = distop - oBox.offsetHeight + 'px';
				}
			}
			ev.stopPropagation();
		}
		document.onmouseup = function() {
			document.onmousedown = null;
			document.onmousemove = null;
		};
		return false;
		ev.stopPropagation();
	}

}

//function bindResize(el) {
////初始化参数   
//var els = el.style,
//  //鼠标的 X 和 Y 轴坐标   
//  x = y = 0;
////邪恶的食指   
//$(el).mousedown(function (e) {
//  //按下元素后，计算当前鼠标与对象计算后的坐标  
//  x = e.clientX - el.offsetWidth, y = e.clientY - el.offsetHeight;
//  //在支持 setCapture 做些东东  
//  el.setCapture ? (
//    //捕捉焦点   
//    el.setCapture(),
//    //设置事件   
//    el.onmousemove = function (ev) {
//      mouseMove(ev || event)
//    },
//    el.onmouseup = mouseUp
//  ) : (
//    //绑定事件   
//    $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
//  )
//  //防止默认事件发生   
//  e.preventDefault()
//});
////移动事件   
//function mouseMove(e) {
//  //宇宙超级无敌运算中... 
//  els.width = e.clientX - x + 'px', //改变宽度
//    els.height = e.clientY - y + 'px' //改变高度 
//}
////停止事件   
//function mouseUp() {
//  //在支持 releaseCapture 做些东东   
//  el.releaseCapture ? (
//    //释放焦点   
//    el.releaseCapture(),
//    //移除事件   
//    el.onmousemove = el.onmouseup = null
//  ) : (
//    //卸载事件   
//    $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
//  )
//}
//}