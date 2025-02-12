import tensorflow as tf
from transformers import DistilBertTokenizer
import fitz
from docx import Document

# define your model path here
MODEL_PATH = "/app/models/DistilBERTSubjectClassification"

class DistilBertManager:
    def __init__(self, model_path: str = MODEL_PATH):
        # load the DistilBertTokenizer with the default pre-trained model
        self.tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
        
        # load the saved model from the given model_path
        self.model = tf.saved_model.load(model_path)
        
        # define the inference function from the model
        self.inference_func = self.model.signatures['serving_default']

    def predict(self, text: str) -> int:
        # tokenize the input text
        inputs = self.tokenizer(
            text,
            return_tensors="tf",
            padding="max_length",
            truncation=True,
            max_length=256,  # adjust max_length as needed
        )

        # prepare the inputs for the model
        model_inputs = {
            "input_ids": inputs["input_ids"],
            "attention_mask": inputs["attention_mask"]
        }

        # run inference
        predictions = self.inference_func(**model_inputs)
        
        # get the logits and predict the label
        logits = predictions[list(predictions.keys())[0]]
        predicted_label = tf.argmax(logits, axis=-1).numpy()[0]

        return predicted_label
