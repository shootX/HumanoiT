# PROJECT MEMORY — crm.inexia.cc

> **პროექტის მთავარი მახსოვრობა.** აქ იწერება ყველა მნიშვნელოვანი ცვლილება, განახლება, bugfix და ოპტიმიზაცია — სესიიდან სესიამდე, აგენტისა და გუნდისთვის.

**დაკავშირებული ფაილები:**
- `CHANGELOG-crm.inexia.cc.md` — ვერსიული ისტორია (push/deploy-ის წინ)
- `CHANGELOG.md` — ზოგადი changelog (TASKLY/Humana Tasks)

---

## სწრაფი კონტექსტი

| | |
|---|---|
| **პროექტი** | Humana Tasks CRM — პროექტები, ამოცანები, აქტივები, ტექნიკა, ინვოისები, კონტაქტები |
| **Stack** | Laravel (PHP) + React / Inertia / TypeScript / Tailwind |
| **ბაზა** | MySQL |
| **დომენი** | crm.inexia.cc |
| **ბოლო ვერსია** | v1.8.0 (2026-05-14) — Tasks Paste Import |

---

## როგორ გამოვიყენოთ

1. **ყოველი მნიშვნელოვანი სამუშაოს შემდეგ** დაამატე ჩანაწერი ქვემოთ (ახალი ზევით).
2. **ვერსიის გამოშვებისას** — დეტალური ჩანაწერი ასევე `CHANGELOG-crm.inexia.cc.md`-ში.
3. **ფორმატი** — თარიღი, კატეგორია, მოკლე აღწერა, საჭიროებისას ფაილები/გზები.

### კატეგორიები

- `განახლება` — ახალი ფუნქციონალი ან გაფართოება
- `ცვლილება` — არსებული ქცევის/UI-ის შეცვლა
- `fix` — შეცდომის გასწორება
- `ოპტიმიზაცია` — სიჩქარე, მეხსიერება, კოდის გაწმენდა
- `გადაწყვეტილება` — არქიტექტურული/ბიზნეს არჩევანი (რატომ ასე)
- `ცნობილი პრობლემა` — ჯერ არ გამოსწორებული ან workaround

### ჩანაწერის შაბლონი

```markdown
### YYYY-MM-DD — მოკლე სათაური

**კატეგორია:** განახლება | ცვლილება | fix | ოპტიმიზაცია | გადაწყვეტილება

- რა შეიცვალა / რა პრობლემა იყო / რა გადაწყვეტილება მივიღეთ
- **ფაილები:** `path/to/file.php`, `resources/js/...`
- **შენიშვნა:** (არასავალდებულო) რა უნდა გაითვალისწინოს მომავალში
```

---

## ბოლო ჩანაწერები

*(ახალი ჩანაწერები ყოველთვის ამ სექციის თავში)*

---

### 2026-07-01 — AI ასისტენტის სრული სახელმძღვანელო

**კატეგორია:** განახლება

- დაემატა ერთიანი დოკუმენტი, რომელიც აღწერს AI Operations Manager-ის არქიტექტურას, ბრძანებების დამუშავებას, tools/permissions/confirmation/audit ნაკადს და სრულად დახვეწის რეკომენდაციებს.
- **ფაილები:** `docs/AI_ASSISTANT_GUIDE.md`

---

### 2026-06-27 — ფილიალის typo-ების ავტომატური მაპინგი

**კატეგორია:** fix

- `ProjectBranchResolver::resolveFuzzy` — გრამატიკული/ორთოგრაფიული შეცდომები → არსებული ფილიალი.
- ახალი ფილიალი იქმნება მხოლოდ თუ მსგავსი არსებული არ მოიძებნა.
- `normalizeBranchStem` — ქალაქის ფორმების ნორმალიზაცია (ქუთასისშის → ქუთაისი).
- create_task / create_equipment / გრაფიკი — fuzzy resolve ყველგან.
- **ფაილები:** `ProjectBranchResolver.php`, `BranchIntentHelper.php`, `AiToolExecutor.php`

---

### 2026-06-27 — ქუთაისის ფილიალი: დავალების ძებნა 0 შედეგი

**კატეგორია:** fix

