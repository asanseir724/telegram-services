<?php
/**
 * Fired during plugin activation.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */
class Telegram_Services_WC_Activator {

    /**
     * Activate the plugin.
     *
     * Creates necessary database tables and adds default options when the plugin is activated.
     *
     * @since    1.0.0
     */
    public static function activate() {
        self::create_database_tables();
        self::add_default_options();
        self::create_product_categories();
        self::create_default_products();
        self::create_default_pages();
        self::flush_rewrite_rules();
    }

    /**
     * Create required database tables.
     *
     * @since    1.0.0
     */
    private static function create_database_tables() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'telegram_order_details';

        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            order_id bigint(20) NOT NULL,
            telegram_id varchar(100) NOT NULL,
            phone_number varchar(20) NOT NULL,
            service_type varchar(20) NOT NULL,
            quantity int(11) NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            created_at datetime NOT NULL,
            completed_at datetime DEFAULT NULL,
            PRIMARY KEY  (id),
            KEY order_id (order_id),
            KEY status (status)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Add default options.
     *
     * @since    1.0.0
     */
    private static function add_default_options() {
        // Set default commission percentage to 5%
        if (false === get_option('telegram_services_wc_commission_percentage')) {
            add_option('telegram_services_wc_commission_percentage', 5);
        }

        // Set default USD to Toman exchange rate
        if (false === get_option('telegram_services_wc_usd_to_toman_rate')) {
            add_option('telegram_services_wc_usd_to_toman_rate', 40000);
        }

        // Set default option to remove data on uninstall
        if (false === get_option('telegram_services_wc_remove_data_on_uninstall')) {
            add_option('telegram_services_wc_remove_data_on_uninstall', false);
        }

        // Initialize custom texts
        if (false === get_option('telegram_services_wc_custom_texts')) {
            $default_texts = array(
                'en_US' => array(
                    'site_title' => 'Telegram Services',
                    'site_description' => 'Buy Telegram Stars and Premium subscriptions at the best prices.',
                    'hero_title' => 'Enhance Your Telegram Experience',
                    'hero_subtitle' => 'Get Telegram Stars for your channel or Premium membership for your account.',
                    'hero_cta' => 'Browse Services',
                    'services_title' => 'Our Services',
                    'services_description' => 'Choose from our range of Telegram products.',
                    'stars_title' => 'Telegram Stars',
                    'stars_description' => 'Boost your channel visibility with Telegram Stars.',
                    'stars_per_unit' => 'Stars',
                    'stars_feature_1' => 'Improve channel visibility',
                    'stars_feature_2' => 'Increase engagement',
                    'stars_feature_3' => 'Boost channel ranking',
                    'stars_buy_button' => 'Buy Stars',
                    'premium_title' => 'Telegram Premium',
                    'premium_description' => 'Unlock all Telegram Premium features.',
                    'premium_per_unit' => 'Month(s)',
                    'premium_feature_1' => 'Upload larger files',
                    'premium_feature_2' => 'Follow more channels',
                    'premium_feature_3' => 'Access premium stickers',
                    'premium_buy_button' => 'Get Premium',
                    'telegram_id_label' => 'Telegram ID',
                    'telegram_id_placeholder' => 'Your Telegram username or numeric ID',
                    'telegram_phone_label' => 'Phone Number',
                    'telegram_phone_placeholder' => 'Phone number linked to your Telegram account',
                ),
                'fa_IR' => array(
                    'site_title' => 'خدمات تلگرام',
                    'site_description' => 'خرید ستاره تلگرام و اشتراک پریمیوم با بهترین قیمت‌ها.',
                    'hero_title' => 'تجربه تلگرام خود را ارتقا دهید',
                    'hero_subtitle' => 'ستاره تلگرام برای کانال خود یا اشتراک پریمیوم برای حساب خود بخرید.',
                    'hero_cta' => 'مشاهده خدمات',
                    'services_title' => 'خدمات ما',
                    'services_description' => 'از بین محصولات تلگرام ما انتخاب کنید.',
                    'stars_title' => 'ستاره تلگرام',
                    'stars_description' => 'با ستاره تلگرام، قابلیت مشاهده کانال خود را افزایش دهید.',
                    'stars_per_unit' => 'ستاره',
                    'stars_feature_1' => 'افزایش قابلیت مشاهده کانال',
                    'stars_feature_2' => 'افزایش تعامل',
                    'stars_feature_3' => 'افزایش رتبه کانال',
                    'stars_buy_button' => 'خرید ستاره',
                    'premium_title' => 'تلگرام پریمیوم',
                    'premium_description' => 'تمام ویژگی‌های تلگرام پریمیوم را فعال کنید.',
                    'premium_per_unit' => 'ماه',
                    'premium_feature_1' => 'آپلود فایل‌های بزرگتر',
                    'premium_feature_2' => 'دنبال کردن کانال‌های بیشتر',
                    'premium_feature_3' => 'دسترسی به استیکرهای ویژه',
                    'premium_buy_button' => 'دریافت پریمیوم',
                    'telegram_id_label' => 'شناسه تلگرام',
                    'telegram_id_placeholder' => 'نام کاربری یا شناسه عددی تلگرام',
                    'telegram_phone_label' => 'شماره تلفن',
                    'telegram_phone_placeholder' => 'شماره تلفن متصل به حساب تلگرام',
                ),
            );

            add_option('telegram_services_wc_custom_texts', $default_texts);
        }
    }

    /**
     * Create product categories for Telegram Stars and Premium.
     *
     * @since    1.0.0
     */
    private static function create_product_categories() {
        // Check if the category exists
        $stars_cat = term_exists('telegram-stars', 'product_cat');
        $premium_cat = term_exists('telegram-premium', 'product_cat');

        // Create Stars category if it doesn't exist
        if (!$stars_cat) {
            wp_insert_term(
                'Telegram Stars',
                'product_cat',
                array(
                    'description' => 'Telegram Stars for channels',
                    'slug' => 'telegram-stars',
                )
            );
        }

        // Create Premium category if it doesn't exist
        if (!$premium_cat) {
            wp_insert_term(
                'Telegram Premium',
                'product_cat',
                array(
                    'description' => 'Telegram Premium subscriptions',
                    'slug' => 'telegram-premium',
                )
            );
        }
    }

    /**
     * Create default products.
     *
     * @since    1.0.0
     */
    private static function create_default_products() {
        // Only create default products if WooCommerce is active
        if (!class_exists('WooCommerce')) {
            return;
        }

        require_once TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'includes/class-telegram-services-wc-product.php';
        Telegram_Services_WC_Product::create_default_products();
    }

    /**
     * Create default pages.
     *
     * @since    1.0.0
     */
    private static function create_default_pages() {
        // Create a page for displaying Telegram services
        $services_page = get_page_by_path('telegram-services');
        
        if (!$services_page) {
            $services_page_id = wp_insert_post(array(
                'post_title' => 'Telegram Services',
                'post_content' => '[telegram_services_grid]',
                'post_status' => 'publish',
                'post_type' => 'page',
            ));
        }
    }

    /**
     * Flush rewrite rules.
     *
     * @since    1.0.0
     */
    private static function flush_rewrite_rules() {
        flush_rewrite_rules();
    }
}