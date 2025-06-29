import json
from jsonschema import validate, ValidationError
import time
from utils.class_definitions import StyleDetails,ApiVoice
from client.clients import murf_client,gemini_client

# --- Murf Voice Parsing Logic ---
def fetch_parsed_voices():
    """Fetch and parse Murf voices into ApiVoice objects."""
    try:
        raw_voices = murf_client.text_to_speech.get_voices()
    except Exception as e:
        print(f"Error fetching voices: {e}")
        return []

    parsed_voices = []
    for v in raw_voices:
        # Assume supported_locales is a dict-like object or attribute
        supported_locales_raw = getattr(v, "supported_locales", {})
        supported_locales = {}
        for locale_code, locale_data in supported_locales_raw.items():
            style_details = StyleDetails(
                available_styles=getattr(locale_data, "available_styles", []),
                detail=getattr(locale_data, "detail", "")
            )
            supported_locales[locale_code] = style_details

        # Create ApiVoice instance
        voice_obj = ApiVoice(
            accent=getattr(v, "accent", ""),
            available_styles=getattr(v, "available_styles", []),
            description=getattr(v, "description", ""),
            display_language=getattr(v, "display_language", ""),
            display_name=getattr(v, "display_name", ""),
            gender=getattr(v, "gender", ""),
            locale=getattr(v, "locale", ""),
            supported_locales=supported_locales,
            voice_id=getattr(v, "voice_id", "")
        )
        parsed_voices.append(voice_obj)
    return parsed_voices

# --- Enhanced JSON schema for config validation ---
CONFIG_SCHEMA = {
    "type": "object",
    "properties": {
        "text": {"type": "string"},
        "voiceId": {"type": "string"},
        "format": {"type": "string", "enum": ["MP3", "WAV"]},
        "channelType": {"type": "string", "enum": ["MONO", "STEREO"]},
        "multiNativeLocale": {"type": "string"},
        "pitch": {"type": "integer", "minimum": -50, "maximum": 50},
        "rate": {"type": "integer", "minimum": -50, "maximum": 50},
        "sampleRate": {"type": "integer", "enum": [8000, 24000, 44100, 48000]},
        "style": {"type": "string"},
        "variation": {"type": "integer", "minimum": 0, "maximum": 5},
        "audioDuration": {"type": "integer", "minimum": 0},
        "pronunciationDictionary": {"type": "object"},
        "encodeAsBase64": {"type": "boolean"}
    },
    "required": ["text", "voiceId", "format"],
    "additionalProperties": False
}

# --- Caching for voice data as dicts for Gemini/config ---
_voice_cache = None
_cache_timestamp = None

def fetch_murf_voices():
    """Fetch complete voice data with all available styles and locales as dicts for Gemini/config."""
    global _voice_cache, _cache_timestamp
    import time

    if _voice_cache and _cache_timestamp and (time.time() - _cache_timestamp) < 3600:
        return _voice_cache

    try:
        parsed_voices = fetch_parsed_voices()
        voices_data = [v.to_dict() for v in parsed_voices]
        _voice_cache = voices_data
        _cache_timestamp = time.time()
        return _voice_cache
    except Exception as e:
        print(f"Error fetching voices: {e}")
        # Return comprehensive fallback data
        return [
            {
                "voiceId": "en-US-ken",
                "displayName": "Ken (M)",
                "gender": "Male",
                "locale": "en-US",
                "accent": "US & Canada",
                "description": "Middle-Aged",
                "displayLanguage": "English",
                "availableStyles": ["Conversational", "Promo", "Newscast", "Storytelling", "Calm", "Furious", "Angry", "Sobbing", "Sad"],
                "supportedLocales": {
                    "en-US": {
                        "availableStyles": ["Conversational", "Promo", "Newscast", "Storytelling", "Calm", "Furious", "Angry", "Sobbing", "Sad"],
                        "detail": "English (US & Canada)"
                    }
                }
            },
            {
                "voiceId": "en-US-natalie",
                "displayName": "Natalie (F)",
                "gender": "Female",
                "locale": "en-US",
                "accent": "US & Canada",
                "description": "Young Adult",
                "displayLanguage": "English",
                "availableStyles": ["Conversational", "Promo", "Newscast", "Storytelling", "Calm", "Empathetic", "Excited"],
                "supportedLocales": {
                    "en-US": {
                        "availableStyles": ["Conversational", "Promo", "Newscast", "Storytelling", "Calm", "Empathetic", "Excited"],
                        "detail": "English (US & Canada)"
                    }
                }
            }
        ]

