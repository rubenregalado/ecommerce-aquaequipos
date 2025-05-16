<script lang="ts">
  export let mostrar: boolean;
  export let resultados: any;
  export let onClose: () => void;
  export let onDescargarPDF: () => void;
</script>

{#if mostrar}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
      <button
        class="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold"
        on:click={onClose}
        aria-label="Cerrar"
      >&times;</button>
      <h2 class="text-2xl font-bold text-[#0099CC] mb-2">Recomendaciones de Bombas</h2>
      <p class="text-sm text-gray-700 mb-2">
        CDT Calculada: <strong>{resultados?.CDT_calculada} m</strong>
      </p>
      <p class="text-sm text-gray-700 mb-4">
        Caudal estimado: <strong>{resultados?.caudal_estimado} L/min</strong>
      </p>
      <div class="flex justify-center mb-4">
        <button
          on:click={onDescargarPDF}
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Descargar Cotización
        </button>
      </div>
      {#each resultados?.resultados as bomba}
        <div class="border rounded p-4 mb-4 bg-gray-50 shadow-sm">
          <h3 class="text-lg font-semibold text-[#0099CC]">{bomba.nombre}</h3>
          <p class="text-sm text-gray-600 mb-1">{bomba.estado}</p>
          <p class="text-sm text-gray-700 mb-1 italic">{bomba.nota_tecnica}</p>
          <p class="text-sm mt-1">🔧 <strong>Rendimiento ideal:</strong> {bomba.rendimiento_sugerido.caudal_aproximado_lmin} L/min a {bomba.rendimiento_sugerido.altura_aproximada_m} m</p>
          {#if bomba.advertencia}
            <p class="text-red-600 text-sm font-semibold">{bomba.advertencia}</p>
          {/if}
          <a href={bomba.url} target="_blank" class="inline-block mt-2 text-[#0099CC] hover:underline">
            Ver producto en tienda 🛒
          </a>
        </div>
      {/each}
    </div>
  </div>
{/if}