- მიზეზი: დავალება შექმნილი იყო typo ფილიალში „ქუთასისშის ფილიალი", ძებნა კი „ქუთაისის ფილიალს" ეძებდა.
- `BranchIntentHelper` — ქალაქის ლოკატივი (ქუთაისში) → ქუთაისის ფილიალი; typo alias-ები.
- `ProjectBranchResolver::resolveSimilarProjects` — მსგავსი ფილიალების ძებნა.
- `searchTask` — ფილიალის ფილტრი მოიცავს მსგავს პროექტებსაც.
- დავალება #155 გადატანილია ქუთაისის ფილიალში; typo პროექტი წაშლილია.
- **ფაილები:** `BranchIntentHelper.php`, `ProjectBranchResolver.php`, `AiToolExecutor.php`, `TaskCreateIntentParser.php`

---

### 2026-06-27 — AI CRUD უფლებები ყველა მოდულში

**კატეგორია:** განახლება

- `AiOpsModulePermissions` — create/search/update უფლებების ცენტრალური სია.
- Manager: fleet, contracts, projects, crm_contact მოდულები (delete გარეშე).
- Member: AI CRUD უფლებები ყველა მოდულში.
- `SearchModuleAiTool` — view_any ან view საკმარისია ძებნისთვის.
- **ფაილები:** `AiOpsModulePermissions.php`, `RoleSeeder.php`, `SearchModuleAiTool.php`

---

### 2026-06-27 — AI დავალების ძებნა (search_task)

**კატეგორია:** fix

- `TaskSearchIntentParser` + ავტომატური `search_task` „იპოვე/ნახე დავალება".
- `search_task`: project_title, ნაწილობრივი სათაური, task_view უფლება.
- Manager/member: tasks + ai_ops უფლებები RoleSeeder-ში.
- **ფაილები:** `TaskSearchIntentParser.php`, `SearchTaskTool.php`, `ConversationEngine.php`

---

**კატეგორია:** fix

- „დავალება სახელით ქუთაისი კონდიციონერების წმენდა" → `TaskCreateIntentParser` + `create_task` (არა equipment გრაფიკი).
- `project_title` მხარდაჭერა; ქალაქი სათაურიდან → ქუთაისის ფილიალი.
- Hallucination guard: „შევასრულე" დავალებაზე.
- სახელმძღვანელო: დავალება vs გრაფიკი განცალკევება.
- **ფაილები:** `TaskCreateIntentParser.php`, `CreateTaskTool.php`, `CRM_სრული_სახელმძღვანელო.md`

---

**კატეგორია:** განახლება

- `search_crm_docs` tool — ძებნა `docs/CRM_სრული_სახელმძღვანელო.md`-ში (სექციებად, keyword scoring).
- „როგორ/სად/რა“ კითხვებზე AI ჯერ სახელმძღვანელს ეძებს; ოპერაციებზე — CRM tools.
- **ფაილები:** `CrmDocsSearchService.php`, `Tools/Docs/SearchCrmDocsTool.php`, `AiContextService.php`

---

### 2026-06-26 — CRM სრული სახელმძღვანელო (Master Manual)

**კატეგორია:** განახლება

- შეიქმნა ერთიანი Master Manual — DocGuide/docs ყველა წყაროს კონსოლიდაცია (18 სექცია, 31 მოდული, 6424+ ხაზი)
- **ფაილი:** `docs/CRM_სრული_სახელმძღვანელო.md`
- **შენიშვნა:** API/DB სრული map — system-discovery 02-06 არ არსებობს, მონიშნულია ⚠

---

### 2026-06-26 — Equipment Schedule: ფილტრის მიხედვით Excel ექსპორტი

**კატეგორია:** განახლება

- `/equipment-schedule` გვერდზე დაემატა ექსპორტის ღილაკი — ფილიალი, ტიპი და სერვისის ფილტრების მიხედვით `.xlsx` ჩამოტვირთვა
- **ფაილები:** `app/Exports/EquipmentScheduleExport.php`, `app/Http/Controllers/EquipmentScheduleController.php`, `resources/js/pages/equipment-schedule/Index.tsx`, `routes/web.php`

---

### 2026-06-25 — DocGuide: Owner Manual (7 ფაილი)

**კატეგორია:** განახლება

- შეიქმნა Owner Manual ქართულად — თითო ეკრანზე: დანიშნულება, გამოყენება, permissions, მოსალოდნელი შედეგი, ხშირი შეცდომები
- **ფაილები:** `DocGuide/docs/owner-manual/01-dashboard.md` … `07-settings.md`
- **შენიშვნა:** Leads = Landing Contacts + Newsletters + CRM (კლასიკური pipeline არ არსებობს)

---

### 2026-06-25 — DocGuide: system discovery, access audit, business flows, calculations

**კატეგორია:** განახლება

