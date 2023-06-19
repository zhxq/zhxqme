function picwithexif_call(id){
    EXIF.getData(document.getElementById(id + '_pic'), function(){var tags=EXIF.getTag(this, "Make") + EXIF.getTag(this, "Model") + EXIF.getTag(this, "FocalLength") + EXIF.getTag(this, "ShutterSpeedValue") + EXIF.getTag(this, "FNumber") + EXIF.getTag(this, "ApertureValue");$('#' + id + '_exif').html(tags);});
}