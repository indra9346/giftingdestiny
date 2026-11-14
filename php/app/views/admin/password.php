<?php /** @var string|null $error */ ?>
      <div class="adm-page-head">
        <div>
          <h1 class="adm-page-title">Change Password</h1>
          <p class="adm-muted">Use at least 10 characters. A short sentence is easy to remember and hard to guess.</p>
        </div>
      </div>
      <section class="adm-card adm-narrow">
<?php if ($error): ?>
        <div class="adm-alert adm-alert-error" role="alert"><?= e($error) ?></div>
<?php endif; ?>
        <form method="post" action="<?= e(url('/admin/password')) ?>" class="adm-form">
          <?= csrf_field() ?>
          <label class="adm-label" for="pw-current">Current password</label>
          <input class="adm-input" type="password" id="pw-current" name="current" required autocomplete="current-password">
          <label class="adm-label" for="pw-new">New password</label>
          <input class="adm-input" type="password" id="pw-new" name="new" required minlength="10" autocomplete="new-password">
          <label class="adm-label" for="pw-confirm">Type the new password again</label>
          <input class="adm-input" type="password" id="pw-confirm" name="confirm" required minlength="10" autocomplete="new-password">
          <button type="submit" class="adm-btn adm-btn-green">Change Password</button>
        </form>
      </section>
