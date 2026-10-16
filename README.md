# Calamity website

A plain HTML/CSS/JS version of your Framer site. No build step, no installs.

- **On a phone** it shows the full website (hero, What We Make cards, FAQs, floating button).
- **On a computer** it shows only the orange "Put the computer down, boomer" page with the QR code.

## 1. Run it on your computer

You can't just double-click `index.html` and expect everything to work (videos and some browsers need a tiny local server). Pick one:

**Option A: Python (already on most Macs and many PCs)**
1. Open a terminal inside this folder.
2. Run: `python3 -m http.server 8000` (on Windows: `python -m http.server 8000`)
3. Open http://localhost:8000

**Option B: Node**
1. Run: `npx serve .`
2. Open the address it prints.

**Option C: VS Code**
Install the "Live Server" extension, right-click `index.html`, choose "Open with Live Server".

### Testing both versions on your computer
Your computer will show the QR page. To preview the phone site, add this to the address:

- http://localhost:8000/?view=phone (phone site, shown as a phone-width column)
- http://localhost:8000/?view=desktop (QR page)

On a real phone, no `?view=` is needed. It picks automatically.
To test on your actual phone while developing, run the server, then open `http://YOUR-COMPUTER-IP:8000` on a phone on the same Wi-Fi.

## 2. Things to change (all in `config.js`)

Open `config.js` in any text editor.

- **Links:** the three booking links at the top. They are placeholders right now (`example.com`).
- **Cards:** add, remove, rename or reorder the "What we make" cards. Each block has a title, colour and description.
- **FAQs:** edit questions and answers (these are the final answers from your design).

## 3. Adding your videos and thumbnails (Windows)

Browsers can't read files straight off your D: drive, and the published site needs the videos to be part of the site folder. So a small script copies them in for you and links them to the right cards.

**Your folders should look like this** (this is how you already have them):

```
Videos\
    Faceless\          1.jpg  2.jpg  3.jpg   Video By Wearecalamity 1.mp4  Video By Xcommercial 2.mp4  Video By Wearecalamity 3.mp4
    Green Screens\
    Instructional\
    Podcast\
    Random but it works\
    Skits\
    Sports\
    Talking Head\
    Trends\
    VOX\
```

- The **number at the end** of each video's file name sets the order (1 first, then 2, then 3).
- The thumbnail with the **same number** (`1.jpg`, `2.jpg`...) goes with that video. A thumbnail with no number is paired with any video left without one, and the script tells you when it has to guess.

**To run it**
1. Open this site folder in File Explorer, click the address bar at the top, type `powershell` and press Enter.
2. Run: `powershell -ExecutionPolicy Bypass -File .\build-media.ps1`
3. It prints what it found for each card. Then refresh the site (Ctrl+F5).

If your videos folder is somewhere else, add it on the end: `-Source "D:\your\folder"`.
Run the script again whenever you add, replace or reorder videos. It copies them into `assets/videos` and `assets/posters`, and writes `media.js`.

Keep the videos small (compress them). Phones load them over mobile data.

## 4. The QR code

Save your QR code image as **`assets/qr.png`** (replace the placeholder note). Make it point at the final address of the published site. If the file is missing, the desktop page shows a small "Add your QR code" message.

## 5. Colours and fonts

- **Colours** are at the very top of `styles.css` (the `:root` block).
- **Fonts** (Anton and Inter) load from Google Fonts, so they need an internet connection. For a fully offline or self-hosted version, download both fonts from fonts.google.com, put the `.woff2` files in `assets/fonts/`, and un-comment the `@font-face` lines near the top of `styles.css`.

## 6. Publishing on GitHub Pages (free)

**Why uploads fail:** GitHub only accepts files up to **25 MB** when you drag them into the website, and **100 MB** per file when you push from your computer. Phone videos are usually bigger than that. So shrink them first.

1. **Shrink the videos.** Install ffmpeg once: open PowerShell and run `winget install Gyan.FFmpeg`, then close PowerShell and open a new one. Now run `build-media.ps1` as in section 3. It makes each video phone-sized (a few MB) and prints the new sizes. Aim for every file well under 20 MB, and the whole `assets` folder under about 200 MB.
2. **Upload with GitHub Desktop** (not the browser upload page):
   - Install GitHub Desktop (desktop.github.com) and sign in.
   - File > Add local repository > choose this folder. If it says it isn't a repository, click "create a repository", then Create.
   - Write a summary like "First version", click **Commit to main**, then **Publish repository**. Untick "Keep this code private" (free Pages needs a public repository).
3. **Turn on hosting.** On github.com open the repository > **Settings** > **Pages** > under "Build and deployment" choose **Deploy from a branch**, pick **main** and **/(root)**, and Save. After a minute or two your address appears: `https://YOUR-USERNAME.github.io/REPO-NAME/`.
   - Want a shorter address with no repo name? Name the repository exactly `YOUR-USERNAME.github.io`.
4. **Update your QR code** so it points at that address, and save it as `assets/qr.png`.
5. **Later changes:** run `build-media.ps1` if you changed videos, then in GitHub Desktop commit and push. The site updates in a minute or two.

**If a big file already got into a failed upload:** it stays hidden in the repository history and keeps blocking you. The easiest fix is to delete the hidden `.git` folder inside this project folder (turn on "Hidden items" in File Explorer's View menu), then start again from step 2.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page: hero text, desktop QR page, structure |
| `styles.css` | All the design and colours |
| `config.js` | Links, cards, FAQs (**edit this one**) |
| `build-media.ps1` | Copies your videos/thumbnails in and links them to the cards |
| `media.js` | Made by the script above. Don't edit by hand |
| `.nojekyll` | Empty file that tells GitHub Pages to serve the site as it is |
| `app.js` | Behaviour (phone/desktop switch, card stack, videos, FAQs) |
| `assets/` | Your videos, thumbnails, fonts and `qr.png` |
