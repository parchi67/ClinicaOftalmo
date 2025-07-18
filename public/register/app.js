const API = '/api/patients';
const tbody      = document.querySelector('#tbl tbody');
const form       = document.getElementById('form');
const formTitle  = document.getElementById('form-title');    // Asegúrate de tener este <h2 id="form-title">
const submitBtn  = document.getElementById('submit-btn');    // <button id="submit-btn">
const cancelBtn  = document.getElementById('cancel-btn');    // <button id="cancel-btn">
let editId = null;  // Aquí guardaremos el _id cuando editemos

// Carga inicial y tras cada operación
async function load() {
  const res  = await fetch(API);
  const list = await res.json();

  tbody.innerHTML = list.map(p => `
    <tr>
      <td>${p.dni}</td>
      <td>${p.firstName} ${p.lastName}</td>
      <td>
        <button data-id="${p._id}" class="del">🗑️</button>
        <button data-id="${p._id}" class="edit">✏️</button>
      </td>
    </tr>
  `).join('');

  // Borrar
  document.querySelectorAll('.del').forEach(btn => {
    btn.onclick = async e => {
      await fetch(`${API}/${e.target.dataset.id}`, { method: 'DELETE' });
      resetForm();
      load();
    };
  });

  // Editar: carga los datos al formulario
  document.querySelectorAll('.edit').forEach(btn => {
    btn.onclick = async e => {
      editId = e.target.dataset.id;
      const res = await fetch(`${API}/${editId}`);
      const p   = await res.json();

      // Rellenar campos
      form.firstName.value = p.firstName;
      form.lastName.value  = p.lastName;
      form.dni.value       = p.dni;
      // Si tienes otros campos, añádelos aquí

      // Cambiar estado del formulario
      formTitle.textContent = 'Editar Paciente';
      submitBtn.textContent = 'Actualizar';
      cancelBtn.style.display = 'inline';
    };
  });
}

// Envío del formulario: create vs update
form.onsubmit = async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const alertDiv = document.getElementById('alert');
  alertDiv.textContent = ''; // Limpiar mensaje anterior

  // Obtener lista de pacientes para validar DNI
  const res = await fetch(API);
  const pacientes = await res.json();

  // Verificar si el DNI ya existe (solo en modo creación)
  if (!editId) {
    const dniExiste = pacientes.some(p => p.dni === data.dni);
    if (dniExiste) {
      alertDiv.textContent = '⚠️ El DNI ingresado ya está registrado.';
      return;
    }

    // CREATE
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

  } else {
    // UPDATE
    await fetch(`${API}/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  resetForm();
  load();
};


// Botón cancelar edición
cancelBtn.onclick = () => {
  resetForm();
};

// Vuelve el formulario a modo “Nuevo”
function resetForm() {
  editId = null;
  form.reset();
  formTitle.textContent = 'Nuevo Paciente';
  submitBtn.textContent = 'Guardar';
  cancelBtn.style.display = 'none';
  const alertDiv = document.getElementById('alert');
  alertDiv.classList.add('hidden');
  alertDiv.textContent = '';
}


// Arranca la carga
load();
