import openai
import json

from flask import jsonify

openai.api_key=""

def med_bot(user_message):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_message},
        ]
    )

    # Extract the assistant's response
    assistant_message = response['choices'][0]['message']['content']

    return jsonify({"response": assistant_message})


def wound_bot(wounds):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system",
             "content": f'Give 5 first steps for wound {wounds} in a Python list format as a string like: ["1. Clean the wound", "2. Apply pressure", "3. Cover the wound", "4. Keep the wound elevated", "5. Seek medical attention if necessary"].'}
        ]
    )

    # Extract the assistant's response
    assistant_message = response['choices'][0]['message']['content']

    return json.loads(assistant_message)




















































def tab_bot(disease):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": f'Provide information related to {disease} in JSON format with the following structure: \
              "Medicines": ["generate 4 medicine in string"], \
              "Precautions": ["generate 4 Precautions in string"], \
              "Workout Recommendation": ["generate 4 Workout Recommendatio in string"], \
              "Diet": ["generate 4 Workout Recommendatio in string"].'
            }

        ]
    )

    # Extract the assistant's response
    assistant_message = response['choices'][0]['message']['content']

    return json.loads(assistant_message)

