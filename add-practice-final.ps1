param([string]$Dir = "D:\alokbartika-platform14\alokbartika-platform\advanced-section")

$practiceBlocks = @{
    'accordion-item' = @'
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
    'acc-item' = @'
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
}

function Get-PracticeBlock($type) {
    return $practiceBlocks[$type]
}

function Add-PracticeToFile($filePath) {
    $name = [System.IO.Path]::GetFileName($filePath)
    $lines = Get-Content $filePath
    $content = $lines -join "`n"

    # Skip if already has it
    if ($content -match 'Practice in Python IDE') { return $true }

    # Find last occurrence of "AI Coding Companion" line
    $aiIdx = -1
    for ($i = $lines.Count - 1; $i -ge 0; $i--) {
        if ($lines[$i] -match 'AI Coding Companion') { $aiIdx = $i; break }
    }
    if ($aiIdx -eq -1) { Write-Host "  SKIP $name (no AI Coding Companion)"; return $true }

    # Determine the indentation of the AI section header
    $aiLine = $lines[$aiIdx]
    $indent = if ($aiLine -match '^(\s*)') { $matches[1].Length } else { 0 }

    # Determine the pattern type
    $type = 'acc-item'
    $lineBefore = if ($aiIdx -gt 0) { $lines[$aiIdx - 1] } else { '' }
    $wrapperLine = $lineBefore
    
    # Check the structure around AI section
    if ($content -match 'class="accordion-item"') { $type = 'accordion-item' }
    
    # Check for details pattern
    if ($content -match '<details[^>]*>') {
        $detailsCount = 0
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match '<details') { $detailsCount++ }
        }
        if ($detailsCount -ge 4) { $type = 'details' }
    }

    # Check for specific patterns
    if ($content -match "id:'ai'") { $type = 'js-template' }
    if ($content -match 'card-neon') { $type = 'card-neon' }
    if ($content -match '<summary class="acc-trigger"') { $type = 'details-acc' }
    if ($content -match 'class="accordion-item"') { $type = 'accordion-item' }
    if ($name -eq 'c4_99_bottles.html') { $type = 'accordion-head' }
    if ($name -eq 'c4_guess_number.html') { $type = 'acc-btn' }
    if ($name -eq 'c5_grocery.html' -or $name -eq 'c2_data_types.html') { $type = 'acc-header' }
    if ($name -eq 'c6_calculator.html') { $type = 'acc-left' }
    if ($name -eq 'c6_mars_orbiter.html' -or $name -eq 'c8_basic.html' -or $name -eq 'c8_countdown.html') { $type = 'acc-head' }
    if ($name -eq 'c3_syntax_error.html') { $type = 'loose' }

    # Now find insertion point by scanning forward from AI section
    $depth = 0
    $insertIdx = -1
    $depthStarted = $false
    $targetDepth = $indent / 2  # rough estimate of nesting level

    for ($i = $aiIdx + 1; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match '<div[>\s]') { $depth++ }
        if ($line -match '<details') { $depth++ }
        if ($line -match '</div>') { $depth-- }
        if ($line -match '</details>') { $depth-- }
        
        # When depth returns to 0 (closed the AI section's container), 
        # look at the next non-blank line to determine next container
        if ($depth -le 0 -and $line -match '</div>|</details>|</section>') {
            # Check the next non-blank line
            $nextNonBlank = -1
            for ($j = $i + 1; $j -lt $lines.Count; $j++) {
                if ($lines[$j] -match '\S') { $nextNonBlank = $j; break }
            }
            if ($nextNonBlank -gt 0) {
                $nextLine = $lines[$nextNonBlank]
                # Is this the end of the AI section's parent container?
                if ($nextLine -notmatch '</div>|</details>|</section>') {
                    # This is a new element - insert before it
                    $insertIdx = $nextNonBlank
                    break
                }
            }
        }
    }

    if ($insertIdx -eq -1) {
        Write-Host "  FAIL $name (could not find insertion point)"
        return $false
    }

    # Build the Practice block with proper indentation
    $blockType = $type
    if ($type -eq 'accordion-item' -or $type -eq 'accordion-head') { $blockType = 'accordion-item' }
    elseif ($type -eq 'acc-btn' -or $type -eq 'acc-header' -or $type -eq 'acc-left' -or $type -eq 'acc-head') { $blockType = 'acc-item' }
    
    if ($type -eq 'details' -or $type -eq 'details-acc') {
        $practiceBlock = @'
  <details class="accordion">
    <summary><span class="ico" style="background:rgba(101,209,178,.15);color:var(--cyan)">💻</span><span style="color:var(--cyan)">Practice in Python IDE</span></summary>
    <div class="body"><p style="margin:0;color:#d1d5db">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p><a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">🚀 Open Python IDE</a></div>
  </details>
'@
    } elseif ($type -eq 'js-template') {
        $practiceBlock = @'
  { id:'practice', title:'Practice in Python IDE', icon:'💻', color:'var(--cyan)', html:`
    <div class="flex gap-4 items-start">
      <div class="text-5xl shrink-0">💻</div>
      <p class="text-sm sm:text-base text-muted-foreground">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
      <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2)">🚀 Open Python IDE</a>
    </div>` },
'@
    } elseif ($type -eq 'card-neon') {
        $practiceBlock = @'
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
    } elseif ($type -eq 'details-acc') {
        $practiceBlock = @'
      <!-- Practice in Python IDE -->
      <details class="acc-item cyan">
        <summary class="acc-trigger"><span class="left"><span style="font-size:1.3rem;color:#65D1B2">💻</span><span style="color:#65D1B2">Practice in Python IDE</span></span><span class="chev">▾</span></summary>
        <div class="acc-body">
          <div class="hint"><span class="e" style="font-size:1.3rem;">💻</span><div><p class="font-pixel" style="font-size:10px;margin:0 0 6px;color:#65D1B2">IDE · ONLINE</p><p style="margin:0;">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p><a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">🚀 Open Python IDE</a></div></div>
        </div>
      </details>
'@
    } elseif ($type -eq 'acc-btn') {
        $practiceBlock = @'
      <!-- Practice in Python IDE -->
      <div class="acc-item green">
        <button class="acc-btn" onclick="toggle(this)">
          <span class="acc-emoji">💻</span>
          <span class="acc-title">Practice in Python IDE</span>
          <span class="acc-chev">▼</span>
        </button>
        <div class="acc-body">
          <div class="ai-row">
            <div class="ai-icon">💻</div>
            <p>এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
            <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">🚀 Open Python IDE</a>
          </div>
        </div>
      </div>
'@
    } elseif ($type -eq 'loose') {
        $practiceBlock = @'
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
    } elseif ($type -eq 'accordion-head') {
        $practiceBlock = @'
    <!-- Practice in Python IDE -->
    <div class="accordion-item">
      <div class="accordion-head" onclick="toggle(this)">
        <span>💻 Practice in Python IDE</span><span class="ico">+</span>
      </div>
      <div class="accordion-body">
        <p>এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
        <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;align-self:flex-start;box-shadow:0 0 16px rgba(101,209,178,0.2);margin-top:8px">🚀 Open Python IDE</a>
      </div>
    </div>
'@
    } elseif ($type -eq 'acc-head') {
        $practiceBlock = @'
      <!-- Practice in Python IDE -->
      <div class="acc-item">
        <button class="acc-head"><span><span class="ico">💻</span> Practice in Python IDE</span><span class="chev">▼</span></button>
        <div class="acc-body">
          <div style="display:flex;gap:14px;align-items:center;padding:14px;border-radius:12px;background:#0a0b22;border:1px solid var(--border)">
            <div style="font-size:46px;animation:bounce 2s ease-in-out infinite">💻</div>
            <div>
              <div style="font-family:'Press Start 2P',cursive;font-size:10px;color:#65D1B2">IDE OPEN</div>
              <div style="color:var(--muted);font-size:14px;margin-top:6px">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</div>
              <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">🚀 Open Python IDE</a>
            </div>
          </div>
        </div>
      </div>
'@
    } elseif ($type -eq 'acc-left') {
        $practiceBlock = @'
      <!-- Practice in Python IDE -->
      <div class="acc-item">
        <div class="acc-head">
          <div class="left"><span class="ico">💻</span><span>Practice in Python IDE</span></div>
          <span class="arrow">▼</span>
        </div>
        <div class="acc-body">
          <div class="ai-box">
            <div class="avatar">💻</div>
            <p><strong>IDE প্রস্তুত:</strong> এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
            <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2);margin-top:8px">🚀 Open Python IDE</a>
          </div>
        </div>
      </div>
'@
    } else {
        $practiceBlock = Get-PracticeBlock 'accordion-item'
    }

    # Insert the practice block at insertIdx
    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($i -eq $insertIdx) {
            $newLines += ""
            $newLines += $practiceBlock
            $newLines += ""
        }
        $newLines += $lines[$i]
    }

    Set-Content -Path $filePath -Value ($newLines -join "`n") -NoNewline
    Write-Host "  OK   $name ($type, insert at line $($insertIdx+1))"
    return $true
}

# Main
Write-Host "Adding Practice sections to files in: $Dir"
$ok = 0; $fail = 0; $skip = 0
Get-ChildItem "$Dir\c*.html" | ForEach-Object {
    $r = Add-PracticeToFile $_.FullName
    if ($r -eq $true) { $ok++ }
    else { $fail++ }
}
Write-Host "`nDone: OK=$ok  Fail=$fail"
