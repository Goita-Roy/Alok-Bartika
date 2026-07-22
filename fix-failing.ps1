param(
    [string]$Dir = "D:\alokbartika-platform14\alokbartika-platform\advanced-section"
)

# ─── Practice snippets ───────────────────────────────────────────────

$practiceAccordionItem = @'
    <!-- Practice in Python IDE -->
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <span>💻 Practice in Python IDE</span>
        <span class="accordion-icon">▼</span>
      </div>
      <div class="accordion-content">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#B8C5C1">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
        <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;align-self:flex-start;box-shadow:0 0 16px rgba(101,209,178,0.2);margin-top:8px">🚀 Open Python IDE</a>
      </div>
    </div>
'@

$practiceAccItem = @'
    <!-- Practice in Python IDE -->
    <div class="acc-item">
      <button class="acc-trigger" onclick="toggleAccordion(this)">
        <div class="acc-trigger-left">
          <div class="acc-icon" style="background:rgba(101,209,178,0.15);color:#65D1B2">💻</div>
          <div style="text-align:left">
            <div class="acc-title">Practice in Python IDE</div>
            <div class="acc-sub">আলোকবর্তিকা IDE-তে অনুশীলন করুন</div>
          </div>
        </div>
        <div class="acc-chevron">▼</div>
      </button>
      <div class="acc-body">
        <div class="acc-content">
          <div class="acc-content-inner">
            <p>এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
            <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2)">🚀 Open Python IDE</a>
          </div>
        </div>
      </div>
    </div>
'@

$practiceDetails = @'
  <details class="accordion">
    <summary><span class="ico" style="background:rgba(101,209,178,.15);color:var(--cyan)">💻</span><span style="color:var(--cyan)">Practice in Python IDE</span></summary>
    <div class="body"><p style="margin:0;color:#d1d5db">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p><a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">🚀 Open Python IDE</a></div>
  </details>
'@

$practiceDetailsIndented = @'
      <details class="accordion">
        <summary><span class="ico" style="background:rgba(101,209,178,.15);color:var(--cyan)">💻</span><span style="color:var(--cyan)">Practice in Python IDE</span></summary>
        <div class="body"><p style="margin:0;color:#d1d5db">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p><a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">🚀 Open Python IDE</a></div>
      </details>
'@

$practiceSummaryTrigger = @'
      <details class="accordion">
        <summary class="acc-trigger"><span class="left"><span style="font-size:1.3rem;color:#65D1B2">💻</span><span style="color:#65D1B2">Practice in Python IDE</span></span><span class="chev">▾</span></summary>
        <div class="acc-body">
          <div class="hint"><span class="e" style="font-size:1.3rem;">💻</span><div><p class="font-pixel" style="font-size:10px;margin:0 0 6px;color:#65D1B2">IDE A ONLINE</p><p style="margin:0;">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p><a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:8px;font-weight:900;font-size:12px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">🚀 Open Python IDE</a></div></div>
        </div>
      </details>
'@

# ─── File-specific handlers ──────────────────────────────────────────

