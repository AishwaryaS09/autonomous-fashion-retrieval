"""
Metadata-aware re-ranking engine for cross-modal fashion retrieval.

Combines embedding similarity with per-field attribute matching derived
from the query text (or explicit parameters) and each product's metadata.

Hard filters (products not matching are EXCLUDED):
  category, gender  (when explicitly mentioned by user)

Soft matches (boost scoring but never exclude):
  color, pattern, material, style, occasion, season

Two-stage retrieval strategy is implemented here via ``rerank``:
  1. Callers pass *more* candidates than the final ``top_k``.
  2. This engine scores every candidate, applies hard filters, then slices to ``top_k``.
"""
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Normalised keyword maps ──────────────────────────────────────────────

CATEGORY_ALIASES: dict[str, list[str]] = {
    "dresses":  ["dress", "gown", "sundress", "frock"],
    "shirts":   ["shirt", "blouse", "top", "t-shirt", "tee", "tee-shirt", "polo"],
    "jackets":  ["jacket", "blazer", "coat", "bomber", "puffer", "overcoat"],
    "pants":    ["pant", "trouser", "trousers", "jeans", "chino", "chinos",
                 "leggings", "cargo", "shorts"],
    "shoes":    ["shoe", "sneaker", "sneakers", "boot", "boots", "loafer",
                 "loafers", "sandal", "sandals", "heel", "heels",
                 "stiletto", "stilettos", "flip-flop", "slipper",
                 "slippers", "oxford", "oxfords"],
    "bags":     ["bag", "handbag", "purse", "tote", "totes", "backpack",
                 "clutch", "satchel", "crossbody"],
}

_SYNONYM_TO_CATEGORY: dict[str, str] = {}
for _cat, _syns in CATEGORY_ALIASES.items():
    for _s in _syns:
        _SYNONYM_TO_CATEGORY[_s] = _cat

COLOR_KEYWORDS: set[str] = {
    "red", "blue", "green", "yellow", "black", "white", "pink", "orange",
    "purple", "brown", "grey", "gray", "navy", "beige", "gold", "silver",
    "teal", "cyan", "magenta", "maroon", "olive", "coral", "ivory", "tan",
    "lavender", "mint", "peach", "salmon", "burgundy", "turquoise",
    "light blue", "dark blue", "royal blue", "hot pink", "dark green",
    "dark gray", "light gray", "nude", "camel", "khaki", "rust",
}

PATTERN_KEYWORDS: set[str] = {
    "floral", "striped", "plaid", "checkered", "check", "polka dot",
    "solid", "printed", "geometric", "abstract", "animal print", "camo",
    "leopard", "zebra", "tie-dye", "paisley", "herringbone", "tartan",
    "quilted", "lace", "denim", "eyelet", "ribbed", "pleated",
    "sequined", "smocked", "embroidered", "color block", "woven",
    "metallic",
}

STYLE_KEYWORDS: set[str] = {
    "casual", "formal", "elegant", "sporty", "athleisure", "bohemian",
    "boho", "professional", "preppy", "streetwear", "edgy", "glamorous",
    "vintage", "retro", "classic", "minimalist", "romantic", "gothic",
    "punk", "hippie", "smart casual", "smart", "rustic", "utilitarian",
    "military", "nautical", "western",
}

MATERIAL_KEYWORDS: set[str] = {
    "cotton", "polyester", "leather", "faux leather", "denim", "silk",
    "wool", "linen", "nylon", "chiffon", "suede", "velvet", "canvas",
    "spandex", "modal", "tweed", "corduroy", "flannel", "cashmere",
    "satin", "organza", "tulle", "crepe", "lycra", "neoprene",
    "patent leather", "cotton pique", "polyester blend", "wool blend",
    "spandex blend", "rubber", "mesh", "straw", "rattan", "felt",
    "knit",
}

OCCASION_KEYWORDS: set[str] = {
    "everyday", "casual", "work", "formal", "evening", "wedding",
    "party", "summer", "winter", "spring", "fall", "outdoor",
    "activewear", "gym", "beach", "travel", "date", "cocktail",
    "smart casual", "business", "lounge",
}

SEASON_KEYWORDS: set[str] = {
    "spring", "summer", "autumn", "fall", "winter", "all",
}

