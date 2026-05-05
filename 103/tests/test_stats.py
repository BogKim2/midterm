from smart_doc_analyzer.core.stats import compute_basic_stats


def test_compute_basic_stats_counts_units() -> None:
    stats, sentence_lengths = compute_basic_stats("One two.\n\nThree four.")
    assert stats.word_count == 4
    assert stats.sentence_count == 2
    assert stats.paragraph_count == 2
    assert sentence_lengths == [2, 2]
