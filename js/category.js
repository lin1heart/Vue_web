var banner = new Vue({
	el: '#banner_full',
	data:{
		onlineCount: 1,
		dbCount: 2,
		selfCount: 3
	}
})

$(function(){
	console.log(1);
	$.ajax({
		type:"GET",
		url:"http://127.0.0.1:8080/user/version",
		async:true,
		data: "",
		success: function(a,b,c){
			console.log(a,b,c);
		},
		error: function(a,b,c){
			console.log(123);
		}
	});
})
