<script>
  import { createEventDispatcher } from 'svelte';
  export let open = false;
  const dispatch = createEventDispatcher();

  let nit = '';
  let dpi = '';
  let nombre = '';
  let direccion = '';

  function submitForm() {
    dispatch('submit', { nit, dpi, nombre, direccion });
  }

  function closeModal() {
    dispatch('close');
  }
</script>

{#if open}
  <div class="modal-backdrop" on:click="{closeModal}">
    <div class="modal-content" on:click|stopPropagation>
      <h2>Datos para la cotización</h2>
      <form on:submit|preventDefault={submitForm}>
        <div class="field-group">
          <label for="nit">NIT</label>
          <input id="nit" type="text" bind:value={nit} required placeholder="Ingrese NIT" />
        </div>
        <div class="field-group">
          <label for="dpi">Correo</label>
          <input id="dpi" type="text" bind:value={dpi}  placeholder="Ingrese DPI" />
        </div>
        <div class="field-group">
          <label for="nombre">Nombre</label>
          <input id="nombre" type="text" bind:value={nombre} required placeholder="Nombre completo" />
        </div>
        <div class="field-group">
          <label for="direccion">Dirección</label>
          <input id="direccion" type="text" bind:value={direccion}  placeholder="Dirección exacta" />
        </div>
        <div class="buttons">
          <button type="submit" class="btn-primary">Generar PDF</button>
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
    background: rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  .modal-content {
    background: rgb(184, 209, 236);
    padding: 2rem 2.5rem;
    border-radius: 12px;
    width: 320px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h2 {
    margin-bottom: 1.5rem;
    font-weight: 700;
    font-size: 1.5rem;
    color: #003366;
    text-align: center;
  }
  .field-group {
    margin-bottom: 1rem;
  }
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.3rem;
    color: #444;
    font-size: 0.9rem;
  }
  input {
    width: 100%;
    padding: 0.45rem 0.6rem;
    border: 1.8px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }
  input:focus {
    outline: none;
    border-color: #0077ff;
    box-shadow: 0 0 6px rgba(0,119,255,0.4);
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
    margin-top: 1.2rem;
  }
  button {
    padding: 0.5rem 1.2rem;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    transition: background-color 0.3s ease;
  }
  .btn-primary {
    background-color: #0077ff;
    color: white;
  }
  .btn-primary:hover {
    background-color: #005ecc;
  }
  .btn-secondary {
    background-color: #e0e0e0;
    color: #333;
  }
  .btn-secondary:hover {
    background-color: #bdbdbd;
  }
</style>
