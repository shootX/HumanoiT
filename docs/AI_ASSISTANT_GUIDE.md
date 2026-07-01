# AI ასისტენტის სრული სახელმძღვანელო

**პროექტი:** Humana Tasks CRM  
**მოდული:** AI Operations Manager / AI Assistant  
**ბოლო განახლება:** 2026-07-01

ეს დოკუმენტი ხსნის, როგორ მუშაობს CRM-ის AI ასისტენტი, რას აკეთებს, რა შეუძლია, როგორ ამუშავებს მომხმარებლის ბრძანებებს, სად ინახება მონაცემები და რა უნდა იცოდე მისი სრულად დახვეწის წინ.

---

## 1. მოკლე აღწერა

AI ასისტენტი არის CRM-ის შიდა ოპერაციული მოდული, რომელიც მომხმარებელს აძლევს საშუალებას ბუნებრივი ენით მართოს CRM:

- მოძებნოს ინფორმაცია;
- შექმნას ან განაახლოს ჩანაწერები;
- დაგეგმოს მოქმედებები დადასტურებით;
- მიიღოს ანგარიშები;
- გამოიყენოს CRM-ის ოფიციალური სახელმძღვანელო კითხვებზე პასუხისთვის;
- იმუშაოს მხოლოდ მიმდინარე workspace-ის ფარგლებში;
- დაიცვას მომხმარებლის permissions.

ასისტენტი არ არის უბრალოდ chat. ის არის **LLM + CRM tools + permissions + confirmation + audit log** სისტემა.

---

## 2. ძირითადი ფაილები

### Backend

- `app/Http/Controllers/AiOps/AiOpsController.php` — chat, conversation, confirm/cancel endpoints.
- `app/Http/Controllers/AiOps/AiOpsActivityController.php` — AI activity/audit გვერდი.
- `app/Services/AiOps/ConversationEngine.php` — მთავარი ორკესტრატორი.
- `app/Services/AiOps/AiContextService.php` — system prompt, workspace, permissions, user context.
- `app/Services/AiOps/Providers/AiProviderManager.php` — provider/model/settings მართვა.
- `app/Services/AiOps/Providers/AbstractOpenAiCompatibleProvider.php` — OpenAI-compatible chat/completions request.
- `app/Services/AiOps/ToolRegistry.php` — CRM tool-ების რეგისტრი.
- `app/Services/AiOps/AiToolExecutor.php` — tool-ების რეალური შესრულება CRM-ში.
- `app/Services/AiOps/ActionPlanner.php` — write მოქმედებების plan-ად ფორმირება.
- `app/Services/AiOps/ConfirmationEngine.php` — confirm/cancel ტექსტების ამოცნობა.
- `app/Services/AiOps/ExecutionEngine.php` — pending plan-ის შესრულება და შედეგის შეჯამება.
- `app/Services/AiOps/AiAuditService.php` — შესრულებული მოქმედებების audit log.
- `app/Services/AiOps/AiHallucinationGuard.php` — ცრუ წარმატების/ფაბრიკაციისგან დაცვა.
- `app/Services/AiOps/Tools/**` — კონკრეტული CRM tools.

### Frontend

- `resources/js/pages/ai-ops/Index.tsx` — AI Assistant გვერდი.
- `resources/js/components/ai-ops/ChatWindow.tsx` — chat UI, SSE streaming, confirm/cancel.
- `resources/js/components/ai-ops/MessageBubble.tsx` — message rendering.
- `resources/js/components/ai-ops/ActionPlanCard.tsx` — confirmation card.
- `resources/js/pages/ai-ops/Activity.tsx` — audit/activity UI.

### Database

- `database/migrations/2026_06_25_000001_create_ai_ops_tables.php`
- `app/Models/AiOps/AiConversation.php`
- `app/Models/AiOps/AiMessage.php`
- `app/Models/AiOps/AiActionLog.php`

### Routes

- `GET /ai-assistant`
- `GET /ai-assistant/activity`
- `POST /api/ai-ops/conversations`
- `GET /api/ai-ops/conversations`
- `GET /api/ai-ops/conversations/{conversation}`
- `DELETE /api/ai-ops/conversations/{conversation}`
- `POST /api/ai-ops/chat`
- `POST /api/ai-ops/confirm`
- `POST /api/ai-ops/cancel`
- `POST /settings/ai-ops`

