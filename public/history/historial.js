const API = '/api/patients';
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function loadPatient() {
  if (!id) {
    alert('No se proporcionó ID del paciente');
    return;
  }

  try {
    const res = await fetch(`${API}/${id}`);
    const patient = await res.json();

    // Muestra los datos en el formulario
    document.getElementById('dni').value = patient.dni || '';
    document.getElementById('name').value = `${patient.firstName || ''} ${patient.lastName || ''}`;
    document.getElementById('historyNumber').value = patient.historyNumber || 'HC-' + (patient.dni || '');
    document.getElementById('diagnosis').value = patient.diagnosis || '';
  } catch (err) {
    alert('Error al cargar datos del paciente');
    console.error(err);
  }
}

document.getElementById('history-form').onsubmit = async e => {
  e.preventDefault();

  const diagnosis = document.getElementById('diagnosis').value;
  const historyNumber = document.getElementById('historyNumber').value;

  try {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosis, historyNumber })
    });

    alert('Historial actualizado correctamente');
  } catch (err) {
    alert('Error al actualizar historial');
    console.error(err);
  }
};

loadPatient();