- სრული CRM დოკუმენტაცია DocGuide-ში: `system-discovery/`, `access-matrix.md`, `business-flows/`, `calculations.md` (80+ ფორმულა).
- კოდი არ შეცვლილა — მხოლოდ დოკუმენტაცია.

---

### 2026-06-25 — AI ავტომატური ფილიალით ძებნა (განრიგი)

**კატეგორია:** განახლება

- „რუსთავის ფილიალში სამივე კონდიციონერს დაუმატე წმენდა 2026.05.23“ → LLM-მდე parser თავად პოულობს პროექტს/ტექნიკას და bulk გეგმას აგენერირებს.
- `ProjectBranchResolver` — რუსთავის vs რუსთაველის გარჩევა; `search_equipment` + `project_title`.
- fix: `დაუმატე` regex (ადრე `დამატ` არ match-ავდა).
- **ფაილები:** `BranchIntentHelper.php`, `ProjectBranchResolver.php`, `EquipmentScheduleIntentParser.php`, `ConversationEngine.php`

---

**კატეგორია:** fix

- Read tool + synthesis აღარ ამბობს „დაემატა განრიგი“ — write intent-ზე plan-ს ქმნის parser-ით.
- `sanitizeAssistantContent` ყველა assistant პასუხს ამოწმებს (✅ + EQ-xxxx ტყუილი დაბლოკილი).
- Schedule parser: DD.MM.YYYY თარიღი, „წმენდის“ სერვისი.
- **ფაილები:** `AiHallucinationGuard.php`, `ConversationEngine.php`, `EquipmentScheduleIntentParser.php`

---

**კატეგორია:** fix

- AI აღარ ამბობს „create_equipment არ მაქვს“ — `EquipmentCreateIntentParser` პარსავს „ქავთარაძის ფილიალს დაუმატე 3 კონდიციონერი…“ ფორმატს.
- `create_equipment` იღებს `project_title`-ს; პროექტი არ არსებობს → ავტომატურად იქმნება.
- Hallucination guard ბლოკავს „ხელით მოგიწევთ“ ტექსტს.
- **ფაილები:** `EquipmentCreateIntentParser.php`, `CreateEquipmentTool.php`, `AiToolExecutor.php`, `ConversationEngine.php`, `AiHallucinationGuard.php`

---

### 2026-06-25 — AI Equipment სრული უფლებები (წაშლის გარეშე)

**კატეგორია:** განახლება

- Equipment AI: search/create/update schedules, bulk, types, service types; delete tool არ არსებობს.
- Member როლს: equipment_view/create/update, equipment_type_manage, service_type_manage (არა equipment_delete).
- **ფაილები:** `Tools/Equipment/*`, `AiToolExecutor.php`, `RoleSeeder.php`

---

### 2026-06-25 — AI სრული CRUD tools (ყველა მოდული)

**კატეგორია:** განახლება

- დაემატა search/create tools: `search_task`, `search_project`, `search_note`, `search_contract`, `create_equipment`, `create_vehicle`.
- გაფართოვდა `update_equipment` (health_status, notes, EQ კოდით), `change_equipment_status` fix.
- **ფაილები:** `ToolRegistry.php`, `AiToolExecutor.php`, `Tools/*`

---

### 2026-06-25 — AI tool schema empty properties fix

**კატეგორია:** fix

- `generate_equipment_report` / `generate_fleet_report`: ცარიელი `properties` JSON-ში `[]` ხდებოდა, API მოითხოვს `{}`; გასწორდა `AiProviderManager::normalizeToolParameters`.
- **ფაილები:** `AiProviderManager.php`

---

### 2026-06-25 — AI ცრუ „შესრულდა“ fix (hallucination guard)

**კატეგორია:** fix

- LLM ტექსტით ამბობდა „შესრულდა“ tool-ების გარეშე; ამოღებულია tools-ის გარეშე retry, დაემატა `AiHallucinationGuard`, forced `tool_choice`, `EquipmentScheduleIntentParser` (EQ კოდები → დადასტურების გეგმა).
- **ფაილები:** `ConversationEngine.php`, `AiHallucinationGuard.php`, `EquipmentScheduleIntentParser.php`, `AbstractOpenAiCompatibleProvider.php`

---

### 2026-06-25 — AI Equipment service schedule fix

**კატეგორია:** fix

- AI ცდილობდა არარსებული `service_schedule` JSON ველის განახლებას; დაემატა `upsert_equipment_schedule` tool (equipment_code + service_type_name + last_service_date), search-ში schedules, system prompt განახლება, დადასტურება „განაახლე“-ზე.
- **ფაილები:** `UpsertEquipmentScheduleTool.php`, `AiToolExecutor.php`, `AiContextService.php`, `ConfirmationEngine.php`

