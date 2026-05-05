from __future__ import annotations

from matplotlib.figure import Figure


def create_keyword_bar_chart(keywords: list[tuple[str, int]]) -> Figure:
    figure = Figure(figsize=(6, 4), tight_layout=True)
    ax = figure.add_subplot(111)
    if not keywords:
        ax.text(0.5, 0.5, "No keywords", ha="center", va="center")
        ax.axis("off")
        return figure
    labels = [label for label, _ in keywords][::-1]
    values = [value for _, value in keywords][::-1]
    ax.barh(labels, values, color="#2f6fed")
    ax.set_title("Top Keywords")
    return figure


def create_sentence_length_histogram(lengths: list[int]) -> Figure:
    figure = Figure(figsize=(6, 4), tight_layout=True)
    ax = figure.add_subplot(111)
    ax.hist(lengths or [0], bins=min(max(len(lengths or [0]), 1), 10), color="#f28f3b", edgecolor="white")
    ax.set_title("Sentence Length Distribution")
    ax.set_xlabel("Words per sentence")
    ax.set_ylabel("Frequency")
    return figure
