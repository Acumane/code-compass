import cv2
import base64
import socketio
import numpy as np
import time

# wait 5 seconds for the server to start
print("Waiting 5 seconds for the server to start...")
time.sleep(5)
sio = socketio.Client()
sio.connect("http://localhost:42069")

@sio.on("gray-response")
def on_response(data):
    global processed_frame
    pimg = np.frombuffer(base64.b64decode(data), dtype=np.uint8)
    processed_frame = cv2.imdecode(pimg, 1)

def grayscale(image):
    pimg = np.frombuffer(base64.b64decode(image), dtype=np.uint8)
    frame = cv2.imdecode(pimg, 1)
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2BGR)
    height = max(frame.shape[0], gray_frame.shape[0])
    width = frame.shape[1] + gray_frame.shape[1]
    frame_resized = cv2.resize(frame, (int(frame.shape[1] * height / frame.shape[0]), height))
    gray_frame_resized = cv2.resize(gray_frame, (int(gray_frame.shape[1] * height / gray_frame.shape[0]), height))
    cv2.imshow("Original Frame", frame)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    return base64.b64encode(cv2.imencode(".jpg", gray_frame_resized)[1])

cap = cv2.VideoCapture(1)
ret, frame = cap.read()
grayscale(base64.b64encode(cv2.imencode(".jpg", frame)[1]))
cap.release()

cap.release()
cv2.destroyAllWindows()
sio.disconnect()