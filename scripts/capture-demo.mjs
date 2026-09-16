/**
 * Screenshot every screen in the demo environment.
 *
 *   pnpm demo:shots                       # against http://localhost:3000
 *   BASE_URL=http://localhost:3111 pnpm demo:shots
 *   SHOTS_MOBILE=1 pnpm demo:shots        # also capture a 390px pass
 *
 * Output goes to demo-screenshots/, numbered so it sorts in walkthrough order,
 * plus an index.html contact sheet.
 *
 * The dev server must already be running — this script does not start one.
 */

import { chromium } from 'playwright'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const OUT_DIR = path.resolve('demo-screenshots')
const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 390, height: 844 }

/**
 * Each shot is a route plus optional setup. `settle` is extra wait after the
 * network goes quiet, for content that renders client-side from fixtures.
 * `before` runs in the page to set something up (click, scroll) first.
 */
const SHOTS = [
  {
    name: 'landing',
    title: 'Landing page',
    url: '/',
  },
  {
    name: 'demo-intro-start',
    title: 'Demo intro — analysis begins',
    url: '/demo',
    settle: 1500,
    // The intro auto-advances to the dashboard, so these frames are timed.
    noWaitForIdle: true,
  },
  {
    name: 'demo-intro-midway',
    title: 'Demo intro — extracting terms',
    url: '/demo',
    settle: 6500,
    noWaitForIdle: true,
  },
  {
    name: 'demo-intro-complete',
    title: 'Demo intro — analysis complete',
    url: '/demo',
    settle: 11500,
    noWaitForIdle: true,
  },
  {
    name: 'dashboard',
    title: 'Dashboard',
    url: '/demo/dashboard',
  },
  {
    name: 'projects',
    title: 'Projects',
    url: '/demo/projects',
  },
  {
    name: 'upload-idle',
    title: 'Contract upload',
    url: '/demo/projects/prj-northgate-medical/upload',
  },
  {
    name: 'upload-analyzing',
    title: 'Contract upload — AI extraction running',
    url: '/demo/projects/prj-northgate-medical/upload',
    async before(page) {
      // Wait for hydration before clicking — the button is in the server HTML
      // but its handler is not attached yet, so an early click does nothing.
      const button = page.getByRole('button', { name: /use a sample contract/i })
      await button.waitFor({ state: 'visible' })
      await page.waitForTimeout(1200)
      await button.click()
      // Confirm the simulator actually took over before we wait it out.
      await page.getByText(/analyzing contract/i).waitFor({ timeout: 10_000 })
      await page.waitForTimeout(4500)
    },
  },
  {
    name: 'pay-applications',
    title: 'Pay applications',
    url: '/demo/pay-applications',
  },
  {
    name: 'pay-app-finalized',
    title: 'Pay application detail — finalized',
    url: '/demo/pay-applications/history/pa-northgate-009',
  },
  {
    name: 'pay-app-corrected-draft',
    title: 'Pay application detail — corrected draft',
    url: '/demo/pay-applications/history/pa-harbor-006',
  },
  {
    name: 'pay-app-draft',
    title: 'Pay application detail — draft',
    url: '/demo/pay-applications/history/pa-westfield-005',
  },
  {
    name: 'not-built-placeholder',
    title: 'Placeholder for screens not yet in the demo',
    url: '/demo/compliance',
  },
]

async function capture(browser, shot, viewport, suffix, index) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2, // retina-quality output
  })
  const page = await context.newPage()

  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  try {
    await page.goto(`${BASE_URL}${shot.url}`, {
      waitUntil: shot.noWaitForIdle ? 'domcontentloaded' : 'networkidle',
      timeout: 60_000,
    })

    if (shot.before) await shot.before(page)
    if (shot.settle) await page.waitForTimeout(shot.settle)
    else await page.waitForTimeout(800)

    const file = path.join(
      OUT_DIR,
      `${String(index).padStart(2, '0')}-${shot.name}${suffix}.png`,
    )
    await page.screenshot({ path: file, fullPage: true })

    return { ok: true, file: path.basename(file), errors }
  } catch (err) {
    return { ok: false, file: null, errors: [...errors, err.message] }
  } finally {
    await context.close()
  }
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  // Fail fast with a clear message rather than 13 confusing timeouts.
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`status ${res.status}`)
  } catch (err) {
    console.error(`\nCannot reach ${BASE_URL} — is the dev server running?`)
    console.error(`  ${err.message}\n`)
    process.exit(1)
  }

  const browser = await chromium.launch()
  const results = []

  const passes = [{ viewport: DESKTOP, suffix: '' }]
  if (process.env.SHOTS_MOBILE) passes.push({ viewport: MOBILE, suffix: '-mobile' })

  for (const pass of passes) {
    console.log(`\n${pass.viewport.width}x${pass.viewport.height}`)
    for (const [i, shot] of SHOTS.entries()) {
      const r = await capture(browser, shot, pass.viewport, pass.suffix, i + 1)
      results.push({ ...shot, ...r, suffix: pass.suffix })
      const mark = r.ok ? '✓' : '✗'
      console.log(`  ${mark} ${shot.title}${r.errors.length ? `  (${r.errors.length} page error(s))` : ''}`)
      if (!r.ok) console.log(`      ${r.errors.join('; ')}`)
    }
  }

  await browser.close()

  // Contact sheet
  const cards = results
    .filter((r) => r.ok)
    .map(
      (r) => `    <figure>
      <img src="${r.file}" alt="${r.title}" loading="lazy">
      <figcaption><strong>${r.title}</strong><br><code>${r.url}</code></figcaption>
    </figure>`,
    )
    .join('\n')

  await writeFile(
    path.join(OUT_DIR, 'index.html'),
    `<!doctype html>
<meta charset="utf-8">
<title>PaySimple demo screens</title>
<style>
  body { margin:0; padding:32px; background:#f6f7f9; font:14px/1.5 system-ui, sans-serif; color:#1e293b }
  h1 { font-size:20px; margin:0 0 4px }
  p.sub { color:#64748b; margin:0 0 28px }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(460px,1fr)); gap:24px }
  figure { margin:0; background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden }
  img { display:block; width:100%; height:auto; border-bottom:1px solid #e2e8f0 }
  figcaption { padding:12px 14px; font-size:13px }
  code { color:#64748b; font-size:12px }
</style>
<h1>PaySimple — demo screens</h1>
<p class="sub">${results.filter((r) => r.ok).length} screens captured from ${BASE_URL}</p>
<div class="grid">
${cards}
</div>
`,
    'utf-8',
  )

  const failed = results.filter((r) => !r.ok)
  const withErrors = results.filter((r) => r.ok && r.errors.length)

  console.log(`\nWrote ${results.filter((r) => r.ok).length} screenshots to demo-screenshots/`)
  console.log('Open demo-screenshots/index.html to browse them.')
  if (withErrors.length) {
    console.log(`\n${withErrors.length} screen(s) captured but logged page errors:`)
    withErrors.forEach((r) => console.log(`  ${r.title}: ${r.errors.join('; ')}`))
  }
  if (failed.length) {
    console.log(`\n${failed.length} screen(s) failed to capture.`)
    process.exit(1)
  }
}

main()
