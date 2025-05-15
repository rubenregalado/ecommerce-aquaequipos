<script lang="ts">
  export let mostrar = false;
  export let onClose: () => void;
  export let onCalcular: (caudal: number, dimensiones: { altura: number; ancho: number; largo: number; tiempo: number }) => void;

  let altura = 0;
  let ancho = 0;
  let largo = 0;
  let tiempo = 1; // tiempo en minutos, valor por defecto

  function calcularCaudal() {
    if (tiempo <= 0) {
      alert("El tiempo debe ser mayor que cero");
      return;
    }
    const volumen = altura * ancho * largo;
    const caudalCalculado = volumen / tiempo;

    onCalcular(caudalCalculado, { altura, ancho, largo, tiempo });
    onClose();
  }
</script>

{#if mostrar}
  <div class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative" on:click|stopPropagation>
      <button class="absolute top-2 right-2 text-gray-600 hover:text-black text-lg" on:click={onClose}>✖</button>
      <h2 class="text-xl font-bold mb-4 text-[#0099CC]">Calcular Caudal</h2>

      <div class="space-y-3">
        <div>
          <label class="block font-medium">📏 Altura (m):</label>
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
        <div class="flex justify-end space-x-2 mt-4">
          <button on:click={onClose} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
          <button on:click={calcularCaudal} class="px-4 py-2 bg-[#0099CC] text-white rounded hover:bg-blue-700">Calcular</button>
        </div>
      </div>
    </div>
  </div>
{/if}
