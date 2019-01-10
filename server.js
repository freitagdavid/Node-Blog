const express = require('express');
const cors = require('cors');
const posts = require('./data/helpers/postDb');
const users = require('./data/helpers/userDb');

const server = express();

server.use(cors());
server.use(express.json());

server.get('/api/users', async (req, res) => {
    try {
        const usersGet = await users.get();
        console.log(usersGet);
        res.status(200).json({ usersGet });
    } catch (err) {
        res.status(500).json(err);
    }
});

server.post('/api/users', (req, res) => {
    const user = req.body;
    if (typeof user.name === 'undefined') {
        res.status(400).json({
            errorMessage: 'Please provide name for user',
        });
    } else {
        users
            .insert(user)
            .then(result => {
                users.get(result.id).then(user => {
                    res.status(201).json(user);
                });
            })
            .catch(err => {
                if (err.errno === 19) {
                    res.status(400).json({
                        errMessage: 'User names must be unique',
                    });
                }
            });
    }
});

server.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    users
        .update(id, { name })
        .then(response => {
            if (response === 0) {
                res.status(404).json({
                    errorMessage:
                        'The user with the specified ID does not exist.',
                });
            } else {
                users.get(id).then(name => {
                    res.status(200).json(name);
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: 'The user information could not be modified',
            });
        });
});

server.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    users
        .remove(id)
        .then(removedUser => {
            if (removedUser === 0) {
                res.status(404).json({
                    errorMessage:
                        'The user with the specified ID does not exist',
                });
            } else {
                res.status(200).json({ success: 'user removed' });
            }
        })
        .catch(err => {
            res.status(500).json({ errMessage: 'User could not be removed' });
        });
});

server.get('/api/posts', (req, res) => {});

server.post('/api/posts', (req, res) => {});

server.put('/api/posts/:id', (req, res) => {});

server.delete('/api/posts/:id', (req, res) => {});

module.exports = server;

// To be used later this was creative as hell
// const isValid =
// typeof user.id !== 'undefined' || typeof user.name !== 'undefined';
