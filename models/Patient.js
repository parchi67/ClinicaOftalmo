const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MedicalEntrySchema = new Schema({
  date:       { type: Date, required: true },
  diagnosis:  { type: String, required: true },
  treatment:  { type: String, required: true },
  notes:      { type: String }
}, { _id: true }); // asegúrate de tener _id activado en cada entrada

const PatientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dni: String,
  medicalHistory: [MedicalEntrySchema]  // Esta línea es CLAVE
});

module.exports = model('Patient', PatientSchema);
