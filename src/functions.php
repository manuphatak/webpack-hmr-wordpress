<?php
define( 'THEME_VERSION', '0.0.1' );
if ( !function_exists( 'theme_setup' ) ) {

// Register Theme Features
   function theme_setup() {

      // Add theme support for document Title tag
      add_theme_support( 'title-tag' );
   }

   add_action( 'after_setup_theme', 'theme_setup' );

}
// Register Script
function theme_scripts() {
   wp_register_style( 'theme.style', get_stylesheet_uri(), FALSE, THEME_VERSION, 'all' );
   wp_enqueue_style( 'theme.style' );
   wp_register_script( 'theme.vendor', get_template_directory_uri() . '/js/vendor.js', FALSE, THEME_VERSION, TRUE );
   wp_enqueue_script( 'theme.vendor' );

   wp_register_script( 'theme.main', get_template_directory_uri() . '/js/main.js', [ 'theme.vendor' ], THEME_VERSION, TRUE );
   wp_enqueue_script( 'theme.main' );

}

add_action( 'wp_enqueue_scripts', 'theme_scripts' );
