<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @link       https://github.com/asanseir724/telegram-services
 * @since      1.0.0
 * @package    Telegram_Services_WC
 */

// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Note: We don't automatically remove product categories as they may contain user products

// Remove custom database tables
function telegram_services_wc_remove_tables() {
    global $wpdb;
    
    $tables = array(
        $wpdb->prefix . 'telegram_order_details'
    );
    
    foreach ($tables as $table) {
        $wpdb->query("DROP TABLE IF EXISTS $table");
    }
}

// Remove plugin options
function telegram_services_wc_remove_options() {
    $options = array(
        'telegram_services_wc_commission_percentage',
        'telegram_services_wc_default_stars_price',
        'telegram_services_wc_default_premium_price',
        'telegram_services_wc_settings',
        'telegram_services_wc_custom_texts'
    );
    
    foreach ($options as $option) {
        delete_option($option);
    }
}

// Check if data should be removed
$remove_data = get_option('telegram_services_wc_remove_data_on_uninstall', false);

if ($remove_data) {
    telegram_services_wc_remove_tables();
    telegram_services_wc_remove_options();
}