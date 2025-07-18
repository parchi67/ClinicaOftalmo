const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const patientRoutes = require('./routes/patients');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1) Servir archivos estáticos de public/
app.use(express.static(path.join(__dirname, 'public')));

// 2) Login “dummy”
app.post('/login', (req, res) => {
  // aquí podrías validar email/password; nosotros siempre redirigimos
  res.redirect('/dashboard.html');
});

// 3) API de pacientes
app.use('/api/patients', patientRoutes);

// 🚀 Redirige la raíz ("/") al menú principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/menu.html'));
  });
// 4) Arranque de servidor
mongoose.connect('mongodb://localhost:27017/ClinicaOftalmoDB', {
  useNewUrlParser: true, useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB conectado');
  app.listen(3000, () => console.log('📡 http://localhost:3000'));
})
.catch(err => console.error(err));


