<?php
declare(strict_types=1);

// Picture uploads from the admin panel. Only real JPG/PNG/WEBP pictures are accepted; they are
// re-saved through GD (which drops anything hidden inside the file) under a random name.

const GD_UPLOAD_DIR = '/gd-uploads/blogs';

/**
 * Stores an uploaded picture. Returns ['main' => '/gd-uploads/...', 'card' => ..., 'srcset' => ..., 'width' => n]
 * or throws RuntimeException with a message for the admin.
 */
function gd_store_upload(array $file, int $mainWidth = 1600, int $cardWidth = 768): array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $code = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        throw new RuntimeException($code === UPLOAD_ERR_INI_SIZE || $code === UPLOAD_ERR_FORM_SIZE
            ? 'The picture is too large. Please use one under ' . (int)(GD_UPLOAD_MAX_BYTES / 1048576) . ' MB.'
            : 'The picture did not upload. Please try again.');
    }
    if (!is_uploaded_file($file['tmp_name'])) throw new RuntimeException('The picture did not upload. Please try again.');
    if ($file['size'] > GD_UPLOAD_MAX_BYTES) throw new RuntimeException('The picture is too large. Please use one under ' . (int)(GD_UPLOAD_MAX_BYTES / 1048576) . ' MB.');

    $info = @getimagesize($file['tmp_name']);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
    if (!$info || !isset($types[$info[2]])) throw new RuntimeException('Please choose a JPG, JPEG, PNG or WEBP picture.');
    if (function_exists('finfo_open')) {
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) throw new RuntimeException('Please choose a JPG, JPEG, PNG or WEBP picture.');
    }
    [$width, $height] = $info;
    if ($width < 50 || $height < 50 || $width * $height > 40000000) throw new RuntimeException('That picture size is not supported.');

    $folder = GD_UPLOAD_DIR . '/' . date('Y/m');
    $dir = GD_ROOT . $folder;
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) throw new RuntimeException('The upload folder could not be created on the server.');
    $name = date('Ymd-His') . '-' . bin2hex(random_bytes(5));
    $ext = $types[$info[2]];

    $canResize = function_exists('imagecreatetruecolor')
        && (($ext === 'jpg' && function_exists('imagecreatefromjpeg')) || ($ext === 'png' && function_exists('imagecreatefrompng')) || ($ext === 'webp' && function_exists('imagecreatefromwebp')));
    if (!$canResize) {
        // Hosting without GD: keep the checked original as it is.
        $path = "$folder/$name.$ext";
        if (!move_uploaded_file($file['tmp_name'], GD_ROOT . $path)) throw new RuntimeException('The picture could not be saved.');
        @chmod(GD_ROOT . $path, 0644);
        return ['main' => $path, 'card' => $path, 'srcset' => '', 'width' => $width];
    }

    $source = match ($ext) {
        'jpg' => @imagecreatefromjpeg($file['tmp_name']),
        'png' => @imagecreatefrompng($file['tmp_name']),
        'webp' => @imagecreatefromwebp($file['tmp_name']),
    };
    if (!$source) throw new RuntimeException('That picture could not be read. Please save it again as JPG or PNG.');
    if ($ext === 'jpg' && function_exists('exif_read_data')) $source = gd_fix_orientation($source, $file['tmp_name'], $width, $height);

    $outExt = ($ext === 'png' && gd_image_has_alpha($source)) ? 'png' : ($ext === 'webp' && function_exists('imagewebp') ? 'webp' : 'jpg');
    $main = gd_write_resized($source, $width, $height, $mainWidth, GD_ROOT . "$folder/$name.$outExt", $outExt);
    $result = ['main' => "$folder/$name.$outExt", 'card' => "$folder/$name.$outExt", 'srcset' => '', 'width' => $main];
    if ($cardWidth > 0 && $width > $cardWidth + 80) {
        $card = gd_write_resized($source, $width, $height, $cardWidth, GD_ROOT . "$folder/$name-card.$outExt", $outExt);
        $result['card'] = "$folder/$name-card.$outExt";
        $result['srcset'] = "{$result['card']} {$card}w, {$result['main']} {$main}w";
    }
    imagedestroy($source);
    return $result;
}

function gd_fix_orientation($image, string $file, int &$width, int &$height)
{
    $exif = @exif_read_data($file);
    $turn = ['3' => 180, '6' => -90, '8' => 90][(string)($exif['Orientation'] ?? '')] ?? 0;
    if ($turn) {
        $rotated = imagerotate($image, $turn, 0);
        if ($rotated) {
            imagedestroy($image);
            $image = $rotated;
            $width = imagesx($image);
            $height = imagesy($image);
        }
    }
    return $image;
}

function gd_image_has_alpha($image): bool
{
    $w = imagesx($image);
    $h = imagesy($image);
    $step = max(1, (int)floor(min($w, $h) / 40));
    for ($x = 0; $x < $w; $x += $step) {
        for ($y = 0; $y < $h; $y += $step) {
            if (((imagecolorat($image, $x, $y) >> 24) & 0x7F) > 0) return true;
        }
    }
    return false;
}

/** Saves a copy no wider than $maxWidth. Returns the saved width. */
function gd_write_resized($source, int $width, int $height, int $maxWidth, string $target, string $ext): int
{
    $newW = min($width, $maxWidth);
    $newH = (int)round($height * ($newW / $width));
    $canvas = imagecreatetruecolor($newW, $newH);
    if ($ext === 'png' || $ext === 'webp') {
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefill($canvas, 0, 0, imagecolorallocatealpha($canvas, 0, 0, 0, 127));
    } else {
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
    }
    imagecopyresampled($canvas, $source, 0, 0, 0, 0, $newW, $newH, $width, $height);
    $ok = match ($ext) {
        'png' => imagepng($canvas, $target, 7),
        'webp' => imagewebp($canvas, $target, 84),
        default => imagejpeg($canvas, $target, 84),
    };
    imagedestroy($canvas);
    if (!$ok) throw new RuntimeException('The picture could not be saved.');
    @chmod($target, 0644);
    return $newW;
}

/** Removes a picture this site uploaded (never anything outside gd-uploads). */
function gd_upload_delete(string $path): void
{
    if ($path === '' || !str_starts_with($path, GD_UPLOAD_DIR . '/') || str_contains($path, '..')) return;
    $full = GD_ROOT . $path;
    if (is_file($full)) @unlink($full);
}
