import json
import time

from google import genai

from app.core.config import settings


client = genai.Client(api_key=settings.gemini_api_key)

PRIMARY_MODEL = "gemini-3.6-flash"

MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 3


def analyze_case(situation: str) -> dict:
    """
    Analyze a case using only the facts explicitly supplied by the user.

    The AI must never create new facts, evidence, witnesses,
    admissions, costs, or respondent statements.
    """

    clean_situation = situation.strip()

    prompt = f"""
You are an AI courtroom analysis assistant for an educational project.

Your job is to analyze ONLY the information explicitly written in the
user's situation.

ABSOLUTE FACTUAL ACCURACY RULE:

You MUST NOT invent, assume, infer, or fabricate facts.

The following things are especially forbidden unless explicitly stated
by the user:

- witnesses
- witness statements
- admissions
- photos
- videos
- receipts
- repair estimates
- prices or monetary amounts
- ownership
- messages
- documents
- medical records
- conversations
- intentions
- motivations
- actions
- respondent statements
- respondent defenses
- agreements
- dates
- locations
- damage details
- legal rights
- legal obligations

IMPORTANT:

If something is not explicitly stated, treat it as UNKNOWN or MISSING.

Do NOT turn a reasonable possibility into a fact.

For example:

User:
"My brother broke my PS4."

You MUST NOT say:
"My grandmother witnessed the incident."

You MUST say that no witness was mentioned.

Another example:

User:
"My roommate broke my laptop."

You MUST NOT say:
"The roommate admitted fault."

You MUST say that no admission was provided.

Another example:

User:
"My brother broke my iPad and my grandmother saw it."

You MAY mention the grandmother as a witness because the user explicitly
provided that fact.

However, you MUST NOT invent what the grandmother said.

==================================================
SOURCE OF TRUTH
==================================================

The ONLY source of facts is the text inside:

<SITUATION>
{clean_situation}
</SITUATION>

Do not use knowledge from previous cases.

Do not use facts from other examples.

Do not use facts from previous conversations.

Analyze this situation independently.

==================================================
RESPONDENT INFORMATION
==================================================

The user may provide only the claimant's version.

If the respondent's side is not explicitly included:

- Do not invent a defense.
- Do not pretend the respondent said something.
- Explicitly state that the respondent's side was not provided.

You may identify reasonable QUESTIONS that remain unanswered, but do not
present those questions as facts.

==================================================
EVIDENCE
==================================================

Only list evidence explicitly mentioned in the situation.

Examples of valid evidence:

"My grandmother saw it happen."
"My friend recorded the incident."
"I have photos of the damage."
"I have a receipt."
"The roommate admitted breaking it."

If none of these are mentioned:

"No supporting evidence was provided."

Do not classify the claimant's statement itself as independent physical
evidence.

==================================================
ARGUMENTS
==================================================

Claimant arguments must be based directly on the user's statement.

Respondent arguments must ONLY contain information explicitly provided
about the respondent.

If no respondent information is provided, use statements such as:

"The respondent's side of the story was not provided."

Do NOT create hypothetical defenses such as:

"It may have been accidental."

Unless the user explicitly said it was accidental.

==================================================
LEGAL ISSUE
==================================================

Describe the dispute in one simple sentence.

Do not introduce new facts.

==================================================
REASONING
==================================================

Use only supplied facts.

Clearly separate:

1. What the user claims.
2. What evidence was actually provided.
3. What information is missing.
4. Why the available information does or does not support the claim.

Never fill missing information with assumptions.

==================================================
VERDICT
==================================================

If important information or evidence is missing, prefer:

"The case is inconclusive because important evidence is missing."

If the supplied evidence clearly supports one side, you may say:

"The claimant has a stronger case based on the available evidence."

or:

"The respondent has a stronger case based on the available evidence."

Do NOT state that someone is legally liable with certainty.

Do NOT provide an official legal judgment.

==================================================
VERDICT EXPLANATION
==================================================

Explain why the verdict was reached.

Mention only evidence actually supplied by the user.

Mention important missing information when relevant.

==================================================
OUTPUT REQUIREMENTS
==================================================

Return ONLY valid JSON.

Do not use Markdown.

Do not use code fences.

Use exactly this structure:

{{
  "legal_issue": "One clear sentence describing the dispute.",
  "claimant_arguments": [
    "Argument based directly on the user's statement."
  ],
  "respondent_arguments": [
    "The respondent's side of the story was not provided."
  ],
  "evidence": [
    "Evidence explicitly mentioned by the user."
  ],
  "reasoning": "A neutral explanation based only on the supplied facts.",
  "verdict": "A short courtroom-style educational assessment.",
  "verdict_explanation": "A concise explanation of why the assessment was reached."
}}

IMPORTANT FINAL CHECK:

Before returning the JSON, compare every factual statement in your answer
against the <SITUATION> text.

If a fact cannot be directly supported by the situation, REMOVE it.

Never invent facts just to make the answer more complete.
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

            # Remove Markdown fences if the model still adds them.
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
                field
                for field in required_fields
                if field not in result
            ]

            if missing_fields:
                raise RuntimeError(
                    "Gemini response is missing fields: "
                    + ", ".join(missing_fields)
                )

            # Make sure list fields are actually lists.
            list_fields = [
                "claimant_arguments",
                "respondent_arguments",
                "evidence",
            ]

            for field in list_fields:
                if not isinstance(result[field], list):
                    raise RuntimeError(
                        f"Gemini field '{field}' must be a list."
                    )

            # Prevent empty evidence arrays.
            if not result["evidence"]:
                result["evidence"] = [
                    "No supporting evidence was provided."
                ]

            # Prevent empty claimant arguments.
            if not result["claimant_arguments"]:
                result["claimant_arguments"] = [
                    "The claimant's position was provided in the situation."
                ]

            # Prevent empty respondent arguments.
            if not result["respondent_arguments"]:
                result["respondent_arguments"] = [
                    "The respondent's side of the story was not provided."
                ]

            print("AI examination completed successfully.")

            return result

        except Exception as exc:
            last_error = exc

            error_text = str(exc)

            print(
                f"AI examination attempt {attempt} failed: "
                f"{error_text}"
            )

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
                    "Gemini is temporarily unavailable. "
                    f"Retrying in {RETRY_DELAY_SECONDS} seconds..."
                )

                time.sleep(RETRY_DELAY_SECONDS)

    raise RuntimeError(
        "Gemini is temporarily unavailable after "
        f"{MAX_RETRIES} attempts. "
        f"Last error: {last_error}"
    )