# --- Gemini Analysis and Config Generation (from paste.txt) ---
# def get_gemini_comprehensive_analysis(text):
#     voices_data = fetch_murf_voices()
#     voice_info = []
#     for voice in voices_data:
#         voice_summary = {
#             "voiceId": voice.get("voiceId"),
#             "displayName": voice.get("displayName"),
#             "gender": voice.get("gender"),
#             "description": voice.get("description"),
#             "accent": voice.get("accent"),
#             "availableStyles": voice.get("availableStyles", []),
#             "supportedLocales": list(voice.get("supportedLocales", {}).keys())
#         }
#         voice_info.append(voice_summary)

#     analysis_prompt = f"""
# You are an expert in text-to-speech psychology and audio engineering. Perform a comprehensive analysis of the following text to determine optimal TTS configuration.... TEXT TO ANALYZE:
# "{text}"

# AVAILABLE VOICES AND THEIR CAPABILITIES:
# {json.dumps(voice_info, indent=2)}

# ANALYSIS REQUIREMENTS:
# 1. **Emotional Analysis**: Identify primary and secondary emotions with confidence scores (0-100)
# 2. **Content Classification**: Determine content type (narrative, promotional, educational, news, conversational, etc.)
# 3. **Tone Analysis**: Assess formality, urgency, intimacy, professionalism
# 4. **Audience Analysis**: Determine target audience demographics and preferences
# 5. **Delivery Style**: Recommend pacing, emphasis, and speaking style
# 6. **Voice Matching**: Select the most suitable voice based on all factors

# PROVIDE DETAILED ANALYSIS IN THIS JSON FORMAT:
# {{
#     "emotional_analysis": {{
#         "primary_emotion": "emotion_name",
#         "primary_confidence": confidence_score,
#         "secondary_emotion": "emotion_name",
#         "secondary_confidence": confidence_score,
#         "emotional_intensity": "low|medium|high",
#         "emotional_stability": "stable|fluctuating|dramatic"
#     }},
#     "content_analysis": {{
#         "content_type": "narrative|promotional|educational|news|conversational|formal|casual",
#         "formality_level": "very_formal|formal|neutral|casual|very_casual",
#         "urgency_level": "low|medium|high|critical",
#         "complexity_level": "simple|moderate|complex",
#         "reading_difficulty": "easy|moderate|difficult",
#         "intended_impact": "inform|persuade|entertain|instruct|comfort"
#     }},
#     "delivery_requirements": {{
#         "pacing": "very_slow|slow|normal|fast|very_fast",
#         "emphasis_style": "subtle|moderate|strong|dramatic",
#         "breathing_pattern": "natural|controlled|dramatic",
#         "pitch_variation": "monotone|slight|moderate|dynamic|very_dynamic"
#     }},
#     "audience_profile": {{
#         "age_group": "children|young_adults|adults|seniors|mixed",
#         "context": "personal|professional|educational|entertainment|commercial",
#         "attention_span": "short|medium|long",
#         "familiarity_level": "expert|intermediate|beginner"
#     }},
#     "voice_recommendation": {{
#         "preferred_gender": "male|female|either",
#         "preferred_age": "young|middle_aged|mature|any",
#         "preferred_accent": "specific_accent_or_any",
#         "reasoning": "detailed_explanation_for_voice_choice"
#     }}
# }}

# Focus on psychological impact, listener engagement, and message effectiveness. Be specific and detailed in your analysis.
# """
#     try:
#         response = gemini_client.generate_content(analysis_prompt)
#         time.sleep(5)
#         analysis_text = clean_gemini_response(response.text)
#         analysis = json.loads(analysis_text)
#         return analysis
#     except Exception as e:
#         print(f"Error in Gemini analysis: {e}")
#         return None

