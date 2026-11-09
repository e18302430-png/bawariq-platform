# PDPL, Data Transfer and Consumer/E-commerce Compliance for "مناسبتي" (KSA, 2025-2026)

Research note, compiled 2026-11-09. Method caveat: in this session only web *search* worked; direct page fetches of sdaia.gov.sa, dgp.sdaia.gov.sa, clydeco.com, dlapiperdataprotection.com and supabase.com were blocked by the session network. So findings below rest on search-result summaries of law-firm/regulator pages, not on reading the official texts end to end. Article numbers that could not be verified against the official text are flagged. Everything here is regulatory research, not legal advice; items marked "lawyer" need Saudi counsel.

Platform facts assumed: Saudi startup (controller) storing hosts'/clients' and guests' names + phone numbers, vendors' data, chat messages, photos, event details (incl. birthdays/graduations that may involve minors). DB on Supabase eu-central-1 (Frankfurt, AWS); website on Vercel (US company, global CDN).

---

## 1. PDPL basics: dates, regulator, scope, registration, DPO, records

### Takeaway
The PDPL (نظام حماية البيانات الشخصية) has been fully enforceable since 14 Sept 2024 and applies to any processing in KSA, regardless of company size; SDAIA is the regulator. Under the current registration rules, a small events platform is very likely required to register on the National Data Governance Platform because processing personal data is core to its business, and an October 2026 draft would make that explicit and also tie registration to any transfer abroad.

