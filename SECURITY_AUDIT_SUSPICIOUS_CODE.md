# საეჭვო კოდის ანოტაციები – უსაფრთხოების აუდიტი

> **შენიშვნა:** არც ერთი ცვლილება არ არის გაკეთებული. მხოლოდ პოტენციური პრობლემების აღნიშვნა.

---

## 1. SSRF (Server-Side Request Forgery)

### app/Http/Controllers/TaskAttachmentController.php:68
```php
echo file_get_contents($mediaItem->url);
```
**პრობლემა:** `$mediaItem->url` DB-დან მოდის. თუ URL შეიძლება იყოს `file://`, `http://127.0.0.1` ან სხვა შიდა რესურსი, შესაძლებელია SSRF. MediaItem-ის url Spatie-ს getUrl()-დან მოდის – უნდა შემოწმდეს, შეიძლება თუ არა მომხმარებელმა დაყენებული URL.

### app/Http/Controllers/BugAttachmentController.php:103
```php
echo file_get_contents($mediaItem->url);
```
**პრობლემა:** იგივე რისკი – remote URL-ის ფეჩიანობა.

### app/Services/WebhookService.php:49
```php
$curlHandle = curl_init($url);
```
**პრობლემა:** Webhook URL მოდის DB-დან. უკვე დაცულია UrlSecurity-ით, მაგრამ ჯერ კიდევ საჭიროა ვალიდაცია URL-ზე.

---

## 2. Open Redirect

### app/Libraries/Easebuzz/payment.php:702
```php
header('Location:' . $redirectUrl);
```
**პრობლემა:** `$redirectUrl` API-დან მოდის. უკვე დაცულია `UrlSecurity::isSafeRedirectUrl`-ით.

### app/Libraries/Tap/Payment.php:141
```php
return redirect($json_response->transaction->url);
```
**პრობლემა:** `$json_response->transaction->url` external API-დან მოდის – შეიძლება Open Redirect იყოს, თუ API დააბრუნებს მანიპულირებულ URL-ს.

### app/Http/Controllers/XenditPaymentController.php:159
```php
return redirect($result['invoice_url']);
```
**პრობლემა:** `invoice_url` Xendit API-დან მოდის – ვალიდაცია არ ხდება.

### app/Http/Controllers/MolliePaymentController.php:102
```php
return redirect($payment->getCheckoutUrl());
```
**პრობლემა:** Mollie-ს URL – არ ხდება ხელისუფალი დოპმენის შემოწმება.

### resources/views/aamarpay-redirect.blade.php:11
```html
<form name="redirectpost" method="post" action="{{ $redirectUrl }}">
```
**პრობლემა:** `$redirectUrl` მოწოდებულია backend-ის მიერ – საჭიროა დარწმუნება, რომ დომენი whitelist-შია.

---

## 3. SQL Injection ან raw query რისკი

### app/Http/Controllers/ExpenseDashboardController.php:148
```php
DB::raw("DATE_FORMAT(expense_date, '{$dateFormat}') as period"),
```
**პრობლემა:** `$dateFormat` მოდის `match($period)`-დან, სადაც `$period` არის `$request->get('period', 'monthly')`. მიუხედავად იმისა, რომ match ფიქსირებულ სიმრავლეს იყენებს, სასურველია ცვლადის უშუალო ჩასმის ნაცვლად parameter binding-ის გამოყენება.

### app/Exports/ProjectExport.php:29
```php
return Project::whereRaw('1 = 0');
```
**პრობლემა:** მუდმივი string – რისკი არ არის.

### app/Models/User.php:424
```php
return $query->whereRaw('1 = 0');
```
**პრობლემა:** მუდმივი string – რისკი არ არის.

---

## 4. XSS – dangerouslySetInnerHTML

### resources/js/components/notes/NoteFormModal.tsx:178
```tsx
dangerouslySetInnerHTML={{ __html: formData.text }}
```
**პრობლემა:** `formData.text` მომხმარებლის შეყვანაა. უკვე სანიტიზებულია `sanitizeHtml`-ით backend-ში.

### resources/js/pages/notes/Index.tsx:203, 434
```tsx
dangerouslySetInnerHTML={{ __html: note.text }}
```
**პრობლემა:** ნოტის ტექსტი – უკვე სანიტიზებულია შენახვისას.

### resources/js/pages/landing-page/custom-page.tsx:271
```tsx
dangerouslySetInnerHTML={{ __html: page.content }}
```
**პრობლემა:** კონტენტი ადმინიდან მოდის – უკვე სანიტიზებულია.

### resources/js/pages/landing-page/components/AboutUs.tsx:111
```tsx
dangerouslySetInnerHTML={{ ... }}
```
**პრობლემა:** უნდა შემოწმდეს, სად მოდის კონტენტი – settings/API-დან თუ არა.

### resources/js/pages/**/Index.tsx – link.label
```tsx
{isTextLink ? label : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
```
**პრობლემა:** `link.label` breadcrumb/navigation-დან მოდის – როგორც წესი კონფიგიდან. შემოწმება საჭიროა.

---

## 5. Path Traversal / File Access

