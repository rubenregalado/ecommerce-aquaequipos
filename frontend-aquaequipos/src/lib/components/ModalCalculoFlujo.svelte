<script lang="ts">
  export let mostrar = false;
  export let onClose: () => void;
  export let onCalcular: (gpm: number) => void;

  let banos = 0;
  let duchas = 0;
  let lavamanos = 0;
  let lavadoras = 0;

  function calcularGPM() {
    const gpm = (banos * 8) + (duchas * 5) + (lavamanos * 2) + (lavadoras * 4); // ejemplo básico
    onCalcular(gpm);
    onClose();
  }
</script>

{#if mostrar}
  <div class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative" on:click|stopPropagation>
      <button class="absolute top-2 right-2 text-gray-600 hover:text-black text-lg" on:click={onClose}>✖</button>
      <h2 class="text-xl font-bold mb-4 text-[#0099CC]">Calcular Flujo (GPM)</h2>

      <div class="space-y-3">
        <div>
          <label class="block font-medium">🛁 Baños:</label>
          <input type="number" bind:value={banos} class="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label class="block font-medium">🚿 Duchas:</label>
          <input type="number" bind:value={duchas} class="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label class="block font-medium">🧼 Lavamanos:</label>
          <input type="number" bind:value={lavamanos} class="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label class="block font-medium">🧺 Lavadoras:</label>
          <input type="number" bind:value={lavadoras} class="w-full border px-2 py-1 rounded" />
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button on:click={onClose} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
          <button on:click={calcularGPM} class="px-4 py-2 bg-[#0099CC] text-white rounded hover:bg-blue-700">Calcular</button>
        </div>
      </div>
    </div>
  </div>
{/if}
