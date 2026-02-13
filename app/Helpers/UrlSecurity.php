<?php

namespace App\Helpers;

class UrlSecurity
{
    /**
     * Validate URL is safe for outbound HTTP requests (SSRF mitigation).
     * Only allows https (preferred) or http to public IPs / external hostnames.
     */
    public static function isSafeForOutboundRequest(string $url): bool
    {
        $url = trim($url);
        if ($url === '') {
            return false;
        }

        $parsed = parse_url($url);
        if ($parsed === false || !isset($parsed['scheme'])) {
            return false;
        }

        $scheme = strtolower($parsed['scheme']);
        if (!in_array($scheme, ['http', 'https'])) {
            return false;
        }

        $host = $parsed['host'] ?? '';
        if ($host === '') {
            return false;
        }

        $hostLower = strtolower($host);
        if (in_array($hostLower, ['localhost', '0.0.0.0', '::1'])) {
            return false;
        }

        // If host is an IP, block private ranges
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return !self::isPrivateIp($host);
        }

        // For hostnames, resolve and check - if resolution fails, be conservative
        $ips = @dns_get_record($host, DNS_A + DNS_AAAA);
        if ($ips !== false && !empty($ips)) {
            foreach ($ips as $record) {
                $ip = $record['ip'] ?? $record['ipv6'] ?? null;
                if ($ip && self::isPrivateIp($ip)) {
                    return false;
                }
            }
        }

        return true;
    }

    public static function isPrivateIp(string $ip): bool
    {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return self::isPrivateIpV4($ip);
        }
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            return self::isPrivateIpV6($ip);
        }
        return true; // invalid, treat as unsafe
    }

    private static function isPrivateIpV4(string $ip): bool
    {
        $parts = explode('.', $ip);
        if (count($parts) !== 4) {
            return true;
        }
        $p0 = (int) $parts[0];
        $p1 = (int) $parts[1];
        if ($p0 === 127) {
            return true;
        }
        if ($p0 === 10) {
            return true;
        }
        if ($p0 === 172 && $p1 >= 16 && $p1 <= 31) {
            return true;
        }
        if ($p0 === 192 && $p1 === 168) {
            return true;
        }
        if ($p0 === 169 && $p1 === 254) {
            return true;
        }
        return false;
    }

    private static function isPrivateIpV6(string $ip): bool
    {
        $lower = strtolower($ip);
        if ($lower === '::1') {
            return true;
        }
        if (str_starts_with($lower, 'fe80:')) {
            return true;
        }
        if (str_starts_with($lower, 'fc') || str_starts_with($lower, 'fd')) {
            return true;
        }
        return false;
    }

    /**
     * Validate redirect URL to prevent open redirect.
     */
    public static function isSafeRedirectUrl(string $url, array $allowedDomains = []): bool
    {
        if (trim($url) === '') {
            return false;
        }
        $parsed = parse_url($url);
        if ($parsed === false || !isset($parsed['scheme'])) {
            return false;
        }
        $scheme = strtolower($parsed['scheme']);
        if (!in_array($scheme, ['http', 'https'])) {
            return false;
        }
        $host = $parsed['host'] ?? '';
        if ($host === '') {
            return false;
        }
        if (!empty($allowedDomains)) {
            $hostLower = strtolower($host);
            foreach ($allowedDomains as $d) {
                if ($hostLower === strtolower($d) || str_ends_with($hostLower, '.' . strtolower($d))) {
                    return true;
                }
            }
            return false;
        }
        return !self::isPrivateIp($host) || !filter_var($host, FILTER_VALIDATE_IP);
    }

    /**
     * Check if URL is from own app domain (for safe file_get_contents - no SSRF).
     */
    public static function isOwnAppUrl(string $url): bool
    {
        $url = trim($url);
        if ($url === '') return false;
        $parsed = parse_url($url);
        if ($parsed === false || !isset($parsed['scheme'])) return false;
        $scheme = strtolower($parsed['scheme']);
        if (!in_array($scheme, ['http', 'https'])) return false;
        $host = $parsed['host'] ?? '';
        if ($host === '') return false;
        $appHost = parse_url(config('app.url'), PHP_URL_HOST);
        return strtolower($host) === strtolower($appHost ?? '');
    }

    /**
     * Whitelist of known payment gateway domains for safe redirect.
     */
    public static function getPaymentRedirectDomains(): array
    {
        return [
            'tap.company', 'tap.com',
            'xendit.co', 'api.xendit.co',
            'mollie.com',
            'toyyibpay.com',
            'pay.easebuzz.in', 'testpay.easebuzz.in', 'easebuzz.in',
            'mercadopago.com', 'mercadopago.com.br',
            'paypal.com', 'sandbox.paypal.com',
            'razorpay.com',
            'stripe.com',
            'flutterwave.com',
            'paystack.com',
            'khalti.com',
            'ozow.co.za',
            'cinetpay.com',
            'payhere.lk',
            'fedapay.com',
            'paytabs.com',
            'aamarpay.com',
            'iyizico.com', 'iyzipay.com',
            'midtrans.com',
            'yookassa.ru',
            'paiement.cm',
            'authorize.net',
            'coingate.com',
            'skrill.com',
            'paytr.com',
            'google.com', 'accounts.google.com',
        ];
    }
}
