import torch
from torchvision import models
from torchvision.transforms import functional as F
from PIL import Image

def segment(frame):
    """
    Perform semantic segmentation on the input frame using a pre-trained DeepLabV3 model.
    """
    # Load model
    model = models.segmentation.deeplabv3_resnet101(pretrained=True)
    model.eval()
    pil_image = Image.fromarray(frame)

    # Normalize the image and convert it to a tensor
    input_tensor = F.to_tensor(pil_image)
    input_tensor = F.normalize(input_tensor, mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

    # Add an extra dimension to the tensor and perform the segmentation
    input_batch = input_tensor.unsqueeze(0)
    with torch.no_grad():
        output = model(input_batch)['out'][0]

    # Convert the output tensor to a 2D numpy array
    output_predictions = output.argmax(0).byte().cpu().numpy()

    return output_predictions