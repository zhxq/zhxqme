function copyBibTeX(elmt){
    var data = $(elmt).data('bib');
    var lastElmt = $('.publications-copied-label', elmt);
    if (data == ''){
        alert('BibTeX information is not available yet.');
        return;
    }
    try {
        navigator.clipboard.writeText(data);
        lastElmt.removeClass('publications-copied-label').removeClass('publications-copying').addClass('publications-copying');
    } catch (err) {
        console.error('Failed! ', err);
        return false;
    }
}