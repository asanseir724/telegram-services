<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @link       https://github.com/asanseir724/telegram-services
 * @since      1.0.0
 *
 * @package    Telegram_Services_WC
 */

// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Check if we should remove all data
$remove_data = get_option('telegram_services_wc_remove_data_on_uninstall', false);

if ($remove_data) {
    // Delete all plugin options
    delete_option('telegram_services_wc_commission_percentage');
    delete_option('telegram_services_wc_usd_to_toman_rate');
    delete_option('telegram_services_wc_remove_data_on_uninstall');
    delete_option('telegram_services_wc_custom_texts');

    // Delete custom database table
    global $wpdb;
    $table_name = $wpdb->prefix . 'telegram_order_details';
    $wpdb->query("DROP TABLE IF EXISTS $table_name");

    // Find and delete all Telegram service products
    $telegram_products = new WP_Query(array(
        'post_type' => 'product',
        'posts_per_page' => -1,
        'meta_query' => array(
            array(
                'key' => '_telegram_service_type',
                'compare' => 'EXISTS',
            ),
        ),
    ));

    if ($telegram_products->have_posts()) {
        while ($telegram_products->have_posts()) {
            $telegram_products->the_post();
            wp_delete_post(get_the_ID(), true);
        }
    }

    // Delete product categories
    $terms = get_terms(array(
        'taxonomy' => 'product_cat',
        'slug' => array('telegram-stars', 'telegram-premium'),
        'hide_empty' => false,
    ));

    if (!is_wp_error($terms) && !empty($terms)) {
        foreach ($terms as $term) {
            wp_delete_term($term->term_id, 'product_cat');
        }
    }
}