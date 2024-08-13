let bodySegmentation;
let video;
let segmentation;
let bgImage; // Variable to hold the background image

let options = {
  maskType: "background",
};

// Variables to store preloaded images
let img1, img2, img3;

function preload() {
  bodySegmentation = ml5.bodySegmentation("SelfieSegmentation", options);

  // Preload background images from local directory
  img1 = loadImage('images/image1.jpg');
  img2 = loadImage('images/image2.jpg');
  img3 = loadImage('images/image3.jpg');
}

function setup() {
  createCanvas(640, 480);

  // Create the video
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodySegmentation.detectStart(video, gotResults);

  // Create buttons to select background images
  createButton('Image 1').mousePressed(() => bgImage = img1);
  createButton('Image 2').mousePressed(() => bgImage = img2);
  createButton('Image 3').mousePressed(() => bgImage = img3);
  
  // Create download button
  createButton('Download Image').mousePressed(downloadImage);
  
  // Input field for user email
  createInput().attribute('placeholder', 'Enter your email').input((e) => userEmail = e.target.value);
  
  // Button to trigger image upload
  createButton('Upload & Email').mousePressed(uploadImage);
}

function draw() {
  if (bgImage) {
    background(bgImage);
  } else {
    background(0); // Fallback background
  }

  if (segmentation) {
    video.mask(segmentation.mask);
    image(video, 0, 0);
  }
}

// Callback function for body segmentation
function gotResults(result) {
  segmentation = result;
}

function downloadImage() {
  saveCanvas('segmented-image', 'png');
}

function uploadImage() {
  canvas.toBlob(function(blob) {
    const formData = new FormData();
    formData.append('image', blob, 'image.png');

    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      const imageUrl = data.imageUrl;

      // Generate QR code
      fetch('/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: imageUrl }),
      })
      .then(response => response.json())
      .then(data => {
        const qrCodeUrl = data.qrCodeUrl;
        
        // Email the image and QR code
        fetch('/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail, imageUrl: imageUrl, qrCodeUrl: qrCodeUrl }),
        });
      });
    });
  }, 'image/png');
}
