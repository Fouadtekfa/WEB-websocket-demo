import './index.css';
import nameGenerator from './name-generator';
import colorGenerator from "./color-generator";
import isDef from './is-def';
let idCanvas = 0;
let countPages = 0;
let newPageButton = document.createElement("div");
let globalColor = "";
let statusCreator = false;
window.addEventListener("load", () => {
  let pagesContainer = document.getElementById("pageContainer");
  newPageButton.classList.add("newDessin");
  newPageButton.classList.add("page");
  
  let newContent = document.createTextNode("+");
  newPageButton.appendChild(newContent);
  pagesContainer.appendChild(newPageButton);

  // Create a new page
  newPageButton.addEventListener("click", function(){
    statusCreator = true;
    // Create an id unique for the canvas
    idCanvas = Date.now() + "";
    
    // Hide elements canvas
    let allCanvas = document.querySelectorAll("canvas");
    allCanvas.forEach(c => { c.setAttribute("style", "display: none"); });
    //  Hide elements messages
    let allmessages = document.querySelectorAll(".msgs");
    allmessages.forEach(m => { m.style.display = "display: none"; });

    // Object newCanvas with id
    let obj = {
        type : "newCanvas",
        msg : {
          id: idCanvas
        }
    } 
    ws.send(JSON.stringify(obj));
  });

  const ws = new WebSocket("ws://localhost:1234");
  ws.onopen = (event) => { console.log("Canvas conected."); };
  
  ws.onmessage = (event) => {
    console.log("on message");
    let data = event.data;

    try {
      data = JSON.parse(event.data); // Parse JSON
        if(data.type) {
            switch(data.type) {
                case "newCanvas" : {
                  // If is a new canvas create elements
                  idCanvas = data.msg.id;
                  
                  // Create canvas
                  let canvasSection = document.getElementById("canvasSection");
                  const canv = document.createElement("canvas");
                  canv.setAttribute("id", data.msg.id);
                  canv.setAttribute("width", "1030px");
                  canv.setAttribute("height", "470px");
                  canv.classList.style= "margin: 0 auto";
                  canvasSection.appendChild(canv);
                  
                  let allmessages = document.querySelectorAll(".msgs");
                  allmessages.forEach(m => {
                      m.style.display = "none";
                  });

                  // Create conversation
                  let messagesSection = document.getElementById("messagesSection");
                  let divMessages = document.createElement("div");
                  divMessages.style = "height: 100%;";
                  divMessages.classList.add("msgs");
                  let ulMessages = document.createElement("ul");
                  ulMessages.id = "messages_"+data.msg.id;
                  ulMessages.style = "height: 80%;";
                  ulMessages.classList.add("messages");
                  
                  let formMessages = document.createElement("form");
                  formMessages.id = "formMsg_"+data.msg.id;
                  
                  let inputMessages = document.createElement("input");
                  inputMessages.setAttribute("autocomplete", "off");
                  inputMessages.setAttribute("placeholder", "Send a message");
                  
                  formMessages.appendChild(inputMessages);
                  divMessages.appendChild(ulMessages);
                  divMessages.appendChild(formMessages);
                  messagesSection.appendChild(divMessages);

                  createNewDessign(data.msg.id);
                  statusCreator = false;
                }
            }
        }
    } catch(err) {
        console.log('err');
        
    }


  };

  createUserInformation();

});

