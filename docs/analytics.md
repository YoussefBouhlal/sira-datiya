# Deployment analytics

## GitHub configuration

In the repository, open **Settings > Secrets and variables > Actions > Variables**.
Add a repository variable named `VITE_GA_MEASUREMENT_ID` containing your public
GA4 web-stream Measurement ID, for example `G-XXXXXXXXXX`. Do not enter a script,
an API secret, or a private credential.

The existing `PAGES_DEPLOY_ENABLED=true` requirement still applies. Only publishing
pushes to the default branch pass the ID into the production build. Pull requests,
other branches, ordinary local builds, and development do not load Analytics.
The ID is public in the generated JavaScript in `dist/`; it is not a runtime server
setting. Push an approved change or re-run an eligible workflow after changing it.

An absent, blank, or malformed ID disables loading. To disable an existing deployed
integration, remove the repository variable and rebuild/redeploy. Removing the
variable alone does not modify the live site.

## Google configuration

Before enabling the variable, open the GA4 property's **Admin > Data streams**,
select the web stream, and turn **Enhanced measurement** off. Do not attach extra
tags or enable user-provided data collection for this app. These property-side
settings cannot be enforced by the application.

The app loads the Google tag immediately without an opt-in prompt. It queues a
single visit configuration per page load, disables Google Signals and advertising
personalization, and sends a fixed page title and the current origin/path without
query strings, fragments, or referrer information. It supplies no CV contents,
user IDs, or custom editor events. GA4 still collects its built-in session and
engagement data and receives request metadata; this is not anonymous or zero-data
collection. No application code can guarantee that a third-party script never
inspects the page. This implementation assumes a trusted GA property configuration.

On November 27, 2026, the owner chose to retain the existing immediate loading
without adding an opt-in prompt. The README and in-app CV storage dialog no
longer claim there is no analytics. Their wording describes CV storage and is
not a complete website privacy disclosure. On November 28, 2026, dedicated
technical privacy pages were implemented at `/en/privacy/`, `/fr/privacy/`, and
`/ar/privacy/`, with links from public pages, the builder workspace, and its CV
storage dialog. Builder links flush pending edits and block leaving on save
failure. The privacy pages contain no client scripts or storage access.

The disclosure explains immediate analytics loading without opt-in, possible
cookies and technical/session collection, sanitized application configuration,
and the limits of third-party isolation. It does not invent operator identity,
contact information, hosting-log practices, or provider retention periods. The
owner must supply those details and verify the live Google property and hosting
behavior before treating the page as a complete privacy notice. No legal
compliance claim is made and no analytics or consent behavior was changed.

Google's collection documentation is at
<https://support.google.com/analytics/answer/11593727> and
<https://support.google.com/analytics/answer/6004245>.

## Validation

Unit tests cover disabled loading, invalid IDs, single initialization, and sanitized
configuration. Browser tests stub the exact configured Google script with an empty
response and block other external HTTPS requests, so tests do not contact Google.
They validate configuration, not Google's actual collection or dashboard ingestion.
CI tests and uploads the same production build.

For a local enabled-build check, run the build and browser tests with the same
`PAGES_PUBLISH=true`, `VITE_GA_MEASUREMENT_ID=G-TEST123`, and `VITE_BASE_PATH` values.
Do not open that build outside the stubbed tests unless you intend to load Google.
