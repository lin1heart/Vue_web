$(function() {
	doPost("getDetile", {"id": parent.CHOICED_ID});
})

var image_detile = new Vue({
	el:'#image_detile',
	data:{
		lists:[]
	},
	methods:{
		back: function(){
			parent.showDetailModel(false,false)
		}
	}
})


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
				image_detile.$data.lists.push({
					imgurl: parent.IMAGE_URL + response.data[i].url,
					id: response.data[i].imageListId
				})
			}
		}
		
	}
}