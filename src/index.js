import './index.css';
import nameGenerator from './name-generator';
import isDef from './is-def';
  
  

// Store/retrieve the name in/from a cookie.
const cookies = document.cookie.split(';');
console.log(cookies)
let wsname = cookies.find(function(c) {
  if (c.match(/wsname/) !== null) return true;
  return false;
});

if (isDef(wsname)) {
  wsname = wsname.split('=')[1];
} else {
  wsname = nameGenerator();
  document.cookie = "wsname=" + encodeURIComponent(wsname);
}

// Set the name in the header
document.querySelector('header>p').textContent = decodeURIComponent(wsname);

// Create a WebSocket connection to the server
// const ws = new WebSocket("ws://" + window.location.host+ "/socket");
const ws = new WebSocket("ws://localhost:1234");

// We get notified once connected to the server
ws.onopen = (event) => {
  console.log("We are connected.");
};

// Listen to messages coming from the server. When it happens, create a new <li> and append it to the DOM.
const messages = document.querySelector('#messages');
let line;
ws.onmessage = (event) => {
  console.log("on message");
  line = document.createElement('li');
  line.textContent = event.data;
  messages.appendChild(line);
};

// Retrieve the input element. Add listeners in order to send the content of the input when the "return" key is pressed.
function sendMessage(event) {
  event.preventDefault();
  event.stopPropagation();
  if (sendInput.value !== '') {
    // Send data through the WebSocket
    ws.send(sendInput.value);
    sendInput.value = '';
  }
}
const sendForm = document.getElementById("formMsg");
const sendInput = document.querySelector('#formMsg input');
sendForm.addEventListener('submit', sendMessage, true);
sendForm.addEventListener('blur', sendMessage, true);

window.addEventListener("load", () => {

  const divColor = document.getElementById("divColor");
  
  // Click sur le div color active l'input color
  divColor.addEventListener("click", function() {
      const color = document.getElementById("color-picker");
      color.click(); // action du click sur l'input color
      let $this = this;
      
      // Quand l'input change la valeur background du div change aussi
      color.addEventListener("change", function() {
        $this.style.backgroundColor = this.value;
      });
    });

  // Recuperer le canvas et le context 2d
  const canv = document.getElementById("draw");
  const context = canv.getContext("2d");

  // Initialiser positions
  let initialX;
  let initialY;

  // Fonction pour dessiner
  const draw = (cursorX, cursorY) => {
    const color = document.getElementById("color-picker");
    const stroke = document.getElementById("stroke");
    
    context.beginPath();
    context.moveTo(initialX, initialY);
    context.lineWidth = stroke.value;
    context.strokeStyle = color.value;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineTo(cursorX, cursorY);
    context.stroke();

    initialX = cursorX;
    initialY = cursorY;
  } ;

  // Quand on fait un click dans la souris
  const mouseDown = (evt) => {
    let val = valueMouse(evt.clientX, evt.clientY);
    initialX = val.x;
    initialY = val.y;
    draw(initialX, initialY); // Dessiner

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
    draw(val.x, val.y); // Dessiner
  }

  canv.addEventListener("mousedown", mouseDown);
  canv.addEventListener("mouseup", mouseUp);
});