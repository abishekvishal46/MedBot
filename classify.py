
from keras._tf_keras.keras.models import load_model
from keras._tf_keras.keras.preprocessing import image
import numpy as np
def predict_image():
    """
    Predict the class of an input image using the pre-trained model.
    
    Args:
    model: Pre-trained TensorFlow model.
    img_path (str): Path to the image file.
    
    Returns:
    predicted_class (str): The predicted class label for the image.
    predicted_prob (float): The confidence level of the prediction.
    """
    # Load and preprocess the image
    model = load_model("my_full_model.h5")
    img_path = "uploaded_images/uploaded-image.png"
    img = image.load_img(img_path, target_size=(150, 150))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0

    # Make a prediction
    prediction = model.predict(img_array)
    predicted_class_index = np.argmax(prediction[0])
    predicted_prob = prediction[0][predicted_class_index]

    # Class names corresponding to the indices (update these as per your model)
    class_names = ['Abrasions', 'Bruises', 'Burns', 'Cut', 'Ingrown_nails', 'Laceration', 'Stab_wound']

    # Get the predicted class
    predicted_class = class_names[predicted_class_index]

    return predicted_class
