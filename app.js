const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database connection function
function dbConnection() {
    try {
        return new sqlite3.Database('students.sqlite', (err) => {
            if (err) {
                console.error('Error connecting to database:', err);
                return null;
            }
            console.log('Connected to SQLite database');
        });
    } catch (err) {
        console.error(err);
        return null;
    }
}

// GET and POST routes for all students
app.route('/students')
    .get((req, res) => {
        const db = dbConnection();
        db.all("SELECT * FROM students", [], (err, rows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            const students = rows.map(row => ({
                id: row.id,
                firstname: row.firstname,
                lastname: row.lastname,
                gender: row.gender,
                age: row.age
            }));
            res.json(students);
        });
    })
    .post((req, res) => {
        const db = dbConnection();
        const { firstname, lastname, gender, age } = req.body;
        
        const sql = `INSERT INTO students (firstname, lastname, gender, age)
                    VALUES (?, ?, ?, ?)`;
        
        db.run(sql, [firstname, lastname, gender, age], function(err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json(`Student with id: ${this.lastID} created successfully`);
        });
    });

// Routes for single student operations
app.route('/student/:id')
    .get((req, res) => {
        const db = dbConnection();
        const id = req.params.id;
        
        db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            if (row) {
                res.json(row);
            } else {
                res.status(404).json("Student not found");
            }
        });
    })
    .put((req, res) => {
        const db = dbConnection();
        const id = req.params.id;
        const { firstname, lastname, gender, age } = req.body;
        
        const sql = `UPDATE students 
                    SET firstname = ?, lastname = ?, gender = ?, age = ?
                    WHERE id = ?`;
        
        db.run(sql, [firstname, lastname, gender, age, id], (err) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            const updatedStudent = {
                id: parseInt(id),
                firstname,
                lastname,
                gender,
                age
            };
            res.json(updatedStudent);
        });
    })
    .delete((req, res) => {
        const db = dbConnection();
        const id = req.params.id;
        
        const sql = 'DELETE FROM students WHERE id = ?';
        db.run(sql, [id], (err) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json(`The Student with id: ${id} has been deleted.`);
        });
    });

// Start server
const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});