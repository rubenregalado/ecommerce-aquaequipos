<script lang="ts">
  export let mostrar = false;
  export let onClose: () => void;
  export let onCalcular: (gpm: number) => void;

  let banos = 0;
  let duchas = 0;
  let lavamanos = 0;
  let lavadoras = 0;

  // Variables para "Otros" con tipo que permite cadena vacía
  let otros: Array<{ cantidad: number; gpm: number }> = [];
  let nuevoOtroCantidad: number | '' = '';
  let nuevoOtroGPM: number | '' = '';

  function agregarOtro() {
    if (nuevoOtroCantidad !== '' && nuevoOtroGPM !== '') {
      otros = [...otros, { cantidad: Number(nuevoOtroCantidad), gpm: Number(nuevoOtroGPM) }];
      // Limpia los inputs para mostrar placeholder
      nuevoOtroCantidad = '';
      nuevoOtroGPM = '';
    }
  }

  function eliminarOtro(index: number) {
    otros = otros.filter((_, i) => i !== index);
  }

  function calcularGPM() {
    const gpmOtros = otros.reduce((acc, item) => acc + (item.cantidad * item.gpm), 0);
    const gpm = (banos * 8) + (duchas * 5) + (lavamanos * 2) + (lavadoras * 4) + gpmOtros;
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
          <input type="number" bind:value={banos} min="0" class="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label class="block font-medium">🚿 Duchas:</label>
          <input type="number" bind:value={duchas} min="0" class="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label class="block font-medium">🧼 Lavamanos:</label>
          <input type="number" bind:value={lavamanos} min="0" class="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label class="block font-medium">🧺 Lavadoras:</label>
          <input type="number" bind:value={lavadoras} min="0" class="w-full border px-2 py-1 rounded" />
        </div>

        <!-- Sección "Otros" -->
        <div>
          <label class="block font-medium">🔧 Otros accesorios:</label>
          <div class="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="Cantidad de accesorios. Ejemplo: Aspersor"
              bind:value={nuevoOtroCantidad}
              min="0"
              class="w-1/2 border px-2 py-1 rounded"
            />
            <input
              type="number"
              placeholder="¿Cuántos GPM consume?"
              bind:value={nuevoOtroGPM}
              min="0"
              class="w-1/2 border px-2 py-1 rounded"
            />
          </div>
          <button
            on:click={agregarOtro}
            class="w-full mb-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            disabled={nuevoOtroCantidad === '' || nuevoOtroGPM === ''}
          >
            ➕ Añadir
          </button>

          {#if otros.length > 0}
            <div class="space-y-1 max-h-32 overflow-auto border rounded p-2 bg-gray-50">
              {#each otros as item, i (i)}
                <div class="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                  <span>{item.cantidad} x {item.gpm} GPM</span>
                  <button
                    on:click={() => eliminarOtro(i)}
                    class="text-red-500 hover:text-red-700 font-bold"
                    aria-label="Eliminar accesorio"
                  >
                    ✕
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button on:click={onClose} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
          <button on:click={calcularGPM} class="px-4 py-2 bg-[#0099CC] text-white rounded hover:bg-blue-700">Calcular</button>
        </div>
      </div>
    </div>
  </div>
{/if}
