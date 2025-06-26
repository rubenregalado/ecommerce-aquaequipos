<script>
  import { createEventDispatcher } from 'svelte';
  export let open = false;
  const dispatch = createEventDispatcher();

  let nit = '';
  let celular = '';
  let nombre = '';
  let correo = '';

  function submitForm() {
    if (!nombre) return;
    dispatch('submit', { nit, celular, nombre, correo });
  }

  function closeModal() {
    dispatch('close');
  }
</script>

{#if open}
  <div class="modal-backdrop" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <h2 class="modal-title">Datos para la cotización</h2>
      <form on:submit|preventDefault={submitForm} class="form">
         <label>
          Nombre *
          <input type="text" bind:value={nombre} required placeholder="Nombre completo" />
        </label>
        <label>
          Celular
          <input type="tel" bind:value={celular} required placeholder="Ingrese número celular" />
        </label>
        <label>
          Correo
          <input type="email" bind:value={correo} required placeholder="correo@dominio.com" />
        </label>
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
    background-color: rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    width: 100%;
    max-width: 360px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  }

  .modal-title {
    font-size: 1.4rem;
    font-weight: bold;
    color: #116892;
    margin-bottom: 1rem;
    text-align: center;
  }

  .form label {
    display: block;
    margin-bottom: 1rem;
    color: #116892;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .form input {
    width: 100%;
    padding: 0.5rem;
    border: 1.5px solid #cce7f0;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #f5fcff;
  }

  .form input:focus {
    outline: none;
    border-color: #116892;
    box-shadow: 0 0 4px #11689255;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
  }

  .btn-primary {
    background-color: #116892;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }

  .btn-primary:hover {
    background-color: #0d4d6e;
  }

  .btn-secondary {
    background-color: white;
    color: #116892;
    padding: 0.6rem 1.2rem;
    border: 1.5px solid #116892;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-secondary:hover {
    background-color: #e6f2f8;
  }

  @media (max-width: 480px) {
    .modal-content {
      width: 90%;
      padding: 1.5rem;
    }
  }
</style>
