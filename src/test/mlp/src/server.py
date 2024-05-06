from flask import Flask
from flask_socketio import SocketIO
import cv2
import numpy as np
import argparse
import base64

app = Flask(__name__)
socketio = SocketIO(app)

# Dummy ML model function
def process_frame(frame):
    # Process the frame with your ML model here
    # For demonstration, let"s just convert it to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return gray

@app.route("/")
def index():
    return "<h1>hello there</h1>" 

@socketio.on("frame")
def handle_frame(data):
    data = base64.b64decode(data)
    pimg = np.frombuffer(data, dtype=np.uint8)
    frame = cv2.imdecode(pimg, 1)

    processed_frame = process_frame(frame)

    _, buffer = cv2.imencode(".jpg", processed_frame)
    byte_str = buffer.tobytes()
    encoded_str = base64.b64encode(byte_str).decode('utf-8')
    socketio.emit("response", encoded_str)

@socketio.on("hello-world")
def handle_hello(data):
    message = "hello world"
    encoded_message = str.encode(message)
    socketio.emit("response", encoded_message)

def main(params):
    socketio.run(app=app, debug=params.debug, host=params.host, port=params.port)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MLP: socket inference server for open-ended ML models")
    parser.add_argument("--host", default="0.0.0.0", help="Host IP address")
    parser.add_argument("--port", type=int, default=5050, help="Port number")
    parser.add_argument("--debug", action="store_true", default=True, help="Debug mode")
    args = parser.parse_args()
    main(args)
