# Final submission checklist

- [ ] GitHub repository link (push this folder; commit in small steps with clear messages, see GIT_COMMANDS below)
- [ ] Database dump: `database/payments_dump.sql`
- [ ] Postman collection: `postman/Credit_Card_Payment_System.postman_collection.json`
- [ ] UI screenshots: `docs/screenshots/` (see SCREENSHOTS_GUIDE.md)
- [ ] Admin credentials: username `admin`, password `Admin@12345`

## GIT_COMMANDS

```bash
git init
git branch -M main
git add django_service/config django_service/accounts django_service/manage.py django_service/requirements.txt
git commit -m "feat(auth): user registration, JWT login/logout and protected routes"
git add django_service/cards
git commit -m "feat(cards): add, list and delete cards storing only masked number and last4"
git add fastapi_service
git commit -m "feat(payments): FastAPI payment service with simulated PENDING to SUCCESS/FAILED flow"
git add django_service/transactions django_service/adminpanel
git commit -m "feat(transactions): history filters, admin panel, daily summary and CSV export"
git add frontend
git commit -m "feat(frontend): React + Tailwind pages for users and admin"
git add database docker-compose.yml .env.example django_service/Dockerfile django_service/entrypoint.sh django_service/.dockerignore
git commit -m "chore(docker): Dockerfiles and docker-compose for the full stack"
git add postman docs README.md .gitignore
git commit -m "docs: README, Postman collection, DB dump and screenshots guide"
git add -A && git commit -m "chore: remaining files" || true
git remote add origin <your-repo-url>
git push -u origin main
```
