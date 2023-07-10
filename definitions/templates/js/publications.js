async function copyBibTeX(elmt){
    var data = $(elmt).attr('data-bib');
    if (data == ''){
        alert('BibTeX is not available yet.');
        return;
    }
    try {
        await navigator.clipboard.writeText(data);
    } catch (err) {
        console.error('Failed! ', err);
    }
}