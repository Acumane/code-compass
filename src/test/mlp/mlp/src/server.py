from flask import Flask
from flask_socketio import SocketIO
import argparse

from utils import base64_to_img, img_to_base64, process_frame
from process import segment 

app = Flask(__name__)
socketio = SocketIO(app)


@socketio.on("grayscale")
def handle_grayscale(data):
    """
    Inference function to process gray the frame and send the result back
    Image is passed in as a base64 encoded string
    """
    frame = base64_to_img(data)
    processed_frame = process_frame(frame)
    encoded_str = img_to_base64(processed_frame)
    socketio.emit("gray-response", encoded_str)


@socketio.on("segment")
def handle_segmentation(data):
    """
    Inference function to process the frame and send the result back
    Image is passed in as a base64 encoded string
    """
    frame = base64_to_img(data)
    processed_frame = segment(frame)
    encoded_str = img_to_base64(processed_frame)
    socketio.emit("segment-response", encoded_str)


@socketio.on("hello-world")
def handle_hello(data):
    """
    Simple hello world function to test the connection
    """
    message = "hello world"
    encoded_message = str.encode(message)
    socketio.emit("hello-response", encoded_message)


def main(params):
    socketio.run(app=app, 
                 debug=params.debug, 
                 host=params.host, 
                 port=params.port, 
                 allow_unsafe_werkzeug=True,
                 use_reloader=True,)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MLP: socket inference server for open-ended ML models")
    parser.add_argument("--host", default="0.0.0.0", help="Host IP address")
    parser.add_argument("--port", type=int, default=42069, help="Port number")
    parser.add_argument("--debug", action="store_true", default=True, help="Debug mode")
    args = parser.parse_args()
    main(args)
