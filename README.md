# Hungru Pizza: website

Website for **Hungru Pizza**, a pizza café at 2610/9, Krishnanagar Road, Colony More, Barasat, West Bengal 700126
("Best Pizza, Best Value"). Built from the café's printed menu, its Google Business Profile, and its Zomato and Swiggy listings.

Every page pushes the ways to order: **WhatsApp** (main), **call**, and **Zomato / Swiggy** for delivery.

- Vite + React + TypeScript, Tailwind CSS v4, shadcn/ui, React Router, lucide-react
- No database. The order form and the pizza builder open WhatsApp with the order written out.
- Every page is **prerendered to static HTML** at build time (real titles, meta tags and content for Google and for WhatsApp link previews), then React takes over in the browser.
- All content (text, photos, menu, prices) lives in **one file: `src/data/content.json`**, edited through the **admin panel at `/admin/`**.

## Quick start

Needs Node.js 22.22 or newer.

```bash
npm install
npm run dev        # site at http://localhost:5173, admin panel at http://localhost:5173/admin/
npm test           # unit tests (pizza prices, WhatsApp messages, form checks, content checks, admin API)
npm run build      # production build into dist/ (type check + site + admin + prerender)
npm run preview    # serve dist/ locally at http://localhost:4173 (the admin panel needs `npm run dev` or Vercel)
```

## Pages

