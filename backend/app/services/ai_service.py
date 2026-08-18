
import json
import time

from google import genai

from app.core.config import settings


client = genai.Client(api_key=settings.gemini_api_key)

PRIMARY_MODEL = "gemini-3.6-flash"

MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 3


def analyze_case(situation: str) -> dict:
    prompt = f"""
You are an AI courtroom analysis assistant.

Analyze the user's situation in a neutral, simple, clear and educational way.

The user may describe everyday disputes involving roommates, friends,
money, property, purchases, accidents, agreements, responsibilities,
or other situations.

IMPORTANT:
- Do not provide real legal advice.
- Do not invent facts.
- Do not assume facts that were not provided.
- Treat the user's statement as the available facts.
- Clearly identify missing information when important.
- Consider BOTH sides fairly.
- Use simple language that a college student can understand.
- Do not use complicated legal terminology unless necessary.
- Do not make the answer unnecessarily long.
- The verdict must be based ONLY on the information supplied.
- If there is not enough information, say that the verdict is inconclusive.
- Never claim certainty when important facts or evidence are missing.

Situation:
{situation}

Return ONLY valid JSON.

Return exactly this structure:

{{
  "legal_issue": "One clear sentence describing the main dispute.",
  "claimant_arguments": [
    "Strong point supporting the claimant.",
    "Another relevant point supporting the claimant."
  ],
  "respondent_arguments": [
    "Strong point supporting the respondent.",
    "Another relevant point supporting the respondent."
  ],
  "evidence": [
    "Evidence actually mentioned in the situation.",
    "Another piece of evidence actually mentioned in the situation."
  ],
  "reasoning": "A simple explanation of how the facts, arguments and evidence lead to the assessment. Keep it understandable and concise.",
  "verdict": "A short, clear courtroom-style conclusion.",
  "verdict_explanation": "A simple explanation of why this conclusion was reached."
}}

Additional rules:

LEGAL ISSUE:
- Clearly state what the dispute is about.
- Keep it to one sentence.

CLAIMANT ARGUMENTS:
- Give 2 or 3 points.
- Use only facts supplied by the user.
- Do not invent evidence.

RESPONDENT ARGUMENTS:
- Give 2 or 3 points.
- If the respondent's side is not provided, explicitly say that it is missing.
- Do not invent a defense.

EVIDENCE:
- List only evidence explicitly mentioned by the user.
- If no evidence is mentioned, say:
  "No supporting evidence was provided."

REASONING:
- Explain the situation in simple language.
- Mention important facts and missing information.
- Be neutral.
- Keep it around 3 to 5 sentences.

VERDICT:
- Keep it short.
- Prefer a clear conclusion such as:
  "The claimant has a stronger case based on the available evidence."
  or
  "The case is inconclusive because important evidence is missing."
- Do not present the result as an official legal judgment.

VERDICT_EXPLANATION:
- Explain the verdict in 2 to 4 simple sentences.
- Mention the strongest evidence or missing information.
"""

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(
                f"AI examination attempt {attempt}/{MAX_RETRIES} "
                f"using {PRIMARY_MODEL}..."
            )

            chat = client.chats.create(
                model=PRIMARY_MODEL
            )

            response = chat.send_message(prompt)

            if not response.text:
                raise RuntimeError(
                    "Gemini returned an empty response."
                )

            text = response.text.strip()

            # Remove Markdown code fences if Gemini adds them.
            if text.startswith("```json"):
                text = text[len("```json"):].strip()
            elif text.startswith("```"):
                text = text[3:].strip()

            if text.endswith("```"):
                text = text[:-3].strip()

            try:
                result = json.loads(text)
            except json.JSONDecodeError as exc:
                raise RuntimeError(
                    f"Gemini returned invalid JSON: {text}"
                ) from exc

            # Basic validation so the frontend receives the expected fields.
            required_fields = [
                "legal_issue",
                "claimant_arguments",
                "respondent_arguments",
                "evidence",
                "reasoning",
                "verdict",
                "verdict_explanation",
            ]

            missing_fields = [
                field for field in required_fields
                if field not in result
            ]

            if missing_fields:
                raise RuntimeError(
                    "Gemini response is missing fields: "
                    + ", ".join(missing_fields)
                )

            print("AI examination completed successfully.")

            return result

        except Exception as exc:
            last_error = exc

            error_text = str(exc)

            print(
                f"AI examination attempt {attempt} failed: "
                f"{error_text}"
            )

            # Retry temporary Gemini availability/rate-limit problems.
            temporary_error = any(
                code in error_text
                for code in [
                    "503",
                    "UNAVAILABLE",
                    "429",
                    "RESOURCE_EXHAUSTED",
                    "high demand",
                    "temporarily unavailable",
                ]
            )

            if not temporary_error:
                raise RuntimeError(
                    f"AI analysis failed: {error_text}"
                ) from exc

            if attempt < MAX_RETRIES:
                print(
                    f"Gemini is temporarily unavailable. "
                    f"Retrying in {RETRY_DELAY_SECONDS} seconds..."
                )

                time.sleep(RETRY_DELAY_SECONDS)

    raise RuntimeError(
        "Gemini is temporarily unavailable after "
        f"{MAX_RETRIES} attempts. "
        f"Last error: {last_error}"
    )

