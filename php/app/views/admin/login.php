<?php /** @var string|null $error  @var string $username */ ?><!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Admin Login · Gifting Destiny</title>
  <link rel="icon" type="image/jpeg" href="<?= e(url('/assets/gifting-destiny-original-logo.jpg')) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(asset('/gd-assets/admin/admin.css')) ?>">
</head>
<body class="adm adm-login-page">
  <div class="adm-topline" aria-hidden="true"></div>
  <main class="adm-login-wrap">
    <div class="adm-login-card">
      <img src="<?= e(url('/assets/gifting-destiny-original-logo.jpg')) ?>" alt="Gifting Destiny logo" width="84" height="84" class="adm-login-logo">
      <h1>Gifting Destiny Admin</h1>
      <p class="adm-muted">Sign in to add and edit blogs and see enquiries.</p>
<?php if ($error): ?>
      <div class="adm-alert adm-alert-error" role="alert"><?= e($error) ?></div>
<?php endif; ?>
      <form method="post" action="<?= e(url('/admin/login')) ?>" class="adm-form" autocomplete="on">
        <?= csrf_field() ?>
        <label class="adm-label" for="login-username">Username</label>
        <input class="adm-input" type="text" id="login-username" name="username" value="<?= e($username) ?>" required autocomplete="username" autofocus>
        <label class="adm-label" for="login-password">Password</label>
        <div class="adm-password-row">
          <input class="adm-input" type="password" id="login-password" name="password" required autocomplete="current-password">
          <button type="button" class="adm-eye" data-toggle-password="login-password" aria-label="Show password" aria-pressed="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <button type="submit" class="adm-btn adm-btn-green adm-btn-block">Sign In</button>
      </form>
      <a class="adm-back-site" href="<?= e(url('/')) ?>">← Back to the website</a>
    </div>
  </main>
  <script src="<?= e(asset('/gd-assets/admin/admin.js')) ?>"></script>
</body>
</html>
