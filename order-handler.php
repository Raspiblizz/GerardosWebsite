<?php
/**
 * Gerardo's — Order form logger (cPanel / standard PHP hosting)
 * Replaces the Netlify Forms "background log" call in pedido.js.
 *
 * NOTE: WhatsApp and email (via mailto:) are the PRIMARY way orders are sent —
 * this script just gives you an optional email copy/log of orders placed.
 * If it fails, ordering still works fine through WhatsApp/email.
 *
 * SETUP: Upload to the same folder as pedido.html (site root), set $to_email.
 */

// ------------- CONFIG -------------
$to_email  = "oscar.chavez@vinosgerardos.com";
$site_name = "Gerardo's — Nuevo pedido";
// -----------------------------------

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["ok" => false]);
    exit;
}

// Honeypot spam check
if (!empty($_POST["bot-field"])) {
    echo json_encode(["ok" => true]);
    exit;
}

function clean($str) {
    $str = trim($str);
    $str = str_replace(["\r", "\n"], " ", $str);
    return htmlspecialchars($str, ENT_QUOTES, "UTF-8");
}

$name    = isset($_POST["name"]) ? clean($_POST["name"]) : "";
$phone   = isset($_POST["phone"]) ? clean($_POST["phone"]) : "";
$zone    = isset($_POST["zone"]) ? clean($_POST["zone"]) : "";
$address = isset($_POST["address"]) ? clean($_POST["address"]) : "";
$notes   = isset($_POST["notes"]) ? clean($_POST["notes"]) : "";
$items   = isset($_POST["items"]) ? clean($_POST["items"]) : "";
$channel = isset($_POST["channel"]) ? clean($_POST["channel"]) : "";

$mail_body =
    "Canal / Channel: " . $channel . "\n\n" .
    "Vinos / Items: " . $items . "\n" .
    "\n" .
    "Nombre / Name: " . $name . "\n" .
    "Tel\xC3\xA9fono / Phone: " . $phone . "\n" .
    "Zona / Area: " . $zone . "\n" .
    "Direcci\xC3\xB3n / Address: " . $address . "\n" .
    "Notas / Notes: " . ($notes !== "" ? $notes : "-") . "\n";

$headers = [];
$headers[] = "From: " . $site_name . " <no-reply@" . $_SERVER["HTTP_HOST"] . ">";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

$sent = @mail($to_email, $site_name, $mail_body, implode("\r\n", $headers));

// Always respond ok — this is a best-effort log, never blocks the order flow
echo json_encode(["ok" => (bool) $sent]);
