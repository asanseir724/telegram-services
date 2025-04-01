<?php
/**
 * Handles product-related functionality for Telegram services.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */

/**
 * Handles product-related functionality for Telegram services.
 *
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */
class Telegram_Services_WC_Product {

    /**
     * Add 'telegram_service' to product type dropdown.
     *
     * @since    1.0.0
     * @param    array    $types    Product types.
     * @return   array    Modified product types.
     */
    public function add_telegram_product_type($types) {
        $types['telegram_service'] = __('Telegram Service', 'telegram-services-wc');
        return $types;
    }

    /**
     * Add a product data tab for Telegram services.
     *
     * @since    1.0.0
     * @param    array    $tabs    Product data tabs.
     * @return   array    Modified product data tabs.
     */
    public function add_telegram_product_data_tab($tabs) {
        $tabs['telegram_service'] = array(
            'label'    => __('Telegram Service', 'telegram-services-wc'),
            'target'   => 'telegram_service_options',
            'class'    => array('show_if_telegram_service'),
            'priority' => 21,
        );
        return $tabs;
    }

    /**
     * Add product data fields for Telegram services.
     *
     * @since    1.0.0
     */
    public function add_telegram_product_data_fields() {
        global $post;
        ?>
        <div id="telegram_service_options" class="panel woocommerce_options_panel hidden">
            <div class="options_group">
                <?php
                // Service Type
                woocommerce_wp_select(
                    array(
                        'id'          => '_telegram_service_type',
                        'label'       => __('Service Type', 'telegram-services-wc'),
                        'description' => __('Select the type of Telegram service', 'telegram-services-wc'),
                        'desc_tip'    => true,
                        'options'     => array(
                            'stars'    => __('Telegram Stars', 'telegram-services-wc'),
                            'premium'  => __('Telegram Premium', 'telegram-services-wc'),
                        ),
                    )
                );

                // Quantity
                woocommerce_wp_text_input(
                    array(
                        'id'          => '_telegram_service_quantity',
                        'label'       => __('Quantity', 'telegram-services-wc'),
                        'description' => __('For Stars: number of stars. For Premium: number of months.', 'telegram-services-wc'),
                        'desc_tip'    => true,
                        'type'        => 'number',
                        'custom_attributes' => array(
                            'step' => '1',
                            'min'  => '1',
                        ),
                    )
                );

                // Requires telegram ID
                woocommerce_wp_checkbox(
                    array(
                        'id'          => '_telegram_requires_id',
                        'label'       => __('Require Telegram ID', 'telegram-services-wc'),
                        'description' => __('Check if this service requires the customer to provide their Telegram ID', 'telegram-services-wc'),
                        'desc_tip'    => true,
                    )
                );

                // Requires phone number
                woocommerce_wp_checkbox(
                    array(
                        'id'          => '_telegram_requires_phone',
                        'label'       => __('Require Phone Number', 'telegram-services-wc'),
                        'description' => __('Check if this service requires the customer to provide their phone number', 'telegram-services-wc'),
                        'desc_tip'    => true,
                    )
                );

                // Commission Percentage
                woocommerce_wp_text_input(
                    array(
                        'id'          => '_telegram_commission_percentage',
                        'label'       => __('Commission Percentage', 'telegram-services-wc'),
                        'description' => __('Your commission percentage on this service', 'telegram-services-wc'),
                        'desc_tip'    => true,
                        'type'        => 'number',
                        'custom_attributes' => array(
                            'step' => '0.01',
                            'min'  => '0',
                            'max'  => '100',
                        ),
                    )
                );
                ?>
            </div>
        </div>
        <?php
    }

    /**
     * Save Telegram service product data.
     *
     * @since    1.0.0
     * @param    int    $post_id    Product ID.
     */
    public function save_telegram_product_data_fields($post_id) {
        // Check product type
        $product_type = empty($_POST['product-type']) ? 'simple' : sanitize_text_field($_POST['product-type']);
        
        if ('telegram_service' !== $product_type) {
            return;
        }

        // Service type
        if (isset($_POST['_telegram_service_type'])) {
            update_post_meta($post_id, '_telegram_service_type', sanitize_text_field($_POST['_telegram_service_type']));
        }

        // Quantity
        if (isset($_POST['_telegram_service_quantity'])) {
            update_post_meta($post_id, '_telegram_service_quantity', (int) $_POST['_telegram_service_quantity']);
        }

        // Requires Telegram ID
        $requires_id = isset($_POST['_telegram_requires_id']) ? 'yes' : 'no';
        update_post_meta($post_id, '_telegram_requires_id', $requires_id);

        // Requires phone number
        $requires_phone = isset($_POST['_telegram_requires_phone']) ? 'yes' : 'no';
        update_post_meta($post_id, '_telegram_requires_phone', $requires_phone);

        // Commission percentage
        if (isset($_POST['_telegram_commission_percentage'])) {
            update_post_meta($post_id, '_telegram_commission_percentage', (float) $_POST['_telegram_commission_percentage']);
        }
    }

