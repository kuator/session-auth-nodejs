const express = require('express');
const session = require('express-session');

const app = express();

app.listen(3000, () => {
  console.log('working');
});

const SESS_LIFETIME = 2*60*60*1000;

// https://stackoverflow.com/a/4296402
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(session({
  name: 'susid',
  resave: false,
  saveUninitialized: false,
  secret: 'asdfasdfasdfasdfasdfasdfasdfasdfasdfasdf',
  cookie:{
    maxAge: SESS_LIFETIME,
    sameSite: true,
    secure: false,
  }
}))

const users = [
  {id:1, name: 'first', email:'first@gmail.com', password:'supersecret'},
  {id:2, name: 'second', email:'second@gmail.com', password:'supersecret'},
  {id:3, name: 'third', email:'third@gmail.com', password:'supersecret'}
];

const redirectLogin = (req,res,next) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
}

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/home')
  } else {
    next();
  }
}

app.get('/', (req, res) => {
  // console.log(req.session);
  const { userId } = req.session;
  res.send(`
    ${userId ? `
      <a href='/home'>home</a>
      <form method='post' action='/logout'>
        <button>logout</button>
      </form>
      ` : `
        <h1>Welcome!</h1>
        <a href='/login'>login</a>
        <a href='/register'>register</a>
      `}
    `)
})

app.get('/home', redirectLogin, (req, res) => {
  // console.log(req.session.userId);
  console.log(req.session);
  const user = users.find((user) => user.id === req.session.userId)
  res.send(`
    <h1>Home</h1>
    <a href="/">Main</a>
    <ul>
    <li>Name: ${user.name}</li>
    <li>Email: ${user.email}</li>
    </ul>
    `)
})

app.get('/login', redirectHome, (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form action="/login" method='post'>
      <input type='email' name='email' placeholder='email' required />
      <input type='password' name='password' placeholder='password' required />
      <input type="submit">
    </form>
    <a href="/register"></a>
    `)
})

app.get('/register', redirectHome, (req, res) => {
  res.send(`
    <h1>register</h1>
    <form action="/register" method='post'>
      <input type='email' name='email' placeholder='email' required />
      <input type='text' name='name' placeholder='name' required />
      <input type='password' name='password' placeholder='password' required />
      <input type="submit">
    </form>
    <a href="/login"></a>
    `)
})


app.post('/logout', redirectLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/home');
    }
    res.clearCookie('susid');
    res.redirect('/login')
  })
})


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
     const user = users.find(
       (user) => user.email === email && user.password == password
     );
    if (user) {
      req.session.userId = user.id
      return res.redirect('/home')
    }
  }
  res.redirect('/login');
})

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
     const user = users.find(
       (user) => user.email === email && user.password && password
     );
    if (user) {
      req.session.userId = user.id
      return res.redirect('/home')
    }
  }
  res.redirect('/login');
})