---

## 3. როგორ მუშაობს მთლიანად

სრული ნაკადი ასეთია:

1. მომხმარებელი წერს ტექსტს AI Assistant გვერდზე.
2. Frontend ქმნის conversation-ს, თუ ჯერ არ არსებობს.
3. `ChatWindow` აგზავნის request-ს `POST /api/ai-ops/chat` endpoint-ზე.
4. Backend ამოწმებს `ai_ops_chat` permission-ს.
5. `AiOpsController` პოულობს conversation-ს მხოლოდ მიმდინარე user + workspace ფარგლებში.
6. `ConversationEngine` ინახავს user message-ს `ai_messages` ცხრილში.
7. სისტემა აგებს prompt/context-ს:
   - current workspace;
   - user;
   - user type;
   - language;
   - enabled modules;
   - permissions;
   - CRM manual-ის გამოყენების წესები;
   - tool execution-ის წესები.
8. `ToolRegistry` აბრუნებს მხოლოდ იმ tool-ებს, რისი გამოყენების უფლებაც აქვს user-ს.
9. ასისტენტი არჩევს:
   - პირდაპირ პასუხს;
   - read/search/report tool-ს;
   - write action plan-ს;
   - clarifying question-ს.
10. თუ ბრძანება არის read/search/report, tool სრულდება მაშინვე.
11. თუ ბრძანება არის create/update/write, ჯერ იქმნება plan და conversation გადადის `awaiting_confirmation` სტატუსში.
12. user-ის დადასტურების შემდეგ `ExecutionEngine` ასრულებს pending plan-ს.
13. შესრულებული მოქმედება იწერება `ai_action_logs` ცხრილში.
14. assistant message ინახება conversation history-ში.

---

## 4. Read და Write ბრძანებების განსხვავება

### Read ბრძანებები

Read ბრძანებები არის ისეთი მოთხოვნები, რომლებიც არაფერს ცვლის CRM-ში:

- "იპოვე დავალება";
- "მაჩვენე ქუთაისის ფილიალის კონდიციონერები";
- "რამდენი აქტიური მანქანაა";
- "როგორ მუშაობს ეს მოდული";
- "მომეცი project report";
- "მოძებნე კონტაქტი".

Read ბრძანებები სრულდება დაუყოვნებლივ. სისტემა იძახებს შესაბამის `search_*` ან `generate_*` tool-ს და შედეგს აბრუნებს.

### Write ბრძანებები

Write ბრძანებები ცვლის CRM მონაცემებს:

- "შექმენი დავალება";
- "დაუმატე კონდიციონერი";
- "განაახლე ტექნიკის სტატუსი";
- "ჩაწერე სერვისის განრიგი";
- "დაამატე საწვავის ხარჯი";
- "შექმენი კონტაქტი";
- "განაახლე ხელშეკრულება".

Write ბრძანება **არ სრულდება პირდაპირ**. ჯერ იქმნება plan:

```text
I plan to:
✓ Create task: ...

Would you like me to proceed?
```

მხოლოდ დადასტურების შემდეგ სრულდება რეალური ცვლილება.

---

## 5. Conversation Engine

`ConversationEngine` არის AI ასისტენტის მთავარი ტვინი.

მისი პასუხისმგებლობაა:

- user message-ის შენახვა;
- pending confirmation-ის შემოწმება;
- provider-ის კონფიგურაციის შემოწმება;
- system prompt-ის აშენება;
- tools-ის მომზადება;
- deterministic parser-ების გაშვება;
- LLM provider-თან საუბარი;
- tool calls-ის გაყოფა read/write actions-ად;
- write plan-ის შექმნა;
- pending plan-ის execution;
- read result synthesis;
- assistant message-ის შენახვა;
- hallucination guard-ის გამოყენება.

### მნიშვნელოვანი მეთოდები

- `processMessage()` — non-stream chat.
- `processMessageStream()` — SSE streaming chat.
- `handleToolCalls()` — LLM-ის მიერ დაბრუნებული tool calls-ის დამუშავება.
- `executePendingPlan()` — დადასტურებული plan-ის შესრულება.
- `buildMessages()` — system + conversation messages.
- `chatWithToolGuard()` — tool forcing და hallucination protection.
- `tryReadSearchResponse()` — deterministic search parser-ის სწრაფი გზა.
- `parseWriteStepsFromContext()` — deterministic write parser-ები.
- `saveAssistant()` — assistant response-ის შენახვა.

