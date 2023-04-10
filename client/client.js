/** Method for sending requests to the node server.
    Takes the requests type (GET, POST), the url,
    any possible parameters, and a callback method. 
 * 
 * @param {*} type 
 * @param {*} action 
 * @param {*} data 
 * @param {*} callback 
 */
const sendAjax = (type, action, data, callback) => {
    $.ajax({
      cache: false,
      type: type,
      url: action,
      data: data,
      dataType: "json",
      success: callback,
      error: function(xhr, status, error) {
        var messageObj = JSON.parse(xhr.responseText);
        console.log(messageObj.error);
      }
    });
  };

/**
 * Gets info for all students in the database. Called on
 * the professors homepage, and can be filtered.
 */
const handleGetAllStudents = () => {
  sendAjax('GET', '/returnSession', null, (session) => {
    sendAjax("GET", "/getAllStudents", null, (data) => {
      console.log(data);
      var results = Object.keys(data).map(function(key) {
        return [Number(key), data[key]];
      });
      $("#frameContent").empty();
      results.forEach((obj) => {
        result = obj[1].studentData;
        console.log(result.interests);
        let catStr = "";

        // This if statement both sets up the categoryString, and filters results.
        if(result.interests !== "null" && result.interests !== "") {
          console.log('wtf');
          const parsedInterests = JSON.parse(result.interests);
          console.log(parsedInterests, session.filter);

          let lowerArr = parsedInterests.map((str) => {
            return str.toLowerCase();
          });

          // Filter out unwanted results based on the session's filter
          if(!lowerArr.includes(session.filter) && session.filter !== undefined){
            return false;
          }

          for(let i = 0; i < parsedInterests.length; i++) {
            catStr += parsedInterests[i];
            if(i != parsedInterests.length-1) {
              catStr += ", ";
            }
          } // The below bit determines if a student with no interests will be listed or not
        } else if (session.filter !== undefined) {
            return false;
        } else {
          // If the filter is undefined, then there is no filter, therefore we can show the student
          catStr = "N/A";
        }

        // Sets up result div with the required info
        const dataFrame = document.createElement('div');
        dataFrame.className = "dataFrame";

        const name = document.createElement('div');
        name.className = "nameSection";

        const nameImg = document.createElement("img");
        const nameP1 = document.createElement("p");
        const nameP2 = document.createElement("p");
        nameP2.className = 'date';

        nameImg.src = 'userlogo.png';
        nameImg.id = 'userContentPic';
        nameP1.innerHTML += `${result.name}`;
        nameP2.innerHTML += `Grad Date: ${result.gradDate}`;

        $(name).append(nameImg, nameP1);

        const desc = document.createElement('div');
        desc.className = "descSection";
        const descH2 = document.createElement('h2');
        const bio = document.createElement('p');

        descH2.innerHTML = `Bio`;
        bio.innerHTML = `${result.bio}`;
        if(result.bio === ""){
          bio.innerHTML = "No bio available."
        }

        $(desc).append(descH2, bio);

        const cat = document.createElement('div');
        cat.className = "categorySection";
        const catP = document.createElement('p');
        catP.className = "categoryLabel";

        catP.innerHTML = catStr;
        $(cat).append(catP);
        $(dataFrame).append(name, desc, cat);
        $("#frameContent").append(dataFrame);
      });
    });
  });
};

/**
 * Method for getting all the research in the database.
 * Called on a students homepage.
 */