# def get_gemini_config_generation(text, analysis, voices_data):
#     filtered_voices = []
#     for voice in voices_data:
#         voice_matches = True
#         # Gender preference
#         if analysis.get("voice_recommendation", {}).get("preferred_gender") != "either":
#             preferred_gender = analysis.get("voice_recommendation", {}).get("preferred_gender", "").lower()
#             if preferred_gender == "male" and voice.get("gender", "").lower() != "male":
#                 voice_matches = False
#             elif preferred_gender == "female" and voice.get("gender", "").lower() != "female":
#                 voice_matches = False
#         if voice_matches:
#             filtered_voices.append(voice)
#     if not filtered_voices:
#         filtered_voices = voices_data

#     config_prompt = f"""
# You are a professional TTS configuration specialist. Based on the comprehensive analysis, generate the optimal Murf AI configuration.

# TEXT: "{text}"

# ANALYSIS RESULTS:
# {json.dumps(analysis, indent=2)}

# SUITABLE VOICES:
# {json.dumps(filtered_voices, indent=2)}

# CONFIGURATION GENERATION RULES:

# 1. **Voice Selection**: Choose the most suitable voiceId from the filtered list based on:
#    - Emotional requirements vs available styles
#    - Content type appropriateness
#    - Audience demographics
#    - Accent and language preferences... 2. **Style Selection**: Choose from available styles for selected voice:
#    - Map emotions to styles (Sad→Sad/Sobbing, Angry→Angry/Furious, Happy→Conversational/Excited, etc.)
#    - Consider content type (Narrative→Storytelling, Promo→Promo, News→Newscast)
#    - Match delivery requirements

# 3. **Pitch Configuration (-50 to 50)**:
#    - Emotional intensity: High emotion = more extreme pitch
#    - Gender and age: Adjust based on natural voice characteristics
#    - Content type: Formal content = neutral pitch, Promotional = slightly higher
#    - Primary emotion impact: Sad/Calm = lower, Excited/Angry = higher

# 4. **Rate Configuration (-50 to 50)**:
#    - Urgency level: High urgency = faster rate
#    - Complexity: Complex content = slower rate
#    - Emotional state: Calm/Sad = slower, Excited/Urgent = faster
#    - Audience: Children/Seniors = slower, Professionals = normal to fast

# 5. **Locale Selection**: Choose from supportedLocales based on accent preference

# 6. **Variation (0-5)**: Based on content length and engagement needs

# 7. **Sample Rate**: 44100 for high quality, 24000 for web streaming

# 8. **Other Parameters**:
#    - Format: MP3 for web, WAV for high quality
#    - Channel: MONO for speech, STEREO for music-like content
#    - encodeAsBase64: false for direct audio file

# RETURN ONLY VALID JSON CONFIGURATION:
# {{
#     "text": "{text}",
#     "voiceId": "selected_voice_id",
#     "format": "MP3",
#     "channelType": "MONO",
#     "multiNativeLocale": "selected_locale",
#     "pitch": calculated_pitch_value,
#     "rate": calculated_rate_value,
#     "sampleRate": 44100,
#     "style": "selected_style",
#     "variation": calculated_variation,
#     "encodeAsBase64": false
# }}

# Ensure all values are within valid ranges and the selected voice supports the chosen style and locale.
# """
#     try:
#         response = gemini_client.generate_content(config_prompt)
#         time.sleep(5)
#         config_text = clean_gemini_response(response.text)
#         config = json.loads(config_text)
#         return config
#     except Exception as e:
#         print(f"Error in Gemini config generation: {e}")
#         return None

# def get_line_by_line_recommendations(text):
#     voices_data = fetch_murf_voices()
#     if not voices_data:
#         return {"error": "Could not fetch voice data"}

#     lines = [line.strip() for line in text.split(".") if line.strip()]
#     line_configs = []

#     for index, line in enumerate(lines):
#         print(f"Processing line {index + 1}/{len(lines)}: {line[:40]}...")
#         analysis = get_gemini_comprehensive_analysis(line)
#         if not analysis:
#             line_configs.append({
#                 "line": line,
#                 "error": "Analysis failed",
#                 "fallback": fallback_config(line)
#             })
#             continue

#         config = get_gemini_config_generation(line, analysis, voices_data)
#         if not config:
#             line_configs.append({
#                 "line": line,
#                 "analysis": analysis,
#                 "error": "Configuration generation failed",
#                 "fallback": fallback_config(line)
#             })
#             continue

#         valid, validation_error = validate_config(config)
#         if not valid:
#             line_configs.append({
#                 "line": line,
#                 "analysis": analysis,
#                 "config": config,
#                 "error": validation_error,
#                 "fallback": fallback_config(line)
#             })
#             continue

