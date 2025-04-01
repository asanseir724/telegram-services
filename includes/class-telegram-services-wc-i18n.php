<?php
/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */
class Telegram_Services_WC_i18n {

    /**
     * Load the plugin text domain for translation.
     *
     * @since    1.0.0
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain(
            'telegram-services-wc',
            false,
            dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
        );
    }

    /**
     * Get all available languages.
     *
     * @since    1.0.0
     * @return   array    Array of language codes and their display names.
     */
    public static function get_available_languages() {
        return array(
            'en_US' => __('English', 'telegram-services-wc'),
            'fa_IR' => __('Persian (Farsi)', 'telegram-services-wc')
        );
    }

    /**
     * Get the current active language.
     *
     * @since    1.0.0
     * @return   string    The current language code.
     */
    public static function get_current_language() {
        // Get WordPress locale
        $locale = get_locale();
        
        // Default to English if the locale is not supported
        $supported_languages = array_keys(self::get_available_languages());
        
        if (!in_array($locale, $supported_languages)) {
            $locale = 'en_US';
        }
        
        return $locale;
    }

    /**
     * Check if the current language is RTL.
     *
     * @since    1.0.0
     * @return   bool    True if the current language is RTL, false otherwise.
     */
    public static function is_rtl() {
        $rtl_languages = array('fa_IR');
        return in_array(self::get_current_language(), $rtl_languages);
    }

    /**
     * Get custom translations.
     *
     * @since    1.0.0
     * @return   array    Array of custom translations.
     */
    public static function get_custom_translations() {
        $custom_texts = get_option('telegram_services_wc_custom_texts', array());
        $language = self::get_current_language();
        
        return isset($custom_texts[$language]) ? $custom_texts[$language] : array();
    }

    /**
     * Get a translated text, first checking for a custom translation.
     *
     * @since    1.0.0
     * @param    string    $key       The translation key.
     * @param    string    $default   The default text if no translation is found.
     * @return   string    The translated text.
     */
    public static function get_text($key, $default = '') {
        $custom_translations = self::get_custom_translations();
        
        if (isset($custom_translations[$key]) && !empty($custom_translations[$key])) {
            return $custom_translations[$key];
        }
        
        // If no custom translation, use WordPress translation system
        $translated = __($default, 'telegram-services-wc');
        
        return $translated === $default ? $default : $translated;
    }

    /**
     * Get the appropriate currency symbol based on the current language.
     *
     * @since    1.0.0
     * @return   string    The currency symbol.
     */
    public static function get_currency_symbol() {
        $language = self::get_current_language();
        
        switch ($language) {
            case 'fa_IR':
                return __('تومان', 'telegram-services-wc');
            default:
                return '$';
        }
    }

    /**
     * Format a price based on the current language.
     *
     * @since    1.0.0
     * @param    float     $price    The price to format.
     * @return   string    The formatted price.
     */
    public static function format_price($price) {
        $language = self::get_current_language();
        
        switch ($language) {
            case 'fa_IR':
                // Convert price to Toman (assuming price is in USD)
                $exchange_rate = get_option('telegram_services_wc_usd_to_toman_rate', 40000);
                $price_in_toman = $price * $exchange_rate;
                
                // Format with Persian digits
                $formatted = number_format($price_in_toman);
                $persian_digits = array('۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹');
                $formatted = str_replace(range(0, 9), $persian_digits, $formatted);
                
                return $formatted . ' ' . self::get_currency_symbol();
                
            default:
                return self::get_currency_symbol() . number_format($price, 2);
        }
    }
}