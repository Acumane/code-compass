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

processed_frame = None

@sio.on("gray-response")
def on_response(data):
    global processed_frame
    pimg = np.frombuffer(base64.b64decode(data), dtype=np.uint8)
    processed_frame = cv2.imdecode(pimg, 1)

cap = cv2.VideoCapture(0)
prev_frame_time = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Encode the frame
    # Send the frame to the server
    _, buffer = cv2.imencode(".jpg", frame)
    encoded_frame = base64.b64encode(buffer).decode("utf-8")    
    sio.emit("grayscale", encoded_frame)

    # Calculate FPS
    current_time = time.time()
    fps = 1 / (current_time - prev_frame_time)
    prev_frame_time = current_time
    fps_display = "FPS: {:.2f}".format(fps)
    # print(fps_display, end='\r')
    print("streaming")

    if processed_frame is not None:
        height = max(frame.shape[0], processed_frame.shape[0])
        width = frame.shape[1] + processed_frame.shape[1]
        
        # Resize frames to the same height
        # Concatenate the frames horizontally
        frame_resized = cv2.resize(frame, (int(frame.shape[1] * height / frame.shape[0]), height))
        processed_frame_resized = cv2.resize(processed_frame, (int(processed_frame.shape[1] * height / processed_frame.shape[0]), height))
        combined_frame = np.hstack((frame_resized, processed_frame_resized))

        cv2.imshow("Webcam & Processed Stream Side by Side", combined_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
sio.disconnect()