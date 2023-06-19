function picwithexif_call(id){
    EXIF.getData(document.getElementById(id), function(){var tags=EXIF.getTag(this, "Make") + EXIF.getTag(this, "Model") + EXIF.getTag(this, "FocalLength") + EXIF.getTag(this, "ShutterSpeedValue") + EXIF.getTag(this, "FNumber") + EXIF.getTag(this, "ApertureValue");$('#", "$_pwexif_template_id$", "_exif').html(tags);});
}