function AddPractice($file) {
    $content = Get-Content $file -Raw
    $name = [System.IO.Path]::GetFileName($file)

    # Skip if already has it
    if ($content -match 'Practice in Python IDE') {
        Write-Host "  SKIP $name (already has Practice section)"
        return $true
    }

    switch -Wildcard ($name) {
        # ── Pattern: acc-item with acc-trigger (standard) ──
        'c1_basic.html' {
            # Ends: </div>\n  </div>\n\n  <div class="pixel-divider"
            $content = $content -replace '(?s)(AI Coding Companion</div>.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*)(\s*</div>\s*)', "`$1`n$practiceAccItem`n`$2"
        }
        'c1_pattern.html' {
            # Same structure as c1_basic - acc-item/acc-trigger
            $content = $content -replace '(?s)(AI Coding Companion</div>.*?</div>\s*</div>\s*</div>\s*</div>\s*)(\s*</div>)', "`$1`n$practiceAccItem`n`$2"
        }
        'c2_basic.html' {
            $content = $content -replace '(?s)(AI Coding Companion</div>.*?</div>\s*</div>\s*</div>\s*</div>\s*)(\s*</div>)', "`$1`n$practiceAccItem`n`$2"
        }
        'c3_basic.html' {
            $content = $content -replace '(?s)(AI Coding Companion</div>.*?</div>\s*</div>\s*</div>\s*</div>\s*)(\s*</div>)', "`$1`n$practiceAccItem`n`$2"
        }

        # ── Pattern: accordion-item (standard with id=aiAccordion) ──
        'c1_initials.html' {
            # Find the AI section's closing structure
            # </div>\n    </div>\n    <!-- NEXT SECTION AFTER ACCORDION -->
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*)(\s*<!--)', "`$1`n$practiceAccordionItem`n`$2"
        }

        # ── Pattern: accordion-item/accordion-head/body (c4_99_bottles) ──
        'c4_99_bottles.html' {
            # </div>\n    </div>\n  </section>
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*)(\s*</section>)', "`$1`n$practiceAccordionItem`n`$2"
        }

        # ── Pattern: accordion-item with id="accordion-ai" ──
        'c4_basic.html' {
            $content = $content -replace '(?s)(id="accordion-ai">.*?</div>\s*</div>\s*</div>\s*)(\s*<!-- 5\.)', "`$1`n$practiceAccordionItem`n`$2"
        }
        'c5_basic.html' {
            $content = $content -replace '(?s)(id="accordion-ai">.*?</div>\s*</div>\s*</div>\s*)(\s*<!-- 5\.)', "`$1`n$practiceAccordionItem`n`$2"
        }
        'c6_basic.html' {
            $content = $content -replace '(?s)(id="accordion-ai">.*?</div>\s*</div>\s*</div>\s*)(\s*<!-- 5\.)', "`$1`n$practiceAccordionItem`n`$2"
        }

        # ── Pattern: acc-item with acc-btn (c4_guess_number) ──
        'c4_guess_number.html' {
            # </div>\n    </div>\n  </div>\n</section>
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*)(\s*</div>\s*</section>)', "`$1`n$practiceAccItem`n`$2"
        }

        # ── Pattern: acc-item with acc-header (c5_grocery) ──
        'c5_grocery.html' {
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*</div>\s*</div>\s*)(\s*</div>\s*<footer)', "`$1`n$practiceAccItem`n`$2"
        }

        # ── Pattern: js-template literal (c5_inventory) ──
        'c5_inventory.html' {
            # Insert before ];
            $newCard = "  { id:'practice', title:'Practice in Python IDE', icon:'💻', color:'var(--cyan)', html:`${
    `<div class=\"flex gap-4 items-start\">
      <div class=\"text-5xl shrink-0\">💻</div>
      <p class=\"text-sm sm:text-base text-muted-foreground\">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
      <a href=\"/development\" target=\"_parent\" style=\"display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2)\">🚀 Open Python IDE</a>
    </div>` },`n"
            $content = $content -replace '(?s)(id.:.ai.*?</div>` \},\s*)(\];)', "`$1`n$newCard`$2"
        }
        'c6_dry.html' {
            $newCard = "  { id:'practice', title:'Practice in Python IDE', icon:'💻', color:'var(--cyan)', html:`${
    `<div class=\"flex gap-4 items-start\">
      <div class=\"text-5xl shrink-0\">💻</div>
      <p class=\"text-sm sm:text-base text-muted-foreground\">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
      <a href=\"/development\" target=\"_parent\" style=\"display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2)\">🚀 Open Python IDE</a>
    </div>` },`n"
            $content = $content -replace '(?s)(id.:.ai.*?</div>` \},\s*)(\];)', "`$1`n$newCard`$2"
        }

        # ── Pattern: custom card-neon (c2_pythagorean) ──
        'c2_pythagorean.html' {
            $practicePyth = @'
      <!-- Practice in Python IDE -->
      <div class="card-neon rounded-2xl overflow-hidden border border-neon-green/40 transition-all hover:shadow-[0_0_25px_rgba(101,209,178,0.4)]">
        <button onclick="toggle('practice')" class="w-full flex items-center gap-4 p-5 text-left group">
          <span class="text-3xl animate-float-slow">💻</span>
          <span class="font-display text-sm sm:text-base flex-1 text-neon-green">Practice in Python IDE</span>
          <svg id="arrow-practice" class="w-5 h-5 text-neon-green transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <div id="practice" class="grid transition-all duration-500 ease-out grid-rows-[0fr] opacity-0">
          <div class="overflow-hidden">
            <div class="px-5 pb-6 pt-0 border-t border-white/10">
              <div class="pt-4 flex items-center gap-5">
                <div class="w-16 h-16 rounded-2xl bg-neon-green/20 border border-neon-green/40 flex items-center justify-center shrink-0">
                  <span class="text-3xl">💻</span>
                </div>
                <div class="flex-1">
                  <p class="text-white/90">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
                  <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2);margin-top:10px">🚀 Open Python IDE</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