### app/Http/Controllers/ContractController.php:341-347, 370-376
```php
$fileName = time() . '_' . $file->getClientOriginalName();
$file->storeAs($dir, $fileName, 'public');
...
$attachment->files = $fileName;  // შემდეგ fileDownload-ში:
$filePath = 'contract_attachments/' . $attachment->files;
return Storage::disk('public')->download($filePath, $attachment->files);
```
**პრობლემა:** `getClientOriginalName()` შეიძლება შეიცავდეს `../` (path traversal) ან სახელში HTML/script (Content-Disposition header-ში XSS). Laravel-ის Storage::download-ის მეორე პარამეტრი (`$attachment->files`) იგზავნება Content-Disposition-ში.

### app/Http/Controllers/ContractController.php:277
```php
return response()->download($filePath, 'Preview.tsx');
```
**პრობლემა:** `$filePath = resource_path('js/pages/contracts/Preview.tsx')` – ფიქსირებული path, რისკი არ არის.

### app/Http/Controllers/MediaController.php:248
```php
return response()->download($filePath, $media->file_name);
```
**პრობლემა:** `$filePath = $media->getPath()` – Spatie Media Library. `file_name` შეიძლება მომხმარებლისაგან მოდის და Content-Disposition-ში XSS იყოს.

---

## 6. CSRF-ის გამორთება

### bootstrap/app.php:44-84
```php
'install/*',
'update/*',
...ბევრი payment callback route...
```
**პრობლემა:** `install/*` და `update/*` CSRF-დან გამორთულია. თუ installer/update routes არსებობს და ხელმისაწვდომია, შესაძლებელია CSRF abuse. დარწმუნდით, რომ install/update მხოლოდ დაუყენებელ სისტემაზე მუშაობს.

---

## 7. Path Traversal – LanguageController

### app/Http/Controllers/LanguageController.php:87
```php
$langPath = resource_path("lang/{$lang}.json");
...
File::put($langPath, json_encode($data, ...));
```
**პრობლემა:** `$lang` მოდის request-დან, ვალიდირდება `$languages->pluck('code')->contains($lang)`-ით. თუ language.json-ში შეიძლება მოხვდეს მანიპულირებული code (მაგ. `../../.env`), path traversal შესაძლებელია. ასევე `$data` სწორად უნდა იყოს validated – JSON structure injection.

---

## 8. შიდა Error Message-ების გამოტანა

### app/Http/Controllers/LanguageController.php:104
```php
return redirect()->back()->with('error', __('Failed to update language file: ') . $e->getMessage());
```
**პრობლემა:** `$e->getMessage()` შეიძლება შეიცავდეს სისტემის ინფორმაციას – ინფორმაციის გაჟონვა.

### app/Http/Controllers/Settings/* (ძალიან ბევრ ფაილში)
```php
'error' => __('Failed... :error', ['error' => $e->getMessage()])
```
**პრობლემა:** Exception message-ების გამოტანა მომხმარებლისთვის – პოტენციური ინფორმაციის გაჟონვა.

---

## 9. Payment / Redirect URL-ები მესამე მხარის API-დან

ყველა payment controller, რომელიც `redirect($apiResponse['url'])` ან მსგავსს იყენებს:
- MercadoPagoController
- FlutterwavePaymentController
- PaystackPaymentController
- ToyyibPayPaymentController
- CinetPayPaymentController
- და სხვა

**პრობლემა:** API მოპასუხე URL-ებს არ ექვემდებარება დომენის whitelist-ზე შემოწმებას.

---

## 10. form.innerHTML (Frontend)

### resources/js/components/invoice-payfast-modal.tsx:32
```javascript
paypalRef.current.innerHTML = '';
```

### resources/js/components/invoice-payfast-form.tsx:49
```javascript
form.innerHTML = data.inputs;
```

### resources/js/components/payment/payfast-payment-form.tsx:103
```javascript
form.innerHTML = data.inputs;
```

### resources/js/components/invoices/invoice-payfast-form.tsx:49
```javascript
form.innerHTML = data.inputs;
```

**პრობლემა:** `data.inputs` server-დან მოდის. თუ backend არ სანიტიზებს ან არ ვალიდურებს, შესაძლებელია XSS.

---

## 11. curl_exec ყველგან

ძალიან ბევრი payment controller და service იყენებს `curl_exec` URL-ებზე, რომლებიც:
- configuration-დან მოდის
- API response-დან მოდის
- ან DB-დან მოდის

**პრობლემა:** SSRF რისკი – URL ყოველთვის უნდა ექვემდებარებოდეს UrlSecurity-ის შემოწმებას.

---

## სულ ძირითადი კატეგორიები

| კატეგორია       | სერიოზულობა | ფაილების რაოდენობა |
|-----------------|-------------|---------------------|
| SSRF            | მაღალი      | 3+                  |
| Open Redirect   | საშუალო     | 6+                  |
| XSS             | საშუალო     | 15+                 |
| Path Traversal  | საშუალო     | 3                   |
| Info Disclosure | დაბალი      | 10+                 |
| CSRF Exceptions | საშუალო     | 1                   |
