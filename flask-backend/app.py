# app.py (Backend)

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from PIL import Image
import io
import os
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Get the absolute path to the directory containing app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Construct the full path to best.pt
MODEL_PATH = os.path.join(BASE_DIR, 'best.pt')

# Load the YOLOv5 model once at startup
logging.info("Loading YOLOv5 model...")
model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH, trust_repo=True)
logging.info("Model loaded successfully.")

@app.route('/detect', methods=['POST'])
def detect():
    logging.info("Received a request to /detect")
    
    if 'image' not in request.files:
        logging.warning("No image part in the request")
        return jsonify({'error': 'No image part in the request'}), 400

    file = request.files['image']
    logging.info(f"Received file: {file.filename}")

    if file.filename == '':
        logging.warning("No image selected for uploading")
        return jsonify({'error': 'No image selected for uploading'}), 400

    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        original_width, original_height = img.size

        # Perform inference
        results = model(img)

        # Parse results
        detections = results.xyxy[0].tolist()  # List of detections

        # Format detections with original image dimensions
        detection_results = []
        for det in detections:
            detection = {
                'class_id': int(det[5]),
                'class_name': model.names[int(det[5])],
                'confidence': det[4],
                'bbox': {
                    'x_min': det[0],
                    'y_min': det[1],
                    'x_max': det[2],
                    'y_max': det[3]
                },
                'original_width': original_width,
                'original_height': original_height
            }
            detection_results.append(detection)

        logging.info(f"Detections: {detection_results}")

        return jsonify({'detections': detection_results})

    except Exception as e:
        logging.error(f"Error during detection: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
