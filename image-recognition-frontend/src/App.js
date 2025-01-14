import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const canvasRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Preview the image
      setDetections([]);
      setErrorMessage('');
    }
  };

  const handleDetect = async () => {
    if (!imageFile) {
      setErrorMessage('Please upload an image.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error during detection. Please try again.');
      }

      const data = await response.json();
      setDetections(data.detections);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (detections.length > 0 && previewUrl) {
      drawBoundingBoxes();
    }
  }, [detections]);

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const img = new Image();
    img.src = previewUrl;
  
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
  
      // Draw bounding boxes
      detections.forEach((det) => {
        const padding = 10; // Extra padding for a bigger box
        const { x_min, y_min, x_max, y_max } = det.bbox;
        const width = x_max - x_min + padding * 2;
        const height = y_max - y_min + padding * 2;
  
        // **Outer dark and thick border**
        ctx.beginPath();
        ctx.rect(x_min - padding, y_min - padding, width, height);
        ctx.lineWidth = 6; // Thicker border
        ctx.strokeStyle = '#2B0000'; // Very dark red/black
        ctx.stroke();
  
        // **Class name and confidence score with background**
        const label = `${det.class_name} (${(det.confidence * 100).toFixed(1)}%)`;
        const textWidth = ctx.measureText(label).width + 10;
        const textHeight = 24;
  
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Darker semi-transparent background
        ctx.fillRect(x_min - padding, y_min - padding - textHeight, textWidth, textHeight); // Larger background
        ctx.font = 'bold 18px Arial'; // Larger text
        ctx.fillStyle = 'white'; // White text color
        ctx.fillText(label, x_min - padding + 5, y_min - padding - 5); // Centered text
      });
    };
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Object Detection App</h2>

      <div style={styles.uploadSection}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <button style={styles.button} onClick={handleDetect} disabled={isLoading}>
        {isLoading ? 'Detecting...' : 'Detect Objects'}
      </button>

      {errorMessage && <p style={styles.error}>{errorMessage}</p>}

      <div style={styles.canvasContainer}>
        {previewUrl && (
          <canvas ref={canvasRef} style={styles.canvas}></canvas>
        )}
      </div>

      {detections.length > 0 && (
        <div style={styles.detectionListContainer}>
          <div style={styles.detectionList}>
            <h4>Detections:</h4>
            <ul>
              {detections.map((det, index) => (
                <li key={index} style={styles.detectionItem}>
                  <strong>{det.class_name}</strong> (Confidence: {(det.confidence * 100).toFixed(2)}%)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '20px',
  },
  title: {
    fontSize: '28px', // Larger and consistent font size for the title
    marginBottom: '20px',
  },
  uploadSection: {
    marginBottom: '20px',
  },
  canvasContainer: {
    display: 'flex',
    justifyContent: 'center', // Center the canvas horizontally
    marginTop: '20px',
  },
  canvas: {
    border: '2px solid #ccc',
    borderRadius: '8px',
    maxWidth: '100%',
    height: 'auto',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
  detectionListContainer: {
    display: 'flex',
    justifyContent: 'center', // Center the detection list
  },
  detectionList: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    width: '100%',
    maxWidth: '500px', // Limit width for better readability
    textAlign: 'left',
  },
  detectionItem: {
    marginBottom: '10px',
    fontSize: '18px', // Clearer, readable font size for detections
  },
};

export default App;
