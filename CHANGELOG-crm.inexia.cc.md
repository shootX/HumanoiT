# ცვლილებების ისტორია – crm.inexia.cc

ყველა ცვლილება, რაც პროექტზე განხორციელდა crm.inexia.cc-ზე გადმოტანის შემდეგ.

---

## v1.5.0 – 2026-02-21

### დამატებული
- **კლიენტის ავტორიზაცია** – კლიენტ-ტიპის მომხმარებლის ლოგინი `/login`-დან, `current_workspace_id` ავტომატური მინიჭება
- **კლიენტის Dashboard წვდომა** – კლიენტებს შეუძლიათ Dashboard-ის ნახვა
- **კლიენტის ინვოისების ნახვა** – კლიენტს ჩანს ინვოისები იმ პროექტებიდან, რომლებშიც არის მინიჭებული
- **Task Report მოდული** – ახალი გვერდი ამოცანების ანგარიშით, ფილტრებით და Excel ექსპორტით
- **Project Report Excel ექსპორტი** – პროექტის ანგარიშის Excel ფორმატში ჩამოტვირთვა ფილტრებით
- **დემო კლიენტის Artisan ბრძანება** – `AddDemoClientToProjects` ყველა პროექტში დამატება + Spatie role მინიჭება
- **სესიის ვადაგასვლის დამუშავება** – 419 Page Expired → ავტომატური გადამისამართება login-ზე

### ცვლილებები
- **Login ფორმა** – `useForm.post()` API-ის სწორი გამოყენება, ReCaptcha-ს გაუმჯობესებული შემოწმება
- **HasPermissionChecks** – `try/catch` Spatie permission შემოწმებებში, exception-ების თავიდან აცილება
- **Sidebar ნავიგაცია** – ანგარიშების სექცია ჯგუფურ მენიუში (Reports): Budget & Expenses, Project Reports, Task Report
- **ProjectReportController** – `members.user` → `members` relation-ის გასწორება, Excel ექსპორტის დამატება
- **ენობრივი ფაილები** – en.json, ka.json, ru.json: ახალი თარგმანები Task Report, Export Excel

### Bugfix-ები
- **419 CSRF შეცდომა** – ლოგინის დროს TokenMismatchException-ის სწორი დამუშავება
- **403 Permission შეცდომა** – კლიენტ მომხმარებლისთვის dashboard-ზე წვდომის გახსნა
- **timer/status 403** – `timesheet_use_timer` permission კლიენტის როლზე

---

## v1.3.0 – 2026-02-21

### დამატებული
- **ნივთის სტატუსი „გამოყენებულია“ (used)** – აქტივებში ახალი სტატუსი
- **ავტომატური სტატუსის განახლება Task-ში** – როცა ნივთი გამოიყენება დავალებაში, ჩანაწერი იყოფა: ნაწილი რჩება აქტიური, გამოყენებული ნაწილი იღებს სტატუს „გამოყენებულია“
- **AssetTaskAllocationService** – სერვისი ნივთის გაყოფის ლოგიკისთვის (active → used)
- **DB მიგრაცია** – `status` ENUM-ში დაემატა `used`

### ცვლილებები
- **Assets ნაგულისხმევი ფილტრი** – ჩანს მხოლოდ აქტიური ნივთები; გამოყენებული/მოვლა/გამორთული ფილტრით
- **TaskFormModal** – `router.reload()` წარმატებული submit-ის შემდეგ
- **ენობრივი ფაილები** – en.json, ka.json: asset_status_used, შეცდომის შეტყობინებები

---

## v1.2.0 – 2025-02-13

### დამატებული
- **Asset/Equipment Register** – აქტივების სრული CRUD, Task-თან დაკავშირება, permissions, i18n

### ცვლილებები
- **Select/Dropdown z-index** – Select, DropdownMenu, Popover: z-50 → z-[10050] (მოდალების ზემოთ ჩვენება)
- **SelectItem empty value** – Radix Select-ის შეცდომის გასწორება: `value=""` → `value="__none__"` / `value="__all__"` (TaskAssignment, CustomerReport)

---

## v1.1.0 – 2025-02-13

### დამატებული
- **Task-ის მრავალი შემსრულებელი** – `assigned_to` + `task_members`, SimpleMultiSelect, `assigned_user_ids`
- **Assignees სია** – ყველა workspace მომხმარებელი (მენეჯერი, წევრი, კლიენტი), superadmin-ის გარდა
- **GitHub + Auto-Deploy** – `.github/workflows/deploy.yml`, `scripts/deploy.sh`, `DEPLOY.md`

### ცვლილებები
- `TaskController`: members `where('type', '!=', 'superadmin')`; `Task::with(['members'])`; `assigned_user_ids` store/update
- `TaskFormModal`, `TaskModal`: SimpleMultiSelect assignees-ისთვის
- `Index.tsx`: Kanban/Card/Table – assignees = `task.members || [task.assigned_to]`
- Notifications (Slack, Telegram): assignees = `members` ან `assignedTo`

---

## v1.0.0 – 2025-02-12 – Asset ფუნქციონალის სრული მოხსნა

### წაშლილი ფაილები
- `app/Http/Controllers/AssetController.php`
- `app/Models/Asset.php`
- `resources/js/pages/assets/Index.tsx`
- `resources/js/pages/assets/Show.tsx`
- `resources/js/pages/assets/` (დირექტორია)

### ცვლილებები `routes/web.php`
- ამოღებულია `AssetController` import
- წაშლილია როუტები:
  - `assets.index`
  - `assets.create`
  - `assets.store`
  - `assets.show`
  - `assets.update`
  - `assets.destroy`

### ცვლილებები `app/Models/Task.php`
- `asset_id` ამოღებულია `$fillable` მასივიდან
- წაშლილია `asset()` BelongsTo relation

### ცვლილებები `app/Http/Controllers/TaskController.php`
- ამოღებულია `use App\Models\Asset`
- `index()`: წაშლილია `$assets` ცვლადი და მისი გადაცემა Inertia-ში
- `show()`: `asset` ამოღებულია `$task->load([...])` სიიდან
- `store()`: წაშლილია `asset_id` ვალიდაცია და Asset-ის შემოწმება
- `update()`: წაშლილია `asset_id` ვალიდაცია და Asset-ის შემოწმება

### ცვლილებები `resources/js/components/tasks/TaskFormModal.tsx`
- წაშლილია `Asset` interface
- `assets` prop ამოღებულია Props-დან და კომპონენტის პარამეტრებიდან
- `asset_id` ამოღებულია formData-დან
- წაშლილია Asset-ის არჩევის Select ველი ფორმიდან

### ცვლილებები `resources/js/pages/tasks/TaskModal.tsx`
- წაშლილია Asset-ის ბლოკი (ლინკი `assets.show`-ზე)
- `Package` icon ამოღებულია lucide-react import-დან

### ცვლილებები `resources/js/pages/tasks/index.tsx`
- `assets` ამოღებულია Props interface-დან
- `assets` ამოღებულია კომპონენტის პარამეტრებიდან
- `assets={assets}` ამოღებულია TaskFormModal-ის გადაცემიდან

---

## შენიშვნები

- `tasks` ცხრილში შეიძლება დარჩეს `asset_id` სვეტი (თუ migration-ით დაემატა). მისი წაშლა საჭიროების შემთხვევაში ცალკე migration-ით ხდება.
- `assets` ცხრილი (თუ არსებობს) უცვლელი დარჩა; მისი წაშლა საჭიროების შემთხვევაში ცალკე migration-ით ხდება.
