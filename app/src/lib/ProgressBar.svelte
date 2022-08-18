<script>
  export let progress;
  export let success;
</script>

<div class="progress-bar"><div class="progress-bar-inner" style="height:100%;width:{$success === false ? 100 : $progress}%" class:done={$success === true} class:error={$success === false}></div></div>

<style>
  .progress-bar {
    border-radius: 10px;
    width: 100%;
    height: 12px;
  }
  .progress-bar-inner {
    border-radius: 10px;
    transition: 0.2s background-color ease-in-out;
  }

  .progress-bar-inner.done {
    background-color: rgb(131, 243, 131);
  }
  .progress-bar-inner.error {
    background-color: rgb(243, 131, 131);
  }
  @media (prefers-color-scheme: dark) {
    .progress-bar {
      background-color: #0a0a0f;
    }
    .progress-bar-inner {
      background-color: rgb(131, 131, 243);
    }
  }
  @media (prefers-color-scheme: light) {
    .progress-bar {
      background-color: #f0f0f0;
    }
    .progress-bar-inner {
      background-color: #ea74ac;
    }
  }
</style>