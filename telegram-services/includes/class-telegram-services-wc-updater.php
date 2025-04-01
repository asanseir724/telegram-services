<?php
/**
 * The updater class.
 *
 * This is used to automatically update the plugin from GitHub.
 *
 * @since      1.0.0
 * @package    Telegram_Services_WC
 * @subpackage Telegram_Services_WC/includes
 */

if (!class_exists('Telegram_Services_WC_Updater')) {
    /**
     * The updater class.
     *
     * @since      1.0.0
     * @package    Telegram_Services_WC
     * @subpackage Telegram_Services_WC/includes
     */
    class Telegram_Services_WC_Updater {

        /**
         * The plugin current version
         *
         * @var string
         */
        private $current_version;

        /**
         * The plugin remote update path
         *
         * @var string
         */
        private $update_path;

        /**
         * Plugin Slug (plugin_directory/plugin_file.php)
         *
         * @var string
         */
        private $plugin_slug;

        /**
         * Plugin name (plugin_file)
         *
         * @var string
         */
        private $slug;

        /**
         * GitHub username
         *
         * @var string
         */
        private $github_username;

        /**
         * GitHub repository name
         *
         * @var string
         */
        private $github_repo;

        /**
         * Initialize a new instance of the WordPress Auto-Update class
         *
         * @param string $current_version Current plugin version.
         * @param string $update_path Path to the GitHub repository.
         * @param string $plugin_slug Plugin slug.
         * @param string $github_username GitHub username.
         * @param string $github_repo GitHub repository name.
         */
        public function __construct($current_version, $update_path, $plugin_slug, $github_username, $github_repo) {
            // Set the class properties
            $this->current_version = $current_version;
            $this->update_path = $update_path;
            $this->plugin_slug = $plugin_slug;
            $this->github_username = $github_username;
            $this->github_repo = $github_repo;

            // Parse the plugin slug
            list($t1, $t2) = explode('/', $plugin_slug);
            $this->slug = str_replace('.php', '', $t2);

            // Hook into the update check
            add_filter('pre_set_site_transient_update_plugins', array($this, 'check_update'));

            // Hook into the plugin details screen
            add_filter('plugins_api', array($this, 'plugin_info'), 10, 3);

            // Add settings for GitHub access token
            add_action('admin_init', array($this, 'register_settings'));
            add_action('admin_menu', array($this, 'add_settings_page'));
        }

        /**
         * Register updater settings.
         *
         * @since    1.0.0
         */
        public function register_settings() {
            register_setting('telegram_services_wc_updater_settings', 'telegram_services_wc_github_token');
        }

        /**
         * Add updater settings page.
         *
         * @since    1.0.0
         */
        public function add_settings_page() {
            add_submenu_page(
                'telegram-services-wc',
                __('Updates', 'telegram-services-wc'),
                __('Updates', 'telegram-services-wc'),
                'manage_options',
                'telegram-services-wc-updates',
                array($this, 'display_settings_page')
            );
        }

        /**
         * Display updater settings page.
         *
         * @since    1.0.0
         */
        public function display_settings_page() {
            // Check if form is submitted
            if (isset($_POST['telegram_services_wc_updater_submit'])) {
                // Verify nonce
                if (check_admin_referer('telegram_services_wc_updater_nonce', 'telegram_services_wc_updater_nonce')) {
                    // Save GitHub token
                    if (isset($_POST['github_token'])) {
                        update_option('telegram_services_wc_github_token', sanitize_text_field($_POST['github_token']));
                    }
                    
                    // Display success message
                    echo '<div class="notice notice-success is-dismissible"><p>' . __('Settings saved successfully.', 'telegram-services-wc') . '</p></div>';
                }
            }
            
            // Get current token
            $github_token = get_option('telegram_services_wc_github_token', '');
            
            // Display the settings form
            ?>
            <div class="wrap">
                <h1><?php _e('GitHub Updater Settings', 'telegram-services-wc'); ?></h1>
                <p><?php _e('Configure settings for automatic updates from GitHub.', 'telegram-services-wc'); ?></p>
                
                <form method="post" action="">
                    <?php wp_nonce_field('telegram_services_wc_updater_nonce', 'telegram_services_wc_updater_nonce'); ?>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="github_token"><?php _e('GitHub Access Token', 'telegram-services-wc'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="github_token" name="github_token" value="<?php echo esc_attr($github_token); ?>" class="regular-text">
                                <p class="description"><?php _e('Enter a GitHub access token to enable higher API rate limits.', 'telegram-services-wc'); ?></p>
                                <p class="description"><?php _e('You can create a token at: <a href="https://github.com/settings/tokens" target="_blank">https://github.com/settings/tokens</a>', 'telegram-services-wc'); ?></p>
                            </td>
                        </tr>
                    </table>
                    
                    <p class="submit">
                        <input type="submit" name="telegram_services_wc_updater_submit" class="button-primary" value="<?php _e('Save Settings', 'telegram-services-wc'); ?>">
                    </p>
                </form>
                
                <h2><?php _e('Update Information', 'telegram-services-wc'); ?></h2>
                <p>
                    <?php _e('Current Version:', 'telegram-services-wc'); ?> <strong><?php echo esc_html($this->current_version); ?></strong><br>
                    <?php _e('GitHub Repository:', 'telegram-services-wc'); ?> <strong><?php echo esc_html($this->github_username . '/' . $this->github_repo); ?></strong>
                </p>
                
                <?php
                // Check for updates
                $update_info = $this->get_repo_info();
                if ($update_info && isset($update_info->tag_name)) {
                    $latest_version = $this->get_version_from_tag($update_info->tag_name);
                    if (version_compare($this->current_version, $latest_version, '<')) {
                        echo '<div class="notice notice-info"><p>' . 
                            sprintf(
                                __('New version available: <strong>%1$s</strong>. Your current version is <strong>%2$s</strong>. <a href="%3$s" target="_blank">View details</a>.', 'telegram-services-wc'),
                                esc_html($latest_version),
                                esc_html($this->current_version),
                                esc_url($update_info->html_url)
                            ) . 
                            '</p></div>';
                    } else {
                        echo '<div class="notice notice-success"><p>' . 
                            __('Your plugin is up to date.', 'telegram-services-wc') . 
                            '</p></div>';
                    }
                } else {
                    echo '<div class="notice notice-warning"><p>' . 
                        __('Unable to check for updates. Please make sure your GitHub token is valid.', 'telegram-services-wc') . 
                        '</p></div>';
                }
                ?>
            </div>
            <?php
        }

        /**
         * Get version number from tag name.
         *
         * @since    1.0.0
         * @param    string $tag_name    Tag name from GitHub.
         * @return   string              Version number.
         */
        private function get_version_from_tag($tag_name) {
            // Remove 'v' prefix if present
            return str_replace('v', '', $tag_name);
        }

        /**
         * Get information regarding our plugin from GitHub
         *
         * @return object $github_data The GitHub data response
         */
        private function get_repo_info() {
            if (!empty($this->github_data)) {
                return $this->github_data;
            }

            $github_token = get_option('telegram_services_wc_github_token', '');
            $args = array(
                'timeout' => 10,
                'headers' => array(
                    'Accept' => 'application/vnd.github.v3+json',
                ),
            );

            // Include token if available
            if (!empty($github_token)) {
                $args['headers']['Authorization'] = 'token ' . $github_token;
            }

            // Get the latest release from GitHub
            $response = wp_remote_get(
                'https://api.github.com/repos/' . $this->github_username . '/' . $this->github_repo . '/releases/latest',
                $args
            );

            // If there is a response error, return false
            if (is_wp_error($response) || 200 !== wp_remote_retrieve_response_code($response)) {
                return false;
            }

            // Get the body of the response
            $body = wp_remote_retrieve_body($response);
            $this->github_data = json_decode($body);

            return $this->github_data;
        }

        /**
         * Push in plugin version information to get the update notification
         *
         * @param object $transient The WordPress update object.
         * @return object $transient Updated object with our plugin information.
         */
        public function check_update($transient) {
            if (empty($transient->checked)) {
                return $transient;
            }

            // Get plugin info from GitHub
            $repo_info = $this->get_repo_info();
            if (false === $repo_info) {
                return $transient;
            }

            // Check if there is a newer version
            $latest_version = $this->get_version_from_tag($repo_info->tag_name);
            if (version_compare($this->current_version, $latest_version, '<')) {
                $obj = new stdClass();
                $obj->slug = $this->slug;
                $obj->new_version = $latest_version;
                $obj->url = $this->update_path;
                $obj->package = $repo_info->zipball_url;
                $obj->tested = '6.0'; // WordPress version
                $obj->requires = '5.7'; // WordPress minimum version
                $obj->requires_php = '7.4'; // PHP minimum version
                
                $transient->response[$this->plugin_slug] = $obj;
            }

            return $transient;
        }

        /**
         * Push in plugin version information to display in the details lightbox
         *
         * @param false|object|array $result The result object or array. Default false.
         * @param string $action The type of information being requested from the Plugin Installation API.
         * @param object $args Plugin API arguments.
         * @return object $response Plugin information.
         */
        public function plugin_info($result, $action, $args) {
            // Check if this call API is for the right plugin
            if (!isset($args->slug) || $args->slug !== $this->slug) {
                return $result;
            }

            // Get plugin & GitHub info
            $repo_info = $this->get_repo_info();
            if (false === $repo_info) {
                return $result;
            }

            // Create response object
            $plugin_info = new stdClass();
            $plugin_info->name = 'Telegram Services for WooCommerce';
            $plugin_info->slug = $this->slug;
            $plugin_info->version = $this->get_version_from_tag($repo_info->tag_name);
            $plugin_info->author = '<a href="https://github.com/' . $this->github_username . '">' . $this->github_username . '</a>';
            $plugin_info->homepage = $this->update_path;
            $plugin_info->requires = '5.7';
            $plugin_info->tested = '6.0';
            $plugin_info->requires_php = '7.4';
            $plugin_info->downloaded = 0;
            $plugin_info->last_updated = $repo_info->published_at;
            
            if (!empty($repo_info->body)) {
                // Use the release message as the plugin description
                $plugin_info->sections = array(
                    'description' => $repo_info->body,
                    'changelog' => $repo_info->body,
                );
            }

            // Add download link
            $plugin_info->download_link = $repo_info->zipball_url;

            return $plugin_info;
        }
    }
}