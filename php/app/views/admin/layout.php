<?php
/** @var array $user  @var string $active  @var string $pageTitle  @var string $content */
$flashes = take_flashes();
$newEnquiries = gd_enquiry_new_count();
$nav = [
    ['section' => 'Navigation'],
    ['key' => 'dashboard', 'href' => '/admin', 'label' => 'Dashboard', 'icon' => '<path d="M3 13h8V3H3zM13 21h8v-10h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>'],
    ['key' => 'blogs', 'href' => '/admin/blogs', 'label' => 'Blogs', 'icon' => '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v15H6.5A2.5 2.5 0 0 0 4 20.5 2.5 2.5 0 0 0 6.5 23H19v-5"/><path d="M8 7h7M8 11h5"/>'],
    ['key' => 'enquiries', 'href' => '/admin/enquiries', 'label' => 'Enquiries', 'badge' => $newEnquiries, 'icon' => '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'],
    ['section' => 'Website'],
    ['key' => 'site', 'href' => '/', 'label' => 'View Website', 'external' => true, 'icon' => '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'],
    ['key' => 'blogpage', 'href' => '/blog', 'label' => 'View Blog Page', 'external' => true, 'icon' => '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>'],
    ['section' => 'Account'],
    ['key' => 'password', 'href' => '/admin/password', 'label' => 'Change Password', 'icon' => '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'],
];
?><!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <meta name="csrf-token" content="<?= e(csrf_token()) ?>">
  <title><?= e($pageTitle) ?> · Gifting Destiny Admin</title>
  <link rel="icon" type="image/jpeg" href="<?= e(url('/assets/gifting-destiny-original-logo.jpg')) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<?php if ($active === 'blogs'): ?>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/summernote@0.8.20/dist/summernote-lite.min.css">
<?php endif; ?>
  <link rel="stylesheet" href="<?= e(asset('/gd-assets/admin/admin.css')) ?>">
</head>
<body class="adm" data-base="<?= e(gd_base()) ?>">
  <div class="adm-topline" aria-hidden="true"></div>
  <aside class="adm-sidebar" id="adm-sidebar">
    <div class="adm-brand">
      <a href="<?= e(url('/admin')) ?>" class="adm-brand-link">
        <img src="<?= e(url('/assets/gifting-destiny-original-logo.jpg')) ?>" alt="" width="38" height="38">
        <span><strong>Gifting Destiny</strong><small>Admin Panel</small></span>
      </a>
      <button type="button" class="adm-icon-btn adm-close-nav" data-adm-nav-close aria-label="Close menu">&times;</button>
    </div>
    <div class="adm-usercard">
      <span class="adm-avatar"><?= e(mb_strtoupper(mb_substr($user['username'], 0, 1))) ?></span>
      <span><strong><?= e($user['username']) ?></strong><small>Super Admin</small></span>
    </div>
    <nav class="adm-nav">
<?php foreach ($nav as $item): ?>
<?php if (isset($item['section'])): ?>
      <div class="adm-nav-section"><?= e($item['section']) ?></div>
<?php else: ?>
      <a href="<?= e(url($item['href'])) ?>" class="adm-nav-link<?= $active === $item['key'] ? ' is-active' : '' ?>"<?= !empty($item['external']) ? ' target="_blank" rel="noopener"' : '' ?>>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><?= $item['icon'] ?></svg>
        <span><?= e($item['label']) ?></span>
<?php if (!empty($item['badge'])): ?>
        <em class="adm-badge"><?= (int)$item['badge'] ?></em>
<?php endif; ?>
      </a>
<?php endif; ?>
<?php endforeach; ?>
      <form method="post" action="<?= e(url('/admin/logout')) ?>" class="adm-logout-form">
        <?= csrf_field() ?>
        <button type="submit" class="adm-nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          <span>Logout</span>
        </button>
      </form>
    </nav>
  </aside>
  <div class="adm-backdrop" data-adm-nav-close></div>

  <div class="adm-main">
    <header class="adm-topbar">
      <button type="button" class="adm-icon-btn adm-menu-btn" data-adm-nav-open aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <div class="adm-welcome">Welcome!</div>
      <div class="adm-topbar-right">
        <a class="adm-top-link" href="<?= e(url('/')) ?>" target="_blank" rel="noopener">View Website ↗</a>
        <span class="adm-top-user"><span class="adm-avatar sm"><?= e(mb_strtoupper(mb_substr($user['username'], 0, 1))) ?></span><span><?= e($user['username']) ?></span></span>
      </div>
    </header>

    <main class="adm-content">
<?php foreach ($flashes as $flash): ?>
      <div class="adm-alert adm-alert-<?= e($flash['type']) ?>" role="status"><?= e($flash['message']) ?><button type="button" class="adm-alert-x" aria-label="Dismiss">&times;</button></div>
<?php endforeach; ?>
      <?= $content ?>
    </main>
    <footer class="adm-footer">© <?= date('Y') ?> Gifting Destiny · Admin panel</footer>
  </div>

<?php if ($active === 'blogs'): ?>
  <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.20/dist/summernote-lite.min.js"></script>
<?php endif; ?>
  <script src="<?= e(asset('/gd-assets/admin/admin.js')) ?>"></script>
</body>
</html>
