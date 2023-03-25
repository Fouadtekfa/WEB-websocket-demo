import './index.css';
import nameGenerator from './name-generator';
import isDef from './is-def';
  
window.addEventListener("load", () => {
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
      if(gomeselected == true) {
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


    // Recuperer le canvas et le context 2d
    const canv = document.getElementById("draw");
    const context = canv.getContext("2d");

    // Store/retrieve the name in/from a cookie.
    const cookies = document.cookie.split(';');
    console.log(cookies);
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
      let data = event.data;

      try {
        data = JSON.parse(event.data);
      } catch(err) {
        console.log(err);
      }

      if(data.type) {
        switch(data.type) {
          case "msg" : {
            line = document.createElement('li');
            line.textContent = data.client + data.msg;
            messages.appendChild(line);    
            break;
          }
          case "canva" : {
            console.log(data);
            draw(data.msg);
          }
        }
      } else {
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
          msg : sendInput.value
        } 
        ws.send(JSON.stringify(obj));

        sendInput.value = '';
      }
    }
    const sendForm = document.getElementById("formMsg");
    const sendInput = document.querySelector('#formMsg input');
    sendForm.addEventListener('submit', sendMessage, true);
    sendForm.addEventListener('blur', sendMessage, true);

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

  const sendPositionWS = (cursorX, cursorY, initialX, initialY) => {
    const color = gomeselected ? "rgb(255, 255, 255)" : document.getElementById("color-picker").value;
    const stroke = gomeselected ? parseInt(document.getElementById("stroke").value) +2 : document.getElementById("stroke").value;
    console.log(color);
    
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
          }
        
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
});