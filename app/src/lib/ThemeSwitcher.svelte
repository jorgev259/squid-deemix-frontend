<script>
  let override;

  function getTheme() {
    return override || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  // this is literally a find replace in the css
  function setTheme(theme) {
    override = theme;
    Array.from(document.styleSheets).map(e => {
      try {
        return Array.from(e.cssRules)
      } catch (e) {
        return []
      }
    }).flat().map(e => {
      if (e.constructor != CSSMediaRule) return;
      if (e.originalConditionText) e.conditionText = e.originalConditionText;
      else e.originalConditionText = e.conditionText
      if (theme === 'system') return
      let match = e.conditionText.match(/prefers-color-scheme:\s*(light|dark)/i)
      if (!match) return;
      e.conditionText = e.conditionText.replace(match[0], (match[1].toLowerCase() == theme ? 'min' : 'max') + '-width: 0')
    });
  }

  function swapTheme() {
    let theme = getTheme();
    console.log(`current theme ${theme}`)
    setTheme(theme === 'light' ? 'dark' : 'light');
  }
</script>

<label class="switch">
  <input type="checkbox" class="theme-switch" on:click={swapTheme}>
  <span class="slider round"></span>
</label>

<style>
  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-transition: .2s;
    transition: .2s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .2s;
    transition: .2s;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>