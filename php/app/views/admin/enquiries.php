<?php /** @var array $rows */ ?>
      <div class="adm-page-head">
        <div>
          <h1 class="adm-page-title">Enquiries</h1>
          <p class="adm-muted">Enquiry, quote and consultation forms sent from the website. New ones are highlighted.</p>
        </div>
      </div>

      <section class="adm-card">
        <div class="adm-table-tools">
          <label class="adm-entries">Show
            <select class="adm-select-sm" data-table-size>
              <option value="10">10</option>
              <option value="25" selected>25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            entries
          </label>
          <label class="adm-search">Search:
            <input type="search" class="adm-input-sm" data-table-search placeholder="Name, phone, email…">
          </label>
        </div>
        <div class="adm-table-wrap">
          <table class="adm-table adm-table-enq" data-table>
            <thead>
              <tr>
                <th style="width:48px">#</th>
                <th style="width:120px">Date</th>
                <th>From</th>
                <th>Requirement</th>
                <th style="width:200px">Action</th>
              </tr>
            </thead>
            <tbody>
<?php if (!$rows): ?>
              <tr class="adm-empty-row"><td colspan="5">No enquiries yet.</td></tr>
<?php endif; ?>
<?php foreach ($rows as $i => $q):
    $items = $q['items'] !== '' ? (json_decode($q['items'], true) ?: []) : [];
    $phoneDigits = preg_replace('/\D/', '', $q['phone']);
    $wa = strlen($phoneDigits) === 10 ? '91' . $phoneDigits : $phoneDigits;
?>
              <tr data-row class="<?= $q['status'] === 'new' ? 'is-new' : '' ?>" data-search="<?= e(mb_strtolower($q['name'] . ' ' . $q['phone'] . ' ' . $q['email'] . ' ' . $q['company'] . ' ' . $q['category'] . ' ' . $q['message'])) ?>">
                <td class="adm-num"><?= $i + 1 ?></td>
                <td><?= e(gd_date($q['created_at'])) ?><div class="adm-sub"><?= e(date('g:i A', strtotime($q['created_at']))) ?></div>
                  <span class="adm-chip"><?= e(ucfirst($q['source'])) ?></span><?= $q['status'] === 'new' ? ' <span class="adm-chip adm-chip-gold">New</span>' : '' ?></td>
                <td>
                  <strong><?= e($q['name']) ?></strong>
                  <div><a href="tel:<?= e(preg_replace('/[^0-9+]/', '', $q['phone'])) ?>"><?= e($q['phone']) ?></a></div>
<?php if ($q['email'] !== ''): ?>
                  <div><a href="mailto:<?= e($q['email']) ?>"><?= e($q['email']) ?></a></div>
<?php endif; ?>
<?php if ($q['company'] !== ''): ?>
                  <div class="adm-sub"><?= e($q['company']) ?></div>
<?php endif; ?>
                </td>
                <td>
<?php if ($q['category'] !== ''): ?>
                  <div><strong><?= e($q['category']) ?></strong><?= $q['quantity'] !== '' ? ' · Qty ' . e($q['quantity']) : '' ?></div>
<?php endif; ?>
<?php if ($q['message'] !== ''): ?>
                  <div class="adm-message"><?= nl2br(e($q['message'])) ?></div>
<?php endif; ?>
<?php if ($items): ?>
                  <ul class="adm-items">
<?php foreach ($items as $item): ?>
                    <li><?= e($item['name']) ?> × <?= (int)$item['quantity'] ?><?= !empty($item['notes']) ? ' — “' . e($item['notes']) . '”' : '' ?><?= !empty($item['logo']) ? ' · logo' : '' ?></li>
<?php endforeach; ?>
                  </ul>
<?php endif; ?>
<?php if ($q['page_url'] !== ''): ?>
                  <div class="adm-sub">Sent from <?= e(parse_url($q['page_url'], PHP_URL_PATH) ?: '/') ?></div>
<?php endif; ?>
                </td>
                <td>
                  <div class="adm-actions">
<?php if ($wa !== ''): ?>
                    <a class="adm-btn-xs adm-xs-seo" href="https://wa.me/<?= e($wa) ?>" target="_blank" rel="noopener">WhatsApp</a>
<?php endif; ?>
                    <form method="post" action="<?= e(url('/admin/enquiries/' . $q['id'] . '/' . ($q['status'] === 'new' ? 'read' : 'unread'))) ?>">
                      <?= csrf_field() ?>
                      <button type="submit" class="adm-btn-xs adm-xs-view"><?= $q['status'] === 'new' ? 'Mark read' : 'Mark new' ?></button>
                    </form>
                    <form method="post" action="<?= e(url('/admin/enquiries/' . $q['id'] . '/delete')) ?>" data-confirm="Delete this enquiry from <?= e($q['name']) ?>? This cannot be undone.">
                      <?= csrf_field() ?>
                      <button type="submit" class="adm-btn-xs adm-xs-delete">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
<?php endforeach; ?>
              <tr class="adm-empty-row" data-no-match hidden><td colspan="5">No enquiries match your search.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="adm-table-foot">
          <span data-table-info></span>
          <div class="adm-pager" data-table-pager></div>
        </div>
      </section>
