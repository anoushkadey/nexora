# Nexora — Coding Society website

A static site: plain HTML, CSS and JavaScript, with no build step.

## Run it locally

Open `index.html` in a browser, or serve the folder so paths behave the same as they will online:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Editing content

All names, photos, links and socials live in **`js/data.js`**. Leave a field empty (`""`) and the site shows a placeholder for it.

- `socials`: the Instagram, LinkedIn and Discord URLs
- `formEndpoint`: the Google Apps Script URL that saves applications to a Google Sheet. Setup steps are in `backend/SETUP.md`. While it's empty the form still works on the page, but nothing is saved.
- `union`: President, Vice President, General Secretary, Treasurer
- `departments`: each department's heads (name, course, year, college, link, photo)

Put photos in `assets/team/` and point to them from `js/data.js`, e.g. `photo: "assets/team/president.jpg"`.

## Structure

```
index.html        page markup + the hand-drawn SVG sprites
css/style.css     all styles (palette tokens at the top)
js/data.js        content
js/main.js        animation and interactions
js/vendor/        GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (smooth scroll)
assets/           logo (original + circular badge), paper texture
```

## Deploying on Render

The repo includes a `render.yaml` Blueprint for a free static site.

1. In Render, click **New → Blueprint** and connect this GitHub repo.
2. Pick the branch to deploy and click **Apply**.
3. Render gives you a `https://nexora-xxxx.onrender.com` URL. You can add a custom domain later under the service's **Settings → Custom Domains**.

Every push to that branch redeploys the site.
