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
- `formEndpoint`: where the "Join our community" form is sent (for example a Formspree URL). While it's empty the form still works on the page, but nothing gets sent anywhere.
- `union`: President, Vice President, General Secretary, Treasurer
- `departments`: each department's heads (name, course, year, portfolio/resume link, photo)

Put photos in `assets/team/` and point to them from `js/data.js`, e.g. `photo: "assets/team/president.jpg"`.

## Structure

```
index.html        page markup + the hand-drawn SVG sprites
css/style.css     all styles (palette tokens at the top)
js/data.js        content
js/main.js        animation and interactions
js/vendor/        GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (smooth scroll)
assets/           logo, paper texture
```
