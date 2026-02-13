<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompressResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!function_exists('gzencode') || $request->header('Accept-Encoding') === null) {
            return $response;
        }

        $acceptEncoding = strtolower((string) $request->header('Accept-Encoding'));
        if (strpos($acceptEncoding, 'gzip') === false) {
            return $response;
        }

        $content = $response->getContent();
        if ($content === false || $content === '' || $response->getStatusCode() !== 200) {
            return $response;
        }

        $contentType = $response->headers->get('Content-Type', '');
        $compressible = preg_match('#^(text/|application/(javascript|json|xml|xhtml\+xml))#i', $contentType)
            || strpos($contentType, 'charset') !== false;
        if (!$compressible && strlen($content) < 1024) {
            return $response;
        }

        $compressed = gzencode($content, 6);
        if ($compressed === false) {
            return $response;
        }

        $response->setContent($compressed);
        $response->headers->set('Content-Encoding', 'gzip');
        $response->headers->set('Content-Length', (string) strlen($compressed));
        $response->headers->remove('Transfer-Encoding');

        return $response;
    }
}
