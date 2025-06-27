settings = {};
window.onload = function(){
	setTimeout(scrollTo,0,0,0);
	var getWebpageAsync = true;
	if (arguments[1] == false){
		getWebpageAsync = false;
	}
	$.ajax({
		type: "GET",
		dataType: "json",
		async: getWebpageAsync,
		url: "settings.json",
		success: function(data){
			settings = data;
			if (window.location.hash == ""){
				setHash(data['index']);
			}else{
				handleHash();
				if (!getIfLastNonFloatHashExists() && getIfFloatIsOnStage()){
					getWebpage(data['index']);
				}
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) { 
			alert(errorThrown); 
		} 
	});
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
(() => {
  'use strict'

  const getStoredTheme = () => localStorage.getItem('theme')
  const setStoredTheme = theme => localStorage.setItem('theme', theme)

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
      return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const setTheme = theme => {
    if (theme === 'auto') {
      document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  setTheme(getPreferredTheme())

  const showActiveTheme = (theme, focus = false) => {
    const themeSwitcher = document.querySelector('#bd-theme')

    if (!themeSwitcher) {
      return
    }

    const themeSwitcherText = document.querySelector('#bd-theme-text')
    const activeThemeIcon = document.querySelector('.theme-icon-active use')
    const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
    const svgOfActiveBtn = btnToActive.querySelector('svg use').getAttribute('href')

    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.classList.remove('active')
      element.setAttribute('aria-pressed', 'false')
    })

    btnToActive.classList.add('active')
    btnToActive.setAttribute('aria-pressed', 'true')
    activeThemeIcon.setAttribute('href', svgOfActiveBtn)
    const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`
    themeSwitcher.setAttribute('aria-label', themeSwitcherLabel)

    if (focus) {
      themeSwitcher.focus()
    }
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme())
    }
  })

  window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme())

    document.querySelectorAll('[data-bs-theme-value]')
      .forEach(toggle => {
        toggle.addEventListener('click', () => {
          const theme = toggle.getAttribute('data-bs-theme-value')
          setStoredTheme(theme)
          setTheme(theme)
          showActiveTheme(theme, true)
        })
      })
  })
})()