<script>
  export let onChange;

  // list of based music
  const placeholders = [
    'xilent - we are dust',
    'joyryde - brave',
    'phaseone - the risen ep',
    // 'blanke & godlands - hellraiser', // deemix search sucks and this doesnt actually work
    'camellia - blackmagik blazing',
    't+pazolite - without permission',
    'the brig - vindicate',
    'bossfight - next wave',
    'matt doe - g.a.s.',
    'virtual riot - save yourself ep',
    'panda eyes - hold on',
    'clockvice - disgrace',
    'scheme - quake',
    'eliminate - belly of the beast ep',
    'apriskah - mistakes ep',
    'dog blood - turn off the lights',
    'silentroom - memory waves',
    'metaroom - metadata',
    'prismo - nightmare',
    'ray volpe - rise of the volpetron',
    'eliminate - mula',
    'vorso - full tilt',
    'billiummoto - link(init)',
    'voltra - radar dx',
    'zomboy - end game',
    'dr. ozi - host ep',
    'nitepunk - absolute zero',
    '2 mello - sounds of tokyo-to future',
    'must die - crisis vision redux',
    'moe shop - notice',
    'cysmix - escapism',
    'rogue - rattlesnake',
    'all nighter, vol. 7',
    'six impala - rubber',
    'tryple - inner experience',
    'ekcle - deshoda ep',
    'leroy - dariacore',
    'voljum - dayscapes'
  ];
</script>

<input type="search" class="album-search" name="q" on:change={onChange} placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}>

<style>
  input {
    margin: 5px;
    width: 550px;
    max-width: 98%;
    padding: 15px;
    font-size: x-large;
    border: none;
    border-radius: 7px;
    margin-bottom: 0.2rem;
    transition: 0.1s border-bottom ease-out, 0.1s background-color ease-in-out;
  }

  input:focus, input:hover {
    margin-bottom: 0;
    border-bottom-width: 0.25rem;
  }

  @media (prefers-color-scheme: light) {
    input {
      background-color: #ffffff;
      color: #1e1e2d;
      box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
      border-bottom: 0rem solid  #ea74ac;
    }
    input:focus, input:hover {
      background-color: #fafafa;
    }
  }
  @media (prefers-color-scheme: dark) {
    input {
      background-color: #112;
      color: #fff;
      box-shadow: 0px 0px 15px #000;
      border-bottom: 0rem solid  rgb(131, 131, 243);
    }
    input:focus, input:hover {
      background-color: #161626;
    }
  }
</style>