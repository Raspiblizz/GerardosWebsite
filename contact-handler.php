<?php
/**
 * Gerardo's — Contact form handler (cPanel / standard PHP hosting)
 * Replaces Netlify Forms. Receives the contact form POST and emails it.
 *
 * SETUP:
 * 1. Upload this file to the SAME folder as contacto.html (site root).
 * 2. Set $to_email below to where messages should arrive.
 * 3. Most cPanel hosts have PHP's mail() working out of the box once your
 *    domain's MX/SPF records are set up. If mail() doesn't deliver, ask your
 *    host about enabling it, or swap in PHPMailer/SMTP (see note at bottom).
 */

// ------------- CONFIG -------------
$to_email   = "contacto@vinosgerardos.com";
$site_name  = "Gerardo's — Contacto";
// -----------------------------------

header("Content-Type: application/json; charset=UTF-8");

// Only allow POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["ok" => false, "error" => "Method not allowed"]);
    exit;
}

// Simple honeypot spam check (bot-field must stay empty)
if (!empty($_POST["bot-field"])) {
    // Silently pretend success so bots don't learn anything
    echo json_encode(["ok" => true]);
    exit;
}

function clean($str) {
    $str = trim($str);
    $str = str_replace(["\r", "\n"], " ", $str); // prevent header injection
    return htmlspecialchars($str, ENT_QUOTES, "UTF-8");
}

$name    = isset($_POST["name"]) ? clean($_POST["name"]) : "";
$email   = isset($_POST["email"]) ? trim($_POST["email"]) : "";
$subject = isset($_POST["subject"]) ? clean($_POST["subject"]) : "";
$message = isset($_POST["message"]) ? trim($_POST["message"]) : "";

// Basic validation
if ($name === "" || $email === "" || $message === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Missing or invalid fields"]);
    exit;
}

$mail_subject = $site_name . ($subject !== "" ? " — " . $subject : "");
$mail_body =
    "Nombre / Name: " . $name . "\n" .
    "Correo / Email: " . $email . "\n" .
    "Asunto / Subject: " . ($subject !== "" ? $subject : "-") . "\n\n" .
    "Mensaje / Message:\n" . strip_tags($message) . "\n";

$headers = [];
$headers[] = "From: " . $site_name . " <no-reply@" . $_SERVER["HTTP_HOST"] . ">";
$headers[] = "Reply-To: " . $name . " <" . $email . ">";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

$sent = mail($to_email, $mail_subject, $mail_body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(["ok" => true]);
} else {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Mail could not be sent"]);
}

/**
 * NOTE: Many cPanel hosts throttle or block PHP's mail() function due to spam
 * abuse. If messages aren't arriving, the more reliable option is SMTP via
 * PHPMailer (most hosts provide SMTP credentials in cPanel > Email Accounts).
 * Ask your host or developer to swap the mail() call above for an SMTP send
 * if needed — the rest of this script (validation, honeypot) stays the same.
 */
