const API = '/api/patients';
const id = new URLSearchParams(window.location.search).get('id');
let patient = null; // <- Se necesita global para exportación individual

async function loadPatient() {
  const res = await fetch(`${API}/${id}`);
  patient = await res.json(); // <- Guardamos el paciente para usar en exportIndividual

  document.getElementById('dni').textContent = patient.dni;
  document.getElementById('name').textContent = `${patient.firstName} ${patient.lastName}`;

 allEntries = patient.medicalHistory || []; // Guardar todas las entradas
  renderHistoryList(allEntries); // Mostrar todas
}





function renderHistoryList(entries) {
  const list = document.getElementById('history-list');
  list.innerHTML = entries.map(entry => `
    <li>
      <strong>${new Date(entry.date).toLocaleDateString()}</strong><br>
      Diagnóstico: ${entry.diagnosis}<br>
      Tratamiento: ${entry.treatment}<br>
      Notas: ${entry.notes || ''}<br>
      <button onclick="editEntry('${entry._id}')">✏️ Editar</button>
      <button onclick="deleteEntry('${entry._id}')">🗑️ Eliminar</button>
      <button onclick="exportSingleEntryPDF('${entry._id}')">🧾 Exportar</button>
    </li>
  `).join('');
}

document.getElementById('history-form').onsubmit = async e => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  data.date = new Date().toISOString();

  const entryId = document.getElementById('entry-id').value;

  if (entryId) {
    await fetch(`${API}/${id}/history/${entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } else {
    await fetch(`${API}/${id}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  form.reset();
  document.getElementById('entry-id').value = '';
  loadPatient(); // recarga la lista
};

async function deleteEntry(entryId) {
  if (!confirm('¿Eliminar esta entrada médica?')) return;

  await fetch(`${API}/${id}/history/${entryId}`, {
    method: 'DELETE'
  });

  loadPatient(); // recarga después de eliminar
}

function editEntry(entryId) {
  document.getElementById('entry-id').value = entryId;

  fetch(`${API}/${id}`)
    .then(res => res.json())
    .then(patient => {
      const entry = patient.medicalHistory.find(e => e._id === entryId);
      if (!entry) return;

      document.querySelector('[name="diagnosis"]').value = entry.diagnosis;
      document.querySelector('[name="treatment"]').value = entry.treatment;
      document.querySelector('[name="notes"]').value = entry.notes || '';
    });
}

// NUEVO: Filtro por fecha
document.getElementById('search-date').addEventListener('input', function () {
  const search = this.value.trim();
  const filtered = allEntries.filter(entry =>
    new Date(entry.date).toLocaleDateString().includes(search)
  );
  renderHistoryList(filtered);
});

loadPatient();

function exportSingleEntryPDF(entryId) {
  if (!patient) return;

  const entry = patient.medicalHistory.find(e => e._id === entryId);
  if (!entry) return alert('Entrada no encontrada');

  // Crea un contenedor general que alinee todo a la izquierda
  const container = document.createElement('div');
  container.style.width = '210mm'; // A4 exacto
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.backgroundColor = '#fff';
  container.style.display = 'block';

  // Crea el contenido que irá dentro del PDF
  const content = document.createElement('div');
  content.style.fontFamily = 'Helvetica, sans-serif';
  content.style.padding = '20px';
  content.style.width = '100%';
  content.style.boxSizing = 'border-box';
  content.style.backgroundColor = '#fff';


  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="/gofd.jpg" alt="Doctor" width="100" />
      <h2 style="margin: 10px 0;">Comprobante de Atención Médica</h2>
      <p style="margin: 0;">Clínica Oftalmológica</p>
    </div>
    <hr>
    <p><strong>Nombre del paciente:</strong> ${patient.firstName} ${patient.lastName}</p>
    <p><strong>DNI:</strong> ${patient.dni}</p>
    <p><strong>Fecha de atención:</strong> ${new Date(entry.date).toLocaleDateString()}</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;" border="1" cellspacing="0" cellpadding="8">
      <thead style="background-color: #f0f0f0;">
        <tr>
          <th>Fecha</th>
          <th>Diagnóstico</th>
          <th>Tratamiento</th>
          <th>Notas</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${new Date(entry.date).toLocaleDateString()}</td>
          <td>${entry.diagnosis}</td>
          <td>${entry.treatment}</td>
          <td>${entry.notes || '-'}</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top: 50px; text-align: right;">
      <p style="margin: 0; border-top: 1px solid #000; width: 250px; margin-left: auto;"></p>
      <p style="margin: 0; font-style: italic; width: 250px; margin-left: auto; text-align: center;">
        Firma del profesional
      </p>
    </div>
  `;

  html2pdf().set({
    margin: 10,
    filename: `comprobante-${patient.dni}-${entryId}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(content).save();
}