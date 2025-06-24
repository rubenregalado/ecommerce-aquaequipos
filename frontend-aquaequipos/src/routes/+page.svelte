<script lang="ts">
  
  let resultados: any = null;
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';
  import { onMount } from 'svelte';
  import { logoBase64 } from './logobase64.js';
  import ModalDatos from '$lib/components/ModalDatos.svelte';
  import Chatbot from '../routes/chatbotfe.svelte';
  import '$lib/pdf-fonts/NotoEmoji-normal';
  import ModalCalculoFlujo from '$lib/components/ModalCalculoFlujo.svelte';
  import ModalPerdidaFriccion from '$lib/components/ModalPerdidaFriccion.svelte';
  import ModalCalculoCaudal from '$lib/components/ModalCalculoCaudal.svelte';
  import ModalResultados from '$lib/components/ModalResultados.svelte';
  
  

  let modalOpen = false;
  let datosCliente = null;

    type Producto = {
      id: number;
      name: string;
      price: string;
      regular_price: string;
      image: string | null;
    };

    let productos: Producto[] = [];
    let cargandoProductos = true;
    let errorProductos = "";
    

    onMount(async () => {
      try {
        const res = await fetch('http://localhost:3000/productos');
        if (!res.ok) throw new Error('No se pudieron cargar los productos');
        productos = await res.json();
      } catch (e) {
        errorProductos = "Error al cargar productos";
        console.error(e);
      } finally {
        cargandoProductos = false;
      }
    });

  let mostrarModalFriccion = false;
  let mostrarModalFlujo = false;
  let mostrarModalCaudalDimensiones = false;
  let mostrarModalResultados = false

  
  let aplicacion = "";
  let fase = "";
  let voltaje = "";
  let altura_vertical = "";
  let longitud_tuberia = "";
  let numero_codos = "";
  let diametro_tuberia_pulgadas = "";
  let caudal_manual = "";

  // Para cálculo por dimensiones
  let dimensiones = { altura: 0, ancho: 0, largo: 0, tiempo: 0 };

  let cargando = false;
  let error = "";

    async function toDataURL(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Función para extraer MIME y Base64 puro del DataURL
    function parseBase64Image(dataURL) {
      const matches = dataURL.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Formato Base64 inválido');
      }
      return {
        mimeType: matches[1], // ej. image/jpeg o image/png
        base64Data: matches[2]
      };
    }

    async function onDescargarPDF() {
      descargarPDF();
    }

    function crearPDF(): jsPDF {
      const doc = new jsPDF({ unit: 'mm', format: [216, 279], orientation: 'portrait' });
      doc.setFont('NotoColorEmoji-Regular');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(logoBase64, 'JPEG', 0, 0, pageWidth, pageHeight);

      let y = 40;
      const marginX = 15;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor('#003366');
      doc.text("Recomendación de Bombas de Agua", pageWidth / 2, y, { align: 'center' });
      y += 12;

      doc.setDrawColor('#003366');
      doc.setLineWidth(0.8);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 10;

      doc.setFontSize(12);
      doc.setTextColor('#000');
      doc.text(`NIT: ${datosCliente.nit}`, marginX, y);
      doc.text(`CELULAR: ${datosCliente.celular}`, marginX + 90, y);
      y += 7;

      doc.text(`DIRECCIÓN: ${datosCliente.direccion}`, marginX, y);
      doc.text(`NOMBRE: ${datosCliente.nombre}`, marginX + 90, y);
      y += 7;

      doc.setDrawColor('#003366');
      doc.setLineWidth(0.8);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 10;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      doc.text(`CDT Calculada: ${resultados.CDT_calculada} m`, marginX, y);
      doc.text(`Caudal estimado: ${resultados.caudal_estimado} L/min`, marginX + 100, y);
      y += 8;

      doc.text(`NOTA TÉCNICA: ${resultados.resultados[0].nota_tecnica}`, marginX, y);
      y += 8;

      doc.setDrawColor('#003366');
      doc.setLineWidth(0.8);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 5;

      const tableBody = resultados.resultados.map((bomba, index) => [
        `${index + 1}`,
        bomba.nombre,
        bomba.estado,
        `${bomba.rendimiento_sugerido.caudal_aproximado_lmin} L/min a ${bomba.rendimiento_sugerido.altura_aproximada_m} m` +
          (bomba.advertencia ? `\n⚠️ ${bomba.advertencia}` : ''),
        bomba.price ? `Q${bomba.price}.00` : 'N/A',
        ''
      ]);

      autoTable(doc, {
        startY: y,
        head: [['N°', 'Nombre', 'Estado', 'Rendimiento', 'Precio']],
        body: tableBody,
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 2,
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [0, 51, 102],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 65 },
          2: { cellWidth: 45 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 },
          5: { cellWidth: 20 },
        },
        margin: { left: marginX, right: marginX },

        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 2) {
            const estado = data.cell.raw;
            if (estado === 'Dentro del rango ideal de operación') {
              data.cell.styles.textColor = [0, 150, 0]; // verde
            } else if (estado === 'No cumple con el caudal requerido') {
              data.cell.styles.textColor = [200, 0, 0]; // rojo
            } else if (estado === 'Funciona, pero fuera del rango ideal') {
              data.cell.styles.textColor = [255, 165, 0]; // amarillo
            }
          }
        },

        didDrawCell: function (data) {
          if (data.column.index === 6 && data.cell.section === 'body') {
            const imgData = resultados.resultados[data.row.index].image;
            if (imgData) {
              const dim = 15;
              const x = data.cell.x + (data.cell.width - dim) / 2;
              const y = data.cell.y + 2;
              try {
                doc.addImage(imgData, 'JPEG', x, y, dim, dim);
              } catch (e) {
                console.warn('Error cargando imagen en PDF:', e);
              }
            }
          }
        }
      });


      const fecha = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor('#666666');
      doc.text(`Fecha de emisión: ${fecha}`, marginX, pageHeight - 10);
      doc.text('Asesoría técnica de selección de bombas © 2025', pageWidth - marginX, pageHeight - 10, { align: 'right' });

      return doc;
    }


    async function enviarPDFPorCorreo() {
  
  const doc = crearPDF();
  const pdfBlob = doc.output('blob');

      
  const formData = new FormData();
  formData.append('pdf', pdfBlob, 'cotizacion.pdf');
  formData.append('nombre', datosCliente?.nombre || 'Usuario');
  formData.append('celular', datosCliente?.celular || 'sincorreo@ejemplo.com');

  try {
    const res = await fetch('http://localhost:3000/api/cotizacion/enviar-cotizacion', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Error al enviar PDF por correo:', data.error);
      alert('Error al enviar el correo.');
    }
  } catch (error) {
    console.error('Fallo la petición:', error);
    alert('No se pudo enviar el correo.');
  }
}


    async function onCerrarModal() {
    modalOpen = false;
  }

  async function onAbrirModal() {
    modalOpen = true;
  }


  async function onDatosSubmit(event) {
    datosCliente = event.detail;
    modalOpen = false;

    //await prepararImagenes();
    descargarPDF(datosCliente); // descarga local para el usuario
    await enviarPDFPorCorreo(); // envío al correo
  }

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
      diametro_tuberia: parseFloat(diametro_tuberia_pulgadas),
      caudal_manual_lmin: parseFloat(caudal_manual.toString())
    };

    // Si se usó el cálculo por dimensiones, enviamos también las dimensiones
    if (
      (aplicacion === 'cisterna_tanque' || aplicacion === 'pozo_tanque') &&
      dimensiones.altura && dimensiones.ancho && dimensiones.largo && dimensiones.tiempo
    ) {
      payload.dimensiones_tanque = { ...dimensiones };
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

  // Para ModalCalculoFlujo (hidroneumático) - recibe GPM, lo convierte a L/min
  function asignarCaudalDesdeModal(gpm: number) {
    caudal_manual = Math.round(gpm * 3.78541); // 1 GPM ≈ 3.78541 L/min
  }

  // Para Modal de dimensiones (tanque elevado)
  function asignarCaudalDesdeDimensiones(caudal: number, dims: { altura: number; ancho: number; largo: number; tiempo: number }) {
    caudal_manual = Math.round(caudal);
    dimensiones = dims;
  }

  // Base64 de tu hoja membretada (extraído de tu archivo adjunto)
  const membreteImg = {
      image: logoBase64,
      width: 150 
    };

  function descargarPDF() {
  if (!resultados) {
    alert('No hay datos para generar el PDF.');
    return;
  }

  const doc = new jsPDF({ unit: 'mm', format: [216, 279], orientation: 'portrait' });
  doc.setFont('NotoColorEmoji-Regular');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.addImage(logoBase64, 'JPEG', 0, 0, pageWidth, pageHeight);

  let y = 40;
  const marginX = 15; 

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor('#003366');
  doc.text("Recomendación de Bombas de Agua", pageWidth / 2, y, { align: 'center' });
  y += 12;

  doc.setDrawColor('#003366');
  doc.setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;

  // Imprime datos del cliente arriba
  doc.setFontSize(12);
  doc.setTextColor('#000');

  // Primera línea: NIT y celular
  doc.text(`NIT: ${datosCliente.nit}`, marginX, y);
  doc.text(`CELULAR: ${datosCliente.celular}`, marginX + 90, y); // Ajusta 90 según el ancho de tu hoja y tus datos
  y += 7;

  // Segunda línea: Nombre y Dirección
  doc.text(`Dirección: ${datosCliente.direccion}`, marginX, y);
  doc.text(`Nombre: ${datosCliente.nombre}`, marginX + 90, y); // Ajusta 90 según necesidad
  y += 7;

  doc.setDrawColor('#003366');
  doc.setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor('#000000');
  // CDT a la izquierda
  doc.text(`CDT Calculada: ${resultados.CDT_calculada} m`, marginX, y);

  // Caudal a la derecha (ajusta el valor 100 según espacio disponible)
  doc.text(`Caudal estimado: ${resultados.caudal_estimado} L/min`, marginX + 100, y);

  y += 8; // Avanza la línea para el siguiente texto

  // Nota técnica abajo en línea separada
  doc.text(`NOTA TÉCNICA: ${resultados.resultados[0].nota_tecnica}`, marginX, y);
  y += 8;

  doc.setDrawColor('#003366');
  doc.setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 5;

  const tableBody = resultados.resultados.map((bomba, index) => [
    `${index + 1}`,
    bomba.nombre,
    bomba.estado,
     `${bomba.rendimiento_sugerido.caudal_estimado_a_esa_altura_lmin} L/min a ${resultados.CDT_calculada} m` +
    (bomba.advertencia ? `\n⚠️ ${bomba.advertencia}` : ''),
    bomba.price ? `Q${bomba.price}.00` : 'N/A',
    '' // Celda vacía para la imagen, que se dibujará con didDrawCell
  ]);


  autoTable(doc, {
    startY: y,
    head: [['N°', 'Nombre', 'Estado', 'Rendimiento', 'Precio']],
    body: tableBody,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 2,
      valign: 'middle',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 65 },
      2: { cellWidth: 45 },
      3: { cellWidth: 35 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 },
    },
    margin: { left: marginX, right: marginX },

    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 2) {
        const estado = data.cell.raw;
        if (estado === 'Dentro del rango ideal de operación') {
          data.cell.styles.textColor = [0, 150, 0]; // verde
        } else if (estado === 'No cumple con el caudal requerido') {
          data.cell.styles.textColor = [200, 0, 0]; // rojo
        } else if (estado === 'Funciona, pero fuera del rango ideal') {
          data.cell.styles.textColor = [255, 165, 0]; // amarillo
        }
      }
    },

    didDrawCell: function (data) {
      if (data.column.index === 6 && data.cell.section === 'body') {
        const imgData = resultados.resultados[data.row.index].image;
        if (imgData) {
          const dim = 15;
          const x = data.cell.x + (data.cell.width - dim) / 2;
          const y = data.cell.y + 2;
          try {
            doc.addImage(imgData, 'JPEG', x, y, dim, dim);
          } catch (e) {
            console.warn('Error cargando imagen en PDF:', e);
          }
        }
      }
    }
  });



  const fecha = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor('#666666');
  doc.text(`Fecha de emisión: ${fecha}`, marginX, pageHeight - 10);
  doc.text('Asesoría técnica de selección de bombas © 2025', pageWidth - marginX, pageHeight - 10, { align: 'right' });

  doc.save('recomendacion-bombas.pdf');

  
}

