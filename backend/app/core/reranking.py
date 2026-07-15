"""
Re-ranking engine for improving search results with attribute matching.
"""
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

COLOR_KEYWORDS = {
    "red", "blue", "green", "yellow", "black", "white", "pink", "orange",
    "purple", "brown", "grey", "gray", "navy", "beige", "gold", "silver",
    "teal", "cyan", "magenta", "maroon", "olive", "coral", "ivory", "tan",
    "lavender", "mint", "peach", "salmon", "burgundy", "turquoise",
}

PATTERN_KEYWORDS = {
    "floral", "striped", "plaid", "checkered", "polka dot", "solid",
    "printed", "geometric", "abstract", "animal print", "camo", "denim",
    "leopard", "zebra", "tie-dye", "paisley", "herringbone", "tartan",
}


class ReRankingEngine:
    """Simple re-ranking engine combining embedding similarity with metadata attributes."""

    def __init__(
        self,
        embedding_weight: float = 0.70,
        category_weight: float = 0.15,
        attribute_weight: float = 0.10,
        keyword_weight: float = 0.05,
    ):
        self.embedding_weight = embedding_weight
        self.category_weight = category_weight
        self.attribute_weight = attribute_weight
        self.keyword_weight = keyword_weight

    def rerank(
        self,
        results: list[dict],
        query_text: Optional[str] = None,
        query_category: Optional[str] = None,
    ) -> list[dict]:
        """Re-rank search results based on multiple signals."""
        if not results:
            return results

        query_colors = set()
        query_patterns = set()
        query_words = set()

        # if query_text:
        #     query_text_lower = query_text.lower()
        #     query_words = set(re.findall(r"\w+", query_text_lower))
        #     query_colors = query_text_lower.split() & COLOR_KEYWORDS
        #     query_patterns = {p for p in PATTERN_KEYWORDS if p in query_text_lower}

        if query_text:
            query_text_lower = query_text.lower()
            query_words = set(re.findall(r"\w+", query_text_lower))
            query_colors = query_words & COLOR_KEYWORDS
            query_patterns = {pattern
                for pattern in PATTERN_KEYWORDS
                if pattern in query_text_lower}

        for result in results:
            embedding_score = result.get("similarity_score", 0.0)

            category_match = 0.0
            if query_category and result.get("category", "").lower() == query_category.lower():
                category_match = 1.0

            attribute_match = 0.0
            attr_count = 0
            if query_colors:
                result_color = result.get("color", "").lower()
                if result_color in query_colors:
                    attribute_match += 1.0
                attr_count += 1
            if query_patterns:
                result_pattern = result.get("pattern", "").lower()
                if any(p in result_pattern for p in query_patterns):
                    attribute_match += 1.0
                attr_count += 1
            if attr_count > 0:
                attribute_match /= attr_count

            keyword_overlap = 0.0
            if query_words:
                name_words = set(re.findall(r"\w+", result.get("name", "").lower()))
                overlap = len(query_words & name_words)
                keyword_overlap = min(overlap / max(len(query_words), 1), 1.0)

            final_score = (
                self.embedding_weight * embedding_score
                + self.category_weight * category_match
                + self.attribute_weight * attribute_match
                + self.keyword_weight * keyword_overlap
            )

            result["reranking_score"] = round(final_score, 4)

        results.sort(key=lambda x: x.get("reranking_score", 0), reverse=True)
        return results
