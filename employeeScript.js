'use strict';

const fs = require('fs');
const path = require('path');

const employeesFile = path.join(__dirname, 'employees.json');

try {
  const employees = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));

  console.log('Current employees:');
  console.log(employees);

  // Keep the script safe to run more than once while adding the requested sixth record.
  if (!employees.some((employee) => employee.id === 6)) {
    employees.push({
      id: 6,
      name: 'Usman Raza',
      department: 'Engineering',
      position: 'QA Engineer'
    });
  }

  fs.writeFileSync(employeesFile, `${JSON.stringify(employees, null, 2)}\n`, 'utf8');
  console.log('Updated employees saved to employees.json.');
} catch (error) {
  console.error('Unable to update employees.json:', error.message);
  process.exitCode = 1;
}
