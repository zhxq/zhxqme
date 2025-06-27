<?php
function makeMenu(){
    $i = 0;
    $menuSettings = getSetting('menu');
    $left = '<ul id="leftnav" class="nav navbar-nav me-auto mb-2 mb-lg-0">';
    $right = '<ul id="rightnav" class="nav navbar-nav navbar-right" style="margin-right:1%;">';
    foreach ($menuSettings as $k=>$v){
        $opt = '<li data-name="' . $k . '" data-type="topmenubutton" id="navid' . $i . '"';
        $dropdown = '';
        $target = array_key_exists("target", $v) ? $v['target'] : '_blank';
        if (array_key_exists('dropdown', $v)){
            $opt .= ' class="dropdown nav-item">';
            $dropdown = '<ul class="dropdown-menu">';
            foreach ($v['dropdown'] as $dk=>$dv){
                if (array_key_exists("link", $v)){
                    $dropdown .= '<li data-name="' . $k . '"><a href="' . $v['link']  . '" target="' . $target .'">' . getLocalizedString($v['readable']) . '</a></li>';
                }else{
                    $dropdown .= '<li data-name="' . $k . '"><a href="javascript:void(0);" onclick="setHash(\'' . $dk . '\');clickCollapseButton();">' . getLocalizedString($dv['readable']) . '</a></li>';
                }
            }
            $dropdown .= '</ul>';
            $opt .= '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true">' . getLocalizedString($v['readable']) . '<span class="caret"></span></a>' . $dropdown;
        }else{
            if (array_key_exists("link", $v)){
                $opt .= ' class="nav-item"><a class="nav-link" href="' . $v['link']  . '" target="' . $target .'">' . getLocalizedString($v['readable']) . '</a>';
            }else{
                $opt .= ' onmousedown="changeActiveStatus(\'' . $i . '\');">';
                $opt .= '<a class="nav-link" href="javascript:void(0);" onclick="setHash(\'' . $k . '\');clickCollapseButton();">' . getLocalizedString($v['readable']) . '</a>';
            }
        }
        $opt .= "</li>";
        $i++;
        if ($v['right']){
            $right .= $opt;
        }else{
            $left .= $opt;
        }
    }

    $langMenu = '<li class="nav-item dropdown">
        <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Language<span class="caret"></span></a>
        <ul class="dropdown-menu">';
    $langSettings = getSetting('lang');
    foreach(getLangList() as $lang){
        $langMenu .= '<li><a class="dropdown-item" href="javascript:void(0);" onclick="setLang(\'' . $lang . '\');">' . $langSettings[$lang]['name'] . '</a></li>';
    }
    $langMenu .= '    </ul>
    </li>';

    $left .= '</ul>';
    $right .= $langMenu . '</ul>';
    return $left . $right;
}
?>