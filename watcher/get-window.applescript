-- Returns: appName|||windowTitle (delimiter ||| for parsing)
tell application "System Events"
  set frontApp to first process whose frontmost is true
  set appName to name of frontApp
  set winTitle to ""
  try
    tell process appName
      if exists (1st window whose value of attribute "AXMain" is true) then
        set winTitle to value of attribute "AXTitle" of (1st window whose value of attribute "AXMain" is true)
      end if
    end tell
  end try
  return appName & "|||" & winTitle
end tell
