/**
 * All of the JavaScript for the admin-specific functionality of the plugin.
 *
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/admin/js
 */

(function( $ ) {
    'use strict';

    $(document).ready(function() {
        // Text editor functionality
        if ($('.telegram-services-text-editor').length) {
            initTextEditor();
        }
        
        // Order status updates
        $('.telegram-services-change-status').on('click', function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to change the status?')) {
                window.location.href = $(this).attr('href');
            }
        });
    });

    /**
     * Initialize the text editor functionality
     */
    function initTextEditor() {
        // Language selector
        $('.telegram-services-language-selector select').on('change', function() {
            var language = $(this).val();
            window.location.href = 'admin.php?page=telegram-services-wc-text-editor&language=' + language;
        });
        
        // Text group tabs
        $('.telegram-services-text-groups a').on('click', function(e) {
            e.preventDefault();
            
            var targetId = $(this).attr('href').substring(1);
            
            // Update active tab
            $('.telegram-services-text-groups a').removeClass('active');
            $(this).addClass('active');
            
            // Show the corresponding text fields
            $('.telegram-services-text-fields').removeClass('active');
            $('#' + targetId).addClass('active');
        });
        
        // Activate the first tab by default
        $('.telegram-services-text-groups a:first').click();
    }

})( jQuery );