GIFTING DESTINY – PHP WEBSITE + BLOG ADMIN
==========================================

What this is
------------
The Gifting Destiny website in PHP (it was a Vite/JavaScript single-page app). Every page is built by PHP:
home, shop + categories, product pages, corporate, about, contact, FAQ, blog list and blog articles.
A small script (gd-assets/js/site.js) adds the order bag, wishlist, live search, drawers, the mug name
preview and the header cloth banner, exactly as before.

New:
  * "Blogs" button in the top header row on every screen size (on phones too, not hidden in the menu).
  * Admin panel at /admin: sign in, Dashboard, Blogs (Add New Blog / Edit / SEO / View / Delete /
    Active-Inactive), Enquiries, Change Password.
  * The enquiry, quote and consultation forms are saved and listed in Admin > Enquiries
    (before, they only showed a "thank you" and nothing was kept).
  * The 20 WordPress blog posts were imported (text, cover pictures, dates).

Folders
-------
  gd-index.php      the entry point (named so it can sit beside WordPress's index.php)
  app/              PHP code, data and the SQLite database (app/storage/gd.sqlite). NEVER public:
                    app/.htaccess blocks it. The database is created on first run.
  app/config.php    phone, email, Google tag id
  app/config.local.php  (not in git) first admin login: GD_ADMIN_INITIAL_USER + GD_ADMIN_INITIAL_HASH
                    (a password_hash(), never the plain password). Used once, when no admin exists.
  gd-assets/        CSS and JS (the original stylesheets unchanged + site.css, admin/)
  gd-uploads/       pictures uploaded in the admin (blogs/seed = imported WordPress covers)
  images/, assets/, *.mp4   product photos, logo and films (same as the old site)

Server needs: PHP 8.1 or newer with pdo_sqlite (and GD for picture resizing; it works without GD too).

Install – on its own (no WordPress in the folder)
--------------------------------------------------
  1. Upload everything (gd-index.php, app, gd-assets, gd-uploads, images, assets, the .mp4 files,
     .htaccess) to the site folder (public_html).
  2. Create app/config.local.php with the first admin login (see above). Make sure app/storage is writable.
  3. Open the site. Sign in at /admin.

Install – beside WordPress (giftingdestiny.webhostingbaba.com, live since 14 Nov 2026)
--------------------------------------------------------------------------------------
  Upload gd-index.php, app, gd-assets, gd-uploads into the WordPress folder (never replace WordPress's
  index.php) and put this block at the very top of WordPress's .htaccess:

  # BEGIN Gifting Destiny PHP site
  DirectoryIndex gd-index.php index.php
  <IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{QUERY_STRING} (^|&)(p|page_id|preview|preview_id|elementor-preview|elementor_library|s|wc-ajax|wc-api|rest_route|add-to-cart|post_type|attachment_id|cat|tag|author|feed|replytocom|unapproved|customize_changeset_uuid)= [NC]
  RewriteRule ^$ /index.php [L]
  RewriteRule ^(shop|shop-2|product|product-category|corporate|about|about-us|contact|faq|faqs|blog|blogs|blog-grid|admin|api)(/.*)?$ /gd-index.php [L,QSA]
  RewriteRule ^index\.html$ /gd-index.php [L]
  RewriteRule ^(app)(/|$) - [F,L]
  </IfModule>
  # END Gifting Destiny PHP site

  WordPress keeps /wp-admin, /wp-json and its own pages. Backup of the previous .htaccess on the server:
  .htaccess.gd-backup-20261114-php

Updating later
--------------
  Upload the changed files only. NEVER upload over app/storage (it holds the blogs, enquiries and
  login) or gd-uploads/blogs/20xx (pictures added in the admin). config.local.php is only read when no
  admin exists, so re-uploading it does not change the password.

Local testing
-------------
  php -S 127.0.0.1:8091 dev-router.php      (serves product photos from ../public)
  php app/cli/import-wordpress.php https://giftingdestiny.webhostingbaba.com   (re-creates seed-blogs.json)