</script>


<!-- MODAL DE CÁLCULO DE CAUDAL POR DIMENSIONES -->
<ModalCalculoCaudal
  mostrar={mostrarModalCaudalDimensiones}
  onClose={() => mostrarModalCaudalDimensiones = false}
  onCalcular={asignarCaudalDesdeDimensiones}
/>

<!-- MODAL DE CÁLCULO DE FLUJO -->
<ModalCalculoFlujo
  mostrar={mostrarModalFlujo}
  onClose={() => mostrarModalFlujo = false}
  onCalcular={asignarCaudalDesdeModal}
/>

<!-- MODAL DE PÉRDIDA DE FRICCIÓN -->
<ModalPerdidaFriccion
  mostrar={mostrarModalFriccion}
  onClose={() => mostrarModalFriccion = false}
/>

<ModalDatos
  open={modalOpen}
  on:submit={onDatosSubmit}
  on:close={onCerrarModal}
/>

<main class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6 border border-blue-100">
    <div class="flex justify-center">
      <img src="/logo-principal.svg" alt="Logo AquaEquipos" class="h-20" />
    </div>
    <h1 class="text-3xl font-bold text-[#0099CC] text-center">Asesoría Técnica para Bombas de Agua</h1>

    <!-- GRID de dos columnas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- FORMULARIO -->
      <form class="space-y-4" on:submit={enviarFormulario}>
        <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <label class="block font-medium text-gray-700">Aplicación</label>
          <span class="relative group cursor-pointer">
            <span class="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">?</span>
            <div class="absolute z-10 w-64 text-sm text-white bg-gray-700 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-full top-1/2 -translate-y-1/2 ml-2">
              ¿Qué trabajo necesita que realice el equipo de bombeo? Esto ayuda a elegir la bomba adecuada: por ejemplo, 
              si es para llenar un tanque desde una cisterna o extraer agua de un pozo con presión.
            </div>
          </span>
        </div>
        <select bind:value={aplicacion} required class="w-full border rounded px-3 py-2">
          <option value="" disabled selected>Seleccione una opción</option>
          <option value="cisterna_tanque">Cisterna con tanque elevado</option>
          <option value="pozo_tanque">Pozo con tanque elevado</option>
          <option value="pozo_hidroneumatico">Pozo con sistema hidroneumático</option>
          <option value="cisterna_hidroneumatico">Cisterna con sistema hidroneumático</option>
        </select>
      </div>

      {#if aplicacion}
      <!-- Fase eléctrica -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <label class="block font-medium text-gray-700">Fase eléctrica</label>
          <span class="relative group cursor-pointer">
            <span class="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">?</span>
            <div class="absolute z-10 w-64 text-sm text-white bg-gray-700 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-full top-1/2 -translate-y-1/2 ml-2">
              ¿Qué tipo de energía utilizará la bomba? 
              La fase eléctrica depende del tipo de instalación: uso en casa, industrial o uso de paneles solares.
              <br/>• Monofásico: común en casas. 
              <br/>• Trifásico: usado en industrias. 
              <br/>• Solar: si usará paneles solares.
            </div>
          </span>
        </div>
        <select bind:value={fase} required class="w-full border rounded px-3 py-2">
          <option value="" disabled selected>Seleccione la fase</option>
          <option value="monofasico">Monofásico</option>
          <option value="trifasico">Trifásico</option>
          <option value="solar">Panel Solar</option>
        </select>
      </div>
      {/if}

      {#if fase}
      <!-- Voltaje -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <label class="block font-medium text-gray-700">Voltaje</label>
          <span class="relative group cursor-pointer">
            <span class="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">?</span>
            <div class="absolute z-10 w-64 text-sm text-white bg-gray-700 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-full top-1/2 -translate-y-1/2 ml-2">
              El voltaje depende del tipo de conexión eléctrica disponible:
              <br/>• 110V y 220V: comunes en casas.
              <br/>• 220V y 480V: para industrias.
              <br/>• 12V / 24V / Inversor: si usa energía solar.
            </div>
          </span>
        </div>
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
            <option value="24V">24V</option>
            <option value="Inversor">Inversor</option>
          {/if}
        </select>
      </div>
      {/if}

      {#if voltaje}
      <!-- Altura vertical -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <label class="block font-medium text-gray-700">Altura vertical (m)</label>
          <span class="relative group cursor-pointer">
            <span class="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">?</span>
            <div class="absolute z-10 w-64 text-sm text-white bg-gray-700 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-full top-1/2 -translate-y-1/2 ml-2">
              Altura donde se encuentra el tanque que desea llenar desde la cisterna/pozo.
            </div>
          </span>
        </div>
        <input type="number" bind:value={altura_vertical} required class="w-full border rounded px-3 py-2" />
      </div>
      {/if}

      {#if altura_vertical}
      <!-- Longitud de tubería -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <label class="block font-medium text-gray-700">Longitud Horizontal de tubería (m)</label>
          <span class="relative group cursor-pointer">
            <span class="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">?</span>
            <div class="absolute z-10 w-64 text-sm text-white bg-gray-700 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-full top-1/2 -translate-y-1/2 ml-2">
              Cantidad, en metros, de tubería utilizada hasta llegar al tanque.
            </div>
          </span>
        </div>
        <input type="number" bind:value={longitud_tuberia} required class="w-full border rounded px-3 py-2" />
      </div>
      {/if}


      {#if longitud_tuberia}
        <div>
          <label class="block font-medium mb-1 text-gray-700">Número de accesorios</label>
          <input
            type="number"
            bind:value={numero_codos}
            required
            class="w-full border rounded px-3 py-2"
            placeholder="Ejemplo: 4 (codos, te's, válvulas, etc.)"
          />
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
        {#if aplicacion === 'cisterna_tanque' || aplicacion === 'pozo_tanque'}
          <div class="space-y-2">
            <label class="block font-medium text-gray-700 mb-1">Caudal requerido (L/min)</label>
            <div class="flex items-center space-x-2">
              <input
                type="number"
                bind:value={caudal_manual}
                class="w-75 border px-2 h-9 text-sm rounded"
                placeholder="Ingrese el caudal en L/min o calcúlelo"
              />
             <button
              on:click={() => mostrarModalCaudalDimensiones = true}
              class="px-6 h-9 text-base font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition-all duration-200"
              style="letter-spacing: 1px;"
            >
              CALCULAR CAUDAL
            </button>

            </div>
          </div>
        {:else if aplicacion === 'pozo_hidroneumatico' || aplicacion === 'cisterna_hidroneumatico'}
          <div class="space-y-2">
            <label class="block font-medium text-gray-700 mb-1">Flujo requerido (L/min)</label>
            <div class="flex items-center space-x-2">
              <input
                type="number"
                bind:value={caudal_manual}
                class="border rounded px-3 py-2 w-full"
                placeholder="Ingrese el flujo en L/min o calcúlelo"
              />
              <button
                type="button"
                on:click={() => mostrarModalFlujo = true}
                class="bg-gray-700 text-white font-bold px-3 py-2 rounded hover:bg-gray-800"
              >
                CALCULAR FLUJO
              </button>
            </div>
          </div>
        {/if}
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
            CONSULTAR RECOMENDACIONES
          {/if}
        </button>
      </div>
      </form>

      <!-- RESULTADOS -->
      {#if resultados}
        <div class="bg-[#E0F7FA] border border-[#B2EBF2] p-4 rounded-lg h-fit">
          <h2 class="text-xl font-bold text-[#0099CC] mb-4">Recomendaciones de Bombas</h2>
          <p class="text-sm text-gray-700 mb-2">CDT Calculada: <strong>{resultados.CDT_calculada} m</strong></p>
          <p class="text-sm text-gray-700 mb-4">Caudal estimado: <strong>{resultados.caudal_estimado} L/min</strong></p>

          <div class="flex justify-center mt-4">
            <button 
              type="button" 
              on:click={onAbrirModal} 
              class="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">
              Descargar Cotización
            </button>
          </div>

          {#each resultados.resultados as bomba}
            <div class="border rounded p-4 my-4 bg-white shadow-sm">
              <h3 class="text-lg font-semibold text-[#0099CC]">{bomba.nombre}</h3>

              {#if bomba.image}
                <img src={bomba.image} alt={"Imagen de " + bomba.nombre} class="w-40 h-40 object-contain my-2 mx-auto" />
              {/if}

              {#if bomba.price}
                <p class="text-xl font-bold text-green-700 mb-2 text-center">Q{bomba.price}.00</p>
              {/if}

              <p class="text-sm font-semibold mb-1 {bomba.estado === 'Dentro del rango ideal de operación' ? 'text-green-700' : bomba.estado === 'No cumple con el caudal requerido' ? 'text-red-600' : 'text-yellow-600'}">
                {bomba.estado}
              </p>

              <p class="text-sm text-gray-700 mb-1 italic">{bomba.nota_tecnica}</p>
              <p class="text-sm mt-1">
                🔧 <strong>{bomba.rendimiento_sugerido.caudal_estimado_a_esa_altura_lmin} L/min</strong> a <strong>{resultados.CDT_calculada} m</strong><br>
                🎯 <strong>Rango ideal:</strong> {bomba.rendimiento_sugerido.caudal_aproximado_lmin} L/min a {bomba.rendimiento_sugerido.altura_aproximada_m} m
              </p>

              {#if bomba.advertencia}
                <p class="text-red-600 text-sm font-semibold">{bomba.advertencia}</p>
              {/if}

              <a href={bomba.url} target="_blank" class="inline-block mt-2 text-[#0099CC] hover:underline">
                Ver producto en tienda 🛒
              </a>
            </div>
          {/each}
        </div>
      {:else}
        <div></div>
      {/if}

    </div> <!-- FIN del grid -->
  </div>
</main>


<Chatbot id="chatbot-tour" />


<a href="https://wa.me/50250040468" class="whatsapp-float" target="_blank" aria-label="Chatea por WhatsApp">
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">
  <span class="whatsapp-tooltip">Necesito más información</span>
</a>

<style>
.whatsapp-float {
  position: fixed;
  bottom: 10px;
  right: 24px;
  z-index: 9999;
  background: #25D366;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  border: none;
  outline: none;
}

.whatsapp-float:hover,
.whatsapp-float:focus {
  box-shadow: 0 8px 28px rgba(0,0,0,0.24);
  transform: scale(1.08);
  background: #1ebe57;
}

.whatsapp-float img {
  width: 32px;
  height: 32px;
  display: block;
  pointer-events: none;
  user-select: none;
}

/* Tooltip styles */
.whatsapp-tooltip {
  visibility: hidden;
  opacity: 0;
  width: max-content;
  max-width: 200px;
  background: #222;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 7px 15px;
  position: absolute;
  right: 110%;
  bottom: 50%;
  transform: translateY(50%);
  font-size: 0.95rem;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.2s, visibility 0.2s;
  box-shadow: 0 3px 12px rgba(0,0,0,0.18);
}

.whatsapp-float:hover .whatsapp-tooltip,
.whatsapp-float:focus .whatsapp-tooltip {
  visibility: visible;
  opacity: 1;
}

@media (max-width: 600px) {
  .whatsapp-tooltip {
    display: none;
  }
}
</style>