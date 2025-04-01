<?php
/**
 * The public-facing functionality of the plugin.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two hooks for
 * enqueuing the public-facing stylesheet and JavaScript.
 *
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/public
 */
class Telegram_Services_WC_Public {

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
     * @param    string    $plugin_name       The name of the plugin.
     * @param    string    $version           The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Register the stylesheets for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            TELEGRAM_SERVICES_WC_PLUGIN_URL . 'public/css/telegram-services-wc-public.css',
            array(),
            $this->version,
            'all'
        );

        // RTL styles if needed
        if (Telegram_Services_WC_i18n::is_rtl()) {
            wp_enqueue_style(
                $this->plugin_name . '-rtl',
                TELEGRAM_SERVICES_WC_PLUGIN_URL . 'public/css/telegram-services-wc-public-rtl.css',
                array($this->plugin_name),
                $this->version,
                'all'
            );
        }
    }

    /**
     * Register the JavaScript for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name,
            TELEGRAM_SERVICES_WC_PLUGIN_URL . 'public/js/telegram-services-wc-public.js',
            array('jquery'),
            $this->version,
            false
        );

        // Add localized script data
        wp_localize_script(
            $this->plugin_name,
            'telegram_services_wc_public',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('telegram_services_wc_public_nonce'),
                'is_rtl' => Telegram_Services_WC_i18n::is_rtl(),
                'currency_symbol' => Telegram_Services_WC_i18n::get_currency_symbol(),
                'language' => Telegram_Services_WC_i18n::get_current_language(),
            )
        );
    }

    /**
     * Register shortcodes.
     *
     * @since    1.0.0
     */
    public function register_shortcodes() {
        add_shortcode('telegram_stars_products', array($this, 'render_stars_products_shortcode'));
        add_shortcode('telegram_premium_products', array($this, 'render_premium_products_shortcode'));
        add_shortcode('telegram_services_grid', array($this, 'render_services_grid_shortcode'));
    }

    /**
     * Render Telegram Stars products shortcode.
     *
     * @since    1.0.0
     * @param    array    $atts    Shortcode attributes.
     * @return   string            Shortcode output.
     */
    public function render_stars_products_shortcode($atts) {
        $atts = shortcode_atts(
            array(
                'columns' => '3',
                'orderby' => 'price', // price, quantity, title
                'order' => 'asc', // asc, desc
            ),
            $atts,
            'telegram_stars_products'
        );

        $products = Telegram_Services_WC_Product::get_products_by_service_type('stars');

        // Sort products
        if ('price' === $atts['orderby']) {
            usort($products, function($a, $b) use ($atts) {
                $price_a = (float) $a->get_price();
                $price_b = (float) $b->get_price();
                return ('asc' === $atts['order']) ? ($price_a - $price_b) : ($price_b - $price_a);
            });
        } elseif ('quantity' === $atts['orderby']) {
            usort($products, function($a, $b) use ($atts) {
                $quantity_a = (int) get_post_meta($a->get_id(), '_telegram_service_quantity', true);
                $quantity_b = (int) get_post_meta($b->get_id(), '_telegram_service_quantity', true);
                return ('asc' === $atts['order']) ? ($quantity_a - $quantity_b) : ($quantity_b - $quantity_a);
            });
        } elseif ('title' === $atts['orderby']) {
            usort($products, function($a, $b) use ($atts) {
                return ('asc' === $atts['order']) ? strcmp($a->get_name(), $b->get_name()) : strcmp($b->get_name(), $a->get_name());
            });
        }

        ob_start();

        if (empty($products)) {
            echo '<p>' . __('No Telegram Stars products found.', 'telegram-services-wc') . '</p>';
            return ob_get_clean();
        }

        $columns = absint($atts['columns']);
        if ($columns < 1) {
            $columns = 3;
        }
        ?>
        <div class="telegram-services-products-grid telegram-services-products-columns-<?php echo esc_attr($columns); ?>">
            <?php foreach ($products as $product) : ?>
                <div class="telegram-service-product">
                    <div class="telegram-service-product-inner">
                        <h3 class="telegram-service-title"><?php echo esc_html($product->get_name()); ?></h3>
                        <div class="telegram-service-price">
                            <?php echo Telegram_Services_WC_i18n::format_price((float) $product->get_price()); ?>
                        </div>
                        <div class="telegram-service-quantity">
                            <?php 
                            $quantity = (int) get_post_meta($product->get_id(), '_telegram_service_quantity', true);
                            echo sprintf(
                                /* translators: %d: stars quantity */
                                _n('%d Telegram Star', '%d Telegram Stars', $quantity, 'telegram-services-wc'),
                                $quantity
                            );
                            ?>
                        </div>
                        <div class="telegram-service-description">
                            <?php echo wp_kses_post($product->get_short_description()); ?>
                        </div>
                        <div class="telegram-service-button">
                            <a href="<?php echo esc_url($product->add_to_cart_url()); ?>" class="button add_to_cart_button">
                                <?php _e('Add to Cart', 'telegram-services-wc'); ?>
                            </a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Render Telegram Premium products shortcode.
     *
     * @since    1.0.0
     * @param    array    $atts    Shortcode attributes.
     * @return   string            Shortcode output.
     */
    public function render_premium_products_shortcode($atts) {
        $atts = shortcode_atts(
            array(
                'columns' => '3',
                'orderby' => 'price', // price, quantity, title
                'order' => 'asc', // asc, desc
            ),
            $atts,
            'telegram_premium_products'
        );

        $products = Telegram_Services_WC_Product::get_products_by_service_type('premium');

        // Sort products
        if ('price' === $atts['orderby']) {
            usort($products, function($a, $b) use ($atts) {
                $price_a = (float) $a->get_price();
                $price_b = (float) $b->get_price();
                return ('asc' === $atts['order']) ? ($price_a - $price_b) : ($price_b - $price_a);
            });
        } elseif ('quantity' === $atts['orderby']) {
            usort($products, function($a, $b) use ($atts) {
                $quantity_a = (int) get_post_meta($a->get_id(), '_telegram_service_quantity', true);
                $quantity_b = (int) get_post_meta($b->get_id(), '_telegram_service_quantity', true);
                return ('asc' === $atts['order']) ? ($quantity_a - $quantity_b) : ($quantity_b - $quantity_a);
            });
        } elseif ('title' === $atts['orderby']) {
            usort($products, function($a, $b) use ($atts) {
                return ('asc' === $atts['order']) ? strcmp($a->get_name(), $b->get_name()) : strcmp($b->get_name(), $a->get_name());
            });
        }

        ob_start();

        if (empty($products)) {
            echo '<p>' . __('No Telegram Premium products found.', 'telegram-services-wc') . '</p>';
            return ob_get_clean();
        }

        $columns = absint($atts['columns']);
        if ($columns < 1) {
            $columns = 3;
        }
        ?>
        <div class="telegram-services-products-grid telegram-services-products-columns-<?php echo esc_attr($columns); ?>">
            <?php foreach ($products as $product) : ?>
                <div class="telegram-service-product">
                    <div class="telegram-service-product-inner">
                        <h3 class="telegram-service-title"><?php echo esc_html($product->get_name()); ?></h3>
                        <div class="telegram-service-price">
                            <?php echo Telegram_Services_WC_i18n::format_price((float) $product->get_price()); ?>
                        </div>
                        <div class="telegram-service-quantity">
                            <?php 
                            $quantity = (int) get_post_meta($product->get_id(), '_telegram_service_quantity', true);
                            echo sprintf(
                                /* translators: %d: months quantity */
                                _n('%d Month', '%d Months', $quantity, 'telegram-services-wc'),
                                $quantity
                            );
                            ?>
                        </div>
                        <div class="telegram-service-description">
                            <?php echo wp_kses_post($product->get_short_description()); ?>
                        </div>
                        <div class="telegram-service-button">
                            <a href="<?php echo esc_url($product->add_to_cart_url()); ?>" class="button add_to_cart_button">
                                <?php _e('Add to Cart', 'telegram-services-wc'); ?>
                            </a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Render Telegram services grid shortcode.
     *
     * @since    1.0.0
     * @param    array    $atts    Shortcode attributes.
     * @return   string            Shortcode output.
     */
    public function render_services_grid_shortcode($atts) {
        $atts = shortcode_atts(
            array(
                'columns' => '2',
            ),
            $atts,
            'telegram_services_grid'
        );

        ob_start();
        ?>
        <div class="telegram-services-grid telegram-services-grid-columns-<?php echo esc_attr($atts['columns']); ?>">
            <div class="telegram-service-card telegram-stars-card">
                <div class="telegram-service-card-inner">
                    <div class="telegram-service-icon">
                        <span class="dashicons dashicons-star-filled"></span>
                    </div>
                    <h3 class="telegram-service-title">
                        <?php echo esc_html(Telegram_Services_WC_i18n::get_text('stars_title', __('Telegram Stars', 'telegram-services-wc'))); ?>
                    </h3>
                    <div class="telegram-service-description">
                        <?php echo esc_html(Telegram_Services_WC_i18n::get_text('stars_description', __('Increase your channel visibility with Telegram Stars.', 'telegram-services-wc'))); ?>
                    </div>
                    <ul class="telegram-service-features">
                        <li>
                            <?php echo esc_html(Telegram_Services_WC_i18n::get_text('stars_feature_1', __('Improve channel visibility', 'telegram-services-wc'))); ?>
                        </li>
                        <li>
                            <?php echo esc_html(Telegram_Services_WC_i18n::get_text('stars_feature_2', __('Increase engagement', 'telegram-services-wc'))); ?>
                        </li>
                        <li>
                            <?php echo esc_html(Telegram_Services_WC_i18n::get_text('stars_feature_3', __('Boost channel ranking', 'telegram-services-wc'))); ?>
                        </li>
                    </ul>
                    <div class="telegram-service-button">
                        <a href="<?php echo esc_url(get_permalink(wc_get_page_id('shop')) . '?product_cat=telegram-stars'); ?>" class="button">
                            <?php echo esc_html(Telegram_Services_WC_i18n::get_text('stars_buy_button', __('Buy Stars', 'telegram-services-wc'))); ?>
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="telegram-service-card telegram-premium-card">
                <div class="telegram-service-card-inner">
                    <div class="telegram-service-icon">
                        <span class="dashicons dashicons-awards"></span>
                    </div>
                    <h3 class="telegram-service-title">
                        <?php echo esc_html(Telegram_Services_WC_i18n::get_text('premium_title', __('Telegram Premium', 'telegram-services-wc'))); ?>
                    </h3>
                    <div class="telegram-service-description">
                        <?php echo esc_html(Telegram_Services_WC_i18n::get_text('premium_description', __('Unlock all Telegram Premium features.', 'telegram-services-wc'))); ?>
                    </div>
                    <ul class="telegram-service-features">
                        <li>
                            <?php echo esc_html(Telegram_Services_WC_i18n::get_text('premium_feature_1', __('Upload larger files', 'telegram-services-wc'))); ?>
                        </li>
                        <li>
                            <?php echo esc_html(Telegram_Services_WC_i18n::get_text('premium_feature_2', __('Follow more channels', 'telegram-services-wc'))); ?>
                        </li>
                        <li>
                            <?php echo esc_html(Telegram_Services_WC_i18n::get_text('premium_feature_3', __('Access to premium stickers', 'telegram-services-wc'))); ?>
                        </li>
                    </ul>
                    <div class="telegram-service-button">
                        <a href="<?php echo esc_url(get_permalink(wc_get_page_id('shop')) . '?product_cat=telegram-premium'); ?>" class="button">
                            <?php echo esc_html(Telegram_Services_WC_i18n::get_text('premium_buy_button', __('Get Premium', 'telegram-services-wc'))); ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Add Telegram checkout fields.
     *
     * @since    1.0.0
     * @param    WC_Checkout    $checkout    Checkout object.
     */
    public function add_telegram_checkout_fields($checkout) {
        // Check if cart contains Telegram products
        $cart_has_telegram_product = false;
        $requires_telegram_id = false;
        $requires_phone = false;
        
        foreach (WC()->cart->get_cart() as $cart_item) {
            $product_id = $cart_item['product_id'];
            $product_type = WC_Product_Factory::get_product_type($product_id);
            
            if ('telegram_service' === $product_type) {
                $cart_has_telegram_product = true;
                
                if ('yes' === get_post_meta($product_id, '_telegram_requires_id', true)) {
                    $requires_telegram_id = true;
                }
                
                if ('yes' === get_post_meta($product_id, '_telegram_requires_phone', true)) {
                    $requires_phone = true;
                }
            }
        }
        
        if (!$cart_has_telegram_product) {
            return;
        }
        
        echo '<div id="telegram_checkout_fields"><h3>' . __('Telegram Information', 'telegram-services-wc') . '</h3>';
        
        if ($requires_telegram_id) {
            woocommerce_form_field('telegram_id', array(
                'type' => 'text',
                'class' => array('form-row-wide'),
                'label' => Telegram_Services_WC_i18n::get_text('telegram_id_label', __('Telegram ID', 'telegram-services-wc')),
                'placeholder' => Telegram_Services_WC_i18n::get_text('telegram_id_placeholder', __('Your Telegram username or numeric ID', 'telegram-services-wc')),
                'required' => true,
            ), $checkout->get_value('telegram_id'));
        }
        
        if ($requires_phone) {
            woocommerce_form_field('telegram_phone', array(
                'type' => 'tel',
                'class' => array('form-row-wide'),
                'label' => Telegram_Services_WC_i18n::get_text('telegram_phone_label', __('Phone Number', 'telegram-services-wc')),
                'placeholder' => Telegram_Services_WC_i18n::get_text('telegram_phone_placeholder', __('Phone number linked to your Telegram account', 'telegram-services-wc')),
                'required' => true,
            ), $checkout->get_value('telegram_phone'));
        }
        
        echo '</div>';
    }

    /**
     * Validate Telegram checkout fields.
     *
     * @since    1.0.0
     */
    public function validate_telegram_checkout_fields() {
        // Check if cart contains Telegram products
        $cart_has_telegram_product = false;
        $requires_telegram_id = false;
        $requires_phone = false;
        
        foreach (WC()->cart->get_cart() as $cart_item) {
            $product_id = $cart_item['product_id'];
            $product_type = WC_Product_Factory::get_product_type($product_id);
            
            if ('telegram_service' === $product_type) {
                $cart_has_telegram_product = true;
                
                if ('yes' === get_post_meta($product_id, '_telegram_requires_id', true)) {
                    $requires_telegram_id = true;
                }
                
                if ('yes' === get_post_meta($product_id, '_telegram_requires_phone', true)) {
                    $requires_phone = true;
                }
            }
        }
        
        if (!$cart_has_telegram_product) {
            return;
        }
        
        if ($requires_telegram_id && empty($_POST['telegram_id'])) {
            wc_add_notice(__('Please enter your Telegram ID.', 'telegram-services-wc'), 'error');
        }
        
        if ($requires_phone && empty($_POST['telegram_phone'])) {
            wc_add_notice(__('Please enter your phone number linked to your Telegram account.', 'telegram-services-wc'), 'error');
        }
    }

    /**
     * Save Telegram checkout fields.
     *
     * @since    1.0.0
     * @param    int    $order_id    Order ID.
     */
    public function save_telegram_checkout_fields($order_id) {
        if (isset($_POST['telegram_id'])) {
            update_post_meta($order_id, '_telegram_id', sanitize_text_field($_POST['telegram_id']));
        }
        
        if (isset($_POST['telegram_phone'])) {
            update_post_meta($order_id, '_telegram_phone', sanitize_text_field($_POST['telegram_phone']));
        }
    }
}