'@
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*)(\s*</div>\s*</section>)', "`$1`n$practicePyth`n`$2"
        }

        # ── Pattern: details/acc-trigger (c7_favorite_city, c7_restuarent) ──
        'c7_favorite_city.html' {
            $content = $content -replace '(?s)(AI Coding Companion.*?</details>\s*)(\s*</div>\s*</section>)', "`$1`n$practiceSummaryTrigger`n`$2"
        }
        'c7_restuarent.html' {
            $content = $content -replace '(?s)(AI Coding Companion.*?</details>\s*)(\s*</div>\s*</section>)', "`$1`n$practiceSummaryTrigger`n`$2"
        }

        # ── Pattern: acc-item with acc-head (c8_countdown) ──
        'c8_countdown.html' {
            # Ends: </div>\n    </div>\n  </section>
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*)(\s*</section>)', "`$1`n$practiceAccItem`n`$2"
        }

        # ── Special: c3_syntax_error (loose structure) ──
        'c3_syntax_error.html' {
            # Ends: </div>\n\n</div>\n\n</div>\n\n</div>
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*</div>\s*</div>\s*)(\s*<div class="pixel-divider"|$)', "`$1`n      <div class=`"acc-item`">`n        <button class=`"acc-trigger`" onclick=`"toggleAccordion(this)`">`n          <div class=`"acc-trigger-left`">`n            <div class=`"acc-icon`" style=`"background:rgba(101,209,178,0.15);color:#65D1B2`">💻</div>`n            <div style=`"text-align:left`">`n              <div class=`"acc-title`">Practice in Python IDE</div>`n              <div class=`"acc-sub`">আলোকবর্তিকা IDE-তে অনুশীলন করুন</div>`n            </div>`n          </div>`n          <div class=`"acc-chevron`">▼</div>`n        </button>`n        <div class=`"acc-body`">`n          <div class=`"acc-content`">`n            <div class=`"acc-content-inner`">`n              <p>এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>`n              <a href=`"/development`" target=`"_parent`" style=`"display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2)`">🚀 Open Python IDE</a>`n            </div>`n          </div>`n        </div>`n      </div>`n`n      `$2"
        }

        # ── Pattern: acc-item/left/ico (c6_calculator, c6_mars_orbiter, c2_data_types) ──
        'c6_calculator.html' {
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*)(\s*</section>)', "`$1`n$practiceAccItem`n`$2"
        }
        'c6_mars_orbiter.html' {
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*)(\s*</div>\s*</section>)', "`$1`n$practiceAccItem`n`$2"
        }
        'c2_data_types.html' {
            $content = $content -replace '(?s)(AI Coding Companion.*?</div>\s*</div>\s*)(\s*</div>)', "`$1`n$practiceAccItem`n`$2"
        }

        default {
            Write-Host "  UNKNOWN $name - no handler"
            return $false
        }
    }

    Set-Content -Path $file -Value $content -NoNewline
    Write-Host "  OK   $name"
    return $true
}

# ─── Main ────────────────────────────────────────────────────────────

Write-Host "Adding Practice sections to files in: $Dir"
$ok = 0; $fail = 0; $skip = 0
Get-ChildItem "$Dir\*.html" | ForEach-Object {
    $r = AddPractice $_.FullName
    if ($r -eq $true) { $ok++ }
    elseif ($r -eq $false) { $fail++ }
    else { $skip++ }
}
Write-Host "`nDone: OK=$ok  Fail=$fail  Skip=$skip"
