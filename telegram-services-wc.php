<?php
/**
 * Telegram Services for WooCommerce
 *
 * @package           Telegram_Services_WC
 * @author            Amir Sanseir
 * @copyright         2024 Amir Sanseir
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       Telegram Services for WooCommerce
 * Plugin URI:        https://github.com/asanseir724/telegram-services
 * Description:       Integrates Telegram Stars and Premium services with WooCommerce. Sell Telegram Stars and Premium services with automated delivery.
 * Version:           1.0.1
 * Requires at least: 5.7
 * Requires PHP:      7.4
 * Author:            Amir Sanseir
 * Author URI:        https://github.com/asanseir724
 * Text Domain:       telegram-services-wc
 * Domain Path:       /languages
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Update URI:        https://github.com/asanseir724/telegram-services
 *
 * WC requires at least: 6.0
 * WC tested up to:      8.4
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

define('TELEGRAM_SERVICES_WC_VERSION', '1.0.1');
define('TELEGRAM_SERVICES_WC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('TELEGRAM_SERVICES_WC_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * The code that runs during plugin activation.
 */
function activate_telegram_services_wc() {
    require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'includes/class-telegram-services-wc-activator.php';
    Telegram_Services_WC_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_telegram_services_wc() {
    require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'includes/class-telegram-services-wc-deactivator.php';
    Telegram_Services_WC_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'activate_telegram_services_wc');
register_deactivation_hook(__FILE__, 'deactivate_telegram_services_wc');

/**
 * Check if WooCommerce is active.
 */
function telegram_services_wc_check_woocommerce() {
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', 'telegram_services_wc_woocommerce_missing_notice');
        return false;
    }
    return true;
}

/**
 * Admin notice for missing WooCommerce.
 */
function telegram_services_wc_woocommerce_missing_notice() {
    ?>
    <div class="notice notice-error">
        <p><?php _e('Telegram Services for WooCommerce requires WooCommerce to be installed and activated.', 'telegram-services-wc'); ?></p>
    </div>
    <?php
}

/**
 * Begin execution of the plugin.
 */
function run_telegram_services_wc() {
    if (!telegram_services_wc_check_woocommerce()) {
        return;
    }
    require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'includes/class-telegram-services-wc.php';
    $plugin = new Telegram_Services_WC();
    $plugin->run();
}

add_action('plugins_loaded', 'run_telegram_services_wc');