---

## 6. System Prompt და კონტექსტი

`AiContextService::buildSystemPrompt()` აგებს სისტემურ ინსტრუქციას, რომელიც LLM-ს ეუბნება:

- ის არის Humana Tasks CRM-ის AI Operations Manager;
- მოქმედებს მხოლოდ current workspace-ში;
- იცის user name, user type, language, enabled modules;
- არ უნდა შეეხოს აკრძალულ სისტემურ ნაწილებს;
- how/where/what კითხვებზე ჯერ უნდა გამოიყენოს `search_crm_docs`;
- live CRM data-სთვის უნდა გამოიყენოს tools;
- write action-ზე უნდა გამოიყენოს write tool და confirmation plan;
- არ უნდა თქვას, რომ მოქმედება შესრულდა, თუ tool არ გაეშვა;
- task და equipment schedule ერთმანეთში არ უნდა აურიოს;
- branch typo-ები უნდა დამუშავდეს fuzzy resolver-ით;
- user permissions უნდა იყოს დაცული.

ეს prompt არის ერთ-ერთი ყველაზე მნიშვნელოვანი ადგილი AI-ის ხარისხისთვის. მისი დახვეწა პირდაპირ გავლენას ახდენს ბრძანებების სწორად გაგებაზე.

---

## 7. Provider-ები და მოდელები

AI provider-ს მართავს `AiProviderManager`.

მხარდაჭერილია:

- OpenAI;
- Claude;
- Gemini;
- DeepSeek.

settings-ში ინახება:

- `ai_enabled`
- `ai_provider`
- `ai_api_key`
- `ai_model`
- `ai_temperature`
- `ai_max_tokens`

Provider ირჩევა `ai_provider` setting-ით. მოდელი ირჩევა `ai_model` setting-ით. API key ინახება settings-ში და UI-ში ნიღბით ჩანს.

OpenAI-compatible provider აგზავნის request-ს:

```text
POST {base_url}/chat/completions
```

payload შეიცავს:

- `model`
- `messages`
- `temperature`
- `max_tokens`
- `tools`
- `tool_choice`

თუ tools არსებობს, default `tool_choice` არის `auto`. საჭიროებისას სისტემა retry-ს აკეთებს `tool_choice = required` რეჟიმში.

---

## 8. Tool Registry

`ToolRegistry` არის ყველა ხელმისაწვდომი CRM action-ის სია.

ის აკეთებს სამ მთავარ რამეს:

1. არეგისტრირებს tool classes.
2. მალავს forbidden modules-ს.
3. user-ს აძლევს მხოლოდ იმ tool definitions-ს, რაზეც permission აქვს.

აკრძალული მოდულებია:

- company;
- plan;
- role;
- permission;
- billing;
- coupon;
- referral;
- webhook;
- email_template;
- deploy;
- settings.

ეს ნიშნავს, რომ AI ასისტენტს CRM-ის კრიტიკული სისტემური/ბილინგის/როლების მართვა არ უნდა შეეძლოს.

---

## 9. Tool-ის სტრუქტურა

ყველა tool იცავს `AiToolInterface` კონტრაქტს:

- `name()` — tool-ის უნიკალური სახელი.
- `description()` — რას აკეთებს.
- `module()` — რომელ CRM მოდულს ეკუთვნის.
- `isWrite()` — ცვლის თუ არა მონაცემებს.
- `requiredPermissions()` — საჭირო permissions.
- `parameters()` — JSON schema LLM-ისთვის.
- `requiredFields()` — აუცილებელი ველები.
- `execute()` — რეალური შესრულება.
- `userCanUse()` — შეუძლია თუ არა user-ს ამ tool-ის გამოყენება.
- `definition()` — LLM tool schema.

`AbstractAiTool` ამატებს:

- required fields validation;
- permission check;
- view permission helper;
- permission denied message.

---

## 10. რას შეუძლია AI ასისტენტს

ამჟამად AI ასისტენტს შეუძლია იმუშაოს შემდეგ მოდულებზე.

### Tasks

