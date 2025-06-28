<script>
  import { onMount, onDestroy } from 'svelte';
  export let open = false;
  export let steps = [];

  let currentStep = 0;

  function next() {
    removeHighlight();
    if (currentStep < steps.length - 1) {
      currentStep++;
      highlight();
    } else {
      close();
    }
  }

  function prev() {
    removeHighlight();
    if (currentStep > 0) {
      currentStep--;
      highlight();
    }
  }

  function close() {
    removeHighlight();
    open = false;
  }

  function highlight() {
    const el = document.querySelector(steps[currentStep].selector);
    if (el) el.classList.add('destacado-tour');
  }

  function removeHighlight() {
    const prevEl = document.querySelector(steps[currentStep]?.selector);
    if (prevEl) prevEl.classList.remove('destacado-tour');
  }

  onMount(() => {
    if (open) highlight();
  });

  onDestroy(() => removeHighlight());

  $: step = steps[currentStep];
</script>

{#if open}
  <div class="tour-backdrop">
    <div class="tour-modal">
      <h2 class="text-lg font-bold">{step.title}</h2>
      <p>{step.description}</p>

      <div class="flex justify-between mt-4">
        <button on:click={prev} disabled={currentStep === 0}>Anterior</button>
        <button on:click={next}>{currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
      </div>
    </div>
  </div>
{/if}

<style>
.tour-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tour-modal {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  z-index: 10001;
}

button {
  background-color: #0099CC;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: gray;
  cursor: not-allowed;
}
</style>