    /**
     * Get Telegram products by service type.
     *
     * @since    1.0.0
     * @param    string    $service_type    The service type ('stars' or 'premium').
     * @return   array     Array of product objects.
     */
    public static function get_products_by_service_type($service_type) {
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => -1,
            'meta_query' => array(
                array(
                    'key' => '_telegram_service_type',
                    'value' => $service_type,
                ),
            ),
            'orderby' => 'meta_value_num',
            'meta_key' => '_telegram_service_quantity',
            'order' => 'ASC',
        );

        $products = array();
        $query = new WP_Query($args);

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $product = wc_get_product(get_the_ID());
                $products[] = $product;
            }
        }

        wp_reset_postdata();

        return $products;
    }

    /**
     * Create default Telegram products if they don't exist.
     *
     * @since    1.0.0
     */
    public static function create_default_products() {
        // Default Stars products
        $stars_products = array(
            array(
                'name' => '100 Telegram Stars',
                'type' => 'stars',
                'quantity' => 100,
                'price' => 10,
            ),
            array(
                'name' => '300 Telegram Stars',
                'type' => 'stars',
                'quantity' => 300,
                'price' => 28,
            ),
            array(
                'name' => '500 Telegram Stars',
                'type' => 'stars',
                'quantity' => 500,
                'price' => 45,
            ),
            array(
                'name' => '1000 Telegram Stars',
                'type' => 'stars',
                'quantity' => 1000,
                'price' => 85,
            ),
        );

        // Default Premium products
        $premium_products = array(
            array(
                'name' => '1 Month Telegram Premium',
                'type' => 'premium',
                'quantity' => 1,
                'price' => 5,
            ),
            array(
                'name' => '3 Months Telegram Premium',
                'type' => 'premium',
                'quantity' => 3,
                'price' => 14,
            ),
            array(
                'name' => '6 Months Telegram Premium',
                'type' => 'premium',
                'quantity' => 6,
                'price' => 26,
            ),
            array(
                'name' => '12 Months Telegram Premium',
                'type' => 'premium',
                'quantity' => 12,
                'price' => 45,
            ),
        );

        // Create Stars products
        foreach ($stars_products as $product_data) {
            self::create_telegram_product($product_data);
        }

        // Create Premium products
        foreach ($premium_products as $product_data) {
            self::create_telegram_product($product_data);
        }
    }

    /**
     * Create a Telegram product.
     *
     * @since    1.0.0
     * @param    array    $product_data    Product data.
     * @return   int      Product ID or 0 on failure.
     */
    public static function create_telegram_product($product_data) {
        // Check if a product with the same name already exists
        $existing_product = get_page_by_title($product_data['name'], OBJECT, 'product');
        
        if ($existing_product) {
            return 0;
        }

        // Set up the product data
        $product = array(
            'post_title' => $product_data['name'],
            'post_content' => '',
            'post_status' => 'publish',
            'post_type' => 'product',
        );

        // Insert the product
        $product_id = wp_insert_post($product);

        if (!$product_id) {
            return 0;
        }

        // Set product meta
        wp_set_object_terms($product_id, 'telegram_service', 'product_type');
        
        // Set category
        $category_slug = 'telegram-' . $product_data['type'];
        $term = get_term_by('slug', $category_slug, 'product_cat');
        
        if ($term) {
            wp_set_object_terms($product_id, $term->term_id, 'product_cat');
        }

        // Set product data
        update_post_meta($product_id, '_regular_price', $product_data['price']);
        update_post_meta($product_id, '_price', $product_data['price']);
        update_post_meta($product_id, '_telegram_service_type', $product_data['type']);
        update_post_meta($product_id, '_telegram_service_quantity', $product_data['quantity']);
        update_post_meta($product_id, '_telegram_requires_id', 'yes');
        update_post_meta($product_id, '_telegram_requires_phone', 'yes');
        
        // Set default commission percentage
        $default_commission = get_option('telegram_services_wc_commission_percentage', 5);
        update_post_meta($product_id, '_telegram_commission_percentage', $default_commission);

        // Virtual product
        update_post_meta($product_id, '_virtual', 'yes');
        update_post_meta($product_id, '_downloadable', 'no');
        update_post_meta($product_id, '_manage_stock', 'no');
        update_post_meta($product_id, '_visibility', 'visible');

        return $product_id;
    }
}