- დავალების შექმნა;
- დავალების ძებნა;
- დავალების განახლება;
- შემსრულებლის მიბმა;
- სტატუსის შეცვლა;
- პრიორიტეტის შეცვლა;
- stage-ში გადატანა;
- კომენტარის დამატება;
- checklist item-ის დამატება;
- task report.

### Projects

- პროექტის/ფილიალის შექმნა;
- პროექტის ძებნა;
- პროექტის განახლება;
- member-ის მიბმა;
- milestone-ის დამატება;
- project report.

### Equipment

- ტექნიკის ძებნა;
- ტექნიკის შექმნა;
- ტექნიკის განახლება;
- სტატუსის შეცვლა;
- ტექნიკის ტიპების ძებნა/შექმნა/განახლება;
- სერვისის ტიპების ძებნა/შექმნა/განახლება;
- სერვისის ჩანაწერის შექმნა;
- recurring service schedule-ის შექმნა/განახლება;
- bulk schedule update;
- bulk equipment update;
- equipment report.

### Fleet

- მანქანის ძებნა;
- მანქანის შექმნა;
- მანქანის განახლება;
- გარბენის განახლება;
- საწვავის ხარჯის დამატება;
- სერვისის ჩანაწერის დამატება;
- fleet report.

### CRM Contacts

- კონტაქტის ძებნა;
- კონტაქტის შექმნა;
- კონტაქტის განახლება.

### Notes

- ჩანაწერის ძებნა;
- ჩანაწერის შექმნა;
- ჩანაწერის განახლება.

### Contracts

- ხელშეკრულების ძებნა;
- ხელშეკრულების შექმნა;
- ხელშეკრულების განახლება.

### Reports

- task report;
- project report;
- equipment report;
- fleet report.

### Docs

- CRM-ის სახელმძღვანელოში ძებნა `search_crm_docs` tool-ით.

---

## 11. ბრძანების დამუშავების დეტალური ნაკადი

### მაგალითი: "იპოვე ქუთაისის ფილიალის დავალება"

1. User message ინახება `ai_messages` ცხრილში.
2. სისტემა ხედავს, რომ ეს არის read/search intent.
3. `TaskSearchIntentParser` ცდილობს ტექსტიდან ამოიღოს:
   - query;
   - project_title;
   - limit.
4. იძახება `search_task`.
5. `AiToolExecutor::searchTask()` ეძებს task-ებს current workspace-ში.
6. თუ მითითებულია project_title, `ProjectBranchResolver` ეხმარება ფილიალის fuzzy match-ში.
7. შედეგი ბრუნდება `AiToolResult`-ით.
8. LLM იღებს tool result-ს და აკეთებს ბუნებრივ შეჯამებას.
9. assistant response ინახება conversation-ში.

### მაგალითი: "ქუთაისის ფილიალს დაუმატე დავალება კონდიციონერების წმენდა"

1. User message ინახება.
2. სისტემა ხედავს create/write intent-ს.
3. `TaskCreateIntentParser` ცდილობს deterministic parse-ს.
4. იქმნება step:
   - tool: `create_task`;
   - params: `title`, `project_title`, priority და სხვა.
5. `ActionPlanner` ქმნის confirmation plan-ს.
6. conversation status ხდება `awaiting_confirmation`.
7. user ხედავს confirm/cancel card-ს.
8. დადასტურების შემდეგ `ExecutionEngine` ასრულებს `create_task`.
9. `AiToolExecutor::createTask()` პოულობს ან ქმნის პროექტს.
10. `TaskService` ქმნის task-ს.
11. შედეგი იწერება `ai_action_logs`-ში.
12. assistant აბრუნებს შესრულების summary-ს.

### მაგალითი: "რუსთავის ფილიალში სამივე კონდიციონერს დაუმატე წმენდა 2026.05.23"

1. ტექსტი აღიქმება equipment schedule write intent-ად.
2. `EquipmentScheduleIntentParser` ცდილობს ფილიალის, ტექნიკის ტიპის, სერვისის ტიპის და თარიღის ამოღებას.
3. სისტემა პოულობს ფილიალს `ProjectBranchResolver`-ით.
4. პოულობს ტექნიკას `search_equipment` ლოგიკით.
5. ქმნის `bulk_upsert_equipment_schedule` plan-ს.
6. user ადასტურებს.
7. `AiToolExecutor::bulkUpsertEquipmentSchedule()` ქმნის ან აახლებს schedule-ებს.

