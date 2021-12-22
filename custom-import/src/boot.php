<?php
namespace custom_import;

class Boot{
	static $instance;

	/**
	 * Call this method to get singleton
	 * @return Boot $instance
	 */
	public static function get_instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * class constructor
	 */
	protected function __construct() {

		global $custom_import;

		if ( ! isset( $custom_import ) ) {
			$custom_import = new \stdClass();
		}
		
		/*
		 * Path to the includes directory
		 */
		$classes_path = dirname( UO_CUSTOM_TOOLKIT_FILE ) . '/src/classes/';
		
		include $classes_path . 'import-users-progress.php';
	}
}





