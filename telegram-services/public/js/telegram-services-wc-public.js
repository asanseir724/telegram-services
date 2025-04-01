/**
 * All of the JavaScript for the public-facing functionality of the plugin.
 *
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/public/js
 */

(function( $ ) {
    'use strict';

    $(document).ready(function() {
        // Dynamic content loading via AJAX if needed
        if ($('.telegram-services-dynamic-content').length) {
            loadDynamicContent();
        }
    });

    /**
     * Load dynamic content via AJAX
     */
    function loadDynamicContent() {
        var $container = $('.telegram-services-dynamic-content');
        var serviceType = $container.data('service-type');

        $.ajax({
            url: telegram_services_wc_public.ajax_url,
            type: 'GET',
            dataType: 'json',
            data: {
                action: 'get_telegram_services',
                type: serviceType,
                nonce: telegram_services_wc_public.nonce
            },
            success: function(response) {
                if (response.success) {
                    $container.html(response.data.html);
                } else {
                    $container.html('<p>Error loading content</p>');
                }
            },
            error: function() {
                $container.html('<p>Error loading content</p>');
            }
        });
    }

})( jQuery );