GENDER_SYNONYMS: dict[str, list[str]] = {
    "women":  ["woman", "women", "female", "ladies", "lady", "feminine",
               "girls", "girl"],
    "men":    ["man", "men", "male", "gentlemen", "gentleman", "masculine",
               "boys", "boy"],
    "unisex": ["unisex", "neutral", "gender-neutral"],
}

_GENDER_LOOKUP: dict[str, str] = {}
for _g, _syns in GENDER_SYNONYMS.items():
    for _s in _syns:
        _GENDER_LOOKUP[_s] = _g


# ── Query attribute extraction ───────────────────────────────────────────

def _extract_category(text: str) -> Optional[str]:
    words = re.findall(r"\w+", text.lower())
    for w in words:
        if w in _SYNONYM_TO_CATEGORY:
            return _SYNONYM_TO_CATEGORY[w]
    text_lower = text.lower()
    for syns in CATEGORY_ALIASES:
        if syns.rstrip("s") in text_lower:
            return syns
    return None


def _extract_colors(text: str) -> set[str]:
    words = text.lower().split()
    found: set[str] = set()
    for ck in COLOR_KEYWORDS:
        if " " in ck and ck in text.lower():
            found.add(ck)
    for w in words:
        if w in COLOR_KEYWORDS:
            found.add(w)
    return found


def _extract_patterns(text: str) -> set[str]:
    text_lower = text.lower()
    return {p for p in PATTERN_KEYWORDS if p in text_lower}


def _extract_styles(text: str) -> set[str]:
    text_lower = text.lower()
    return {s for s in STYLE_KEYWORDS if s in text_lower}


def _extract_materials(text: str) -> set[str]:
    text_lower = text.lower()
    return {m for m in MATERIAL_KEYWORDS if m in text_lower}


def _extract_occasions(text: str) -> set[str]:
    text_lower = text.lower()
    return {o for o in OCCASION_KEYWORDS if o in text_lower}


def _extract_seasons(text: str) -> set[str]:
    text_lower = text.lower()
    return {s for s in SEASON_KEYWORDS if s in text_lower}


def _extract_gender(text: str) -> Optional[str]:
    words = re.findall(r"\w+", text.lower())
    for w in words:
        if w in _GENDER_LOOKUP:
            return _GENDER_LOOKUP[w]
    return None


def _text_tokens(text: str) -> set[str]:
    return set(re.findall(r"\w+", text.lower()))


# ── Score helpers ─────────────────────────────────────────────────────────

def _match_field(query_value: str, product_value: str) -> float:
    if not query_value or not product_value:
        return 0.0
    q = query_value.lower().strip()
    p = product_value.lower().strip()
    if q == p:
        return 1.0
    if q in p or p in q:
        return 0.75
    return 0.0


def _match_set(query_set: set[str], product_value: str) -> float:
    if not query_set or not product_value:
        return 0.0
    p = product_value.lower().strip()
    if p in query_set:
        return 1.0
    for q in query_set:
        if q in p or p in q:
            return 0.75
    return 0.0


# ── Re-ranking engine ────────────────────────────────────────────────────

W_EMBEDDING   = 0.50
W_CATEGORY    = 0.15
W_COLOR       = 0.08
W_PATTERN     = 0.04
W_STYLE       = 0.06
W_MATERIAL    = 0.05
W_OCCASION    = 0.04
W_SEASON      = 0.02
W_GENDER      = 0.03
W_KEYWORD     = 0.00

_CATEGORY_FILTER_BONUS = 0.12


