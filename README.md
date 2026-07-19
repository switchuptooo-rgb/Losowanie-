# ⚽ Kapitan

Aplikacja do losowania zbalansowanych drużyn na amatorskie mecze piłki nożnej.
Działa jako **PWA** — instaluje się na telefonie z ekranu głównego i działa offline.

## Co potrafi

- Wklejanie listy graczy (np. skopiowanej z grupy WhatsApp)
- Zaznaczanie obecności na dziś + dodawanie gości (i przypisywanie ich na stałe)
- Oceny gwiazdkowe w kategoriach: strzały, podania, bieganie, obrona + oznaczenie bramkarza
- Zasady par: „zawsze razem" i „nie razem"
- Losowanie 2 drużyn — wg umiejętności (zbalansowane, ale za każdym razem inne) albo całkiem losowo
- Zapis wyników z blokadą przed podwójnym zapisem + korekta
- Statystyki i sugestie podniesienia/obniżenia ocen po serii zwycięstw/porażek
- Eksport listy graczy i gotowych składów na WhatsApp
- Wszystkie dane zapisują się lokalnie w telefonie (localStorage)

## Uruchomienie lokalne

Potrzebujesz zainstalowanego **Node.js** (wersja 18 lub nowsza) — https://nodejs.org

```bash
npm install      # instalacja zależności (raz)
npm run dev      # tryb podglądu, adres pojawi się w konsoli
```

Budowanie wersji produkcyjnej:

```bash
npm run build    # tworzy folder dist/
npm run preview  # podgląd zbudowanej wersji
```

## Publikacja i instalacja na telefonie

### Wariant A — GitHub + Netlify (zalecany, za darmo)

1. Załóż konto na https://github.com i utwórz nowe (puste) repozytorium, np. `kapitan`.
2. Wgraj do niego wszystkie pliki z tego folderu (przez stronę GitHub „Add file → Upload files", albo przez `git`):
   ```bash
   git init
   git add .
   git commit -m "Kapitan"
   git branch -M main
   git remote add origin https://github.com/TWOJ_LOGIN/kapitan.git
   git push -u origin main
   ```
3. Wejdź na https://netlify.com → zaloguj przez GitHub → „Add new site → Import an existing project" → wybierz repo `kapitan`.
4. Netlify sam wykryje ustawienia (Build: `npm run build`, Publish: `dist`). Kliknij Deploy.
5. Dostaniesz adres typu `https://kapitan-xyz.netlify.app`.

**Instalacja na telefonie:** otwórz ten adres w Chrome (Android) lub Safari (iPhone) → menu przeglądarki → **„Dodaj do ekranu głównego"**. Pojawi się ikona jak zwykła aplikacja i będzie działać offline.

> Vercel działa tak samo — https://vercel.com, „Import" repo, Deploy.

### Wariant B — GitHub Pages

1. W pliku `vite.config.js` zmień `base: "/"` na `base: "/kapitan/"` (nazwa Twojego repo).
2. Zbuduj: `npm run build`.
3. Zawartość folderu `dist/` wgraj na gałąź `gh-pages` (albo użyj akcji GitHub Pages w ustawieniach repo).
4. Adres: `https://TWOJ_LOGIN.github.io/kapitan/` — instalacja na telefon jak wyżej.

### Wariant C — plik APK (Android, opcjonalnie)

Jeśli chcesz prawdziwy plik instalacyjny bez sklepu, ten sam kod można spakować przez **Capacitor** (https://capacitorjs.com). To najwięcej pracy — do gry na osiedlu w zupełności wystarczy PWA (Wariant A).

## Struktura projektu

```
kapitan/
├─ index.html            # punkt wejścia
├─ package.json          # zależności i skrypty
├─ vite.config.js        # konfiguracja Vite + PWA (tu zmieniasz base)
├─ tailwind.config.js    # Tailwind
├─ postcss.config.js
├─ public/
│  ├─ icon-192.png       # ikony aplikacji
│  └─ icon-512.png
└─ src/
   ├─ main.jsx           # start Reacta
   ├─ index.css          # style Tailwind
   └─ App.jsx            # cała aplikacja
```

## Kopia i reset danych

Dane trzymane są w przeglądarce telefonu (localStorage, klucz `kapitan:data:v1`).
Wyczyszczenie danych przeglądarki dla tej strony skasuje graczy i wyniki.
Wyniki można też wyczyścić w aplikacji: zakładka Statystyki → „Resetuj wyniki".
