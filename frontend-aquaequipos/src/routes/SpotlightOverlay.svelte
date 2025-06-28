<script>
  import { onMount, afterUpdate } from 'svelte';

  export let targetSelector = '';
  export let mensaje = '';
  export let visible = false;

  let spotlightStyle = '';

  function recalcularSpotlight() {
    const el = document.querySelector(targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      const padding = 10;
      const radius = Math.max(rect.width, rect.height) / 2 + padding;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      spotlightStyle = `
        radial-gradient(
          circle at ${centerX}px ${centerY}px,
          transparent ${radius}px,
          rgba(0, 0, 0, 0.6) ${radius + 10}px
        )
      `;
      document.documentElement.style.setProperty('--spotlight-background', spotlightStyle);
    }
  }

  // Espera que el DOM cargue
  onMount(() => {
    setTimeout(() => {
      if (visible) recalcularSpotlight();
    }, 200);
  });

  // Si visible cambia, vuelve a calcular
  afterUpdate(() => {
    if (visible) {
      setTimeout(() => {
        recalcularSpotlight();
      }, 200);
    }
  });
</script>

{#if visible && spotlightStyle}
  <div class="overlay" on:click={() => visible = false}>
    <div class="mensaje" on:click|stopPropagation>
      <span>{mensaje}</span>
      <button on:click={() => visible = false}>Entendido</button>
    </div>
  </div>
{/if}

<style>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  background: var(--spotlight-background);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mensaje {
  z-index: 9999;
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  max-width: 80vw;
  text-align: center;
}

.mensaje button {
  margin-top: 1rem;
  background: #0099cc;
  color: white;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

:global(:root) {
  --spotlight-background: none;
}
</style>