---

## 12. Confirmation სისტემა

Write action-ის execution-ს იცავს confirmation layer.

Conversation შეიძლება იყოს:

- `active`
- `awaiting_confirmation`

თუ conversation არის `awaiting_confirmation` და აქვს `pending_plan`, შემდეგი user message მოწმდება:

Confirm ტექსტები:

- `დიახ`
- `კი`
- `დაადასტურე`
- `შესრულდეს`
- `განაახლე`
- `შესრულე`
- `ok`
- `yes`
- `confirm`
- `proceed`
- `go ahead`
- `execute`

Cancel ტექსტები:

- `არა`
- `გაუქმ`
- `cancel`
- `no`
- `stop`
- `abort`

ასევე frontend-ში არსებობს ცალკე Confirm/Cancel ღილაკები, რომლებიც იძახებენ:

- `POST /api/ai-ops/confirm`
- `POST /api/ai-ops/cancel`

---

## 13. Execution და Audit

დადასტურებული plan სრულდება `ExecutionEngine::executePlan()` მეთოდით.

Execution:

1. კითხულობს `pending_plan.steps`.
2. თითოეული step-ისთვის პოულობს tool-ს registry-ში.
3. იძახებს `tool->execute($params, $ctx)`.
4. აგროვებს შედეგებს.
5. ქმნის summary-ს.
6. იწერს audit log-ს.
7. conversation status ბრუნდება `active`-ზე.
8. `pending_plan` იშლება.

Audit log ინახავს:

- user id;
- workspace id;
- conversation id;
- original prompt;
- generated plan;
- executed actions;
- result;
- action type;
- module.

Activity გვერდი აჩვენებს audit ჩანაწერებს და იძლევა ფილტრაციას:

- user;
- module;
- action type;
- date from;
- date to.

---

## 14. უსაფრთხოება და იზოლაცია

AI ასისტენტში უსაფრთხოების ძირითადი პრინციპებია:

### Workspace isolation

ყველა conversation და action მიბმულია `workspace_id`-ზე. Controller conversation-ს პოულობს მხოლოდ:

```text
user_id = current user
workspace_id = current workspace
```

`AiContextService::ensureWorkspaceAccess()` დამატებით ამოწმებს workspace context-ს.

### Permission-based tools

Tool-ები user-ს მიეწოდება მხოლოდ მაშინ, თუ აქვს შესაბამისი permission. მაგალითად, თუ user-ს არ აქვს equipment update უფლება, update equipment tool LLM-ს საერთოდ არ მიეწოდება.

### Forbidden modules

ToolRegistry არ ატარებს აკრძალულ სისტემურ მოდულებს:

- settings;
- billing;
- roles;
- permissions;
- deploy;
- webhooks;
- email templates.

### Write confirmation

Create/update/write მოქმედება ჯერ plan-ად იქცევა და არ სრულდება user confirmation-ის გარეშე.

### Hallucination guard

ასისტენტს ეკრძალება წარმატების გამოცხადება, თუ tool რეალურად არ გაეშვა. თუ LLM დააბრუნებს ისეთ ტექსტს, რომელიც ჰგავს ცრუ შესრულებას, სისტემა ცვლის პასუხს უსაფრთხო ტექსტით.

---

## 15. Hallucination Guard

AI სისტემის მნიშვნელოვანი რისკია, რომ LLM-მა თქვას "შევასრულე", მაგრამ რეალურად tool არ გაეშვას.

ამის საწინააღმდეგოდ სისტემაში არის რამდენიმე დაცვა:

- write intent-ზე forced tool call retry;
- deterministic parser fallback;
- `AiHallucinationGuard::looksFabricated()`;
- `sanitizeAssistantContent()`;
- read result synthesis-ში მკაცრი ინსტრუქცია: "ONLY the tool results above";
- assistant-ს ეკრძალება fields-ის გამოგონება, მაგალითად `service_schedule` JSON.

თუ მოქმედება ვერ შესრულდა, ასისტენტმა უნდა თქვას, რომ ვერ გაუშვა required tool და არ უნდა მოახდინოს წარმატების სიმულაცია.

---

## 16. Deterministic parser-ები

