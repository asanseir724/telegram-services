<?php
/**
 * Handles order-related functionality for Telegram services.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */

/**
 * Handles order-related functionality for Telegram services.
 *
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */
class Telegram_Services_WC_Order {

    /**
     * Process a Telegram order when order status changes.
     *
     * @since    1.0.0
     * @param    int       $order_id    The order ID.
     * @param    string    $old_status  The old order status.
     * @param    string    $new_status  The new order status.
     */
    public function process_telegram_order($order_id, $old_status, $new_status) {
        // Only process completed orders
        if ('completed' !== $new_status) {
            return;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

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
            return;
        }

        // Get Telegram details from order meta
        $telegram_id = get_post_meta($order_id, '_telegram_id', true);
        $phone_number = get_post_meta($order_id, '_telegram_phone', true);

        if (empty($telegram_id) || empty($phone_number)) {
            // Log that the order is missing required details
            $order->add_order_note(__('Order cannot be processed: Missing Telegram details.', 'telegram-services-wc'));
            return;
        }

        // Process each Telegram product in the order
        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            $product_type = WC_Product_Factory::get_product_type($product_id);
            
            if ('telegram_service' !== $product_type) {
                continue;
            }

            $service_type = get_post_meta($product_id, '_telegram_service_type', true);
            $quantity = get_post_meta($product_id, '_telegram_service_quantity', true);

            // Add details to our custom table
            $this->save_telegram_order_details($order_id, $telegram_id, $phone_number, $service_type, $quantity);

            // Mark as processed in the order
            $order->add_order_note(
                sprintf(
                    __('Telegram service scheduled: %s, Telegram ID: %s, Phone: %s', 'telegram-services-wc'),
                    $item->get_name(),
                    $telegram_id,
                    $phone_number
                )
            );
        }
    }

    /**
     * Save Telegram order details to custom table.
     *
     * @since    1.0.0
     * @param    int       $order_id      The order ID.
     * @param    string    $telegram_id   The Telegram ID.
     * @param    string    $phone_number  The phone number.
     * @param    string    $service_type  The service type.
     * @param    int       $quantity      The quantity.
     * @return   int|bool  The inserted ID or false on failure.
     */
    private function save_telegram_order_details($order_id, $telegram_id, $phone_number, $service_type, $quantity) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'telegram_order_details';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'order_id'      => $order_id,
                'telegram_id'   => $telegram_id,
                'phone_number'  => $phone_number,
                'service_type'  => $service_type,
                'quantity'      => $quantity,
                'status'        => 'pending',
                'created_at'    => current_time('mysql'),
            ),
            array(
                '%d',
                '%s',
                '%s',
                '%s',
                '%d',
                '%s',
                '%s',
            )
        );
        
        return $result ? $wpdb->insert_id : false;
    }

    /**
     * Add Telegram details to order emails.
     *
     * @since    1.0.0
     * @param    WC_Order  $order           The order object.
     * @param    bool      $sent_to_admin   Whether the email is sent to admin.
     * @param    bool      $plain_text      Whether the email is plain text.
     * @param    WC_Email  $email           The email object.
     */
    public function add_telegram_details_to_emails($order, $sent_to_admin, $plain_text, $email) {
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
            return;
        }

        // Get Telegram details from order meta
        $telegram_id = get_post_meta($order->get_id(), '_telegram_id', true);
        $phone_number = get_post_meta($order->get_id(), '_telegram_phone', true);

        if (empty($telegram_id) && empty($phone_number)) {
            return;
        }

        if ($plain_text) {
            echo "\n\n" . __('Telegram Details', 'telegram-services-wc') . "\n";
            echo __('Telegram ID', 'telegram-services-wc') . ': ' . $telegram_id . "\n";
            echo __('Phone Number', 'telegram-services-wc') . ': ' . $phone_number . "\n";
        } else {
            ?>
            <div style="margin-bottom: 40px;">
                <h2><?php _e('Telegram Details', 'telegram-services-wc'); ?></h2>
                <table class="td" cellspacing="0" cellpadding="6" style="width: 100%; margin-bottom: 20px; font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;">
                    <tbody>
                        <tr>
                            <th class="td" scope="row" style="text-align:left;"><?php _e('Telegram ID', 'telegram-services-wc'); ?>:</th>
                            <td class="td" style="text-align:left;"><?php echo esc_html($telegram_id); ?></td>
                        </tr>
                        <tr>
                            <th class="td" scope="row" style="text-align:left;"><?php _e('Phone Number', 'telegram-services-wc'); ?>:</th>
                            <td class="td" style="text-align:left;"><?php echo esc_html($phone_number); ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <?php
        }
    }

    /**
     * Display Telegram order details on the order view page.
     *
     * @since    1.0.0
     * @param    WC_Order  $order    The order object.
     */
    public function display_telegram_order_details($order) {
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
            return;
        }

        // Get Telegram details from order meta
        $telegram_id = get_post_meta($order->get_id(), '_telegram_id', true);
        $phone_number = get_post_meta($order->get_id(), '_telegram_phone', true);

        if (empty($telegram_id) && empty($phone_number)) {
            return;
        }

        // Get order details from our custom table
        global $wpdb;
        $table_name = $wpdb->prefix . 'telegram_order_details';
        $details = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_name WHERE order_id = %d",
                $order->get_id()
            )
        );
        ?>
        <div class="woocommerce-column">
            <h2><?php _e('Telegram Details', 'telegram-services-wc'); ?></h2>
            <table class="woocommerce-table woocommerce-table--telegram-details shop_table telegram_details">
                <tbody>
                    <tr>
                        <th><?php _e('Telegram ID', 'telegram-services-wc'); ?></th>
                        <td><?php echo esc_html($telegram_id); ?></td>
                    </tr>
                    <tr>
                        <th><?php _e('Phone Number', 'telegram-services-wc'); ?></th>
                        <td><?php echo esc_html($phone_number); ?></td>
                    </tr>
                </tbody>
            </table>

            <?php if (!empty($details)) : ?>
                <h3><?php _e('Service Status', 'telegram-services-wc'); ?></h3>
                <table class="woocommerce-table woocommerce-table--telegram-status shop_table telegram_status">
                    <thead>
                        <tr>
                            <th><?php _e('Service Type', 'telegram-services-wc'); ?></th>
                            <th><?php _e('Quantity', 'telegram-services-wc'); ?></th>
                            <th><?php _e('Status', 'telegram-services-wc'); ?></th>
                            <th><?php _e('Date', 'telegram-services-wc'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($details as $detail) : ?>
                            <tr>
                                <td><?php echo esc_html(ucfirst($detail->service_type)); ?></td>
                                <td><?php echo esc_html($detail->quantity); ?></td>
                                <td>
                                    <?php
                                    $status_label = __('Pending', 'telegram-services-wc');
                                    if ('completed' === $detail->status) {
                                        $status_label = __('Completed', 'telegram-services-wc');
                                    } elseif ('processing' === $detail->status) {
                                        $status_label = __('Processing', 'telegram-services-wc');
                                    } elseif ('failed' === $detail->status) {
                                        $status_label = __('Failed', 'telegram-services-wc');
                                    }
                                    echo esc_html($status_label);
                                    ?>
                                </td>
                                <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($detail->created_at))); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Get all Telegram orders.
     *
     * @since    1.0.0
     * @param    array     $args       Query arguments.
     * @return   array     Array of Telegram orders.
     */
    public static function get_telegram_orders($args = array()) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'telegram_order_details';
        
        $defaults = array(
            'status'     => '',
            'limit'      => 20,
            'offset'     => 0,
            'orderby'    => 'id',
            'order'      => 'DESC',
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $sql = "SELECT * FROM $table_name";
        $where = array();
        $prepare = array();
        
        if (!empty($args['status'])) {
            $where[] = "status = %s";
            $prepare[] = $args['status'];
        }
        
        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        
        $sql .= " ORDER BY {$args['orderby']} {$args['order']} LIMIT %d OFFSET %d";
        $prepare[] = $args['limit'];
        $prepare[] = $args['offset'];
        
        if (!empty($prepare)) {
            $sql = $wpdb->prepare($sql, $prepare);
        }
        
        $results = $wpdb->get_results($sql);
        
        return $results;
    }

    /**
     * Update Telegram order status.
     *
     * @since    1.0.0
     * @param    int       $order_detail_id    The order detail ID.
     * @param    string    $status             The new status.
     * @return   bool      Whether the update was successful.
     */
    public static function update_telegram_order_status($order_detail_id, $status) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'telegram_order_details';
        
        $result = $wpdb->update(
            $table_name,
            array(
                'status' => $status,
                'completed_at' => 'completed' === $status ? current_time('mysql') : null,
            ),
            array('id' => $order_detail_id),
            array('%s', '%s'),
            array('%d')
        );
        
        if ($result) {
            // Get the order ID for this detail
            $order_id = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT order_id FROM $table_name WHERE id = %d",
                    $order_detail_id
                )
            );
            
            if ($order_id) {
                $order = wc_get_order($order_id);
                if ($order) {
                    $detail = $wpdb->get_row(
                        $wpdb->prepare(
                            "SELECT * FROM $table_name WHERE id = %d",
                            $order_detail_id
                        )
                    );
                    
                    $order->add_order_note(
                        sprintf(
                            __('Telegram service status updated to %s for %s service, Telegram ID: %s', 'telegram-services-wc'),
                            ucfirst($status),
                            ucfirst($detail->service_type),
                            $detail->telegram_id
                        )
                    );
                }
            }
            
            return true;
        }
        
        return false;
    }
}