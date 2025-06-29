# backend/ai_email_generator.py

import os
import google.generativeai as genai

class AIEmailGenerator:
    def __init__(self):
        # Configure the Gemini API with your API key
        # It's recommended to load this from an environment variable for security
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set.")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro') # You can choose other models like 'gemini-1.5-flash' if available and suitable

    def generate_email_content(self, prompt: str) -> str:
        """
        Generates email content using the Gemini API based on a given prompt.

        Args:
            prompt (str): The prompt describing the desired email content.

        Returns:
            str: The generated email content.
        """
        try:
            response = self.model.generate_content(prompt)
            # Access the text from the response. Ensure to handle potential
            # cases where response.text might be empty or an error occurs.
            if response and response.text:
                return response.text
            else:
                print(f"Gemini API response was empty or malformed: {response}")
                return "Failed to generate email content. Please try again."
        except Exception as e:
            print(f"Error generating email content with Gemini API: {e}")
            return f"Error: Could not generate email content. Details: {e}"

# Example usage (for testing purposes, not typically run directly)
if __name__ == "__main__":
    # Ensure you have your GEMINI_API_KEY set in your environment
    # For example: export GEMINI_API_KEY='YOUR_API_KEY_HERE' in your terminal
    # Or, if using a .env file with python-dotenv, ensure it's loaded before this script runs.

    generator = AIEmailGenerator()
    test_prompt = (
        "Generate a phishing email for a 'urgent account verification' scenario. "
        "The email should appear to be from a bank, use formal language, and "
        "urge the recipient to click a link to verify their account. "
        "Do not include any actual malicious links, use [PHISHING_LINK_PLACEHOLDER] instead."
    )
    generated_email = generator.generate_email_content(test_prompt)
    print("Generated Email Content:")
    print(generated_email)

    test_prompt_2 = (
        "Write a short, convincing email about a 'package delivery issue'. "
        "It should ask the recipient to update their delivery preferences. "
        "Use [PHISHING_LINK_PLACEHOLDER] for the link."
    )
    generated_email_2 = generator.generate_email_content(test_prompt_2)
    print("\nGenerated Email Content (Package Delivery):")
    print(generated_email_2)
