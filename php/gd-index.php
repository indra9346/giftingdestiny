<?php
declare(strict_types=1);

// Gifting Destiny – PHP website entry point.
// Every page (shop, products, blog, admin) is served from here; see app/routes.php.
// Named gd-index.php so it can sit beside WordPress's own index.php without replacing it.

require __DIR__ . '/app/bootstrap.php';
require __DIR__ . '/app/routes.php';
