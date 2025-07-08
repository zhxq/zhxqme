function picwithexif_getInvert(num){
    if (num >= 1){
        return num;
    }else if (num > 0){
        return "1/" + Math.round((1 / num));
    }else{
        return num;
    }
}

function appleVersion() {
    if (
        /iP(hone|od|ad)/.test(navigator.userAgent) || 
        navigator.userAgent.includes("Macintosh") || 
        navigator.userAgent.includes("Mac OS X")
    ) {
        var systemVersion = (navigator.userAgent).match(/(\d+)_(\d+)_?(\d+)?/) ?? ['0', '0', '0', '0'];
        var safariVersion = (navigator.userAgent).match(/Version\/(\d+).(\d+).?(\d+)?/) ?? ['0', '0', '0', '0'];
        // Some quirks about Safari: may report incorrect OS version but correct Safari version
        // Found on iPad OS 26 Developer Beta 3 (System=10.15.7, Safari=26.0)
        return [parseInt(systemVersion[1], 10), parseInt(safariVersion[1], 10)];
    }
    return [0, 0];
}

function picwithexif_call(id){    
    var element = document.getElementById(id + '_pic');
    if (!navigator.userAgent.includes('Chrome') && navigator.userAgent.includes('Safari')) {
        // Fix Safari false positive when the system is older than iOS/macOS 26
        if (appleVersion()[0] < 26 && appleVersion()[1] < 26){
            $(element.parentElement.firstChild).attr("srcset", "");
        }
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