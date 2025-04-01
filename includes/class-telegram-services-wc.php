<?php
/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */

/**
 * The core plugin class.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 * @author     Amir Sanseir <asanseir724@gmail.com>
 */
class Telegram_Services_WC {

    /**
     * The loader that's responsible for maintaining and registering all hooks that power
     * the plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      Telegram_Services_WC_Loader    $loader    Maintains and registers all hooks for the plugin.
     */
    protected $loader;

    /**
     * The unique identifier of this plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $plugin_name    The string used to uniquely identify this plugin.
     */
    protected $plugin_name;

    /**
     * The current version of the plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $version    The current version of the plugin.
     */
    protected $version;

    /**
     * Define the core functionality of the plugin.
     *
     * Set the plugin name and the plugin version that can be used throughout the plugin.
     * Load the dependencies, define the locale, and set the hooks for the admin area and
     * the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function __construct() {
        $this->version = TELEGRAM_SERVICES_WC_VERSION;
        $this->plugin_name = 'telegram-services-wc';

        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->define_product_hooks();
        $this->define_order_hooks();
    }

    /**
     * Load the required dependencies for this plugin.
     *
     * Include the following files that make up the plugin:
     *
     * - Telegram_Services_WC_Loader. Orchestrates the hooks of the plugin.
     * - Telegram_Services_WC_i18n. Defines internationalization functionality.
     * - Telegram_Services_WC_Admin. Defines all hooks for the admin area.
     * - Telegram_Services_WC_Public. Defines all hooks for the public side of the site.
     * - Telegram_Services_WC_Product. Defines product-related functionality.
     * - Telegram_Services_WC_Order. Defines order-related functionality.
     *
     * Create an instance of the loader which will be used to register the hooks
     * with WordPress.
     *
     * @since    1.0.0
     * @access   private
     */
    private function load_dependencies() {
        /**
         * The class responsible for orchestrating the actions and filters of the
         * core plugin.
         */
        require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'includes/class-telegram-services-wc-loader.php';

        /**
         * The class responsible for defining internationalization functionality
         * of the plugin.
         */
        require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'includes/class-telegram-services-wc-i18n.php';

        /**
         * The class responsible for defining all actions that occur in the admin area.
         */
        require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'admin/class-telegram-services-wc-admin.php';

        /**
         * The class responsible for defining all actions that occur in the public-facing
         * side of the site.
         */
        require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'public/class-telegram-services-wc-public.php';

        /**
         * The class responsible for product-related functionality.
         */
        require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'includes/class-telegram-services-wc-product.php';

        /**
         * The class responsible for order-related functionality.
         */
        require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'includes/class-telegram-services-wc-order.php';

        $this->loader = new Telegram_Services_WC_Loader();
    }

    /**
     * Define the locale for this plugin for internationalization.
     *
     * Uses the Telegram_Services_WC_i18n class in order to set the domain and to register the hook
     * with WordPress.
     *
     * @since    1.0.0
     * @access   private
     */
    private function set_locale() {
        $plugin_i18n = new Telegram_Services_WC_i18n();

        $this->loader->add_action('plugins_loaded', $plugin_i18n, 'load_plugin_textdomain');
    }

    /**
     * Register all of the hooks related to the admin area functionality
     * of the plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_admin_hooks() {
        $plugin_admin = new Telegram_Services_WC_Admin($this->get_plugin_name(), $this->get_version());

        // Admin scripts and styles
        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts');

        // Admin menu
        $this->loader->add_action('admin_menu', $plugin_admin, 'register_admin_menu');

        // Plugin settings
        $this->loader->add_action('admin_init', $plugin_admin, 'register_settings');

        // Add settings link on plugins page
        $plugin_file = plugin_basename(dirname(TELEGRAM_SERVICES_WC_PLUGIN_DIR) . '/telegram-services-wc.php');
        $this->loader->add_filter('plugin_action_links_' . $plugin_file, $plugin_admin, 'add_plugin_settings_link');

        // Order meta boxes
        $this->loader->add_action('add_meta_boxes', $plugin_admin, 'add_telegram_order_meta_boxes');
        $this->loader->add_action('save_post_shop_order', $plugin_admin, 'save_telegram_order_meta_box_data');

        // REST API endpoints
        $this->loader->add_action('rest_api_init', $plugin_admin, 'register_rest_api_endpoints');
    }

    /**
     * Register all of the hooks related to the public-facing functionality
     * of the plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_public_hooks() {
        $plugin_public = new Telegram_Services_WC_Public($this->get_plugin_name(), $this->get_version());

        // Public scripts and styles
        $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_styles');
        $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_scripts');

        // Shortcodes
        $this->loader->add_action('init', $plugin_public, 'register_shortcodes');

        // Checkout fields
        $this->loader->add_action('woocommerce_after_order_notes', $plugin_public, 'add_telegram_checkout_fields');
        $this->loader->add_action('woocommerce_checkout_process', $plugin_public, 'validate_telegram_checkout_fields');
        $this->loader->add_action('woocommerce_checkout_update_order_meta', $plugin_public, 'save_telegram_checkout_fields');
    }

    /**
     * Register all of the hooks related to the product functionality.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_product_hooks() {
        $plugin_product = new Telegram_Services_WC_Product();

        // Add product type
        $this->loader->add_filter('product_type_selector', $plugin_product, 'add_telegram_product_type');

        // Add product data tabs and fields
        $this->loader->add_filter('woocommerce_product_data_tabs', $plugin_product, 'add_telegram_product_data_tab');
        $this->loader->add_action('woocommerce_product_data_panels', $plugin_product, 'add_telegram_product_data_fields');
        $this->loader->add_action('woocommerce_process_product_meta', $plugin_product, 'save_telegram_product_data_fields');
    }

    /**
     * Register all of the hooks related to the order functionality.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_order_hooks() {
        $plugin_order = new Telegram_Services_WC_Order();

        // Process order status changes
        $this->loader->add_action('woocommerce_order_status_changed', $plugin_order, 'process_telegram_order', 10, 3);

        // Add Telegram details to emails
        $this->loader->add_action('woocommerce_email_after_order_table', $plugin_order, 'add_telegram_details_to_emails', 10, 4);

        // Display Telegram details on order view page
        $this->loader->add_action('woocommerce_order_details_after_order_table', $plugin_order, 'display_telegram_order_details');
    }

    /**
     * Run the loader to execute all of the hooks with WordPress.
     *
     * @since    1.0.0
     */
    public function run() {
        $this->loader->run();
    }

    /**
     * The name of the plugin used to uniquely identify it within the context of
     * WordPress and to define internationalization functionality.
     *
     * @since     1.0.0
     * @return    string    The name of the plugin.
     */
    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * The reference to the class that orchestrates the hooks with the plugin.
     *
     * @since     1.0.0
     * @return    Telegram_Services_WC_Loader    Orchestrates the hooks of the plugin.
     */
    public function get_loader() {
        return $this->loader;
    }

    /**
     * Retrieve the version number of the plugin.
     *
     * @since     1.0.0
     * @return    string    The version number of the plugin.
     */
    public function get_version() {
        return $this->version;
    }
}