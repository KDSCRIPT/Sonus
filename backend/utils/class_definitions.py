# --- Classes for Voice Parsing ---
class StyleDetails:
    def __init__(self, available_styles, detail):
        self.available_styles = available_styles
        self.detail = detail

    def to_dict(self):
        return {
            "available_styles": self.available_styles,
            "detail": self.detail
        }

class ApiVoice:
    def __init__(self, accent, available_styles, description, display_language, display_name,
                 gender, locale, supported_locales, voice_id):
        self.accent = accent
        self.available_styles = available_styles
        self.description = description
        self.display_language = display_language
        self.display_name = display_name
        self.gender = gender
        self.locale = locale
        self.supported_locales = supported_locales  # dict[str, StyleDetails]
        self.voice_id = voice_id

    def to_dict(self):
        return {
            "accent": self.accent,
            "available_styles": self.available_styles,
            "description": self.description,
            "display_language": self.display_language,
            "display_name": self.display_name,
            "gender": self.gender,
            "locale": self.locale,
            "supported_locales": {
                loc: details.to_dict()
                for loc, details in self.supported_locales.items()
            },
            "voice_id": self.voice_id
        }