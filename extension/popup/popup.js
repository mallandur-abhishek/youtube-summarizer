const minSliderValue = 30;
const summaryButton = document.getElementById('summaryButton');
const slider = document.getElementById('slider');
const events = ['change', 'input'];

const summarize = async (videoId = '') => {
  const percentLengthOfSummary = document.getElementById('slider').value / 100;
  const summary = await fetch(`http://127.0.0.1:5000/?video_id=${videoId}&percent=${percentLengthOfSummary}`, {
    method: 'GET',
  }).catch((error) => {
    document.getElementById('messages').innerHTML = error;
  });
  const summaryJson = await summary.json();
  if ('error' in summaryJson) { document.getElementById('messages').innerHTML = 'Error, no transcript found'; } else {
    document.getElementById('messages').innerHTML = 'Summary generated!';
    // eslint-disable-next-line no-undef
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // eslint-disable-next-line no-undef
      chrome.tabs.sendMessage(tabs[0].id, { summary: summaryJson }, () => {});
    });
  }
};

summaryButton.onclick = function () {
  // eslint-disable-next-line no-undef
  chrome.tabs.getSelected(null, (tab) => {
    const { url } = tab;
    if (url.indexOf('youtube.com/watch') >= 0) {
      const videoId = url.split('?v=')[1].substring(0, 11);
      document.getElementById('messages').innerHTML = 'Loading summary...';
      summarize(videoId);
    } else {
      document.getElementById('messages').innerHTML = 'No youtube video found';
    }
  });
};

events.forEach((evt) => {
  slider.addEventListener(evt, function () {
    const currValue = this.value;
    if (currValue <= minSliderValue) {
      this.value = minSliderValue;
    }
  });
});

/*
 * Check for browser support
 */
const supportMsg = document.getElementById('msg');

if ('speechSynthesis' in window) {
  supportMsg.innerHTML = 'Your browser <strong>supports</strong> speech synthesis.';
} else {
  supportMsg.innerHTML = 'Sorry your browser <strong>does not support</strong> speech synthesis.<br>Try this in <a href="https://www.google.co.uk/intl/en/chrome/browser/canary.html">Chrome Canary</a>.';
  supportMsg.classList.add('not-supported');
}

// Get the 'speak' button
const speakBtn = document.getElementById('speak');

// Get the text input element.
const speechMsgInput = document.getElementById('speech-msg');

// Get the voice select element.
const voiceSelect = document.getElementById('voice');

// Get the attribute controls.
const volumeInput = document.getElementById('volume');
const rateInput = document.getElementById('rate');
const pitchInput = document.getElementById('pitch');

// Fetch the list of voices and populate the voice options.
function loadVoices() {
  // Fetch the available voices.
  const voices = speechSynthesis.getVoices();

  // Loop through each of the voices.
  voices.forEach((voice) => {
    // Create a new option element.
    const option = document.createElement('option');

    // Set the options value and text.
    option.value = voice.name;
    option.innerHTML = voice.name;

    // Add the option to the voice selector.
    voiceSelect.appendChild(option);
  });
}

// Execute loadVoices.
loadVoices();

// Chrome loads voices asynchronously.
window.speechSynthesis.onvoiceschanged = () => loadVoices();

// Create a new utterance for the specified text and add it to
// the queue.
const speak = (text) => {
  // Create a new instance of SpeechSynthesisUtterance.
  const msg = new SpeechSynthesisUtterance();

  // Set the text.
  msg.text = text;

  // Set the attributes.
  msg.volume = parseFloat(volumeInput.value);
  msg.rate = parseFloat(rateInput.value);
  msg.pitch = parseFloat(pitchInput.value);

  // If a voice has been selected, find the voice and set the
  // utterance instance's voice attribute.
  if (voiceSelect.value) {
    [msg.voice] = speechSynthesis.getVoices().filter((voice) => voice.name === voiceSelect.value);
  }

  // Queue this utterance.
  window.speechSynthesis.speak(msg);
};

// Set up an event listener for when the 'speak' button is clicked.
speakBtn.addEventListener('click', () => {
  if (speechMsgInput.value.length > 0) {
    speak(speechMsgInput.value);
  }
});
