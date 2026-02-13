# GitHub-ზე ატვირთვა და Auto-Deploy

## 1. GitHub-ზე ატვირთვა

GitHub-ზე შექმენი ახალი repository (მაგ: `crm-inexia`), შემდეგ:

```bash
cd /www/wwwroot/crm.inexia.cc
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main   # optional - თუ main გინდა master-ის ნაცვლად
git push -u origin main
```

თუ `master` დატოვებ: `git push -u origin master`

## 2. Auto-Deploy (GitHub Actions)

ყოველი push-ისას `main` ან `master` branch-ზე ავტომატურად გაეშვება deploy.

**საჭიროა GitHub Secrets** (Repo → Settings → Secrets and variables → Actions):

| Secret | აღწერა |
|--------|--------|
| `DEPLOY_HOST` | სერვერის IP ან hostname |
| `DEPLOY_USER` | SSH მომხმარებელი (მაგ: root) |
| `DEPLOY_SSH_KEY` | SSH private key (სერვერზე წვდომისთვის) |

**SSH key-ის შექმნა:**
```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""
```
პუბლიკური (`github_deploy.pub`) დაამატე სერვერის `~/.ssh/authorized_keys`-ში. პრივატული (`github_deploy`) — GitHub Secret `DEPLOY_SSH_KEY`-ში.

## 3. ხელით Deploy

```bash
./scripts/deploy.sh
```
