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


$(function() {
    var parentTag = $(".publications_item_entry");
    console.log(parentTag);
    [['paper-link', 'href'], ['presentation-slides', 'href'], ['presentation-video', 'href'], ['publication-code', 'href'], ['bibtex-copy', 'data-bib']].forEach(element => {var selected = $($(parentTag).find(`.${element[0]}-button`)[0]); if (selected.attr(element[1]) == '' || selected.attr(element[1]) == undefined){selected.css('display', 'none');selected.next().css('display', 'none')}});
});