LLM ყოველთვის იდეალურად ვერ ირჩევს tool-ს, ამიტომ სისტემას აქვს parser-ები, რომლებიც კონკრეტულ ქართულ/CRM ფორმატებს პირდაპირ ამუშავებს.

მთავარი parser-ები:

- `TaskCreateIntentParser`
- `TaskSearchIntentParser`
- `EquipmentScheduleIntentParser`
- `EquipmentCreateIntentParser`

ისინი ეხმარებიან ისეთ ბრძანებებში, სადაც ქართულ ტექსტში ჩანს მკაფიო intent:

- დავალების შექმნა;
- დავალების ძებნა;
- ფილიალის მიხედვით ტექნიკის schedule;
- ტექნიკის შექმნა;
- თარიღების ამოცნობა;
- ფილიალის/ქალაქის ამოცნობა.

ეს არის ძალიან მნიშვნელოვანი ფენა ქართული ენისთვის და CRM-specific ბრძანებებისთვის.

---

## 17. ფილიალები და fuzzy resolve

ფილიალების ამოცნობა ხდება `ProjectBranchResolver` და `BranchIntentHelper` ლოგიკით.

სისტემამ უნდა შეძლოს:

- "ქუთაისში" → "ქუთაისის ფილიალი";
- typo-ების ამოცნობა;
- მსგავსი პროექტების ძებნა;
- არსებული ფილიალის გამოყენება;
- duplicate branch-ის არშექმნა typo-ს გამო.

ახალი ფილიალი იქმნება მხოლოდ მაშინ, თუ მსგავსი არსებული ფილიალი ვერ მოიძებნა.

---

## 18. CRM manual-ის გამოყენება

თუ user სვამს კითხვას:

- როგორ გავაკეთო რამე;
- სად არის ფუნქცია;
- რა ნიშნავს კონკრეტული პროცესი;
- როგორ მუშაობს UI;
- რა permission სჭირდება მოქმედებას;

AI-მ ჯერ უნდა გამოიყენოს `search_crm_docs` tool.

Manual data მოდის:

- `docs/CRM_სრული_სახელმძღვანელო.md`
- `CrmDocsSearchService`
- `Tools/Docs/SearchCrmDocsTool`

Live CRM data-სთვის manual არ გამოიყენება. მაგალითად, "რამდენი დავალებაა" უნდა წავიდეს `search_*` ან `generate_*` tool-ზე.

---

## 19. Frontend მუშაობა

AI Assistant გვერდი შედგება ორი ძირითადი ნაწილისგან:

- conversation list;
- active chat window.

`ChatWindow` აკეთებს:

- conversation creation;
- message sending;
- SSE stream reading;
- assistant chunk rendering;
- pending plan state;
- confirm/cancel request;
- conversation delete;
- disabled state, თუ AI არ არის configured.

Chat message იგზავნება streaming რეჟიმში:

```json
{
  "conversation_id": 1,
  "message": "ტექსტი",
  "stream": true
}
```

Backend აბრუნებს SSE events:

```text
data: {"type":"chunk","content":"..."}

data: {"type":"done","response":{...}}
```

თუ response type არის `plan`, frontend აჩვენებს `ActionPlanCard`-ს.

---

## 20. Response ტიპები

`AiChatResponse` ძირითადად აბრუნებს შემდეგ ტიპებს:

- `message` — ჩვეულებრივი პასუხი.
- `question` — აკლია ინფორმაცია და user-ს ეკითხება.
- `plan` — write action plan, confirmation საჭიროა.
- `result` — execution-ის შედეგი.

Message metadata-ში ინახება:

- response type;
- plan;
- results;
- execution details.

---

## 21. მონაცემთა ბაზის ცხრილები

### ai_conversations

ინახავს conversation-ს:

- `user_id`
- `workspace_id`
- `title`
- `status`
- `channel`
- `pending_plan`
- timestamps

### ai_messages

ინახავს conversation-ის message history-ს:

- `conversation_id`
- `role`
- `content`
- `metadata`
- timestamps

Role შეიძლება იყოს:

- user;
- assistant;
- system.

### ai_action_logs

ინახავს შესრულებული AI მოქმედებების audit-ს:

- `user_id`
- `workspace_id`
- `conversation_id`
- `original_prompt`
- `generated_plan`
- `executed_actions`
- `result`
- `action_type`
- `module`
- timestamps

