settings = {};
window.onload = function(){
	setTimeout(scrollTo,0,0,0);
	var getWebpageAsync = true;
	if (arguments[1] == false){
		getWebpageAsync = false;
	}
	$.ajax({
		type: "GET",
		dataType: "json",
		async: getWebpageAsync,
		url: "settings.json",
		success: function(data){
			settings = data;
			if (window.location.hash == ""){
				setHash(data['index']);
			}else{
				handleHash();
				if (!getIfLastNonFloatHashExists() && getIfFloatIsOnStage()){
					getWebpage(data['index']);
				}
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) { 
			alert(errorThrown); 
		} 
	});
}

window.onhashchange = function(){
	$("[data-toggle='popover']").popover('hide');
    handleHash();
}

function handleHash(){
	hash = "";
	try {
    	hash = (!window.location.hash) ? "#!" + data['index'] : decodeURI(window.location.hash);
	}catch (err){
		alert('Failed to get hash. Error details: ' + err.message);
		hash = "#!" + data['index'];
	}
	
	$('#lastHash').val($('#currentHash').val());
	$('#currentHash').val(hash);
	lastHash = getLastHash();
	lastHashArray = lastHash.split("?");
    var handlecase = hash.split('?');
	if (handlecase[0] != lastHashArray[0]) $('.modal').modal('hide');
	lastIncludedPage = $('#lastIncludedPage').val();
	var page = handlecase[0].substr(2);
	getWebpage(page);
	changeActiveStatusByName(page);
}