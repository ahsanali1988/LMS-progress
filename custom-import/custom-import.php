<?php
/*
Plugin Name: Custom Import
Version: 0.4
Description: Site specific customizations
Author: Ahsan
Author URI: Ahsan
Plugin URI: Ahsan
Text Domain: custom_import
Domain Path: /languages
*/

	
define( 'UO_CUSTOM_TOOLKIT_FILE', __FILE__ );
global $custom_import;

// Load all plugin classes(functionality)
include_once(dirname(__FILE__) . '/src/boot.php');

$custom_import = custom_import\Boot::get_instance();