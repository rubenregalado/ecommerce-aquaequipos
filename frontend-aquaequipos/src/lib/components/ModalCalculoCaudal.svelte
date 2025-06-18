<script lang="ts">
  export let mostrar = false;
  export let onClose: () => void;
  export let onCalcular: (caudal: number, datos: any) => void;

  let usarVolumen = false;
  let altura = 0;
  let ancho = 0;
  let largo = 0;
  let volumen = 0;
  let tiempo = 1;

  function calcularCaudal() {
    if (tiempo <= 0) {
      alert("El tiempo debe ser mayor que cero");
      return;
    }

    let caudalCalculado = 0;
    if (usarVolumen) {
      if (volumen <= 0) {
        alert("El volumen debe ser mayor que cero");
        return;
      }
      caudalCalculado = volumen / tiempo;
      onCalcular(caudalCalculado, { volumen, tiempo, modo: 'volumen' });
    } else {
      if (altura <= 0 || ancho <= 0 || largo <= 0) {
        alert("Todas las dimensiones deben ser mayores que cero");
        return;
      }
      const volumenCalculado = altura * ancho * largo;
      caudalCalculado = volumenCalculado / tiempo;
      onCalcular(caudalCalculado, { altura, ancho, largo, tiempo, modo: 'dimensiones' });
    }
    onClose();
  }
</script>

{#if mostrar}
  <div class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative" on:click|stopPropagation>
      <button class="absolute top-2 right-2 text-gray-600 hover:text-black text-lg" on:click={onClose}>✖</button>
      <h2 class="text-xl font-bold mb-4 text-[#0099CC]">Ingresa los datos de tu tanque:</h2>

      <!-- Switch Deslizante -->
      <div class="mb-6 flex items-center space-x-4">
        <span class={usarVolumen ? 'text-gray-400' : 'text-[#0099CC] font-semibold'}>Dimensiones</span>
        <label class="relative inline-block w-12 h-7">
          <input type="checkbox" bind:checked={usarVolumen} class="opacity-0 w-0 h-0" />
          <span
            class="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-colors duration-300"
          ></span>
          <span
            class="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
            style:transform={usarVolumen ? 'translateX(100%)' : 'translateX(0)'}
          ></span>
        </label>
        <span class={usarVolumen ? 'text-[#0099CC] font-semibold' : 'text-gray-400'}>Volumen</span>
      </div>

      {#if usarVolumen}
        <div class="space-y-3">
          <div>
            <label class="block font-medium">📦 Volumen (litros):</label>
            <input type="number" min="0" step="any" bind:value={volumen} class="w-full border px-2 py-1 rounded" placeholder="Ej: 5000" />
          </div>
          <div>
            <label class="block font-medium">⏱ Tiempo deseado para llenar (minutos):</label>
            <input type="number" min="0.1" step="any" bind:value={tiempo} class="w-full border px-2 py-1 rounded" placeholder="Ej: 10" />
          </div>
        </div>
      {:else}
        <div class="space-y-3">
          <div>
            <label class="block font-medium">📏 Profundidad (m):</label>
            <input type="number" min="0" step="any" bind:value={altura} class="w-full border px-2 py-1 rounded" placeholder="Ej: 2.5" />
          </div>
          <div>
            <label class="block font-medium">📐 Ancho (m):</label>
            <input type="number" min="0" step="any" bind:value={ancho} class="w-full border px-2 py-1 rounded" placeholder="Ej: 1.8" />
          </div>
          <div>
            <label class="block font-medium">📏 Largo (m):</label>
            <input type="number" min="0" step="any" bind:value={largo} class="w-full border px-2 py-1 rounded" placeholder="Ej: 3.0" />
          </div>
          <div>
            <label class="block font-medium">⏱ Tiempo deseado para llenar (minutos):</label>
            <input type="number" min="0.1" step="any" bind:value={tiempo} class="w-full border px-2 py-1 rounded" placeholder="Ej: 10" />
          </div>
        </div>
      {/if}

      <div class="flex justify-end space-x-2 mt-4">
        <button on:click={onClose} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
        <button on:click={calcularCaudal} class="px-4 py-2 bg-[#0099CC] text-white rounded hover:bg-blue-700">Calcular</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Opcional: mejora visual del switch */
  input[type="checkbox"]:checked + span {
    background-color: #0099cc;
  }
</style>
