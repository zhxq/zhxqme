<?php
// For Debug
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
# error_reporting(E_ALL);
require_once('Spyc.php');

$supported_exts = ['.yaml', '.yml', '.json'];

$resumate_version = "0.0.4";
$currentLang = currentLang();

function dieVars($confirmed, $success, $message, $extra=null){
	$returnData = array("confirmed" => $confirmed, 'success' => $success, 'confirmString' => $message, 'data' => $extra);
	dieJSON($returnData);
}

function dieJSON($array){
	$echoJSON = json_encode($array);
	if ($echoJSON != NULL){
		die($echoJSON);
	}else{
		die(json_encode(array('confirmed' => false, 'success' => false, 'confirmString' => 'Invalid arguments for dieJSON().')));
	}
}

function loadfile($dirlist, $filename, &$defFromDir){
    foreach ($dirlist as $dir){
        $fullname = $dir . $filename;
        if (file_exists($fullname) && ($fp = fopen($fullname, "r")) !== false){
            $payload = file_get_contents($fullname);
            fclose($fp);
            $defFromDir = $dir;
            return $payload;
        }
    }
    return false;
}

function isAssoc(array $arr){
    if (array() === $arr) return false;
    return array_keys($arr) !== range(0, count($arr) - 1);
}

function checkAbsPath($path){
    if (substr($path, 0, 2) == "//" || substr($path, 0, 7) == "http://" || substr($path, 0, 8) == "https://"){
        return true;
    }
    return false;
}

function loadSettings($dir='./', $target='resumate_settings'){
    global $supported_exts;
    if (!array_key_exists($target, $GLOBALS)){
        $get_success = false;
        foreach ($supported_exts as $ext){
            $data = loadfile([$dir], "settings$ext", $dir);
            if ($data !== false){
                if ($ext == ".json"){
                    $GLOBALS[$target] = json_decode($data, true);
                }else{
                    $GLOBALS[$target] = spyc_load($data);
                }
                $get_success = true;
                break;
            }
        }
        if (!$get_success){
            return false;
        }
    }
    return $GLOBALS[$target];
}

function getSetting($key){
    $settings = loadSettings();
    return $settings[$key];
}

function getThemeSetting($key){
    $theme = getSetting('theme');
    $settings = loadSettings("./themes/$theme/", 'theme_settings');
    return $settings[$key];
}

function getLocalizedSetting($key){
    return getLocalizedString(getSetting($key));
}

function getLangFile($lang){
    $langFile = getSetting('lang')[$lang]['file'];
    $lang = [];
    if (substr($langFile, -5) == ".json"){
        $lang = json_decode(file_get_contents('./definitions/lang/' . $langFile), true);
    }else{
        $lang = spyc_load_file('./definitions/lang/' . $langFile);
    }
    
    if ($lang['type'] == ''){
        die("File $langFile error: Unable to parse JSON, or failed to open file.");
    }
    if (!array_key_exists('vars', $lang)){
        $lang['vars'] = [];
    }
    return $lang['vars'];
}

function check_var($input){
    if (gettype($input) != gettype('')) return false;
    if (strlen($input) > 1 && $input[0] == '$' && $input[-1] == '$'){
        return substr($input, 1, -1);
    }
    return false;
}

function getLocalizedString($str){
    if (($keyname = check_var($str)) !== false){
        $langVars = getLangFile(currentLang());
        if (array_key_exists($keyname, $langVars)){
            return $langVars[$keyname];
        }else{
            return $str;
        }
    }else{
        return $str;
    }
}

function getLangList(){
    return array_keys(getSetting('lang'));
}

function getCookieTimeYears($year){
    return time()+60*60*24*365*$year;
}

function getLongCookieTime(){
    return getCookieTimeYears(100);
}

function currentLang(){
    $defaultLang = getSetting('defaultlang');
    $allLang = getLangList();
    $cookieLife = getLongCookieTime();
    if (!array_key_exists('lang', $_COOKIE)){
        $acceptLang = explode(',', str_replace(' ', '', strtolower($_SERVER['HTTP_ACCEPT_LANGUAGE'])));
        foreach ($acceptLang as $entry){
            $tempLang = explode(';', $entry)[0];
            foreach($allLang as $curLang){
                if ($tempLang == $curLang){
                    setcookie("lang", $tempLang, $cookieLife);
                    return $tempLang;
                }
            }
            //fuzzy search
            //try the main language
            $mainLang = explode('-', $tempLang)[0];

            foreach($allLang as $curLang){
                $allMainLang = explode('-', $curLang)[0];
                if ($mainLang == $allMainLang){
                    setcookie("lang", $mainLang, $cookieLife);
                    return $mainLang;
                }
            }
        }
        setcookie("lang", $defaultLang, $cookieLife);
        return $defaultLang;
    }else{
        $gotcookie = $_COOKIE['lang'];
        if (in_array($gotcookie, $allLang)){
            return $gotcookie;
        }else{
            setcookie("lang", $defaultLang, $cookieLife);
            return $defaultLang;
        }
    }
}

function array_merge_recursive_distinct(array &$array1, array &$array2){
    $merged = $array1;
    foreach ($array2 as $key => &$value){
        if (is_array($value) && isset($merged[$key]) && is_array($merged [$key])){
            $merged[$key] = array_merge_recursive_distinct($merged[$key], $value);
        }else{
            $merged[$key] = $value;
        }
    }
    return $merged;
}
?>