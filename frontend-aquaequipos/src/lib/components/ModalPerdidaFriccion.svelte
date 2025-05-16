<script lang="ts">
  export let mostrar = false;
  export let onClose: () => void;

  let altura = 0;
  let material = "PVC";
  let diametro = "";
  let longitud = 0;
  let perdidaFriccion = 0;
   import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function calcular() {
    const resultado = 1;
    dispatch('guardar', resultado);
    dispatch('close');
  }

  const coeficienteFriccion = {
    PVC: 150 // coeficiente de Hazen-Williams aproximado
  };

  function calcularPerdida() {
    const c = coeficienteFriccion[material];
    const d = parseFloat(diametro); // en pulgadas
    const l = longitud; // en metros

    if (c && d && l) {
      // fórmula simplificada para pérdida por fricción
      perdidaFriccion = (4.52 * l) / (c ** 1.85 * d ** 4.87);
    }
  }
</script>

{#if mostrar}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <button class="absolute top-2 right-2 text-gray-600 hover:text-black" on:click={onClose}>✖</button>
      <h2 class="text-xl font-bold mb-4">Calcular Pérdida por Fricción</h2>

      <div class="space-y-3">
        <div>
          <label>Altura vertical (m):</label>
          <input type="number" bind:value={altura} class="w-full border px-2 py-1 rounded" />
        </div>

        <div>
          <label>Material de la tubería:</label>
          <select bind:value={material} class="w-full border px-2 py-1 rounded">
            <option value="PVC">PVC</option>
          </select>
        </div>

        <div>
          <label>Diámetro de la tubería (pulgadas):</label>
          <select bind:value={diametro} class="w-full border px-2 py-1 rounded">
            <option value="" disabled selected>Seleccione el diámetro</option>
            <option value="0.5">1/2"</option>
            <option value="0.75">3/4"</option>
            <option value="1">1"</option>
            <option value="1.25">1 1/4"</option>
            <option value="1.5">1 1/2"</option>
            <option value="2">2"</option>
            <option value="2.5">2 1/2"</option>
            <option value="3">3"</option>
            <option value="4">4"</option>
          </select>
        </div>

        <div>
          <label>Longitud de la tubería (m):</label>
          <input type="number" bind:value={longitud} class="w-full border px-2 py-1 rounded" />
        </div>

        <div class="mt-4">
          <button on:click={calcularPerdida} class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Calcular Pérdida
          </button>
        </div>

        {#if perdidaFriccion}
          <div class="mt-3 text-green-700 font-semibold">
            Pérdida por fricción estimada: {perdidaFriccion.toFixed(2)} m
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