---

### 2026-06-25 — AI API „choices“ error fix

**კატეგორია:** fix

- `Undefined array key "choices"` — OpenAI SDK ვერ ამუშავებდა არასტანდარტულ API პასუხს; გადავიდა პირდაპირ HTTP chat/completions-ზე, provider-ის default model-ები (DeepSeek → `deepseek-chat`), tool schema normalization.
- **ფაილები:** `AbstractOpenAiCompatibleProvider.php`, `AiProviderManager.php`, `ai-ops-settings.tsx`

---

### 2026-06-25 — AI chat „Done.“ fix

**კატეგორია:** fix

- Tool mode-ში streaming ცარიელ პასუხს აბრუნებდა → fallback „Done.“; გამოსწორდა: tools-თან non-streaming completion, read tool შედეგების LLM სინთეზი, ცარიელი პასუხის fallback ტექსტის გარეშე tools-ით.
- **ფაილები:** `ConversationEngine.php`, `AiContextService.php`

---

### 2026-06-25 — AI Operations Manager (MVP)

**კატეგორია:** განახლება

- ახალი **AI Operations Manager** მოდული: მრავალპროვაიდერული LLM (OpenAI, DeepSeek, Claude, Gemini), საუბრის ისტორია, SSE streaming, Tool Registry (32 CRM tool), დადასტურების ძრავა, audit log, workspace იზოლაცია, Spatie permissions.
- Backend: `app/Models/AiOps/*`, `app/Services/AiOps/*`, `app/Http/Controllers/AiOps/*`, migration `2026_06_25_000001_create_ai_ops_tables.php`.
- Frontend: `resources/js/pages/ai-ops/`, sidebar „AI ასისტენტი“, Settings → AI Operations Settings.
- Permissions: `ai_ops_view`, `ai_ops_chat`, `ai_ops_activity_view`, `settings_ai_ops`.
- API key დაშიფრული: `app/Support/EncryptedSettings.php`.
- **ფაილები:** `routes/web.php`, `routes/settings.php`, `PermissionSeeder.php`, `RoleSeeder.php`

---

### 2026-06-22 — Fleet Management მოდული (სრული)

**კატეგორია:** განახლება

- ახალი workspace-დონის **Fleet Management** მოდული: ავტომობილების რეესტრი, გარბენის ისტორია, საწვავის ჟურნალი (L/100km, ₾/100km), სერვისების ისტორია, გაერთიანებული ხარჯები, მოვლის კალენდარი/reminders, დოკუმენტები, შენიშვნები, მძღოლის მიბმა, per-vehicle dashboard, fleet analytics.
- Backend: `app/Models/Fleet/*`, `app/Services/Fleet/*`, `app/Http/Controllers/Fleet/*`, migration `2026_06_22_000001_create_fleet_tables.php`, command `fleet:check-reminders`.
- Frontend: `resources/js/pages/fleet/` (Index, Create, Edit, Show, Analytics), sidebar „ავტოპარკი“, notification-dropdown → `fleet_alerts`.
- Permissions: `fleet_view_any`, `fleet_create`, `fleet_fuel_manage`, `fleet_analytics_view` და სხვა (`PermissionSeeder`).
- **ფაილები:** `routes/web.php`, `app-sidebar.tsx`, `FleetConstants.php`

---

### 2026-06-22 — Fleet ტესტების fix (sqlite + permissions)

**კატეგორია:** fix

- Migration-ები sqlite-ზე: `add_used_status_to_assets`, `add_code_to_equipment` — skip/Schema-ზე გადასვლა.
- `phpunit.xml`: `IS_SAAS=false` — plan redirect ტესტებში აღარ ხდება.
- `FleetVehicleControllerTest`: PermissionSeeder + `givePermissionTo` fleet permissions.
- **შედეგი:** `php artisan test --filter=Fleet` — 7/7 passed.

---

### 2026-06-18 — დავალებების ექსპორტი ფილტრებით

**კატეგორია:** განახლება

- Tasks გვერდზე „ექსპორტი“ ღილაკი — Excel ჩამოტვირთვა მიმდინარე ფილტრებით (პროექტი, ეტაპი, პრიორიტეტი, შემსრულებელი, ძებნა).
- API: `GET tasks/export`, `TaskController::export`, `App\Exports\TaskExport`.
- ფილტრის ლოგიკა გამოყოფილია `buildFilteredTasksQuery()`-ში (index + export).

---

### 2026-06-18 — PROJECT MEMORY ფაილის შექმნა