---

## 22. Settings და ჩართვა

AI Assistant მუშაობისთვის საჭიროა:

- AI module enabled;
- valid API key;
- provider;
- model;
- user permission.

Settings ინახება `settings/ai-ops` endpoint-ით.

Validation:

- `ai_enabled` — `0/1/true/false`;
- `ai_provider` — `openai`, `claude`, `gemini`, `deepseek`;
- `ai_api_key` — nullable string;
- `ai_model` — required string;
- `ai_temperature` — 0-დან 2-მდე;
- `ai_max_tokens` — 256-დან 32000-მდე.

თუ AI არ არის configured, chat input disabled არის და user ხედავს შეტყობინებას Settings-ზე.

---

## 23. Permissions

AI მოდულს აქვს საკუთარი permissions:

- `ai_ops_view`
- `ai_ops_chat`
- `ai_ops_activity_view`
- `settings_ai_ops`

Tool permissions მოდის კონკრეტული CRM მოდულებიდან:

- tasks permissions;
- project permissions;
- equipment permissions;
- fleet permissions;
- note permissions;
- contract permissions;
- crm_contact permissions;
- report permissions.

ToolRegistry user-ს აწვდის მხოლოდ permitted tools-ს. ეს მნიშვნელოვანია, რადგან LLM ვერ გამოიძახებს იმას, რაც schema-ში არ მიუღია.

---

## 24. სად არის ბიზნეს-ლოგიკა

AI ასისტენტი თვითონ არ უნდა იმეორებდეს მთელ CRM ბიზნეს-ლოგიკას. სადაც შესაძლებელია, ის იყენებს არსებულ services-ს:

- `TaskService`
- `ProjectService`
- `CrmContactService`
- `FleetMileageService`

ეს სწორი მიდგომაა, რადგან AI-ით შექმნილი მონაცემი იგივე წესებს გადის, რასაც ჩვეულებრივი UI-დან შექმნილი მონაცემი.

---

## 25. რა არ შეუძლია ან არ უნდა შეეძლოს

AI ასისტენტს არ უნდა შეეძლოს:

- role/permission მართვა;
- billing/plan მართვა;
- settings-ის შეცვლა tool-ებით;
- deployment;
- webhook/email template მართვა;
- workspace-ის საზღვრებს გარეთ მონაცემების ნახვა;
- delete მოქმედებები კრიტიკულ მოდულებში, თუ ცალკე უსაფრთხო დიზაინი არ დაემატა;
- write action-ის შესრულება confirmation-ის გარეშე;
- წარმატების გამოცხადება tool execution-ის გარეშე.

---

## 26. ცნობილი სუსტი ადგილები

სრული დახვეწისას უნდა მიექცეს ყურადღება:

- ქართული ენის intent parsing-ს;
- typo/fuzzy matching-ს;
- task vs equipment schedule intent-ის გარჩევას;
- provider-ებს შორის tool calling განსხვავებებს;
- streaming + tools ერთად მუშაობის შეზღუდვებს;
- user feedback-ს, როდესაც permission არ ყოფნის;
- plan message-ის ქართულად და უფრო გასაგებად ფორმირებას;
- audit log-ის დეტალიზაციას;
- read result synthesis-ის სიზუსტეს;
- bulk actions-ის safety-ს;
- date parsing-ს სხვადასხვა ფორმატში;
- duplicate record prevention-ს.

---

## 27. როგორ უნდა დაემატოს ახალი AI tool

ახალი tool-ის დასამატებლად:

1. შექმენი class `app/Services/AiOps/Tools/{Module}/{ToolName}.php`.
2. გააფართოვე `AbstractAiTool`.
3. დააბრუნე:
   - name;
   - description;
   - module;
   - isWrite;
   - requiredPermissions;
   - parameters;
   - execute.
4. საჭიროებისას დაამატე მეთოდი `AiToolExecutor`-ში.
5. დაარეგისტრირე class `ToolRegistry`-ში.
6. თუ write tool არის, დარწმუნდი, რომ required fields სწორია.
7. თუ ქართული ბრძანება ხშირად მეორდება, დაამატე deterministic parser.
8. დაამატე ტესტი read/write behavior-ზე.
9. განაახლე system prompt, თუ LLM-ს ახალი ინსტრუქცია სჭირდება.

