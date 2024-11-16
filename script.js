document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  function playSong() {
    const audio = document.getElementById('birthdaySong'); 
    audio.play(); 
  }

  function playCheersSound() {
    const cheersSound = document.getElementById('cheersSound');
    cheersSound.play();
  }

  // Function to show confetti
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
    }());
  }

  // Function to update the displayed message
  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    if (activeCandles === 0) {
      const audio = document.getElementById('birthdaySong');
      audio.pause();  // Stop the music
      candleCountDisplay.textContent = "Good job baby! 🎂";
      showConfetti(); // Trigger confetti
      playCheersSound(); // Play cheers sound
    } else {
      candleCountDisplay.textContent = `Happy 20th Birthday Princess Oyin❤️`;
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

  // Ensure candles are placed on the top layer of the cake
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

  // Adjusted isBlowing function to make it more difficult to blow out candles
  let blowingDetectionCount = 0;
  const blowingThreshold = 5; // Number of detections needed to blow out a candle

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    if (average > 60) { // Increase the threshold
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

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
        playSong(); // Call the playSong function here
        createInitialCandles(); // Add initial candles on page load
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});