| URL | Page |
| --- | --- |
| `/` | Home: hero with a looping food video, trust strip, the combo offers band (the ₹129 combos, ready to add), a tile for each menu section, how ordering works, gallery, pizza builder teaser, Google reviews, nearby areas, FAQ, order form |
| `/menu/` | The full menu (172 dishes and 33 combos) as a finder: search, a tab for each section, sorting by price or name, and Veg / Non-veg switches. The filters stay in the address, so `/menu/?section=veg-pizzas&diet=veg` can be shared |
| `/menu/<slug>/` | One page per menu section (veg pizzas, chicken pizzas, kullad and kids' pizzas, starters and sides, momos and burgers, drinks and desserts, and the three kinds of combo), all from one template |
| `/offers/` | Combo offers from the printed combo menu ("save 15 to 20%"): the ₹129 combos, veg combos and non-veg combos, each price an add-to-cart button |
| `/build-your-pizza/` | Pizza builder: 8 or 10 inch, crust (cheese burst), cheese, toppings and quantity at the menu's add-on prices, priced as you go on a kitchen order ticket, then added to the cart or sent on WhatsApp |
| `/cart/` | The cart: what is in it, with quantities and the total, and the details form that sends the whole order on WhatsApp. Kept out of Google and the sitemap |
| `/gallery/` | Filterable photo gallery with lightbox |
| `/blog/`, `/blog/<slug>/` | Blog: three sample posts (pizza sizes, cheese burst, kids' pizzas), each with an order box and two more posts |
| `/careers/` | Why work here, the open jobs (three samples) and an application that opens WhatsApp with the details written out |
| `/delivery/<slug>/` | Nearby area pages: Champadali, Hridaypur, Madhyamgram |
| `/about/` | Story, team (hidden until added), ingredients, our promise |
| `/contact/` | Address, map, hours, call, WhatsApp, Zomato and Swiggy links, order form |
| `/privacy-policy/`, `/terms-and-conditions/`, `/cookie-policy/`, `/cache-policy/`, `/refund-policy/`, `/disclaimer/` | Policy pages written for Indian law and a food business, linked from the footer of every page |
| `/admin/` | Admin panel (not indexed by Google) |

Two names in the code come from the template the site was built on: **"services" are the menu sections** and
**"projects" are the gallery photos** (`src/data/types.ts` says so at the top).

## Design

- **Idea:** Hungru's own printed menu: deep maroon boards with yellow headings. Maroon (`#800000`, the menu's exact colour) is the one accent on a neutral grey page; the dark bands and the footer are maroon, and on them the accent turns to cheese yellow (`src/theme.css`). Green and brown appear only in the Indian veg and non-veg marks.
- **Logo:** cut from the printed menu (`public/images/uploads/hungru-logo.webp`), and a square "H" icon made from it for the browser tab and phone home screens (`hungru-icon.png`). Ask the client for the original logo file to get a sharper version.
- **Type:** one self-hosted variable font, Bricolage Grotesque, cut down to the characters the site uses (84 KB) and preloaded. Its optical-size axis makes the headings chunky and the body text open; its width axis gives the narrower display cuts.
- **Drawn details** (`src/components/common/Motifs.tsx`): the bubbly edge of a pizza crust (under every hero and where the page turns dark) and a strand of melted cheese, the "cheese pull" of a cheese burst pizza, that stretches across the four "how ordering works" steps and drips onto each one. Prices are printed on a kitchen order ticket with torn edges.
- **Hero video** (`src/components/sections/HeroVideo.tsx`): a 13-second loop behind the home page heading. A cheese pull, a chicken burger, peri peri fries and a cola pour, crossfaded so the end runs back into the start. The clips were made with Grok, cut and joined with ffmpeg, and trimmed at the bottom where Grok stamps its mark. Two versions in `public/video/`: wide for computers (1264 × 648, 1.7 MB, food on the right) and tall for phones and tablets (720 × 1224, 2.2 MB, behind the whole hero: heading and text at the top, food in the middle, buttons at the foot). Each has a still of its first frame in `public/images/uploads/`. The still shows straight away, and the video loads once the page has finished, then fades in over it. The video pauses while scrolled out of view. Its pause button only appears when reached with the keyboard. Visitors who switch motion off or save data only see the still. There is no credit line on show: Grok asks for "Created with Grok" wherever its output is published, so it can be added back in the admin (see Before launch).
- **Cart** (`src/lib/cart.ts`, `src/lib/cart-store.ts`, `src/pages/Cart.tsx`): every price on the menu is an add button (tap "8 inch ₹210" to add that pizza in that size), and the pizza builder has an Add to cart button. The cart button in the header shows how many things are in it; a short note confirms each add. The cart page lists everything with plus and minus buttons and the total, and its form sends the order on WhatsApp with each line, its price and the total written out. Each line can take extras there (Add extras): an 8 or 10 inch pizza gets cheese burst, extra cheese and toppings at the pizza builder's add-on prices for its size (veg toppings only on a veg pizza, no cheese burst on a pizza that already is one), a pizza from the builder can change its own choices, and any dish gets its menu section's add-ons, such as the ₹20 dips with starters. The cart is kept in the visitor's browser only (`hungru-cart` in local storage, named in the cookie policy). It stores which dish, size and how many, never the price: prices are always read from the current menu, so a price changed in the admin reaches carts filled before it, and dishes taken off the menu drop out. No payment is taken online; the shop confirms the total on WhatsApp.
- **Delivery radius** (`src/lib/distance.ts`, `src/components/sections/DistanceCheck.tsx`): delivery only within 5 km of the café, in a straight line (Business details → Delivery radius). Each delivery area has a map position; the order form's "Deliver to" list offers only the areas inside the circle, and the content check warns about any outside it. For a place not in the list, the customer picks "Somewhere else within 5 km" and taps Check my distance: the phone's location (asked for by the browser first) is compared with the café's. Inside the circle, the order can be sent, with the distance and a Google Maps link to that spot for the rider; outside it, sending is blocked and the customer is offered pickup instead. The location is only used on the page, and only goes out inside the WhatsApp message if the customer sends it (said in the privacy policy). Google gets the café's position and the delivery circle in its business details.
- **Phone call and WhatsApp bar:** fixed to the foot of the screen on phones. It stays out of sight while the page's own call and WhatsApp buttons are on screen (the top of every page and the closing order band), and slides in once they scroll away, so the same buttons never show twice (`src/lib/cta-bar.ts`). Blog posts and the policy pages have no buttons at the top, so it shows there from the start. On the cart page it stays hidden, as the bar's WhatsApp button would send a message without the cart.
- **Dish photos** (`src/components/sections/MenuList.tsx`): every dish on the menu, the Offers page and the home page band has a square photo beside it; tapping it opens it bigger, with the dish's add buttons. The same photo shows in the cart and the search results. A dish without a photo gets a plain tile, so the list stays in line. On phones the prices of a dish in two or more sizes go under its description, so the name keeps its room. For now every dish has an Unsplash sample picked from its name (samosas, momos, cold coffee …; the kids' pizzas are Hungru's own, and the kullad pizzas use a kullad photo sent in for the site), marked "Sample photos" while sample tags are on. The home page's six menu tiles (`src/components/sections/MenuTeaser.tsx`) each show one dish that says the section at a glance: a loaded veg pizza, a chicken pizza, a kullad pizza in its clay cup for kullad and kids, a starter basket, momos and an Oreo shake.
- **Combo offers** (`src/pages/Offers.tsx`, `src/components/sections/OffersBand.tsx`): the 33 combos from the printed combo menu are three menu sections marked as offers: ₹129 combos, veg combos and non-veg combos (the chicken starter value pack, the Choco Lava and drinks deals and the East West combo are in with veg or non-veg by what is in them). They have the /offers/ page, a maroon band on the home page with the ₹129 combos, a link in the thin bar above the header on tablets and computers (the menu bar below had no room left) and Offers in the phone menu and the footer; they are also tabs on the full menu and found by the search. They go into the cart like any dish, but an 8 or 10 inch combo takes no cheese burst or topping extras, as it is a set deal. Combos with the same name on both sides of the printed menu got "Veg" or "Chicken" in front (Veg Couple Combo, Chicken Couple Combo), so a WhatsApp order is never unclear.
- **Home link:** the first link in the header on every page but the home page (a house button on phones and tablets, the word Home on computers), for visitors who do not know the logo goes home. To make room on phones, the header there holds Home, Search, the cart and the menu: the light and dark switch moved into the menu, and calling is on the call bar at the foot of the screen and in the menu.
- **Site search** (`src/lib/search.ts`, `src/lib/search-index.ts`, `src/components/layout/SiteSearch.tsx`): the magnifying glass in the header (on a computer, / or Ctrl+K opens it too). It searches everything on the site as you type: dishes (with their food mark and price), menu sections, pages, blog posts, delivery areas, jobs, questions and policies. It forgives spelling slips ("panner", "chiken tika", "margarita"), plurals and everyday words ("timings" finds the opening hours, "job" finds Careers, "spicy" finds the fiery pizzas), and reads prices ("pizza under 200", "chicken ₹250", "cheap momos" list the dishes up to that price, cheapest first). Hours, phone, address and delivery are answered right in the results. A result opens its page: a dish opens its menu section scrolled to it and lit up for a moment, a question opens with its answer unfolded, a job opens at that job. When nothing matches, it offers to ask on WhatsApp. It runs in the visitor's browser with nothing sent anywhere, and its code loads only when the search is first opened. New dishes, posts and pages are found as soon as they are published; there is nothing to add for them.
- **Light and dark mode:** the sun and moon switch in the header, on every page (in the menu on phones). The site starts in the visitor's device setting and remembers their choice in the browser (`hungru-theme` in local storage, named in the cookie policy). The script at the top of `index.html` picks the mode before the page paints, so it never flashes. Dark mode swaps the colour variables in `src/theme.css`: greys run the other way, maroon text turns a lighter red that reads on the dark page, and the maroon bands and the order ticket keep their colours.
- **Shapes:** buttons and chips are pills, form fields are 10px round, photos and panels are rounded.

## Admin panel (`/admin/`)

A site editor built for this site. Everything visitors see can be changed there: business details, every heading and paragraph, the menu (sections, dishes, prices, veg marks, tags), gallery photos, reviews, delivery areas, FAQs, pizza builder prices, the team, photos, button labels, the WhatsApp messages and the Google titles and descriptions.

- **Live preview.** The real site, beside the form, updates as you type. Desktop and phone views. Opening a menu section or delivery area shows its own page.
- **Menu.** Content → Menu. Each section has its dishes, each with one price or one per size (8 inch / 10 inch, 4 pcs / 8 pcs, Small / Medium / Large, Regular / Grill …), the veg / non-veg / either mark and an optional tag such as Spicy. A short note above the dishes (slices per size, dips) is set per section.
- **Pizza builder.** Content → Pizza builder. Sizes, crusts, cheese and toppings, each extra with its 8 inch and 10 inch price (as in the menu's add-on table), plus the most toppings and pizzas allowed.
- **Blog and Jobs.** Content → Blog (posts: title, address, date, photo, the text in parts with headings, Google title and description) and Content → Jobs (title, type, hours, pay, duties, what you are looking for). The page text is under Pages → Blog page and Careers page.
- **Dish photos.** Content → Menu → a section → a dish → Photo: Change photo picks one from the library or uploads a new one from a phone or computer (it is resized and turned into WebP), Remove leaves a plain tile. The list of dishes shows each one's photo, and the photo library says which dishes use a photo. The six tiles of "The menu" on the home page each have their own photo too: Content → Menu → a section → Photo on the home page tile (empty uses the section's main photo).
- **Combo offers.** Each combo is a dish in one of the three combo sections (Content → Menu), with its prices; a section switched to "Combo offers" shows on the Offers page. The page's wording, the home page band (and which combos it shows) and the top-bar link are under Pages → Offers page.
- **Cart.** Pages → Cart: every label of the cart (the add buttons, the cart button, the note after adding, the cart page, the empty cart, the extras panel). Pizza extras are priced in Content → Pizza builder; other extras are each menu section's "Add-ons in the cart" list (Content → Menu). Prices come from the menu, so there is nothing to price here. The form's own labels are under Navigation, footer & buttons → Order form, and the cart page's Google title under Google & link previews.
- **Site search.** Pages → Site search: its wording, the popular searches shown before anything is typed, and the headings of the quick answers (the hours, phone and address themselves come from Business details).
- **Home video.** Home page → Top of the page → Background video. The video files, their still pictures, an optional credit line and the pause button's labels. New video files go in `public/video/` (the admin uploads photos, not videos).
- **Photos.** Upload from a phone or computer. Photos are resized (max 1920 px, WebP) and stripped of camera data before upload. "Replace" swaps a photo everywhere it is used.
- **Logo.** Business details → Logo. Any shape works. With no logo, the built-in slice mark and the name are shown.
- **Browser tab icon.** The build makes the favicon and the iPhone home-screen icon from the square icon (Business details → Logo → Browser tab icon), or else from the logo (`scripts/prerender.mjs`, with `sharp`).
- **Delivery apps and social pages.** Business details → Order online (Zomato, Swiggy) and Social pages (Facebook). Shown on the Contact page and in the footer, and sent to Google.
- **Safety nets.** Undo and redo (Ctrl+Z / Ctrl+Shift+Z), drafts kept in the browser until published, checks that block publishing broken content (a missing photo, a link to a deleted menu section, a dish with no price), and a publish history to bring back any earlier version.
- **Policies & terms.** Every policy is a list of parts (heading and text). The text can use `{email}`, `{officer}`, `{phone}`, `{address}` and the other placeholders shown under the box.

### How publishing works

On Vercel, **Publish** commits `src/data/content.json` (and any new photos, in `public/images/uploads/`) to the GitHub repo. Vercel sees the commit and rebuilds the site, so changes are live about a minute later.

The build checks the content again. If something is wrong, the build fails and **the previous version stays live**.

Locally (`npm run dev`), Publish saves straight to `src/data/content.json` on your computer. No password is needed unless you put `ADMIN_PASSWORD=...` in a `.env.local` file.

### Setting it up on Vercel (once)

1. **Import the repo.** Vercel → Add New → Project → import this repository. `vercel.json` sets the build.
2. **Create a GitHub token.** GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
   - Repository access: **Only select repositories** → this repository.
   - Permissions → Repository permissions → **Contents: Read and write**. Nothing else is needed.
3. **Add environment variables in Vercel.** Project → Settings → Environment Variables (Production):
   - `ADMIN_PASSWORD`: the password for `/admin/`. Use a long one.
   - `GITHUB_TOKEN`: the token from step 2.
   - Optional: `GITHUB_REPO` (`owner/name`) and `GITHUB_BRANCH` (`main`). Vercel normally provides both.
4. **Redeploy** (Deployments → ⋯ → Redeploy) so the function picks up the variables.
5. Open `https://<your-site>/admin/` and sign in.

### Security

- One password, checked on the server. Wrong guesses are slowed down and locked out after 10 tries for 15 minutes.
- The session is a signed, HttpOnly, SameSite=Strict cookie (`hungru_admin`) that lasts 7 days.
- Publish requests must come from the admin page itself (same-origin check plus a custom header).
- Uploads must really be JPG, PNG, WebP or AVIF images (checked by their bytes), at most 3 MB, and get a random file name.
- The GitHub token only lives in Vercel and can only touch this one repository.

### Hostinger

Hostinger's shared hosting serves static files only, so `/admin/` cannot publish from there. Either keep the site on Vercel, or edit locally with `npm run dev`, then `npm run build` and upload the contents of `dist/` into `public_html` (include the hidden `.htaccess`).

## What is real and what still needs checking

**Real (from the menu PDF and the Google, Zomato and Swiggy listings):** the name, logo, address, phone number, opening
hours and happy hours, the Google rating (4.7 from 415 reviews), the four reviews (real Google reviews, shortened, first
name and initial only), the whole menu with every price, the add-on prices used by the pizza builder, the Zomato, Swiggy
and Facebook links, and the three photos of the kids' pizzas (cropped from the printed menu).

A few dish names have obvious spelling slips fixed (PIZZZA → Pizza, Maxican → Mexican, Panco → Panko, Lemon Paper → Lemon
Pepper). Names like "Delux", "Cindrella" and "Dominor" are kept as printed.

## Before launch

Small "Sample" or "To confirm" tags mark everything below on the site while sample tags are on. Check with the owner, then
change them in the admin panel:

1. **WhatsApp.** Every WhatsApp button uses `+91 98330 48397`, the phone number on Google. Confirm that number is on WhatsApp, or put in the right one (Business details → Phone and WhatsApp).
2. **Home delivery.** The site delivers only within 5 km of the café and lists nine nearby areas. Confirm the café delivers itself, the radius and any charge, or change the wording to Zomato and Swiggy only (Business details → Delivery radius, Delivery areas, FAQs, Navigation, footer & buttons). Check the map positions too: the café's pin is the Colony More stop on Krishnanagar Road from OpenStreetMap, and Banamalipur (not on OpenStreetMap) is placed at Barasat station next to it. In Google Maps, press and hold on the café, and on the middle of each area, to get the right numbers (Business details → Map position and delivery; Delivery areas).
3. **Delivery area pages.** Champadali, Hridaypur and Madhyamgram: check the local details and landmarks (Delivery areas).
4. **Website address.** The site uses `https://www.hungrupizza.example`. Set the real domain (Business details → Website). Canonical links, `sitemap.xml` and `robots.txt` are built from it.
5. **Reviews.** Ask the four reviewers (Anwesha D., Asit B., Sneha B., Paromita H.) if they are happy to be quoted, or swap in others (Reviews).
6. **Prices and the menu.** Copied from the printed menu, which may be older than the Zomato menu (Google reviews mention dishes that are not on it, such as Alfredo pasta and iced peach tea). Confirm prices, and whether they include GST: the printed combo menu says "5% GST extra on all products", so the combo pages say their prices are before GST, but the main menu says nothing and the cart total does not add GST. If GST is added to every bill, say so on the menu and cart too (or have the cart add it).
7. **Combo offers.** Typed from the printed combo menu. Check the combo names the site had to add (the four ₹129 combos had none, and the veg and non-veg combos of the same name now start with Veg or Chicken), the "save 15 to 20%" line, and two dishes that are on the combo menu but not the main menu (Prawn Delight Pizza, crispy chicken leg, fish and chips).
8. **Pizza builder.** It starts from the Cheesy Margherita (₹139 / ₹220) and adds the menu's add-on prices, up to 6 toppings. Confirm the kitchen makes custom pizzas this way (Pizza builder).
9. **Story and promise.** Written from the menu and reviews (Team & story). Add the year the café opened, the owner's story and the team, if they want them; the team section stays hidden until someone is added.
10. **Photos.** Apart from the logo and the kids' pizzas, all photos are Unsplash samples, chosen to look like Hungru's food (paneer pizzas, momos, cold coffee). Ask for real photos of the café, the pizzas and the team and use **Replace** in the Photo library. The original logo file would also be sharper than the one cut from the menu. Every dish has a sample photo too (Content → Menu); replace them with photos of Hungru's own dishes as they come in.
11. **Blog and careers.** The three posts are written from the menu (sizes, prices, cheese burst, the kids' pizzas). Ask the owner to read them. The three jobs and the "why work with us" reasons are samples: confirm which jobs are really open, the hours, the pay line and whether staff eat on shift, or remove them (Content → Jobs, Pages → Careers page). The privacy policy now says how job applications are used and kept (6 months).
12. **Home video.** The food in it was made with AI (Grok), not filmed at Hungru. Show the owner and check they are happy with it. The credit line was taken off on request; Grok's brand guidelines ask for "Created with Grok" wherever its output is published, so decide whether to put it back (Home page → Background video → Credit line). Short clips of Hungru's own pizzas would be even better, and could replace these files later (Home page → Background video).
13. **Policies.** Written for Indian law (DPDP Act 2023 and DPDP Rules 2025, IT Act 2000 and the 2011 SPDI Rules, Consumer Protection Act 2019, Food Safety and Standards Act 2006). Fill in the legal name, the Grievance Officer's name, a real email and the FSSAI licence, check the refund rules against how the café works, and have a lawyer review them.
14. **Footer credit.** "Demo by Fenlark" (Navigation, footer & buttons → Footer).
15. **Turn off sample tags.** Business details → Website → "Show Sample tags" off, once everything above is confirmed.

## Editing content without the admin panel

`src/data/content.json` is plain JSON and can also be edited by hand; `src/data/types.ts` describes its shape. Run `npm test` afterwards: it runs the same checks as the admin panel (missing photos, unknown menu sections, dishes without prices, duplicate page addresses, and so on).

Text in curly braces is filled in automatically, e.g. `"Pizza delivery in {area}"` becomes "Pizza delivery in Hridaypur". Two stars make a word bold where noted (`"press **send**"`).

Photo `src` values are either an Unsplash photo id or a file path such as `/images/uploads/hungru-logo.webp` (files in `public/`).

## How the build works

`npm run build` does five things:

1. `tsc -b`: type check.
2. `vite build`: the site's browser bundle into `dist/`.
3. `vite build --mode admin`: the admin panel into `dist/admin/`, built separately so it never adds weight to the site.
4. `vite build --ssr`: a temporary server bundle in `dist-ssr/`.
5. `node scripts/prerender.mjs`: checks the content (stops the build on errors), renders every page to `dist/<page>/index.html` with its own title, description, canonical, Open Graph tags and JSON-LD, and writes `sitemap.xml`, `robots.txt` and `build.json`.

Structured data: `Restaurant` (address, phone, hours, delivery areas, menu link) on every page, `Menu` with every `MenuSection` and `MenuItem` (prices in INR, vegetarian dishes marked) on `/menu/`, a `MenuSection` on each menu section page, `FAQPage` on pages with FAQs and `BreadcrumbList` on inner pages. The Google rating is deliberately **not** added to structured data while sample tags are on (Google does not show self-served ratings for a local business anyway).

## Project structure

```
src/
  data/content.json     ← all site content (edited by the admin panel)
  data/site.ts          ← typed access to content.json
  data/types.ts         ← shape of the content
  pages/                ← one file per page (lazy.ts / eager.ts list them)
  components/sections/  ← page sections (hero, menu, order ticket, gallery, order form, FAQ…)
  components/common/    ← shared pieces (SitePhoto, buttons, food marks, motifs, SEO)
  components/layout/    ← header (with the site search), footer, sticky phone Call/WhatsApp bar
  components/ui/        ← shadcn/ui components
  lib/                  ← pizza prices, cart, site search, WhatsApp messages, validation, SEO, content checks
  admin/                ← the admin panel (forms are built from admin/schema/)
  preview.tsx           ← renders the admin's draft inside its preview frame
  entry-server.tsx      ← used only by the prerender step
admin/index.html        ← admin panel page
api/admin.ts            ← admin API: sign-in, uploads, publish to GitHub (Vercel function)
scripts/admin-dev.ts    ← the same API inside `npm run dev`, saving to local files
scripts/prerender.mjs   ← writes static HTML, sitemap.xml, robots.txt, build.json
public/.htaccess        ← Apache / LiteSpeed config
vercel.json             ← Vercel settings (build, headers, admin API route)
tests/                  ← Vitest unit tests
```

## Performance and accessibility notes

- Pages are prerendered, CSS is inlined, and the app's JavaScript starts right after first paint. Call and WhatsApp links work even before it loads.
- Images are responsive, lazy-loaded below the fold and served as AVIF/WebP.
- Scroll animations use GSAP (`src/lib/motion.ts`). It is downloaded only on the visitor's first scroll or touch, never animates anything already on screen, and is skipped entirely with "reduce motion". Pages look complete without it.
- The admin panel is a separate app: none of its code is downloaded by visitors.
- Visible focus rings, a skip link, tap targets of at least 44px, one H1 per page, labelled form fields with inline errors, and the veg / non-veg marks are read out to screen readers.
