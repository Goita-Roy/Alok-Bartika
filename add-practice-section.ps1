param(
    [string]$TargetDir = "D:\alokbartika-platform14\alokbartika-platform\advanced-section"
)

$practiceHtml = @'
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

$practiceJsTemplate = @'
  { id:'practice', title:'Practice in Python IDE', icon:'💻', color:'var(--cyan)', html:`
    <div class="flex gap-4 items-start">
      <div class="text-5xl shrink-0">💻</div>
      <p class="text-sm sm:text-base text-muted-foreground">এখন নিজেই কোড লিখে অনুশীলন করুন। নিচের বাটনে ক্লিক করে Python IDE-তে গিয়ে এই পাঠের কোড নিজে লিখে দেখুন।</p>
      <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2)">🚀 Open Python IDE</a>
    </div>` },
'@

function Add-PracticeToAccordionItem {
    param([string]$Path)
    $content = Get-Content -Path $Path -Raw
    # Find id="aiAccordion" or the last accordion-item with AI
    if ($content -match '(?s)(<!-- AI Coding Companion -->.*?</div>\s*</div>\s*)(\s*</div>)') {
        $before = $Matches[1]
        $after = $Matches[2]
        $newContent = $before + $practiceHtml + $after
        $content = $content.Replace($Matches[0], $newContent)
        Set-Content -Path $Path -Value $content -NoNewline
        return $true
    }
    # Try without comment
    if ($content -match '(?s)(class="accordion-header">🤖 AI Coding Companion.*?</div>\s*</div>\s*)(\s*</div>)') {
        $before = $Matches[1]
        $after = $Matches[2]
        $newContent = $before + $practiceHtml + $after
        $content = $content.Replace($Matches[0], $newContent)
        Set-Content -Path $Path -Value $content -NoNewline
        return $true
    }
    return $false
}

function Add-PracticeToAccItem {
    param([string]$Path)
    $content = Get-Content -Path $Path -Raw
    # Find the last occurrence of </div> after AI Coding Companion (closing the acc-item)
    # Pattern: AI section ... </div>\n    </div>\n\n  </div> (item close, blank, wrapper close)
    if ($content -match '(?s)(AI Coding Companion.*?class="acc-title">AI Coding Companion.*?</div>\s*</div>\s*</div>\s*</div>\s*)(\s*</div>)') {
        $before = $Matches[1]
        $after = $Matches[2]
        $newContent = $before + $practiceAccItem + "`n" + $after
        $content = $content.Replace($Matches[0], $newContent)
        Set-Content -Path $Path -Value $content -NoNewline
        return $true
    }
    return $false
}

function Add-PracticeToDetails {
    param([string]$Path)
    $content = Get-Content -Path $Path -Raw
    # Find </details> that closes AI section, insert after it
    if ($content -match '(?s)(AI Coding Companion.*?</details>)(\s*)(</div>|<footer|<section|$)') {
        $before = $Matches[1]
        $whitespace = $Matches[2]
        $after = $Matches[3]
        $newContent = $before + $whitespace + $practiceDetails + "`n" + $whitespace + $after
        $content = $content.Replace($Matches[0], $newContent)
        Set-Content -Path $Path -Value $content -NoNewline
        return $true
    }
    return $false
}

function Add-PracticeToJsTemplate {
    param([string]$Path)
    $content = Get-Content -Path $Path -Raw
    # Find the card array closing ]; before the document.getElementById('help')
    if ($content -match '(?s)(id.:.ai.*?</div>` \},)(\s*\];)') {
        $before = $Matches[1]
        $after = $Matches[2]
        $newContent = $before + "`n" + $practiceJsTemplate + $after
        $content = $content.Replace($Matches[0], $newContent)
        Set-Content -Path $Path -Value $content -NoNewline
        return $true
    }
    return $false
}

Write-Host "Processing files in: $TargetDir"
$total = 0; $success = 0; $fail = 0

