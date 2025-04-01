# Imports
from uagents import Agent, Context
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Create an agent named Alice
alice = Agent(name="Alice", seed="khavaioghgjabougrvbosubvisgvgjfkf")

# Load the Hugging Face model and tokenizer
model_name = "microsoft/DialoGPT-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Chat history for context (to maintain conversation flow)
chat_history_ids = None

# Function to get a response from the DialoGPT model
def get_hugging_face_response(user_input):
    global chat_history_ids
    
    # Encode the new user input, add the eos_token, and return a tensor in Pytorch
    new_user_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')

    # Append the new user input tokens to the chat history (if there is any)
    if chat_history_ids is not None:
        chat_history_ids = torch.cat([chat_history_ids, new_user_input_ids], dim=-1)
    else:
        chat_history_ids = new_user_input_ids

    # Get the model's response
    bot_output_ids = model.generate(chat_history_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id, no_repeat_ngram_size=3, top_p=0.92, temperature=0.7)
    
    # Decode the response and return it
    bot_response = tokenizer.decode(bot_output_ids[:, chat_history_ids.shape[-1]:][0], skip_special_tokens=True)
    
    # Update chat history to include the bot's response for the next round
    chat_history_ids = bot_output_ids
    
    return bot_response

# Interval task to simulate conversational input and output
@alice.on_interval(period=2.0)
async def conversation_interval(ctx: Context):
    # Get user input (in a real scenario, this could be replaced with dynamic user input)
    user_input = input("User: ")  # In real applications, this would be user input from a UI or API
    
    # Get the bot response from the Hugging Face model
    bot_response = get_hugging_face_response(user_input)
    
    # Log the conversation
    ctx.logger.info(f"User: {user_input}")
    ctx.logger.info(f"Alice: {bot_response}")

# Run the agent
if __name__ == "__main__":
    alice.run()
