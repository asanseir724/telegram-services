<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two hooks for
 * enqueuing the admin-specific stylesheet and JavaScript.
 *
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/admin
 */
class Telegram_Services_WC_Admin {

    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @param    string    $plugin_name       The name of this plugin.
     * @param    string    $version           The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            TELEGRAM_SERVICES_WC_PLUGIN_URL . 'admin/css/telegram-services-wc-admin.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        // Add admin scripts
        wp_enqueue_script(
            $this->plugin_name,
            TELEGRAM_SERVICES_WC_PLUGIN_URL . 'admin/js/telegram-services-wc-admin.js',
            array('jquery'),
            $this->version,
            false
        );

        // Add localized data for the script
        wp_localize_script(
            $this->plugin_name,
            'telegram_services_wc',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('telegram_services_wc_nonce'),
            )
        );
    }

    /**
     * Register the admin menu.
     *
     * @since    1.0.0
     */
    public function register_admin_menu() {
        // Main menu for the plugin
        add_menu_page(
            __('Telegram Services', 'telegram-services-wc'),
            __('Telegram Services', 'telegram-services-wc'),
            'manage_woocommerce',
            'telegram-services-wc',
            array($this, 'display_dashboard_page'),
            'dashicons-share-alt',
            56
        );

        // Orders submenu
        add_submenu_page(
            'telegram-services-wc',
            __('Orders', 'telegram-services-wc'),
            __('Orders', 'telegram-services-wc'),
            'manage_woocommerce',
            'telegram-services-wc-orders',
            array($this, 'display_orders_page')
        );

        // Settings submenu
        add_submenu_page(
            'telegram-services-wc',
            __('Settings', 'telegram-services-wc'),
            __('Settings', 'telegram-services-wc'),
            'manage_woocommerce',
            'telegram-services-wc-settings',
            array($this, 'display_settings_page')
        );

        // Text Editor submenu
        add_submenu_page(
            'telegram-services-wc',
            __('Text Editor', 'telegram-services-wc'),
            __('Text Editor', 'telegram-services-wc'),
            'manage_woocommerce',
            'telegram-services-wc-text-editor',
            array($this, 'display_text_editor_page')
        );
    }

    /**
     * Display the dashboard page.
     *
     * @since    1.0.0
     */
    public function display_dashboard_page() {
        // Get order statistics
        global $wpdb;
        $table_name = $wpdb->prefix . 'telegram_order_details';
        
        $total_orders = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        $pending_orders = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'pending'");
        $completed_orders = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'completed'");
        
        // Get revenue data
        $stars_revenue = $wpdb->get_var(
            "SELECT SUM(order_total) FROM {$wpdb->prefix}wc_order_stats AS os
            INNER JOIN $table_name AS tod ON os.order_id = tod.order_id
            WHERE tod.service_type = 'stars' AND os.status = 'wc-completed'"
        );
        
        $premium_revenue = $wpdb->get_var(
            "SELECT SUM(order_total) FROM {$wpdb->prefix}wc_order_stats AS os
            INNER JOIN $table_name AS tod ON os.order_id = tod.order_id
            WHERE tod.service_type = 'premium' AND os.status = 'wc-completed'"
        );
        
        $stars_revenue = $stars_revenue ? $stars_revenue : 0;
        $premium_revenue = $premium_revenue ? $premium_revenue : 0;
        $total_revenue = $stars_revenue + $premium_revenue;
        
        // Get recent orders
        $recent_orders = Telegram_Services_WC_Order::get_telegram_orders(array(
            'limit' => 5,
        ));
        
        include TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'admin/partials/dashboard-page.php';
    }

    /**
     * Display the orders page.
     *
     * @since    1.0.0
     */
    public function display_orders_page() {
        // Handle status updates
        if (isset($_GET['action']) && 'update_status' === $_GET['action'] && isset($_GET['order_id']) && isset($_GET['status'])) {
            if (isset($_GET['_wpnonce']) && wp_verify_nonce($_GET['_wpnonce'], 'update_telegram_order_status')) {
                $order_id = intval($_GET['order_id']);
                $status = sanitize_text_field($_GET['status']);
                
                $valid_statuses = array('pending', 'processing', 'completed', 'failed');
                
                if (in_array($status, $valid_statuses, true)) {
                    Telegram_Services_WC_Order::update_telegram_order_status($order_id, $status);
                    
                    // Add admin notice
                    add_settings_error(
                        'telegram_services_wc_orders',
                        'telegram_services_wc_order_updated',
                        __('Order status updated successfully.', 'telegram-services-wc'),
                        'success'
                    );
                }
            }
        }
        
        // Get current page and status filter
        $current_page = isset($_GET['paged']) ? max(1, intval($_GET['paged'])) : 1;
        $status_filter = isset($_GET['status']) && !empty($_GET['status']) ? sanitize_text_field($_GET['status']) : '';
        
        // Items per page
        $per_page = 20;
        
        // Get orders
        $args = array(
            'limit' => $per_page,
            'offset' => ($current_page - 1) * $per_page,
            'status' => $status_filter,
        );
        
        $orders = Telegram_Services_WC_Order::get_telegram_orders($args);
        
        // Get total orders for pagination
        global $wpdb;
        $table_name = $wpdb->prefix . 'telegram_order_details';
        
        $where = '';
        if (!empty($status_filter)) {
            $where = $wpdb->prepare("WHERE status = %s", $status_filter);
        }
        
        $total_orders = $wpdb->get_var("SELECT COUNT(*) FROM $table_name $where");
        $total_pages = ceil($total_orders / $per_page);
        
        // Display the orders page
        include TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'admin/partials/orders-page.php';
    }

    /**
     * Display the settings page.
     *
     * @since    1.0.0
     */
    public function display_settings_page() {
        // Check if form was submitted
        if (isset($_POST['telegram_services_wc_settings_submit'])) {
            // Verify nonce
            if (check_admin_referer('telegram_services_wc_settings_nonce', 'telegram_services_wc_settings_nonce')) {
                // Process settings form
                $this->process_settings_form();
                
                // Add admin notice
                add_settings_error(
                    'telegram_services_wc_settings',
                    'telegram_services_wc_settings_updated',
                    __('Settings updated successfully.', 'telegram-services-wc'),
                    'success'
                );
            }
        }
        
        // Load settings
        $settings = array(
            'commission_percentage' => get_option('telegram_services_wc_commission_percentage', 5),
            'usd_to_toman_rate' => get_option('telegram_services_wc_usd_to_toman_rate', 40000),
            'remove_data_on_uninstall' => get_option('telegram_services_wc_remove_data_on_uninstall', false),
        );
        
        // Display the settings page
        include TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'admin/partials/settings-page.php';
    }

    /**
     * Process the settings form.
     *
     * @since    1.0.0
     */
    private function process_settings_form() {
        // Commission percentage
        if (isset($_POST['commission_percentage'])) {
            $commission_percentage = floatval($_POST['commission_percentage']);
            $commission_percentage = max(0, min(100, $commission_percentage));
            update_option('telegram_services_wc_commission_percentage', $commission_percentage);
        }
        
        // USD to Toman exchange rate
        if (isset($_POST['usd_to_toman_rate'])) {
            $exchange_rate = intval($_POST['usd_to_toman_rate']);
            $exchange_rate = max(1, $exchange_rate);
            update_option('telegram_services_wc_usd_to_toman_rate', $exchange_rate);
        }
        
        // Remove data on uninstall
        $remove_data = isset($_POST['remove_data_on_uninstall']) ? true : false;
        update_option('telegram_services_wc_remove_data_on_uninstall', $remove_data);
    }

    /**
     * Display the text editor page.
     *
     * @since    1.0.0
     */
    public function display_text_editor_page() {
        // Check if form was submitted
        if (isset($_POST['telegram_services_wc_text_editor_submit'])) {
            // Verify nonce
            if (check_admin_referer('telegram_services_wc_text_editor_nonce', 'telegram_services_wc_text_editor_nonce')) {
                // Process text editor form
                $this->process_text_editor_form();
                
                // Add admin notice
                add_settings_error(
                    'telegram_services_wc_text_editor',
                    'telegram_services_wc_text_updated',
                    __('Custom texts updated successfully.', 'telegram-services-wc'),
                    'success'
                );
            }
        }
        
        // Get available languages
        $languages = Telegram_Services_WC_i18n::get_available_languages();
        
        // Get current language selection
        $current_language = isset($_GET['language']) ? sanitize_text_field($_GET['language']) : 'en_US';
        
        // Make sure it's a valid language
        if (!isset($languages[$current_language])) {
            $current_language = 'en_US';
        }
        
        // Get custom texts for the selected language
        $custom_texts = get_option('telegram_services_wc_custom_texts', array());
        $language_texts = isset($custom_texts[$current_language]) ? $custom_texts[$current_language] : array();
        
        // Define text groups
        $text_groups = array(
            'general' => array(
                'title' => __('General', 'telegram-services-wc'),
                'texts' => array(
                    'site_title' => __('Site Title', 'telegram-services-wc'),
                    'site_description' => __('Site Description', 'telegram-services-wc'),
                ),
            ),
            'homepage' => array(
                'title' => __('Homepage', 'telegram-services-wc'),
                'texts' => array(
                    'hero_title' => __('Hero Title', 'telegram-services-wc'),
                    'hero_subtitle' => __('Hero Subtitle', 'telegram-services-wc'),
                    'hero_cta' => __('Hero Call to Action', 'telegram-services-wc'),
                    'services_title' => __('Services Section Title', 'telegram-services-wc'),
                    'services_description' => __('Services Section Description', 'telegram-services-wc'),
                ),
            ),
            'stars' => array(
                'title' => __('Telegram Stars', 'telegram-services-wc'),
                'texts' => array(
                    'stars_title' => __('Stars Title', 'telegram-services-wc'),
                    'stars_description' => __('Stars Description', 'telegram-services-wc'),
                    'stars_per_unit' => __('Stars Per Unit Text', 'telegram-services-wc'),
                    'stars_feature_1' => __('Stars Feature 1', 'telegram-services-wc'),
                    'stars_feature_2' => __('Stars Feature 2', 'telegram-services-wc'),
                    'stars_feature_3' => __('Stars Feature 3', 'telegram-services-wc'),
                    'stars_buy_button' => __('Stars Buy Button', 'telegram-services-wc'),
                ),
            ),
            'premium' => array(
                'title' => __('Telegram Premium', 'telegram-services-wc'),
                'texts' => array(
                    'premium_title' => __('Premium Title', 'telegram-services-wc'),
                    'premium_description' => __('Premium Description', 'telegram-services-wc'),
                    'premium_per_unit' => __('Premium Per Unit Text', 'telegram-services-wc'),
                    'premium_feature_1' => __('Premium Feature 1', 'telegram-services-wc'),
                    'premium_feature_2' => __('Premium Feature 2', 'telegram-services-wc'),
                    'premium_feature_3' => __('Premium Feature 3', 'telegram-services-wc'),
                    'premium_buy_button' => __('Premium Buy Button', 'telegram-services-wc'),
                ),
            ),
            'checkout' => array(
                'title' => __('Checkout', 'telegram-services-wc'),
                'texts' => array(
                    'telegram_id_label' => __('Telegram ID Label', 'telegram-services-wc'),
                    'telegram_id_placeholder' => __('Telegram ID Placeholder', 'telegram-services-wc'),
                    'telegram_phone_label' => __('Phone Number Label', 'telegram-services-wc'),
                    'telegram_phone_placeholder' => __('Phone Number Placeholder', 'telegram-services-wc'),
                ),
            ),
        );
        
        // Display the text editor page
        include TELEGRAM_SERVICES_WC_PLUGIN_DIR . 'admin/partials/text-editor-page.php';
    }



    /**
     * Process the text editor form.
     *
     * @since    1.0.0
     */
    private function process_text_editor_form() {
        // Get current language
        $current_language = sanitize_text_field($_POST['current_language']);
        
        // Get custom texts
        $custom_texts = get_option('telegram_services_wc_custom_texts', array());
        
        // Initialize array for current language if not exists
        if (!isset($custom_texts[$current_language])) {
            $custom_texts[$current_language] = array();
        }
        
        // Process each text field
        foreach ($_POST as $key => $value) {
            if (strpos($key, 'custom_text_') === 0) {
                $text_key = substr($key, 12); // Remove 'custom_text_' prefix
                $custom_texts[$current_language][$text_key] = sanitize_text_field($value);
            }
        }
        
        // Save custom texts
        update_option('telegram_services_wc_custom_texts', $custom_texts);
    }

    /**
     * Add plugin settings link on plugins page.
     *
     * @since    1.0.0
     * @param    array    $links    Plugin action links.
     * @return   array    Modified plugin action links.
     */
    public function add_plugin_settings_link($links) {
        $settings_link = '<a href="' . admin_url('admin.php?page=telegram-services-wc-settings') . '">' . __('Settings', 'telegram-services-wc') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Register plugin settings.
     *
     * @since    1.0.0
     */
    public function register_settings() {
        register_setting('telegram_services_wc_settings', 'telegram_services_wc_commission_percentage', 'floatval');
        register_setting('telegram_services_wc_settings', 'telegram_services_wc_usd_to_toman_rate', 'intval');
        register_setting('telegram_services_wc_settings', 'telegram_services_wc_remove_data_on_uninstall', 'boolval');
        register_setting('telegram_services_wc_settings', 'telegram_services_wc_custom_texts', array($this, 'sanitize_custom_texts'));
    }

    /**
     * Sanitize custom texts.
     *
     * @since    1.0.0
     * @param    array    $texts    Custom texts.
     * @return   array    Sanitized custom texts.
     */
    public function sanitize_custom_texts($texts) {
        $sanitized_texts = array();
        
        if (is_array($texts)) {
            foreach ($texts as $language => $language_texts) {
                $sanitized_texts[$language] = array();
                
                if (is_array($language_texts)) {
                    foreach ($language_texts as $key => $value) {
                        $sanitized_texts[$language][$key] = sanitize_text_field($value);
                    }
                }
            }
        }
        
        return $sanitized_texts;
    }

    /**
     * Add meta boxes for Telegram order details.
     *
     * @since    1.0.0
     */
    public function add_telegram_order_meta_boxes() {
        add_meta_box(
            'telegram_order_details',
            __('Telegram Details', 'telegram-services-wc'),
            array($this, 'render_telegram_order_meta_box'),
            'shop_order',
            'side',
            'default'
        );
    }

    /**
     * Render Telegram order meta box.
     *
     * @since    1.0.0
     * @param    WP_Post    $post    The post object.
     */
    public function render_telegram_order_meta_box($post) {
        $order = wc_get_order($post->ID);
        if (!$order) {
            return;
        }

        // Get Telegram details from order meta
        $telegram_id = get_post_meta($post->ID, '_telegram_id', true);
        $phone_number = get_post_meta($post->ID, '_telegram_phone', true);

        // Check if order contains Telegram products
        $has_telegram_product = false;
        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            $product_type = WC_Product_Factory::get_product_type($product_id);
            
            if ('telegram_service' === $product_type) {
                $has_telegram_product = true;
                break;
            }
        }

        if (!$has_telegram_product) {
            echo '<p>' . __('This order does not contain any Telegram services.', 'telegram-services-wc') . '</p>';
            return;
        }

        wp_nonce_field('save_telegram_order_meta_box_data', 'telegram_order_meta_box_nonce');
        ?>
        <div class="telegram-order-details">
            <p>
                <label for="telegram_id"><?php _e('Telegram ID:', 'telegram-services-wc'); ?></label><br>
                <input type="text" id="telegram_id" name="telegram_id" value="<?php echo esc_attr($telegram_id); ?>" class="widefat">
            </p>
            <p>
                <label for="telegram_phone"><?php _e('Phone Number:', 'telegram-services-wc'); ?></label><br>
                <input type="text" id="telegram_phone" name="telegram_phone" value="<?php echo esc_attr($phone_number); ?>" class="widefat">
            </p>
        </div>
        <?php

        // Get order details from our custom table
        global $wpdb;
        $table_name = $wpdb->prefix . 'telegram_order_details';
        $details = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_name WHERE order_id = %d",
                $post->ID
            )
        );

        if (!empty($details)) {
            echo '<h4>' . __('Service Status', 'telegram-services-wc') . '</h4>';
            echo '<div class="telegram-service-status">';
            
            foreach ($details as $detail) {
                $status_options = array(
                    'pending' => __('Pending', 'telegram-services-wc'),
                    'processing' => __('Processing', 'telegram-services-wc'),
                    'completed' => __('Completed', 'telegram-services-wc'),
                    'failed' => __('Failed', 'telegram-services-wc'),
                );
                
                echo '<p><strong>' . esc_html(ucfirst($detail->service_type)) . ' (' . esc_html($detail->quantity) . ')</strong></p>';
                echo '<p>';
                echo '<select name="telegram_service_status_' . esc_attr($detail->id) . '" class="widefat">';
                
                foreach ($status_options as $status_key => $status_label) {
                    echo '<option value="' . esc_attr($status_key) . '"' . selected($detail->status, $status_key, false) . '>' . esc_html($status_label) . '</option>';
                }
                
                echo '</select>';
                echo '</p>';
            }
            
            echo '</div>';
        }
    }

    /**
     * Save Telegram order meta box data.
     *
     * @since    1.0.0
     * @param    int    $post_id    The post ID.
     */
    public function save_telegram_order_meta_box_data($post_id) {
        // Check if our nonce is set
        if (!isset($_POST['telegram_order_meta_box_nonce'])) {
            return;
        }

        // Verify the nonce
        if (!wp_verify_nonce($_POST['telegram_order_meta_box_nonce'], 'save_telegram_order_meta_box_data')) {
            return;
        }

        // Check user permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Save Telegram ID and phone number
        if (isset($_POST['telegram_id'])) {
            update_post_meta($post_id, '_telegram_id', sanitize_text_field($_POST['telegram_id']));
        }

        if (isset($_POST['telegram_phone'])) {
            update_post_meta($post_id, '_telegram_phone', sanitize_text_field($_POST['telegram_phone']));
        }

        // Update service statuses
        global $wpdb;
        $table_name = $wpdb->prefix . 'telegram_order_details';
        $details = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id FROM $table_name WHERE order_id = %d",
                $post_id
            )
        );

        foreach ($details as $detail) {
            $status_field = 'telegram_service_status_' . $detail->id;
            
            if (isset($_POST[$status_field])) {
                $status = sanitize_text_field($_POST[$status_field]);
                $valid_statuses = array('pending', 'processing', 'completed', 'failed');
                
                if (in_array($status, $valid_statuses, true)) {
                    Telegram_Services_WC_Order::update_telegram_order_status($detail->id, $status);
                }
            }
        }
    }

    /**
     * Register REST API endpoints.
     *
     * @since    1.0.0
     */
    public function register_rest_api_endpoints() {
        // Register endpoint for getting services
        register_rest_route('telegram-services-wc/v1', '/services', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_services_api'),
            'permission_callback' => '__return_true',
        ));

        // Register endpoint for getting custom texts
        register_rest_route('telegram-services-wc/v1', '/texts/(?P<language>[a-z_]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_texts_api'),
            'permission_callback' => '__return_true',
            'args' => array(
                'language' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ));
    }

    /**
     * API callback for getting services.
     *
     * @since    1.0.0
     * @param    WP_REST_Request    $request    Full data about the request.
     * @return   WP_REST_Response               Response data.
     */
    public function get_services_api($request) {
        $type = $request->get_param('type');
        
        if (empty($type) || !in_array($type, array('stars', 'premium'), true)) {
            $stars_products = Telegram_Services_WC_Product::get_products_by_service_type('stars');
            $premium_products = Telegram_Services_WC_Product::get_products_by_service_type('premium');
            
            $services = array(
                'stars' => $this->format_products_for_api($stars_products),
                'premium' => $this->format_products_for_api($premium_products),
            );
            
            return rest_ensure_response($services);
        }
        
        $products = Telegram_Services_WC_Product::get_products_by_service_type($type);
        $services = $this->format_products_for_api($products);
        
        return rest_ensure_response($services);
    }

    /**
     * Format products for API response.
     *
     * @since    1.0.0
     * @param    array    $products    Array of WC_Product objects.
     * @return   array                 Formatted products.
     */
    private function format_products_for_api($products) {
        $formatted = array();
        
        foreach ($products as $product) {
            $formatted[] = array(
                'id' => $product->get_id(),
                'name' => $product->get_name(),
                'price' => (float) $product->get_price(),
                'formatted_price' => Telegram_Services_WC_i18n::format_price((float) $product->get_price()),
                'type' => get_post_meta($product->get_id(), '_telegram_service_type', true),
                'quantity' => (int) get_post_meta($product->get_id(), '_telegram_service_quantity', true),
                'url' => $product->get_permalink(),
            );
        }
        
        return $formatted;
    }

    /**
     * API callback for getting custom texts.
     *
     * @since    1.0.0
     * @param    WP_REST_Request    $request    Full data about the request.
     * @return   WP_REST_Response               Response data.
     */
    public function get_texts_api($request) {
        $language = $request->get_param('language');
        
        // Map language codes if needed
        $language_map = array(
            'en' => 'en_US',
            'fa' => 'fa_IR',
        );
        
        if (isset($language_map[$language])) {
            $language = $language_map[$language];
        }
        
        // Check if language is supported
        $available_languages = array_keys(Telegram_Services_WC_i18n::get_available_languages());
        
        if (!in_array($language, $available_languages, true)) {
            return new WP_Error(
                'invalid_language',
                __('The specified language is not supported.', 'telegram-services-wc'),
                array('status' => 400)
            );
        }
        
        // Get custom texts for the specified language
        $custom_texts = get_option('telegram_services_wc_custom_texts', array());
        $language_texts = isset($custom_texts[$language]) ? $custom_texts[$language] : array();
        
        return rest_ensure_response($language_texts);
    }
}