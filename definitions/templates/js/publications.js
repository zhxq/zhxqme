async function copyBibTeX(elmt){
    console.log($(elmt).data('bib'));
    var data = $(elmt).data('bib');
    if (data == ''){
        alert('BibTeX information is not available yet.');
        return;
    }
    try {
        await navigator.clipboard.writeText(data);
    } catch (err) {
        console.error('Failed! ', err);
    }
}