Get-ChildItem -Path $TargetDir -Filter "*.html" | ForEach-Object {
    $file = $_.FullName
    $name = $_.Name
    $total++
    $content = Get-Content -Path $file -Raw
    
    # Check for data-practice to skip already-modified files
    if ($content -match 'data-practice') {
        Write-Host "  SKIP $name (already has Practice section)"
        $success++
        return
    }
    
    # Determine pattern
    if ($content -match 'class="accordion-item"') {
        # Try accordion-item pattern (with id="aiAccordion" or comment)
        if ($content -match 'id="aiAccordion"') {
            if ($content -match '(?s)(<!-- AI CODING COMPANION -->.*?</div>\s*</div>\s*)(\s*</div>)') {
                $before = $Matches[1]
                $after = $Matches[2]
                $newContent = $before + $practiceHtml + $after
                $content = $content.Replace($Matches[0], $newContent)
                Set-Content -Path $file -Value $content -NoNewline
                Write-Host "  OK  $name (accordion-item with id=aiAccordion)"
                $success++; return
            }
        }
        # Try with just class="accordion-item" (c1_setting_up style)
        if ($content -match '(?s)(class="accordion-header">🤖 AI Coding Companion.*?</div>\s*</div>\s*)(\s*</div>)') {
            $before = $Matches[1]
            $after = $Matches[2]
            $newContent = $before + $practiceHtml + $after
            $content = $content.Replace($Matches[0], $newContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  OK  $name (accordion-item inline)"
            $success++; return
        }
        # Try with full comment pattern (AI Coding Companion)
        if ($content -match '(?s)(<!-- AI Coding Companion -->.*?</div>\s*</div>\s*)(\s*</div>)') {
            $before = $Matches[1]
            $after = $Matches[2]
            $newContent = $before + $practiceHtml + $after
            $content = $content.Replace($Matches[0], $newContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  OK  $name (accordion-item with comment)"
            $success++; return
        }
        Write-Host "  FAIL $name (accordion-item - no match)"
        $fail++
    }
    elseif ($content -match 'class="acc-item"') {
        # acc-item pattern - find the closing of acc-item div and insert before wrapper close
        # Pattern: after AI, find the last </div>\n    </div>\n\n  </div> or similar
        if ($content -match '(?s)(AI Coding Companion.*?<div class="acc-title">AI Coding Companion.*?</div>\s*</div>\s*</div>\s*</div>\s*)(\s*</div>)') {
            $before = $Matches[1]
            $after = $Matches[2]
            $newContent = $before + "`n" + $practiceAccItem + "`n" + $after
            $content = $content.Replace($Matches[0], $newContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  OK  $name (acc-item)"
            $success++; return
        }
        # Try alternate pattern (c4_guess_number style with acc-btn)
        if ($content -match '(?s)(AI Coding Companion.*?class="acc-btn".*?</div>\s*</div>\s*)(\s*</div>)') {
            $before = $Matches[1]
            $after = $Matches[2]
            $newContent = $before + $practiceAccItem + "`n" + $after
            $content = $content.Replace($Matches[0], $newContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  OK  $name (acc-item with acc-btn)"
            $success++; return
        }
        # Try with acc-head pattern (c8_countdown style)
        if ($content -match '(?s)(AI Coding Companion.*?class="acc-head".*?</div>\s*</div>\s*)(\s*</div>)') {
            $before = $Matches[1]
            $after = $Matches[2]
            $newContent = $before + $practiceAccItem + "`n" + $after
            $content = $content.Replace($Matches[0], $newContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  OK  $name (acc-item with acc-head)"
            $success++; return
        }
        Write-Host "  FAIL $name (acc-item - no match)"
        $fail++
    }
    elseif ($content -match '<details>' -or $content -match '<summary>') {
        # details pattern
        if ($content -match '(?s)(AI Coding Companion.*?</details>)(\s*)(\S)') {
            $before = $Matches[1]
            $whitespace = $Matches[2]
            $nextChar = $Matches[3]
            # Insert practice BEFORE the next element
            $newContent = $before + "`n" + $whitespace + $practiceDetails + "`n" + $whitespace + $nextChar
            $content = $content.Replace($Matches[0], $newContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  OK  $name (details)"
            $success++; return
        }
        # Try easier regex: find the AI section's </details> and what comes after
        if ($content -match '(?s)(AI Coding Companion.*?</details>)(\s*)(</div>|<footer|<section)') {
            $before = $Matches[1]
            $whitespace = $Matches[2]
            $after = $Matches[3]
            $newContent = $before + "`n" + $whitespace + $practiceDetails + "`n" + $whitespace + $after
            $content = $content.Replace($Matches[0], $newContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  OK  $name (details - alt)"
            $success++; return
        }
        Write-Host "  FAIL $name (details - no match)"
        $fail++
    }
    elseif ($content -match "id:'ai'") {
        # JS template literal
        if ($content -match '(?s)(id.:.ai.*?</div>` \},)(\s*\];)') {
            $before = $Matches[1]
            $after = $Matches[2]
            $newContent = $before + "`n" + $practiceJsTemplate + $after
            $content = $content.Replace($Matches[0], $newContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  OK  $name (js-template)"
            $success++; return
        }
        Write-Host "  FAIL $name (js-template - no match)"
        $fail++
    }
    else {
        Write-Host "  SKIP $name (no accordion pattern detected)"
        $success++
    }
}

Write-Host ""
Write-Host "=== Summary ==="
Write-Host "Total: $total | Succeeded: $success | Failed: $fail"
