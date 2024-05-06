---
layout: default
title: client.py
parent: Client
---

# `examples/client.py`

**Python Script for Real-Time Video Processing and Streaming**

### Dependencies:
- **OpenCV**: Used for video capturing and image processing.
- **Base64**: Used for encoding binary data into ASCII characters.
- **SocketIO**: Used for real-time communication between the client and the server.
- **NumPy**: Used for handling large, multi-dimensional arrays and matrices.
- **Time**: Used for time-related tasks, such as waiting for the server to start.

## Workflow:
1. Server Initialization Wait:
   1. Waits 5 seconds for the server to be fully operational before attempting to connect.
2. SocketIO Client Setup:
   1. Establishes a connection to the server running on [42069](http://localhost:42069).
3. Processing Frame Callback:
   1. Listens for "gray-response" events from the server
   2. Upon receiving data, decodes and converts it into a NumPy array for further processing.
4. Video Capture:
   1. Starts capturing video from the default webcam (device index 0).
   2. Continuously reads frames from the webcam in a loop.
5. Frame Encoding and Sending:
   1. Encodes the captured video frame into JPG format.
   2. Encodes this JPG image into a base64 string and sends it to the server for grayscale processing
6. FPS Calculation:
   1. Calculates the Frames Per Second (FPS) of the video stream.
7. Frame Display:
   1. Checks if a processed frame is available
   2. Resizes the original and processed frames to have the same height.
   3. Concatenates these frames side-by-side and displays them in a single window.
8. Cleanup:
    1. Releases the webcam.
    2. Closes all OpenCV windows.
    3. Disconnects the SocketIO client.
