function installFrameFixes() {
  if (!state.running) root.querySelectorAll('.v4-control .v4-pump .amount').forEach(amount => amount.hidden = true);
}
new MutationObserver(installFrameFixes).observe(root, {childList:true});
installFrameFixes();
