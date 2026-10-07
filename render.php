<?php
require_once('func.php');
header("X-Parsed-By: Resumate $resumate_version - Build your page using JSON. https://resumate.io/");

$file = $_POST['filename'];
$theme = getSetting('theme');

$payload = "";
$used_ext_page = "";
foreach ($supported_exts as $ext){
    $payload = file_get_contents('./definitions/pages/' . $file . $ext);
    if ($payload !== false){
        $used_ext_page = $ext;
        break;
    }
}

$usedCSS = [];
$usedJS = [];
$onloadJS = [];
if ($used_ext_page == ".json"){
    $payload = json_decode($payload, true);
}else{
    $payload = spyc_load($payload);
}

if ($payload['type'] == ''){
    dieVars(false, false, '', ['html'=>"File $file $used_ext_page error: Unable to parse JSON/YAML, or failed to open file.", 'js'=>[]]);
}

$definition = [];
$loaddir = ['./', "./themes/$theme/definitions/pages/", "./themes/$theme/definitions/blocks/", "./themes/$theme/definitions/templates/", "./themes/$theme/definitions/html/", './definitions/pages/', './definitions/blocks/', './definitions/templates/', './definitions/html/'];

dieVars(true, true, '', parse($payload));

function parse($payload){
    global $usedCSS;
    global $usedJS;
    global $onloadJS;


    $varsCurLevel = [];
    $css_list = '';
    $langVars = getLangFile(currentLang());

    $varsCurLevel = array_merge($varsCurLevel, $langVars);

    if (!array_key_exists('content', $payload)){
        $payload['content'] = [];
    }
    if (!array_key_exists('vars', $payload)){
        $payload['vars'] = [];
    }

    $html = parse_all([$payload], $varsCurLevel, $payload['vars'], $payload['content']);

    $usedCSS = array_unique($usedCSS);
    $usedJS = array_unique($usedJS);
    $onloadJS = array_unique($onloadJS);
    
    foreach ($usedCSS as $css){
        $css_list .= "<link rel=\"stylesheet\" href=\"$css\">";
    }
    return ['html'=>$css_list . $html, 'js'=>$usedJS];
}

function wrap_var_signs($key){
    return "$$key$";
}


