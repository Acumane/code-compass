import cv2
import numpy as np
import base64


def base64_to_img(data):
    """
    Convert base64 string to image
    """
    data = base64.b64decode(data)
    pimg = np.frombuffer(data, dtype=np.uint8)
    frame = cv2.imdecode(pimg, 1)
    return frame

def img_to_base64(frame):
    """
    Convert image to base64 string
    """
    _, buffer = cv2.imencode(".jpg", frame)
    byte_str = buffer.tobytes()
    encoded_str = base64.b64encode(byte_str).decode('utf-8')
    return encoded_str

def process_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return gray
