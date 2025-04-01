from flask import Flask, request, jsonify
from flask_cors import CORS  # To enable CORS for frontend-backend communication
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Initialize the Flask app
app = Flask(__name__)

# Enable CORS (allow cross-origin requests from frontend)
CORS(app)

# Initialize Hugging Face's GPT model and tokenizer
model_name = "microsoft/DialoGPT-medium"  # You can change this to any other model, like GPT-2 or GPT-3
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Store conversation history (you could store this per user session in production)
chat_history_ids = None

@app.route('/')
def home():
    return "Welcome to the Hugging Face Chatbot!"

@app.route('/chat', methods=['POST'])
def chat():
    global chat_history_ids
    
    # Get the user's message from the request
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    # Process the user input and get the bot response
    bot_response = get_bot_response(user_input)
    
    # Return the bot's response as a JSON object
    return jsonify({"response": bot_response})


def get_bot_response(user_input):
    global chat_history_ids
    
    # Encode the new user input
    new_user_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')

    # If there is previous history, concatenate it with the new input
    if chat_history_ids is not None:
        chat_history_ids = torch.cat([chat_history_ids, new_user_input_ids], dim=-1)
    else:
        chat_history_ids = new_user_input_ids

    # Generate a response using the model
    bot_output_ids = model.generate(
        chat_history_ids,
        max_length=1000,  # You can adjust this based on token limits
        pad_token_id=tokenizer.eos_token_id,
        no_repeat_ngram_size=3,
        top_p=0.92,
        temperature=0.7
    )

    # Decode the output tokens to get the bot's response text
    bot_response = tokenizer.decode(bot_output_ids[:, chat_history_ids.shape[-1]:][0], skip_special_tokens=True)

    # Update conversation history
    chat_history_ids = bot_output_ids

    return bot_response

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
