<?php

namespace custom_import;

use uo_qbt_ld_customizations\MarkLessonsComplete;

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Class Sample
 * @package custom_import
 */
class ImportUsersProgress {
	
	static $group_identifier_key = '_uo_group_identifier';
	
	/**
	 * Class constructor
	 */
	public function __construct() {
	 
		// Enqueue Scripts for questionnaire
		add_action( 'admin_menu', [ __CLASS__, 'menu_import_groups_page' ], 5 );
		add_action( 'admin_init', [ __CLASS__, 'process_csv_upload' ] );
	}
	
	/**
	 * Adds menu item for import page.
	 */
	public static function menu_import_groups_page() {
		add_submenu_page(
			'learndash-lms',
			esc_html__( 'Import Users Progress', 'custom_import' ),
			esc_html__( 'Import Users Progress', 'custom_import' ),
			'manage_options',
			'import-user-progress',
			[ __CLASS__, 'import_ld_groups_page' ]
		);
	}
	/**
	 * Upload page HTML function.
	 */
	public static function import_ld_groups_page() {
		wp_enqueue_style( 'custom_import', plugins_url( basename( dirname( UO_CUSTOM_TOOLKIT_FILE ) ) ) . '/src/assets/legacy/frontend/css/admin-style.css', FALSE, '1.0.0' );
		?>

        <div class="uo-csup-admin wrap"> <!-- wrap just to keep nesting -->
            <div class="uo-plugins-header">
                <div class="uo-plugins-header__title">
					<?php echo __( 'Import LearnDash Progress', 'custom_import' ); ?>
                </div>
                
            </div>

            <h2></h2> <!-- Profile settings will be shown here -->
			
			<?php if ( isset( $_REQUEST['saved'] ) && $_REQUEST['saved'] ) { ?>
                <div class="updated notice"><?php _e( 'Settings Saved!', 'custom_import' ); ?></div>
			<?php } ?>
			<?php if ( defined( 'UOC_ERROR_MESSAGE' ) ) { ?>
                <div class='notice notice-error'>
					<?php echo UOC_ERROR_MESSAGE; ?>
                </div>
			<?php } ?>
            <div class="notice notice-error" id="export_course_form_error" style="display: none"><h4></h4></div>
            <form method="post" action="" id="uo-csup-form" enctype="multipart/form-data">
                <input type="hidden" name="_wp_http_referer" value="<?php echo admin_url( 'admin.php?page=import-groups&saved=true' ) ?>"/>
                <input type="hidden" name="_wpnonce" value="<?php echo wp_create_nonce( 'uncanny-import-groups' ); ?>"/>

                <div class="uo-admin-section">
                    <div class="uo-admin-header">
                        <div class="uo-admin-title"><?php esc_html_e( 'Import Report', 'custom_import' ); ?></div>
                    </div>
                    <div class="uo-admin-block">
                        <div class="uo-admin-form">
                            <div class="uo-admin-field">
                                <div class="uo-admin-label"><?php _e( 'Upload CSV File', 'custom_import' ); ?></div>
                                <input type="file" title="Upload CSV File" value="Upload CSV File" name="uo_import_csv_groups" id="uo_import_csv_groups">
                            </div>

                            <div class="uo-admin-field">
                                <input type="submit" name="submit" id="submit" class="uo-admin-form-submit" value="<?php _e( 'Submit', 'custom_import' ); ?>">
                            </div>

                        </div>
                    </div>
                </div>
            </form>
        </div>
		<?php
	}
	
