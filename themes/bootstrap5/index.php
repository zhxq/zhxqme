<?php
require_once('func.php');
?>
<!DOCTYPE html>
<html data-bs-theme="<?=getThemeSetting('defaultappearance')?>">
<head>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.7/js/bootstrap.bundle.min.js"></script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.13.1/font/bootstrap-icons.min.css" integrity="sha512-t7Few9xlddEmgd3oKZQahkNI4dS6l80+eGEzFQiqtyVYdvcSG2D3Iub77R20BdotfRPA9caaRkg1tyaJiPmO0g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<script type="text/javascript" src="/themes/<?=getSetting('theme')?>/js/bootstrap5theme.js"></script>
<script type="text/javascript" src="/themes/<?=getSetting('theme')?>/js/onload.js"></script>
<title><?=getLocalizedSetting('title')?></title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="HandheldFriendly" content="True">
<meta content="telephone=no" name="format-detection" /> 
<meta name="Title" Content="<?=getLocalizedSetting('title')?>">
<meta name="Keywords" content="<?=getLocalizedSetting('keywords')?>">
<meta name="Description" content="<?=getLocalizedSetting('description')?>">
<meta name="Content" Content="<?=getLocalizedSetting('content')?>">
<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.7/css/bootstrap.css" rel="stylesheet">
<link href="/themes/<?=getLocalizedSetting('theme')?>/css/styles.css" rel="stylesheet">
<link id="favicon" href="favicon.ico" rel="icon" type="image/x-icon">
<link rel="shortcut icon" href="favicon.ico" >
<style>
.navbar-fixed-top, .navbar-fixed-bottom {
    position: fixed;
}
.navbar-brand {
    padding-left: 20px;
    -webkit-padding-left: 20px;
}
.navbar-toggler {
    margin-right: 20px;
    -webkit-margin-right: 20px;
}
body { -webkit-text-size-adjust: 100%; }
</style>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>

<body id="mainBody">
<input type="hidden" id="currentHash" value="" />
<input type="hidden" id="lastHash" value="" />
<input type="hidden" id="lastIncludedPage" value="" />
    
<nav id="navigationBar" class="navbar navbar-expand-lg bg-body-tertiary fixed-top" data-bs-theme="dark">
    <div class="container-fluid">
        <div class="navbar-header order-1 order-lg-1">
            <a style="margin-left:1%; white-space:nowrap;" class="navbar-brand">
            <?=getLocalizedSetting('menutitle')?>
            </a>
        </div>
        
        <?php
        $appearanceMenu = '
            <form style="display: inline-block;" role="appearance">
            <div class="form-switch" style="display:flex;justify-content:center;align-items:center; padding-left: 0em; padding-right: 20px">
                <label class="form-check-label" style="display: inline-block; margin-right: 10px;" for="appearanceToggle"><i class="bi bi-sun-fill github-logo"></i></label>
                <input style="display: inline-block; margin: 0 auto;" class="form-check-input form-control" type="checkbox" id="appearanceToggle">
                <label style="display: inline-block; margin-left: 10px;" class="form-check-label" for="appearanceToggle"><i class="bi bi-moon-stars-fill github-logo"></i></label>
            </div>
            </form>
        ';
        ?>
        <div class="d-flex align-items-center order-2 order-lg-3">
            <?=$appearanceMenu?>
            <button id="collapsebutton" class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>
        <div class="collapse navbar-collapse order-3 order-lg-2" id="navbarNav">
            <?=makeMenu()?>
        </div>
    </div>
</nav>
<span id="standardSpan"></span>
<div id="modals"></div>
<input type="hidden" id="lastNonFloatHash" value="">
<div style="text-align:center;">
<input type="hidden" id="naviNum" value="11">
<input type="hidden" id="lastNaviID" value="navid0">
<div id="pageTop" style="text-align:left; float:left;"></div>


<span id="tempArea"></span>
<span id="uploadArea"></span>
<span id="logoutArea"></span>

<div style="display: block;"><br /></div>
<div id="mainArea" style="text-align:center;" class="normal-form">
</div>

</div>


</body>
</html>