const handleGetAllResearch = () => {
  console.log('get');
  sendAjax("GET", "/getAllResearch", null, (data) => {
    console.log(data.filter);
    const results = data.results.data;
    console.log(results);
    $("#frameContent").empty();
    const resultArr = Object.values(results).reverse();
    resultArr.forEach((dataObject) => {
      const result = dataObject.data;

      // Filter out unwanted results
      if(result.categoryName.toLowerCase() !== data.filter && result.professor !== data.filter && data.filter !== undefined){
        return false;
      } 

      const dataFrame = document.createElement('div');
      dataFrame.className = "dataFrame";

      const name = document.createElement('div');
      name.className = "nameSection";

      const nameImg = document.createElement("img");
      const nameP1 = document.createElement("p");

      nameImg.src = 'facultylogo.png';
      nameImg.id = 'userContentPic';
      nameP1.innerHTML += `${result.professor}`;

      $(name).append(nameImg, nameP1);

      const desc = document.createElement('div');
      desc.className = "descSection";
      const descH2 = document.createElement('h2');
      const bio = document.createElement('p');

      descH2.innerHTML = `${result.name}`;
      bio.innerHTML = `${result.description}`;

      $(desc).append(descH2, bio);

      const cat = document.createElement('div');
      cat.className = "categorySection";
      const catP = document.createElement('p');
      catP.className = "categoryLabel";
      catP.innerHTML = `${result.categoryName}`;

      $(cat).append(catP);

      $(dataFrame).append(name, desc, cat);
      if($('#userType').text() === 'Student') {
        // If the user is a student, allow them to click the dataframe to open the request modal.
        $(dataFrame).click((e) => {
          $(".modal").css('display', 'block');
          $("#modalName").text(`${result.name}`);
          $("#modalDesc").text(`${result.description}`);
          $('.modalBtn').click((e) => {
            sendAjax('GET', '/returnSession', null, (session) => {
              const options = {
                researchId: result.researchId,
                studentId: session.userId
              }
              console.log(options);

              // Request for a student to assign themselves to the research project.
              $.ajax({
                cache: false,
                type: "POST",
                url: 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/assignStudent.php',
                data: options,
                dataType: "json",
                success: (res) => {
                  console.log(res);
                  location.reload();
                },
                error: function(xhr, status, error) {
                  console.log(error);
                }
              });
            });
          });
        });
      }
      $("#frameContent").append(dataFrame);
    });

    // Populates the filter dropdown with all of the professors
    sendAjax('GET', '/getAllProfessors', null, (profs) => {
      populateDropdown(profs);
    });
  });
};

/**
 * Loads the student user's data into the settings page.
 * Called on the settings page, which is only available to students.
 */
const loadStudentProfile = () => {
  loadUser();
  // Call to get info from the session.
  sendAjax('GET', '/returnSession', null , (session) => {
    if(!session.loggedIn) {
      window.location.href = '/homepage.html';
    } else {
      // Call to get student info
      sendAjax('GET', '/getStudentInfo', null, (data) => {
        console.log(data);
        
        // Update the fields with the returned data.
        document.querySelector('#available').checked = data.studentData.searching == "1"? true : false;
        document.querySelector('#desc').value = data.studentData.bio;
        document.querySelector('#email').value = data.studentData.email;
    
        const interests = data.interests;
        const checks = document.querySelectorAll('input[type=checkbox]');
        
        if(interests) {
          for(let i = 0; i < interests.length; i++) {
            checks.forEach((check) => {
              if(check.value === interests[i]){
                check.checked = true;
              }
            });
          }
        }
      });
    }
  });

  // --- UPDATE USER ---
  // Updates a user based on their userId and any of the fields they changed.
  $('#descSubmit').click((e) => {
    console.log('begin update');
    const checks = document.querySelectorAll('input[type=checkbox]');
    const interestList = [];
    const available = document.querySelector('#available').checked ? 1 : 0;
    console.log('available', available)


    // to dodge the initial searching box
    for(let i = 1; i < checks.length; i++) {
      if(checks[i].checked) {
        interestList.push(checks[i].value);
      }
    }

    let userId;

    // Gets the userId to send to the API
    sendAjax("GET", '/returnSession', null, (session) => {
      userId = session.userId;
      
      // Post options
      const options = {
        studentId: userId,
        searching: available.toString(),
        interests: interestList,
        bio: $('#desc').val(),
        email: $('#email').val()
      };

      // Post request sent directly to the API
      $.ajax({
        cache: false,
        type: "POST",
        url: 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/updateStudent.php',
        data: options,
        dataType: "json",
        success: (res) => {
          console.log(res);
        },
        error: function(xhr, status, error) {
          console.log(status);
          console.log(error);
        }
      });
    });
  });

  // --- DELETE USER ---
  // Deletes the user's account based on their userId
  $('#deleteButton').click((e) => {
    e.preventDefault();

    // Gets the userId to send to the API
    sendAjax("GET", '/returnSession', null, (session) => {
      userId = session.userId;
      deleteUser(userId);
    });
  })
};

