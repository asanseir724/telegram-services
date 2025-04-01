<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://github.com/asanseir724/telegram-services
 * @since             1.0.0
 * @package           Telegram_Services_WC
 *
 * @wordpress-plugin
 * Plugin Name:       Telegram Services for WooCommerce
 * Plugin URI:        https://github.com/asanseir724/telegram-services
 * Description:       Integrates Telegram Stars and Premium services with WooCommerce. Sell Telegram Stars and Premium services with automated delivery.
 * Version:           1.0.1
 * Author:            Amir Sanseir
 * Author URI:        https://github.com/asanseir724
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       telegram-services-wc
 * Domain Path:       /languages
 * Requires at least: 5.7
 * Tested up to:      6.4
 * Requires PHP:      7.4
 * WC requires at least: 6.0
 * WC tested up to:   8.4
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

/**
 * Currently plugin version.
 */
define('TELEGRAM_SERVICES_WC_VERSION', '1.0.1');

/**
 * Plugin directory path.
 */
define('TELEGRAM_SERVICES_WC_PLUGIN_DIR', plugin_dir_path(__FILE__));

/**
 * Plugin directory URL.
 */
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
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_telegram_services_wc() {
    // Check if WooCommerce is active
    if (!telegram_services_wc_check_woocommerce()) {
        return;
    }

    /**
     * The core plugin class that is used to define internationalization,
     * admin-specific hooks, and public-facing site hooks.
     */
    require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'includes/class-telegram-services-wc.php';

    /**
     * The class responsible for orchestrating the actions and filters of the
     * core plugin.
     */
    $plugin = new Telegram_Services_WC();
    $plugin->run();
}

add_action('plugins_loaded', 'run_telegram_services_wc');