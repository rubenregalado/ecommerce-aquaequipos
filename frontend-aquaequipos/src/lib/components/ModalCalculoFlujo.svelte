<script lang="ts">
  export let mostrar = false;
  export let onClose: () => void;
  export let onCalcular: (gpm: number) => void;

  type Accesorio = {
    nombre: string;
    icono: string;
    valor: number;
    gpm: number;
    tooltip?: string;
  };

  let accesorios: Accesorio[] = [
    { nombre: "Baño Completo", icono: "/icons/banio.svg", valor: 1, gpm: 5 },
    { nombre: "Medio Baño", icono: "/icons/mediobanio.svg", valor: 1, gpm: 2 },
    { nombre: "Cocina", icono: "/icons/cocina.svg", valor: 0, gpm: 1 },
    { nombre: "Cuarto de Lavado", icono: "/icons/lavado.svg", valor: 0, gpm: 2 },
    { nombre: "Manguera de Riego", icono: "/icons/manguera.svg", valor: 0, gpm: 4 },
    { nombre: "Grifo", icono: "/icons/grifo.svg", valor: 0, gpm: 1 },
    { 
      nombre: "Gastos Adicionales", 
      icono: "/icons/adicionales.svg", 
      valor: 0, 
      gpm: 1,
      tooltip: "Gastos extras no contemplados comúnmente, por ejemplo: aspersores, tanques, etc."
    },
  ];

  $: totalGPM = accesorios.reduce((sum, acc) => sum + (acc.valor * acc.gpm), 0);

  function incrementar(i: number) {
    accesorios[i].valor++;
    accesorios = [...accesorios];
  }

  function decrementar(i: number) {
    if (accesorios[i].valor > 0) accesorios[i].valor--;
    accesorios = [...accesorios];
  }

  function calcularGPM() {
    onCalcular(totalGPM);
    onClose();
  }
</script>

{#if mostrar}
  <div class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl p-8 relative" on:click|stopPropagation>
      <button class="absolute top-3 right-3 text-purple-500 hover:text-purple-700 text-3xl font-bold" on:click={onClose}>✖</button>
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Estimación de flujo por accesorios</h2>

      <div class="grid grid-cols-3 md:grid-cols-4 gap-y-10 gap-x-6 mb-8">
        {#each accesorios as acc, i}
          <div class="flex flex-col items-center">
            <div class="rounded-full bg-gray-100 flex items-center justify-center w-28 h-28 mb-2 shadow-sm relative group">
              <img src={acc.icono} alt={acc.nombre} class="w-16 h-16 object-contain" />
              {#if acc.tooltip}
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="tooltip-container relative">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-0 hover:opacity-70 group-hover:opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="tooltip-text">
                      {acc.tooltip}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
            <div class="font-semibold text-gray-700 text-center mb-2">{acc.nombre}</div>
            <div class="flex items-center space-x-2">
              <button class="btn-circular" on:click={() => decrementar(i)}>-</button>
              <input
                class="w-10 text-center border-2 border-[#0099CC] rounded font-bold cantidad-input"
                type="text"
                readonly
                value={acc.valor}
                tabindex="-1"
              />
              <button class="btn-circular" on:click={() => incrementar(i)}>+</button>
            </div>
          </div>
        {/each}
      </div>

      <div class="flex justify-center items-center gap-4 mt-6">
        <span class="flex items-center text-blue-700 font-bold text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path stroke="currentColor" stroke-width="2" d="M12 8v4m0 4h.01" /></svg>
          Total = {totalGPM} GPM
        </span>
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded transition" on:click={calcularGPM}>
          Listo
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .btn-circular {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #0099CC;
    color: #0099CC;
    background: #fff;
    font-size: 1.5rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
  }
  .btn-circular:hover {
    background: #0099CC;
    color: #fff;
  }
  .cantidad-input {
    background: #fff;
    color: #0099CC;
    font-weight: bold;
    font-size: 1.4rem;
    width: 48px;
    height: 48px;
    text-align: center;
    border-radius: 8px;
    border: 2px solid #0099CC;
    outline: none;
    box-shadow: none;
    pointer-events: none;
    margin: 0 4px;
  }
  .tooltip-container {
    position: relative;
    display: inline-block;
  }
  .tooltip-text {
    visibility: hidden;
    width: 240px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 10px;
    position: absolute;
    z-index: 1;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .tooltip-container:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
</style>
