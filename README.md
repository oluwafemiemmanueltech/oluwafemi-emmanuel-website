# Oluwafemi Emmanuel portfolio

A lightweight, multi-page portfolio for an independent full stack developer and automation specialist. The site uses semantic HTML, local CSS and a small JavaScript enhancement file. It has no package installation or external runtime dependencies.

Words reveal as page text enters the viewport while scrolling, across all pages. The effect repeats as text re-enters view and becomes immediate when reduced motion is requested. The homepage portfolio facts (experience, focus areas, and public projects) describe the résumé and linked public work, not client or lead-generation results.

## Run locally on Windows

Open PowerShell in this folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Open `http://127.0.0.1:4173/` in a browser. The development server listens on localhost only. Press `Ctrl+C` in the terminal to stop it.

## Pages

- `index.html`: introduction, reserved portrait area, six clickable skill portfolio dashboards, services, pricing and three testimonials with a link to six more
- `testimonials.html`: the other six concise testimonial excerpts, grouped by service
- `work.html` and `work/`: portfolio directory and detail pages; Web Applications includes BizForce, SEWO, and Brainwave.io with an app walkthrough video; eCommerce includes grocery and fashion storefront examples; Integrations includes the API Integration Pipeline image and walkthrough; Automation includes AI email, WhatsApp booking, lead qualification and booking, and LinkedIn lead research case studies; Websites and CRM include video galleries
- `services.html`: service scope
- `about.html`: professional background and technical experience
- `preview.html`: free local-business website preview request
- `booking.html`: $44/month Website Care Plan, $55/month Growth Partner Plan, and consultation request
- `contact.html`: general project enquiry
- `privacy.html` and `terms.html`: draft policies for this static site

## Before publishing

- Review the supplied website screenshots before publishing.
- The site uses the supplied square monogram as its browser favicon and Apple touch icon.
- The supplied website MP4s, web app walkthrough, and API Integration Pipeline walkthrough are stored in `assets/videos/`. Website videos appear on `work/websites.html`; the app walkthrough appears on `work/applications.html`; the integration walkthrough appears on `work/integrations.html`. Portfolio videos load when scrolled into view, autoplay muted when ready, and pause off-screen.
- The homepage testimonials and attributions are user-provided and approved for publication.
- The free-preview and enquiry forms prepare an email draft to `oluwafemiemmanueltech@gmail.com`. The site does not send, store, or deliver form submissions. A server-side form endpoint and spam protection must be configured before production use.
- The booking page embeds your Calendly event (`calendly.com/oluwafemiemmanueltech/30min`) as step one. After the invitee books, Calendly reveals the project enquiry form; a manual continue button is also available if the embed blocks its event message. The chosen appointment time must be entered in the form; Calendly does not automatically add it to the email draft.
- Your résumé LinkedIn profile is linked from the site footer and included in the homepage profile metadata.
- The Website Care Plan starts at $44/month and the Growth Partner Plan at $55/month. AI phone, SMS and WhatsApp usage charges are based on volume. This website does not take payments.
- Add your own final domain and canonical URLs before publishing. Generate an absolute sitemap for that domain and submit it after launch.
- Review the privacy and terms drafts for your actual business and applicable laws.

The portfolio presents public GitHub projects as selected project work and makes no unverified performance claims. Testimonials and attributions are supplied and approved by the site owner.

After choosing the final HTTPS website address, generate the absolute sitemap:

```powershell
powershell -ExecutionPolicy Bypass -File .\generate-sitemap.ps1 -BaseUrl "https://your-final-domain"
```

The script requires a real HTTPS base URL and writes `sitemap.xml`. Add canonical URLs and the sitemap location to `robots.txt` only after the final domain is confirmed.
