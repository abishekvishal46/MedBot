const msgerForms = document.querySelectorAll(".msger-inputarea");
const msgerChats = document.querySelectorAll(".msger-chat");
const navLinks = document.querySelectorAll('.navbar-menu a');
const chats = document.querySelectorAll('.msger');

const BOT_IMG = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";
const PERSON_IMG = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG-5Wi8qZXluHi11q-AHGh8riznXRoltGVYQ&s";
const BOT_NAME = "BOT";
const PERSON_NAME = "User";

// Navigation Link Clicks
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const chatID = link.getAttribute('data-chat');
    openChat(chatID);
  });
});

function openChat(chatID) {
  chats.forEach(chat => {
    chat.classList.remove('active-chat');
  });
  document.getElementById(chatID).classList.add('active-chat');
}

// Messaging Functions
msgerForms.forEach((form, index) => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const chatType = form.closest(".msger").id;
    const msgerInput = form.querySelector(".msger-input");
    const msgText = msgerInput.value;
    const msgerChat = msgerChats[index];

    if (!msgText && !uploadedImageSrc) return;

    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText, msgerChat, uploadedImageSrc);
    msgerInput.value = "";
    imagePreviewContainer.innerHTML = '';  // Clear the preview
    const imageToUpload = uploadedImageSrc; // Store the image source before resetting
    uploadedImageSrc = ''; // Reset the image source

    // Send message and image to the backend to get a response
    sendMessageToBackend(chatType, msgText, msgerChat, imageToUpload);
  });
});

function sendMessageToBackend(chatType, message, chat, imageSrc = '') {
  appendTypingIndicator(chat);

  // Determine the endpoint based on the chat type
  let endpoint = '/chat'; // Default endpoint for "Medical Advice"
  if (chatType === 'wound-detection') {
    endpoint = '/wound-detection';
  } else if (chatType === 'custom-feature') {
    endpoint = '/custom-feature';
  }

  const formData = new FormData();
  formData.append('message', message);
  if (imageSrc) {
    const imageBlob = dataURItoBlob(imageSrc);
    formData.append('image', imageBlob, 'uploaded-image.png');
  }

  let fetchOptions = { method: 'POST' };

  if (chatType === 'medical-advice') {
    // For Medical Advice, send JSON data
    fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message }),
    };
  } else if (chatType === 'wound-detection') {
    // For Wound Detection, use FormData
    fetchOptions = {
      method: 'POST',
      body: formData,
    };
  } else if (chatType === 'custom-feature') {
    // For Custom Feature, use FormData (if applicable)
    fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message }),
    };
  }

  fetch(endpoint, fetchOptions)
    .then(response => response.json())
    .then(data => {
      removeTypingIndicator(chat);
      appendMessage(BOT_NAME, BOT_IMG, "left", data.response, chat, '', true);
    })
    .catch(error => {
      console.error('Error:', error);
      removeTypingIndicator(chat);
      appendMessage(BOT_NAME, BOT_IMG, "left", "Sorry, something went wrong.", chat);
    });
}

// This function now supports HTML rendering
function appendMessage(name, img, side, text, chat, imageSrc = '', isBotMessage = false) {
  const msgContainer = document.createElement("div");
  msgContainer.classList.add("msg", `${side}-msg`);

  const msgImg = document.createElement("div");
  msgImg.classList.add("msg-img");
  msgImg.style.backgroundImage = `url(${img})`;

  const msgBubble = document.createElement("div");
  msgBubble.classList.add("msg-bubble");

  const msgInfo = document.createElement("div");
  msgInfo.classList.add("msg-info");

  const msgInfoName = document.createElement("div");
  msgInfoName.classList.add("msg-info-name");
  msgInfoName.textContent = name;

  const msgInfoTime = document.createElement("div");
  msgInfoTime.classList.add("msg-info-time");
  msgInfoTime.textContent = formatDate(new Date());

  const msgText = document.createElement("div");
  msgText.classList.add("msg-text");

  msgInfo.appendChild(msgInfoName);
  msgInfo.appendChild(msgInfoTime);
  msgBubble.appendChild(msgInfo);
  msgBubble.appendChild(msgText);
  msgContainer.appendChild(msgImg);
  msgContainer.appendChild(msgBubble);
  chat.appendChild(msgContainer);
  chat.scrollTop = chat.scrollHeight;

  // Typing effect
  if (isBotMessage && /<\/?[a-z][\s\S]*>/i.test(text)) {
    typeHtmlEffect(msgText, text);
  } else {
    typeTextEffect(msgText, text);
  }

  if (imageSrc) {
    const imageElement = document.createElement("img");
    imageElement.src = imageSrc;
    imageElement.classList.add("msg-image");
    msgText.appendChild(imageElement);
  }
}

function typeTextEffect(element, text) {
  let index = 0;
  const typingSpeed = 10;

  function typeCharacter() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(typeCharacter, typingSpeed);
    }
  }

  setTimeout(typeCharacter, typingSpeed);
}

function typeHtmlEffect(element, htmlString) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  const elements = Array.from(tempDiv.childNodes);

  let index = 0;
  const typingSpeed = 50;

  function typeNode() {
    if (index < elements.length) {
      element.appendChild(elements[index].cloneNode(true));
      index++;
      setTimeout(typeNode, typingSpeed);
    }
  }

  setTimeout(typeNode, typingSpeed);
}

function appendTypingIndicator(chat) {
  const typingHTML = `
    <div class="msg left-msg typing-indicator">
      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${BOT_NAME}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>
        <div class="msg-text">...</div>
      </div>
    </div>
  `;
  chat.insertAdjacentHTML("beforeend", typingHTML);
  chat.scrollTop = chat.scrollHeight;
}

function removeTypingIndicator(chat) {
  const typingIndicator = chat.querySelector(".typing-indicator");
  if (typingIndicator) typingIndicator.remove();
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();
  return `${h.slice(-2)}:${m.slice(-2)}`;
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

// Image upload and preview functionality
const imageUploadInput = document.getElementById("image-upload");
const imagePreviewContainer = document.getElementById("image-preview-container");
let uploadedImageSrc = '';

// Show image preview when a file is selected
imageUploadInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImageSrc = e.target.result;
      imagePreviewContainer.innerHTML = `<img src="${uploadedImageSrc}" class="image-preview" alt="Image Preview">`;
    };
    reader.readAsDataURL(file);
  }
});
