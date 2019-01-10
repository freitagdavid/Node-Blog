const express = require('express');
const cors = require('cors');
const posts = require('./data/helpers/postDb');
const users = require('./data/helpers/userDb');

const server = express();

server.use(cors());
server.use(express.json());

// Get all users

server.get('/api/users', async (req, res) => {
    try {
        const usersGet = await users.get();
        console.log(usersGet);
        res.status(200).json({ usersGet });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Create new user

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

//  Update user by id

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

// Delete user by id

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

server.get('/api/posts', async (req, res) => {
    try {
        const postList = await posts.get();
        res.status(200).json({ postList });
    } catch (err) {
        res.status(500).json(err);
    }
});

server.post('/api/:userId/posts/post', async (req, res) => {
    const { text } = req.body;
    const { userId } = req.params;

    console.log(userId);

    const user = await users.get(userId);

    if (!user) {
        res.status(404).json({ errMessage: 'User does not exist' });
        return;
    }

    if (!text) {
        res.status(400).json({ errMessage: 'Please provide text' });
        return;
    }

    posts
        .insert({ text: text, userId: userId })
        .then(result => {
            posts.get(result.id).then(post => {
                res.status(400).json({ post });
            });
        })
        .catch(err => {
            res.status(500).json({ errMessage: 'Message not posted' });
        });
});

server.put('/api/:userId/posts/:id', (req, res) => {});

server.delete('/api/posts/:id', (req, res) => {});

module.exports = server;

// To be used later this was creative as hell
// const isValid =
// typeof user.id !== 'undefined' || typeof user.name !== 'undefined';
