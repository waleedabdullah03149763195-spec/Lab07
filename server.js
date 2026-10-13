'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const studentsFile = path.join(__dirname, 'students.json');

app.use(express.json());

let students = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));

/** Persist the current in-memory student list to disk. */
function saveStudents() {
  fs.writeFileSync(studentsFile, `${JSON.stringify(students, null, 2)}\n`, 'utf8');
}

function validText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get('/students', (req, res) => {
  res.status(200).json(students);
});

app.get('/students/department/:department', (req, res) => {
  const department = req.params.department.toLowerCase();
  const matches = students.filter(
    (student) => student.department.toLowerCase() === department
  );
  res.status(200).json(matches);
});

app.get('/students/:id', (req, res) => {
  const id = parseId(req.params.id);
  const student = students.find((item) => item.id === id);

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  return res.status(200).json(student);
});

app.post('/students', (req, res) => {
  const { name, department } = req.body;
  if (!validText(name) || !validText(department)) {
    return res.status(400).json({ error: 'Name and department must be non-empty strings.' });
  }

  const student = {
    id: students.length ? Math.max(...students.map((item) => item.id)) + 1 : 1,
    name: name.trim(),
    department: department.trim()
  };
  students.push(student);
  saveStudents();
  return res.status(201).json(student);
});

app.put('/students/:id', (req, res) => {
  const id = parseId(req.params.id);
  const student = students.find((item) => item.id === id);

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const { name, department } = req.body;
  if (!validText(name) || !validText(department)) {
    return res.status(400).json({ error: 'Name and department must be non-empty strings.' });
  }

  student.name = name.trim();
  student.department = department.trim();
  saveStudents();
  return res.status(200).json(student);
});

app.delete('/students/:id', (req, res) => {
  const id = parseId(req.params.id);
  const index = students.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const [deletedStudent] = students.splice(index, 1);
  saveStudents();
  return res.status(200).json(deletedStudent);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Student API listening on port ${PORT}`));
}

module.exports = { app, saveStudents };
