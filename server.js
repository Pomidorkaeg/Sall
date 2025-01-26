const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const path = require('path');
const axios = require('axios');

// Инициализация приложения Express
const app = express();
const port = 3000;

// Настройка passport.js для Google OAuth
passport.use(new GoogleStrategy({
  clientID: 'YOUR_GOOGLE_CLIENT_ID', // Замените на ваш Client ID
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET', // Замените на ваш Client Secret
  callbackURL: 'http://localhost:3000/auth/google/callback',
},
  function (token, tokenSecret, profile, done) {
    return done(null, profile);
  }
));

// Сериализация пользователя
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((id, done) => done(null, id));

// Настройка сессий
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Маршруты для авторизации через Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Роут для главной страницы
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Telegram Bot Creator</title>
        <style>
          body {
            background-color: #1a202c;
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            flex-direction: column;
          }
          .button {
            background-color: #4CAF50;
            color: white;
            padding: 15px 32px;
            border: none;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          .button:hover {
            background-color: #45a049;
          }
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .input {
            padding: 10px;
            margin: 20px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            width: 300px;
          }
          .title {
            font-size: 30px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="title">Добро пожаловать, ${req.user.displayName}!</h1>
          <button class="button" onclick="window.location.href='/create-bot'">Создать Telegram бот</button>
          <button class="button" onclick="window.location.href='/logout'">Выйти</button>
        </div>
      </body>
      </html>
    `);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Telegram Bot Creator</title>
        <style>
          body {
            background-color: #1a202c;
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            flex-direction: column;
          }
          .button {
            background-color: #4CAF50;
            color: white;
            padding: 15px 32px;
            border: none;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          .button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <button class="button" onclick="window.location.href='/auth/google'">Войти с Google</button>
      </body>
      </html>
    `);
  }
});

// Маршрут для выхода
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Роут для создания бота
app.get('/create-bot', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Создание Telegram бота</title>
        <style>
          body {
            background-color: #1a202c;
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            flex-direction: column;
          }
          .title {
            font-size: 30px;
            margin-bottom: 20px;
          }
          .input {
            padding: 10px;
            margin: 20px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            width: 300px;
          }
          .button {
            background-color: #4CAF50;
            color: white;
            padding: 15px 32px;
            border: none;
            font-size: 16px;
            margin: 10px;
            cursor: pointer;
            border-radius: 12px;
          }
        </style>
      </head>
      <body>
        <h1 class="title">Создайте своего Telegram бота</h1>
        <input class="input" id="botToken" type="text" placeholder="Введите токен вашего бота" />
        <button class="button" onclick="createBot()">Создать бота</button>
        <script>
          function createBot() {
            const token = document.getElementById('botToken').value;
            fetch('/create-bot-action', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token })
            })
            .then(response => response.json())
            .then(data => alert('Бот создан: ' + data.status))
            .catch(error => alert('Ошибка: ' + error));
          }
        </script>
      </body>
      </html>
    `);
  } else {
    res.redirect('/');
  }
});

// Действия по созданию бота (API для взаимодействия с Telegram)
app.post('/create-bot-action', (req, res) => {
  const { token } = req.body;

  axios.post(`https://api.telegram.org/bot${token}/getMe`)
    .then(response => {
      res.json({ status: 'Успешно подключено к Telegram API' });
    })
    .catch(error => {
      res.status(500).json({ status: 'Ошибка подключения к Telegram API' });
    });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