class ReRankingEngine:
    """Metadata-aware re-ranking for fashion retrieval results.

    Hard filters (exclude products not matching):
      - category: when user mentions a specific category

    Soft matches (boost scoring but never exclude):
      - gender, color, pattern, material, style, occasion, season
    """

    def rerank(
        self,
        results: list[dict],
        query_text: Optional[str] = None,
        query_category: Optional[str] = None,
        top_k: int = 10,
    ) -> list[dict]:
        if not results:
            return []

        # ── Infer attributes from query text ──────────────────────────
        q_colors:   set[str]       = set()
        q_patterns: set[str]       = set()
        q_styles:   set[str]       = set()
        q_materials: set[str]      = set()
        q_occasions: set[str]      = set()
        q_seasons:  set[str]       = set()
        q_gender:   Optional[str]  = None
        q_category: Optional[str]  = query_category
        q_words:    set[str]       = set()

        if query_text:
            q_words     = _text_tokens(query_text)
            q_colors    = _extract_colors(query_text)
            q_patterns  = _extract_patterns(query_text)
            q_styles    = _extract_styles(query_text)
            q_materials = _extract_materials(query_text)
            q_occasions = _extract_occasions(query_text)
            q_seasons   = _extract_seasons(query_text)
            q_gender    = _extract_gender(query_text)
            if q_category is None:
                q_category = _extract_category(query_text)

        has_text_signals = bool(q_colors or q_patterns or q_styles
                                or q_materials or q_occasions or q_gender
                                or q_category or q_seasons)

        # ── Score each candidate ──────────────────────────────────────
        for result in results:
            embedding_score = result.get("similarity_score", 0.0)
            breakdown: dict[str, float] = {}

            # Category
            cat_score = 0.0
            if q_category:
                rc = result.get("category", "").lower()
                if rc == q_category.lower():
                    cat_score = 1.0
                elif rc.rstrip("s") == q_category.lower().rstrip("s"):
                    cat_score = 0.8
                elif q_category.lower() in rc or rc in q_category.lower():
                    cat_score = 0.6
            breakdown["category"] = cat_score

            # Soft-match attribute scores
            col_score = _match_set(q_colors, result.get("color", "") or result.get("primary_color", ""))
            pat_score = _match_set(q_patterns, result.get("pattern", ""))
            mat_score = _match_set(q_materials, result.get("material", ""))
            sty_score = _match_set(q_styles, result.get("style", ""))
            occ_score = _match_set(q_occasions, result.get("occasion", ""))
            sea_score = _match_set(q_seasons, result.get("season", ""))
            gnd_score = _match_field(q_gender, result.get("gender", ""))

            breakdown["color"]    = col_score
            breakdown["pattern"]  = pat_score
            breakdown["material"] = mat_score
            breakdown["style"]    = sty_score
            breakdown["occasion"] = occ_score
            breakdown["season"]   = sea_score
            breakdown["gender"]   = gnd_score

            # Keyword overlap
            kw_bonus = 0.0
            if q_words:
                name_words = set(re.findall(r"\w+", result.get("name", "").lower()))
                overlap = len(q_words & name_words)
                kw_bonus = min(overlap / max(len(q_words), 1), 1.0)
            breakdown["keyword"] = kw_bonus

            # Category filter bonus from explicit UI dropdown
            filter_bonus = 0.0
            if query_category:
                rc = result.get("category", "").lower()
                if rc == query_category.lower():
                    filter_bonus = _CATEGORY_FILTER_BONUS
            breakdown["filter_bonus"] = filter_bonus

            # ── Adaptive weighting ────────────────────────────────────
            if has_text_signals:
                w_emb = W_EMBEDDING
                w_cat = W_CATEGORY
            else:
                w_emb = 1.0
                w_cat = 0.0

            attr_total = (
                W_COLOR    * col_score
                + W_PATTERN  * pat_score
                + W_STYLE    * sty_score
                + W_MATERIAL * mat_score
                + W_OCCASION * occ_score
                + W_SEASON   * sea_score
                + W_GENDER   * gnd_score
            )

            final_score = (
                w_emb * embedding_score
                + w_cat * cat_score
                + attr_total
                + filter_bonus
                + W_KEYWORD * kw_bonus
            )

            final_score = max(0.0, min(final_score, 1.0))
            result["reranking_score"] = round(final_score, 4)
            result["_score_breakdown"] = breakdown

        # ── Sort by reranking score ───────────────────────────────────
        results.sort(key=lambda x: x.get("reranking_score", 0), reverse=True)

        # ── Apply hard filters ────────────────────────────────────────
        # Category hard filter (from explicit param or inferred from text)
        filter_cat = query_category or q_category
        if filter_cat:
            results = [
                r for r in results
                if r.get("category", "").lower() == filter_cat.lower()
            ]

        return results[:top_k]


def compute_candidate_count(top_k: int, catalog_size: int) -> int:
    return min(max(top_k * 4, 20), catalog_size)
