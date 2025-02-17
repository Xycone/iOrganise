import tensorflow as tf
from transformers import DistilBertTokenizer
import fitz
from docx import Document
import gc
from utils import *

# Define your model path here
MODEL_PATH = "/app/models/DistilBERTSubjectClassification"

gpus = tf.config.experimental.list_physical_devices("GPU")
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(f"GPU Memory Limiting Error: {e}")

class DistilBertManager:
    def __init__(self, model_path: str = MODEL_PATH):
        # Load the DistilBertTokenizer with the default pre-trained model
        self.tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
        
        # Load the saved model from the given model_path
        self.model = tf.saved_model.load(model_path)
        
        # Define the inference function from the model
        self.inference_func = self.model.signatures['serving_default']

    def predict(self, text: str) -> int:
        # Tokenize the input text
        inputs = self.tokenizer(
            text,
            return_tensors="tf",
            padding="max_length",
            truncation=True,
            max_length=256,  # Adjust max_length as needed
        )

        # Prepare the inputs for the model
        model_inputs = {
            "input_ids": inputs["input_ids"],
            "attention_mask": inputs["attention_mask"]
        }

        # Run inference
        predictions = self.inference_func(**model_inputs)
        
        # Get the logits and predict the label
        logits = predictions[list(predictions.keys())[0]]
        predicted_label = tf.argmax(logits, axis=-1).numpy()[0]

        return predicted_label
    
    def unload(self):
        del self.tokenizer  # Delete tokenizer
        del self.model  # Delete model
        del self.inference_func  # Delete inference function

        free_memory()
