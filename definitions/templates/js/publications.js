function copyBibTeX(elmt){
    var data = $(elmt).data('bib');
    var lastElmt = $('.publications-copied-label', elmt);
    if (data == ''){
        alert('BibTeX information is not available yet.');
        return;
    }
    try {
        navigator.clipboard.writeText(data);
        lastElmt.addClass('publications-copying');
        const animated = document.querySelector(".publications-copying");
        animated.addEventListener("animationend", () => {
            lastElmt.removeClass('publications-copying');
        });
    } catch (err) {
        console.error('Failed! ', err);
        return false;
    }
}


$(document).live('load', '.presentation-slides-button', function(){
    var href = $(this).attr('href');
    console.log(href);
    if (href == '' || href == undefined){
        $(this).css('display', 'none');
    }
});