document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  let userInteracted = false; // Track if user interaction has occurred

  function playSong() {
    const audio = document.getElementById('birthdaySong');
    audio.play().catch(error => console.log('Error playing birthday song:', error));
  }

  function playCheersSound() {
    const cheersSound = document.getElementById('cheersSound');
    cheersSound.pause(); // Ensure any previous playback is stopped
    cheersSound.currentTime = 0; // Reset the sound to the start
    cheersSound.play().catch(error => console.log('Error playing cheers sound:', error));
  }

  function showConfetti() {
    const duration = 5 * 1000; // 5 seconds
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    if (activeCandles === 0) {
      const audio = document.getElementById('birthdaySong');
      audio.pause(); // Stop the music
      candleCountDisplay.textContent = "Good job baby! 🎂";
      showConfetti(); // Trigger confetti
      playCheersSound(); // Play cheers sound
    }
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
  }

  function createInitialCandles() {
    const topLayer = document.querySelector('.layer-top');
    const topLayerRect = topLayer.getBoundingClientRect();
    const cakeRect = cake.getBoundingClientRect();

    for (let i = 0; i < 20; i++) {
      const left = Math.random() * (topLayerRect.width - 20);
      const top = (topLayerRect.top - cakeRect.top) + Math.random() * (topLayerRect.height - 40);
      addCandle(left, top);
    }
    updateCandleCount();
  }

  // Disable clicking to add new candles
  cake.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  let blowingDetectionCount = 0;
  const blowingThreshold = 20; // Number of detections needed to blow out a candle

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    if (average > 80) { // Increase the threshold
      blowingDetectionCount++;
      if (blowingDetectionCount >= blowingThreshold) {
        blowingDetectionCount = 0; // Reset the counter
        return true;
      }
    } else {
      blowingDetectionCount = 0; // Reset if the blowing is not sustained
    }
    return false;
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
    }
  }

  function requestMicrophone() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        if (!audioContext) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  }

  function initializeApp() {
    if (!userInteracted) {
      console.log("User interaction required.");
      return;
    }
    // Request microphone and initialize audio context
    requestMicrophone();
    playSong(); // Start playing birthday song
  }

  // Place candles immediately
  createInitialCandles();

  // Ensure user interaction occurs
  document.body.addEventListener("click", function () {
    if (!userInteracted) {
      userInteracted = true; // Mark interaction
      initializeApp(); // Initialize the app with audio and microphone
    }
  });
});
