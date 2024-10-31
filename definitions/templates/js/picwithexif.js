function picwithexif_getInvert(num){
    if (num >= 1){
        return num;
    }else if (num > 0){
        return "1/" + Math.round((1 / num));
    }else{
        return num;
    }
}

function picwithexif_call(id){    
    var element = document.getElementById(id + '_pic');
    if (!navigator.userAgent.includes('Chrome') && navigator.userAgent.includes('Safari')) {
        // Fix Safari false positive
        $(element.parentElement.firstChild).attr("srcset", "");
    }
    var currentSrc = element.currentSrc;
    var newElmt = document.createElement("img");
    newElmt.src = currentSrc;
    window.exifr.parse(newElmt).then(function(exif){
        var make = exif.Make;
        var model = exif.Model;
        if (model.startsWith(make)){
            make = '';
        }
        var tags = make + ' ' + model + ' ' + exif.FocalLength + "mm " + picwithexif_getInvert(exif.ExposureTime) + 's f/' + exif.FNumber;
        $('#' + id + '_exif').html(tags);
    });
    var parentLink = element.parentElement.parentElement;
    parentLink.setAttribute("href", currentSrc);
    element.setAttribute("onload", "");
}