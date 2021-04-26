const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(usr => usr.username === username);

  if (!user) {
    return response.status(404).json({ error: "user with username does not exists" })
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(usr => usr.username === username)

  if (userExists) {
    return response.status(400).json({ error: "user with username already exists" })
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user);
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const user = request.user;
  response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  }

  user.todos.push(newTodo)
  return response.status(201).json(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find(td => td.id === id);
  if (!todo) {
    return response.status(404).json({ error: "todo does not exist" })
  }
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todo = user.todos.find(td => td.id === id);
  if (!todo) {
    return response.status(404).json({ error: "todo does not exist" })
  }

  todo.done = true;
  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(td => td.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({ error: "todo does not exist" })
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()

});

module.exports = app;