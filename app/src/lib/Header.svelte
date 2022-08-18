<div class="header">
  <div class="header-left">
    <a href="https://deemix.app" target="_blank" class="big link"><img class="deemix" width="26" height="auto" src="https://deemix.app/img/logo.png" alt=""> deemix</a>
    <a href="https://git.oat.zone/oat/deemix-web-frontend" target="_blank" class="big link"><img class="git" width="26" height="auto" src="https://git-scm.com/images/logos/downloads/Git-Icon-White.png" alt=""> git</a>
  </div>

  <div class="header-right">
    <!--<ThemeSwitcher/>-->
  </div>
</div>

<style>
  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 12px;

    align-self: stretch;
  }

  .header > * {
    margin-left: 12px;
    margin-right: 12px;
  }
  .header .link {
    font-size: x-large;
    text-decoration: none;
  }
  .header img {
    position: relative;
    top: 5px;
  }

  .header-left {
    flex: 1 1 0px;
  }
  .header-left > * {
    margin-right: 16px;
  }
  @media (prefers-color-scheme: light) {
    .git {
      filter: invert(100%);
    }
  }
</style>