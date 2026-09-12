const installExactIllustrations = () => {
  const deviceArt = root.querySelector('.device-illustration');
  if (deviceArt) deviceArt.src = './assets/figma-v2/device-group-a.svg';
  const homeArt = root.querySelector('.home-illustration');
  if (homeArt) homeArt.src = './assets/figma-v2/home-group-b.svg';
};
new MutationObserver(installExactIllustrations).observe(root, { childList: true });
installExactIllustrations();
