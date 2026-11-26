/*
  Experience: the ONE source of this section for Home and About. Edit the rows here and
  both pages change; there is no second copy in the HTML.

  Each page has an empty <section ... data-exp-source> directly followed by this script,
  which fills it while the page is still being parsed: anchors (#experience), the scroll
  scenario on Home and the other scripts see the finished markup. Behaviour:
  js/experience-accordion.js, styles: css/experience.css. Without JavaScript the section
  shows its heading and the CV link (<noscript> in the page).
*/
(function () {
  var script = document.currentScript;
  var section = script && script.previousElementSibling;
  if (!section || !section.hasAttribute("data-exp-source")) return;
  section.insertAdjacentHTML(
    "beforeend",
    String.raw`
        <h2 class="h2-section experience-heading home-col" data-reveal>Experience:</h2>
        <ul class="experience-list home-col" data-reveal-group data-reveal-stagger="60" data-exp-list>
          <li class="exp" data-exp>
            <div class="exp__head">
              <div class="exp__title">
                <p class="exp__role" id="exp-independent-title">Product Designer (NDA) · Part&#8209;time</p>
                <p class="exp__dates"><time datetime="2025-04">Apr 2025</time> – Present</p>
              </div>
              <button class="exp__toggle" type="button" aria-expanded="false" aria-controls="exp-independent-panel" aria-label="Show details: Product Designer (NDA), part-time"><span class="exp__chev"><svg class="exp__chev-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
              <div class="exp__body">
                <div class="exp__fold exp__fold--summary"><div class="exp__fold-in"><p class="exp__summary">Events platform MVP in one month (14-screen organizer flow, Design System, 4 payment-integration defects caught before launch); an education brand and website run for about a year; a gamified interactive prototype from research to deployed code.</p></div></div>
                <div class="exp__fold exp__fold--panel"><div class="exp__fold-in">
                  <div class="exp__panel" id="exp-independent-panel" role="region" aria-labelledby="exp-independent-title">
                    <ul class="exp__list" role="list">
                      <li>Deliver product, web and brand design for private clients, from discovery and user flows to high-fidelity UI and handoff.</li>
                      <li>Took an interactive game prototype from research to a Vercel deploy: Figma variables and components → React + Tailwind, CI with visual QA against Figma in three browsers.</li>
                      <li>Use AI-assisted workflows (Claude Code, Figma MCP) under my own specs, review and quality criteria.</li>
                    </ul>
                    <p class="exp__note">Client details under NDA.</p>
                  </div>
                </div></div>
              </div>
            </div>
          </li>
          <li class="exp" data-exp>
            <div class="exp__head">
              <div class="exp__title">
                <p class="exp__role" id="exp-atj-title">UX&#8288;/&#8288;Product Designer · <a class="exp__company" href="https://www.alltogether.jobs/" target="_blank" rel="noopener">All&nbsp;Together&nbsp;Jobs</a>, Ukraine</p>
                <p class="exp__dates"><time datetime="2025-09">Sep 2025</time> – <time datetime="2026-08">Aug 2026</time></p>
              </div>
              <button class="exp__toggle" type="button" aria-expanded="false" aria-controls="exp-atj-panel" aria-label="Show details: UX/Product Designer at All Together Jobs"><span class="exp__chev"><svg class="exp__chev-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
              <div class="exp__body">
                <div class="exp__fold exp__fold--summary"><div class="exp__fold-in"><p class="exp__summary">Inclusion assessment SaaS: led UX as the main designer, WCAG&nbsp;2.2&nbsp;AA handoff. Inclusive hiring platform: vacancy search, filters and job cards in a team of 4 designers.</p></div></div>
                <div class="exp__fold exp__fold--panel"><div class="exp__fold-in">
                  <div class="exp__panel" id="exp-atj-panel" role="region" aria-labelledby="exp-atj-title">
                    <ul class="exp__list" role="list">
                      <li>Designed the product foundation for an inclusive employment platform (DEI &amp; WCAG), turning an unorganized content ecosystem into a development-ready UX architecture.</li>
                      <li>Split the product into two tracks, a full audit for Enterprise and a shorter modular version for SMB, based on a quantitative survey and 18 in-depth interviews.</li>
                      <li>Facilitated stakeholder workshops (HMW framing, ideation, MVP prioritization).</li>
                      <li>Delivered a full handoff: clickable prototype, interaction specs, product logic and WCAG 2.2 AA requirements.</li>
                    </ul>
                    <p class="exp__links">
                      <a class="exp__case" href="case-atj">View case: Inclusive Hiring Platform <span aria-hidden="true">→</span></a>
            <a class="exp__case" href="case-atj-2">View case: One Questionnaire, Two Audiences <span aria-hidden="true">→</span></a>
                    </p>
                  </div>
                </div></div>
              </div>
            </div>
          </li>
          <li class="exp is-open" data-exp>
            <div class="exp__head">
              <div class="exp__title">
                <p class="exp__role" id="exp-uniqkey-title">Product Designer · <a class="exp__company" href="https://www.uniqkey.eu/" target="_blank" rel="noopener">Uniqkey&nbsp;A&#8288;/&#8288;S</a>, Denmark</p>
                <p class="exp__dates"><time datetime="2021-12">Dec 2021</time> – <time datetime="2024-11">Nov 2024</time></p>
              </div>
              <button class="exp__toggle" type="button" aria-expanded="true" aria-controls="exp-uniqkey-panel" aria-label="Show details: Product Designer at Uniqkey A/S"><span class="exp__chev"><svg class="exp__chev-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
              <div class="exp__body">
                <div class="exp__fold exp__fold--summary"><div class="exp__fold-in"><p class="exp__summary">Rebuilt Admin Portal navigation: data found 30% faster, support requests down 27%.</p></div></div>
                <div class="exp__fold exp__fold--panel"><div class="exp__fold-in">
                  <div class="exp__panel" id="exp-uniqkey-panel" role="region" aria-labelledby="exp-uniqkey-title">
                    <ul class="exp__list" role="list">
                      <li>Main and, most of the time, the only designer of the Admin Portal, Partner Portal, Browser Extension and Mobile App.</li>
                      <li>Rebuilt Admin Portal navigation: data found 30% faster, support requests down 27%, 95% of users noticed the improvement.</li>
                      <li>Redesigned the 2FA Mobile App in two iterations: information found 40% faster.</li>
                      <li>Redesign was part of a team effort behind 35% annual revenue growth.</li>
                    </ul>
                    <p class="exp__links">
                      <a class="exp__case" href="case-uniqkey">View case: From Numbers To Decisions <span aria-hidden="true">→</span></a>
            <a class="exp__case" href="case-uniqkey-2">View case: 2FA and Security <span aria-hidden="true">→</span></a>
                    </p>
                  </div>
                </div></div>
              </div>
            </div>
          </li>
          <li class="exp" data-exp>
            <div class="exp__head">
              <div class="exp__title">
                <p class="exp__role" id="exp-justplay-title">UI&#8288;/&#8288;UX Designer · <a class="exp__company" href="https://www.justplayengine.com/" target="_blank" rel="noopener">JustPlay&nbsp;GmbH</a>, Germany</p>
                <p class="exp__dates"><time datetime="2021-04">Apr 2021</time> – <time datetime="2021-11">Nov 2021</time></p>
              </div>
              <button class="exp__toggle" type="button" aria-expanded="false" aria-controls="exp-justplay-panel" aria-label="Show details: UI/UX Designer at JustPlay GmbH"><span class="exp__chev"><svg class="exp__chev-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
              <div class="exp__body">
                <div class="exp__fold exp__fold--summary"><div class="exp__fold-in"><p class="exp__summary">Onboarding, Reward and Withdrawal Flows; design variants for A&#8288;/&#8288;B tests.</p></div></div>
                <div class="exp__fold exp__fold--panel"><div class="exp__fold-in">
                  <div class="exp__panel" id="exp-justplay-panel" role="region" aria-labelledby="exp-justplay-title">
                    <ul class="exp__list" role="list">
                      <li>Designed core flows for a mobile gaming platform: onboarding, tutorials, transactions and withdrawals.</li>
                      <li>Created and tested UI variations for A/B experiments that informed marketing and product decisions.</li>
                      <li>Built reusable UI components and kept the UI kit consistent.</li>
                    </ul>
                  </div>
                </div></div>
              </div>
            </div>
          </li>
          <li class="exp" data-exp>
            <div class="exp__head">
              <div class="exp__title">
                <p class="exp__role" id="exp-lampa-title">UI&#8288;/&#8288;UX &amp; Graphic Designer · <a class="exp__company" href="https://lampa.dev/" target="_blank" rel="noopener">LAMPA</a>, Ukraine</p>
                <p class="exp__dates"><time datetime="2020-02">Feb 2020</time> – <time datetime="2021-04">Apr 2021</time></p>
              </div>
              <button class="exp__toggle" type="button" aria-expanded="false" aria-controls="exp-lampa-panel" aria-label="Show details: UI/UX &amp; Graphic Designer at LAMPA"><span class="exp__chev"><svg class="exp__chev-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
              <div class="exp__body">
                <div class="exp__fold exp__fold--summary"><div class="exp__fold-in"><p class="exp__summary">Web and Mobile Interfaces for Banking, SaaS, Healthcare and E&#8209;Commerce.</p></div></div>
                <div class="exp__fold exp__fold--panel"><div class="exp__fold-in">
                  <div class="exp__panel" id="exp-lampa-panel" role="region" aria-labelledby="exp-lampa-title">
                    <ul class="exp__list" role="list">
                      <li>Designed web and mobile interfaces for banking, SaaS, healthcare and e‑commerce products.</li>
                      <li>Built information architecture and user flows from UX research and usability analysis.</li>
                      <li>Worked with developers to keep implementation accurate and the experience consistent.</li>
                    </ul>
                  </div>
                </div></div>
              </div>
            </div>
          </li>
          <li class="exp" data-exp>
            <div class="exp__head">
              <div class="exp__title">
                <p class="exp__role" id="exp-earlier-title">Early experience · 4 roles</p>
                <p class="exp__dates"><time datetime="2016-04">Apr 2016</time> – <time datetime="2020-07">Jul 2020</time></p>
              </div>
              <button class="exp__toggle" type="button" aria-expanded="false" aria-controls="exp-earlier-panel" aria-label="Show details: Early experience · 4 roles"><span class="exp__chev"><svg class="exp__chev-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
              <div class="exp__body">
                <div class="exp__fold exp__fold--summary"><div class="exp__fold-in"><p class="exp__summary">Alien Eyes, SoftServe, Hochu Rayu and YOHO: UX&#8288;/&#8288;UI, digital product design and retail branding.</p></div></div>
                <div class="exp__fold exp__fold--panel"><div class="exp__fold-in">
                  <div class="exp__panel" id="exp-earlier-panel" role="region" aria-labelledby="exp-earlier-title">
                    <ul class="exp__list" role="list">
                      <li>Designer · Alien Eyes, Ukraine (Jun 2019 – Jul 2020): UX&#8288;/&#8288;UI, Branding and Digital Product Design for Upwork clients.</li>
                      <li>Experience Design Intern · SoftServe, Ukraine (Feb 2019 – Jun 2019): Information Architecture, User Flows and Mobile UI concepts.</li>
                      <li>Graphic Designer · Hochu Rayu, Ukraine (Jan 2017 – Feb 2019): Retail Branding.</li>
                      <li>Junior Graphic Designer · YOHO, Poland (Apr 2016 – Oct 2016): Retail Branding.</li>
                    </ul>
                  </div>
                </div></div>
              </div>
            </div>
          </li>
        </ul>
      `
  );
})();
