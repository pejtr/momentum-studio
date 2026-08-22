# OMNIMATRIX — Atomic Test Report

**Datum:** 22. srpna 2026  
**Rozsah:** statická kontrola, unit/integration testy, produkční build, runtime API smoke test a vizuální ověření dashboardu a HERMES.

## Shrnutí

Základní funkční kontrakty aplikace prošly. TypeScript kontrola je bez chyb, produkční build byl dokončen po zastavení vývojového watcheru a Vitest sada obsahující 76 testů prošla celá. Během testu byl odhalen a opraven bezpečnostní problém v HERMES SSE: nyní vyžaduje autentizovaného uživatele a při načítání historie filtruje zprávy podle vlastníka.

Systém proto není označen jako „plně produkčně hotový“. Klíčové technické toky jsou funkční, ale zbývají UX, konzistence designu a test-isolation úkoly uvedené níže.

| Oblast | Výsledek | Poznámka |
|---|---:|---|
| TypeScript | PASS | `pnpm check` skončil s exit code 0. |
| Unit/integration testy | PASS | `pnpm test`: 7 souborů, 76 testů prošlo. |
| Marketplace integrační tok | PASS | Opraven nestabilní test: nový záznam se ověřuje přes řazení `recent`, ne přes výchozí pořadí podle stažení. |
| Produkční build | PASS | `pnpm build` dokončen; při souběžném běhu watcheru byl jednou ukončen kvůli limitu zdrojů. |
| Veřejný frontend endpoint | PASS | `/` odpověděl HTTP 200. |
| Autentizační kontrakt | PASS | `auth.me` v anonymním režimu vrací HTTP 200 s `null`; chráněný dashboard vrací HTTP 401. |
| Systémové metriky | PASS | `metrics.system` vrátil HTTP 200 a CPU/memory data. |
| HERMES SSE ochrana | PASS | Neautorizovaný požadavek se správným vstupem vrací HTTP 401. |
| Vizuální smoke test | PASS s nálezy | Dashboard a HERMES se vykreslují; onboarding překrývá pracovní plochu a HERMES zatím nepoužívá LCARS vzhled. |

## Oprava provedená během testování

Endpoint `POST /api/hermes/stream` dříve toleroval anonymní požadavky a historii vybíral pouze podle `sessionId`. To mohlo umožnit, aby neautorizovaný požadavek zapisoval do společné identity a aby odhadnutelné ID session načítalo cizí kontext. Endpoint nyní vyžaduje platnou autentizaci, ukládá pouze pod ID přihlášeného uživatele a historii filtruje dvojicí `sessionId` + `userId`.

## Zbývající limity před produkčním označením

Vizuální test ukazuje, že onboarding je stále anglický a překrývá první pracovní obrazovku. HERMES stále používá starší zelený terminálový motiv namísto nového LCARS Neon Glow systému. Testy navíc zapisují do připojené databáze, což zanechává testovací záznamy; před nasazením je nutná samostatná testovací databáze nebo bezpečný cleanup.

V preview se také objevuje neblokující HTTP 400 odpověď z analytics endpointu `Website not found`. Aplikace samotná se vykresluje a základní API fungují, ale tracking konfigurace má být opravena nebo pro preview vypnuta.

## Doporučené pořadí pokračování

1. Sjednotit HERMES a AI nástroje do LCARS Neon Glow tématu.
2. Dokončit český onboarding s viditelným „Přeskočit vše“.
3. Zavést izolovanou testovací databázi a cleanup pro integrační testy.
4. Opravit preview analytics konfiguraci.
