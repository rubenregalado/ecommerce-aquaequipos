<script lang="ts">
  let aplicacion = "";
  let fase = "";
  let voltaje = "";
  let altura_vertical = 0;
  let longitud_tuberia = 0;
  let numero_codos = 0;
  let diametro_tuberia_pulgadas = "";
  let caudal_manual = 0;
  let calcular_caudal = false;
  let largo = 0;
  let ancho = 0;
  let altura = 0;
  let tiempo_llenado = 0;

  let resultados: any = null;
  let error = "";

  async function enviarFormulario(event: Event) {
    event.preventDefault();
    error = "";
    resultados = null;

    const payload: any = {
      aplicacion,
      fase,
      voltaje,
      altura_vertical: parseFloat(altura_vertical.toString()),
      longitud_tuberia: parseFloat(longitud_tuberia.toString()),
      numero_codos: parseInt(numero_codos.toString()),
      diametro_tuberia: parseFloat(diametro_tuberia_pulgadas)
    };

    if (!calcular_caudal) {
      payload.caudal_manual_lmin = parseFloat(caudal_manual.toString());
    } else {
      payload.tiempo_deseado_minutos = parseFloat(tiempo_llenado.toString());
      payload.dimensiones_tanque = {
        largo: parseFloat(largo.toString()),
        ancho: parseFloat(ancho.toString()),
        altura: parseFloat(altura.toString())
      };
    }

    try {
      const res = await fetch("http://localhost:3000/api/asesoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        resultados = data;
      } else {
        error = data.error || "Ocurrió un error inesperado.";
      }
    } catch (err) {
      error = "No se pudo conectar con el servidor.";
    }
  }
</script>

<main class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6 border border-blue-100">
    <div class="flex justify-center">
      <img src="/logo-principal.svg" alt="Logo AquaEquipos" class="h-20" />
    </div>

    <h1 class="text-3xl font-bold text-[#0099CC] text-center">
      Asesoría Técnica para Bombas de Agua
    </h1>

    <form class="space-y-4" on:submit={enviarFormulario}>
      <!-- Aplicación -->
      <div>
        <label class="block font-medium mb-1 text-gray-700">Aplicación</label>
        <select bind:value={aplicacion} required class="w-full border rounded px-3 py-2">
          <option value="" disabled selected>Seleccione una opción</option>
          <option value="cisterna_tanque">Cisterna con tanque elevado</option>
          <option value="pozo_tanque">Pozo con tanque elevado</option>
          <option value="pozo_hidroneumatico">Pozo con sistema hidroneumático</option>
          <option value="cisterna_hidroneumatico">Cisterna con sistema hidroneumático</option>
        </select>
      </div>

      <!-- Fase -->
      <div>
        <label class="block font-medium mb-1 text-gray-700">Fase eléctrica</label>
        <select bind:value={fase} required class="w-full border rounded px-3 py-2">
          <option value="" disabled selected>Seleccione la fase</option>
          <option value="monofasico">Monofásico</option>
          <option value="trifasico">Trifásico</option>
        </select>
      </div>

      <!-- Voltaje -->
      <div>
        <label class="block font-medium mb-1 text-gray-700">Voltaje</label>
        <select bind:value={voltaje} required class="w-full border rounded px-3 py-2">
          <option value="" disabled selected>Seleccione el voltaje</option>
          <option value="110V">110V</option>
          <option value="230V">230V</option>
          <option value="380V">380V</option>
          <option value="24V">24V (solar)</option>
        </select>
      </div>

      <!-- Altura vertical -->
      <div>
        <label class="block font-medium mb-1 text-gray-700">Altura vertical (m)</label>
        <input type="number" bind:value={altura_vertical} required class="w-full border rounded px-3 py-2" />
      </div>

      <!-- Longitud de tubería -->
      <div>
        <label class="block font-medium mb-1 text-gray-700">Longitud de tubería (m)</label>
        <input type="number" bind:value={longitud_tuberia} required class="w-full border rounded px-3 py-2" />
      </div>

      <!-- Número de codos -->
      <div>
        <label class="block font-medium mb-1 text-gray-700">Número de Accesorios</label>
        <input type="number" bind:value={numero_codos} required class="w-full border rounded px-3 py-2" />
      </div>

      <!-- Diámetro de tubería -->
      <div>
        <label class="block font-medium mb-1 text-gray-700">Diámetro de la tubería (en pulgadas)</label>
        <select bind:value={diametro_tuberia_pulgadas} required class="w-full border rounded px-3 py-2">
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

      <!-- Caudal -->
      <div class="space-y-2">
        <label class="block font-medium text-gray-700">¿Conoce el caudal requerido?</label>
        <label class="inline-flex items-center">
          <input type="checkbox" bind:checked={calcular_caudal} class="mr-2" />
          No lo sé, deseo calcularlo
        </label>

        {#if !calcular_caudal}
          <input type="number" bind:value={caudal_manual} class="w-full border rounded px-3 py-2" placeholder="Ingrese el caudal en L/min" />
        {:else}
          <div class="grid grid-cols-3 gap-2">
            <input type="number" bind:value={largo} class="border rounded px-3 py-2" placeholder="Largo (m)" />
            <input type="number" bind:value={ancho} class="border rounded px-3 py-2" placeholder="Ancho (m)" />
            <input type="number" bind:value={altura} class="border rounded px-3 py-2" placeholder="Altura (m)" />
          </div>
          <input type="number" bind:value={tiempo_llenado} class="w-full border rounded px-3 py-2 mt-2" placeholder="Tiempo deseado (min)" />
        {/if}
      </div>

      <!-- Botón enviar -->
      <div>
        <button type="submit" class="w-full bg-[#0099CC] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Consultar recomendación
        </button>
      </div>

      {#if error}
        <div class="text-red-600 font-semibold">{error}</div>
      {/if}
    </form>

    <!-- Resultados -->
    {#if resultados}
      <div class="mt-8 bg-green-50 border border-green-200 p-4 rounded-lg">
        <h2 class="text-xl font-bold text-[#0099CC] mb-4">Recomendaciones de Bombas</h2>
        <p class="text-sm text-gray-700 mb-2">CDT Calculada: <strong>{resultados.CDT_calculada} m</strong></p>
        <p class="text-sm text-gray-700 mb-4">Caudal estimado: <strong>{resultados.caudal_estimado} L/min</strong></p>

        {#each resultados.resultados as bomba}
          <div class="border rounded p-4 mb-4 bg-white shadow-sm">
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
    {/if}
  </div>
</main>
