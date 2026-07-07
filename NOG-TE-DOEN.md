# Nog te doen — afronden migratie naar GitHub Pages

De site draait al live op **https://jeroenwijnholds.github.io/desingel/** en elke push naar `master` wordt automatisch gedeployed. Er zijn nog drie dingen die alleen jij kunt doen, omdat er accounts en inloggegevens bij nodig zijn. Reken op zo'n 10–15 minuten totaal.

Volgorde aanhouden: eerst het formulier (stap 1), dan de Sanity-koppeling (stap 2), pas daarna Netlify opruimen (stap 3). Zo is er nooit een moment waarop iets kapot is.

---

## Stap 1 — Web3Forms activeren (contactformulier)

**Waarom:** het contactformulier post nu naar Web3Forms, maar met een placeholder-sleutel (`PLACEHOLDER_KEY`). Inzendingen komen pas aan als de echte sleutel is ingesteld én de site opnieuw is gebouwd.

1. Ga naar **https://web3forms.com**.
2. Vul bij "Create your Access Key" het e-mailadres in waar de formulierberichten moeten binnenkomen (het adres van Victor & Mari, of jouw eigen adres als jij ze doorstuurt). Er is geen account of wachtwoord nodig.
3. Klik op **Create Access Key**. De sleutel (een reeks letters/cijfers met streepjes, lijkt op een UUID) wordt naar dat e-mailadres gemaild. Deze sleutel is niet geheim — hij staat straks zichtbaar in de HTML van de site; dat is bij Web3Forms de bedoeling.
4. Zet de sleutel in de GitHub-repository-variabele. Open een terminal in de projectmap en voer uit:

   ```bash
   gh variable set WEB3FORMS_ACCESS_KEY --repo jeroenwijnholds/desingel --body "PLAK-HIER-DE-KEY"
   ```

   Geen `gh` bij de hand? Het kan ook via de browser: GitHub → repo `desingel` → **Settings → Secrets and variables → Actions → tabblad Variables** → `WEB3FORMS_ACCESS_KEY` → **Edit** → waarde vervangen.

5. Zet dezelfde sleutel ook in het lokale `.env`-bestand (vervang daar de regel `NUXT_PUBLIC_WEB3FORMS_KEY=PLACEHOLDER_KEY`), zodat een lokale build hetzelfde werkt als de live site.
6. Bouw de site één keer opnieuw, zodat de echte sleutel in de HTML wordt gebakken:

   ```bash
   gh workflow run deploy.yml --repo jeroenwijnholds/desingel
   ```

   (Of via de browser: repo → **Actions → Deploy naar GitHub Pages → Run workflow**.)

7. **Controleren:** wacht tot de workflow groen is (~2 min), open https://jeroenwijnholds.github.io/desingel/contact/, vul het formulier in en verstuur. Je moet worden doorgestuurd naar de "Bedankt voor je bericht!"-pagina en binnen een minuut hoort de e-mail binnen te zijn (check ook de spam-map bij de eerste keer).

> **Let op:** het gratis Web3Forms-plan heeft een limiet van 250 inzendingen per maand — ruim voldoende voor dit formulier.

---

## Stap 2 — Sanity-webhook omzetten (publish → automatische rebuild)

**Waarom:** nu wijst de webhook in Sanity nog naar de oude Netlify build hook. Zolang die niet is omgezet, verschijnen wijzigingen uit Sanity Studio niet vanzelf op de nieuwe site.

### 2a. GitHub-token aanmaken

De webhook moet bij GitHub kunnen "aankloppen" en daar is een persoonlijk toegangstoken voor nodig.

1. Ga naar GitHub → klik rechtsboven op je avatar → **Settings** → helemaal onderin **Developer settings** → **Personal access tokens → Fine-grained tokens** → **Generate new token**.
2. Vul in:
   - **Token name:** iets herkenbaars, bijv. `sanity-webhook-desingel`
   - **Expiration:** 1 jaar (zet een agendaherinnering om hem tegen die tijd te vernieuwen — als het token verloopt, stoppen de automatische rebuilds stilletjes)
   - **Repository access:** *Only select repositories* → kies `jeroenwijnholds/desingel`
   - **Permissions → Repository permissions → Contents:** *Read and write* (dit is nodig voor het "dispatch"-signaal; verder niets aanvinken)
3. Klik **Generate token** en **kopieer het token meteen** — het wordt maar één keer getoond. Dit token is wél geheim: nergens in code of documenten plakken.

