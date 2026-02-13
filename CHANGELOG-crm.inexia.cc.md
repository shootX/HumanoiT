# ცვლილებების ისტორია – crm.inexia.cc

ყველა ცვლილება, რაც პროექტზე განხორციელდა crm.inexia.cc-ზე გადმოტანის შემდეგ.

---

## 2025-02-12 – Asset ფუნქციონალის სრული მოხსნა

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