**კატეგორია:** განახლება

- შეიქმნა `MEMORY.md` — პროექტის მთავარი მახსოვრობა ცვლილებების, fix-ების და ოპტიმიზაციის ჩასაწერად.
- Cursor rule: `.cursor/rules/project-memory.mdc` — აგენტი უნდა წაიკითხოს და განაახლოს ეს ფაილი მნიშვნელოვანი სამუშაოს შემდეგ.

---

### 2026-05-14 — დავალებების იმპორტი ტექსტიდან (Paste Import)

**კატეგორია:** განახლება

- Tasks → „დავალებების იმპორტი ტექსტიდან“: პირველი ხაზი = ფილიალი, შემდეგი = დავალებების სია (`1.`, `-`, ცალკე ხაზები).
- API: `POST tasks/paste-import`, `TaskPasteImportService`, `TaskController::pasteImport`.
- **ფაილები:** `TaskPasteImportModal.tsx`, `tests/Unit/TaskPasteImportServiceTest.php`, `en.json`, `ka.json`.
- **ვერსია:** v1.6.0 (changelog) / v1.8.0 (README).

---

### 2026-04-07 — ინსტრუმენტები და აქტივების merge

**კატეგორია:** განახლება

- `assets.is_instrument` — ცალკე გვერდი `/assets/instruments`.
- Merge: 2+ აქტივის გაერთიანება; `invoice_items.asset_id` **არ იცვლება**; shadow ჩანაწერები `merged_into_asset_id`-ით.
- **ვერსია:** v1.7.2.

---

### 2026-02-21 — კლიენტის ავტორიზაცია და ანგარიშები

**კატეგორია:** განახლება + fix

- კლიენტის ლოგინი, Dashboard და ინვოისების ნახვა.
- Task Report, Project Report Excel export.
- Fix: 419 CSRF → login redirect; 403 permission კლიენტისთვის.
- **ვერსია:** v1.5.0.

---

### 2026-02-06 — ინვოისები — ბიუჯეტის კატეგორია და გადახდის მეთოდები

**კატეგორია:** განახლება + fix

- ინვოისზე `budget_category_id`; Mark as Paid → ხარჯი იგივე კატეგორიით.
- 5 გადახდის მეთოდი (ინგლისური): Bank Transfer, Company Card, Personal, Personal Card, Cash.
- Fix: Settings შენახვა (`settings()` scope); Mark as Paid — native `<select>` Radix-ის ნაცვლად (z-index).
- **ფაილები:** `Invoice.php`, `InvoiceController.php`, `payment-settings.tsx`, `resources/js/utils/payment.ts`.

---

## არქიტექტურა და კონვენციები

- **Backend:** Laravel controllers → services (რთული ლოგიკა), Eloquent models, migrations.
- **Frontend:** Inertia pages `resources/js/pages/`, shared components `resources/js/components/`.
- **i18n:** `lang/en.json`, `lang/ka.json` (+ `ru.json` სადაც საჭიროა).
- **Permissions:** Spatie; `HasPermissionChecks` trait — try/catch permission შემოწმებებში.
- **Settings:** `settings($userId, $workspaceId)` — scope არ უნდა გადაიფაროს non-SaaS override-ით.
- **Select/Dropdown:** მოდალებში z-index პრობლემებისთვის ზოგჯერ native `<select>` უკეთესია Radix-ზე.
- **Deploy:** GitHub Actions → `scripts/deploy.sh` (იხ. `DEPLOY.md`).

---

## ცნობილი პრობლემები / განსახილველი

*(აქ ჩაწერე რაც ჯერ არ არის გამოსწორებული)*

| სტატუსი | აღწერა | შენიშვნა |
|--------|--------|---------|
| — | *(ცარიელი)* | — |

---

## საკვანძო გზები

| მოდული | Backend | Frontend |
|--------|---------|----------|
| Tasks | `TaskController`, `TaskPasteImportService` | `resources/js/pages/tasks/` |
| Assets | `AssetController`, `AssetTaskAllocationService` | `resources/js/pages/assets/` |
| Equipment | `EquipmentController` | `resources/js/pages/equipment/` |
| Invoices | `InvoiceController` | `resources/js/pages/invoices/` |
| CRM Contacts | `CrmContactController` | `resources/js/pages/crm-contacts/` |
| Reports | `ProjectReportController`, Task Report | `resources/js/pages/reports/` |
| Settings | `SettingsController`, `helper.php` | `resources/js/pages/settings/` |

---

*ბოლო განახლება: 2026-06-18*
