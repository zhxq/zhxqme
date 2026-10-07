settings = {};



window.onload = function(){
	var getWebpageAsync = true;
	if (arguments[1] == false){
		getWebpageAsync = false;
	}
	var files = ["settings.yaml", "settings.yml", "settings.json"];

    function loadSettings(index) {
        var isYaml = index < 2;

        $.ajax({
            type: "GET",
            dataType: isYaml ? "text" : "json",
            async: getWebpageAsync,
            url: files[index],

            success: function (data) {
                if (isYaml) {
                    try {
                        data = jsyaml.load(data);
                    } catch (error) {
                        alert("Failed to parse " + files[index] + ": " + error.message);
                        return;
                    }
                }

                settings = data;

                if (window.location.hash == "") {
                    setHash(data["index"]);
                } else {
                    handleHash();

                    if (!getIfLastNonFloatHashExists() && getIfFloatIsOnStage()) {
                        getWebpage(data["index"]);
                    }
                }
            },

            error: function (xhr, textStatus, errorThrown) {
                // Try the next file only when this one does not exist.
                if (xhr.status === 404 && index < files.length - 1) {
                    loadSettings(index + 1);
                    return;
                }

                alert(
                    "Failed to load " + files[index] + ": " +
                    (errorThrown || textStatus)
                );
            }
        });
    }

    loadSettings(0);
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

// Toggle dark mode automatically
// https://getbootstrap.com/docs/5.3/customize/color-modes/#javascript


const getStoredTheme = () => localStorage.getItem('theme');
const setStoredTheme = theme => localStorage.setItem('theme', theme);

const getPreferredTheme = () => {
	const storedTheme = getStoredTheme();
	if (storedTheme) {
		return storedTheme;
	}

	const originalDefault = $('html').attr("data-bs-theme");

	if (originalDefault != '' && ['dark', 'light', 'auto'].includes(originalDefault)){
		return $('html').attr("data-bs-theme");
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const setTheme = theme => {
	if (theme === 'auto') {
		theme = (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		document.documentElement.setAttribute('data-bs-theme', theme);
	} 
	document.documentElement.setAttribute('data-bs-theme', theme);
	showActiveTheme(getPreferredTheme());
}

const showActiveTheme = (theme) => {
	$('#appearanceToggle').prop('checked', theme === 'dark');
}


(() => {
  'use strict';
  setTheme(getPreferredTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme());
    }
  })

  window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme());

	$("#appearanceToggle").on('change', function() {
		const theme = this.checked ? 'dark' : 'light';
		setStoredTheme(theme);
		setTheme(theme);
		this.blur();
	});
  })
})();