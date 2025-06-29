from utils.helper import estimate_cost
from client.clients import bart_client

def bart_summarizer(text, max_tokens=150, min_tokens=40):
    summary = bart_client(text, max_length=max_tokens, min_length=min_tokens, do_sample=False)
    return summary[0]['summary_text']

def summarize_text(original_text):
    summary = bart_summarizer(original_text)

    char_count_orig, cost_orig = estimate_cost(original_text)
    char_count_summary, cost_summary = estimate_cost(summary)
    return {"original_text":{"text":original_text,"char_count":char_count_orig,"cost":cost_orig},"summarized_text":{"text":summary,"char_count":char_count_summary,"cost":cost_summary}}
