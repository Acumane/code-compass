import cv2
import base64
import socketio
import numpy as np

# Connect to the Flask SocketIO server
sio = socketio.Client()
sio.connect('http://localhost:5050')

# Event listener for the server response
@sio.on('response')
def on_response(data):
    # Decode the processed frame
    pimg = np.frombuffer(base64.b64decode(data), dtype=np.uint8)
    processed_frame = cv2.imdecode(pimg, 1)

    # Optionally, print out some result or confirmation
    print("Received processed frame from server")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()  # Uncommented this line
    if not ret:
        break

    # Encode the frame
    _, buffer = cv2.imencode('.jpg', frame)
    encoded_frame = base64.b64encode(buffer).decode('utf-8')

    # Send the frame to the server
    sio.emit('frame', encoded_frame)

    # Show the original frame
    cv2.imshow('Webcam Stream', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
sio.disconnect()
