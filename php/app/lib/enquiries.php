<?php
declare(strict_types=1);

// Enquiry, quote and consultation forms on the site are saved here and listed in /admin/enquiries.

const GD_ENQUIRY_LIMIT = 6;        // per address ...
const GD_ENQUIRY_WINDOW_MIN = 10;  // ... per this many minutes

function gd_enquiry_save(array $in): array
{
    $clip = fn($v, int $n) => mb_substr(trim(strip_tags((string)($v ?? ''))), 0, $n);
    // Hidden "website" box: people never fill it, form robots do.
    if (trim((string)($in['website'] ?? '')) !== '') return ['ok' => true];

    $data = [
        'source' => in_array($in['source'] ?? '', ['enquiry', 'consultation', 'quote'], true) ? $in['source'] : 'enquiry',
        'name' => $clip($in['name'] ?? '', 120),
        'phone' => $clip($in['phone'] ?? '', 40),
        'email' => $clip($in['email'] ?? '', 160),
        'quantity' => $clip($in['quantity'] ?? '', 20),
        'category' => $clip($in['category'] ?? '', 120),
        'company' => $clip($in['company'] ?? '', 160),
        'message' => $clip($in['message'] ?? '', 4000),
        'page_url' => $clip($in['page_url'] ?? '', 300),
    ];
    if ($data['name'] === '' || $data['phone'] === '') return ['ok' => false, 'error' => 'Please enter your name and phone number.'];
    if (!preg_match('/\d{6,}/', preg_replace('/\D/', '', $data['phone']))) return ['ok' => false, 'error' => 'Please enter a valid phone number.'];
    if ($data['email'] !== '' && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) return ['ok' => false, 'error' => 'Please enter a valid email address.'];

    $items = [];
    foreach (array_slice(is_array($in['items'] ?? null) ? $in['items'] : [], 0, 50) as $item) {
        if (!is_array($item)) continue;
        $items[] = [
            'id' => $clip($item['id'] ?? '', 20),
            'name' => $clip($item['name'] ?? '', 200),
            'quantity' => (int)($item['quantity'] ?? 1),
            'notes' => $clip($item['customNotes'] ?? '', 300),
            'logo' => !empty($item['logoRequirement']),
        ];
    }

    $ip = request_ip();
    $since = date('Y-m-d\TH:i:s', time() - GD_ENQUIRY_WINDOW_MIN * 60);
    $stmt = db()->prepare('SELECT COUNT(*) FROM enquiries WHERE ip = ? AND created_at >= ?');
    $stmt->execute([$ip, $since]);
    if ((int)$stmt->fetchColumn() >= GD_ENQUIRY_LIMIT) {
        return ['ok' => false, 'error' => 'We have received several enquiries from you already. Please message us on WhatsApp for a faster reply.'];
    }

    db()->prepare('INSERT INTO enquiries (source, name, phone, email, quantity, category, company, message, items, page_url, ip, user_agent, status, created_at)
        VALUES (:source, :name, :phone, :email, :quantity, :category, :company, :message, :items, :page_url, :ip, :ua, \'new\', :created)')
        ->execute([
            ':source' => $data['source'], ':name' => $data['name'], ':phone' => $data['phone'], ':email' => $data['email'],
            ':quantity' => $data['quantity'], ':category' => $data['category'], ':company' => $data['company'],
            ':message' => $data['message'], ':items' => $items ? json_encode($items, JSON_UNESCAPED_UNICODE) : '',
            ':page_url' => $data['page_url'], ':ip' => $ip, ':ua' => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250),
            ':created' => now_iso(),
        ]);
    return ['ok' => true];
}

function gd_enquiry_new_count(): int
{
    return (int)db()->query("SELECT COUNT(*) FROM enquiries WHERE status = 'new'")->fetchColumn();
}
