// Package requires
const http = require('http');
const query = require('querystring');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

// HTML and assets
const index = fs.readFileSync(`${__dirname}/../client/homepage.html`);
const research = fs.readFileSync(`${__dirname}/../client/research.html`);
const settings = fs.readFileSync(`${__dirname}/../client/settings.html`);
const login = fs.readFileSync(`${__dirname}/../client/login.html`);
const register = fs.readFileSync(`${__dirname}/../client/register.html`);
const js = fs.readFileSync(`${__dirname}/../client/client.js`);
const css = fs.readFileSync(`${__dirname}/../client/styles.css`);
const facultyLogo = fs.readFileSync(`${__dirname}/../client/facultylogo.png`);
const userLogo = fs.readFileSync(`${__dirname}/../client/userlogo.png`);

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    key: 'sessionId',
    secret : 'team23',
    resave: true,
    saveUninitialized: true,
  }
));

//-- GET ASSETS --

// Default request
app.get('/', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
});

// For the homepage. Checks if the homepage has a filter for its results, using the session.
app.get('/homepage.html', (request, response) =>{
  const parsedUrl = query.parse(request._parsedOriginalUrl.query);
  if(parsedUrl != {}){
    request.session.filter = parsedUrl.category ? parsedUrl.category : parsedUrl.filterProfessor;
  }
  console.log(request.session.filter);
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
});

// For the research page
app.get('/research.html', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(research);
  response.end();
});

// For the profile/settings page
app.get('/settings.html', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(settings);
  response.end();
});

// For the login page
app.get('/login.html', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(login);
  response.end();
});

// For the signup page
app.get('/register.html', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(register);
  response.end();
});

// For the main script
app.get('/client.js', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(js);
  response.end();
});

// For the styles
app.get('/styles.css', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
});

// For the faculty logo
app.get('/facultylogo.png', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(facultyLogo);
  response.end();
});

// For the student logo
app.get('/userlogo.png', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(userLogo);
  response.end();
});

//-- API CALLS --

/**
 * getAllStudents
 * Returns a response from the API including a list of all students with their
 * studentData, interests, and research
 */
app.get('/getAllStudents', (request, response) => {
  const url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/getAllStudents.php';

  const apiReq = http.get(url, (res) => {
    res.on('err', (err) => {
      console.log(err);
    });

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        return response.json(parsedData);
      } catch (e) {
        console.log('error');
        console.error(e.message);
      }
    });
  });
});

/**
 * getAllProfessors
 * Returns a response from the API including a list of all professors
 * with their name and id. 
 */
app.get('/getAllProfessors', (request, response) => {
  const url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/getAllProfessors.php';

  const apiReq = http.get(url, (res) => {
    res.on('err', (err) => {
      console.log(err);
    });

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        return response.json(parsedData);
      } catch (e) {
        console.log('error');
        console.error(e.message);
      }
    });
  });
});

/**
 * getStudentInfo
 * Returns a response from the API including all of the info for a single student,
 * based on the id from the session.
 */
app.get('/getStudentInfo', (request, response) => {
  let url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/getStudent.php?';
  let options = '';
  options += 'studentId=' + request.session.userId;

  url += options;

  const apiReq = http.get(url, (res) => {
    res.on('err', (err) => {
      console.log(err);
    });

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        return response.json(parsedData);
      } catch (e) {
        console.log('error');
        console.error(e.message);
      }
    });
  });
});

/**
 * getProfessorInfo
 * Returns a response from the API including all of the info for a single professor,
 * based on the id from the session.
 */
app.get('/getProfessorInfo', (request, response) => {
  let url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/getProfessor.php?';
  let options = '';
  options += 'professorId=' + request.session.userId;

  url += options;

  const apiReq = http.get(url, (res) => {
    res.on('err', (err) => {
      console.log(err);
    });

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        return response.json(parsedData);
      } catch (e) {
        console.log('error');
        console.error(e.message);
      }
    });
  });
});

/**
 * returnSession
 * Returns all of the info currently held in the session, so they
 * can be easily accessed.
 */
app.get('/returnSession', (request, response) => {
  if(request.session){
    let info = {
      userId: request.session.userId, 
      userRole: request.session.userRole, 
      userName: request.session.userName,
      filter: request.session.filter
    };

    if(request.session.loggedIn){
      info.loggedIn = request.session.loggedIn;
    } else {
      info.loggedIn = false;
    }
    return response.json(info);
  } else {
    return response.json({"message": 'No session available'});
  }
});

/**
 * getAllResearch
 * Gets all the research contained in the database, with their names, descriptions, ids, and categories.
 */
app.get('/getAllResearch', (request, response) => {
  let url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/research/getAll.php';

  const apiReq = http.get(url, (res) => {
    res.on('err', (err) => {
      console.log(err);
    });

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        return response.json({results: parsedData, filter: request.session.filter});
      } catch (e) {
        console.log('error');
        console.error(e.message);
      }
    });
  });
});

/**
 * loadUser
 * Sends back the information fo a single user
 */
app.get('/loadUser', (request, response) => {

  if(request.session.loggedIn) {
    const url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/get.php?userId=' + request.session.userId;

    const apiReq = http.get(url, (res) => {
      res.on('err', (err) => {
        console.log(err);
      });
  
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          request.session.userRole = parsedData.role;
          request.session.userName = parsedData.name;
          return response.json(parsedData);
        } catch (e) {
          console.log('error');
          console.error(e.message);
        }
      });
    });
  } else {
    return response.json({"role": "Guest"});
  }
 
});

app.post('/login', (request, response) => {
  request.session.userId = request.body.userId;
  request.session.loggedIn = true;
  console.log(request.session.userId);
  console.log('login');
  return response.json({"message": "success"});
});

app.get('/signout', (request, response) => {
  if(request.session) {
    request.session.destroy();
  }
  console.log('signout');
  return response.json({"message": "logged out"});
});

app.listen(port, (err) => {
  if(err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});