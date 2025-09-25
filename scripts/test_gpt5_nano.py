#!/usr/bin/env python3
"""
Test GPT-5-nano with exact OpenAI example format
"""

from openai import OpenAI

def test_gpt5_nano_exact_format():
    """Test with your exact OpenAI example"""

    client = OpenAI()

    print("Testing GPT-5-nano with exact OpenAI example format...")

    try:
        # Your exact example
        response = client.responses.create(
            model="gpt-5-nano",
            input=[],
            text={
                "format": {
                    "type": "text"
                },
                "verbosity": "medium"
            },
            reasoning={
                "effort": "medium"
            },
            tools=[],
            store=True,
            include=[
                "reasoning.encrypted_content",
                "web_search_call.action.sources"
            ]
        )

        print(f"Success! Response type: {type(response)}")
        print(f"Response attributes: {dir(response)}")

        # Try to extract content
        if hasattr(response, 'text'):
            print(f"Response.text: {response.text}")
        if hasattr(response, 'content'):
            print(f"Response.content: {response.content}")
        if hasattr(response, 'choices'):
            print(f"Response.choices: {response.choices}")

        print(f"Full response: {response}")

    except Exception as e:
        print(f"Error: {e}")

    print("\nTesting with input containing a prompt...")

    try:
        # Test with input containing prompt
        response2 = client.responses.create(
            model="gpt-5-nano",
            input=[
                {
                    "type": "text",
                    "text": "What is 2+2? Respond in JSON format."
                }
            ],
            text={
                "format": {
                    "type": "text"
                },
                "verbosity": "medium"
            },
            reasoning={
                "effort": "medium"
            },
            tools=[],
            store=True,
            include=[
                "reasoning.encrypted_content",
                "web_search_call.action.sources"
            ]
        )

        print(f"Success with input! Response: {response2}")

    except Exception as e:
        print(f"Error with input: {e}")

if __name__ == "__main__":
    test_gpt5_nano_exact_format()