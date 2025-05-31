<script>
  import { afterUpdate } from 'svelte';
  let open = false;
  let message = '';
  let messages = [];
  let messagesContainer;
  let limitReached = false;  // Nueva variable

  let userId;

  if (typeof window !== 'undefined') {
    userId = localStorage.getItem('userId');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('userId', userId);
    }
  }

  async function sendMessage() {
    if (!message.trim() || limitReached) return;

    messages = [...messages, { from: 'user', text: message }];
    const userMessage = message;
    message = '';

    try {
      const res = await fetch('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, userId })
      });

      if (!res.ok) throw new Error('Error en la respuesta del servidor');

      const data = await res.json();

      messages = [...messages, { from: 'bot', text: data.response }];

      if (data.limitReached) {
        limitReached = true;  // Bloqueamos input y botón
      }

    } catch (error) {
      messages = [...messages, { from: 'bot', text: 'Error: no se pudo obtener respuesta del servidor.' }];
      console.error(error);
    }
  }

  afterUpdate(() => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
</script>

{#if open}
  <div class="chatbot">
    <div class="header">Asistente Técnico AquaEquipos</div>
    <div class="messages" bind:this={messagesContainer}>
      {#each messages as msg}
        <div class={msg.from}>
          <strong>{msg.from === 'user' ? 'Tú:' : 'Bot:'}</strong> {msg.text}
        </div>
      {/each}
    </div>
    <div class="input">
      <input
        type="text"
        bind:value={message}
        on:keydown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Escribe tu pregunta..."
        disabled={limitReached}  
      />
      <button on:click={sendMessage} disabled={limitReached}>Enviar</button> <!-- Aquí -->
    </div>
  </div>
{/if}

<button class="toggle-button" on:click={() => open = !open} aria-label="Abrir o cerrar chat">
  👨🏼‍💻
  <span class="toggle-tooltip">¡Necesito Ayuda!</span>
</button>

<style>
  .chatbot {
    position: fixed;
    bottom: 140px;
    right: 20px;
    height: 400px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 12px;
    width: 300px;
    max-height: 400px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    background: #0077cc;
    color: white;
    padding: 10px;
    font-weight: bold;
  }

  .messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    max-height: 300px;
    scroll-behavior: smooth;
  }

  .user {
    text-align: right;
    background-color: #dcf8c6;
    padding: 8px 12px;
    border-radius: 15px 15px 0 15px;
    display: inline-block;
    max-width: 80%;
    margin-left: auto;
  }

  .bot {
    text-align: left;
    background-color: #f1f0f0;
    padding: 8px 12px;
    border-radius: 15px 15px 15px 0;
    display: inline-block;
    max-width: 80%;
    margin-right: auto;
  }

  .input {
    display: flex;
    border-top: 1px solid #ccc;
  }

  .input input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
  }

  .input button {
    padding: 8px 12px;
    background: #0077cc;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .input button:hover {
    background-color: #005fa3;
  }

  .toggle-button {
  position: fixed;
  bottom: 80px;
  right: 25px;
  background: #286797;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
  outline: none;
  position: fixed;
  z-index: 10000;
}

.toggle-button:hover,
.toggle-button:focus {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.24);
  transform: scale(1.08);
  background: #1f4f7a; /* un azul más oscuro al hacer hover */
}

/* Tooltip styles */
.toggle-tooltip {
  visibility: hidden;
  opacity: 0;
  width: max-content;
  max-width: 180px;
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
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.18);
  user-select: none;
  z-index: 10001;
}

.toggle-button:hover .toggle-tooltip,
.toggle-button:focus .toggle-tooltip {
  visibility: visible;
  opacity: 1;
}

@media (max-width: 600px) {
  .toggle-tooltip {
    display: none;
  }
}

</style>