function parse_all($payload, $varsPrevLevel, $varsFromPayload, $content = ''){
    global $loaddir;
    global $usedCSS;
    global $usedJS;
    global $definition;
    global $supported_exts;

    if ($payload === null) return "";

    $html = '';
    $varsCurLevel = array_merge($varsPrevLevel, $varsFromPayload);

    $varsCurLevel['content'] = $content;

    # Payload can be either a single string,
    # a simple list, or a dictionary.    
    if (gettype($payload) == gettype('')){
        # For a single string,
        # We try to find all defined macros.
        # Want to use the dollar sign? Use &dollar;
        $pattern = '/\$(.+?)\$/';
        $matches = [];
        $varsInStr = preg_match_all($pattern, $payload, $matches);
        $varParsed = '';
        
        foreach ($matches[1] as $varNameToSearch){
            if (array_key_exists($varNameToSearch, $varsCurLevel)){
                $varParsed = parse_all($varsCurLevel[$varNameToSearch], $varsCurLevel, []);
                $payload = str_replace(wrap_var_signs($varNameToSearch), $varParsed, $payload);
            }
        }

        $html .= $payload;
    }elseif ($payload['name'] == null && !isAssoc($payload)){
        foreach ($payload as $elmt){
            $html .= parse_all($elmt, $varsCurLevel, [], $content);
        }
    }elseif ($payload['name'] != null){
        $oldName = $payload['name'];
        $payload['name'] = parse_all($payload['name'], $varsCurLevel, []);

        if (!array_key_exists($payload['name'], $definition)){
            # Load definition from JSON file
            $defFromDir = '';
            $used_ext = "";
            foreach ($supported_exts as $ext){
                $result = loadfile($loaddir, $payload['name'] . $ext, $defFromDir);
                if ($result !== false){
                    $used_ext = $ext;
                    break;
                }
            }
            
            if ($result === false){
                dieVars(false, false, '', ['html'=>'Failed to open ' . $payload['name'] . '.json for parsing.', 'js'=>[]]);
            }

            if ($used_ext == ".json"){
                $definition[$payload['name']] = json_decode($result, true);
            }else{
                $definition[$payload['name']] = spyc_load($result);
            }
            
            if (!array_key_exists('css', $definition[$payload['name']])){
                $definition[$payload['name']]['css'] = [];
            }
            foreach ($definition[$payload['name']]['css'] as $css){
                $cfile = '';
                if (checkAbsPath($css)){
                    $cfile = $css;
                }else{
                    $cfile = $defFromDir . $css;
                }
                array_push($usedCSS, $cfile);
            }
            if (!array_key_exists('js', $definition[$payload['name']])){
                $definition[$payload['name']]['js'] = [];
            }
            foreach ($definition[$payload['name']]['js'] as $js){
                $jfile = '';
                if (checkAbsPath($js)){
                    $jfile = $js;
                }else{
                    $jfile = $defFromDir . $js;
                }
                array_push($usedJS, $jfile);
            }
            if (!array_key_exists('default', $definition[$payload['name']])){
                $definition[$payload['name']]['default'] = [];
            }
            if (!array_key_exists('attr', $definition[$payload['name']]['default'])){
                $definition[$payload['name']]['default']['attr'] = [];
            }
            if (!array_key_exists('content', $definition[$payload['name']]['default'])){
                $definition[$payload['name']]['default']['content'] = [];
            }
        }
        $def = $definition[$payload['name']];
        if (!array_key_exists('content', $payload)){
            $payload['content'] = [];
        }
        if (!array_key_exists('vars', $payload)){
            $payload['vars'] = [];
        }
        if (!array_key_exists('attr', $payload)){
            $payload['attr'] = [];
        }

        if (!array_key_exists('vars', $def)){
            $def['vars'] = [];
        }

        $start = '';
        $end = '';

        if ($def['type'] == 'def'){
            $start = '<' . $def['html'];
            $attrEnv = array_merge_recursive_distinct($def['attr'], $def['default']['attr']);
            $attrEnv = array_merge_recursive_distinct($attrEnv, $payload['attr']);

            $attrStr = "";
            foreach ($attrEnv as $k=>$v){
                if ($k == "style"){
                    $tmp = '';
                    foreach ($v as $sk=>$sv){
                        $svParsed = parse_all($sv, $varsCurLevel, 
                        array_merge($def['vars'], $payload['vars']), '');
                        if ($svParsed != null) $tmp .= "$sk: $svParsed; ";
                    }
                    $tmp = substr($tmp, 0, -1);
                    if ($tmp != '') $attrStr .= " style=\"$tmp\"";
                }elseif ($k == "class"){
                    $d = trim(implode(' ', $v));
                    $d = parse_all($d, $varsCurLevel, 
                        array_merge($def['vars'], $payload['vars']), '');
                    $tmp = 'class="' . $d . '"';
                    if ($d != '') $attrStr .= " $tmp";
                }else{
                    $k = parse_all($k, $varsCurLevel, array_merge($def['vars'], $payload['vars']), '');
                    $v = parse_all($v, $varsCurLevel, array_merge($def['vars'], $payload['vars']), '');
                    $attrStr .= " $k=\"$v\"";
                }
            }
            $start .= "$attrStr>";

            $end = '';
            if ($def['close']){
                $end = '</' . $def['html'] . '>';
            }
        }

        # Macros: Language files sets up the basic macros.
        # Each level of definition file sets its own macros.
        # They will be passed to deeper levels, which can 
        #   overwrite macros from previous levels.
        # User's macro definition in their pages will 
        #   overwrite default values in templates.

        $rsp = parse_all([$start, $def['content'], $end], $varsCurLevel, array_merge($def['vars'], $payload['vars']), parse_all($payload['content'], $varsCurLevel, $payload['vars']));

        $html .= $rsp;

    }else{
        dieVars(false, false, '', ['html' => 'Malformed JSON.', 'js'=>[], 'err'=>$payload]);
    }
    return $html;
}
?>