### Cited Findings
- PDPL came into effect 14 Sept 2023, with a one-year grace period, so it has been fully enforceable since 14 Sept 2024. — [Latham & Watkins](https://www.lw.com/admin/upload/SiteAttachments/Saudi-Arabias-data-protection-law-enters-into-force.pdf); [Clyde & Co (Sept 2024)](https://www.clydeco.com/en/insights/2024/09/saudi-arabia-s-personal-data-protection-law-become); [CMS](https://cms.law/en/are/legal-updates/new-sdaia-rules-and-guidelines-published-as-ksa-s-personal-data-protection-framework-is-now-enforceable)
- The Implementing Regulations were issued 7 Sept 2023 and have been fully enforceable since 14 Sept 2024. — [Akin Gump](https://www.akingump.com/en/insights/alerts/saudi-data-and-ai-authority-proposes-amendments-to-implementing-regulations-of-the-pdpl-10-key-proposed-changes)
- The PDPL was amended in 2023 by Royal Decree M/148 (Article 29 transfer regime was reworked by this). — [Saudi Data Transfers: Five Questions (Temairik Law)](https://temairiklaw.sa/en/insights/saudi-personal-data-transfer-overseas/) / search summary; the 2023 amendments also narrowed "sensitive data" (credit and location data removed). — [Clym](https://www.clym.io/regulations/personal-data-protection-law-pdpl-saudi-arabia)
- Regulator: Saudi Data & AI Authority (SDAIA / سدايا), via the National Data Governance Platform (dgp.sdaia.gov.sa). — [SDAIA Rules Governing the National Register of Controllers (PDF)](https://dgp.sdaia.gov.sa/wps/wcm/connect/2b9c4e29-a7a0-4334-9a3a-2b8610483e4e/The+Rules+Governing+the+National+Register+of+Controllers+Within+the+Kingdom.pdf?MOD=AJPERES)
- **Who must register (current rules, Art. 2 of the Register Rules):** (1) public entities; (2) controllers whose *main activity* involves processing personal data; (3) controllers that process sensitive data; (4) individuals processing personal data beyond personal/family use. — [SDAIA Register Rules PDF](https://dgp.sdaia.gov.sa/wps/wcm/connect/2b9c4e29-a7a0-4334-9a3a-2b8610483e4e/The+Rules+Governing+the+National+Register+of+Controllers+Within+the+Kingdom.pdf?MOD=AJPERES); [Morgan Lewis (Dec 2024)](https://www.morganlewis.com/blogs/sourcingatmorganlewis/2024/12/saudi-arabias-personal-data-protection-law-a-guide-to-registering-as-a-data-controller); [Skylight practical guide](https://skylightad.com/en/blog/pdpl-website-app-compliance-saudi/)
- Registration certificate valid 5 years; SDAIA notifies 30 days before expiry. — same sources (search summary of Register Rules)
- **Cost:** one secondary source says registration is online and free of charge. — [Remah Digital](https://remah.tech/en/blog/sdaia-compliance-guide-ksa-startups) (secondary; not confirmed from SDAIA)
- SDAIA added a "Registration of External Entities" service (Oct 2026) for foreign controllers. — [Global Privacy Blog (Oct 2026)](https://www.globalprivacyblog.com/2026/10/open-for-registration-sdaia-adds-controller-registration-for-foreign-entities/)
- **Draft (6 Oct 2026, not in force):** would repeal the Register Rules and move registration into the IRs; mandatory registration where the controller is public, core activities require processing personal data, it processes sensitive data **or data of persons lacking legal capacity**, **or it transfers/discloses personal data outside KSA**. — [Clyde & Co (Oct 2026)](https://www.clydeco.com/en/insights/2026/10/sdaia-publishes-draft-amendments-to-the-pdpl); [Reed Smith](https://www.reedsmith.com/our-insights/blogs/viewpoints/102o5at/sdaia-consults-on-extensive-amendments-to-the-saudi-pdpl-implementing-regulation/)
- **DPO:** SDAIA's Rules for Appointing DPOs require certain controllers to appoint one; commonly cited triggers: public entity, large-scale or regular/systematic monitoring, core activity involving sensitive data. — [DLA Piper Data Protection Laws of the World (SA)](https://www.dlapiperdataprotection.com/?c=SA); [Data Sentinel](https://www.data-sentinel.com/resources/navigating-the-new-frontier-saudi-arabias-personal-data-protection-law-pdpl-and-its-impact-on-businesses)
- **Draft DPO changes (Oct 2026):** DPO rules folded into IRs; appointment must be documented and DPO contact details lodged on the SDAIA platform immediately; a trigger is added for processing data of minors/persons with partial or no capacity "no longer necessarily on a large scale". — [Akin Gump](https://www.akingump.com/en/insights/alerts/saudi-data-and-ai-authority-proposes-amendments-to-implementing-regulations-of-the-pdpl-10-key-proposed-changes); [Reed Smith](https://www.reedsmith.com/our-insights/blogs/viewpoints/102o5at/sdaia-consults-on-extensive-amendments-to-the-saudi-pdpl-implementing-regulation/)
- **Records of processing (سجل أنشطة المعالجة):** controller must keep a record; retained for 5 years after processing ends (per a secondary guide). — [Datasec](https://datasec.sa/en/compliance/pdpl)

### Inferences
- Size does not exempt the startup: the PDPL has no SME carve-out (none found in any source). For "مناسبتي", processing guest/host/vendor data *is* the product, so "main activity involves processing personal data" most likely applies → register on DGP now (interpretation; confirm with SDAIA/lawyer). Under the Oct 2026 draft, the Frankfurt hosting alone (transfer outside KSA) and minors' data would independently trigger registration.
- DPO: under current rules a small platform may fall below the "large scale/systematic" threshold, but if the draft passes, routine processing of minors' data (birthday/graduation guests) could trigger a DPO. Practical step: name an internal privacy lead now; formal DPO decision = lawyer.

### Gaps
- Exact current DPO thresholds (text of the DPO Appointment Rules) not read directly.
- Official confirmation that DGP registration is free.
- Whether/when the Oct 2026 draft is adopted (consultation closed 5 Nov 2026; enters into force 60 days after Gazette publication per [Azizme](https://azizme.com/en/blog/saudi-pdpl-draft-store-data-in-kingdom)).

---

## 2. Lawful basis, consent, privacy notice, data subject rights, retention, marketing

### Takeaway
Consent remains the primary basis in KSA, with legitimate interest available (for non-sensitive data) since the 2023 amendments; direct marketing always needs prior consent, with an opt-out as easy as the opt-in. Data subject requests must be answered within 30 days (extendable once in limited cases), and a privacy policy must be published before collection.

### Cited Findings
- Direct marketing requires prior consent; on withdrawal the controller must stop sending marketing without undue delay; the opt-out procedure must be as simple as giving consent (current IRs). — [Akin Gump (2023 IR overview)](https://www.akingump.com/en/insights/alerts/kingdom-of-saudi-arabias-new-personal-data-protection-law-and-implementing-regulations-key-obligations-responsibilities-and-rights); [SDAIA IR PDF](https://sdaia.gov.sa/en/SDAIA/about/Documents/ImplementingRegulationPersonalDataProtectionLaw.pdf)
- Draft (Oct 2026): replaces "direct marketing" with "marketing purposes"; on withdrawal the controller must also **destroy** the resulting data; consent would be needed for promotional/awareness messages in all circumstances, not only where there is no prior interaction. — [Akin Gump](https://www.akingump.com/en/insights/alerts/saudi-data-and-ai-authority-proposes-amendments-to-implementing-regulations-of-the-pdpl-10-key-proposed-changes); [Reed Smith](https://www.reedsmith.com/our-insights/blogs/viewpoints/102o5at/sdaia-consults-on-extensive-amendments-to-the-saudi-pdpl-implementing-regulation/)
- Data subject requests: respond within **30 days**; extendable by up to 30 more days where the request needs disproportionate effort or there are multiple requests, provided the data subject is told in advance with reasons. TermsFeed attributes the 30-day rule to IR Art. 3. — [Datasec](https://datasec.sa/en/compliance/pdpl); [TermsFeed](https://www.termsfeed.com/blog/saudi-arabia-personal-data-protection-law-pdpl/)
- Rights under the PDPL: to be informed, access, obtain a copy, correction, destruction, withdraw consent. — [Clyde & Co (Sept 2024)](https://www.clydeco.com/en/insights/2024/09/saudi-arabia-s-personal-data-protection-law-become); [PwC PDPL series](https://www.pwc.com/m1/en/blogs/pdf/ksa-personal-data-protection-law-series-part-1.pdf)
- Destruction on request/withdrawal must cover all copies including backups, and recipients must be asked to destroy too. — [Clyde & Co (Sept 2024)](https://www.clydeco.com/en/insights/2024/09/saudi-arabia-s-personal-data-protection-law-become)
- Privacy policy (PDPL Art. 12, per TermsFeed — article number unverified) must be available before collection and cover: purpose, data collected, processing/storage/destruction methods, data subject rights and how to exercise them; retention periods should be stated. — [TermsFeed](https://www.termsfeed.com/blog/saudi-arabia-personal-data-protection-law-pdpl/); [DPO Consulting](https://www.dpo-consulting.com/blog/what-is-pdpl)
- Controller-to-processor relationships require a contract and choosing processors with sufficient guarantees (applies to Supabase, Vercel, WhatsApp BSP, SMS gateway). — [Clyde & Co (Sept 2024)](https://www.clydeco.com/en/insights/2024/09/saudi-arabia-s-personal-data-protection-law-become)

### Inferences
- Practical consent wording: separate, unticked checkboxes in Arabic (and English) for (a) Terms + Privacy Policy, (b) marketing via WhatsApp/SMS/email; record time, version, channel. Do not bundle marketing into service consent.
- Transactional messages (event invitation, RSVP, reminder) are service delivery, not marketing; marketing the platform to guests is marketing and needs the guest's own consent.
- Photos: ordinary photos are not "sensitive data" per se under PDPL definitions (sensitive = racial/ethnic origin, religious/political belief, criminal, biometric/genetic, health, data revealing parents unknown); but facial recognition/biometric processing would be sensitive (interpretation, standard reading of PDPL Art. 1 definitions; not re-verified).
- Retention: define a schedule (e.g., chats/photos deleted X months after event; invoices kept per accounting/ZATCA rules) and publish it in the privacy policy.

### Gaps
- The exact current consent formalities (IR articles on consent conditions and explicit consent for sensitive data) were not read in the official text.
- Whether legitimate interest can justify guest invitation processing — not addressed by sources found; lawyer.

---

## 3. Cross-border transfer: Frankfurt (Supabase), Vercel, and Saudi hosting options

### Takeaway
Storing KSA personal data in Frankfurt is currently *permitted but conditional*: there is **no published SDAIA adequacy list (so no EU adequacy decision)**, so the platform must rely on an Article 4 safeguard (SDAIA SCCs, binding common rules, or certification) or an exemption, and do a documented transfer risk assessment. The Oct 2026 draft would make in-Kingdom storage the default, which makes migrating to a Saudi region the lower-risk path.

### Cited Findings
- Transfer Regulation published Sept 2023, effective 14 Sept 2024; Version 2.0 Aug 2024. — [PwC PDPL Part 3](https://pwc.com/m1/en/media-centre/2024/documents/PDPL-Part-3-EN-2nd-Edition.pdf); [regulations.ai](https://regulations.ai/regulations/RAI-SA-NA-PDTOKXX-2024); [Recording Law](https://www.recordinglaw.com/world-laws/world-data-privacy-laws/saudi-arabia-data-privacy-laws/data-transfers-and-localization/)
- PDPL Art. 29 (as amended by M/148): transfer allowed for listed purposes (e.g., performing an obligation under an agreement to which the data subject is party, serving data subject interests) subject to conditions: no harm to national security/vital interests, adequate level of protection, minimum necessary data. — [Securiti](https://securiti.ai/saudi-arabia-personal-data-protection-law/); [DLA Piper insight (Feb 2024)](https://www.dlapiper.com/en/insights/publications/2024/02/saudi-arabias-new-personal-data-protection-law-in-force); [King & Spalding](https://www.kslaw.com/insights/articles/international-personal-data-transfers-under-saudi-arabias-data-protection-law)
- **Adequacy list:** SDAIA must publish one under Art. 3 of the Transfer Regulation, but none has been published; in practice every transfer needs a mechanism plus a TIA. — [Kennedys (2026)](https://www.kennedyslaw.com/en/thought-leadership/article/2026/gdpr-vs-saudi-pdpl-convergence-divergence-and-practical-lessons/); [governancedocs](https://governancedocs.com/saudi-pdpl/); [e-cens](https://e-cens.com/blog/saudi-personal-data-protection-law-pdpl-compliance-guide/)
- **Appropriate safeguards (Transfer Reg. Art. 4):** (a) Standard Contractual Clauses, (b) Binding Common Rules (BCRs), (c) certificate of accreditation; using them exempts the controller from the adequacy and minimum-data conditions; if safeguards fail, the exemption is lost. — [Recording Law](https://www.recordinglaw.com/world-laws/world-data-privacy-laws/saudi-arabia-data-privacy-laws/data-transfers-and-localization/); [saudiprivacylaw.com](https://saudiprivacylaw.com/blog/pdpl-international-data-transfers-cross-border-compliance/); [Temairik Law](https://temairiklaw.sa/en/insights/saudi-personal-data-transfer-overseas/)
- **SDAIA SCCs** published Sept 2024 (v1.0), four modules: C2P, C2C, P2C, P2P; cannot be used where the importer's local law prevents compliance. — [SDAIA SCC PDF](https://sdaia.gov.sa/Documents/StandardContractualClausesForPersonalDataTransferEN.pdf); [Mayer Brown (Oct 2024)](https://www.mayerbrown.com/en/insights/publications/2024/10/updates-to-saudi-arabias-personal-data-protection-regulations-sccs-guidelines-and-more)
- Other exemptions from the adequacy requirement include transfers needed to perform an agreement the data subject is party to, and vital interests of an unreachable data subject; such transfers are still subject to controls (minimum necessary data, no national-security harm). — [DLA Piper insight](https://www.dlapiper.com/en/insights/publications/2024/02/saudi-arabias-new-personal-data-protection-law-in-force); [Tsaaro](https://tsaaro.com/newsletter/navigating-saudi-arabia%E2%80%99s-cross-border-data-transfer-regulations)
- **Risk assessment is mandatory** before transfers relying on Art. 4 safeguards/exemptions and before continuous or large-scale transfers of sensitive data; SDAIA's Risk Assessment Guideline (Feb 2025) sets a four-phase approach. — [oai.sa](https://oai.sa/blog/data-residency-in-saudi-arabia); [saudiprivacylaw.com](https://saudiprivacylaw.com/blog/pdpl-international-data-transfers-cross-border-compliance/)
- Penalty for transfer breaches: the 2023 amendments removed custodial penalties (earlier text: up to 1 year/SAR 1M). — [Clym](https://www.clym.io/regulations/personal-data-protection-law-pdpl-saudi-arabia) (conflicting secondary statements noted)
- **Draft (6 Oct 2026):** new IR Art. 23(2) — controllers must store personal data within KSA; transfers abroad remain possible under PDPL rules; transfer-related registration duties expanded. Consultation closed 5 Nov 2026; would enter into force 60 days after Gazette publication; no evidence of adoption yet. — [Clyde & Co](https://www.clydeco.com/en/insights/2026/10/sdaia-publishes-draft-amendments-to-the-pdpl); [Bird & Bird](https://www.twobirds.com/en/insights/2026/japan/saudi-arabia-sdaia-returns-with-a-revised-draft-of-changes-to-the-data-protection-regulations); [Azizme](https://azizme.com/en/blog/saudi-pdpl-draft-store-data-in-kingdom); [Webify](https://www.webify.ai/news/saudi-pdpl-data-residency-draft-ai). Bird & Bird says this is a revised draft following an April 2025 draft that was not finalised ([Dentons May 2025](https://www.dentons.com/en/insights/alerts/2025/may/5/proposed-amendments-to-the-ksas-implementing-regulations-of-the-personal-data-protection-law)).
- **Saudi cloud regions:**
  - AWS Saudi region: announced March 2024 (US$5.3bn), confirmed for launch **December 2026**, 3 AZs. — [About Amazon](https://www.aboutamazon.com/news/aws/aws-cloud-region-saudi-arabia); [W.Media](https://w.media/aws-saudi-arabia-cloud-region-set-for-december-2026-launch/); [Channel Insider](https://www.channelinsider.com/infrastructure/news-aws-cloud-region-launch-emea-saudi-arabia/)
  - Google Cloud Dammam (me-central2): live (since ~Nov 2023), sold via partner CNTXT. — [getdeploying](https://getdeploying.com/datacenters-in-saudi-arabia); [SatellitePro ME](https://satelliteprome.com/news/google-cloud-launches-new-cloud-region-in-dammam/)
  - Oracle: Jeddah (me-jeddah-1) live since Feb 2020; Riyadh (me-riyadh-1) live 31 July 2024; NEOM announced. — [getdeploying](https://getdeploying.com/datacenters-in-saudi-arabia); [DCD](https://direct.datacenterdynamics.com/en/news/oracle-announces-plans-for-third-saudi-arabia-cloud-region/)
  - Microsoft Azure Saudi Arabia East: announced, target Q4 2026, not live per a July 2026 source. — [getdeploying](https://getdeploying.com/datacenters-in-saudi-arabia)
  - Huawei Cloud, Alibaba Cloud (JV), Tencent Cloud (Feb 2025) have Riyadh/Saudi regions. — [getdeploying](https://getdeploying.com/datacenters-in-saudi-arabia)
- **Supabase:** no Middle East region found in search results; listed regions include EU (Frankfurt, Paris, etc.) and ap-south-1 Mumbai. — [Supabase regions docs](https://supabase.com/docs/guides/platform/regions); [supabase.com/regions](https://supabase.com/regions)
- CST may require cloud service providers to report security incidents (sector rule). — [DLA Piper DPLW](https://www.dlapiperdataprotection.com/?c=SA)

### Inferences
- Frankfurt today: lawful if you (1) sign SDAIA SCCs (controller-to-processor module) with Supabase, or argue the "contract performance" exemption, (2) complete and document a transfer risk assessment, (3) minimise data sent, (4) disclose the transfer and destination in the privacy policy, (5) register on DGP. Supabase's standard DPA is EU-GDPR-based, not SDAIA SCCs — getting Supabase to sign SDAIA SCCs is uncertain for a small customer (gap; lawyer). GDPR-grade protection in Germany helps the risk assessment but is not a formal adequacy finding.
- Vercel: if Vercel only serves static assets and the app calls Supabase directly, personal data still transits Vercel's serverless/edge functions and logs (US company → US CLOUD Act exposure). Treat Vercel as a processor receiving a transfer: minimise PII in logs, pin serverless functions to a nearby region, include in the TIA.
- Migration options if the draft localization rule is adopted: (a) self-host Supabase (open source) or plain Postgres on Google Cloud Dammam / Oracle Riyadh-Jeddah / AWS Saudi region from Dec 2026; (b) Saudi providers (e.g., STC Cloud, not researched here). Plan migration for 2027; architecture should keep a clean data layer to enable it.
- Hosting abroad also expands what has to be reported if there is a breach, and the draft explicitly ties transfers to mandatory registration.

### Gaps
- Exact Article 5/6 text of the Transfer Regulation (exemption scope, loss of exemption) not read.
- Whether "storage on a foreign cloud" by a KSA controller is treated by SDAIA as a "transfer" — commentators assume yes; no SDAIA guidance quoted.
- STC Cloud / other Saudi-native hosting and their pricing — not researched.
- Supabase willingness to sign SDAIA SCCs — unknown.

---

## 4. Breach notification (PDPL and E-commerce)

### Takeaway
Under the PDPL IRs, notify SDAIA within 72 hours of becoming aware of a breach that may harm data subjects, and notify affected individuals without undue delay; separately, the E-commerce Implementing Regulations require notifying the Ministry of Commerce and affected consumers within 3 days. Plan for the stricter of both.

### Cited Findings
- SDAIA notification within 72 hours of becoming aware (where notification is required, i.e., incident may cause harm); data subjects without undue delay. — [DLA Piper DPLW](https://www.dlapiperdataprotection.com/?c=SA). Some secondary sources say 72 hours also applies to individuals — [GoTrust](https://www.gotrust.tech/ksa) (conflict; DLA Piper preferred).
- Draft (Oct 2026) Art. 24 would require 72-hour notification without the current harm threshold. — [OpsIntel](https://www.opsintel.io/blog/saudi-arabia-proposes-in-kingdom-data-storage-and-a-72-hour-breach-rule/)
- E-commerce IRs: service provider must inform the Ministry of Commerce (per its procedure) and the affected consumer within **three days** of learning of a breach; intermediary platforms too, explaining scope, effects and remedial steps. — [Digital Policy Alert](https://digitalpolicyalert.org/event/13428-implemented-implementing-regulations-of-e-commerce-law-including-data-protection-regulation); [Securiti ECL](https://securiti.ai/solutions/saudi-arabia-e-commerce-law/); [Mondaq](https://www.mondaq.com/saudiarabia/new-technology/936424/call-to-action-the-new-executive-regulations-of-the-saudi-e-commerce-law)

### Inferences
- Build an incident runbook: detect → assess → SDAIA notification via DGP within 72h → MoC + affected users within 3 days → log every incident. Supabase/Vercel DPAs must commit to prompt notification to you (e.g., ≤24-48h) to make these deadlines feasible.

### Gaps
- Exact article of the E-commerce IRs (believed to be in the data-protection article) not verified in Arabic official text.

---

## 5. Penalties

### Takeaway
Administrative fines up to SAR 5M per violation (doubling for repeat), and for disclosing sensitive data with intent to harm/gain: up to 2 years' prison and/or SAR 3M.

### Cited Findings
- Disclosure/publication of sensitive data in violation of PDPL with intent to harm or for personal benefit: up to 2 years' imprisonment and/or up to SAR 3M fine. — [Clym](https://www.clym.io/regulations/personal-data-protection-law-pdpl-saudi-arabia); [CMS expert guide](https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/saudi-arabia)
- Other violations: warning or fine up to SAR 5M; may be doubled for repetition. — [Clym](https://www.clym.io/regulations/personal-data-protection-law-pdpl-saudi-arabia); [Latham](https://www.lw.com/admin/upload/SiteAttachments/Saudi-Arabias-data-protection-law-enters-into-force.pdf). (A "SAR 10M" figure in one vendor blog is just the doubled maximum — [securityscientist](https://answers.securityscientist.net/q/25328/what-penalties-and-sanctions-does-the-pdpl-impose).)
- Courts may also order confiscation and publication of the judgment (commonly reported; not re-verified). — gap
- Custodial penalty for unlawful transfer removed by 2023 amendments. — [Clym](https://www.clym.io/regulations/personal-data-protection-law-pdpl-saudi-arabia)

### Gaps
- Article numbers (35/36 in commonly cited numbering) not verified against official text.
- E-commerce Law penalties: up to SAR 1M fine and possible suspension/blocking (reported) — [Gulf News](https://gulfnews.com/business/retail/saudi-arabia-tightens-up-ecommerce-law-with-stiff-penalties-1.73327592) (headline only; amount not verified in this session).

---

## 6. Children's data

### Takeaway
No standalone Saudi children's privacy regime was found; the PDPL/IRs treat data of persons lacking full legal capacity via their guardian (consent by legal guardian), and the Oct 2026 draft adds minors' data as a DPO and registration trigger.

### Cited Findings
- Draft (Oct 2026): DPO trigger for processing personal data of minors or persons with partial/no legal capacity, without needing large scale; registration trigger for the same. — [Akin Gump](https://www.akingump.com/en/insights/alerts/saudi-data-and-ai-authority-proposes-amendments-to-implementing-regulations-of-the-pdpl-10-key-proposed-changes); [Clyde & Co](https://www.clydeco.com/en/insights/2026/10/sdaia-publishes-draft-amendments-to-the-pdpl)

### Inferences
- Treat the host (parent) as consenting guardian for a child's name/photo on a birthday page; avoid collecting children's phone numbers; default event photo galleries to private/invite-only.

### Gaps
- Current IR article on guardian consent for those lacking capacity, and the age threshold (18 is general age of majority) — not verified this session. Lawyer.

---

## 7. Guests' phone numbers uploaded by the host (third-party data)

### Takeaway
No Saudi-specific guidance found; this is interpretation. The platform should contractually make the host responsible for having a basis to share guests' numbers, use the numbers only to deliver that host's invitation, and give guests a notice and opt-out at first contact.

### Cited Findings
- Where data is collected from a source other than the data subject, PDPL generally allows it in limited cases (e.g., consent, publicly available, or where collecting directly is not possible) and requires informing the data subject — standard reading of PDPL Art. 10 and 12/13; secondary: [PwC PDPL series](https://www.pwc.com/m1/en/blogs/pdf/ksa-personal-data-protection-law-series-part-1.pdf) (not re-verified).
- Marketing to anyone requires prior consent. — [Akin Gump](https://www.akingump.com/en/insights/alerts/kingdom-of-saudi-arabias-new-personal-data-protection-law-and-implementing-regulations-key-obligations-responsibilities-and-rights)

### Inferences
- Host terms: "you confirm you are entitled to share guests' contacts for the purpose of this invitation." First WhatsApp/SMS to a guest: identify platform + host, link to privacy notice, "stop" option. No reuse of guest numbers for platform marketing without the guest's own opt-in. Delete guest lists after the event + defined period. Whether the platform is controller or processor for guest lists (likely joint/controller since it sends messages and may analyse) — lawyer.

### Gaps
- No SDAIA guidance found on host-uploaded contact lists.

---

## 8. E-commerce Law, consumer rights, cancellation and refunds

### Takeaway
The E-commerce Law (in force Oct 2019; IRs from 2020) grants a 7-day cancellation right but excludes, among others, custom-made goods and transportation/catering services; IRs add exceptions (including, reportedly, services with a set date/time). Event deposits and cancellations are governed mainly by the contract terms disclosed before booking; no specific Ministry of Commerce rule on wedding-hall cancellation was found.

### Cited Findings
- E-commerce Law in force 9 Oct 2019; IRs effective ~31 Jan 2020. — [CMS](https://cms.law/en/sau/legal-updates/saudi-arabia-implements-its-new-e-commerce-law); [Digital Policy Alert](https://digitalpolicyalert.org/event/13427-implemented-implementing-regulations-of-e-commerce-law-including-consumer-protection-regulation)
- Art. 13: consumer may rescind within 7 days of receiving the product or concluding the service contract, if not used/benefited; exceptions: newspapers/magazines, downloaded software, CDs/DVDs, made-to-specification products, transportation and catering services; IR Art. 11 adds further exceptions. — [Maalawsa](https://maalawsa.com/en/saudi-arabia-e-commerce-law/); [Saudipedia](https://saudipedia.com/en/e-commerce-law-in-saudi-arabia); [Almustashar](https://almustashar.io/en/blog/consumer-protection-saudi-arabia-rights-e-commerce)
- Art. 14: consumer may terminate if delivery is delayed >15 days past contract/agreed date (unless agreed otherwise; force majeure excluded), with refund + delay costs. — [Maalawsa](https://maalawsa.com/en/saudi-arabia-e-commerce-law/)
- Required disclosures (Arts. 6-8, reported): provider identity, CR/registration number, contact address; main characteristics, total price incl. fees/taxes, payment, delivery, cancellation terms; contract summary/invoice. — [CMS](https://cms.law/en/sau/legal-updates/saudi-arabia-implements-its-new-e-commerce-law); [Global Compliance News](https://www.globalcompliancenews.com/2020/03/16/saudi-arabia-regulates-e-commerce/) (article mapping not re-verified)
- Wedding halls: no MoC regulation found for customer-initiated cancellation; practice varies (non-refundable deposit to 50% deduction ~6 months prior); the contract governs; MoC ordered refunds only for the 2020 COVID event-suspension; complaints via 1900 / "Balagh Tijari" app. — [Al Watan](https://www.alwatan.com.sa/article/1186303); [Sabq](https://sabq.org/article/ORRnTs2); [Saudi Counsel (Jan 2026)](https://saudicounsel.com/2026/01/16/%D9%87%D9%84-%D9%8A%D8%AD%D9%82-%D9%84%D9%84%D9%85%D8%B4%D8%AA%D8%B1%D9%8A-%D8%A7%D8%B3%D8%AA%D8%B1%D8%AC%D8%A7%D8%B9-%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%88%D9%86/)

### Inferences
- Platform terms must disclose, before payment and in Arabic: platform identity + CR number + contact; whether the platform is merchant or intermediary for vendor services; full price breakdown incl. VAT and fees; deposit amount and whether refundable; tiered cancellation schedule; vendor no-show/delay remedy (refund); refund timeline and method; complaint channel. Show explicit acceptance before payment.
- Dated event services likely fall within IR exceptions to the 7-day right, but only if clearly disclosed; safest: honour 7-day cancellation for bookings made far ahead of the event date. Lawyer to confirm IR Art. 11 list.
- Intermediary-platform obligations (vendors' identity disclosure, complaint handling) apply to marketplace models.

### Gaps
- Full text of IR Art. 11 exceptions; any statutory refund timeline (none confirmed); MoC Consumer Protection rules specific to events.

---

## 9. Anti-spam (CST) and WhatsApp marketing

### Takeaway
CST's Regulations for Curbing Spam Messages and Calls (Decision 493/1444, 17 Oct 2022) govern SMS/calls via licensed providers: registered sender IDs ("-AD" for promotional), prior opt-in, easy opt-out, quiet hours. WhatsApp is governed by PDPL consent plus Meta's opt-in policy.

### Cited Findings
- CST anti-spam regulations approved by Decision 493/1444, 17 Oct 2022; primarily for SMS/calls through licensed providers; one source says not binding on WhatsApp. — [QuickWA](https://quickwa.com/blog/whatsapp-marketing-rules-saudi-arabia); [Voctos](https://voctos.net/saudi-pdpl-marketing-compliance/)
- Sender ID registration mandatory for A2P SMS; promotional IDs carry "-AD"; unregistered IDs may be blocked by STC/Mobily/Zain; registration may take long. — [sent.dm](https://www.sent.dm/resources/sms-compliance/sa-sms-guidance); [Taqnyat compliance PDF](https://taqnyat.sa/assets/download/compliance-en.pdf); [D7 Networks](https://d7networks.com/sms/saudi-arabia/sms-regulations/)
- Opt-in for promotional SMS; opt-out honoured within 24h; quiet hours reported as 10pm-9am (some say 8pm-8am — conflict); possible cap of one promo per day. — [sent.dm](https://www.sent.dm/resources/sms-compliance/sa-sms-guidance); [Broadnet](https://www.broadnet.me/regulations)
- WhatsApp: no sender-ID regime; PDPL consent and Meta opt-in policies apply. — [QuickWA](https://quickwa.com/blog/whatsapp-marketing-rules-saudi-arabia); [Nxtaa](https://nxtaa.com/blog/whatsapp-business-messaging-saudi-arabia)

### Inferences
- Use a licensed Saudi SMS aggregator with registered sender ID; use WhatsApp Business API via a BSP with approved templates; keep transactional (invitation/RSVP/OTP) separate from promotional; log consents.

### Gaps
- Official CST text not read; quiet hours and caps conflict across vendor sources.

---

## Practical checklist (synthesised; items marked * = interpretation / confirm with lawyer)
1. Register on DGP as controller* (free per secondary source); re-check after the Oct 2026 draft is finalised.
2. Appoint privacy lead; formal DPO if thresholds met* (likely needed under draft for minors' data).
3. Records of processing (keep 5 years after processing ends).
4. Arabic privacy policy before collection: purposes, data types, recipients (Supabase/Vercel/WhatsApp/SMS), foreign storage location (Germany/US), retention, rights + 30-day response, contact.
5. Separate consents: terms/privacy vs marketing; easy opt-out; consent log.
6. Host warranty for guest lists; notice + opt-out in first guest message; no marketing to guests without own consent.
7. Children: guardian (host) consent; minimal data; private galleries.
8. Transfers: SDAIA SCCs with Supabase/Vercel (or documented exemption)*, documented transfer risk assessment, data minimisation; plan migration to a Saudi region (GCP Dammam / Oracle / AWS Saudi from Dec 2026) in case in-Kingdom storage becomes mandatory.
9. Security + breach runbook: SDAIA 72h, MoC + users 3 days.
10. DSR workflow: access/copy/correct/delete incl. backups, within 30 days.
11. Retention schedule & auto-deletion for chats/photos/guest lists.
12. E-commerce: CR number + contact on site, full price/VAT, deposit & cancellation schedule, 7-day right and its exceptions disclosed, vendor delay refund, complaints channel; Arabic T&Cs accepted before payment.
13. SMS via licensed aggregator with registered "-AD" sender ID; WhatsApp via BSP templates.
14. Lawyer review: controller vs processor for guest lists; SCC execution with US/EU vendors; IR Art. 11 cancellation exceptions; final text of Oct 2026 amendments.
