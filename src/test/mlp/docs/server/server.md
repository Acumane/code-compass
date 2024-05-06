---
layout: default
title: server.py
parent: Server
---

# `mlp/src/server.py`

## Overview:
This Python script sets up a web server with real-time communication capabilities, aimed at processing and responding to image processing requests. The server uses Flask for the web framework and Flask-SocketIO for handling WebSocket communications. The server can handle different types of image processing requests, such as converting images to grayscale and performing image segmentation.

### Key Components:
- **Flask Application (app):** an instance of the Flask class. It acts as the central object for the web application, managing incoming web requests and responses.
- **SocketIO (`socketio`):** an instance of the Flask-SocketIO class, which allows for real-time bi-directional communication between the server and clients using WebSockets.
- **Event handlers:** the server defines several WebSocket event handlers to process different types of requests:
	- `handle_grayscale(data)`: receives an image in base64 encoded string format, converts it to grayscale using the process_frame function, re-encodes it to a base64 string, and emits the processed image back to the client.
	- `handle_segmentation(data)`: similar to handle_grayscale, but it performs semantic segmentation on the received image using the segment function.
	- `handle_hello(data)`: a simple test function that responds with a "hello world" message to the client.
- `main` (function): parses command-line arguments for configuring the server (host, port, debug mode) and starts the Flask-SocketIO server with the specified settings.