<?php
/**
 * Fired during plugin deactivation.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */
class Telegram_Services_WC_Deactivator {

    /**
     * Deactivate the plugin.
     *
     * Performs cleanup operations when the plugin is deactivated.
     *
     * @since    1.0.0
     */
    public static function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}