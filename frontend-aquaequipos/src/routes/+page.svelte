<script lang="ts">
  import jsPDF from 'jspdf';
  import ModalCalculoFlujo from '$lib/components/ModalCalculoFlujo.svelte';
  import ModalPerdidaFriccion from '$lib/components/ModalPerdidaFriccion.svelte';

  let mostrarModalFriccion = false;
  let mostrarModalFlujo = false;
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
  let cargando = false;
  let resultados: any = null;
  let error = "";

  async function enviarFormulario(event: Event) {
    event.preventDefault();
    error = "";
    resultados = null;
    cargando = true;

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
      console.error(err);
      error = "No se pudo conectar con el servidor.";
    } finally {
      cargando = false;
    }
  }
  
  function asignarCaudalDesdeModal(gpm: number) { //Funcion ASIGNARCAUDAL
  caudal_manual = gpm;
  }

  function descargarPDF() {
    if (!resultados) return;

    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text("Recomendación de Bombas de Agua", 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`CDT Calculada: ${resultados.CDT_calculada} m`, 10, y);
    y += 7;
    doc.text(`Caudal estimado: ${resultados.caudal_estimado} L/min`, 10, y);
    y += 10;

    resultados.resultados.forEach((bomba: any, index: number) => {
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${bomba.nombre}`, 10, y);
      y += 7;

      doc.setFontSize(11);
      doc.text(`Estado: ${bomba.estado}`, 12, y);
      y += 5;

      doc.text(`Nota técnica: ${bomba.nota_tecnica}`, 12, y);
      y += 5;

      doc.text(`Rendimiento: ${bomba.rendimiento_sugerido.caudal_aproximado_lmin} L/min a ${bomba.rendimiento_sugerido.altura_aproximada_m} m`, 12, y);
      y += 5;

      if (bomba.advertencia) {
        doc.setTextColor(200, 0, 0);
        doc.text(`Advertencia: ${bomba.advertencia}`, 12, y);
        doc.setTextColor(0, 0, 0);
        y += 5;
      }

      y += 5;
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save('recomendacion-bombas.pdf');
  }
</script>

<main class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6 border border-blue-100">
    <div class="flex justify-center">
      <img src="/logo-principal.svg" alt="Logo AquaEquipos" class="h-20" />
    </div>
    <h1 class="text-3xl font-bold text-[#0099CC] text-center">Asesoría Técnica para Bombas de Agua</h1>

    <form class="space-y-4" on:submit={enviarFormulario}>
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

      {#if aplicacion}
      <div>
        <label class="block font-medium mb-1 text-gray-700">Fase eléctrica</label>
        <select bind:value={fase} required class="w-full border rounded px-3 py-2">
          <option value="" disabled selected>Seleccione la fase</option>
          <option value="monofasico">Monofásico</option>
          <option value="trifasico">Trifásico</option>
          <option value="solar">Panel Solar</option>
        </select>
      </div>
      {/if}

      {#if fase}
      <div>
        <label class="block font-medium mb-1 text-gray-700">Voltaje</label>
          <select bind:value={voltaje} required class="w-full border rounded px-3 py-2">
      <option value="" disabled selected>Seleccione el voltaje</option>
      {#if fase === 'monofasico'}
        <option value="110V">110V</option>
        <option value="220V">220V</option>
      {:else if fase === 'trifasico'}
        <option value="220V">220V</option>
        <option value="480V">480V</option>
      {:else if fase === 'solar'}
        <option value="12V">12V</option>
      {/if}
    </select>

{#if aplicacion?.toLowerCase().includes('hidroneumatico') && voltaje}
  <div class="flex justify-end mt-2">
    <button
      type="button"
      on:click={() => mostrarModalFriccion = true}
      class="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition"
    >
      Calcular pérdida por fricción
    </button>
  </div>
{/if}

      </div>
      {/if}

      {#if voltaje}
      <div>
        <label class="block font-medium mb-1 text-gray-700">Altura vertical (m)</label>
        <input type="number" bind:value={altura_vertical} required class="w-full border rounded px-3 py-2" />
      </div>
      {/if}

      {#if altura_vertical}
      <div>
        <label class="block font-medium mb-1 text-gray-700">Longitud de tubería (m)</label>
        <input type="number" bind:value={longitud_tuberia} required class="w-full border rounded px-3 py-2" />
      </div>
      {/if}

      {#if longitud_tuberia}
      <div>
        <label class="block font-medium mb-1 text-gray-700">Número de accesorios</label>
        <input type="number" bind:value={numero_codos} required class="w-full border rounded px-3 py-2" />
      </div>
      {/if}

      {#if numero_codos}
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
      {/if}

      {#if diametro_tuberia_pulgadas}
      <div class="space-y-2">
        <label class="block font-medium text-gray-700">¿Conoce el caudal requerido?</label>
        <label class="inline-flex items-center">
          <input type="checkbox" bind:checked={calcular_caudal} class="mr-2" />
          No lo sé, deseo calcularlo
        </label>

        {#if !calcular_caudal}
          <div class="flex items-center space-x-2">
            <input type="number" bind:value={caudal_manual} class="border rounded px-3 py-2 w-full" placeholder="Ingrese el caudal en L/min" />
            {#if aplicacion.toLowerCase().includes("hidroneumatico")}
              <button type="button" on:click={() => mostrarModalFlujo = true} class="bg-gray-700 text-white font-bold px-3 py-2 rounded hover:bg-gray-800">
                Calcular Flujo
              </button>
            {/if}
          </div>


        {:else}
          <div class="grid grid-cols-3 gap-2">
            <input type="number" bind:value={largo} class="border rounded px-3 py-2" placeholder="Largo (m)" />
            <input type="number" bind:value={ancho} class="border rounded px-3 py-2" placeholder="Ancho (m)" />
            <input type="number" bind:value={altura} class="border rounded px-3 py-2" placeholder="Altura (m)" />
          </div>
          <input type="number" bind:value={tiempo_llenado} class="w-full border rounded px-3 py-2 mt-2" placeholder="Tiempo deseado (min)" />
        {/if}
      </div>
      {/if}

      <div>
        <button type="submit" class="w-full bg-[#0099CC] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center" disabled={cargando}>
          {#if cargando}
            <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Cargando...
          {:else}
            Consultar recomendación
          {/if}
        </button>
      </div>

      {#if resultados}
      <div class="mt-8 bg-green-50 border border-green-200 p-4 rounded-lg">
        <h2 class="text-xl font-bold text-[#0099CC] mb-4">Recomendaciones de Bombas</h2>
        <p class="text-sm text-gray-700 mb-2">CDT Calculada: <strong>{resultados.CDT_calculada} m</strong></p>
        <p class="text-sm text-gray-700 mb-4">Caudal estimado: <strong>{resultados.caudal_estimado} L/min</strong></p>
        <div class="flex justify-center mt-4">
          <button on:click={descargarPDF} class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Descargar Cotización
          </button>
        </div>

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

      <ModalPerdidaFriccion
      mostrar={mostrarModalFriccion}
      onClose={() => mostrarModalFriccion = false}
      />

      <ModalCalculoFlujo
        mostrar={mostrarModalFlujo}
        onClose={() => mostrarModalFlujo = false}
        onCalcular={asignarCaudalDesdeModal}
      />


    </form>
  </div>
</main>
