<div class="header">
  <div class="header-left">
    <a href="/" class="big link svelte-1giqba1">SQUID.WTF</a>
    <a
      href="https://discord.gg/ATjPbzR"
      target="_blank"
      class="big link svelte-1giqba1"
      ><img
        class="deemix svelte-1giqba1"
        width="26"
        height="auto"
        src="/assets/discord.png"
        alt="Discord"
        title="Discord"
      /></a
    >
    <a
      href="https://my.lyratris.com/donate/31de472c-6a1b-47bc-9939-54dbfac30990"
      target="_blank"
      class="big link svelte-1giqba1"
      ><img
        class="deemix svelte-1giqba1"
        width="26"
        height="auto"
        src="/assets/donate.png"
        alt="Donate"
        title="Donate"
      /></a
    >
    <a
      href="https://git.oat.zone/oat/deemix-web-frontend"
      target="_blank"
      class="big link"
      ><img
        class="git"
        width="26"
        height="auto"
        src="https://git-scm.com/images/logos/downloads/Git-Icon-White.png"
        alt=""
      />GIT</a
    >
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