#         selected_voice = next((v for v in voices_data if v.get("voiceId") == config.get("voiceId")), None)

#         line_configs.append({
#             "line": line,
#             "success": True,
#             "config": config,
#             "analysis": analysis,
#             "selected_voice": selected_voice,
#             "reasoning": {
#                 "voice_choice": analysis.get("voice_recommendation", {}).get("reasoning", ""),
#                 "style_rationale": f"Selected '{config.get('style')}' based on {analysis.get('emotional_analysis', {}).get('primary_emotion')} emotion and {analysis.get('content_analysis', {}).get('content_type')} content type",
#                 "pitch_rationale": f"Pitch set to {config.get('pitch')} based on emotional intensity and content requirements",
#                 "rate_rationale": f"Rate set to {config.get('rate')} based on urgency level and content complexity"
#             }
#         })

#     return line_configs


def get_story_tts_configs_with_voice_assignment(story_text):
    voices_data = fetch_murf_voices()
    voice_info = [
        {
            "voiceId": v["voice_id"],
            "displayName": v["display_name"],
            "gender": v["gender"],
            "description": v["description"],
            "accent": v["accent"],
            "availableStyles": v.get("available_styles", []),
            "supportedLocales": list(v.get("supported_locales", {}).keys())
        }
        for v in voices_data
    ]

    prompt = f"""
You are an expert TTS dialogue designer using Murf AI voices. Below is a story passage. Your task is to:

1. Identify the **narration style** (first-person, third-person limited/omniscient, dialogue-based, or mixed).
2. Extract **characters/narrators** who are speaking or narrating.
3. Assign **one Murf voice ID per character/narrator** using gender, age, and accent.
4. Break the story into **sentences**, and for each:
   - Identify the speaker (character/narrator).
   - Use the assigned voiceId (keep it fixed per speaker).
   - Dynamically compute: `pitch`, `rate`, `style`, `variation`
   - Return a **valid MurfAI config** for each sentence.

### Available Murf Voices:
{json.dumps(voice_info, indent=2)}

### Story Text:
\"\"\"
{story_text}
\"\"\"

### Output Format (strict JSON):

{{
  "narration_type": "first_person | third_person_limited | third_person_omniscient | dialogue_based | mixed",
  "character_voice_map": {{
    "Narrator": "en-US-ken",
    "Mary": "en-US-natalie"
  }},
  "sentence_configs": [
    {{
      "text": "Sentence 1",
      "speaker": "Mary",
      "voiceId": "en-US-natalie",
      "format": "MP3",
      "channelType": "MONO",
      "multiNativeLocale": "en-US",
      "pitch": 5,
      "rate": -3,
      "sampleRate": 44100,
      "style": "Calm",
      "variation": 1,
      "encodeAsBase64": false
    }},
    ...
  ]
}}

Use voice gender + description to best match the character. Keep the same voiceId per speaker, but vary the other config fields to reflect sentence emotion or tone. Return only valid JSON. Do not hallucinate characters or voices.
"""

    try:
        response = gemini_client.generate_content(prompt)
        time.sleep(5)
        cleaned = clean_gemini_response(response.text)
        result = json.loads(cleaned)
        return result
    except Exception as e:
        print(f"Error processing Gemini response: {e}")
        return None

def clean_gemini_response(raw_text):
    import re

    # Extract JSON inside triple-backticks
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", raw_text)
    json_str = match.group(1).strip() if match else raw_text.strip()

    # Remove problematic control characters
    json_str = json_str.replace('\x00', '')  # NULL char
    json_str = re.sub(r'[\x01-\x1F\x7F]', '', json_str)  # Control characters except \n\t
    return json_str


def validate_config(config):
    try:
        validate(instance=config, schema=CONFIG_SCHEMA)
        return True, None
    except ValidationError as e:
        return False, str(e)

def fallback_config(text):
    return {
        "text": text,
        "voiceId": "en-US-ken",
        "format": "MP3",
        "channelType": "MONO",
        "multiNativeLocale": "en-US",
        "pitch": 0,
        "rate": 0,
        "sampleRate": 44100,
        "style": "Conversational",
        "variation": 1,
        "encodeAsBase64": False
    }

