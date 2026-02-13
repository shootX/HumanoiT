# Changelog – TASKLY

## 2026-02-06

### დამატებული ფუნქციონალი

- **ინვოისებზე ბიუჯეტის კატეგორია**  
  - ინვოისის ფორმაზე (შექმნა/რედაქტირება) დაემატა ველი „Budget Category“.  
  - პროექტის არჩევის შემდეგ იტვირთება ამ პროექტის ბიუჯეტის კატეგორიების სია.  
  - ინვოისის „Mark as Paid“-ით გადახდისას შექმნილი ხარჯი იღებს იმავე კატეგორიას (`budget_category_id`).

- **გადახდის მეთოდები (5 ფიქსირებული)**  
  - სისტემაში დარჩა მხოლოდ: Bank Transfer, Company Card, Personal, Personal Card, Cash.  
  - ლეიბლები ინგლისურად.  
  - Settings → Payment Settings გვერდი აჩვენებს მხოლოდ ამ 5 მეთოდს (კონფიგურაციის ფორმა ამოღებულია).

---

### ცვლილებები ფაილებში

| ფაილი | ცვლილება |
|-------|-----------|
| **Backend** | |
| `database/migrations/*_add_budget_category_id_to_invoices_table.php` | ახალი migration: `invoices` ცხრილზე დაემატა `budget_category_id` (nullable, FK → `budget_categories`). |
| `app/Models/Invoice.php` | `budget_category_id` in fillable; `budgetCategory()` relation; `createProjectExpenseIfPaid()` ხარჯს ანიჭებს `budget_category_id`. |
| `app/Models/Payment.php` | `getPaymentMethodDisplayAttribute` – 5 მეთოდის ინგლისური სახელები (keys: bank_transfer, company_card, personal, personal_card, cash). |
| `app/Http/Controllers/InvoiceController.php` | `store`/`update`: `budget_category_id` მიღება და ვალიდაცია; `getProjectInvoiceData`/`getProjectData`: პასუხში `budget_categories` (პროექტის ბიუჯეტის კატეგორიები); `markAsPaid`: `payment_method` ვალიდაცია ამ 5 მნიშვნელობაზე. |
| **Frontend** | |
| `resources/js/utils/payment.ts` | გადაწყდა მხოლოდ 5 მეთოდი: `PAYMENT_METHOD_LIST`, `getPaymentMethodLabel`, ინგლისური ლეიბლები. |
| `resources/js/pages/settings/components/payment-settings.tsx` | გეითვეის კონფიგის ნაცვლად – მხოლოდ 5 გადახდის მეთოდის სია (ცვლილებების შენახვის ფორმა ამოღებულია). |
| ინვოისის ფორმა (Create/Edit) | პროექტის შემდეგ დაემატა Budget Category select; მონაცემები `loadProjectData` → `data.budget_categories`. |
| ინვოისის Show | Budget category ჩვენება (როცა არჩეულია); „Mark as Paid“ მოდალში გადახდის მეთოდი – **native `<select>`** და ლოკალური `PAYMENT_METHOD_OPTIONS` (5 ოფცია), `@/utils/payment` იმპორტი ამოღებული. |
| `resources/js/pages/invoices/Index.tsx` | „Mark as Paid“ მოდალში Radix `Select` ჩანაცვლებულია **native `<select>`**-ით; დამატებული ლოკალური `PAYMENT_METHOD_OPTIONS`; `@/utils/payment` იმპორტი ამოღებული. |

---

### Bugfix-ები

- **Settings – ცვლილებების არ შენახვა / რეფრეშის შემდეგ ძველი მდგომარეობა**  
  - **Frontend:** Settings ფორმის კომპონენტებში (System, Currency, Email, Recaptcha, Storage, Invoice, Zoom, Google Calendar) დაემატა `useEffect`, რომელიც ახალ props-ზე (redirect-ის შემდეგ) სინქრონიზებს ლოკალურ state-ს.  
  - **Backend:** `app/Helpers/helper.php` – `settings()` ფუნქციაში non-SaaS რეჟიმში override (პირველი company user) მხოლოდ მაშინ სრულდება, როცა ფუნქცია გამოძახებულია არგუმენტების გარეშე. როცა Settings კონტროლერი იძახებს `settings($user->id, $workspaceId)`, გადაცემული scope აღარ იცვლება – წაკითხვა და ჩაწერა იგივე user/workspace-ზე ხდება, რეფრეშის შემდეგ ცვლილებები რჩება.  
  - System Settings ვალიდაცია: `termsConditionsUrl` ცარიელი ველი ბექენდზე `null`-ად იგზავნება, რათა `nullable|url` არ ჩავარდეს.

- **„i18n is not defined“ (Invoices Index)** – `useTranslation()`-დან `i18n` გამოყენება/დესტრუქტურიზაცია მოხსნილი; გადახდის მეთოდის ლეიბლი მხოლოდ ინგლისურად.
- **„PAYMENT_METHOD_LIST is not defined“ (Invoice Show)** – Show აღარ იმპორტებს `@/utils/payment`; გამოიყენება ლოკალური `PAYMENT_METHOD_OPTIONS` + native select.
- **გადახდის მეთოდების დუბლირება/არასწორი ჩვენება (Mark as Paid მოდალი)** – Radix Select Dialog-ის შიგნით იწვევდა portal/z-index პრობლემებს. Show-სა და Index-ში ჩანაცვლებულია native `<select>`-ით, ოფციები სწორად ჩანს.
