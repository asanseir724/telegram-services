# Telegram Services for WooCommerce

A WordPress plugin for selling Telegram Stars and Premium services through WooCommerce.

## Description

The Telegram Services for WooCommerce plugin allows you to sell Telegram Stars and Premium subscriptions through your WordPress site, leveraging the power of WooCommerce for order handling and payment processing.

### Key Features

- Sell Telegram Stars and Premium subscriptions as WooCommerce products
- Collect required Telegram information at checkout (Telegram ID and phone number)
- Multi-language support (English and Persian/Farsi)
- Admin dashboard with sales statistics
- Order management system
- Text editor to customize all text content in both languages
- Right-to-left (RTL) support for Persian/Farsi
- Automatic currency conversion between USD and Toman based on language

## Installation

1. Upload the `telegram-services-wc` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Ensure WooCommerce is installed and activated
4. Configure the plugin settings from the 'Telegram Services' menu in the WordPress admin

## Requirements

- WordPress 5.7 or higher
- WooCommerce 6.0 or higher
- PHP 7.4 or higher

## Usage

### Shortcodes

The plugin provides the following shortcodes:

- `[telegram_services_grid]` - Displays a grid of Telegram services (Stars and Premium)
- `[telegram_stars_products]` - Displays only Stars products
- `[telegram_premium_products]` - Displays only Premium products

### Shortcode Attributes

The product shortcodes accept the following attributes:

```
[telegram_stars_products columns="3" orderby="price" order="asc"]
```

- `columns` - Number of columns (default: 3)
- `orderby` - Sort by 'price', 'quantity', or 'title' (default: 'price')
- `order` - Sort order 'asc' or 'desc' (default: 'asc')

## Settings

Configure the plugin settings from the 'Telegram Services > Settings' menu:

- Commission percentage - Your commission on each service sale
- USD to Toman exchange rate - For currency conversion
- Data removal - Choose whether to remove data on plugin uninstall

## Text Editor

Use the text editor at 'Telegram Services > Text Editor' to customize all text content in both English and Persian:

1. Select a language from the dropdown
2. Navigate through the text groups using the sidebar
3. Edit the text fields as needed
4. Save changes

## Credits

- Developed by [Amir Sanseir](https://github.com/asanseir724)
- Plugin URL: [https://github.com/asanseir724/telegram-services](https://github.com/asanseir724/telegram-services)

## License

This plugin is licensed under the GPL v2 or later.

```
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License, version 2, as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
```