/**
 * Calls loaduser with the overload to tell it to do run methods for the homepage
 */
const loadHomepage = () => {
  loadUser('home');
};

// Loads the research of a particular user
const loadResearch = () => {
  let userRole;
  sendAjax('GET', '/returnSession', null, (session) => {
    if(session.loggedIn) {

      // If they're a student, call it normally, otherwise call with overload
      if(session.userRole === 'student') {
        sendAjax('GET', '/getStudentInfo', null, (data) => {
          $("#frameContent").empty();
          
          makeResults(data.research);
        });
      } else if (session.userRole === 'prof') {
        sendAjax('GET', '/getProfessorInfo', null, (data) => {
          $("#frameContent").empty();
          makeResults(data.research, session.userId);
        });
      }
    } else {
      window.location.href = '/homepage.html';
    }
  });
};

/**
 * Method for appending the research results to the research page.
 * Takes data, an array of the results, and profId, an overload when called by a professor
 * @param {*} data 
 * @param {*} profId 
 */
const makeResults = (data, profId) => {
  // Reverse so that the last added appears on the top
  const reverseData = data.reverse();
  reverseData.forEach((research) => {
    // Set up div to be appended
    const frame = document.createElement('div');
    frame.className = 'researchDataFrame';

    const name = document.createElement('div');
    name.className = 'researchNameSection';

    const h1 = document.createElement('h1');
    h1.textContent = research.researchName ? research.researchName: research.name;

    const info = document.createElement('div');
    info.className = 'researchInfoSection';

    const button = document.createElement('button');
    button.className = 'infoBtn';
    button.textContent = 'Info';

    $(info).append(button);

    $(name).append(h1);
    $(frame).append(name);
    $(frame).append(info);

    $('#frameContent').append(frame);
    if($('#userType').text() === 'Student') {
      // If they're a student, they can't create research
      $('.createResearchDiv').css('display', 'none');
    }

    // When the info button is clicked
    $(button).click((e) => {
      let category;
      if(research.researchCategory === "1"){
        category = 'Science';
      } else if (research.researchCategory === "2"){
        category = 'Math';
      } else if (research.researchCategory === "3"){
        category = 'General';
      }

      $(".modal").css('display', 'block');
      $("#modalResearchName").text(`${research.researchName ? research.researchName: research.name}`);
      $("#categoryResearchName").text(`${category}`);
      $("#modalResearchDesc").text(`${research.researchDescription ? research.researchDescription: research.description}`);
      $("#hiddenResearchId").val(research.researchId);
    });
  });

  // When the create button is clicked
  $('#createSubmit').click((e) => {
    const newName = $("#createName").val();
    const newDesc = $("#createDesc").val();

    let newCat;
    const radios = document.querySelectorAll('input[type=radio]');
    radios.forEach((radio) => {
      if(radio.checked){
        newCat = radio.value;
      }
    });

    const options = {
      professorId: parseInt(profId),
      name: newName,
      description: newDesc,
      category: newCat,
      results: ""
    };

    // Direct API call to create research
    $.ajax({
      cache: false,
      type: "POST",
      url: 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/research/create.php',
      data: options,
      dataType: "json",
      success: (res) => {
        console.log(res);
      },
      error: function(xhr, status, error) {
        console.log(status);
        console.log(error);
      }
    });
  });

  // For deleting a particular research
  $('#deleteResearchButton').click((e) => {
    deleteResearch($("#hiddenResearchId").val())
  });
};

/**
 * Called for loading info into the sidebar. 
 * Takes one parameter, that tells if the page is the homepage or not
 * @param {*} type 
 */
