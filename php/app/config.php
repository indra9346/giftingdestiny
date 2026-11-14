<?php
declare(strict_types=1);

// Site settings. Values in config.local.php (same folder, not in git) win.
// config.local.php holds the first admin login (a bcrypt hash, never the plain password).

if (!defined('GD_SITE_NAME')) define('GD_SITE_NAME', 'Gifting Destiny');
if (!defined('GD_PHONE')) define('GD_PHONE', '918660940018');             // WhatsApp number, digits only
if (!defined('GD_PHONE_DISPLAY')) define('GD_PHONE_DISPLAY', '+91 8660940018');
if (!defined('GD_EMAIL')) define('GD_EMAIL', 'support@giftingdestiny.com');
if (!defined('GD_GA_ID')) define('GD_GA_ID', 'G-0NP54SGMB8');               // Google tag
if (!defined('GD_TIMEZONE')) define('GD_TIMEZONE', 'Asia/Kolkata');
if (!defined('GD_ASSET_VERSION')) define('GD_ASSET_VERSION', '20261114a');   // bump to refresh CSS/JS caches

// First admin account, created once when the admin table is empty.
// Set both in config.local.php: GD_ADMIN_INITIAL_USER and GD_ADMIN_INITIAL_HASH (password_hash()).
if (!defined('GD_ADMIN_INITIAL_USER')) define('GD_ADMIN_INITIAL_USER', '');
if (!defined('GD_ADMIN_INITIAL_HASH')) define('GD_ADMIN_INITIAL_HASH', '');

// Blog thumbnails and editor pictures.
if (!defined('GD_UPLOAD_MAX_BYTES')) define('GD_UPLOAD_MAX_BYTES', 6 * 1024 * 1024);