### 2b. Webhook in Sanity aanpassen

1. Ga naar **https://sanity.io/manage**, open het project van de site, en ga naar **API → Webhooks**.
2. Open de bestaande webhook die naar Netlify wijst (URL bevat `netlify.com`) en pas hem aan — of maak een nieuwe aan en verwijder de oude. Instellingen:
   - **URL:** `https://api.github.com/repos/jeroenwijnholds/desingel/dispatches`
   - **HTTP method:** `POST`
   - **HTTP headers** (twee stuks):
     - `Authorization` → `Bearer PLAK-HIER-HET-TOKEN` (dus het woord "Bearer", een spatie, en dan het token uit stap 2a)
     - `Accept` → `application/vnd.github+json`
   - **Trigger on:** Create, Update én Delete aanvinken
   - **Filter:** `_type in ["event", "nieuwsArtikel", "siteSettings", "homePage", "boerderijPage", "overOnsPage", "contactPage"]`
   - **Projection:** `{"event_type": "sanity-publish"}`
   - **Drafts:** uitgeschakeld laten (alleen gepubliceerde documenten moeten een rebuild triggeren)
3. Opslaan.

### 2c. Controleren

1. Open Sanity Studio, pas iets kleins aan (bijv. een tekstveld in een nieuwsartikel), klik **Publish**.
2. Ga naar GitHub → repo → **Actions**. Binnen ~30 seconden hoort daar een nieuwe run "Deploy naar GitHub Pages" te verschijnen met als aanleiding *repository_dispatch*.
3. Als de run groen is (~2 min), controleer of de wijziging op de live site staat. Draai de proefwijziging in Studio daarna eventueel terug (en publiceer opnieuw).
4. Werkt het niet? In Sanity Manage → Webhooks kun je per webhook de **delivery log** bekijken: een rode delivery met status `401` betekent een fout token, `404` betekent een typefout in de URL.

---

## Stap 3 — Netlify opruimen

**Pas doen als stap 1 en 2 aantoonbaar werken.**

1. Log in op **https://app.netlify.com** en open de site van de boerderij.
2. Verwijder eerst de oude build hook: **Site configuration → Build & deploy → Build hooks** → verwijder de hook die door Sanity werd aangeroepen.
3. Verwijder daarna de site zelf: **Site configuration → General → Danger zone → Delete site**. (Wil je hem liever bewaren als noodrem, zet dan minimaal **Build & deploy → Stop builds** aan — dan verbruikt hij geen credits meer.)
4. **Controleren:** publiceer nog één keer iets in Sanity en bevestig dat er alléén een GitHub Actions-run start en er níéts meer gebeurt op Netlify.

---

## Optioneel — eigen domeinnaam koppelen

Als de site een eigen domein heeft (of krijgt) dat nu nog naar Netlify wijst:

1. GitHub → repo → **Settings → Pages → Custom domain** → vul het domein in en sla op.
2. Pas bij je domeinregistrar de DNS aan: een **CNAME**-record van bijv. `www` naar `jeroenwijnholds.github.io`. Voor een kaal domein (zonder `www`) gebruik je vier **A**-records naar `185.199.108.153`, `185.199.109.153`, `185.199.110.153` en `185.199.111.153`.
3. Wacht tot GitHub het certificaat heeft aangemaakt (kan tot een uur duren) en vink **Enforce HTTPS** aan.
4. Draai daarna één keer de deploy-workflow opnieuw (**Actions → Deploy naar GitHub Pages → Run workflow**). De workflow detecteert het domein automatisch en bouwt de site dan zonder het `/desingel/`-padvoorvoegsel — daar hoeft niets voor aangepast te worden in de code.

---

## Samenvatting

| # | Actie | Waar | Klaar wanneer |
|---|-------|------|---------------|
| 1 | Web3Forms-key aanmaken, variabele zetten, workflow draaien | web3forms.com + GitHub | Testinzending komt aan per e-mail |
| 2 | GitHub-token maken en Sanity-webhook omzetten | GitHub + sanity.io/manage | Publish in Studio start automatisch een deploy |
| 3 | Netlify build hook + site verwijderen | app.netlify.com | Publish triggert alléén nog GitHub |
| — | (Optioneel) eigen domein koppelen | GitHub Pages + DNS | Site bereikbaar op eigen domein met HTTPS |