const loadUser = (type) => {
  sendAjax('GET', '/loadUser', null, (data) => {
    let role;
    const name = data.name;

    if(data.role === 'student') {
      role = 'Student';
    } else if (data.role === 'prof') {
      role = 'Professor';
    } else {
      role = 'Guest';
    }

    $('#userName').text(name);
    $('#userType').text(role);

    if(role === 'Guest') {
      $('#researchButton').css('display', 'none');
      $('#logOut').text('Sign In');
    }

    if(role !== 'Student') {
      $('#settingsButton').css('display', 'none');
    }

    if(role === 'Professor') {
      document.querySelector('#userPic').src = 'facultylogo.png';
    }

    // If we're loading the homepage, load the correct results.
    if(type === 'home') {
      // Guests and students can see research, professors see students
      if(role === 'Student' || role === 'Guest') {
        handleGetAllResearch();
      } else if (role === 'Professor') {
        $("#professorDropdownButton").css('display', 'none');
        handleGetAllStudents();
      } 
    }
  });
};

/**
 * Called when a user hits the login button.
 * Sends a call to the API to validate the login credentials.
 */
const login = () => {
  const user = $("input[type='text'").val();
  const pass = $("input[type='password'").val();

  // post options
  const options = {
    username: user,
    password: pass
  };

  // Direct request to API to validate login
  $.ajax({
    cache: false,
    type: "POST",
    url: 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/login.php',
    data: options,
    dataType: "json",
    success: (res) => {
      sendAjax("POST", '/login', {userId: res.id}, (message) => {
        window.location.href = '/homepage.html';
      });
      console.log(res);
    },
    error: function(xhr, status, error) {
      window.alert('Wrong username or password.');
      console.log(status);
      console.log(error);
    }
  });
  
};

// Called when user submits the signup form.
const signup = () => {  
  const username = $("#user").val();
  // Get role from radio buttons
  let role;
  const radios = document.querySelectorAll('input[type=radio]');
  radios.forEach((radio) => {
    if(radio.checked){
      role = radio.value;
    }
  });
  const name = $("#name").val();
  const pass = $('#pass').val();
  const email = $('#email').val();

  // post options
  const options = {
    username: username,
    role: role,
    email: email,
    name: name,
    password: pass
  };

  // API call to create the user
  $.ajax({ 
    cache: false,
    type: "POST",
    url: 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/create.php',
    data: options,
    dataType: "json",
    success: (res) => {
      window.location.href = '/login.html';
      console.log(res);
    },
    error: function(xhr, status, error) {
      window.alert('Something went wrong.');
      console.log(status);
      console.log(error);
    }
  });
};

// Called when user hits the delete button on their profile page
const deleteUser = (userId) => {
  const options = {
    userId: userId
  };

  // API call to delete user
  $.ajax({
    cache: false,
    type: "POST",
    url: 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/delete.php',
    data: options,
    dataType: "json",
    success: (res) => {
      console.log(res);
      sendAjax('GET', '/signout', null, () =>{
        window.location.href = '/login.html';
      });
    },
    error: function(xhr, status, error) {
      window.alert('Something went wrong.');
      console.log(status);
      console.log(error);
    }
  });
};

// Called when a professor hits the delete button on their research
const deleteResearch = (researchId) => {
  const options = {
    researchId: researchId
  };

  // Api call to delete the research
  $.ajax({
    cache: false,
    type: "POST",
    url: 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/research/delete.php',
    data: options,
    dataType: "json",
    success: (res) => {
      location.reload();
    },
    error: function(xhr, status, error) {
      window.alert('Something went wrong.');
      console.log(status);
      console.log(error);
    }
  });
};

// Inserts the names of all professors into the dropdown menu
const populateDropdown = (profs) => {
  $("#professorDropdown").empty();
  let names = [];

  Object.values(profs).forEach((obj) => {
    names.push(obj.prof.name);
  });
  
  names.forEach((name) => {
    const link = document.createElement('a');
    link.innerHTML = name;
    link.href = '/homepage.html?filterProfessor=' + name;
    $("#professorDropdown").append(link);
  });
};

// On document load
$(document).ready(() => {
  console.log('ready');

  // Event listeners
  $('#signOutBtn').click((e) => {
    sendAjax('GET', '/signout', null, null);
  });
});