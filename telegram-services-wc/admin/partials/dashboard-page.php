<?php
/**
 * The admin dashboard page of the plugin.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="telegram-services-dashboard">
        <div class="telegram-services-stats">
            <div class="telegram-services-stat-card orders-total">
                <h3><?php _e('Total Orders', 'telegram-services-wc'); ?></h3>
                <div class="telegram-services-stat-value"><?php echo esc_html($total_orders); ?></div>
            </div>
            
            <div class="telegram-services-stat-card orders-pending">
                <h3><?php _e('Pending Orders', 'telegram-services-wc'); ?></h3>
                <div class="telegram-services-stat-value"><?php echo esc_html($pending_orders); ?></div>
            </div>
            
            <div class="telegram-services-stat-card orders-completed">
                <h3><?php _e('Completed Orders', 'telegram-services-wc'); ?></h3>
                <div class="telegram-services-stat-value"><?php echo esc_html($completed_orders); ?></div>
            </div>
            
            <div class="telegram-services-stat-card revenue">
                <h3><?php _e('Total Revenue', 'telegram-services-wc'); ?></h3>
                <div class="telegram-services-stat-value"><?php echo wc_price($total_revenue); ?></div>
            </div>
        </div>
        
        <div class="telegram-services-revenue-breakdown">
            <div class="telegram-services-recent-orders">
                <h3><?php _e('Recent Orders', 'telegram-services-wc'); ?></h3>
                
                <?php if (empty($recent_orders)) : ?>
                    <p><?php _e('No orders found.', 'telegram-services-wc'); ?></p>
                <?php else : ?>
                    <table class="telegram-services-orders-table">
                        <thead>
                            <tr>
                                <th><?php _e('Order ID', 'telegram-services-wc'); ?></th>
                                <th><?php _e('Telegram ID', 'telegram-services-wc'); ?></th>
                                <th><?php _e('Service', 'telegram-services-wc'); ?></th>
                                <th><?php _e('Quantity', 'telegram-services-wc'); ?></th>
                                <th><?php _e('Status', 'telegram-services-wc'); ?></th>
                                <th><?php _e('Date', 'telegram-services-wc'); ?></th>
                                <th><?php _e('Actions', 'telegram-services-wc'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recent_orders as $order) : ?>
                                <tr>
                                    <td>
                                        <a href="<?php echo esc_url(admin_url('post.php?post=' . $order->order_id . '&action=edit')); ?>">
                                            #<?php echo esc_html($order->order_id); ?>
                                        </a>
                                    </td>
                                    <td><?php echo esc_html($order->telegram_id); ?></td>
                                    <td><?php echo esc_html(ucfirst($order->service_type)); ?></td>
                                    <td><?php echo esc_html($order->quantity); ?></td>
                                    <td>
                                        <span class="telegram-services-status <?php echo esc_attr($order->status); ?>">
                                            <?php echo esc_html(ucfirst($order->status)); ?>
                                        </span>
                                    </td>
                                    <td><?php echo esc_html(date_i18n(get_option('date_format'), strtotime($order->created_at))); ?></td>
                                    <td>
                                        <a href="<?php echo esc_url(admin_url('admin.php?page=telegram-services-wc-orders&action=view&order_id=' . $order->order_id)); ?>">
                                            <?php _e('View', 'telegram-services-wc'); ?>
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    
                    <p class="telegram-services-view-all">
                        <a href="<?php echo esc_url(admin_url('admin.php?page=telegram-services-wc-orders')); ?>" class="button">
                            <?php _e('View All Orders', 'telegram-services-wc'); ?>
                        </a>
                    </p>
                <?php endif; ?>
            </div>
            
            <div class="telegram-services-summary">
                <div class="telegram-services-recent-orders" style="margin-top: 20px;">
                    <h3><?php _e('Revenue by Service Type', 'telegram-services-wc'); ?></h3>
                    
                    <table class="telegram-services-orders-table">
                        <thead>
                            <tr>
                                <th><?php _e('Service Type', 'telegram-services-wc'); ?></th>
                                <th><?php _e('Revenue', 'telegram-services-wc'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><?php _e('Telegram Stars', 'telegram-services-wc'); ?></td>
                                <td><?php echo wc_price($stars_revenue); ?></td>
                            </tr>
                            <tr>
                                <td><?php _e('Telegram Premium', 'telegram-services-wc'); ?></td>
                                <td><?php echo wc_price($premium_revenue); ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>