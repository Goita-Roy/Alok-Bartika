param([string]$Dir = "D:\alokbartika-platform21\alokbartika-platform19\alokbartika-platform14\alokbartika-platform\advanced-section")

# Practice block (accordion-item style) used by accordion-based files
$practiceAccordionItem = @'
    <!-- Practice in Python IDE -->
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <span>💻 Practice in Python IDE</span>
        <span class="accordion-icon">▼</span>
      </div>
      <div class="accordion-content">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#B8C5C1">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
        <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;align-self:flex-start;box-shadow:0 0 16px rgba(101,209,178,0.2);margin-top:8px">🚀 Open Python IDE</a>
      </div>
    </div>
'@

# Practice block (acc-item style) used by acc-item / acc-trigger based files
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
            <p>এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
            <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2)">🚀 Open Python IDE</a>
          </div>
        </div>
      </div>
    </div>
'@

# ─── 1) Fix broken files: practice block nested inside AI button ──────────
$brokenFiles = @('c1_pattern.html','c2_basic.html','c3_basic.html')
foreach ($name in $brokenFiles) {
    $file = Join-Path $Dir $name
    $content = Get-Content $file -Raw

    # Already correctly placed? skip
    if ($content -match 'AI Coding Companion</div>\s*</div>\s*</div>\s*</div>\s*\n\s*<!-- Practice in Python IDE -->') {
        Write-Host "  SKIP-FIX $name (already correct)"
        continue
    }

    # Malformed: acc-chevron close, then practice block, then dangling </button> + AI body + closes
    $re = [regex]'(?s)(\s*<div class="acc-chevron">[^<]*</div>)\s*<!-- Practice in Python IDE -->.*?</div>\s*</div>\s*(</button>\s*<div class="acc-body">.*?</div>\s*</div>\s*</div>\s*</div>)'
    if ($content -match $re) {
        $g1 = $Matches[1]
        $g2 = $Matches[2]
        $newContent = $content -replace $re, "$g1`n$g2`n$practiceAccordionItem`n"
        Set-Content -Path $file -Value $newContent -NoNewline
        Write-Host "  FIXED $name"
    } else {
        Write-Host "  FIX-FAIL $name (pattern not found)"
    }
}

# ─── 2) Add practice to c1_basic (acc-item style, sibling after AI item) ───
$c1b = Join-Path $Dir 'c1_basic.html'
$c = Get-Content $c1b -Raw
if ($c -notmatch 'Practice in Python IDE') {
    # AI acc-item ends after its acc-body: ...</div></div></div>  then </div> closes .accordion
    $re = [regex]'(?s)(AI Coding Companion</div>.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*)(\s*</div>)'
    if ($c -match $re) {
        $before = $Matches[1]
        $after = $Matches[2]
        $newC = $c -replace $re, "$before`n$practiceAccItem`n$after"
        Set-Content -Path $c1b -Value $newC -NoNewline
        Write-Host "  ADDED c1_basic.html (acc-item)"
    } else {
        Write-Host "  ADD-FAIL c1_basic.html"
    }
} else {
    Write-Host "  SKIP c1_basic.html (already has practice)"
}

# ─── 3) Add practice to c1_initials (accordion-item style, after Solution) ──
$c1i = Join-Path $Dir 'c1_initials.html'
$ci = Get-Content $c1i -Raw
if ($ci -notmatch 'Practice in Python IDE') {
    # Insert after the Solution accordion-item closes. The solution item ends with:
    #   </div> (accordion-content) </div> (accordion-item)  then the help wrapper </div>
    # Match the last accordion-item (solution) close followed by the help-section wrapper close.
    $re = [regex]'(?s)(id="solutionAccordion">.*?)(</div>\s*<!-- extra pixel decoration)'
    if ($ci -match $re) {
        $before = $Matches[1]
        $after = $Matches[2]
        $newCi = $ci -replace $re, "$before`n$practiceAccordionItem`n$after"
        Set-Content -Path $c1i -Value $newCi -NoNewline
        Write-Host "  ADDED c1_initials.html (accordion-item)"
    } else {
        Write-Host "  ADD-FAIL c1_initials.html"
    }
} else {
    Write-Host "  SKIP c1_initials.html (already has practice)"
}

Write-Host "Done."
