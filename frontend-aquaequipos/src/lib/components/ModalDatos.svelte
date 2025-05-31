<script>
  import { createEventDispatcher } from 'svelte';
  export let open = false;
  const dispatch = createEventDispatcher();

  let nit = '';
  let correo = '';
  let nombre = '';
  let direccion = '';
  let correoInvalido = false;

  function validarCorreo(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function submitForm() {
    correoInvalido = !validarCorreo(correo);

    if (!nombre || correoInvalido) {
      return;
    }

    dispatch('submit', { nit, correo, nombre, direccion });
  }

  function closeModal() {
    dispatch('close');
  }
</script>

{#if open}
  <div class="modal-backdrop" on:click="{closeModal}">
    <div class="modal-content" on:click|stopPropagation>
      <!-- Onda decorativa superior -->
      <div class="wave-top">
        <svg viewBox="0 0 340 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 30 Q 85 0 170 30 T 340 30 V40 H0 V30Z" fill="#4FC3F7" fill-opacity="0.7"/>
          <path d="M0 35 Q 85 10 170 35 T 340 35 V40 H0 V35Z" fill="#0288d1" fill-opacity="0.3"/>
        </svg>
      </div>
      <div class="modal-header">
        <svg class="water-drop" width="36" height="36" viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="20" rx="8" ry="10" fill="#4FC3F7"/>
          <ellipse cx="16" cy="13" rx="3" ry="4" fill="#B3E5FC"/>
        </svg>
        <h2>Datos para la cotización</h2>
      </div>
      <form on:submit|preventDefault={submitForm}>
        <div class="field-group">
          <label for="nit">NIT</label>
          <input id="nit" type="text" bind:value={nit} placeholder="Ingrese NIT" />
        </div>
        <div class="field-group">
          <label for="correo">Correo</label>
          <input id="correo" type="email" bind:value={correo} required placeholder="Ingrese correo electrónico" />
          {#if correoInvalido}
            <p class="error">Ingrese un correo válido (ej: nombre@dominio.com)</p>
          {/if}
        </div>
        <div class="field-group">
          <label for="nombre">Nombre</label>
          <input id="nombre" type="text" bind:value={nombre} required placeholder="Nombre completo" />
        </div>
        <div class="field-group">
          <label for="direccion">Dirección</label>
          <input id="direccion" type="text" bind:value={direccion} placeholder="Dirección exacta" />
        </div>
        <div class="buttons">
          <button type="submit" class="btn-primary">💧 Generar PDF</button>
          <button type="button" class="btn-secondary" on:click={closeModal}>Cancelar</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,119,255,0.10) 0%, rgba(79,195,247,0.13) 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
  }
  .modal-content {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    padding: 0 2.5rem 2rem 2.5rem;
    border-radius: 22px;
    width: 340px;
    box-shadow: 0 10px 36px 0 rgba(0,119,255,0.13), 0 1.5px 3px rgba(0,0,0,0.07);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    position: relative;
    border: 2.5px solid #4FC3F7;
    animation: modalIn 0.4s cubic-bezier(.68,-0.55,.27,1.55);
    overflow: hidden;
  }
  .wave-top {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 40px;
    z-index: 1;
    pointer-events: none;
    user-select: none;
  }
  .modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.4rem;
    margin-top: 30px; /* espacio para la onda */
    z-index: 2;
    position: relative;
  }
  .water-drop {
    margin-bottom: 0.3rem;
    filter: drop-shadow(0 3px 8px #4FC3F7aa);
    animation: drop 1.2s infinite alternate;
  }
  @keyframes drop {
    0% { transform: translateY(0);}
    100% { transform: translateY(6px);}
  }
  h2 {
    font-weight: 700;
    font-size: 1.45rem;
    color: #01579b;
    text-align: center;
    margin: 0;
    letter-spacing: 0.02em;
  }
  .field-group {
    margin-bottom: 1.1rem;
  }
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.28rem;
    color: #1976d2;
    font-size: 0.98rem;
    letter-spacing: 0.01em;
  }
  input {
    width: 100%;
    padding: 0.48rem 0.7rem;
    border: 1.8px solid #b3e5fc;
    border-radius: 10px;
    font-size: 1.05rem;
    transition: border-color 0.25s, box-shadow 0.25s;
    background: #f7fbfd;
    box-shadow: 0 1px 3px rgba(33,150,243,0.04);
  }
  input:focus {
    outline: none;
    border-color: #0288d1;
    box-shadow: 0 0 8px #4fc3f7a0;
  }
  .error {
    color: #d32f2f;
    font-size: 0.93rem;
    margin-top: 0.2rem;
    margin-bottom: 0;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
    margin-top: 1.2rem;
  }
  button {
    padding: 0.55rem 1.3rem;
    font-weight: 600;
    font-size: 1.04rem;
    border-radius: 10px;
    cursor: pointer;
    border: none;
    transition: background 0.22s, color 0.22s, box-shadow 0.22s;
    box-shadow: 0 2px 8px rgba(33,150,243,0.09);
  }
  .btn-primary {
    background: linear-gradient(90deg, #4FC3F7 0%, #0288d1 100%);
    color: white;
    letter-spacing: 0.03em;
    border: none;
  }
  .btn-primary:hover {
    background: linear-gradient(90deg, #0288d1 0%, #01579b 100%);
    box-shadow: 0 3px 16px #4FC3F7aa;
  }
  .btn-secondary {
    background: #e0f7fa;
    color: #0288d1;
    border: 1.5px solid #4FC3F7;
  }
  .btn-secondary:hover {
    background: #b3e5fc;
    color: #01579b;
  }
  @media (max-width: 500px) {
    .modal-content { width: 98vw; padding: 0 0.7rem 1.2rem 0.7rem; }
  }
</style>