---

## 28. დახვეწის რეკომენდებული მიმართულებები

### 1. Tool contract-ის გამკაცრება

ყველა tool-ს უნდა ჰქონდეს მკაფიო schema, required fields, permission და predictable result.

### 2. Parser coverage-ის გაზრდა

ქართული CRM ბრძანებებისთვის deterministic parser-ები განსაკუთრებით ეფექტურია. რაც ხშირია ბიზნესში, ის არ უნდა იყოს მხოლოდ LLM-ზე დამოკიდებული.

### 3. Better planner

Plan ტექსტი უნდა იყოს ქართულად, მოკლე, გასაგები და რისკის მიხედვით განსხვავებული. Bulk მოქმედებებზე უნდა ჩანდეს რაოდენობა და affected records.

### 4. Safer execution

Bulk updates-ზე სასურველია:

- count preview;
- affected record list;
- max limit;
- partial failure reporting;
- rollback strategy, თუ საჭირო გახდა.

### 5. Testing

საჭიროა ტესტები:

- provider mock;
- tool registry permissions;
- write plan without execution;
- confirmation execution;
- cancellation;
- hallucination guard;
- Georgian parser cases;
- workspace isolation;
- audit log.

### 6. Observability

Activity გვერდს შეიძლება დაემატოს:

- full plan viewer;
- tool params viewer;
- execution result JSON;
- error details;
- provider/model info;
- duration;
- token usage, თუ provider აბრუნებს.

### 7. UX გაუმჯობესება

ChatWindow-ში შეიძლება დაემატოს:

- multiline input;
- suggested prompts;
- plan diff/preview;
- tool result cards;
- retry failed action;
- regenerate answer read-only პასუხებზე;
- conversation rename.

---

## 29. ყველაზე მნიშვნელოვანი წესები მომავალში

AI ასისტენტის დახვეწისას ეს წესები არ უნდა დაირღვეს:

1. CRM data-ზე მოქმედება მხოლოდ tool-ებით.
2. Write action ყოველთვის confirmation-ით.
3. User permissions ყოველთვის დაცული.
4. Workspace isolation ყოველთვის დაცული.
5. LLM არ უნდა იყოს ერთადერთი წყარო კრიტიკული მოქმედებისთვის.
6. Manual გამოიყენება how-to კითხვებზე, live data-სთვის tools.
7. Existing services გამოიყენე ბიზნეს-ლოგიკისთვის.
8. Audit log უნდა იწერებოდეს ყველა შესრულებულ write action-ზე.
9. Parser-ები უნდა დაემატოს ხშირ ქართულ ბრძანებებზე.
10. არ დაუშვა duplicate ფილიალები typo-ების გამო.

---

## 30. სწრაფი არქიტექტურული რუკა

```text
User
  ↓
resources/js/components/ai-ops/ChatWindow.tsx
  ↓
POST /api/ai-ops/chat
  ↓
AiOpsController
  ↓
ConversationEngine
  ├─ AiContextService
  ├─ AiProviderManager
  ├─ ToolRegistry
  ├─ IntentDetectionEngine
  ├─ ActionPlanner
  ├─ ConfirmationEngine
  └─ ExecutionEngine
       └─ AiToolExecutor
            └─ CRM Services / Models
  ↓
ai_messages / ai_action_logs
  ↓
SSE response / JSON response
  ↓
Chat UI
```

---

## 31. დასკვნა

AI ასისტენტი ამ პროექტში არის permission-aware CRM automation layer. მისი მთავარი ღირებულებაა ის, რომ მომხმარებელი ბუნებრივი ენით აკეთებს CRM ოპერაციებს, მაგრამ სისტემა მაინც იცავს workspace-ს, permissions-ს, confirmation-ს და audit trail-ს.

სრული დახვეწისას მთავარი აქცენტი უნდა გაკეთდეს არა მხოლოდ უკეთეს prompt-ზე, არამედ tool schema-ზე, deterministic parser-ებზე, execution safety-ზე, ტესტებზე და audit/observability-ზე. კარგი AI ასისტენტი ამ სისტემაში ნიშნავს: ნაკლები ჰალუცინაცია, მეტი ზუსტი tool execution, მკაფიო plan, დაცული მონაცემები და მარტივი UX.
