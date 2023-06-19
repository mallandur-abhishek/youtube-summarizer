import spacy
import requests
from flask_cors import CORS
from flask import Flask, request
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)
CORS(app)

SMMRY_API_KEY = '<API_KEY>'
SMMRY_API_URL = 'http://api.smmry.com/'

DEFAULT_ERRORS = {
    "NO_TRANSCRIPT_FOUND": {
        "error": "No transcript found"
    }
}

class YoutubeSummarizer:
    def __init__(self, video_id, percent):
        self.video_id = video_id
        self.percent = percent
        self.transcript_string = ''
        self.transcript_with_sentences = ''
        self.transcript = ''

    def summarize(self):
        return self.get_transcript()

    def get_transcript(self):
        video_id = self.video_id
        transcript = {}
        try:
            transcript = YouTubeTranscriptApi.get_transcript(
                video_id, languages=["en"])
        except:
            return DEFAULT_ERRORS['NO_TRANSCRIPT_FOUND']
        self.transcript = transcript
        transcript_string = " "
        for line in transcript:
            transcript_string += line['text'].strip() + " "
        self.transcript_string = transcript_string
        return self.identify_sentences()

    def identify_sentences(self):
        transcript_string = self.transcript_string
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(transcript_string.lower())
        transcript_with_sentences = ""
        num_sentences = 0
        for sentence in doc.sents:
            transcript_with_sentences += sentence.text + ".\n "
            num_sentences += 1
        self.transcript_with_sentences = transcript_with_sentences
        return self.get_summary(num_sentences)

    def get_summary(self, num_sentences):
        transcript = self.transcript_with_sentences
        percent = self.percent
        summary_length = round(float(percent) * num_sentences)
        api_url = ("%s&SM_API_KEY=%s&SM_LENGTH=%s"
                   % (SMMRY_API_URL, SMMRY_API_KEY, summary_length))
        response = requests.post(api_url, data={"sm_api.input": transcript})
        api_content = response.json()["sm_api_content"]
        if not api_content:
            return DEFAULT_ERRORS['NO_TRANSCRIPT_FOUND']
        return {
            "result": api_content,
            "all": self.transcript_with_sentences,
            "youtube": self.transcript,
            "sentences": num_sentences
        }


@app.route("/")
def summarize():
    video_id = request.args.get("video_id")
    percent_to_summarize = request.args.get("percent")
    summarizer = YoutubeSummarizer(video_id, percent_to_summarize)
    summarized_content = summarizer.summarize()
    return summarized_content


if __name__ == "__main__":
    app.run(host='0.0.0.0')
