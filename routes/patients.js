const router = require('express').Router();
const Patient = require('../models/Patient');
// 1) GET /api/patients       → lista todos
router.get('/', async (req, res) => {
    const list = await Patient.find();
    res.json(list);
  });
  
  // 2) GET /api/patients/:id   → devuelve un solo paciente
  router.get('/:id', async (req, res) => {
    try {
      const p = await Patient.findById(req.params.id);
      if (!p) return res.status(404).json({ message: 'Paciente no encontrado' });
      res.json(p);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // 3) POST /api/patients      → crea uno
  router.post('/', async (req, res) => {
    const p = new Patient(req.body);
    await p.save();
    res.status(201).json(p);
  });
  
  // 4) PUT /api/patients/:id   → actualiza
  router.put('/:id', async (req, res) => {
    try {
      const updated = await Patient.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Paciente no encontrado' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // 5) DELETE /api/patients/:id → borra
  router.delete('/:id', async (req, res) => {
    try {
      const result = await Patient.findByIdAndDelete(req.params.id);
      if (!result) return res.status(404).json({ message: 'Paciente no encontrado' });
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


  // POST /api/patients/:id/history → agrega entrada al historial
router.post('/:id/history', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    patient.medicalHistory.push(req.body); // Agrega entrada
    await patient.save(); // Guarda en MongoDB

    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





// PUT /api/patients/:id/history/:entryId → actualiza una entrada médica
router.put('/:id/history/:entryId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    const entry = patient.medicalHistory.id(req.params.entryId);
    if (!entry) return res.status(404).json({ message: 'Entrada no encontrada' });

    entry.set(req.body);
    await patient.save();

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/patients/:id/history/:entryId → elimina una entrada médica
// DELETE /api/patients/:id/history/:entryId → elimina una entrada médica
router.delete('/:id/history/:entryId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    // FILTRA y reemplaza el arreglo excluyendo la entrada a eliminar
    patient.medicalHistory = patient.medicalHistory.filter(
      entry => entry._id.toString() !== req.params.entryId
    );

    await patient.save();
    res.status(204).end();
  } catch (err) {
    console.error('Error al eliminar entrada médica:', err);
    res.status(500).json({ message: err.message });
  }
});



  
  module.exports = router;