function createNewDessign(id) {
  //console.log("Create : " + id);
  
  // Recuperer le canvas et le context 2d
  //const canv = document.getElementById("draw");
  const canv = document.getElementById(id);
  const context = canv.getContext("2d");

  let activatedPages = document.querySelectorAll(".activatedPage");
  let pagesContainer = document.getElementById("pageContainer");
  
  let page = document.createElement("div");
  page.setAttribute("class", "page");
  let pagesAll = document.querySelectorAll(".page");
  
  // Change window in the creation only if is the creator
  console.log(pagesAll.length);
  if(statusCreator || pagesAll.length == 1){
    activatedPages.forEach(p => {
      p.classList.remove("activatedPage");
      
    });
    page.classList.add("activatedPage");
  }
  
  // Select a canvas page
  page.addEventListener("click", function() {
    let activatedPages = document.querySelectorAll(".activatedPage");
    // Remove selected attribut for other pages 
    activatedPages.forEach(p => { p.classList.remove("activatedPage"); });
    page.classList.add("activatedPage");

    // Show the canvas selected
    let allCanvas = document.querySelectorAll("canvas");
    allCanvas.forEach(c => { c.style = "display:none"; });
    canv.style = "display:block";

    let allmessages = document.querySelectorAll(".msgs");
    allmessages.forEach(m => { m.style.display = "none"; });

    const messages = document.querySelector('#messages_'+id).parentNode;
    messages.style.display = "block";
    messages.style.heigth = "100%";
  });

  let idReduce = " ..."+idCanvas.substr(idCanvas.length-5, idCanvas.length);
  let newContent = document.createTextNode("Canvas id:" + idReduce);
  page.appendChild(newContent)
  pagesContainer.insertBefore(page, newPageButton);

  // Initialiser positions
  let initialX;
  let initialY;
  let gomeselected = false;
  let pencilSelected = true;

  const gome = document.getElementById("gome");
  const gomeContainer = document.getElementById("gomeContainer");
  const pencil = document.getElementById("pencil");

  // Listener pour la gome (activer gomme, desactiver pencil)
  gome.addEventListener("click", function() {
    if(gomeselected) {
      gomeselected = false;
      pencilSelected = true;
      pencil.classList.add('pencilSelected'); 
    } else {
      gomeselected = true;
      pencilSelected = false;
      gomeContainer.classList.add('gomeSelected');
      pencil.classList.remove('pencilSelected');
    }
  });
  
  // Listener pour pencil (activer pencil, desactiver gome)
  pencil.addEventListener("click", function() {
    if(!pencilSelected) {
      pencilSelected = true;
      gomeselected = false;
      pencil.classList.add('pencilSelected');
      gomeContainer.classList.remove('gomeSelected');
    }
  });

  // Create a WebSocket connection to the server
  // const ws = new WebSocket("ws://" + window.location.host+ "/socket");
  const ws = new WebSocket("ws://localhost:1234");

  // We get notified once connected to the server
  ws.onopen = (event) => { console.log("We are connected."); };

  // Listen to messages coming from the server. When it happens, create a new <li> and append it to the DOM.
  //const messages = document.querySelector('#messages');
  const messages = document.querySelector('#messages_'+id);
  let line;

  // Checking messages
  ws.onmessage = (event) => {
    console.log("on message");
    let data = event.data;
    try {
      data = JSON.parse(event.data);
      if(data.msg.id == id) {
        if(data.type) {
            switch(data.type) {
                case "msg" : {
                    // If is a type message, add to the conversation
                    line = document.createElement('li');
                    line.textContent = data.client + data.msg.message;
                    messages.appendChild(line);
                    break;
                }
                case "canva" : {
                  // If is type canva, draw
                    //console.log(data);
                    draw(data.msg);
                }
            }
        } else {
            line = document.createElement('li');
            line.textContent = data;
            messages.appendChild(line);
        }
      }
    } catch(err) {
        console.log('cant do json');
        line = document.createElement('li');
        line.textContent = data;
        messages.appendChild(line);
    }


  };

  // Retrieve the input element. Add listeners in order to send the content of the input when the "return" key is pressed.
  function sendMessage(event) {
    event.preventDefault();
    event.stopPropagation();

    if (sendInput.value !== '') {
      // Send data through the WebSocket
      let obj = {
        type : "msg",
        msg : {
          id : id,
          message : sendInput.value
        }
      } 
      ws.send(JSON.stringify(obj));

      sendInput.value = '';
    }
  }

  const sendForm = document.getElementById("formMsg_"+id);
  const sendInput = document.querySelector('#formMsg_'+id+' input');
  sendForm.addEventListener('submit', sendMessage, true);
  sendForm.addEventListener('blur', sendMessage, true);

const sendPositionWS = (cursorX, cursorY, initialX, initialY) => {
  const color = gomeselected ? "rgb(255, 255, 255)" : globalColor;
  const stroke = gomeselected ? parseInt(document.getElementById("stroke").value) +2 : document.getElementById("stroke").value;
  
  // Canva object with x and y, style and color
  let obj = {
    type : "canva",
    msg : {
        newPositions : {
          x : cursorX,
          y : cursorY
        },
        initPositions : {
          x : initialX,
          y : initialY
        },
        style : {
          color : color,
          stroke : stroke
        },
        id : id
      
    }
  }
  ws.send(JSON.stringify(obj));
}

// Quand on fait un click dans la souris
const mouseDown = (evt) => {
  let val = valueMouse(evt.clientX, evt.clientY);
  initialX = val.x;
  initialY = val.y;
  //draw(initialX, initialY); // Dessiner
  sendPositionWS(initialX, initialY, initialX, initialY); // Dessiner

  // Mouvement de la souris lorsque l'on presse le boutton
  canv.addEventListener("mousemove", mouseMoving);
};

//Positions exactes
const valueMouse = (x, y) => {
  // Obtenir positions par rapport a la fenetre
  let rect = canv.getBoundingClientRect();
  let objX = rect.left;
  let objY = rect.top;

  // Calculer la position de la souris par rapport à l'objet
  // moin la position de l'objet par rapport à la fenêtre
  let relX = x - objX;
  let relY = y - objY;

  return {
    x: relX,
    y: relY
  };
};

// S'arreter quand on lache le boutton de la souris
const mouseUp = () => {
  canv.removeEventListener("mousemove", mouseMoving);
}

// Mouvement de la souris 
const mouseMoving = (evt) => {
  // Calculer x et y
  let val = valueMouse(evt.clientX, evt.clientY);
  //draw(val.x, val.y); // Dessiner
  sendPositionWS(val.x, val.y, initialX, initialY); // Dessiner
}

canv.addEventListener("mousedown", mouseDown);
canv.addEventListener("mouseup", mouseUp);

// Fonction pour dessiner
function draw(obj) {
  let newPositions = obj.newPositions;
  let initPositions = obj.initPositions;
  let style = obj.style;
  context.beginPath();
  context.moveTo(initPositions.x, initPositions.y);
  context.lineWidth = style.stroke;
  context.strokeStyle = style.color;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineTo(newPositions.x, newPositions.y);
  context.stroke();
  initialX = newPositions.x;
  initialY = newPositions.y;
} ;

}

function createUserInformation() {
    // Store/retrieve the name in/from a cookie.
    const cookies = document.cookie.split(';');
    //console.log(cookies);
    let wsname = cookies.find(function(c) {
      if (c.match(/wsname/) !== null) return true;
      return false;
    });
  
    let wscolor = cookies.find(function(c) {
        if (c.match(/color/) !== null) return true;
        return false;
    });
  
    if (isDef(wsname) && isDef(wscolor)) {
      wsname = wsname.split('=')[1];
      wscolor = wscolor.split('=')[1];
      globalColor = wscolor;
    } else {
      wsname = nameGenerator();
      document.cookie = "wsname=" + encodeURIComponent(wsname);
  
      wscolor = colorGenerator();
  
      document.cookie = "wscolor=" + encodeURIComponent(wscolor);
      globalColor = wscolor;
    }
  
    // Set the name in the header
    document.querySelector('header>p').textContent = decodeURIComponent(wsname);
  
}