	/**
	 * Process uploaded CSV function.
	 */
	public static function process_csv_upload() {
		if ( ( ! empty( $_POST ) && isset( $_POST['_wpnonce'] ) ) && wp_verify_nonce( $_POST['_wpnonce'], 'uncanny-import-groups' ) ) {
			global $wpdb;
			$users_data     = [];
			$fileName       = $_FILES['uo_import_csv_groups']['tmp_name'];
			$ext            = pathinfo( $_FILES['uo_import_csv_groups']['name'], PATHINFO_EXTENSION ); // getting the extension of file
			$success_groups = 0;
			$failed_groups  = 0;
			$failed_groups_row  = [];
			$failed_groups_row_reason  = [];
			
			if ( $fileName == "" || $fileName == NULL ) {
				$msg = __( "No files chosen to upload!", 'custom_import' );
				define( 'UOC_ERROR_MESSAGE', __( 'ERROR', 'custom_import' ) . ': ' . $msg );
				
				return;
			}
			if ( $ext != "csv" ) {
				$msg = __( "Only CSV files is allowed!", 'custom_import' );
				define( 'UOC_ERROR_MESSAGE', __( 'ERROR', 'custom_import' ) . ': ' . $msg );
				
				return;
			}
			
			$file = fopen( $fileName, "r" );
			$cnt  = 0;
			while ( ( $data = fgetcsv( $file, 1000, "," ) ) !== FALSE ) {
				if ( $cnt == 0 ) {
					$data = array_map(function($s){
						if(substr($s,0,3)==chr(hexdec('EF')).chr(hexdec('BB')).chr(hexdec('BF'))){
							return substr($s,3);
						}
						return $s;
					}, $data);
					$data = array_map( "utf8_encode", $data );
					$cnt ++;
					
					if ( count( $data ) != 22 ) {
						$msg = __( "Value is not in a proper format, check sample file for format!", 'custom_import' );
						define( 'UOC_ERROR_MESSAGE', __( 'ERROR', 'custom_import' ) . ': ' . $msg );
						
						return;
					}
					
				} else {
					$data = array_map(function($s){
						if(substr($s,0,3)==chr(hexdec('EF')).chr(hexdec('BB')).chr(hexdec('BF'))){
							return substr($s,3);
						}
						return $s;
					}, $data);
					$data = array_map( "utf8_encode", $data );
					$cnt ++;
					if ( count( $data ) != 22 ) {
						$msg = __( "Value is not in a proper format, check sample file for format!", 'custom_import' );
						define( 'UOC_ERROR_MESSAGE', __( 'ERROR', 'custom_import' ) . ': ' . $msg );
						
						return;
					}
					
					// check and get user id at this point
                    $user_email = $data[1];
					$tbl_users = $wpdb->users;
					$prepare_guery   = $wpdb->prepare( "SELECT ID FROM $tbl_users where user_email LIKE '%s' LIMIT 1 ", $user_email );
					$get_values      = $wpdb->get_col( $prepare_guery );
					
					if ( ! empty( $get_values ) ) {
						$user_id = $get_values[0];
					}
					
					$users_data[] = [
						'user_id'       => $user_id,
						'course_lessons' => unserialize( $data[21] ),
						'course_registration'     => $data[4],
						'courses'     => $data[15],
					];
					var_dump($users_data);
				}
			}
			fclose( $file );
			
			$ld_courses_data = [];
			$tbl_postmeta = $wpdb->postmeta;
			$tbl_posts = $wpdb->posts;
			// Start enrollments
			if ( ! empty( $users_data ) ) {
				foreach ( $users_data as $row_index => $user_data ) {
					// find user's courses in LD and enroll then
					if( ! empty( $user_data['course_lessons'] ) ) {
					    foreach( $user_data['course_lessons']  as $lf_course ) {
					        if( ! empty( $lf_course['course'])){
					            // prepare a local cache array for ld courses
                                $ld_course_key = sanitize_title($lf_course['course']);
                                if( ! isset( $ld_courses_data[$ld_course_key] ) ) {
	                                // Get LD course id from posts tables
	                                $prepare_guery   = $wpdb->prepare( "SELECT ID FROM $tbl_posts where post_title LIKE '%s' AND post_type = 'sfwd-courses' AND post_status = 'publish' LIMIT 1 ", trim( $lf_course['course'] ) );
	                                $does_course_exists = $wpdb->get_var( $prepare_guery );
	                                if ( ! empty( $does_title_exists ) ) {
		                                $ld_course_id    = $does_title_exists;
		                                $ld_course_steps = learndash_get_course_steps( $ld_course_id );
		                                $ld_courses_data[$ld_course_key] = [
		                                        'course_id' => $ld_course_id,
                                                'course_steps' => $ld_course_steps
                                        ];
	                                }
                                }
					            // if ld course exists in cache array then enroll user and update lesson progress
						        if( ! empty( $ld_courses_data[$ld_course_key] ) ) {
							        // grant access
                                    $current_ld_course = $ld_courses_data[$ld_course_key]['course_id'];
						            var_dump($current_ld_course);
						            var_dump($user_data['user_id']);
                                    //ld_update_course_access( $user_data['user_id'], $current_ld_course );
							        $user_course_access_time = strtotime( $user_data['course_registration'] );
							        //update_user_meta( $user_data['user_id'], 'course_' . $current_ld_course . '_access_from', $user_course_access_time );
							        // mark lesson as completed from LFLMS
                                    if( ! empty( $lf_course['lessons'] ) && !empty( $ld_courses_data[$ld_course_key]['course_steps'] ) ) {
                                        foreach ( $lf_course['lessons'] as $lf_user_lessons ) {
                                            foreach( $ld_courses_data[$ld_course_key]['course_steps'] as $ld_step ) {
                                                if( $ld_step->post_title === $lf_user_lessons['lesson_title'] && $lf_user_lessons['is_completed'] === true ) {
	                                                var_dump($user_data['user_id']);
	                                                var_dump($ld_step->ID);
                                                    //learndash_process_mark_complete( $user_data['user_id'], $ld_step->ID, false, $current_ld_course );
	                                                $success_groups ++;
                                                }
                                            }
                                        }
                                    }
                                }
					            
					        }
					    }
					}
				}
				
				$msg = '<p>' .__( "Users updated:", 'custom_import' ). ' '. $success_groups .'</p>';
				define( 'UOC_ERROR_MESSAGE', __( 'DONE', 'custom_import' ) . ': ' . $msg );
				
				return;
			}
		}
	}
	
	public static function removeBomUtf8($s){
		if(substr($s,0,3)==chr(hexdec('EF')).chr(hexdec('BB')).chr(hexdec('BF'))){
			return substr($s,3);
		}else{
			return $s;
		}
	}
	
}
new ImportUsersProgress();